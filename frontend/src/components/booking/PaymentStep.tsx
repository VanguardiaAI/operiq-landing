import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react"
import axios from "axios"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import CheckoutForm from "../stripe/CheckoutForm"

// Obtener variables de entorno de manera segura
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Log para diagnóstico - solo se imprime en desarrollo
if (import.meta.env.DEV) {
  console.log('Variables de entorno en PaymentStep:', {
    API_URL,
    // Imprime solo una parte de la clave para evitar exponerla completamente
    STRIPE_KEY: STRIPE_PUBLISHABLE_KEY ? 
      `${STRIPE_PUBLISHABLE_KEY.substring(0, 10)}...${STRIPE_PUBLISHABLE_KEY.substring(STRIPE_PUBLISHABLE_KEY.length - 4)}` : 
      'no definida'
  });
}

// Cargar Stripe fuera del componente para evitar múltiples instancias
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

// Si no hay clave de Stripe, registrar un error
if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('ERROR: La clave publicable de Stripe no está definida. Verifica el archivo .env y reinicia el servidor.');
}

interface PaymentStepProps {
  sessionData: any
  onComplete: (data: any) => Promise<void>
}

export default function PaymentStep({ sessionData, onComplete }: PaymentStepProps) {
  // Estado para inicialización segura
  const [initializedData, setInitializedData] = useState<any>(null)
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null)
  const [calculatingPrice, setCalculatingPrice] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState("")
  const [distance, setDistance] = useState("")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [stripeError, setStripeError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [missingVehicleData, setMissingVehicleData] = useState(false)
  const [stripeKey, setStripeKey] = useState(0) // Para forzar re-montaje de Elements

  // Crear intención de pago en Stripe
  const createPaymentIntent = async (amount: number) => {
    try {
      console.log("Creando intención de pago con monto:", amount);
      
      if (!initializedData || !(initializedData.sessionId || initializedData.session_id)) {
        console.error("No hay session_id para crear la intención de pago");
        setClientSecret(null);
        setStripeError("No se pudo inicializar el pago: falta ID de sesión");
        return;
      }
      
      console.log("Session ID:", initializedData.sessionId || initializedData.session_id);
      
      const response = await axios.post(`${API_URL}/payment/create-intent`, {
        amount: amount,
        currency: "eur",
        session_id: initializedData.sessionId || initializedData.session_id
      })
      
      console.log("Respuesta de create-intent:", response.data);
      
      if (response.data.clientSecret !== clientSecret) {
        setClientSecret(response.data.clientSecret)
        setPaymentIntentId(response.data.id)
        setStripeKey(prevKey => prevKey + 1) // Forzar remontaje de Elements
      }
    } catch (error) {
      console.error("Error al crear la intención de pago:", error)
      setClientSecret(null)
      setStripeError("No se pudo inicializar el pago con Stripe")
    }
  }

  // Función para recuperar información del vehículo si falta
  const fetchVehicleData = async (vehicleId: string) => {
    try {
      // Llamar al API para obtener los detalles del vehículo
      const response = await axios.get(`${API_URL}/vehicles/details/${vehicleId}`);
      
      // Actualizar los datos de la sesión con la información del vehículo
      if (response.data && initializedData) {
        const updatedData = {
          ...initializedData,
          vehicle: {
            id: vehicleId,
            name: response.data.name,
            price: response.data.price || 65.00
          }
        };
        
        console.log("Datos de vehículo recuperados:", updatedData.vehicle);
        setInitializedData(updatedData);
        setMissingVehicleData(false);
        return updatedData;
      }
    } catch (error) {
      console.error("Error al recuperar datos del vehículo:", error);
      // Usar datos de respaldo para el vehículo
      if (initializedData) {
        const updatedData = {
          ...initializedData,
          vehicle: {
            id: vehicleId,
            name: "Vehículo Standard",
            price: 65.00
          }
        };
        
        console.log("Usando datos de vehículo por defecto:", updatedData.vehicle);
        setInitializedData(updatedData);
        setMissingVehicleData(false);
        return updatedData;
      }
    }
    
    return null;
  }

  // Inicializar datos de forma segura
  useEffect(() => {
    if (sessionData) {
      console.log("PaymentStep recibió sessionData:", sessionData);
      setInitializedData(sessionData);
    } else {
      console.error("PaymentStep: sessionData es undefined o null");
    }
  }, [sessionData]);
  
  // Calcular el precio total basado en los detalles de la reserva
  useEffect(() => {
    // Si no hay datos inicializados, no hacemos nada
    if (!initializedData) {
      setIsLoading(false);
      return;
    }
    
    const calculateTotalPrice = async () => {
      // Verificar si tenemos datos del vehículo
      if (!initializedData.vehicle?.id) {
        console.error("No hay ID de vehículo");
        
        // Si hay un ID de vehículo en alguna otra parte de los datos
        if (initializedData.vehicleId) {
          console.log("Intentando recuperar datos del vehículo usando vehicleId:", initializedData.vehicleId);
          const updatedData = await fetchVehicleData(initializedData.vehicleId);
          if (updatedData) {
            // La función fetchVehicleData ya actualizó el estado, por lo que podemos salir
            // Los cálculos se harán en la próxima ejecución de este efecto
            return;
          }
        }
        
        // Si no podemos recuperar los datos, mostrar un mensaje de error
        setMissingVehicleData(true);
        setIsLoading(false);
        return;
      }
      
      setCalculatingPrice(true);
      setIsLoading(true);
      
      try {
        // Preparar los datos para el cálculo del precio
        const priceData = {
          vehicle_id: initializedData.vehicle.id,
          trip_type: initializedData.tripType,
          from_place_id: initializedData.from?.place_id,
          to_place_id: initializedData.to?.place_id,
          duration: initializedData.duration,
          pickup_date: initializedData.date,
          pickup_time: initializedData.time
        }
        
        // Llamar al endpoint para calcular el precio
        const response = await axios.post(`${API_URL}/booking/calculate-price`, priceData)
        
        // Actualizar el estado con los datos de precio
        setPriceBreakdown(response.data.price_breakdown)
        
        // Extraer información adicional si está disponible
        if (response.data.price_breakdown) {
          const breakdown = response.data.price_breakdown
          
          // Establecer distancia si está disponible
          if (breakdown.estimated_distance_km) {
            setDistance(breakdown.estimated_distance_km.toString())
          }
          
          // Calcular tiempo estimado de llegada
          if (breakdown.estimated_duration_hours && initializedData.time) {
            const durationMinutes = Math.round(breakdown.estimated_duration_hours * 60)
            
            // Extraer la hora del viaje desde initializedData.time
            const timeStr = initializedData.time
            let hours = 0
            let minutes = 0
            
            // Parsear la hora (formato esperado "HH : MM")
            const timeParts = timeStr.split(':')
            if (timeParts.length === 2) {
              hours = parseInt(timeParts[0].trim())
              minutes = parseInt(timeParts[1].trim())
            }
            
            // Crear fecha base y añadir duración estimada
            const now = new Date()
            now.setHours(hours)
            now.setMinutes(minutes)
            const arrivalTime = new Date(now.getTime() + durationMinutes * 60000)
            
            setEstimatedArrival(
              arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            )
          }
          
          // Crear una intención de pago en Stripe
          await createPaymentIntent(breakdown.total)
        }
      } catch (error) {
        console.error("Error al calcular el precio:", error)
        // Usar el precio del vehículo como respaldo
        const backupPrice = initializedData.vehicle?.price || 65.00
        setPriceBreakdown({
          total: backupPrice,
          currency: "EUR",
          tax: backupPrice * 0.21,
          tax_rate: 21
        })
        
        // Crear intención de pago con el precio de respaldo
        await createPaymentIntent(backupPrice)
      } finally {
        setCalculatingPrice(false)
        setIsLoading(false)
      }
    }
    
    calculateTotalPrice()
  }, [initializedData])
  
  // Componente Elements de Stripe
  const renderStripeElements = () => {
    if (!STRIPE_PUBLISHABLE_KEY) {
      return (
        <div className="bg-gray-100 p-6 rounded-md text-center">
          <AlertCircle className="h-10 w-10 text-black mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Error de configuración</h3>
          <p className="text-gray-600 mb-4">No se ha configurado correctamente la clave de Stripe. Por favor, contacte al soporte técnico.</p>
        </div>
      );
    }
    
    if (clientSecret && stripePromise) {
      return (
        <Elements 
          key={stripeKey}
          stripe={stripePromise} 
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#000000',
              }
            }
          }}
        >
          <CheckoutForm 
            sessionData={{
              ...initializedData, 
              payment: { 
                ...initializedData?.payment, 
                amount: priceBreakdown?.total,
                currency: priceBreakdown?.currency 
              }
            }}
            paymentIntentId={paymentIntentId}
            onPaymentSuccess={(paymentResult: any) => {
              console.log("PaymentStep: Payment successful!", paymentResult);
              // Asumir que paymentResult contiene stripe_payment_intent_id
              const stripePaymentIntentId = paymentResult.paymentIntent?.id || paymentIntentId;

              if (!stripePaymentIntentId) {
                console.error("PaymentStep: No se pudo obtener stripe_payment_intent_id después del pago.");
                setStripeError("Error al confirmar el pago. No se encontró el ID de la transacción de Stripe.");
                // Podrías querer manejar este caso de forma más robusta, quizás no llamar a onComplete.
                return;
              }
              
              const finalData = { 
                ...initializedData, 
                payment: { 
                  ...initializedData?.payment, 
                  amount: priceBreakdown?.total,
                  currency: priceBreakdown?.currency,
                  method: 'card', // Asumir que es tarjeta por ahora
                  status: paymentResult.paymentIntent?.status || 'succeeded',
                  stripe_payment_intent_id: stripePaymentIntentId,
                  // card_last_four: // Esto vendría de paymentResult si está disponible
                },
                stripe_payment_intent_id: stripePaymentIntentId // Añadirlo también aquí para confirm_booking
              };
              console.log("PaymentStep: Llamando a onComplete con:", finalData);
              onComplete(finalData);
            }}
          />
        </Elements>
      );
    }
    
    if (isLoading || calculatingPrice) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Preparando opciones de pago...</span>
        </div>
      )
    }
    
    if (stripeError) {
      return (
        <div className="bg-gray-100 p-6 rounded-md text-center">
          <AlertCircle className="h-10 w-10 text-black mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Error al inicializar el pago</h3>
          <p className="text-gray-600 mb-4">{stripeError}</p>
          <button 
            onClick={() => createPaymentIntent(priceBreakdown?.total || (initializedData?.vehicle?.price || 65.00))}
            className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Preparando opciones de pago...</span>
      </div>
    )
  }
  
  // Si no hay datos cargados aún, mostrar mensaje de error
  if (isLoading && !initializedData) {
    return (
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mr-4" />
          <p className="text-gray-600">Cargando datos de la sesión...</p>
        </CardContent>
      </Card>
    )
  }
  
  // Si aún no hay datos inicializados después de cargar, mostrar error
  if (!initializedData && !isLoading) {
    return (
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-10 w-10 text-black mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Error de datos</h3>
          <p className="text-gray-600 mb-4">No se han podido cargar los datos de la sesión</p>
        </CardContent>
      </Card>
    )
  }

  // Si faltan datos del vehículo, mostrar error específico
  if (missingVehicleData) {
    return (
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-10 w-10 text-black mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Datos de vehículo incompletos</h3>
          <p className="text-gray-600 mb-4">No se ha seleccionado un vehículo válido. Por favor, vuelva al paso anterior.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Volver atrás
          </button>
        </CardContent>
      </Card>
    )
  }
  
  // Obtener los datos del itinerario
  const originName = initializedData?.from?.description || "Punto de recogida"
  const destinationName = initializedData?.to?.description || "Destino"
  const tripDate = initializedData?.date || ""
  const tripTime = initializedData?.time || ""
  
  // Calcular precio total
  const totalPrice = priceBreakdown?.total || (initializedData?.vehicle?.price || 65.00)
  
  return (
    <Card className="max-w-3xl mx-auto shadow-sm">
      <CardContent className="p-0">
        {/* Resumen de la reserva */}
        <div className="bg-gray-50 p-4 rounded-t-lg border-b">
          <div className="mb-1">
            <p className="text-sm font-medium">{tripDate} a las {tripTime} (CEST)</p>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-sm text-gray-600">{originName}</p>
            {initializedData.tripType === 'ida' && (
              <>
                <span className="text-xs">→</span>
                <p className="text-sm text-gray-600">{destinationName}</p>
              </>
            )}
            {initializedData.tripType === 'horas' && (
              <p className="text-sm text-gray-600 ml-2">({initializedData?.duration || "2 horas"})</p>
            )}
          </div>
          {initializedData.tripType === 'ida' && estimatedArrival && (
          <div className="text-xs text-gray-500">
              <p>Hora aproximada de llegada a las {estimatedArrival} (GMT+2) • {distance} km</p>
          </div>
          )}
        </div>

        <div className="p-6">
          {renderStripeElements()}
          
          {priceBreakdown && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="font-semibold mb-3">Desglose del precio</h3>
              <div className="space-y-2">
                {priceBreakdown.base_fare > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Tarifa base</span>
                    <span className="text-sm">{priceBreakdown.base_fare.toFixed(2)} €</span>
                  </div>
                )}
                {priceBreakdown.distance_charge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Cargo por distancia</span>
                    <span className="text-sm">{priceBreakdown.distance_charge.toFixed(2)} €</span>
              </div>
                )}
                {priceBreakdown.time_charge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Cargo por tiempo</span>
                    <span className="text-sm">{priceBreakdown.time_charge.toFixed(2)} €</span>
              </div>
                )}
                {priceBreakdown.extras > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Extras</span>
                    <span className="text-sm">{priceBreakdown.extras.toFixed(2)} €</span>
            </div>
                )}
                {priceBreakdown.surcharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Recargo ({priceBreakdown.surcharge_reason})</span>
                    <span className="text-sm">{priceBreakdown.surcharges.toFixed(2)} €</span>
              </div>
                )}
                {priceBreakdown.tax > 0 && (
              <div className="flex justify-between">
                    <span className="text-sm">IVA ({priceBreakdown.tax_rate}%)</span>
                    <span className="text-sm">{priceBreakdown.tax.toFixed(2)} €</span>
                    </div>
                  )}
              </div>
            </div>
          )}
          </div>
      </CardContent>
    </Card>
  )
} 