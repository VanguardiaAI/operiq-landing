import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Phone, MessageCircle, Mail, User, Star, MapPin, Clock, Copy, ExternalLink } from 'lucide-react';

interface ContactDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
  pickupDate: string;
  pickupLocation: string;
  onContactLogged?: (contactData: any) => void;
}

interface DriverContactInfo {
  driver_id: string;
  name: string;
  photo: string;
  phone: string;
  email: string;
  whatsapp: string;
  license_number: string;
  rating: number;
  total_trips: number;
  experience_years: number;
  languages: string[];
  available_contact_methods: string[];
}

const ContactDriverModal: React.FC<ContactDriverModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  pickupDate,
  pickupLocation,
  onContactLogged
}) => {
  const [driverInfo, setDriverInfo] = useState<DriverContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContactMethod, setSelectedContactMethod] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle?.driver_id) {
      fetchDriverContactInfo();
    }
  }, [isOpen, vehicle?.driver_id]);

  const fetchDriverContactInfo = async () => {
    if (!vehicle || !vehicle.driver_id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contact/driver/${vehicle.driver_id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDriverInfo(data);
        // Seleccionar automáticamente el primer método disponible
        if (data.available_contact_methods?.length > 0) {
          setSelectedContactMethod(data.available_contact_methods[0]);
        }
      } else {
        console.error('Error al obtener información del conductor');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = (method: string) => {
    if (!driverInfo || !vehicle) return;

    switch (method) {
      case 'phone':
        window.open(`tel:${driverInfo.phone}`, '_self');
        break;
      case 'whatsapp':
        const message = `¡Hola ${driverInfo.name}! Consulta sobre servicio VIP para ${pickupDate} desde ${pickupLocation}`;
        const whatsappUrl = `https://wa.me/${driverInfo.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'email':
        const subject = `Consulta Servicio VIP - ${pickupDate}`;
        const vehicleModel = vehicle.vehicle_data?.model || vehicle.model || 'vehículo';
        const body = `Hola ${driverInfo.name},\n\nTengo una consulta sobre disponibilidad para un servicio VIP:\n\nFecha: ${pickupDate}\nUbicación: ${pickupLocation}\nVehículo: ${vehicleModel}\n\nGracias por tu tiempo.`;
        window.open(`mailto:${driverInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
        break;
    }

    // Registrar el contacto automáticamente
    registerContact(method);
  };

  const registerContact = async (contactMethod: string) => {
    if (!vehicle) return;
    
    setIsRegistering(true);
    try {
      const contactData = {
        admin_id: 'admin-user-id', // Este debería venir del contexto de usuario
        driver_id: vehicle.driver_id,
        contact_method: contactMethod,
        contact_reason: 'vehicle_inquiry',
        notes: notes || `Consulta sobre disponibilidad para ${pickupDate}`,
        pickup_date: pickupDate,
        pickup_location: pickupLocation,
        vehicle_id: vehicle.id || vehicle.vehicle_id
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contact/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Contacto registrado:', result);
        onContactLogged?.(contactData);
      }
    } catch (error) {
      console.error('Error al registrar contacto:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar una notificación de "copiado"
  };

  // No renderizar si no está abierto o no hay vehículo
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Contactar Conductor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-red-600 rounded-full border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando información del conductor...</p>
            </div>
          ) : driverInfo ? (
            <div className="space-y-6">
              {/* Driver Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {driverInfo.photo ? (
                    <img src={driverInfo.photo} alt={driverInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{driverInfo.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{driverInfo.rating}/5</span>
                    <span className="mx-2">•</span>
                    <span>{driverInfo.total_trips} viajes</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {driverInfo.experience_years} años de experiencia
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Detalles del Vehículo</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Modelo:</strong> {vehicle.vehicle_data?.model || vehicle.model || 'N/A'}</div>
                  <div><strong>Matrícula:</strong> {vehicle.vehicle_data?.licensePlate || vehicle.license_plate || 'No disponible'}</div>
                  <div><strong>Tipo:</strong> {vehicle.availability_type === 'fixed_zone' ? 'Zona Fija' : 'Ruta Flexible'}</div>
                  {vehicle.zone_name && <div><strong>Zona:</strong> {vehicle.zone_name}</div>}
                </div>
              </div>

              {/* Trip Info */}
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Detalles del Viaje</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span><strong>Fecha:</strong> {pickupDate}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span><strong>Ubicación:</strong> {pickupLocation}</span>
                  </div>
                </div>
              </div>

              {/* Contact Methods */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Métodos de Contacto</h4>
                <div className="space-y-3">
                  {driverInfo.available_contact_methods?.includes('phone') && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <div className="font-medium">Teléfono</div>
                          <div className="text-sm text-gray-600">{driverInfo.phone}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(driverInfo.phone)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar número"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleContact('phone')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Llamar
                        </button>
                      </div>
                    </div>
                  )}

                  {driverInfo.available_contact_methods?.includes('whatsapp') && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <div className="font-medium">WhatsApp</div>
                          <div className="text-sm text-gray-600">{driverInfo.whatsapp}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleContact('whatsapp')}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Enviar
                      </button>
                    </div>
                  )}

                  {driverInfo.available_contact_methods?.includes('email') && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-sm text-gray-600">{driverInfo.email}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(driverInfo.email)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar email"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleContact('email')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {driverInfo.languages?.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Idiomas</h4>
                  <div className="flex flex-wrap gap-2">
                    {driverInfo.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Agregar detalles adicionales sobre la consulta..."
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error al cargar información del conductor</div>
              <button
                onClick={fetchDriverContactInfo}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isRegistering}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactDriverModal; 