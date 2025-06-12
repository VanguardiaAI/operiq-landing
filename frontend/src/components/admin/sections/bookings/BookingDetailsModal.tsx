import { X } from "lucide-react";

type BookingDetailsModalProps = {
  selectedBookingForDetails: any;
  handleCloseBookingDetails: () => void;
};

const BookingDetailsModal = ({ 
  selectedBookingForDetails, 
  handleCloseBookingDetails 
}: BookingDetailsModalProps) => {
  if (!selectedBookingForDetails) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Detalles de la Reserva</h2>
          <button 
            onClick={handleCloseBookingDetails}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica de la reserva */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información de la Reserva</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">{selectedBookingForDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs
                    ${selectedBookingForDetails.status === 'pending' ? 'bg-gray-200 text-yellow-800' : 
                     selectedBookingForDetails.status === 'confirmed' ? 'bg-gray-200 text-green-800' : 
                     selectedBookingForDetails.status === 'in_progress' ? 'bg-gray-200 text-blue-800' : 
                     selectedBookingForDetails.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                     selectedBookingForDetails.status === 'cancelled' ? 'bg-gray-200 text-gray-800' : 
                     'bg-gray-200 text-purple-800'}`}
                  >
                    {selectedBookingForDetails.status === 'pending' ? 'Pendiente' :
                     selectedBookingForDetails.status === 'confirmed' ? 'Confirmado' :
                     selectedBookingForDetails.status === 'in_progress' ? 'En progreso' :
                     selectedBookingForDetails.status === 'completed' ? 'Completado' :
                     selectedBookingForDetails.status === 'cancelled' ? 'Cancelado' : 'No show'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">{selectedBookingForDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-medium">{selectedBookingForDetails.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">
                    {selectedBookingForDetails.type === 'one_way' ? 'Un trayecto' : 
                     selectedBookingForDetails.type === 'round_trip' ? 'Ida y vuelta' : 
                     selectedBookingForDetails.type === 'hourly' ? 'Por horas' : 'Día completo'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Información del cliente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Cliente</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{selectedBookingForDetails.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">cliente@ejemplo.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="font-medium">+34 612 345 678</span>
                </div>
              </div>
            </div>
            
            {/* Detalles de la ruta */}
            <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Detalles de la Ruta</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 block">Origen:</span>
                    <span className="font-medium block mt-1">
                      {selectedBookingForDetails.fromTo.split('→')[0].trim()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Destino:</span>
                    <span className="font-medium block mt-1">
                      {selectedBookingForDetails.fromTo.split('→')[1].trim()}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-gray-600 block">Notas adicionales:</span>
                  <span className="font-medium block mt-1">
                    Sin notas adicionales.
                  </span>
                </div>
              </div>
            </div>
            
            {/* Información del vehículo y conductor */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Vehículo y Conductor</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehículo:</span>
                  <span className="font-medium">{selectedBookingForDetails.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conductor:</span>
                  <span className="font-medium">{selectedBookingForDetails.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matrícula:</span>
                  <span className="font-medium">1234 ABC</span>
                </div>
              </div>
            </div>
            
            {/* Historial de la reserva */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Historial de la Reserva</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="min-w-[100px] text-xs text-gray-500">Hoy, 10:45</div>
                  <div>
                    <span className="text-sm font-medium">Reserva creada</span>
                    <p className="text-xs text-gray-500">por Admin</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="min-w-[100px] text-xs text-gray-500">Hoy, 11:20</div>
                  <div>
                    <span className="text-sm font-medium">Estado actualizado a Confirmado</span>
                    <p className="text-xs text-gray-500">por Sistema</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="min-w-[100px] text-xs text-gray-500">Hoy, 12:00</div>
                  <div>
                    <span className="text-sm font-medium">Conductor asignado</span>
                    <p className="text-xs text-gray-500">por Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Acciones */}
          <div className="mt-6 flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Imprimir
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
              Editar
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
              Cancelar Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 