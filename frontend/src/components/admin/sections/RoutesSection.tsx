import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Loader2, AlertTriangle, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

// Componentes para las pestañas
import FixedRoutesTab from "../routes/FixedRoutesTab";
import FlexibleRoutesTab from "../routes/FlexibleRoutesTab";

// Tipos para las rutas
export interface FixedRoute {
  id: string;
  name: string;
  origin: {
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  destination: {
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  vehicles: Array<{
    id: string;
    licensePlate: string;
    model: string;
    imageUrl?: string;
  }>;
  vehicle?: {
    id: string;
    licensePlate: string;
    model: string;
    imageUrl?: string;
  };
  drivers?: Array<{
    id: string;
    name: string;
    photo?: string;
  }>;
  driver?: {
    id: string;
    name: string;
    photo?: string;
  };
  pricing: {
    standard: number;
    night: number;
    holiday: number;
    currency: string;
  };
  availability: {
    timeSlots: string[];
    days: string[];
  };
  status: 'active' | 'inactive' | 'draft';
  distance?: number;
  estimatedTime?: number;
  collaboratorId?: string;
}

export interface FlexibleZone {
  id: string;
  name: string;
  center: {
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  radius: number;
  vehicles: Array<{
    id: string;
    licensePlate: string;
    model: string;
  }>;
  pricing: {
    perKm: number;
    minFare: number;
    nightSurcharge: number;
    holidaySurcharge: number;
    currency: string;
  };
  restrictions?: {
    minDistance?: number;
    maxDistance?: number;
  };
  status: 'active' | 'inactive';
  description?: string;
  collaboratorId?: string;
}

// Interfaz para vehículos
interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  brand?: string;
  imageUrl?: string;
  image?: string;
  associatedDriver?: {
    id: string;
    name: string;
    photo?: string;
  };
}

const RoutesSection = () => {
  const { toast } = useToast();
  
  // Estados para la gestión de rutas
  const [fixedRoutes, setFixedRoutes] = useState<FixedRoute[]>([]);
  const [flexibleZones, setFlexibleZones] = useState<FlexibleZone[]>([]);
  const [activeTab, setActiveTab] = useState<string>("fixed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Cargar datos de rutas desde la API
  useEffect(() => {
    if (activeTab === "fixed") {
      fetchFixedRoutes();
    } else {
      fetchFlexibleZones();
    }
  }, [activeTab]);

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Configurar headers para las peticiones
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  };

  // Función para obtener rutas fijas
  const fetchFixedRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamada a la API real
      const response = await axios.get('/api/admin/routes/fixed/list', getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        // Normalizar los datos recibidos para asegurar que cada ruta tiene un id
        const normalizedRoutes = response.data.routes.map((route: any) => {
          // Si la ruta tiene _id pero no id, asignar _id a id
          if (route._id && !route.id) {
            console.log(`Normalizando ruta: Asignando _id ${route._id} a id`);
            route = {
              ...route,
              id: route._id
            };
          }
          
          // Normalizar el campo vehicles si solo tiene vehicle
          if (!route.vehicles && route.vehicle) {
            console.log(`Normalizando ruta: Convirtiendo vehicle a vehicles[0]`);
            route = {
              ...route,
              vehicles: [route.vehicle]
            };
          }
          
          // Normalizar el campo drivers si solo tiene driver
          if (!route.drivers && route.driver) {
            console.log(`Normalizando ruta: Convirtiendo driver a drivers[0]`);
            route = {
              ...route,
              drivers: [route.driver]
            };
          }
          
          return route;
        });
        
        console.log("Rutas normalizadas:", normalizedRoutes);
        setFixedRoutes(normalizedRoutes);
      } else {
        setError('Error al cargar rutas fijas. Respuesta de servidor incorrecta.');
      }
    } catch (error) {
      console.error('Error al cargar rutas fijas:', error);
      setError('Error al cargar las rutas fijas. Por favor, intente de nuevo más tarde.');
      
      // En desarrollo, usar datos de ejemplo como fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('Usando datos de ejemplo en desarrollo');
        // Ejemplo
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener vehículos por colaborador
  const fetchVehiclesByCollaborator = async (collaboratorId: string): Promise<Vehicle[]> => {
    try {
      console.log(`Obteniendo vehículos para el colaborador: ${collaboratorId}`);
      
      // Llamada a la API
      const response = await axios.get(`/api/admin/vehicles/by-collaborator/${collaboratorId}`, getAuthHeaders());
      
      if (response.data && response.data.vehicles) {
        console.log("Vehículos obtenidos:", response.data.vehicles);
        
        // Convertir formato de API al formato que espera el componente
        const formattedVehicles: Vehicle[] = response.data.vehicles.map((v: any) => ({
          id: v.id || v._id,
          licensePlate: v.licensePlate,
          model: v.model,
          brand: v.brand,
          imageUrl: v.image || "",
          // Si hay un conductor asociado, incluirlo
          ...(v.associatedDriver ? {
            associatedDriver: {
              id: v.associatedDriver.id || v.associatedDriver._id,
              name: v.associatedDriver.name,
              photo: v.associatedDriver.photo || ""
            }
          } : {})
        }));
        
        return formattedVehicles;
      } else {
        console.warn("No se encontraron vehículos para este colaborador");
        return [];
      }
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos disponibles",
        variant: "destructive"
      });
      return [];
    }
  };

  // Función para obtener zonas flexibles
  const fetchFlexibleZones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamada a la API real
      const response = await axios.get('/api/admin/routes/flexible/list', getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        setFlexibleZones(response.data.zones);
      } else {
        setError('Error al cargar zonas flexibles. Respuesta de servidor incorrecta.');
      }
    } catch (error) {
      console.error('Error al cargar zonas flexibles:', error);
      setError('Error al cargar las zonas flexibles. Por favor, intente de nuevo más tarde.');
      
      // En desarrollo, usar datos de ejemplo como fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('Usando datos de ejemplo en desarrollo');
        // Ejemplo
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva ruta fija
  const createFixedRoute = async (routeData: Partial<FixedRoute>) => {
    try {
      setLoading(true);
      
      // Si hay un collaboratorId y vehículos seleccionados, obtener los datos reales de los vehículos
      if (routeData.collaboratorId && routeData.vehicles && routeData.vehicles.length > 0) {
        const allVehicles = await fetchVehiclesByCollaborator(routeData.collaboratorId);
        const selectedVehicleIds = routeData.vehicles.map(v => v.id);
        const selectedVehicles = allVehicles.filter(v => selectedVehicleIds.includes(v.id));
        
        if (selectedVehicles.length > 0) {
          // Actualizar los datos de los vehículos con datos reales
          routeData.vehicles = selectedVehicles.map(v => ({
            id: v.id,
            licensePlate: v.licensePlate,
            model: v.brand ? `${v.brand} ${v.model}`.trim() : v.model,
            imageUrl: v.imageUrl || v.image
          }));
          
          // Si los vehículos tienen conductores asociados, incluirlos
          const driversFromVehicles = selectedVehicles
            .filter(v => v.associatedDriver)
            .map(v => ({
              id: v.associatedDriver!.id,
              name: v.associatedDriver!.name,
              photo: v.associatedDriver!.photo
            }));
          
          if (driversFromVehicles.length > 0) {
            routeData.drivers = driversFromVehicles;
          }
          
          console.log("Datos de vehículos actualizados con información real:", routeData.vehicles);
        } else {
          console.warn("No se encontraron los vehículos seleccionados en la lista de vehículos del colaborador");
        }
      }
      
      // Para retrocompatibilidad, añadir el primer vehículo como vehicle principal
      if (routeData.vehicles && routeData.vehicles.length > 0) {
        routeData.vehicle = routeData.vehicles[0];
      }
      
      // Si hay drivers, añadir el primero como driver principal para retrocompatibilidad
      if (routeData.drivers && routeData.drivers.length > 0) {
        routeData.driver = routeData.drivers[0];
      }
      
      // Llamada a la API real
      const response = await axios.post('/api/admin/routes/fixed/create', routeData, getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Éxito",
          description: "Ruta fija creada correctamente"
        });
        
        // Actualizar lista de rutas
        fetchFixedRoutes();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Error al crear la ruta fija",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error al crear ruta fija:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la ruta fija",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva zona flexible
  const createFlexibleZone = async (zoneData: Partial<FlexibleZone>) => {
    try {
      setLoading(true);
      
      // Llamada a la API real
      const response = await axios.post('/api/admin/routes/flexible/create', zoneData, getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Éxito",
          description: "Zona flexible creada correctamente"
        });
        
        // Actualizar lista de zonas
        fetchFlexibleZones();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Error al crear la zona flexible",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error al crear zona flexible:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la zona flexible",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una ruta fija existente
  const updateFixedRoute = async (routeId: string, routeData: Partial<FixedRoute>) => {
    try {
      setLoading(true);
      
      console.log("Actualizando ruta fija:", routeId);
      console.log("Datos a enviar:", routeData);
      
      // Asegurar que el collaboratorId se incluya siempre
      if (!routeData.collaboratorId) {
        // Buscar la ruta existente
        const existingRoute = fixedRoutes.find(route => route.id === routeId);
        if (existingRoute && existingRoute.collaboratorId) {
          routeData.collaboratorId = existingRoute.collaboratorId;
        }
      }
      
      // Si hay un collaboratorId y vehículos seleccionados, obtener los datos reales de los vehículos
      if (routeData.collaboratorId && routeData.vehicles && routeData.vehicles.length > 0) {
        const allVehicles = await fetchVehiclesByCollaborator(routeData.collaboratorId);
        const selectedVehicleIds = routeData.vehicles.map(v => v.id);
        const selectedVehicles = allVehicles.filter(v => selectedVehicleIds.includes(v.id));
        
        if (selectedVehicles.length > 0) {
          // Actualizar los datos de los vehículos con datos reales
          routeData.vehicles = selectedVehicles.map(v => ({
            id: v.id,
            licensePlate: v.licensePlate,
            model: v.brand ? `${v.brand} ${v.model}`.trim() : v.model,
            imageUrl: v.imageUrl || v.image
          }));
          
          // Si los vehículos tienen conductores asociados, incluirlos
          const driversFromVehicles = selectedVehicles
            .filter(v => v.associatedDriver)
            .map(v => ({
              id: v.associatedDriver!.id,
              name: v.associatedDriver!.name,
              photo: v.associatedDriver!.photo
            }));
          
          if (driversFromVehicles.length > 0) {
            routeData.drivers = driversFromVehicles;
          }
          
          console.log("Datos de vehículos actualizados con información real:", routeData.vehicles);
        } else {
          console.warn("No se encontraron los vehículos seleccionados en la lista de vehículos del colaborador");
          
          // Si no se encuentran los vehículos seleccionados, usar la información existente
          const existingRoute = fixedRoutes.find(route => route.id === routeId);
          if (existingRoute && existingRoute.vehicles) {
            routeData.vehicles = existingRoute.vehicles;
          }
        }
      }
      
      // Para retrocompatibilidad, añadir el primer vehículo como vehicle principal
      if (routeData.vehicles && routeData.vehicles.length > 0) {
        routeData.vehicle = routeData.vehicles[0];
      }
      
      // Si hay drivers, añadir el primero como driver principal para retrocompatibilidad
      if (routeData.drivers && routeData.drivers.length > 0) {
        routeData.driver = routeData.drivers[0];
      }
      
      // Verificación de datos críticos
      if (!routeId) {
        console.error("ERROR: ID de ruta faltante o inválido");
        toast({
          title: "Error de validación",
          description: "ID de ruta faltante o inválido",
          variant: "destructive"
        });
        return false;
      }
      
      // Validar que existen los campos obligatorios
      const requiredFields = ['name', 'origin', 'destination', 'vehicles', 'pricing', 'availability'];
      const missingFields = requiredFields.filter(field => !routeData[field as keyof Partial<FixedRoute>]);
      
      if (missingFields.length > 0) {
        console.error(`ERROR: Faltan campos obligatorios: ${missingFields.join(', ')}`);
        toast({
          title: "Error de validación",
          description: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return false;
      }
      
      // Validación de estructura de objeto completa
      console.log("Validando estructura de objeto completa:");
      console.log("- Origen:", routeData.origin);
      console.log("- Destino:", routeData.destination);
      console.log("- Vehículos:", routeData.vehicles);
      console.log("- Precios:", routeData.pricing);
      console.log("- Disponibilidad:", routeData.availability);
      
      // Llamada a la API real
      console.log(`Enviando petición PUT a: /api/admin/routes/fixed/${routeId}/update`);
      try {
        const response = await axios.put(`/api/admin/routes/fixed/${routeId}/update`, routeData, getAuthHeaders());
        
        console.log("Respuesta completa de la API:", response);
        console.log("Estado HTTP:", response.status);
        console.log("Datos de respuesta:", response.data);
        
        if (response.data && response.data.status === 'success') {
          console.log("Actualización exitosa de la ruta");
          toast({
            title: "Éxito",
            description: "Ruta fija actualizada correctamente"
          });
          
          // Actualizar lista de rutas
          fetchFixedRoutes();
          return true;
        } else {
          console.error("La API reportó un error:", response.data);
          toast({
            title: "Error",
            description: response.data?.message || "Error al actualizar la ruta fija",
            variant: "destructive"
          });
          return false;
        }
      } catch (apiError) {
        console.error("ERROR EN LA PETICIÓN A LA API:", apiError);
        throw apiError; // Re-lanzamos el error para el manejador exterior
      }
    } catch (error) {
      console.error(`Error completo al actualizar ruta fija ${routeId}:`, error);
      
      // Mostrar más detalles del error si está disponible
      if (axios.isAxiosError(error)) {
        console.error("Tipo de error: Axios Error");
        console.error("Status:", error.response?.status);
        console.error("Status text:", error.response?.statusText);
        console.error("Detalles completos del error:", error.response?.data);
        console.error("URL completa de la petición:", error.config?.url);
        console.error("Headers enviados:", error.config?.headers);
        console.error("Datos enviados en el cuerpo:", error.config?.data);
        
        // Mensaje personalizado según el tipo de error
        let errorMessage = "Error al comunicarse con el servidor";
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "La ruta que intenta actualizar no existe";
          } else if (error.response.status === 400) {
            errorMessage = "Datos de ruta inválidos";
          } else if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = "No tiene permisos para actualizar esta ruta";
          }
        } else if (error.request) {
          errorMessage = "No se recibió respuesta del servidor";
        }
        
        toast({
          title: "Error de servidor",
          description: error.response?.data?.message || errorMessage,
          variant: "destructive"
        });
      } else if (error instanceof Error) {
        console.error("Tipo de error: Error general");
        console.error("Mensaje:", error.message);
        console.error("Stack:", error.stack);
        
        toast({
          title: "Error",
          description: error.message || "No se pudo actualizar la ruta fija",
          variant: "destructive"
        });
      } else {
        console.error("Tipo de error: Desconocido");
        toast({
          title: "Error",
          description: "No se pudo actualizar la ruta fija por un error desconocido",
          variant: "destructive"
        });
      }
      console.log("=====================================================");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una zona flexible
  const updateFlexibleZone = async (zoneId: string, zoneData: Partial<FlexibleZone>) => {
    try {
      setLoading(true);
      
      // Llamada a la API real
      const response = await axios.put(`/api/admin/routes/flexible/${zoneId}/update`, zoneData, getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Éxito",
          description: "Zona flexible actualizada correctamente"
        });
        
        // Actualizar lista de zonas
        fetchFlexibleZones();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Error al actualizar la zona flexible",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error(`Error al actualizar zona flexible ${zoneId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la zona flexible",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una ruta fija
  const deleteFixedRoute = async (routeId: string) => {
    try {
      setLoading(true);
      
      // Llamada a la API real
      const response = await axios.delete(`/api/admin/routes/fixed/${routeId}/delete`, getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Éxito",
          description: "Ruta fija eliminada correctamente"
        });
        
        // Actualizar lista de rutas
        fetchFixedRoutes();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Error al eliminar la ruta fija",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error(`Error al eliminar ruta fija ${routeId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la ruta fija",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una zona flexible
  const deleteFlexibleZone = async (zoneId: string) => {
    try {
      setLoading(true);
      
      // Llamada a la API real
      const response = await axios.delete(`/api/admin/routes/flexible/${zoneId}/delete`, getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Éxito",
          description: "Zona flexible eliminada correctamente"
        });
        
        // Actualizar lista de zonas
        fetchFlexibleZones();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Error al eliminar la zona flexible",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error(`Error al eliminar zona flexible ${zoneId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la zona flexible",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de una ruta fija (activo/inactivo)
  const toggleFixedRouteStatus = async (routeId: string) => {
    try {
      setLoading(true);
      
      // Llamada a la API real
      const response = await axios.patch(`/api/admin/routes/fixed/${routeId}/toggle-status`, {}, getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Éxito",
          description: `Ruta fija actualizada a estado: ${response.data.new_status}`
        });
        
        // Actualizar lista de rutas
        fetchFixedRoutes();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Error al cambiar el estado de la ruta fija",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error(`Error al cambiar estado de ruta fija ${routeId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la ruta fija",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de una zona flexible (activo/inactivo)
  const toggleFlexibleZoneStatus = async (zoneId: string) => {
    try {
      setLoading(true);
      
      // Llamada a la API real
      const response = await axios.patch(`/api/admin/routes/flexible/${zoneId}/toggle-status`, {}, getAuthHeaders());
      
      if (response.data && response.data.status === 'success') {
        toast({
          title: "Éxito",
          description: `Zona flexible actualizada a estado: ${response.data.new_status}`
        });
        
        // Actualizar lista de zonas
        fetchFlexibleZones();
        return true;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Error al cambiar el estado de la zona flexible",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error(`Error al cambiar estado de zona flexible ${zoneId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la zona flexible",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 text-black animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-600">Cargando datos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-12 w-12 text-black mb-4" />
        <h2 className="text-xl font-medium text-gray-600">{error}</h2>
        <Button 
          onClick={() => activeTab === "fixed" ? fetchFixedRoutes() : fetchFlexibleZones()} 
          className="mt-4 bg-black hover:bg-gray-800 text-white"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Rutas</h1>
      </div>
      
      <Tabs 
        defaultValue="fixed" 
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          // Resetear búsqueda al cambiar de pestaña
          setSearchQuery("");
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="fixed" className="text-base py-3">
            <Map className="h-4 w-4 mr-2" />
            Rutas Fijas
          </TabsTrigger>
          <TabsTrigger value="flexible" className="text-base py-3">
            <Map className="h-4 w-4 mr-2" />
            Rutas Flexibles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="fixed">
          <FixedRoutesTab 
            routes={fixedRoutes}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateRoute={createFixedRoute}
            onUpdateRoute={updateFixedRoute}
            onDeleteRoute={deleteFixedRoute}
            onToggleStatus={toggleFixedRouteStatus}
          />
        </TabsContent>
        
        <TabsContent value="flexible">
          <FlexibleRoutesTab
            zones={flexibleZones}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateZone={createFlexibleZone}
            onUpdateZone={updateFlexibleZone}
            onDeleteZone={deleteFlexibleZone}
            onToggleStatus={toggleFlexibleZoneStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoutesSection; 