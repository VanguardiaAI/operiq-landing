import { Button } from "@/components/ui/button";
import { PlusCircle, Search, RefreshCw } from "lucide-react";
import { useBookingManagement } from "@/hooks/useBookingManagement";
import { useEffect, useState } from "react";
import { bookingService, BookingListItem, BookingFilters } from "@/services/bookingService";
import { useToast } from "@/components/ui/use-toast";

// Importar los componentes refactorizados
import BookingsTable from "./bookings/BookingsTable";
import BookingsFilters from "./bookings/BookingsFilters";
import BookingDetailsModal from "./bookings/BookingDetailsModal";
import NewBookingModal from "./bookings/NewBookingModal";

const BookingsSection = () => {
  // Estados para datos reales
  const [bookingsData, setBookingsData] = useState<BookingListItem[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [bookingsTab, setBookingsTab] = useState<'active' | 'history'>('active');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    history: 0,
    today: 0,
    incidents: 0,
    by_status: {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    }
  });
  
  const { toast } = useToast();
  
  // Exponer toast globalmente para el hook
  useEffect(() => {
    (window as any).showToast = toast;
    return () => {
      delete (window as any).showToast;
    };
  }, [toast]);
  
  // Utilizar el hook personalizado para la gestión de reservas
  const {
    // Estados
    selectedBookingForDetails,
    isBookingDetailsViewOpen,
    isNewBookingModalOpen,
    newBookingFormData,
    activeTab,
    validationErrors,
    clientSearchResults,
    isSearchingClient,
    routeType,
    fixedRoutes,
    isSearchingRoutes,
    routeSearchResults,
    selectedRoute,
    // Nuevos estados para autocompletado de direcciones
    pickupAddressResults,
    isSearchingPickupAddress,
    dropoffAddressResults,
    isSearchingDropoffAddress,
    // Estados para la verificación de disponibilidad
    isCheckingAvailability,
    availabilityResults,
    // Nuevos estados para el cálculo de precios
    isCalculatingPrice,
    // priceBreakdown,
    // routeInfo,

    // Funciones para la gestión de detalles de reserva
    handleViewBookingDetails,
    handleCloseBookingDetails,

    // Funciones para la gestión del modal de reserva
    handleOpenNewBookingModal,
    handleCloseNewBookingModal,
    handleFormChange,

    // Funciones para la búsqueda de clientes
    handleSearchClient,
    handleSelectClient,

    // Funciones para la validación y navegación del formulario
    validateFormTab,
    handleNextTab,
    setActiveTab,

    // Funciones para el envío de datos
    handleSubmitNewBooking,
    handleSearchFixedRoutes,
    handleSelectFixedRoute,
    handleRouteTypeChange,
    // Nuevas funciones para autocompletado de direcciones
    handleSearchPickupAddress,
    handleSelectPickupAddress,
    handleSearchDropoffAddress,
    handleSelectDropoffAddress,
    // Función para verificar disponibilidad
    handleCheckVehicleAvailability,
    // Nuevas funciones para el cálculo de precios
    handleCalculatePrice,
    canCalculatePrice,
    // Estados y funciones para contacto y sugerencias
    contactModalOpen,
    suggestModalOpen,
    selectedVehicleForAction,
    handleOpenContactModal,
    handleCloseContactModal,
    handleOpenSuggestModal,
    handleCloseSuggestModal,
    handleContactLogged,
    handleSuggestionCreated,
    // Estados y funciones para horario extra
    extraScheduleModalOpen,
    handleOpenExtraScheduleModal,
    handleCloseExtraScheduleModal,
    handleExtraScheduleCreated,

    // Estados para indicadores especiales
    wasVehicleSelectedByExtraSchedule,
    handleClearVehicleSelection,

    // Función para limpiar precio calculado
    clearCalculatedPrice,
  } = useBookingManagement();

  // Crear wrappers para las funciones que tienen tipos específicos
  const setActiveTabWrapper = (tab: string) => {
    setActiveTab(tab as "client" | "service" | "details" | "payment");
  };

  const validateFormTabWrapper = (tab: string) => {
    return validateFormTab(tab as "client" | "service" | "details" | "payment");
  };

  const handleNextTabWrapper = (currentTab: string) => {
    handleNextTab(currentTab as "client" | "service" | "details");
  };

  const handleRouteTypeChangeWrapper = (type: string) => {
    handleRouteTypeChange(type as "fixed" | "flexible");
  };

  // Función para cargar reservas desde el backend
  const loadBookings = async () => {
    try {
      setIsLoadingBookings(true);
      
      // Prepare filters based on active tab
      let statusFilter = selectedStatus;
      if (!selectedStatus) {
        // If no specific status is selected, filter based on tab
        if (bookingsTab === 'active') {
          statusFilter = 'pending,confirmed,in_progress'; // Active statuses
        } else {
          statusFilter = 'completed,cancelled,no_show'; // History statuses
        }
      }
      
      const filters: BookingFilters = {
        page: currentPage,
        per_page: 10,
        search: searchQuery,
        status: statusFilter || undefined
      };
      
      const response = await bookingService.getBookings(filters);
      
      // The service already processes the bookings data
      setBookingsData(response.reservations);
      setTotalPages(response.pagination.pages);
      setTotalBookings(response.pagination.total);
      
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Function to load stats
  const loadStats = async () => {
    try {
      const statsData = await bookingService.getBookingStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Cargar reservas cuando cambian los filtros o al montar el componente
  useEffect(() => {
    loadBookings();
  }, [currentPage, searchQuery, selectedStatus, refreshKey, bookingsTab]);

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  // Función para manejar el cierre del modal y refrescar
  const handleCloseNewBookingModalAndRefresh = () => {
    handleCloseNewBookingModal();
    // Refrescar la lista de reservas y estadísticas
    setRefreshKey(prev => prev + 1);
  };

  // Handle tab change
  const handleTabChange = (tab: 'active' | 'history') => {
    setBookingsTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    setSelectedStatus(''); // Clear status filter when changing tabs
  };

  // Handle refresh with stats update
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Función para buscar con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1); // Resetear a la primera página al buscar
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-6" data-oid="kc_flia">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="pq2gvcy"
      >
        <h1 className="text-2xl font-bold text-gray-800" data-oid="ze9s:8n">
          Gestión de Reservas
          {totalBookings > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({totalBookings} reservas)
            </span>
          )}
        </h1>
        <div className="flex items-center space-x-3" data-oid="sopr8-h">
          <div className="relative" data-oid="oupkcen">
            <input
              type="text"
              placeholder="Buscar reserva..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              data-oid="miux1cd"
            />

            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              data-oid="pw7v8k2"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRefreshKey(prev => prev + 1)}
            disabled={isLoadingBookings}
            title="Refrescar"
          >
            <RefreshCw size={18} className={isLoadingBookings ? "animate-spin" : ""} />
          </Button>
          <Button
            className="bg-black hover:bg-gray-800"
            onClick={handleOpenNewBookingModal}
            data-oid="mkf-jvt"
          >
            <PlusCircle size={18} className="mr-2" data-oid="vd:4mg2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Filtros y estadísticas rápidas */}
      <BookingsFilters 
        data-oid="prudprj" 
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Tabla de reservas */}
      {isLoadingBookings ? (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-center items-center">
            <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
            <span className="ml-2 text-gray-500">Cargando reservas...</span>
          </div>
        </div>
      ) : bookingsData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center text-gray-500">
            <p className="text-lg">No se encontraron reservas</p>
            <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </div>
      ) : (
        <BookingsTable
          bookingsData={bookingsData}
          handleViewBookingDetails={handleViewBookingDetails}
          activeTab={bookingsTab}
          onTabChange={handleTabChange}
          stats={stats}
          onRefresh={handleRefresh}
          data-oid="o5efpn:"
        />
      )}
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoadingBookings}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoadingBookings}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Panel para seguimiento en tiempo real de servicios en progreso */}
      <div
        className="bg-white rounded-xl shadow-md p-6 mt-6"
        data-oid=".jrujux"
      >
        {/* ... contenido de seguimiento en tiempo real ... */}
      </div>

      {/* Panel para incidencias y alertas */}
      <div
        className="bg-white rounded-xl shadow-md p-6 mt-6"
        data-oid="t1b::31"
      >
        {/* ... contenido de incidencias y alertas ... */}
      </div>

      {/* Modal de detalles de reserva */}
      {isBookingDetailsViewOpen && (
        <BookingDetailsModal
          selectedBookingForDetails={selectedBookingForDetails}
          handleCloseBookingDetails={handleCloseBookingDetails}
          data-oid="j_cl2me"
        />
      )}

      {/* Modal de nueva reserva */}
      {isNewBookingModalOpen && (
        <NewBookingModal
          isNewBookingModalOpen={isNewBookingModalOpen}
          handleCloseNewBookingModal={handleCloseNewBookingModalAndRefresh}
          activeTab={activeTab}
          setActiveTab={setActiveTabWrapper}
          newBookingFormData={newBookingFormData}
          validationErrors={validationErrors}
          handleFormChange={handleFormChange}
          validateFormTab={validateFormTabWrapper}
          handleNextTab={handleNextTabWrapper}
          handleSubmitNewBooking={handleSubmitNewBooking}
          // Datos y funciones para clientes
          handleSearchClient={handleSearchClient}
          handleSelectClient={handleSelectClient}
          clientSearchResults={clientSearchResults}
          isSearchingClient={isSearchingClient}
          // Datos y funciones para rutas
          routeType={routeType}
          handleRouteTypeChange={handleRouteTypeChangeWrapper}
          handleSearchFixedRoutes={handleSearchFixedRoutes}
          handleSelectFixedRoute={handleSelectFixedRoute}
          fixedRoutes={fixedRoutes}
          isSearchingRoutes={isSearchingRoutes}
          routeSearchResults={routeSearchResults}
          selectedRoute={selectedRoute}
          // Datos y funciones para direcciones
          handleSearchPickupAddress={handleSearchPickupAddress}
          handleSelectPickupAddress={handleSelectPickupAddress}
          handleSearchDropoffAddress={handleSearchDropoffAddress}
          handleSelectDropoffAddress={handleSelectDropoffAddress}
          pickupAddressResults={pickupAddressResults}
          isSearchingPickupAddress={isSearchingPickupAddress}
          dropoffAddressResults={dropoffAddressResults}
          isSearchingDropoffAddress={isSearchingDropoffAddress}
          // Datos y funciones para disponibilidad
          handleCheckVehicleAvailability={handleCheckVehicleAvailability}
          isCheckingAvailability={isCheckingAvailability}
          availabilityResults={availabilityResults}
          // Datos y funciones para el cálculo de precios
          handleCalculatePrice={handleCalculatePrice}
          isCalculatingPrice={isCalculatingPrice}
          canCalculatePrice={canCalculatePrice}
          // Datos y funciones para contacto y sugerencias
          contactModalOpen={contactModalOpen}
          suggestModalOpen={suggestModalOpen}
          selectedVehicleForAction={selectedVehicleForAction}
          handleOpenContactModal={handleOpenContactModal}
          handleCloseContactModal={handleCloseContactModal}
          handleOpenSuggestModal={handleOpenSuggestModal}
          handleCloseSuggestModal={handleCloseSuggestModal}
          handleContactLogged={handleContactLogged}
          handleSuggestionCreated={handleSuggestionCreated}
          // Datos y funciones para horario extra
          extraScheduleModalOpen={extraScheduleModalOpen}
          handleOpenExtraScheduleModal={handleOpenExtraScheduleModal}
          handleCloseExtraScheduleModal={handleCloseExtraScheduleModal}
          handleExtraScheduleCreated={handleExtraScheduleCreated}
          // Estados para indicadores especiales
          wasVehicleSelectedByExtraSchedule={wasVehicleSelectedByExtraSchedule}
          handleClearVehicleSelection={handleClearVehicleSelection}
          // Función para limpiar precio calculado
          clearCalculatedPrice={clearCalculatedPrice}
          data-oid="_x2:jp5"
        />
      )}
    </div>
  );
};

export default BookingsSection;
