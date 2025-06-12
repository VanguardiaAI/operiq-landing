import { Button } from "@/components/ui/button";
import { Search, Check, AlertCircle, Car, MapPin, DollarSign, Clock, Phone, User, Image } from "lucide-react";
import type { FixedRoute, VehicleAvailabilityResult } from "@/hooks/useBookingManagement";
import { priceCalculationService } from "@/services/priceCalculationService";
import ContactDriverModal from "./ContactDriverModal";
import SuggestScheduleModal from "./SuggestScheduleModal";
import AddExtraScheduleModal from "./AddExtraScheduleModal";
import { useRef, useEffect, useState } from "react";

type ServiceTabProps = {
  newBookingFormData: any;
  validationErrors: any;
  handleFormChange: (section: string, field: string, value: any) => void;
  routeType: 'fixed' | 'flexible';
  handleRouteTypeChange: (type: 'fixed' | 'flexible') => void;
  handleSearchFixedRoutes: (query: string) => void;
  handleSelectFixedRoute: (route: any) => void;
  isSearchingRoutes: boolean;
  routeSearchResults: any[];
  selectedRoute: any;
  handleSearchPickupAddress: (query: string) => void;
  handleSelectPickupAddress: (address: any) => void;
  handleSearchDropoffAddress: (query: string) => void;
  handleSelectDropoffAddress: (address: any) => void;
  pickupAddressResults: any[];
  isSearchingPickupAddress: boolean;
  dropoffAddressResults: any[];
  isSearchingDropoffAddress: boolean;
  handleCheckVehicleAvailability: (coordinates: any, location: string) => void;
  isCheckingAvailability: boolean;
  availabilityResults: any;
  setActiveTab: (tab: 'client' | 'service' | 'details' | 'payment') => void;
  handleNextTab: (currentTab: 'client' | 'service' | 'details') => void;
  handleCalculatePrice?: () => void;
  isCalculatingPrice?: boolean;
  canCalculatePrice?: () => boolean;
  // Nuevas props para contacto y sugerencias
  contactModalOpen: boolean;
  suggestModalOpen: boolean;
  selectedVehicleForAction: any;
  handleOpenContactModal: (vehicle: any) => void;
  handleCloseContactModal: () => void;
  handleOpenSuggestModal: (vehicle: any) => void;
  handleCloseSuggestModal: () => void;
  handleContactLogged: (contactData: any) => void;
  handleSuggestionCreated: (suggestionData: any) => void;
  // Nuevas props para horario extra
  extraScheduleModalOpen: boolean;
  handleOpenExtraScheduleModal: (vehicle: any) => void;
  handleCloseExtraScheduleModal: () => void;
  handleExtraScheduleCreated: (scheduleData: any) => void;
  
  // Props para indicadores especiales
  wasVehicleSelectedByExtraSchedule?: boolean;
  handleClearVehicleSelection?: () => void;
  
  // Función para limpiar precio calculado
  clearCalculatedPrice?: () => void;
};

const ServiceTab = ({
  newBookingFormData,
  validationErrors,
  handleFormChange,
  routeType,
  handleRouteTypeChange,
  handleSearchFixedRoutes,
  handleSelectFixedRoute,
  isSearchingRoutes,
  routeSearchResults,
  selectedRoute,
  handleSearchPickupAddress,
  handleSelectPickupAddress,
  handleSearchDropoffAddress,
  handleSelectDropoffAddress,
  pickupAddressResults,
  isSearchingPickupAddress,
  dropoffAddressResults,
  isSearchingDropoffAddress,
  handleCheckVehicleAvailability,
  isCheckingAvailability,
  availabilityResults,
  setActiveTab,
  handleNextTab,
  handleCalculatePrice,
  isCalculatingPrice,
  canCalculatePrice,
  contactModalOpen,
  suggestModalOpen,
  selectedVehicleForAction,
  handleOpenContactModal,
  handleCloseContactModal,
  handleOpenSuggestModal,
  handleCloseSuggestModal,
  handleContactLogged,
  handleSuggestionCreated,
  extraScheduleModalOpen,
  handleOpenExtraScheduleModal,
  handleCloseExtraScheduleModal,
  handleExtraScheduleCreated,
  
  // Estados para indicadores especiales
  wasVehicleSelectedByExtraSchedule,
  handleClearVehicleSelection,
  
  // Función para limpiar precio calculado
  clearCalculatedPrice
}: ServiceTabProps) => {
  // Estados para controlar la visibilidad de los desplegables
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  
  // Referencias para los desplegables
  const pickupDropdownRef = useRef<HTMLDivElement>(null);
  const dropoffDropdownRef = useRef<HTMLDivElement>(null);
  
  // Efecto para manejar clics fuera de los desplegables
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupDropdownRef.current && !pickupDropdownRef.current.contains(event.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (dropoffDropdownRef.current && !dropoffDropdownRef.current.contains(event.target as Node)) {
        setShowDropoffDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const hasSelectedVehicle = !!newBookingFormData.vehicle?.id;
  const hasPriceCalculated = !!newBookingFormData.payment?.priceBreakdown;
  
  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };
  
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours} h ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
    }
    
    return `${minutes} min`;
  };

  const formatTimeSlot = (timeSlot: { start_time: string; end_time: string; date?: string }) => {
    const formatTime = (time: string) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    const dateStr = timeSlot.date 
      ? new Date(timeSlot.date).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      : '';

    return `${formatTime(timeSlot.start_time)} - ${formatTime(timeSlot.end_time)}${dateStr ? ` (${dateStr})` : ''}`;
  };

  // Funciones wrapper para manejar la visibilidad de desplegables
  const handlePickupSearch = (query: string) => {
    handleSearchPickupAddress(query);
    setShowPickupDropdown(pickupAddressResults.length > 0 && query.length >= 3);
  };

  const handlePickupSelect = (address: any) => {
    handleSelectPickupAddress(address);
    setShowPickupDropdown(false);
  };

  const handleDropoffSearch = (query: string) => {
    handleSearchDropoffAddress(query);
    setShowDropoffDropdown(dropoffAddressResults.length > 0 && query.length >= 3);
  };

  const handleDropoffSelect = (address: any) => {
    handleSelectDropoffAddress(address);
  };

  // Efectos para manejar la visibilidad cuando cambian los resultados
  useEffect(() => {
    setShowPickupDropdown(pickupAddressResults.length > 0);
  }, [pickupAddressResults]);

  useEffect(() => {
    setShowDropoffDropdown(dropoffAddressResults.length > 0);
  }, [dropoffAddressResults]);

  // useEffect para debugging - rastrear cambios en availabilityResults
  useEffect(() => {
    console.log("🎯 ServiceTab - availabilityResults cambió:", {
      timestamp: new Date().toISOString(),
      availabilityResults: availabilityResults,
      isCheckingAvailability: isCheckingAvailability,
      hasData: !!availabilityResults,
      vehicleCount: availabilityResults?.total_vehicles_found || 0,
      availableVehicles: availabilityResults?.available_vehicles?.length || 0,
      alternativeVehicles: availabilityResults?.vehicles_with_alternative_schedules?.length || 0
    });
  }, [availabilityResults, isCheckingAvailability]);

  // Función para generar fechas alternativas
  const generateAlternativeDates = (currentDate: string) => {
    if (!currentDate) return [];
    
    const current = new Date(currentDate);
    const alternatives = [];
    
    // Generar 7 fechas alternativas (3 anteriores, 3 posteriores, excluyendo la actual)
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Saltar la fecha actual
      
      const altDate = new Date(current);
      altDate.setDate(current.getDate() + i);
      
      // Solo fechas futuras (o hoy mismo)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (altDate >= today) {
        alternatives.push({
          date: altDate.toISOString().split('T')[0],
          label: formatAlternativeDate(altDate),
          dayOfWeek: altDate.toLocaleDateString('es-ES', { weekday: 'long' })
        });
      }
    }
    
    return alternatives.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Función para formatear fechas alternativas
  const formatAlternativeDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  // Manejar selección de fecha alternativa
  const handleSelectAlternativeDate = (altDate: string) => {
    handleFormChange('service', 'pickup', {
      ...newBookingFormData.service.pickup,
      date: altDate
    });
    
    // La verificación será automática gracias al useEffect
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de servicio</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={newBookingFormData.service.type}
            onChange={(e) => handleFormChange('service', 'type', e.target.value)}
          >
            <option value="one_way">Un trayecto</option>
            <option value="round_trip">Ida y vuelta</option>
            <option value="hourly">Por horas</option>
            <option value="full_day">Día completo</option>
          </select>
        </div>
        
        {(newBookingFormData.service.type === 'hourly' || newBookingFormData.service.type === 'full_day') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración 
              {newBookingFormData.service.type === 'hourly' && (
                <span className="text-xs text-gray-500 ml-1">(mínimo 1 hora)</span>
              )}
            </label>
            <div className="space-y-2">
              {/* Opciones predefinidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '1 hora', value: 60 },
                  { label: '2 horas', value: 120 },
                  { label: '3 horas', value: 180 },
                  { label: '4 horas', value: 240 },
                  { label: '6 horas', value: 360 },
                  { label: '8 horas', value: 480 },
                  ...(newBookingFormData.service.type === 'full_day' ? [
                    { label: '12 horas', value: 720 },
                    { label: 'Día completo', value: 1440 }
                  ] : [])
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`px-3 py-2 text-xs border rounded-md transition-colors ${
                      newBookingFormData.service.duration === option.value
                        ? 'bg-black text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleFormChange('service', 'duration', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {/* Campo personalizado */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">O personalizado:</span>
                <input
                  type="number"
                  className={`flex-1 px-3 py-2 border ${validationErrors['service.duration'] ? 'border-gray-500' : 'border-gray-300'} rounded-md text-sm`}
                  value={newBookingFormData.service.duration || ''}
                  onChange={(e) => handleFormChange('service', 'duration', parseInt(e.target.value))}
                  placeholder="Minutos"
                  min="60"
                  step="30"
                />
                <span className="text-xs text-gray-500">min</span>
              </div>
            </div>
            {validationErrors['service.duration'] && (
              <p className="text-black text-xs mt-1">{validationErrors['service.duration']}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tipo de ruta</h3>
        <div className="flex space-x-4 mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-gray-600"
              checked={routeType === 'flexible'}
              onChange={() => handleRouteTypeChange('flexible')}
            />
            <span className="ml-2 text-sm">Ruta flexible</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-gray-600"
              checked={routeType === 'fixed'}
              onChange={() => handleRouteTypeChange('fixed')}
            />
            <span className="ml-2 text-sm">Ruta fija</span>
          </label>
        </div>

        {routeType === 'fixed' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar ruta fija</label>
            <div className="relative">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Busca por nombre, origen o destino..."
                  onChange={(e) => handleSearchFixedRoutes(e.target.value)}
                />
                {isSearchingRoutes && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
              
              {routeSearchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                  {routeSearchResults.map((route: FixedRoute) => (
                    <div 
                      key={route._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => handleSelectFixedRoute(route)}
                    >
                      <div className="font-medium">{route.name}</div>
                      <div className="text-sm text-gray-500">
                        <div>Origen: {route.origin.name}</div>
                        <div>Destino: {route.destination.name}</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Distancia: {route.distance}km • Tiempo estimado: {route.estimatedTime}min
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {routeSearchResults.length === 0 && !isSearchingRoutes && (
                <div className="text-sm text-gray-500 mt-2">
                  No se encontraron rutas que coincidan con tu búsqueda.
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Al seleccionar una ruta fija, los campos de origen y destino se autocompletarán automáticamente.</p>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de recogida</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de recogida</label>
            <input
              type="date"
              className={`w-full px-3 py-2 border ${validationErrors['service.pickup.date'] ? 'border-gray-500' : 'border-gray-300'} rounded-md text-sm`}
              value={newBookingFormData.service.pickup.date}
              onChange={(e) => handleFormChange('service', 'pickup.date', e.target.value)}
            />
            {validationErrors['service.pickup.date'] && (
              <p className="text-black text-xs mt-1">{validationErrors['service.pickup.date']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de recogida</label>
            <input
              type="time"
              className={`w-full px-3 py-2 border ${validationErrors['service.pickup.time'] ? 'border-gray-500' : 'border-gray-300'} rounded-md text-sm`}
              value={newBookingFormData.service.pickup.time}
              onChange={(e) => handleFormChange('service', 'pickup.time', e.target.value)}
            />
            {validationErrors['service.pickup.time'] && (
              <p className="text-black text-xs mt-1">{validationErrors['service.pickup.time']}</p>
            )}
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de recogida</label>
          <div className="relative" ref={pickupDropdownRef}>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className={`w-full pl-10 px-3 py-2 border ${validationErrors['service.pickup.location'] ? 'border-gray-500' : 'border-gray-300'} rounded-md text-sm`}
                value={newBookingFormData.service.pickup.location}
                onChange={(e) => {
                  handleFormChange('service', 'pickup.location', e.target.value);
                  handlePickupSearch(e.target.value);
                }}
                onFocus={() => {
                  if (pickupAddressResults.length > 0) setShowPickupDropdown(true);
                }}
                placeholder="Busca y selecciona una dirección"
              />
              {isSearchingPickupAddress && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            
            {showPickupDropdown && pickupAddressResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                {pickupAddressResults.map((address, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => handlePickupSelect(address)}
                  >
                    <div className="text-sm">{address.description}</div>
                    {address.structured_formatting && (
                      <div className="text-xs text-gray-500 mt-1">
                        {address.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {validationErrors['service.pickup.location'] && (
            <p className="text-black text-xs mt-1">{validationErrors['service.pickup.location']}</p>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de destino</h3>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lugar de destino {hasSelectedVehicle && !newBookingFormData.service.dropoff.location && <span className="text-black">*</span>}
          </label>
          <div className="relative" ref={dropoffDropdownRef}>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className={`w-full pl-10 px-3 py-2 border ${validationErrors['service.dropoff.location'] || (hasSelectedVehicle && !newBookingFormData.service.dropoff.location) ? 'border-gray-500' : 'border-gray-300'} rounded-md text-sm`}
                value={newBookingFormData.service.dropoff.location}
                onChange={(e) => {
                  handleFormChange('service', 'dropoff.location', e.target.value);
                  handleDropoffSearch(e.target.value);
                }}
                onFocus={() => {
                  if (dropoffAddressResults.length > 0) setShowDropoffDropdown(true);
                }}
                placeholder="Busca y selecciona una dirección"
                disabled={routeType === 'fixed' && selectedRoute !== null}
              />
              {isSearchingDropoffAddress && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            
            {showDropoffDropdown && dropoffAddressResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                {dropoffAddressResults.map((address, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => handleDropoffSelect(address)}
                  >
                    <div className="text-sm">{address.description}</div>
                    {address.structured_formatting && (
                      <div className="text-xs text-gray-500 mt-1">
                        {address.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {validationErrors['service.dropoff.location'] && (
            <p className="text-black text-xs mt-1">{validationErrors['service.dropoff.location']}</p>
          )}
          {hasSelectedVehicle && !newBookingFormData.service.dropoff.location && (
            <p className="text-black text-xs mt-1">
              <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
              Debe seleccionar un destino para calcular el precio del viaje
            </p>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Verificación de disponibilidad</h3>
          <div className="flex items-center space-x-2">
            {/* Indicador de verificación automática */}
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
              ✓ Verificación automática
            </span>
            {/* Botón manual como respaldo */}
            <Button 
              size="sm"
              variant="outline"
              disabled={
                !newBookingFormData.service.pickup.location || 
                !newBookingFormData.service.pickup.date || 
                !newBookingFormData.service.pickup.time ||
                isCheckingAvailability
              }
              onClick={() => handleCheckVehicleAvailability(
                newBookingFormData.service.pickup.coordinates,
                newBookingFormData.service.pickup.location
              )}
              className="text-xs flex items-center opacity-75 hover:opacity-100"
              title="Forzar verificación manual"
            >
              <Car className="h-3.5 w-3.5 mr-1" />
              {isCheckingAvailability ? 'Verificando...' : 'Verificar ahora'}
            </Button>
          </div>
        </div>
        
        {isCheckingAvailability && (
          <div className="bg-gray-100 rounded-md p-3 flex items-center text-sm text-blue-700 mb-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent mr-2"></div>
            Verificando disponibilidad de vehículos automáticamente...
          </div>
        )}
        
        {availabilityResults && !isCheckingAvailability && (
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <div className="font-medium text-gray-700 mb-2">
              Resumen de disponibilidad:
            </div>
            
            {/* Info de duración solicitada */}
            {(newBookingFormData.service.type === 'hourly' || newBookingFormData.service.type === 'full_day') && newBookingFormData.service.duration && (
              <div className="mb-3 p-2 bg-gray-100 rounded-md border border-blue-200">
                <div className="text-xs text-blue-700 font-medium">
                  Duración solicitada: {Math.floor(newBookingFormData.service.duration / 60)}h {newBookingFormData.service.duration % 60 > 0 && `${newBookingFormData.service.duration % 60}min`}
                  <span className="ml-2 text-gray-600">({newBookingFormData.service.duration} minutos)</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <span className="text-gray-500">Vehículos encontrados:</span>
                <span className="ml-1 font-medium">{availabilityResults.total_vehicles_found}</span>
              </div>
              <div>
                <span className="text-gray-500">En zonas fijas:</span> 
                <span className="ml-1 font-medium">{availabilityResults.fixed_zone_count}</span>
              </div>
              <div>
                <span className="text-gray-500">En rutas flexibles:</span> 
                <span className="ml-1 font-medium">{availabilityResults.flexible_route_count}</span>
              </div>
            </div>
            
            {availabilityResults.available_vehicles && availabilityResults.available_vehicles.length > 0 ? (
              <div>
                <div className="font-medium text-gray-700 mb-2">Vehículos disponibles:</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availabilityResults.available_vehicles.map((vehicle: any, index: number) => {
                    const vehicleId = vehicle.id || vehicle.vehicle_id || "Vehículo sin ID";
                    const model = vehicle.model || vehicle.vehicle_data?.model || "Vehículo sin modelo";
                    const licensePlate = vehicle.license_plate || vehicle.vehicle_data?.licensePlate;
                    const driverName = vehicle.driver_name || vehicle.vehicle_data?.driver?.name || "Conductor no asignado";
                    const driverPhoto = vehicle.driver_photo || vehicle.vehicle_data?.driver?.photo;
                    const vehicleImage = vehicle.image || vehicle.imageUrl || vehicle.vehicle_data?.image || vehicle.vehicle_data?.imageUrl;
                    const driverPhone = vehicle.driver_phone || vehicle.vehicle_data?.driver?.phone;
                    const driverRating = vehicle.driver_rating || vehicle.vehicle_data?.driver?.rating || 0;
                    const availabilityType = vehicle.availability_type || "flexible_route";
                    const distanceKm = vehicle.distance_km;
                    const zoneName = vehicle.zone_name;
                    
                    return (
                      <div key={index} className={`bg-white rounded-md p-3 border ${newBookingFormData.vehicle?.id === vehicleId ? 'border-red-600 bg-gray-100' : 'border-green-200'} shadow-sm cursor-pointer transition-all hover:border-gray-500 hover:shadow-md`}
                        onClick={() => {
                          const vehicleObj = {
                            id: vehicleId,
                            name: model
                          };
                          
                          const driverObj = {
                            id: vehicle.driver_id || '',
                            name: driverName
                          };
                          
                          handleFormChange('vehicle', 'id', vehicleObj.id);
                          handleFormChange('vehicle', 'name', vehicleObj.name);
                          handleFormChange('driver', 'id', driverObj.id);
                          handleFormChange('driver', 'name', driverObj.name);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Vehicle Image */}
                          <div className="w-16 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                            {vehicleImage ? (
                              <img 
                                src={vehicleImage} 
                                alt={model}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  img.style.display = 'none';
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full ${vehicleImage ? 'hidden' : 'flex'} items-center justify-center bg-gray-200`}>
                              <Car className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>

                          {/* Vehicle Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-800 flex items-center">
                                  {model}
                                  {licensePlate && (
                                    <span className="text-xs ml-2 text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                      {licensePlate}
                                    </span>
                                  )}
                                  {newBookingFormData.vehicle?.id === vehicleId && (
                                    <Check className="h-4 w-4 ml-2 text-gray-600" />
                                  )}
                                </div>
                                
                                {/* Driver Info */}
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden mr-2">
                                    {driverPhoto ? (
                                      <img 
                                        src={driverPhoto} 
                                        alt={driverName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-4 w-4 text-gray-400 m-1" />
                                    )}
                                  </div>
                                  <span className="font-medium">{driverName}</span>
                                  {driverRating > 0 && (
                                    <div className="ml-2 flex items-center text-xs text-yellow-600">
                                      ⭐ {driverRating}/5
                                    </div>
                                  )}
                                </div>

                                {/* Contact Info */}
                                {driverPhone && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    📞 {driverPhone}
                                  </div>
                                )}
                              </div>

                              {/* Type Badge & Availability Info */}
                              <div className="text-right">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                                  ${availabilityType === 'fixed_zone' ? 'bg-gray-200 text-purple-800' : 'bg-gray-200 text-blue-800'}`}
                                >
                                  {availabilityType === 'fixed_zone' ? 'Zona Fija' : 'Ruta Flexible'}
                                </span>
                                
                                {/* Información de disponibilidad para servicios por horas */}
                                {(newBookingFormData.service.type === 'hourly' || newBookingFormData.service.type === 'full_day') && vehicle.available_duration && (
                                  <div className="mt-1">
                                    <div className="text-xs text-green-600 font-medium flex items-center">
                                      ✓ Disponible por {Math.floor(vehicle.available_duration / 60)}h{vehicle.available_duration % 60 > 0 && ` ${vehicle.available_duration % 60}min`}
                                    </div>
                                    {vehicle.estimated_end_time && (
                                      <div className="text-xs text-gray-500">
                                        Hasta las {vehicle.estimated_end_time}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {distanceKm && (
                                  <div className="mt-1 text-xs text-gray-500">{distanceKm} km</div>
                                )}
                                {zoneName && (
                                  <div className="mt-1 text-xs text-gray-500">Zona: {zoneName}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                No hay vehículos disponibles en esta ubicación y horario.
              </div>
            )}

            {/* Sección de vehículos con horarios alternativos */}
            {availabilityResults.vehicles_with_alternative_schedules && 
             availabilityResults.vehicles_with_alternative_schedules.length > 0 ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-amber-500" />
                  Vehículos en zona con horarios alternativos:
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availabilityResults.vehicles_with_alternative_schedules.map((vehicle: any, index: number) => {
                    const vehicleId = vehicle.id || vehicle.vehicle_id || "Vehículo sin ID";
                    const model = vehicle.model || vehicle.vehicle_data?.model || "Vehículo sin modelo";
                    const licensePlate = vehicle.license_plate || vehicle.vehicle_data?.licensePlate;
                    const driverName = vehicle.driver_name || vehicle.vehicle_data?.driver?.name || "Conductor no asignado";
                    const availabilityType = vehicle.availability_type || "flexible_route";
                    const distanceKm = vehicle.distance_km;
                    const zoneName = vehicle.zone_name;
                    const alternativeSlots = vehicle.alternative_time_slots || [];
                    const nextAvailable = vehicle.next_available_time;
                    const unavailableReason = vehicle.unavailable_reason;
                    
                    return (
                      <div key={`alt-${index}`} className="bg-amber-50 rounded-md p-3 border border-amber-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-800 flex items-center">
                              {model} 
                              {licensePlate && (
                                <span className="text-xs ml-1 text-gray-500">
                                  ({licensePlate})
                                </span>
                              )}
                              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                No disponible ahora
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 flex items-center mt-1">
                              <span>{driverName}</span>
                              {distanceKm && (
                                <span className="ml-2 text-gray-500">{distanceKm} km</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                              ${availabilityType === 'fixed_zone' ? 'bg-gray-200 text-purple-800' : 'bg-gray-200 text-blue-800'}`}
                            >
                              {availabilityType === 'fixed_zone' ? 'Zona Fija' : 'Ruta Flexible'}
                            </span>
                            {zoneName && (
                              <div className="mt-1 text-gray-500">Zona: {zoneName}</div>
                            )}
                          </div>
                        </div>

                        {unavailableReason && (
                          <div className="text-xs text-amber-700 mb-2 p-2 bg-amber-100 rounded">
                            <strong>Motivo:</strong> {unavailableReason}
                          </div>
                        )}

                        {nextAvailable && (
                          <div className="text-xs text-green-700 mb-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            <strong>Próxima disponibilidad:</strong> {nextAvailable}
                          </div>
                        )}

                        {alternativeSlots.length > 0 && (
                          <div className="text-xs">
                            <div className="font-medium text-gray-700 mb-1">Horarios disponibles hoy:</div>
                                                         <div className="flex flex-wrap gap-1">
                               {alternativeSlots.slice(0, 3).map((slot: any, slotIndex: number) => (
                                 <span 
                                   key={slotIndex}
                                   className="bg-gray-200 text-green-800 px-2 py-1 rounded text-xs"
                                 >
                                   {formatTimeSlot(slot)}
                                 </span>
                               ))}
                              {alternativeSlots.length > 3 && (
                                <span className="text-gray-500 text-xs">
                                  +{alternativeSlots.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mensaje cuando no hay horarios alternativos */}
                        {alternativeSlots.length === 0 && (
                          <div className="text-xs bg-gray-200 text-gray-700 p-2 rounded mt-2">
                            <div className="flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              <span className="font-medium">Sin horarios disponibles para esta fecha</span>
                            </div>
                            <div className="mt-1 text-gray-600">
                              Este conductor no tiene slots libres el <strong>{newBookingFormData.service.pickup.date}</strong>. 
                              Considera cambiar la fecha o contactar directamente.
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-amber-200">
                          <div className="text-xs text-gray-600">
                            💡 Este vehículo trabaja en la zona pero no está disponible en el horario solicitado
                          </div>
                          <div className="flex space-x-1 flex-wrap">
                            <button 
                              className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenContactModal(vehicle);
                              }}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Llamar
                            </button>
                            <button 
                              className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSuggestModal(vehicle);
                              }}
                            >
                              Sugerir horario
                            </button>
                            <button 
                              className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenExtraScheduleModal(vehicle);
                              }}
                              title="Agregar horario extra cuando el conductor acepta trabajar fuera de su horario"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              + Horario extra
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                  <strong>Consejo:</strong> Estos vehículos están en la zona pero ocupados. Considera contactar al conductor 
                  para verificar disponibilidad de última hora o sugerir un horario alternativo al cliente.
                </div>
                
                {/* Mensaje cuando ningún vehículo alternativo tiene horarios disponibles */}
                {availabilityResults.vehicles_with_alternative_schedules && 
                 availabilityResults.vehicles_with_alternative_schedules.every((vehicle: any) => 
                   !vehicle.alternative_time_slots || vehicle.alternative_time_slots.length === 0
                 ) && (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded p-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800 mb-1">
                          Vehículos encontrados pero sin horarios disponibles
                        </p>
                        <p className="text-orange-700">
                          Se encontraron {availabilityResults.vehicles_with_alternative_schedules.length} vehículo(s) en la zona, 
                          pero ninguno tiene disponibilidad para el <strong>{newBookingFormData.service.pickup.date}</strong>.
                        </p>
                        <p className="text-gray-600 mt-2 text-xs">
                          💡 <strong>Sugerencia:</strong> Prueba cambiar la fecha o contacta directamente a los conductores 
                          para consultar disponibilidad especial.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Mostrar mensaje específico cuando no hay vehículos disponibles ni horarios alternativos
              availabilityResults.total_vehicles_found === 0 && 
              (!availabilityResults.vehicles_with_alternative_schedules || 
               availabilityResults.vehicles_with_alternative_schedules.length === 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-100 border border-gray-200 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800 mb-2">
                          Sin disponibilidad para esta fecha
                        </h3>
                        <div className="text-sm text-gray-700 space-y-2">
                          <p>
                            No hay vehículos disponibles para <strong>{newBookingFormData.service.pickup.date}</strong> 
                            {newBookingFormData.service.pickup.time && (
                              <span> a las <strong>{newBookingFormData.service.pickup.time}</strong></span>
                            )} en la ubicación seleccionada.
                          </p>
                          <div className="bg-gray-200 rounded p-3 mt-3">
                            <p className="font-medium text-gray-800 mb-1">💡 Recomendaciones:</p>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                              <li>Selecciona una <strong>fecha diferente</strong></li>
                              <li>Prueba con un <strong>horario diferente</strong> (mañana o tarde)</li>
                              <li>Considera una <strong>ubicación cercana</strong> diferente</li>
                            </ul>
                          </div>
                          <div className="bg-gray-100 border border-blue-200 rounded p-3 mt-3">
                            <p className="text-blue-800 text-xs">
                              <span className="font-medium">📞 ¿Urgente?</span> Contacta a nuestro equipo de soporte para verificar disponibilidad de última hora o explorar opciones especiales.
                            </p>
                          </div>
                          
                          {/* Sección de fechas alternativas */}
                          {newBookingFormData.service.pickup.date && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                              <p className="font-medium text-green-800 mb-2">📅 Prueba estas fechas cercanas:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {generateAlternativeDates(newBookingFormData.service.pickup.date).slice(0, 6).map((altDate) => (
                                  <button
                                    key={altDate.date}
                                    type="button"
                                    onClick={() => handleSelectAlternativeDate(altDate.date)}
                                    className="text-xs bg-white border border-green-300 rounded px-2 py-1.5 hover:bg-gray-200 hover:border-green-400 transition-colors text-left"
                                  >
                                    <div className="font-medium text-green-800">{altDate.label}</div>
                                    <div className="text-green-600 capitalize">{altDate.dayOfWeek}</div>
                                  </button>
                                ))}
                              </div>
                              <p className="text-green-700 text-xs mt-2">
                                Haz clic en cualquier fecha para verificar disponibilidad automáticamente
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
            
            {availabilityResults.message && (
              <div className="mt-2 text-gray-500 text-xs">
                {availabilityResults.message}
              </div>
            )}
          </div>
        )}
        
        {/* Mensaje informativo sobre verificación automática */}
        {!isCheckingAvailability && !availabilityResults && (
          <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600">
            <div className="flex items-center">
              <span className="text-black mr-2">ℹ️</span>
              La disponibilidad se verifica automáticamente cuando completas la ubicación, fecha y hora.
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehículo seleccionado</h3>
        {newBookingFormData.vehicle?.id ? (
          <div className={`rounded-md p-3 border ${
            wasVehicleSelectedByExtraSchedule 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            {wasVehicleSelectedByExtraSchedule && (
              <div className="mb-2 flex items-center text-emerald-700 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <span className="font-medium">✨ Conductor aceptó horario extra</span>
              </div>
            )}
            <div className="font-medium text-gray-800">{newBookingFormData.vehicle.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              Conductor: {newBookingFormData.driver?.name || "Pendiente de asignar"}
            </div>
            {wasVehicleSelectedByExtraSchedule && (
              <div className="text-xs text-emerald-600 mt-1">
                Este conductor ha aceptado trabajar fuera de su horario habitual para atender esta solicitud.
              </div>
            )}
            <div className="flex justify-end mt-3">
              <button 
                type="button"
                className="text-xs text-gray-600 hover:text-gray-800"
                onClick={handleClearVehicleSelection || (() => {
                  handleFormChange('vehicle', 'id', '');
                  handleFormChange('vehicle', 'name', '');
                  handleFormChange('driver', 'id', '');
                  handleFormChange('driver', 'name', '');
                })}
              >
                Eliminar selección
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-amber-600 flex items-center p-3 bg-amber-50 rounded-md border border-amber-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            No has seleccionado ningún vehículo. Te recomendamos volver al paso anterior y seleccionar uno.
          </div>
        )}
      </div>
      
      {hasSelectedVehicle && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Cálculo de tarifa</h3>
            {canCalculatePrice && (
              <Button 
                size="sm"
                variant="outline"
                disabled={!canCalculatePrice?.() || isCalculatingPrice}
                onClick={handleCalculatePrice}
                className="text-xs flex items-center"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                {hasPriceCalculated ? 'Recalcular precio' : 'Calcular precio'}
              </Button>
            )}
          </div>
          
          {isCalculatingPrice && (
            <div className="bg-gray-100 rounded-md p-3 flex items-center text-sm text-blue-700">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent mr-2"></div>
              Calculando tarifa según la distancia...
            </div>
          )}
          
          {hasSelectedVehicle && !newBookingFormData.service.dropoff.location && !isCalculatingPrice && (
            <div className="bg-amber-50 rounded-md p-3 text-sm text-amber-700 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Para calcular la tarifa, seleccione primero una dirección de destino.
            </div>
          )}
          
          {hasPriceCalculated && !isCalculatingPrice && (
            <div className="bg-white rounded-md border border-green-200 p-3 text-sm">
              <div className="font-medium text-gray-700 mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                  Tarifa calculada:
                </div>
                {/* Indicador de que el precio puede necesitar recalcularse */}
                <div className="text-xs text-amber-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>Los precios pueden cambiar si modificas origen, destino o tipo de servicio</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded-md mb-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Distancia:</span>
                    <span className="ml-1 font-medium">
                      {newBookingFormData.payment.priceBreakdown.is_round_trip ? (
                        <>
                          {priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)}
                          <span className="text-xs text-gray-400 block">
                            ({priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.one_way_distance_km || 0)} × 2)
                          </span>
                        </>
                      ) : (
                        priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tiempo estimado:</span>
                    <span className="ml-1 font-medium">
                      {formatDuration(newBookingFormData.payment.routeInfo.duration)}
                      {newBookingFormData.payment.priceBreakdown.is_round_trip && (
                        <span className="text-xs text-gray-400 block">
                          (Solo ida, vuelta similar)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Tarifa base:</span>
                  <span>{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.base_fare)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    Cargo por distancia
                    {newBookingFormData.payment.priceBreakdown.is_round_trip && " (ida y vuelta)"}:
                  </span>
                  <span>
                    {priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.distance_charge)}
                    {newBookingFormData.payment.priceBreakdown.is_round_trip && (
                      <div className="text-xs text-gray-400">
                        {priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)} total
                      </div>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium pt-1 border-t border-gray-100">
                  <span>Subtotal:</span>
                  <span>{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">IVA ({newBookingFormData.payment.priceBreakdown.tax_percentage}%):</span>
                  <span>{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                  <span>TOTAL:</span>
                  <span className="text-gray-600">{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.total)}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {newBookingFormData.payment.priceBreakdown.is_round_trip && (
                  <div className="mb-2 p-2 bg-gray-100 rounded border-l-4 border-blue-400">
                    <strong>Viaje de ida y vuelta:</strong> El precio incluye tanto el trayecto de ida como el de vuelta. 
                    La distancia total calculada es de {priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)}.
                  </div>
                )}
                Los precios incluyen todos los impuestos aplicables. El precio final puede variar ligeramente en función 
                de cambios en la ruta o tiempo de espera adicional.
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          onClick={() => setActiveTab('client')}
          className="text-sm"
        >
          Anterior: Cliente
        </Button>
        <Button 
          className="bg-black hover:bg-gray-800 text-sm"
          onClick={() => handleNextTab('service')}
          disabled={hasSelectedVehicle && !hasPriceCalculated}
        >
          Siguiente: Detalles
        </Button>
      </div>

      {/* Modales */}
      <ContactDriverModal
        isOpen={contactModalOpen}
        onClose={handleCloseContactModal}
        vehicle={selectedVehicleForAction}
        pickupDate={`${newBookingFormData.service.pickup.date} ${newBookingFormData.service.pickup.time}`}
        pickupLocation={newBookingFormData.service.pickup.location}
        onContactLogged={handleContactLogged}
      />

      <SuggestScheduleModal
        isOpen={suggestModalOpen}
        onClose={handleCloseSuggestModal}
        vehicle={selectedVehicleForAction}
        originalPickupDate={`${newBookingFormData.service.pickup.date}T${newBookingFormData.service.pickup.time}`}
        pickupLocation={newBookingFormData.service.pickup.location}
        dropoffLocation={newBookingFormData.service.dropoff.location}
        clientId={newBookingFormData.client.id}
        onSuggestionCreated={handleSuggestionCreated}
      />

      <AddExtraScheduleModal
        isOpen={extraScheduleModalOpen}
        onClose={handleCloseExtraScheduleModal}
        vehicle={selectedVehicleForAction}
        originalPickupDate={`${newBookingFormData.service.pickup.date}T${newBookingFormData.service.pickup.time}`}
        originalPickupTime={newBookingFormData.service.pickup.time}
        pickupLocation={newBookingFormData.service.pickup.location}
        dropoffLocation={newBookingFormData.service.dropoff.location}
        clientId={newBookingFormData.client.id}
        onExtraScheduleCreated={handleExtraScheduleCreated}
      />
    </div>
  );
};

export default ServiceTab; 