import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { useBookingManagement } from "@/hooks/useBookingManagement";

// Importar los componentes refactorizados
import BookingsTable from "./bookings/BookingsTable";
import BookingsFilters from "./bookings/BookingsFilters";
import BookingDetailsModal from "./bookings/BookingDetailsModal";
import NewBookingModal from "./bookings/NewBookingModal";

const BookingsSection = () => {
  // Utilizar el hook personalizado para la gestión de reservas
  const {
    // Estados
    selectedBookingForDetails,
    isBookingDetailsViewOpen,
    isNewBookingModalOpen,
    isLoading,
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
    priceBreakdown,
    routeInfo,
    
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
    setActiveTab(tab as 'client' | 'service' | 'details' | 'payment');
  };

  const validateFormTabWrapper = (tab: string) => {
    return validateFormTab(tab as 'client' | 'service' | 'details' | 'payment');
  };

  const handleNextTabWrapper = (currentTab: string) => {
    handleNextTab(currentTab as 'client' | 'service' | 'details');
  };

  const handleRouteTypeChangeWrapper = (type: string) => {
    handleRouteTypeChange(type as 'fixed' | 'flexible');
  };

  // Ejemplo de datos de reservas
  const bookingsData = [
    {
      id: "B1001",
      clientName: "María García",
      date: "Hoy, 15:30",
      fromTo: "Aeropuerto Barajas → Hotel Ritz",
      type: "one_way",
      vehicle: "Mercedes Clase S",
      driver: "Carlos Rodríguez",
      status: "pending",
      price: "185,00 €",
      hasIncident: false
    },
    {
      id: "B1002",
      clientName: "John Smith",
      date: "Hoy, 16:45",
      fromTo: "Hotel Palace → Restaurante DiverXO",
      type: "hourly",
      vehicle: "BMW 7 Series",
      driver: "Laura Martínez",
      status: "confirmed",
      price: "240,00 €",
      hasIncident: false
    },
    {
      id: "B1003",
      clientName: "Alberto Ruiz",
      date: "Hoy, 18:00",
      fromTo: "Oficina Central → Aeropuerto",
      type: "one_way",
      vehicle: "Audi A8",
      driver: "Pendiente asignar",
      status: "pending",
      price: "165,00 €",
      hasIncident: true,
      incidentType: "change"
    },
    {
      id: "B1004",
      clientName: "Emma Watson",
      date: "Hoy, 20:15",
      fromTo: "Teatro Real → Hotel Four Seasons",
      type: "one_way",
      vehicle: "Mercedes Clase V",
      driver: "Javier López",
      status: "in_progress",
      price: "120,00 €",
      hasIncident: false
    },
    {
      id: "B1005",
      clientName: "Carlos Sánchez",
      date: "Mañana, 08:30",
      fromTo: "Hotel Westin → Centro Convenciones IFEMA",
      type: "round_trip",
      vehicle: "BMW X7",
      driver: "Pendiente asignar",
      status: "confirmed",
      price: "310,00 €",
      hasIncident: false
    },
    {
      id: "B1006",
      clientName: "Sarah Johnson",
      date: "Mañana, 10:00",
      fromTo: "Aeropuerto → Hotel W Barcelona",
      type: "one_way",
      vehicle: "Mercedes Clase E",
      driver: "Miguel Ángel Pérez",
      status: "confirmed",
      price: "195,00 €",
      hasIncident: true,
      incidentType: "delay"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar reserva..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleOpenNewBookingModal}>
            <PlusCircle size={18} className="mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Filtros y estadísticas rápidas */}
      <BookingsFilters />
        
        {/* Tabla de reservas */}
      <BookingsTable 
        bookingsData={bookingsData} 
        handleViewBookingDetails={handleViewBookingDetails} 
      />

      {/* Panel para seguimiento en tiempo real de servicios en progreso */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        {/* ... contenido de seguimiento en tiempo real ... */}
      </div>
      
      {/* Panel para incidencias y alertas */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        {/* ... contenido de incidencias y alertas ... */}
      </div>

      {/* Modal de detalles de reserva */}
      {isBookingDetailsViewOpen && (
        <BookingDetailsModal
          selectedBookingForDetails={selectedBookingForDetails}
          handleCloseBookingDetails={handleCloseBookingDetails}
        />
      )}

      {/* Modal de nueva reserva */}
      {isNewBookingModalOpen && (
        <NewBookingModal
          isNewBookingModalOpen={isNewBookingModalOpen}
          handleCloseNewBookingModal={handleCloseNewBookingModal}
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
        />
      )}
    </div>
  );
};

export default BookingsSection; 