import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Search, Filter, Download, Calendar, ChevronDown } from "lucide-react";

export default function TripsPage() {
  const {} = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'canceled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('Fechas de inicio y fin');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    // Aquí implementarías la lógica para aplicar los filtros
    // Por ahora, simplemente ocultaremos el panel de filtros
    setShowFilters(false);
  };

  const cancelFilters = () => {
    // Restablecer filtros a valores predeterminados
    setDateFilter('Fechas de inicio y fin');
    setStatusFilter('Todos');
    setShowFilters(false);
  };

  // En un escenario real, estos datos se obtendrían de una API
  /* const upcomingTrips: Trip[] = [
    // Por ahora, no hay viajes próximos
  ];

  const pastTrips: Trip[] = [
    // Por ahora, no hay viajes pasados
  ]; */

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-white pb-16">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Viajes</h1>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex justify-between items-end">
              <div className="flex">
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'upcoming'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Próximamente
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'past'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('past')}
                >
                  Pasado
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'canceled'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('canceled')}
                >
                  Cancelados
                </button>
              </div>
              <button 
                className="flex items-center text-gray-700 hover:text-black mb-2"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </button>
            </div>
          </div>
          
          {/* Contador */}
          <div className="mb-6">
            <div className="text-sm text-gray-600">
              0 reservas
            </div>
          </div>
          
          {/* Búsqueda y filtros */}
          <div className="flex mb-4">
            <div className="relative flex-grow mr-2">
              <input
                type="text"
                placeholder="Busca por número de reserva, ubicación o nombre"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <button 
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={toggleFilters}
            >
              <Filter className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800">Los viajes con filtro</h3>
                <button 
                  className="text-gray-600 hover:text-gray-800 text-sm"
                  onClick={() => {
                    setDateFilter('Fechas de inicio y fin');
                    setStatusFilter('Todos');
                  }}
                >
                  Reajustar
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {/* Filtro de fechas */}
                <div className="relative w-full md:w-auto md:flex-1">
                  <div className="text-sm text-gray-600 mb-1">Fechas</div>
                  <div 
                    className="flex items-center justify-between bg-gray-100 p-2 rounded-md cursor-pointer"
                    onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-700">{dateFilter}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isDateDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md">
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setDateFilter('Fechas de inicio y fin');
                          setIsDateDropdownOpen(false);
                        }}
                      >
                        Fechas de inicio y fin
                      </div>
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setDateFilter('Últimos 30 días');
                          setIsDateDropdownOpen(false);
                        }}
                      >
                        Últimos 30 días
                      </div>
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setDateFilter('Últimos 90 días');
                          setIsDateDropdownOpen(false);
                        }}
                      >
                        Últimos 90 días
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Filtro de estado */}
                <div className="relative w-full md:w-auto md:flex-1">
                  <div className="text-sm text-gray-600 mb-1">Estado</div>
                  <div 
                    className="flex items-center justify-between bg-gray-100 p-2 rounded-md cursor-pointer"
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  >
                    <span className="text-sm text-gray-700">{statusFilter}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isStatusDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md">
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setStatusFilter('Todos');
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        Todos
                      </div>
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setStatusFilter('Confirmado');
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        Confirmado
                      </div>
                      <div 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setStatusFilter('Pendiente');
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        Pendiente
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={cancelFilters}
                >
                  Cancelar
                </button>
                <button 
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-all duration-150 ease-in-out"
                  onClick={applyFilters}
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
          
          {/* Contenido según el tab activo */}
          <div className="mb-8">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay resultados</h3>
              <p className="text-gray-600 mb-2">
                No tienes ningún viaje próximamente que coincida con ese criterio. 
              </p>
              <p className="text-gray-600">
                Intenta buscar algo más o cambiar los filtros.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 