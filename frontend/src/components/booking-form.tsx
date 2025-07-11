"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar as CalendarIcon, Clock, MapPin, ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TimePicker } from "@/components/ui/time-picker"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Componente de calendario mejorado
function CalendarComponent({ selectedDate, onDateChange }: { selectedDate: Date, onDateChange: (date: Date) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  
  // Función para obtener el primer día del mes (0 = domingo, 1 = lunes, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Ajuste para que la semana comience en lunes
  };
  
  // Función para obtener el número de días en un mes
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  // Función para avanzar al mes siguiente
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Función para retroceder al mes anterior
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Nombres de los meses en español
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  // Obtener datos del mes actual
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Días del mes anterior para completar la primera semana
  const prevMonthDays = Array.from(
    { length: firstDayOfMonth },
    (_, i) => {
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
      return prevMonth.getDate() - firstDayOfMonth + i + 1;
    }
  );
  
  // Días del mes siguiente para completar la última semana
  const nextMonthDays = Array.from(
    { length: 42 - (firstDayOfMonth + daysInMonth) },
    (_, i) => i + 1
  );
  
  // Comprobar si una fecha es la seleccionada
  const isSelectedDate = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };
  
  // Comprobar si una fecha es anterior a hoy
  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < today && !(
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Función para manejar la selección de una fecha
  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isPastDate(day)) {
      onDateChange(newDate);
    }
  };
  
  return (
    <div className="calendar">
      {/* Cabecera del calendario con navegación de meses */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
          className={`p-1 rounded-full ${
            currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
          }`}
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h2 className="text-base font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button 
          onClick={nextMonth}
          className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Días del mes anterior */}
        {prevMonthDays.map((day, index) => (
          <div
            key={`prev-${index}`}
            className="text-center py-2 text-sm text-gray-300"
          >
            {day}
          </div>
        ))}
        
        {/* Días del mes actual */}
        {daysArray.map((day) => (
          <button
            key={day}
            type="button"
            disabled={isPastDate(day)}
            onClick={() => handleSelectDate(day)}
            className={`
              text-center py-2 rounded-md text-sm transition-all
              ${isSelectedDate(day)
                ? 'bg-black text-white font-bold'
                : isPastDate(day)
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }
            `}
          >
            {day}
          </button>
        ))}
        
        {/* Días del mes siguiente */}
        {nextMonthDays.map((day, index) => (
          <div
            key={`next-${index}`}
            className="text-center py-2 text-sm text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de selector de duración mejorado
function DurationSelector({ selectedDuration, onDurationChange }: { selectedDuration: string, onDurationChange: (duration: string) => void }) {
  // Categorías de duración
  const durationCategories = {
    "Corta": ["1 hora", "2 horas", "3 horas"],
    "Media": ["4 horas", "5 horas", "6 horas"],
    "Larga": ["7 horas", "8 horas", "Día completo (10 horas)"]
  };
  
  return (
    <div className="duration-selector">
      {Object.entries(durationCategories).map(([category, durations]) => (
        <div key={category} className="mb-5 last:mb-0">
          <div className="text-sm font-medium text-gray-500 mb-2">{category}</div>
          <div className="grid grid-cols-1 gap-2">
            {durations.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => onDurationChange(duration)}
                className={`
                  text-left px-4 py-3 rounded-md transition-all flex justify-between items-center
                  ${selectedDuration === duration
                    ? 'bg-black text-white font-bold'
                    : 'hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <span>{duration}</span>
                {selectedDuration === duration && (
                  <span className="text-white">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    tripType: 'ida',
    from: {
      description: '',
    },
    to: {
      description: '',
    },
    duration: '2 horas',
    date: format(new Date(), "yyyy-MM-dd"),
    time: "12:00",
  })
  const navigate = useNavigate()
  
  // Estados para la UI
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [durationDialogOpen, setDurationDialogOpen] = useState(false)
  const [fromPredictions, setFromPredictions] = useState<PlacePrediction[]>([])
  const [toPredictions, setToPredictions] = useState<PlacePrediction[]>([])
  const [showFromPredictions, setShowFromPredictions] = useState(false)
  const [showToPredictions, setShowToPredictions] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Referencias para los dropdowns
  const fromDropdownRef = useRef<HTMLDivElement>(null)
  const toDropdownRef = useRef<HTMLDivElement>(null)
  
  // Manejador para búsqueda de lugares "desde"
  const handleFromSearch = async (query: string) => {
    setFormData(prev => ({ ...prev, from: { ...prev.from, description: query } }))
    
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
    setFormData(prev => ({ ...prev, to: { ...prev.to, description: query } }))
    
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
    setFormData(prev => ({ 
      ...prev, 
      from: { 
        place_id: prediction.place_id, 
        description: prediction.description 
      } 
    }))
    setShowFromPredictions(false)
  }
  
  // Manejador para seleccionar un lugar "hacia"
  const handleSelectTo = (prediction: PlacePrediction) => {
    setFormData(prev => ({ 
      ...prev, 
      to: { 
        place_id: prediction.place_id, 
        description: prediction.description 
      } 
    }))
    setShowToPredictions(false)
  }
  
  // Manejador para seleccionar fecha
  const handleDateChange = (newDate: Date) => {
    setFormData(prev => ({ ...prev, date: format(newDate, "yyyy-MM-dd") }))
    setDateDialogOpen(false)
  }
  
  // Manejador para seleccionar hora
  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, time }))
  }
  
  // Manejador para seleccionar duración
  const handleDurationChange = (duration: string) => {
    setFormData(prev => ({ ...prev, duration }))
    setDurationDialogOpen(false)
  }
  
  // Manejador para el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validar campos
    if (!formData.from.description) {
      console.error("El punto de partida es obligatorio.")
      setLoading(false)
      return
    }

    if (formData.tripType === 'ida' && !formData.to?.description) {
      console.error("El destino es obligatorio para viajes de solo ida.")
      setLoading(false)
      return
    }

    try {
      // Guardar datos en localStorage para pasarlos a la siguiente página
      localStorage.setItem("bookingDetails", JSON.stringify(formData))
      
      // Redirigir a la página de checkout
      navigate("/checkout")
    } catch (error) {
      console.error("Error al procesar la reserva:", error)
      alert("Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.")
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

  const handleTabChange = (value: 'ida' | 'horas') => {
    setFormData(prev => ({
      ...prev,
      tripType: value,
      to: value === 'horas' ? { description: '' } : prev.to,
      duration: value === 'ida' ? '' : prev.duration || '2 horas'
    }));
  };

  return (
    <>
      <Card className="w-full max-w-full mx-auto shadow-lg bg-white rounded-xl overflow-hidden border-0 relative z-20 booking-contrast-shadow">
        <Tabs 
          value={formData.tripType}
          className="w-full"
          onValueChange={(value) => handleTabChange(value as 'ida' | 'horas')}
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
                      value={formData.from.description}
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
                      value={formData.to?.description || ''}
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
                  <CalendarIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  <div 
                    className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50 cursor-pointer"
                    onClick={() => setDateDialogOpen(true)}
                  >
                    <label className="booking-form-label mb-0 text-left text-xs">Fecha</label>
                    <div className="flex items-center justify-between pr-3">
                      <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{format(new Date(formData.date), "E, dd MMM yyyy", { locale: es })}</div>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <TimePicker
                    value={formData.time}
                    onChange={handleTimeChange}
                  />
                </div>

                <p className="text-xs text-gray-600 mt-1 mb-1">El chófer esperará 15 minutos sin coste adicional.</p>

                <button 
                  type="submit" 
                  className="select-button w-full h-10 text-base relative z-20"
                  style={{
                    background: "#000000",
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
                      value={formData.from.description}
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
                  <div 
                    className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50 cursor-pointer"
                    onClick={() => setDurationDialogOpen(true)}
                  >
                    <label className="booking-form-label mb-0 text-left text-xs">Duración</label>
                    <div className="flex items-center justify-between pr-3">
                      <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{formData.duration}</div>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  <div 
                    className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50 cursor-pointer"
                    onClick={() => setDateDialogOpen(true)}
                  >
                    <label className="booking-form-label mb-0 text-left text-xs">Fecha</label>
                    <div className="flex items-center justify-between pr-3">
                      <div className="booking-form-input h-6 flex items-center focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" style={{ boxShadow: 'none' }}>{format(new Date(formData.date), "E, dd MMM yyyy", { locale: es })}</div>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <TimePicker
                    value={formData.time}
                    onChange={handleTimeChange}
                  />
                </div>

                <button 
                  type="submit" 
                  className="select-button w-full h-10 text-base relative z-20"
                  style={{
                    background: "#000000",
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

      {/* Diálogo de selección de fecha */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-4">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold mb-4">Selecciona una fecha</DialogTitle>
          </DialogHeader>
          <div className="calendar-container p-2">
            <CalendarComponent 
              selectedDate={new Date(formData.date)}
              onDateChange={handleDateChange}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de selección de duración */}
      <Dialog open={durationDialogOpen} onOpenChange={setDurationDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-4">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold mb-4">Selecciona la duración</DialogTitle>
          </DialogHeader>
          <DurationSelector 
            selectedDuration={formData.duration || ''}
            onDurationChange={handleDurationChange}
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 