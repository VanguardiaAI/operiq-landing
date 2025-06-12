import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Calendar, Clock, MapPin, User, Phone, Mail, Send } from 'lucide-react';

interface SuggestScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
  originalPickupDate: string;
  pickupLocation: string;
  dropoffLocation?: string;
  clientId?: string;
  onSuggestionCreated?: (suggestionData: any) => void;
}

interface ClientContactInfo {
  client_id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  contact_preferences: string[];
  preferred_language: string;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  date?: string;
}

const SuggestScheduleModal: React.FC<SuggestScheduleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  originalPickupDate,
  pickupLocation,
  dropoffLocation,
  clientId,
  onSuggestionCreated
}) => {
  const [clientInfo, setClientInfo] = useState<ClientContactInfo | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [suggestedDate, setSuggestedDate] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');
  const [contactMethod, setContactMethod] = useState('whatsapp');
  const [customMessage, setCustomMessage] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Horarios alternativos del vehículo - VALIDACIÓN AGREGADA
  const alternativeSlots: TimeSlot[] = vehicle?.alternative_time_slots || [];

  useEffect(() => {
    if (isOpen && vehicle) {
      // Inicializar valores por defecto
      initializeDefaultValues();
      
      // Cargar información del cliente si se proporciona ID
      if (clientId) {
        fetchClientContactInfo();
      }
    }
  }, [isOpen, clientId, vehicle]);

  const initializeDefaultValues = () => {
    if (!vehicle) return;

    // Seleccionar automáticamente los primeros 3 horarios alternativos
    if (alternativeSlots.length > 0) {
      const defaultSlots = alternativeSlots.slice(0, 3).map((slot: TimeSlot) => 
        `${slot.start_time} - ${slot.end_time}`
      );
      setSelectedSlots(defaultSlots);
    }

    // Establecer motivo por defecto
    setReason(vehicle.unavailable_reason || 'Horario no disponible');

    // Mensaje por defecto
    const driverName = vehicle.vehicle_data?.driver?.name || vehicle.driver_name || 'el conductor';
    const vehicleModel = vehicle.vehicle_data?.model || vehicle.model || 'el vehículo';
    
    setCustomMessage(
      `Hola! Te escribo porque el vehículo que solicitaste (${vehicleModel}) no está disponible en el horario que necesitas.\n\n` +
      `Sin embargo, ${driverName} tiene disponibilidad en otros horarios del mismo día.\n\n` +
      `¿Te gustaría considerar alguna de estas opciones alternativas?`
    );
  };

  const fetchClientContactInfo = async () => {
    if (!clientId) return;

    setIsLoadingClient(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contact/client/${clientId}`);
      
      if (response.ok) {
        const data = await response.json();
        setClientInfo(data);
        
        // Establecer método de contacto preferido
        if (data.contact_preferences?.length > 0) {
          setContactMethod(data.contact_preferences[0]);
        }
      } else {
        console.error('Error al obtener información del cliente');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleSlotToggle = (slot: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleSubmitSuggestion = async () => {
    if (!clientInfo && !clientId) {
      alert('Se requiere información del cliente para enviar la sugerencia');
      return;
    }

    if (!vehicle) {
      alert('Error: No se ha seleccionado un vehículo');
      return;
    }

    setIsSubmitting(true);
    try {
      const suggestionData = {
        admin_id: 'admin-user-id', // Este debería venir del contexto de usuario
        client_id: clientId || clientInfo?.client_id,
        driver_id: vehicle.driver_id,
        vehicle_id: vehicle.id || vehicle.vehicle_id,
        original_pickup_date: originalPickupDate,
        suggested_pickup_date: suggestedDate && suggestedTime ? 
          `${suggestedDate}T${suggestedTime}:00` : '',
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation || '',
        reason: reason,
        alternative_time_slots: selectedSlots,
        contact_method: contactMethod,
        message: customMessage
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contact/suggest-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suggestionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Sugerencia creada:', result);
        onSuggestionCreated?.(suggestionData);
        
        // Mostrar confirmación
        alert('Sugerencia de horario enviada exitosamente!');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error al enviar sugerencia: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al enviar sugerencia:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No renderizar si no está abierto o no hay vehículo
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Sugerir Horario Alternativo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle and Trip Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Vehículo</h3>
              <div className="text-sm space-y-1">
                <div><strong>Modelo:</strong> {vehicle.vehicle_data?.model || vehicle.model || 'N/A'}</div>
                <div><strong>Conductor:</strong> {vehicle.vehicle_data?.driver?.name || vehicle.driver_name || 'N/A'}</div>
                <div><strong>Tipo:</strong> {vehicle.availability_type === 'fixed_zone' ? 'Zona Fija' : 'Ruta Flexible'}</div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Viaje Original</h3>
              <div className="text-sm space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span><strong>Fecha:</strong> {originalPickupDate}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span><strong>Origen:</strong> {pickupLocation}</span>
                </div>
                {dropoffLocation && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span><strong>Destino:</strong> {dropoffLocation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Info */}
          {isLoadingClient ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="animate-pulse">Cargando información del cliente...</div>
            </div>
          ) : clientInfo ? (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Cliente</h3>
              <div className="text-sm space-y-1">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span><strong>Nombre:</strong> {clientInfo.name}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span><strong>Teléfono:</strong> {clientInfo.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span><strong>Email:</strong> {clientInfo.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                ℹ️ Para mejores resultados, asegúrate de que el cliente esté registrado en el sistema.
              </p>
            </div>
          )}

          {/* Reason for unavailability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de no disponibilidad
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: En otro viaje programado"
            />
          </div>

          {/* Alternative time slots */}
          {alternativeSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horarios alternativos disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedSlots.map((slot) => (
                  <div key={slot} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1.5" />
                    {slot}
                    <button
                      onClick={() => handleSlotToggle(slot)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Se han preseleccionado automáticamente los primeros 3 horarios. Puedes modificar la selección.
              </p>
            </div>
          )}

          {/* Custom date/time suggestion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha específica (opcional)
              </label>
              <input
                type="date"
                value={suggestedDate}
                onChange={(e) => setSuggestedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora específica (opcional)
              </label>
              <input
                type="time"
                value={suggestedTime}
                onChange={(e) => setSuggestedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de contacto preferido
            </label>
            <select
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="phone">Llamada telefónica</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          {/* Custom message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje personalizado
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Personaliza el mensaje que se enviará al cliente..."
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Vista previa del mensaje</h4>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {customMessage}
              
              {selectedSlots.length > 0 && (
                <>
                  {'\n\n'}📅 <strong>Horarios disponibles:</strong>
                  {selectedSlots.map((slot) => (
                    `\n• ${slot}`
                  )).join('')}
                </>
              )}
              
              {suggestedDate && suggestedTime && (
                <>
                  {'\n\n'}⭐ <strong>Sugerencia específica:</strong> {suggestedDate} a las {suggestedTime}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          
          <Button
            onClick={handleSubmitSuggestion}
            disabled={isSubmitting || selectedSlots.length === 0}
            className="bg-black hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Sugerencia
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuggestScheduleModal; 