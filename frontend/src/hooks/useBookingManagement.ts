import { useState, useEffect, useCallback } from "react";
import { googleMapsService } from "@/services/googleMapsService";
import { priceCalculationService, PriceBreakdown, RouteInfo, ServiceType } from "@/services/priceCalculationService";
import axios from "axios";

// Tipos para exportación desde el hook
export type BookingBasic = {
  id: string;
  clientName: string;
  date: string;
  fromTo: string;
  type: 'one_way' | 'round_trip' | 'hourly' | 'full_day';
  vehicle: string;
  driver: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  price: string;
  hasIncident?: boolean;
  incidentType?: 'delay' | 'change' | 'other';
};

export type FixedRouteBasic = {
  _id: string;
  name: string;
  origin: {
    name: string;
    coordinates: [number, number];
  };
  destination: {
    name: string;
    coordinates: [number, number];
  };
  distance: number;
  estimatedTime: number;
};

export type VehicleAvailabilityResultBasic = {
  total_vehicles_found: number;
  fixed_zone_count: number;
  flexible_route_count: number;
  available_vehicles: Array<{
    id?: string;
    vehicle_id?: string;
    model?: string;
    vehicle_data?: {
      model?: string;
      licensePlate?: string;
      driver?: {
        name?: string;
      };
    };
    license_plate?: string;
    driver_name?: string;
    driver_id?: string;
    availability_type?: 'fixed_zone' | 'flexible_route';
    distance_km?: number;
    zone_name?: string;
  }>;
  message?: string;
};

// Interfaces para la gestión de reservas
export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  pickupDateTime: string;
  pickupLocation: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffLocation: string;
  dropoffCoordinates?: { lat: number; lng: number };
  stops?: { location: string; coordinates?: { lat: number; lng: number } }[];
  serviceType: 'one_way' | 'round_trip' | 'hourly' | 'full_day';
  vehicleId?: string;
  vehicleInfo?: {
    brand: string;
    model: string;
    licensePlate: string;
    image?: string;
  };
  driverId?: string;
  driverInfo?: {
    name: string;
    phone: string;
    photo?: string;
  };
  passengers: number;
  luggage: number;
  price: {
    amount: number;
    currency: string;
    paymentMethod: 'credit_card' | 'paypal' | 'cash' | 'bank_transfer' | 'invoice';
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  };
  notes?: string;
  specialRequests?: string[];
  createdAt: string;
  updatedAt: string;
  incidentHistory?: {
    timestamp: string;
    type: 'delay' | 'cancellation' | 'change' | 'complaint' | 'other';
    description: string;
    resolvedBy?: string;
    resolution?: string;
    status: 'pending' | 'in_progress' | 'resolved';
  }[];
}

// Interfaz para resultados de direcciones de Google Maps
export interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

// Tipo para el formulario de nueva reserva
export interface NewBookingFormData {
  client: {
    id?: string;
    name: string;
    phone: string;
    email: string;
  };
  service: {
    type: 'one_way' | 'round_trip' | 'hourly' | 'full_day';
    routeType: 'fixed' | 'flexible';
    fixedRouteId?: string;
    pickup: {
      date: string;
      time: string;
      location: string;
      coordinates?: [number, number]; // [longitud, latitud]
    };
    dropoff: {
      location: string;
      coordinates?: [number, number];
    };
    stops?: {
      location: string;
      coordinates?: [number, number];
    }[];
    duration?: number; // En minutos (para servicios por hora)
  };
  details: {
    passengers: number;
    luggage: string;
    specialNotes: string;
    specialRequests: string[];
    vehicleCategory?: string;
    vehicleColor?: string;
    features?: string[];
  };
  vehicle?: {
    id: string;
    name: string;
  };
  driver?: {
    id: string;
    name: string;
  };
  payment: {
    amount: number;
    currency: string;
    method: 'credit_card' | 'paypal' | 'cash' | 'bank_transfer' | 'invoice' | 'corporate_account';
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    // Campos adicionales para tarjeta de crédito
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    // Campos para cuenta corporativa
    accountId?: string;
    // Datos de facturación
    billingName?: string;
    billingAddress?: string;
    billingEmail?: string;
    taxId?: string;
    // Nuevo - Desglose de precios actualizado
    priceBreakdown?: {
      base_fare: number;
      distance_charge: number;
      subtotal: number;
      tax_percentage: number;
      tax_amount: number;
      total: number;
      // Nuevos campos para ida y vuelta
      total_distance_km: number;
      is_round_trip: boolean;
      one_way_distance_km?: number;
    };
    routeInfo?: {
      distance: number;
      duration: number;
    };
  };
}

// Interfaz para rutas fijas
export interface FixedRoute {
  _id: string;
  name: string;
  origin: {
    name: string;
    location: {
      coordinates: [number, number];
      type: string;
    };
  };
  destination: {
    name: string;
    location: {
      coordinates: [number, number];
      type: string;
    };
  };
  vehicle?: {
    id: string;
    licensePlate: string;
    model: string;
    imageUrl: string;
  };
  driver?: {
    id: string;
    name: string;
    photo: string;
  };
  pricing?: {
    standard: number;
    night: number;
    holiday: number;
    currency: string;
  };
  availability?: {
    timeSlots: string[];
    days: string[];
  };
  status?: string;
  distance: number;
  estimatedTime: number;
  vehicles?: Array<{
    id: string;
    licensePlate: string;
    model: string;
    driver: {
      id: string;
      name: string;
      photo: string;
    };
  }>;
  drivers?: Array<{
    id: string;
    name: string;
    photo: string;
  }>;
}

// Interfaz para los resultados de disponibilidad de vehículos
export interface VehicleAvailabilityResult {
  total_vehicles_found: number;
  fixed_zone_count: number;
  flexible_route_count: number;
  available_vehicles: Array<{
    // Propiedades que vienen del backend según availablity.py
    id?: string;
    vehicle_id?: string;
    driver_id?: string;
    model?: string;
    license_plate?: string;
    driver_name?: string;
    driver_photo?: string;
    availability_type: string;
    zone_name?: string;
    distance_km?: number;
    vehicle_data?: any;
    pricing?: any;
  }>;
  // Nuevos campos para vehículos con horarios alternativos
  vehicles_with_alternative_schedules?: Array<{
    id?: string;
    vehicle_id?: string;
    driver_id?: string;
    model?: string;
    license_plate?: string;
    driver_name?: string;
    driver_photo?: string;
    availability_type: string;
    zone_name?: string;
    distance_km?: number;
    vehicle_data?: any;
    pricing?: any;
    alternative_time_slots?: Array<{
      start_time: string;
      end_time: string;
      date?: string;
    }>;
    next_available_time?: string;
    unavailable_reason?: string;
  }>;
  message?: string; // Mensaje opcional para mostrar al usuario
}

export const useBookingManagement = () => {
  // Estados para la gestión de reservas
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [isBookingDetailsViewOpen, setIsBookingDetailsViewOpen] = useState(false);
  
  // Estado para controlar el modal de nueva reserva
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newBookingFormData, setNewBookingFormData] = useState<NewBookingFormData>({
    client: {
      name: '',
      phone: '',
      email: '',
    },
    service: {
      type: 'one_way',
      routeType: 'flexible',
      pickup: {
        date: '',
        time: '',
        location: '',
      },
      dropoff: {
        location: '',
      },
    },
    details: {
      passengers: 1,
      luggage: '',
      specialNotes: '',
      specialRequests: [],
    },
    payment: {
      amount: 0,
      currency: 'EUR',
      method: 'credit_card',
      status: 'pending',
    },
  });
  
  // Estado para la pestaña activa en el formulario de nueva reserva
  const [activeTab, setActiveTab] = useState<'client' | 'service' | 'details' | 'payment'>('client');

  // Estado para controlar errores de validación
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Estados para búsqueda de clientes, vehículos y conductores
  const [clientSearchResults, setClientSearchResults] = useState<any[]>([]);
  const [isSearchingClient, setIsSearchingClient] = useState(false);

  // Estados para rutas fijas
  const [routeType, setRouteType] = useState<'fixed' | 'flexible'>('flexible');
  const [fixedRoutes, _setFixedRoutes] = useState<FixedRoute[]>([]);
  const [isSearchingRoutes, setIsSearchingRoutes] = useState(false);
  const [routeSearchResults, setRouteSearchResults] = useState<FixedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<FixedRoute | null>(null);

  // Estados para autocompletado de direcciones
  const [pickupAddressResults, setPickupAddressResults] = useState<PlaceResult[]>([]);
  const [isSearchingPickupAddress, setIsSearchingPickupAddress] = useState(false);
  const [dropoffAddressResults, setDropoffAddressResults] = useState<PlaceResult[]>([]);
  const [isSearchingDropoffAddress, setIsSearchingDropoffAddress] = useState(false);

  // Configurar países para restringir las búsquedas (opcional)
  const [restrictedCountries, setRestrictedCountries] = useState<string[]>(() => {
    const countriesConfig = import.meta.env.VITE_GOOGLE_MAPS_COUNTRIES || '';
    return countriesConfig ? countriesConfig.split(',').map((c: string) => c.trim()) : [];
  });

  // Estados para la verificación de disponibilidad
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState<VehicleAvailabilityResult | null>(null);

  // Nuevos estados para el cálculo de tarifas
  const [isCalculatingPrice, setIsCalculatingPrice] = useState<boolean>(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Cargar el script de Google Maps al iniciar
  useEffect(() => {
    googleMapsService.loadMapsScript().catch(console.error);
  }, []);

  // Función para manejar la visualización de detalles de reserva
  const handleViewBookingDetails = (booking: any) => {
    // Convertir el booking de la tabla al formato completo de la interfaz Booking
    const bookingDetail: Booking = {
      id: booking.id,
      clientId: `client_${Math.floor(Math.random() * 1000)}`,
      clientName: booking.clientName,
      clientPhone: "+34 612 345 678",
      clientEmail: `${booking.clientName.toLowerCase().replace(' ', '.')}@email.com`,
      status: booking.status as any,
      pickupDateTime: new Date().toISOString(), // Simular fecha/hora
      pickupLocation: booking.fromTo.split('→')[0].trim(),
      dropoffLocation: booking.fromTo.split('→')[1].trim(),
      serviceType: booking.type as any,
      passengers: 2,
      luggage: 1,
      price: {
        amount: parseFloat(booking.price.replace(/[^\d,]/g, '').replace(',', '.')),
        currency: "EUR",
        paymentMethod: 'credit_card',
        paymentStatus: 'pending'
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      updatedAt: new Date().toISOString(),
      notes: booking.hasIncident ? "Cliente VIP. Solicita agua embotellada." : "",
      specialRequests: booking.hasIncident ? ["Ayuda con el equipaje", "Música clásica"] : [],
      incidentHistory: booking.hasIncident ? [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: booking.incidentType || 'other',
          description: booking.incidentType === 'delay' 
            ? "El vuelo del cliente llega con retraso" 
            : booking.incidentType === 'change'
            ? "Cliente solicita cambio de hora"
            : "Incidencia reportada",
          status: 'pending'
        }
      ] : []
    };
    
    setSelectedBookingForDetails(bookingDetail);
    setIsBookingDetailsViewOpen(true);
  };

  const handleCloseBookingDetails = () => {
    setIsBookingDetailsViewOpen(false);
    setSelectedBookingForDetails(null);
  };
  
  // Función para abrir el modal de nueva reserva
  const handleOpenNewBookingModal = () => {
    setIsNewBookingModalOpen(true);
  };
  
  // Función para cerrar el modal de nueva reserva
  const handleCloseNewBookingModal = () => {
    setIsNewBookingModalOpen(false);
    // Resetear el formulario
    setNewBookingFormData({
      client: {
        name: '',
        phone: '',
        email: '',
      },
      service: {
        type: 'one_way',
        routeType: 'flexible',
        pickup: {
          date: '',
          time: '',
          location: '',
        },
        dropoff: {
          location: '',
        },
      },
      details: {
        passengers: 1,
        luggage: '',
        specialNotes: '',
        specialRequests: [],
      },
      payment: {
        amount: 0,
        currency: 'EUR',
        method: 'credit_card',
        status: 'pending',
      },
    });
    setActiveTab('client');
  };
  
  // Función para limpiar el precio calculado cuando hay cambios relevantes
  const clearCalculatedPrice = () => {
    setNewBookingFormData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        priceBreakdown: undefined,
        routeInfo: undefined
      }
    }));
    setPriceBreakdown(null);
    setRouteInfo(null);
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (section: string, field: string, value: any) => {
      if (section === 'client') {
      setNewBookingFormData(prev => ({
        ...prev,
        client: {
          ...prev.client,
          [field]: value
        }
      }));
      } else if (section === 'service') {
      // Para el caso de campos anidados como 'pickup.date'
        if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        
        // Limpiar precio si cambia ubicación de origen o destino
        if ((parentField === 'pickup' && childField === 'location') || 
            (parentField === 'pickup' && childField === 'coordinates') ||
            (parentField === 'dropoff' && childField === 'location') ||
            (parentField === 'dropoff' && childField === 'coordinates')) {
          clearCalculatedPrice();
        }
        
        setNewBookingFormData(prev => ({
          ...prev,
          service: {
            ...prev.service,
            [parentField]: {
              ...prev.service[parentField as keyof typeof prev.service] as any,
              [childField]: value
            }
          }
        }));
        
        // Verificar disponibilidad cuando cambia la fecha o la hora de recogida
        if ((childField === 'date' || childField === 'time') && 
            newBookingFormData.service.pickup.coordinates && 
            newBookingFormData.service.pickup.location &&
            newBookingFormData.service.pickup.date && 
            newBookingFormData.service.pickup.time) {
          // Usamos setTimeout para asegurarnos de que el estado se haya actualizado
          setTimeout(() => {
            handleCheckVehicleAvailability(
              newBookingFormData.service.pickup.coordinates,
              newBookingFormData.service.pickup.location
            );
          }, 100);
        }
        } else {
        // Limpiar precio si cambia el tipo de servicio
        if (field === 'type' && newBookingFormData.payment?.priceBreakdown) {
          clearCalculatedPrice();
        }
        
        setNewBookingFormData(prev => ({
          ...prev,
          service: {
            ...prev.service,
            [field]: value
          }
        }));
        
        // Si cambia la duración y tenemos dirección, fecha y hora, verificar disponibilidad
        if (field === 'duration' && 
            newBookingFormData.service.pickup.coordinates && 
            newBookingFormData.service.pickup.location &&
            newBookingFormData.service.pickup.date && 
            newBookingFormData.service.pickup.time) {
          setTimeout(() => {
            handleCheckVehicleAvailability(
              newBookingFormData.service.pickup.coordinates,
              newBookingFormData.service.pickup.location
            );
          }, 100);
        }
        }
      } else if (section === 'details') {
      setNewBookingFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [field]: value
        }
      }));
      } else if (section === 'payment') {
      setNewBookingFormData(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          [field]: value
        }
      }));
    } else if (section === 'vehicle' || section === 'driver') {
      // Limpiar precio si cambia el vehículo seleccionado
      if (section === 'vehicle' && field === 'id' && newBookingFormData.payment?.priceBreakdown) {
        clearCalculatedPrice();
      }
      
      setNewBookingFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] || {}),
          [field]: value
        }
      }));
    }
  };
  
  // Función para buscar clientes
  const handleSearchClient = (query: string) => {
    // En un entorno real, aquí harías una llamada al backend
    setIsSearchingClient(true);
    
    // Simulamos una búsqueda con datos ficticios
    setTimeout(() => {
      if (query.length > 2) {
        const results = [
          { id: 'c1', name: 'María García', email: 'maria.garcia@ejemplo.com', phone: '+34612345678' },
          { id: 'c2', name: 'Juan Pérez', email: 'juan.perez@ejemplo.com', phone: '+34623456789' },
          { id: 'c3', name: 'Laura Martínez', email: 'laura.martinez@ejemplo.com', phone: '+34634567890' }
        ].filter(client => 
          client.name.toLowerCase().includes(query.toLowerCase()) || 
          client.email.toLowerCase().includes(query.toLowerCase())
        );
        
        setClientSearchResults(results);
      } else {
        setClientSearchResults([]);
      }
      setIsSearchingClient(false);
    }, 500);
  };
  
  // Función para seleccionar un cliente de los resultados de búsqueda
  const handleSelectClient = (client: any) => {
    setNewBookingFormData(prev => ({
      ...prev,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone
      }
    }));
    setClientSearchResults([]);
  };
  
  // Función para validar el formulario por pestañas
  const validateFormTab = (tab: 'client' | 'service' | 'details' | 'payment'): boolean => {
    const errors: Record<string, string> = {};
    
    if (tab === 'client') {
      if (!newBookingFormData.client.name.trim()) {
        errors['client.name'] = 'El nombre del cliente es obligatorio';
      }
      if (!newBookingFormData.client.email.trim()) {
        errors['client.email'] = 'El email del cliente es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newBookingFormData.client.email)) {
        errors['client.email'] = 'El formato del email no es válido';
      }
      if (!newBookingFormData.client.phone.trim()) {
        errors['client.phone'] = 'El teléfono del cliente es obligatorio';
      }
    } 
    else if (tab === 'service') {
      if (!newBookingFormData.service.pickup.date) {
        errors['service.pickup.date'] = 'La fecha de recogida es obligatoria';
      }
      if (!newBookingFormData.service.pickup.time) {
        errors['service.pickup.time'] = 'La hora de recogida es obligatoria';
      }
      if (!newBookingFormData.service.pickup.location.trim()) {
        errors['service.pickup.location'] = 'El lugar de recogida es obligatorio';
      }
      if (newBookingFormData.service.type !== 'hourly' && !newBookingFormData.service.dropoff.location.trim()) {
        errors['service.dropoff.location'] = 'El lugar de destino es obligatorio';
      }
      if ((newBookingFormData.service.type === 'hourly' || newBookingFormData.service.type === 'full_day') && !newBookingFormData.service.duration) {
        errors['service.duration'] = 'La duración es obligatoria para servicios por horas';
      }
    }
    else if (tab === 'details') {
      if (!newBookingFormData.details.passengers) {
        errors['details.passengers'] = 'El número de pasajeros es obligatorio';
      }
      if (!newBookingFormData.details.luggage.trim()) {
        errors['details.luggage'] = 'La información de equipaje es obligatoria';
      }
    }
    else if (tab === 'payment') {
      if (!newBookingFormData.payment.amount) {
        errors['payment.amount'] = 'El importe es obligatorio';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Función para avanzar a la siguiente pestaña con validación
  const handleNextTab = (currentTab: 'client' | 'service' | 'details') => {
    if (validateFormTab(currentTab)) {
      if (currentTab === 'client') setActiveTab('service');
      else if (currentTab === 'service') setActiveTab('details');
      else if (currentTab === 'details') setActiveTab('payment');
    }
  };
  
  // Función para preparar los datos para el backend
  const prepareDataForBackend = () => {
    // Combinar fecha y hora en un solo valor de fecha
    const pickupDate = new Date(`${newBookingFormData.service.pickup.date}T${newBookingFormData.service.pickup.time}`);
    
    // Crear objeto de reserva según el modelo de backend
    return {
      code: "", // El backend generará el código
      user_id: newBookingFormData.client.id || null,
      service_type: newBookingFormData.service.type,
      status: "pending",
      pickup: {
        location: newBookingFormData.service.pickup.location,
        coordinates: newBookingFormData.service.pickup.coordinates || null,
        date: pickupDate.toISOString()
      },
      dropoff: {
        location: newBookingFormData.service.dropoff.location,
        coordinates: newBookingFormData.service.dropoff.coordinates || null,
        estimated_date: null // El backend calculará esto
      },
      vehicle_id: newBookingFormData.vehicle?.id || null,
      driver_id: newBookingFormData.driver?.id || null,
      passengers: newBookingFormData.details.passengers,
      luggage: newBookingFormData.details.luggage,
      special_notes: newBookingFormData.details.specialNotes,
      special_requests: newBookingFormData.details.specialRequests,
      payment: {
        method: newBookingFormData.payment.method,
        status: newBookingFormData.payment.status,
        amount: newBookingFormData.payment.amount,
        currency: newBookingFormData.payment.currency
      },
      // Estos campos serán completados por el backend
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "admin", // ID del administrador actual
      // Campos opcionales
      estimated_duration: newBookingFormData.service.duration || null
    };
  };
  
  // Función para manejar el envío del formulario con validación completa
  const handleSubmitNewBooking = async () => {
    try {
      // Validar la pestaña actual
      if (!validateFormTab('payment')) {
        return;
      }
      
      // Preparar datos para el backend
      const bookingData = prepareDataForBackend();
      console.log('Datos preparados para enviar al servidor:', bookingData);
      
      // Mostrar indicador de carga
      setIsLoading(true);
      
      try {
        // Llamada API al backend
        const response = await fetch('/api/admin/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear la reserva');
        }
        
        const data = await response.json();
        console.log('Reserva creada:', data);
        
        // Cerrar el modal después de enviarlo
        handleCloseNewBookingModal();
        
        // Mostrar notificación de éxito
        alert(`Reserva ${data.reservation.code} creada con éxito`);
        
        return data;
      } catch (error) {
        console.error('Error al crear la reserva:', error);
        alert(error instanceof Error ? error.message : 'Error al crear la reserva');
        throw error;
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error de validación:', error);
      // Mostrar notificación de error
      alert('Por favor, complete todos los campos requeridos');
      throw error;
    }
  };

  // Función para buscar rutas fijas
  const handleSearchFixedRoutes = async (query: string) => {
    if (query.length < 2) {
      setRouteSearchResults([]);
      return;
    }

    setIsSearchingRoutes(true);
    
    try {
      // Llamada real a la API para buscar rutas fijas
      const response = await fetch(`/api/admin/routes/fixed/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Error al buscar rutas fijas');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setRouteSearchResults(data.routes);
      } else {
        console.error('Error en la respuesta de la API:', data.message);
        setRouteSearchResults([]);
      }
    } catch (error) {
      console.error('Error buscando rutas:', error);
      setRouteSearchResults([]);
    } finally {
      setIsSearchingRoutes(false);
    }
  };

  // Función para seleccionar una ruta fija
  const handleSelectFixedRoute = (route: FixedRoute) => {
    // Guardar referencia a la ruta seleccionada
    setSelectedRoute(route);
    setRouteSearchResults([]);
    
    // Calcular precio según la tarifa estándar
    const price = route.pricing?.standard || 0;
    
    // Actualizar el formulario con los datos de la ruta seleccionada
    setNewBookingFormData(prev => ({
      ...prev,
      service: {
        ...prev.service,
        routeType: 'fixed',
        fixedRouteId: route._id,
        pickup: {
          ...prev.service.pickup,
          location: route.origin.name,
          coordinates: route.origin.location.coordinates
        },
        dropoff: {
          location: route.destination.name,
          coordinates: route.destination.location.coordinates
        }
      },
      // Actualizar vehículo y conductor si están disponibles
      vehicle: route.vehicle?.id ? {
        id: route.vehicle.id,
        name: route.vehicle.model
      } : prev.vehicle,
      driver: route.driver?.id ? {
        id: route.driver.id,
        name: route.driver.name
      } : prev.driver,
      // Actualizar precio basado en la tarifa de la ruta
      payment: {
        ...prev.payment,
        amount: price,
        currency: route.pricing?.currency || 'EUR'
      }
    }));
    
    console.log(`Ruta fija seleccionada: ${route.name}`);
    console.log(`Origen: ${route.origin.name}`);
    console.log(`Destino: ${route.destination.name}`);
    console.log(`Precio base: ${route.pricing?.standard || 'No disponible'} ${route.pricing?.currency || 'EUR'}`);
    
    // Mostrar mensaje temporal si tenemos una función de notificación
    // alert('Las direcciones han sido autocompletadas. Puedes editarlas si es necesario.');
  };

  // Función para cambiar el tipo de ruta
  const handleRouteTypeChange = (type: 'fixed' | 'flexible') => {
    setRouteType(type);
    setSelectedRoute(null);
    setNewBookingFormData(prev => ({
      ...prev,
      service: {
        ...prev.service,
        routeType: type,
        fixedRouteId: undefined,
        pickup: {
          ...prev.service.pickup,
          location: '',
          coordinates: undefined
        },
        dropoff: {
          location: '',
          coordinates: undefined
        }
      }
    }));
  };

  // Función para buscar direcciones de recogida
  const handleSearchPickupAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setPickupAddressResults([]);
      return;
    }

    setIsSearchingPickupAddress(true);
    try {
      const results = await googleMapsService.searchPlaces(query, restrictedCountries);
      setPickupAddressResults(results);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
    } finally {
      setIsSearchingPickupAddress(false);
    }
  };

  // Función para seleccionar una dirección de recogida
  const handleSelectPickupAddress = async (address: PlaceResult) => {
    try {
      // Obtener más detalles incluyendo coordenadas exactas
      const details = await googleMapsService.getPlaceDetails(address.place_id);
      
      // Asegurarnos de que tenemos coordenadas
      if (!details?.geometry?.location) {
        console.error("No se pudieron obtener coordenadas para la dirección seleccionada");
        setAvailabilityResults({
          total_vehicles_found: 0,
          fixed_zone_count: 0,
          flexible_route_count: 0,
          available_vehicles: [],
          message: "No se pudieron obtener coordenadas para esta dirección"
        });
      
      setNewBookingFormData(prev => ({
        ...prev,
        service: {
          ...prev.service,
          pickup: {
            ...prev.service.pickup,
            location: address.description,
            coordinates: undefined
          }
        }
      }));
        
        setPickupAddressResults([]);
        return;
      }
      
      // Si tenemos coordenadas, continuamos
      const lng = details.geometry.location.lng();
      const lat = details.geometry.location.lat();
      const coordinates: [number, number] = [lng, lat];
      
      console.log("Coordenadas obtenidas:", coordinates);
      
      setNewBookingFormData(prev => ({
        ...prev,
        service: {
          ...prev.service,
          pickup: {
            ...prev.service.pickup,
            location: address.description,
            coordinates
          }
        }
      }));
      
      // La verificación de disponibilidad ahora es automática vía useEffect
      console.log("Coordenadas actualizadas:", coordinates, "- La verificación será automática");
      
    } catch (error) {
      console.error('Error obteniendo detalles de la dirección:', error);
      // Fallback sin coordenadas si hay error
      setNewBookingFormData(prev => ({
        ...prev,
        service: {
          ...prev.service,
          pickup: {
            ...prev.service.pickup,
            location: address.description
          }
        }
      }));
      
      setAvailabilityResults({
        total_vehicles_found: 0,
        fixed_zone_count: 0,
        flexible_route_count: 0,
        available_vehicles: [],
        message: "Error al obtener coordenadas para esta dirección"
      });
    }
    
    setPickupAddressResults([]);
  };

  // Función para buscar direcciones de destino
  const handleSearchDropoffAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setDropoffAddressResults([]);
      return;
    }

    setIsSearchingDropoffAddress(true);
    try {
      const results = await googleMapsService.searchPlaces(query, restrictedCountries);
      setDropoffAddressResults(results);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
    } finally {
      setIsSearchingDropoffAddress(false);
    }
  };

  // Función para seleccionar una dirección de destino
  const handleSelectDropoffAddress = async (address: PlaceResult) => {
    try {
      // Verificar si la dirección tiene coordenadas
      if (!address.geometry?.location) {
        // Intentar geocodificar la dirección
        const geocodeResult = await googleMapsService.geocodeAddress(address.description);
        if (!geocodeResult || !geocodeResult.geometry?.location) {
          console.error('No se pudieron obtener coordenadas para la dirección seleccionada');
          return;
        }
        
        // Utilizar las coordenadas obtenidas
        const coordinates: [number, number] = [
          geocodeResult.geometry.location.lng(), 
          geocodeResult.geometry.location.lat()
        ];
        
        // Actualizar los datos del formulario
        setNewBookingFormData(prev => ({
          ...prev,
          service: {
            ...prev.service,
            dropoff: {
              location: address.description,
              coordinates: coordinates
            }
          }
        }));
      } else {
        // Usar las coordenadas proporcionadas directamente
        const coordinates: [number, number] = [
          address.geometry.location.lng, 
          address.geometry.location.lat
        ];
        
        // Actualizar los datos del formulario
        setNewBookingFormData(prev => ({
          ...prev,
          service: {
            ...prev.service,
            dropoff: {
              location: address.description,
              coordinates: coordinates
            }
          }
        }));
      }

      // Limpiar resultados de búsqueda
      setDropoffAddressResults([]);

      // Calcular el precio automáticamente si ya hay un vehículo seleccionado
      if (newBookingFormData.vehicle?.id) {
        // Damos un poco de tiempo para que se actualice el estado
        setTimeout(() => {
          handleCalculatePrice();
        }, 100);
      }
    } catch (error) {
      console.error('Error al procesar la dirección de destino seleccionada:', error);
    }
  };

  // Función para verificar la disponibilidad de vehículos para una ubicación
  const handleCheckVehicleAvailability = useCallback(async (coordinates: [number, number] | undefined, address: string) => {
    console.log("🚀 handleCheckVehicleAvailability iniciado");
    console.log("Parámetros recibidos:", { coordinates, address });
    console.log("Estado actual isCheckingAvailability:", isCheckingAvailability);
    console.log("Estado actual availabilityResults:", availabilityResults);
    
    // Validación más estricta
    if (!coordinates || coordinates.length !== 2 || 
        typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number' ||
        !newBookingFormData.service.pickup.date || !newBookingFormData.service.pickup.time) {
      console.error("Se requieren coordenadas válidas, fecha y hora para verificar disponibilidad");
      console.error("Coordenadas:", coordinates);
      console.error("Fecha:", newBookingFormData.service.pickup.date);
      console.error("Hora:", newBookingFormData.service.pickup.time);
      
      const errorResult = {
        total_vehicles_found: 0,
        fixed_zone_count: 0,
        flexible_route_count: 0,
        available_vehicles: [],
        message: "Faltan datos para verificar disponibilidad"
      };
      
      console.log("❌ Estableciendo resultado de error:", errorResult);
      setAvailabilityResults(errorResult);
      return;
    }

    console.log("✅ Validación pasada, iniciando verificación");
    setIsCheckingAvailability(true);
    setAvailabilityResults(null); // Resetear resultados anteriores
    
    try {
      // Calcular la fecha y hora de recogida
      const [year, month, day] = newBookingFormData.service.pickup.date.split('-').map(Number);
      const [hours, minutes] = newBookingFormData.service.pickup.time.split(':').map(Number);
      
      // Crear un objeto Date para la fecha y hora de recogida
      const pickupDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Duración estimada en minutos - usar el valor real del formulario
      const duration = newBookingFormData.service.duration;
      
      // Validar duración para servicios por horas
      if ((newBookingFormData.service.type === 'hourly' || newBookingFormData.service.type === 'full_day') && (!duration || duration < 60)) {
        console.error("La duración es requerida y debe ser mínimo 60 minutos para servicios por horas");
        const durationErrorResult = {
          total_vehicles_found: 0,
          fixed_zone_count: 0,
          flexible_route_count: 0,
          available_vehicles: [],
          message: "La duración debe ser mínimo 60 minutos para servicios por horas"
        };
        
        console.log("❌ Estableciendo resultado de error de duración:", durationErrorResult);
        setAvailabilityResults(durationErrorResult);
        return;
      }
      
      // Usar 60 minutos por defecto solo para servicios que no requieren duración específica
      const finalDuration = duration || 60;

      console.log("📝 Consultando disponibilidad con los siguientes datos:");
      console.log("- Coordenadas:", coordinates);
      console.log("- Dirección:", address);
      console.log("- Fecha y hora:", pickupDateTime.toISOString());
      console.log("- Duración:", finalDuration);
      
      // Usar la URL base desde las variables de entorno
      const apiUrl = `${import.meta.env.VITE_API_URL}/admin/reservations/search-vehicles`;
      console.log("🌐 Llamando a API:", apiUrl);
      
      // Formatear los datos exactamente como los espera el endpoint
      // Según backend/routes/availability.py el endpoint espera:
      // - pickup_address: dirección de recogida
      // - pickup_date: fecha en formato YYYY-MM-DD
      // - pickup_time: hora en formato HH:MM
      const requestData = {
        pickup_address: address,
        pickup_date: newBookingFormData.service.pickup.date,
        pickup_time: newBookingFormData.service.pickup.time,
        estimated_duration: finalDuration
      };
      console.log("📤 Datos de la solicitud:", JSON.stringify(requestData));
      
      // Llamar al endpoint para verificar disponibilidad
      const response = await axios.post(apiUrl, requestData);
      
      console.log("📥 Respuesta de la API:", response);
      
      if (response.status === 200) {
        console.log("✅ Datos de disponibilidad recibidos:", response.data);
        
        // Adaptar el formato de respuesta del backend al formato que espera nuestro componente
        const adaptedResponse: VehicleAvailabilityResult = {
          total_vehicles_found: response.data.search_results.total_vehicles_found || 0,
          fixed_zone_count: response.data.search_results.zones_found || 0,
          flexible_route_count: response.data.search_results.flexible_vehicles_found || 0,
          available_vehicles: response.data.vehicles || []
        };
        
        // **NUEVO**: Agregar vehículos con horarios alternativos si existen
        if (response.data.vehicles_with_alternative_schedules) {
          adaptedResponse.vehicles_with_alternative_schedules = response.data.vehicles_with_alternative_schedules;
        }
        
        // Registrar los datos adaptados para depuración
        console.log("🔄 Datos adaptados para el componente:", adaptedResponse);
        console.log("🎯 Estableciendo availabilityResults con:", adaptedResponse);
        
        setAvailabilityResults(adaptedResponse);
        
        console.log("✅ availabilityResults actualizado exitosamente");
      } else {
        console.error("❌ Error al verificar disponibilidad. Estado:", response.status, response.statusText);
        const errorResponse = {
          total_vehicles_found: 0,
          fixed_zone_count: 0,
          flexible_route_count: 0,
          available_vehicles: [],
          message: `Error del servidor: ${response.statusText}`
        };
        
        console.log("❌ Estableciendo resultado de error de servidor:", errorResponse);
        setAvailabilityResults(errorResponse);
      }
    } catch (error) {
      console.error("💥 Error al verificar disponibilidad:", error);
      
      let errorMessage = "Error al verificar disponibilidad";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
        console.error("Detalles del error Axios:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        // Mostrar información detallada del error
        if (error.response?.status === 400) {
          // Errores de validación o formato incorrecto
          const errorData = error.response.data;
          console.log("Detalles completos del error 400:", errorData);
          
          if (errorData.detail) {
            errorMessage = `Error de validación: ${errorData.detail}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            // Muchos backends devuelven el error en la propiedad 'error'
            errorMessage = errorData.error;
          }
        } else if (error.response?.status === 404) {
          errorMessage = "Endpoint no encontrado. Verifique la URL del API.";
        } else if (error.response?.status === 500) {
          errorMessage = "Error interno del servidor. Contacte al administrador.";
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
          errorMessage = "No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.";
        } else if (error.message.includes('Network Error')) {
          // Posible error de CORS
          console.error("Posible error de CORS o problema de red:");
          errorMessage = "Error de red. Puede ser un problema de CORS o que el servidor no esté disponible.";
        }
      }
      
      const catchErrorResult = {
        total_vehicles_found: 0,
        fixed_zone_count: 0,
        flexible_route_count: 0,
        available_vehicles: [],
        message: errorMessage
      };
      
      console.log("💥 Estableciendo resultado de error de catch:", catchErrorResult);
      setAvailabilityResults(catchErrorResult);
    } finally {
      console.log("🏁 Finalizando verificación, estableciendo isCheckingAvailability a false");
      setIsCheckingAvailability(false);
    }
  }, [newBookingFormData.service.pickup.date, newBookingFormData.service.pickup.time, newBookingFormData.service.duration, newBookingFormData.service.type]);

  // useEffect para verificar disponibilidad automáticamente cuando cambien los datos
  useEffect(() => {
    console.log("🔄 useEffect de verificación automática disparado");
    console.log("Dependencias actuales:", {
      location: newBookingFormData.service.pickup.location,
      coordinates: newBookingFormData.service.pickup.coordinates,
      date: newBookingFormData.service.pickup.date,
      time: newBookingFormData.service.pickup.time,
      duration: newBookingFormData.service.duration,
      type: newBookingFormData.service.type,
      isCheckingAvailability: isCheckingAvailability
    });
    
    const verifyAvailabilityAutomatically = () => {
      console.log("⏱️ Ejecutando verifyAvailabilityAutomatically (después del debounce)");
      
      // Solo ejecutar si tenemos los datos mínimos necesarios
      const hasRequiredData = 
        newBookingFormData.service.pickup.location &&
        newBookingFormData.service.pickup.coordinates &&
        newBookingFormData.service.pickup.date &&
        newBookingFormData.service.pickup.time;

      console.log("✅ Verificación de datos requeridos:", {
        hasLocation: !!newBookingFormData.service.pickup.location,
        hasCoordinates: !!newBookingFormData.service.pickup.coordinates,
        hasDate: !!newBookingFormData.service.pickup.date,
        hasTime: !!newBookingFormData.service.pickup.time,
        hasRequiredData: hasRequiredData,
        isCurrentlyChecking: isCheckingAvailability
      });

      if (hasRequiredData && !isCheckingAvailability) {
        console.log("🔄 Auto-verificando disponibilidad debido a cambios en los datos");
        console.log("Datos actuales:", {
          location: newBookingFormData.service.pickup.location,
          coordinates: newBookingFormData.service.pickup.coordinates,
          date: newBookingFormData.service.pickup.date,
          time: newBookingFormData.service.pickup.time,
          duration: newBookingFormData.service.duration,
          type: newBookingFormData.service.type
        });
        
        handleCheckVehicleAvailability(
          newBookingFormData.service.pickup.coordinates,
          newBookingFormData.service.pickup.location
        );
      } else {
        console.log("❌ No se ejecuta verificación automática:", {
          reason: !hasRequiredData ? "Faltan datos requeridos" : "Ya se está verificando disponibilidad"
        });
      }
    };

    // Debounce la verificación para evitar demasiadas llamadas al API
    console.log("⏰ Configurando timeout para verificación automática (500ms)");
    const timeoutId = setTimeout(verifyAvailabilityAutomatically, 500);

    return () => {
      console.log("🧹 Limpiando timeout de verificación automática");
      clearTimeout(timeoutId);
    };
  }, [
    // Dependencias que deberían trigger la verificación automática
    newBookingFormData.service.pickup.location,
    JSON.stringify(newBookingFormData.service.pickup.coordinates), // Serializar para comparación correcta
    newBookingFormData.service.pickup.date,
    newBookingFormData.service.pickup.time,
    newBookingFormData.service.duration,
    newBookingFormData.service.type,
    handleCheckVehicleAvailability // Agregar la función estabilizada como dependencia
    // No incluir isCheckingAvailability para evitar loops infinitos
  ]);

  // Nueva función para el cálculo de precios basado en origen y destino
  const handleCalculatePrice = async () => {
    // Verificar que tenemos un vehículo seleccionado y coordenadas de origen y destino
    if (!newBookingFormData.vehicle?.id || 
        !newBookingFormData.service.pickup.coordinates || 
        !newBookingFormData.service.dropoff.coordinates) {
      console.error("No se puede calcular el precio: faltan datos esenciales");
      return;
    }

    setIsCalculatingPrice(true);

    try {
      console.log("Calculando precio para la ruta:", {
        origen: newBookingFormData.service.pickup.location,
        destino: newBookingFormData.service.dropoff.location,
        vehiculo: newBookingFormData.vehicle.name,
        tipoServicio: newBookingFormData.service.type
      });

      // Buscar el vehículo en ambos arrays: available_vehicles y vehicles_with_alternative_schedules
      let selectedVehicle = null;
      
      // Primero buscar en vehículos disponibles
      if (availabilityResults?.available_vehicles) {
        selectedVehicle = availabilityResults.available_vehicles.find(
          (v: any) => v.id === newBookingFormData.vehicle?.id || v.vehicle_id === newBookingFormData.vehicle?.id
        );
      }
      
      // Si no se encontró, buscar en vehículos con horarios alternativos
      if (!selectedVehicle && availabilityResults?.vehicles_with_alternative_schedules) {
        selectedVehicle = availabilityResults.vehicles_with_alternative_schedules.find(
          (v: any) => v.id === newBookingFormData.vehicle?.id || v.vehicle_id === newBookingFormData.vehicle?.id
        );
      }

      // Si aún no se encontró, usar precios por defecto (especialmente útil para vehículos seleccionados por horario extra)
      if (!selectedVehicle) {
        console.warn("No se encontró información específica de precios para el vehículo. Usando precios estándar.");
        selectedVehicle = {
          pricing: {
            base_fare: 186.71,  // Precio base estándar para vehículos VIP
            per_km: 2.8,        // Precio por km estándar
            per_hour: 55,       // Precio por hora estándar
            currency: "EUR"     // Moneda estándar
          }
        };
      }

      // Extraer la información de precios del vehículo
      const pricing = selectedVehicle.pricing || {
        base_fare: 186.71,  // Precio base predeterminado
        per_km: 2.8,        // Precio por km predeterminado
        per_hour: 55,       // Precio por hora predeterminado
        currency: "EUR"     // Moneda predeterminada
      };

      console.log("Estructura de precios del vehículo:", pricing);

      // Convertir coordinadas a formato esperado por el servicio
      const origin = {
        lat: newBookingFormData.service.pickup.coordinates[1], // [1] es latitud
        lng: newBookingFormData.service.pickup.coordinates[0]  // [0] es longitud
      };
      
      const destination = {
        lat: newBookingFormData.service.dropoff.coordinates[1],
        lng: newBookingFormData.service.dropoff.coordinates[0]
      };

      // Obtener el tipo de servicio para el cálculo
      const serviceType = newBookingFormData.service.type as ServiceType;

      // Calcular el precio utilizando el servicio con el tipo de servicio
      const { routeInfo: calculatedRouteInfo, priceBreakdown: calculatedPrice } = 
        await priceCalculationService.calculatePriceFromCoordinates(origin, destination, pricing, serviceType);

      console.log("Información de la ruta calculada:", calculatedRouteInfo);
      console.log("Desglose de precios calculado:", calculatedPrice);

      // Actualizar estados con la información calculada
      setRouteInfo(calculatedRouteInfo);
      setPriceBreakdown(calculatedPrice);

      // Actualizar el formulario con los valores calculados
      setNewBookingFormData(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          amount: calculatedPrice.total,
          currency: calculatedPrice.currency,
          priceBreakdown: {
            base_fare: calculatedPrice.base_fare,
            distance_charge: calculatedPrice.distance_charge,
            subtotal: calculatedPrice.subtotal,
            tax_percentage: calculatedPrice.tax_percentage,
            tax_amount: calculatedPrice.tax_amount,
            total: calculatedPrice.total,
            // Nuevos campos para ida y vuelta
            total_distance_km: calculatedPrice.total_distance_km,
            is_round_trip: calculatedPrice.is_round_trip,
            one_way_distance_km: calculatedPrice.one_way_distance_km
          },
          routeInfo: {
            distance: calculatedRouteInfo.distance,
            duration: calculatedRouteInfo.duration
          }
        }
      }));

    } catch (error) {
      console.error("Error al calcular el precio:", error);
      // Mostrar alerta o mensaje de error
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Función para validar si se puede calcular el precio
  const canCalculatePrice = (): boolean => {
    return (
      !!newBookingFormData.vehicle?.id && 
      !!newBookingFormData.service.pickup.coordinates && 
      !!newBookingFormData.service.dropoff.coordinates
    );
  };

  // === NUEVAS FUNCIONES PARA CONTACTO Y SUGERENCIAS ===

  // Estados para los modales de contacto y sugerencias
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [selectedVehicleForAction, setSelectedVehicleForAction] = useState<any>(null);

  // Función para abrir modal de contacto de conductor
  const handleOpenContactModal = (vehicle: any) => {
    setSelectedVehicleForAction(vehicle);
    setContactModalOpen(true);
  };

  // Función para cerrar modal de contacto
  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedVehicleForAction(null);
  };

  // Función para abrir modal de sugerencia de horarios
  const handleOpenSuggestModal = (vehicle: any) => {
    setSelectedVehicleForAction(vehicle);
    setSuggestModalOpen(true);
  };

  // Función para cerrar modal de sugerencia
  const handleCloseSuggestModal = () => {
    setSuggestModalOpen(false);
    setSelectedVehicleForAction(null);
  };

  // Función para manejar cuando se registra un contacto
  const handleContactLogged = (contactData: any) => {
    console.log('Contacto registrado:', contactData);
    // Aquí podrías agregar lógica adicional como notificaciones
  };

  // Función para manejar cuando se crea una sugerencia
  const handleSuggestionCreated = (suggestionData: any) => {
    console.log('Sugerencia creada:', suggestionData);
    // Aquí podrías agregar lógica adicional como notificaciones
  };

  // Estados y funciones para el modal de horario extra
  const [extraScheduleModalOpen, setExtraScheduleModalOpen] = useState(false);
  const [wasVehicleSelectedByExtraSchedule, setWasVehicleSelectedByExtraSchedule] = useState(false);

  // Función para abrir modal de horario extra
  const handleOpenExtraScheduleModal = (vehicle: any) => {
    setSelectedVehicleForAction(vehicle);
    setExtraScheduleModalOpen(true);
  };

  // Función para cerrar modal de horario extra
  const handleCloseExtraScheduleModal = () => {
    setExtraScheduleModalOpen(false);
    setSelectedVehicleForAction(null);
  };

  // Función para limpiar la selección de vehículo
  const handleClearVehicleSelection = () => {
    handleFormChange('vehicle', 'id', '');
    handleFormChange('vehicle', 'name', '');
    handleFormChange('driver', 'id', '');
    handleFormChange('driver', 'name', '');
    setWasVehicleSelectedByExtraSchedule(false);
  };

  // Función para manejar cuando se crea un horario extra
  const handleExtraScheduleCreated = (data: any) => {
    console.log('Horario extra creado:', data);
    
    // Si se pasó información del vehículo, seleccionarlo automáticamente
    if (data.vehicle) {
      const vehicle = data.vehicle;
      const driverName = vehicle.vehicle_data?.driver?.name || vehicle.driver_name || 'Conductor asignado';
      const vehicleName = vehicle.vehicle_data?.model || vehicle.model || 'Vehículo asignado';
      
      // Seleccionar el vehículo automáticamente
      handleFormChange('vehicle', 'id', vehicle.id || vehicle.vehicle_id);
      handleFormChange('vehicle', 'name', vehicleName);
      handleFormChange('driver', 'id', vehicle.driver_id);
      handleFormChange('driver', 'name', driverName);
      
      // Marcar que este vehículo fue seleccionado por horario extra
      setWasVehicleSelectedByExtraSchedule(true);
      
      console.log(`✅ Vehículo seleccionado automáticamente: ${vehicleName} con conductor ${driverName}`);
      
      // Simular que el vehículo ahora está disponible en availabilityResults
      // Esto es útil para el cálculo de precios posterior
      const updatedAvailabilityResults: VehicleAvailabilityResult = {
        total_vehicles_found: (availabilityResults?.total_vehicles_found || 0) + 1,
        fixed_zone_count: availabilityResults?.fixed_zone_count || 0,
        flexible_route_count: availabilityResults?.flexible_route_count || 0,
        available_vehicles: [
          ...(availabilityResults?.available_vehicles || []),
          {
            id: vehicle.id || vehicle.vehicle_id,
            vehicle_id: vehicle.id || vehicle.vehicle_id,
            model: vehicleName,
            driver_name: driverName,
            driver_id: vehicle.driver_id,
            availability_type: vehicle.availability_type || 'flexible_route',
            // Agregar información de precios estándar para vehículos VIP
            pricing: vehicle.pricing || {
              base_fare: 186.71,
              per_km: 2.8,
              per_hour: 55,
              currency: "EUR"
            }
          }
        ],
        // Mantener vehículos con horarios alternativos si existen
        vehicles_with_alternative_schedules: availabilityResults?.vehicles_with_alternative_schedules,
        message: availabilityResults?.message
      };
      
      setAvailabilityResults(updatedAvailabilityResults);
    }
    
    // Refrescar la búsqueda de vehículos para mostrar el nuevo horario disponible
    // (pero solo si no acabamos de agregar el vehículo arriba)
    if (newBookingFormData.service.pickup.coordinates && 
        newBookingFormData.service.pickup.location && 
        !data.vehicle) {
      handleCheckVehicleAvailability(newBookingFormData.service.pickup.coordinates, newBookingFormData.service.pickup.location);
    }
  };

  return {
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
    // Estados para autocompletado de direcciones
    pickupAddressResults,
    isSearchingPickupAddress,
    dropoffAddressResults,
    isSearchingDropoffAddress,
    
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
    prepareDataForBackend,
    handleSubmitNewBooking,
    setNewBookingFormData,
    handleSearchFixedRoutes,
    handleSelectFixedRoute,
    handleRouteTypeChange,
    // Funciones para autocompletado de direcciones
    handleSearchPickupAddress,
    handleSelectPickupAddress,
    handleSearchDropoffAddress,
    handleSelectDropoffAddress,
    
    // Exponer la configuración de países
    restrictedCountries,
    setRestrictedCountries,

    // Estados para la verificación de disponibilidad
    isCheckingAvailability,
    availabilityResults,

    // Función para verificar la disponibilidad de vehículos para una ubicación
    handleCheckVehicleAvailability,

    // Nuevos estados para el cálculo de tarifas
    isCalculatingPrice,
    priceBreakdown,
    routeInfo,

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
  };
};

// Una función auxiliar para obtener todas las reservas
export const fetchReservations = async () => {
  try {
    const response = await fetch('/api/admin/reservations');
    if (!response.ok) {
      throw new Error('Error al obtener las reservas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}; 