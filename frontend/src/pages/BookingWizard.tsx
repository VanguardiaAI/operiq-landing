import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Menu, User, HelpCircle, Globe, AlertCircle } from "lucide-react"

// Componentes para cada paso del wizard
import VehicleSelectionStep from "../components/booking/VehicleSelectionStep"
import PassengerDetailsStep from "../components/booking/PassengerDetailsStep"
import PaymentStep from "../components/booking/PaymentStep"
import PaymentConfirmationStep from "../components/booking/PaymentConfirmationStep"
// Los demás pasos se implementarán más adelante

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Definición de tipos
interface BookingSession {
  session_id: string
  booking_data: {
    tripType: 'ida' | 'horas'
    from: {
      place_id?: string
      description: string
    }
    to?: {
      place_id?: string
      description: string
    }
    duration?: string
    date: string
    time: string
    vehicle?: {
      id: string
      name: string
      price: number
    }
    passenger_details?: {
      booking_for: 'self' | 'other'
      flight_number?: string
      pickup_sign?: string
      notes?: string
      reference?: string
    }
    payment?: {
      method: string
      card_name: string
      card_last_four: string
      saved: boolean
      amount: number
      currency: string
    }
  }
  current_step: string
  next_step?: string
}

export default function BookingWizard() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  
  const [session, setSession] = useState<BookingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  
  console.log(`BookingWizard State: loading=${loading}, error=${error ? "true" : "false"}, sessionExists=${session ? "true" : "false"}`);

  // Cargar los datos de la sesión al montar el componente o cuando sessionId cambie
  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones en un componente desmontado
    
    const fetchSessionData = async () => {
      if (!sessionId) {
        if (isMounted) {
          console.error("BookingWizard: ID de sesión no válido o no proporcionado.");
          setError("ID de sesión no válido.")
          setLoading(false)
        }
        return
      }
      
      // Reiniciar estado antes de una nueva carga si sessionId cambia
      if (isMounted) {
        setLoading(true)
        setError(null) // Limpiar errores previos
        // setSession(null); // Opcional: limpiar sesión previa si sessionId cambia y quieres un loader completo
      }
      
      try {
        console.log(`BookingWizard: Iniciando carga de sesión para sessionId: ${sessionId}`)
        const response = await axios.get(`${API_URL}/booking/get-session/${sessionId}`)
        
        if (!isMounted) return; // Salir si el componente se desmontó

        if (!response.data) {
          console.error("BookingWizard: Respuesta vacía del servidor al cargar la sesión.")
          setError("No se pudo cargar la sesión (respuesta vacía).")
          setSession(null)
        } else if (!response.data.booking_data) {
          console.error("BookingWizard: Datos de sesión inválidos, falta 'booking_data'. Respuesta:", response.data)
          setError("Los datos de la sesión son incompletos.")
          // Guardamos la sesión principal pero marcamos error porque booking_data es esencial
          // Esto permite ver qué llegó en `session` si es necesario para depurar.
          setSession(response.data) 
        } else {
          console.log("BookingWizard: Sesión cargada exitosamente:", response.data)
          setSession(response.data)
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("BookingWizard: Error detallado al cargar la sesión:", err.response?.data || err.message || err)
        setError(err.response?.data?.error || "Error al cargar la información de la reserva. Por favor, intente recargar.")
        setSession(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchSessionData()
    
    return () => {
      isMounted = false; // Marcar como desmontado al limpiar el efecto
    }
  }, [sessionId]) // Depender solo de sessionId
  
  // Función para actualizar la sesión con los datos del paso actual
  const updateSession = async (stepData: any, nextStep?: string) => {
    if (!sessionId) {
      console.error("BookingWizard Update: No sessionId provided.");
      setError("Error crítico: Falta ID de sesión para actualizar.");
      return;
    }
    if (!session) {
      console.error("BookingWizard Update: No current session data to update.");
      setError("Error crítico: No hay datos de sesión base para actualizar.");
      return;
    }

    setLoading(true);
    try {
      console.log("BookingWizard Update: Actualizando sesión. Datos del paso:", stepData, "Próximo paso:", nextStep);
      const currentBookingData = session.booking_data || {}; // Asegurar que booking_data exista
      const updatedBookingData = {
        ...currentBookingData,
        ...stepData
      };
      
      const payload = {
        booking_data: updatedBookingData,
        current_step: nextStep || session.current_step
      };
      console.log("BookingWizard Update: Enviando payload:", payload);
      
      const response = await axios.put(`${API_URL}/booking/update-session/${sessionId}`, payload);
      
      if (!response.data || !response.data.booking_data) {
        console.error("BookingWizard Update: Respuesta inválida o 'booking_data' faltante tras actualizar. Respuesta:", response.data);
        setError("Error al actualizar la sesión: datos de respuesta incompletos.");
        // Opcional: revertir o no cambiar la sesión local si la actualización falla de esta manera
        // setSession(session); // Revertir a la sesión anterior
        return; 
      }
      
      console.log("BookingWizard Update: Sesión actualizada en backend. Nueva sesión:", response.data);
      setSession(response.data);
      setError(null); // Limpiar error si la actualización fue exitosa
    } catch (err: any) {
      console.error("BookingWizard Update: Error detallado al actualizar la sesión:", err.response?.data || err.message || err);
      setError(err.response?.data?.error || "Error al guardar los datos de la reserva.");
      // Opcional: no cambiar la sesión local o revertir
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar el paso actual del wizard
  const renderCurrentStep = () => {
    console.log(`RenderCurrentStep: loading=${loading}, error=${error ? "true" : "false"}, sessionExists=${session ? "true" : "false"}, bookingDataExists=${session?.booking_data ? "true" : "false"}`);

    if (loading) {
      console.log("RenderCurrentStep: Mostrando Loader (loading=true)");
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando información de la reserva...</span>
        </div>
      );
    }
    
    if (error) {
      console.log("RenderCurrentStep: Mostrando Error:", error);
      return (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600">Error al cargar la sesión</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button 
              className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={() => {
                setLoading(true); // Para que se muestre el loader mientras se reintenta
                // Re-ejecutar fetchSessionData indirectamente cambiando la dependencia o llamando una función
                // La forma más simple es forzar un re-fetch cambiando el key del componente o recargando.
                // O, si la función de fetch es estable, podemos re-llamarla, pero useEffect lo hará si sessionId cambia.
                // Por ahora, un reload es lo más simple si el error es persistente en la carga inicial.
                window.location.reload(); 
              }}
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      );
    }
    
    // Esta condición es la que disparaba el error "No hay datos de sesión para renderizar el paso"
    if (!session || !session.booking_data) {
      console.error("RenderCurrentStep: No hay sesión o booking_data para renderizar. Sesión:", session);
      return (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-orange-600">Datos de la reserva no disponibles</h2>
            <p className="mt-2 text-gray-600">
              No se pudieron cargar completamente los detalles de la reserva. 
              Esto puede ser un problema temporal.
            </p>
            <button 
              className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Recargar Página
            </button>
          </CardContent>
        </Card>
      );
    }
    
    // Si llegamos aquí, session y session.booking_data existen
    console.log("RenderCurrentStep: Renderizando el paso:", session.current_step, "con sessionData:", session.booking_data);
    const sessionDataWithId = {
      ...session.booking_data,
      sessionId: sessionId, // Aseguramos que sessionId (de useParams) esté aquí
      session_id: session.session_id // Usamos session_id de la propia sesión si existe
    };
    
    switch (session.current_step) {
      case 'vehicle_selection':
        return (
          <VehicleSelectionStep 
            sessionData={sessionDataWithId} 
            onComplete={(data: BookingSession['booking_data']) => updateSession(data, 'passenger_details')} 
          />
        );
      case 'passenger_details':
        return (
          <PassengerDetailsStep 
            sessionData={sessionDataWithId} 
            onComplete={(data: BookingSession['booking_data']) => updateSession(data, 'payment')} 
          />
        );
      case 'payment':
        return (
          <PaymentStep 
            sessionData={sessionDataWithId} 
            onComplete={(data: BookingSession['booking_data']) => updateSession(data, 'payment_confirmation')} 
          />
        );
      case 'payment_confirmation':
        return <PaymentConfirmationStep sessionData={sessionDataWithId} />;
      default:
        console.error(`RenderCurrentStep: Paso desconocido: '${session.current_step}'.`);
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-600">Paso no reconocido</h2>
                <p className="mt-2 text-gray-600">El sistema encontró un paso inesperado: {session.current_step}</p>
            </div>
        );
    }
  };
  
  // Mostrar indicador de carga
  if (loading) {
    return (
      <>
        <NavHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando...</span>
        </div>
      </>
    )
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <>
        <NavHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <Card className="max-w-3xl mx-auto mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600">Error</h2>
              <p className="mt-2">{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => navigate('/')}
              >
                Volver al inicio
              </button>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }
  
  return (
    <>
      <NavHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Wizard header con los pasos */}
        {session && session.current_step && (
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-4xl">
                <div className="relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200"></div>
                  <div className="relative flex justify-between">
                    {['Tipo de coche', 'Info del viaje', 'Pago', 'Finalizar'].map((step, index) => {
                      const steps = ['vehicle_selection', 'passenger_details', 'payment', 'payment_confirmation'];
                      const currentIndex = steps.indexOf(session.current_step);
                      const isActive = index === currentIndex;
                      const isCompleted = index < currentIndex;
                      
                      return (
                        <div 
                          key={step} 
                          className={`flex flex-col items-center ${isActive ? 'text-black' : isCompleted ? 'text-black' : 'text-gray-400'}`}
                        >
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              isActive ? 'bg-black text-white' : 
                              isCompleted ? 'bg-black text-white' : 
                              'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <span className="mt-2 text-sm font-medium">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenido del paso actual */}
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </div>
    </>
  )
}

// Componente para la barra de navegación sencilla
function NavHeader({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="font-bold text-xl">OPERIQ</div>
        
        {/* Menú de hamburguesa */}
        <div className="relative">
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>
          
          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="py-1">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <User size={16} className="mr-2" />
                  Pablo
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <HelpCircle size={16} className="mr-2" />
                  Ayuda
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Globe size={16} className="mr-2" />
                  Español
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 