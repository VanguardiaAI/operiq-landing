type BookingsTableProps = {
  bookingsData: any[];
  handleViewBookingDetails: (booking: any) => void;
};

const BookingsTable = ({ bookingsData, handleViewBookingDetails }: BookingsTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-4">
          <button className="text-sm px-3 py-2 font-medium text-gray-600 border-b-2 border-red-600">
            Reservas activas (23)
          </button>
          <button className="text-sm px-3 py-2 text-gray-500 hover:text-gray-700">
            Historial (152)
          </button>
        </div>
      </div>
      
      {/* Tabla de reservas */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo / Conductor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookingsData.map((booking, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${booking.hasIncident ? 'bg-gray-100' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                      <div className="text-sm text-gray-500">{booking.clientName}</div>
                    </div>
                    {booking.hasIncident && (
                      <span className="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800">
                        {booking.incidentType === 'delay' ? 'Retraso' : booking.incidentType === 'change' ? 'Cambio' : 'Incidencia'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{booking.fromTo}</div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.type === 'one_way' ? 'Un trayecto' : 
                     booking.type === 'round_trip' ? 'Ida y vuelta' : 
                     booking.type === 'hourly' ? 'Por horas' : 'Día completo'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.vehicle}</div>
                  <div className="text-sm text-gray-500">{booking.driver}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${booking.status === 'pending' ? 'bg-gray-200 text-yellow-800' : 
                     booking.status === 'confirmed' ? 'bg-gray-200 text-green-800' : 
                     booking.status === 'in_progress' ? 'bg-gray-200 text-blue-800' : 
                     booking.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                     booking.status === 'cancelled' ? 'bg-gray-200 text-gray-800' : 
                     'bg-gray-200 text-purple-800'}`}
                  >
                    {booking.status === 'pending' ? 'Pendiente' :
                     booking.status === 'confirmed' ? 'Confirmado' :
                     booking.status === 'in_progress' ? 'En progreso' :
                     booking.status === 'completed' ? 'Completado' :
                     booking.status === 'cancelled' ? 'Cancelado' : 'No show'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleViewBookingDetails(booking)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Ver
                  </button>
                  <button className="text-gray-600 hover:text-blue-900 mr-3">
                    Editar
                  </button>
                  <button className="text-gray-600 hover:text-red-900">
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Anterior
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">6</span> de <span className="font-medium">23</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsTable; 