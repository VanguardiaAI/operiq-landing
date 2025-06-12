import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  Briefcase,
  Loader2,
  AlertCircle,
  Check
} from "lucide-react"
import axios from "axios"

// URL de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Tipos
interface Vehicle {
  id: string
  name: string
  description: string
  capacity: number
  luggage: number
  price: number
  image: string
}

interface BookingData {
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
}

interface VehicleSelectionStepProps {
  sessionData: any
  onComplete: (data: any) => Promise<void>
}

export default function VehicleSelectionStep({ sessionData, onComplete }: VehicleSelectionStepProps) {
  // Verificar que sessionData no sea undefined o null
  if (!sessionData) {
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

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(
    sessionData.vehicle?.id || null
  )
  
  //gar las opciones de vehículos al montar el componente
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_URL}/booking/vehicle-options`)
        setVehicles(response.data)
      } catch (error) {
        console.error("Error al cargar opciones de vehículos:", error)
        setError("No se pudieron cargar las opciones de vehículos")
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [])
  
  // Manejar la selección de un vehículo
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
  }
  
  // Manejar el botón de continuar
  const handleContinue = () => {
    if (!selectedVehicle) return
    
    const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)
    if (!selectedVehicleData) return
    
    // Actualizar los datos de la sesión con el vehículo seleccionado
    const updatedData: BookingData = {
      ...sessionData,
      vehicle: {
        id: selectedVehicleData.id,
        name: selectedVehicleData.name,
        price: selectedVehicleData.price
      }
    }
    
    // Llamar a la función de completar con los datos actualizados
    onComplete(updatedData)
  }
  
  // Mientras se cargan los datos
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
        <span className="ml-2 text-lg">gando opciones de vehículos...</span>
      </div>
    )
  }
  
  // Si hay un error
  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-600">Error</h3>
        <p className="mt-2">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    )
  }
  
  // Mostrar opciones de vehículos
  return (
    <Card className="max-w-3xl mx-auto shadow-sm">
      <CardContent className="p-0">
        {/* Detalles del viaje */}
        <div className="bg-gray-50 p-4 rounded-t-lg border-b">
          <div className="mb-1">
            <p className="text-sm font-medium">sáb, may 10, 2025 a las 10:32 a. m. (CEST)</p>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-sm text-gray-600">{sessionData.from.description}</p>
            {sessionData.tripType === 'ida' && sessionData.to && (
              <>
                <span className="text-xs">→</span>
                <p className="text-sm text-gray-600">{sessionData.to.description}</p>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            <p>Hora aproximada de llegada a las 11:07 AM (GMT+2) • 39.8 km</p>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6">Selecciona tu vehículo</h2>
          
          {/* Lista de vehículos */}
          <div className="space-y-4 mb-6">
            {vehicles.map((vehicle) => (
              <div 
                key={vehicle.id}
                className={`cursor-pointer transition-all border rounded-md hover:border-gray-400 ${
                  selectedVehicle === vehicle.id ? 'border-gray-700 ring-1 ring-gray-700' : 'border-gray-200'
                }`}
                onClick={() => handleVehicleSelect(vehicle.id)}
              >
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 items-center">
                  {/* Imagen del vehículo */}
                  <div className="flex justify-center">
                    <img 
                      src={vehicle.image || '/images/cars/default.png'} 
                      alt={vehicle.name}
                      className="h-24 object-contain" 
                    />
                  </div>
                  
                  {/* Detalles del vehículo */}
                  <div className="col-span-1 md:col-span-1">
                    <h3 className="font-bold">{vehicle.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{vehicle.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{vehicle.capacity}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{vehicle.luggage}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Precio y selección */}
                  <div className="flex flex-col items-end justify-center mt-3 md:mt-0">
                    <div className="text-xl font-bold">
                      {vehicle.price.toFixed(2)} €
                    </div>
                    
                    {selectedVehicle === vehicle.id && (
                      <div className="mt-2 flex items-center text-sm text-gray-700 font-medium">
                        <Check className="h-4 w-4 mr-1" />
                        Seleccionado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Información adicional */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h4 className="font-medium mb-2">Todas las clases incluyen:</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-gray-700 mr-2 mt-0.5" />
                <span>Cancelación gratuita hasta 1 hora antes de la recogida</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-gray-700 mr-2 mt-0.5" />
                <span>Gratis 60 minutos de tiempo de espera</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-gray-700 mr-2 mt-0.5" />
                <span>Conocer y saludar</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-gray-700 mr-2 mt-0.5" />
                <span>Botella de agua de cortesía</span>
              </li>
            </ul>
          </div>
          
          {/* Botón continuar */}
          <button 
            className="w-full py-3 px-4 rounded-md text-white font-semibold relative z-20"
            style={{
                              background: "#000000"}}
            disabled={!selectedVehicle}
            onClick={handleContinue}
          >
            {!selectedVehicle ? "Selecciona un vehículo" : "Continuar"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
} 