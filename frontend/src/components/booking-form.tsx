"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, Clock, MapPin, ChevronDown, Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { useNavigate } from "react-router-dom"

// Definición de tipos
interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface BookingFormData {
  tripType: 'ida' | 'horas'
  from: {
    place_id?: string
    description: string
    address?: string
  }
  to?: {
    place_id?: string
    description: string
    address?: string
  }
  duration?: string
  date: string
  time: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function BookingForm() {
  const navigate = useNavigate()
  const [date, setDate] = useState("vie, 09 may 2025")
  const [time, setTime] = useState("12 : 50")
  const [duration, setDuration] = useState("2 horas")
  
  // Estados para predicciones de lugares
  const [fromQuery, setFromQuery] = useState("")
  const [toQuery, setToQuery] = useState("")
  const [fromPredictions, setFromPredictions] = useState<PlacePrediction[]>([])
  const [toPredictions, setToPredictions] = useState<PlacePrediction[]>([])
  const [showFromPredictions, setShowFromPredictions] = useState(false)
  const [showToPredictions, setShowToPredictions] = useState(false)
  const [selectedFrom, setSelectedFrom] = useState<PlacePrediction | null>(null)
  const [selectedTo, setSelectedTo] = useState<PlacePrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'ida' | 'horas'>('ida')
  
  // Referencias para los dropdowns
  const fromDropdownRef = useRef<HTMLDivElement>(null)
  const toDropdownRef = useRef<HTMLDivElement>(null)
  
  // Manejador para búsqueda de lugares "desde"
  const handleFromSearch = async (query: string) => {
    setFromQuery(query)
    setSelectedFrom(null)
    
    if (query.length < 3) {
      setFromPredictions([])
      return
    }
    
    try {
      const response = await axios.get(`${API_URL}/places/autocomplete`, {
        params: { query }
      })
      setFromPredictions(response.data)
      setShowFromPredictions(true)
    } catch (error) {
      console.error("Error al obtener predicciones:", error)
      setFromPredictions([])
    }
  }
  
  // Manejador para búsqueda de lugares "hacia"
  const handleToSearch = async (query: string) => {
    setToQuery(query)
    setSelectedTo(null)
    
    if (query.length < 3) {
      setToPredictions([])
      return
    }
    
    try {
      const response = await axios.get(`${API_URL}/places/autocomplete`, {
        params: { query }
      })
      setToPredictions(response.data)
      setShowToPredictions(true)
    } catch (error) {
      console.error("Error al obtener predicciones:", error)
      setToPredictions([])
    }
  }
  
  // Manejador para seleccionar un lugar "desde"
  const handleSelectFrom = (prediction: PlacePrediction) => {
    setSelectedFrom(prediction)
    setFromQuery(prediction.description)
    setShowFromPredictions(false)
  }
  
  // Manejador para seleccionar un lugar "hacia"
  const handleSelectTo = (prediction: PlacePrediction) => {
    setSelectedTo(prediction)
    setToQuery(prediction.description)
    setShowToPredictions(false)
  }
  
  // Manejador para el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Construir los datos de la reserva según el tipo de viaje
      const bookingData: BookingFormData = {
        tripType: activeTab,
        from: {
          place_id: selectedFrom?.place_id,
          description: fromQuery
        },
        date,
        time
      }
      
      if (activeTab === 'ida') {
        bookingData.to = {
          place_id: selectedTo?.place_id,
          description: toQuery
        }
      } else {
        bookingData.duration = duration
      }
      
      // Crear una sesión de reserva en el backend
      const response = await axios.post(`${API_URL}/booking/create-session`, bookingData)
      
      // Redirigir al usuario al proceso de wizard con el session_id
      navigate(`/reserva/${response.data.session_id}`)
    } catch (error) {
      console.error("Error al crear la sesión de reserva:", error)
      alert("Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }
  
  // Cerrar los dropdowns cuando se hace clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setShowFromPredictions(false)
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setShowToPredictions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <Card className="w-full max-w-full mx-auto shadow-lg bg-white rounded-xl overflow-hidden border-0 relative z-20 booking-contrast-shadow">
      <Tabs 
        defaultValue="ida" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as 'ida' | 'horas')}
      >
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-0 h-12 rounded-none">
          <TabsTrigger 
            value="ida" 
            className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none h-full text-base font-semibold"
          >
            Ida
          </TabsTrigger>
          <TabsTrigger 
            value="horas" 
            className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none h-full text-base font-semibold"
          >
            Por horas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ida" className="m-0">
          <CardContent className="p-4 sm:p-6">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="relative" ref={fromDropdownRef}>
                <MapPin className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">De</label>
                  <Input 
                    className="border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none placeholder:text-gray-400 booking-form-input bg-gray-50" 
                    placeholder="Dirección, aeropuerto, hotel..." 
                    value={fromQuery}
                    onChange={(e) => handleFromSearch(e.target.value)}
                    onFocus={() => setShowFromPredictions(true)}
                    style={{ boxShadow: 'none' }}
                  />
                </div>
                
                {/* Predicciones para el origen */}
                {showFromPredictions && fromPredictions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {fromPredictions.map((prediction) => (
                      <div 
                        key={prediction.place_id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectFrom(prediction)}
                      >
                        <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                        <div className="text-sm text-gray-500">{prediction.structured_formatting.secondary_text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={toDropdownRef}>
                <MapPin className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">A</label>
                  <Input 
                    className="border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none placeholder:text-gray-400 booking-form-input bg-gray-50" 
                    placeholder="Dirección, aeropuerto, hotel..." 
                    value={toQuery}
                    onChange={(e) => handleToSearch(e.target.value)}
                    onFocus={() => setShowToPredictions(true)}
                    style={{ boxShadow: 'none' }}
                  />
                </div>
                
                {/* Predicciones para el destino */}
                {showToPredictions && toPredictions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {toPredictions.map((prediction) => (
                      <div 
                        key={prediction.place_id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectTo(prediction)}
                      >
                        <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                        <div className="text-sm text-gray-500">{prediction.structured_formatting.secondary_text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">Fecha</label>
                  <div className="flex items-center justify-between pr-3">
                    <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{date}</div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <Clock className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">Hora</label>
                  <div className="flex items-center justify-between pr-3">
                    <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{time}</div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-1 mb-1">El chófer esperará 15 minutos sin coste adicional.</p>

              <button 
                type="submit" 
                className="select-button w-full h-10 text-base relative z-20"
                style={{
                  background: "linear-gradient(90deg, #ff7c1a 0%, #ff3c1a 100%)",
                  color: "white",
                  fontWeight: "bold"
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  "Seleccionar"
                )}
              </button>
            </form>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="horas" className="m-0">
          <CardContent className="p-4 sm:p-6">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="relative" ref={fromDropdownRef}>
                <MapPin className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">De</label>
                  <Input 
                    className="border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none placeholder:text-gray-400 booking-form-input bg-gray-50" 
                    placeholder="Dirección, aeropuerto, hotel..." 
                    value={fromQuery}
                    onChange={(e) => handleFromSearch(e.target.value)}
                    onFocus={() => setShowFromPredictions(true)}
                    style={{ boxShadow: 'none' }}
                  />
                </div>
                
                {/* Predicciones para el origen */}
                {showFromPredictions && fromPredictions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {fromPredictions.map((prediction) => (
                      <div 
                        key={prediction.place_id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectFrom(prediction)}
                      >
                        <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                        <div className="text-sm text-gray-500">{prediction.structured_formatting.secondary_text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Clock className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">Duración</label>
                  <div className="flex items-center justify-between pr-3">
                    <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{duration}</div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">Fecha</label>
                  <div className="flex items-center justify-between pr-3">
                    <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{date}</div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <Clock className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50">
                  <label className="booking-form-label mb-0 text-left text-xs">Hora</label>
                  <div className="flex items-center justify-between pr-3">
                    <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{time}</div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="select-button w-full h-10 text-base relative z-20"
                style={{
                  background: "linear-gradient(90deg, #ff7c1a 0%, #ff3c1a 100%)",
                  color: "white",
                  fontWeight: "bold"
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  "Seleccionar"
                )}
              </button>
            </form>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
} 