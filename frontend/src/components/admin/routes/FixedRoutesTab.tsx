import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, ToggleLeft, ToggleRight, MapPin, Clock, Car, User, Building, X, Eye, ExternalLink, Maximize2, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FixedRoute } from "@/components/admin/sections/RoutesSection";
import FixedRouteForm from "./FixedRouteForm";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Nueva interfaz para la información del colaborador
interface Collaborator {
  id: string;
  name: string;
}

interface FixedRoutesTabProps {
  routes: FixedRoute[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateRoute: (routeData: Partial<FixedRoute>) => Promise<boolean>;
  onUpdateRoute: (routeId: string, routeData: Partial<FixedRoute>) => Promise<boolean>;
  onDeleteRoute: (routeId: string) => Promise<boolean>;
  onToggleStatus: (routeId: string) => Promise<boolean>;
}

// Componente para inicializar y almacenar la API key de Google Maps
const initGoogleMapsKey = () => {
  // Para simplificar, usamos una API key fija en desarrollo
  // En producción, esta debería venir de variables de entorno
  const HARDCODED_API_KEY = 'AIzaSyCU7y7Jp7Fk-dLhURDYKBaWx_lWv28qyFc';
  
  // Intentar obtener la API key de diferentes fuentes
  const storedKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Usar la primera disponible o la hardcodeada en último caso
  const apiKey = envKey || storedKey || HARDCODED_API_KEY;
  
  // Guardar en localStorage para uso futuro
  if (apiKey && !storedKey) {
    localStorage.setItem('GOOGLE_MAPS_API_KEY', apiKey);
    console.log("API Key de Google Maps almacenada en localStorage");
  }
  
  return apiKey;
};

// Componente de mapa simplificado que usa la API key inicializada
const GoogleRouteMap = ({ origin, destination }: { 
  origin: { name: string; location: { type: string; coordinates: [number, number]; }; }; 
  destination: { name: string; location: { type: string; coordinates: [number, number]; }; }; 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // Inicializar la API key al montar el componente
  useEffect(() => {
    initGoogleMapsKey();
  }, []);
  
  // Validar datos de entrada
  if (!origin?.location?.coordinates || !destination?.location?.coordinates) {
    return (
      <div className="h-64 w-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
        Faltan coordenadas para mostrar el mapa
      </div>
    );
  }

  // Extraer coordenadas de manera segura
  const originCoords = {
    lat: origin.location.coordinates[1], 
    lng: origin.location.coordinates[0]
  };
  
  const destCoords = {
    lat: destination.location.coordinates[1],
    lng: destination.location.coordinates[0]
  };
  
  // Obtener la API key del localStorage
  const googleApiKey = localStorage.getItem('GOOGLE_MAPS_API_KEY') || initGoogleMapsKey();
  
  // URL para el iframe de Google Maps
  const googleUrl = `https://www.google.com/maps/embed/v1/directions?key=${googleApiKey}&origin=${originCoords.lat},${originCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&mode=driving`;
  
  return (
    <>
      <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border relative bg-gray-50">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}
        
        <iframe 
          src={googleUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoading(false)}
          onError={(e) => {
            console.error("Error al cargar el mapa:", e);
            setError("Error al cargar el mapa");
            setLoading(false);
          }}
        ></iframe>
        
        <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 p-2 rounded-md text-xs flex justify-between items-center">
          <span><span className="font-bold">Ruta:</span> {origin.name} → {destination.name}</span>
          <div className="flex items-center">
            {error && (
              <span className="text-xs bg-red-100 text-red-600 p-1 rounded mr-2">
                {error}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-gray-900"
              onClick={() => setShowFullscreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Ampliar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para mostrar el mapa a pantalla completa */}
      {showFullscreen && (
        <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
          <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
            <div className="relative h-[80vh] w-full">
              <iframe 
                src={googleUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 p-3 rounded-md shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg mb-1">Ruta</div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span className="font-medium">Origen:</span>
                      <span className="ml-1">{origin.name}</span>
                    </div>
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span className="font-medium">Destino:</span>
                      <span className="ml-1">{destination.name}</span>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setShowFullscreen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const FixedRoutesTab = ({
  routes,
  searchQuery,
  setSearchQuery,
  onCreateRoute,
  onUpdateRoute,
  onDeleteRoute,
  onToggleStatus
}: FixedRoutesTabProps) => {
  // Estados locales
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<FixedRoute | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Estado para el diálogo de detalles
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<FixedRoute | null>(null);
  
  // Estado para la lista de colaboradores
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

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
  
  // Cargar la lista de colaboradores al iniciar
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await fetch('/api/admin/collaborators/list', {
          headers: getAuthHeaders().headers
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los colaboradores');
        }
        
        const data = await response.json();
        if (data.status === 'success') {
          setCollaborators(data.collaborators);
        }
      } catch (error) {
        console.error('Error al cargar los colaboradores:', error);
      }
    };
    
    fetchCollaborators();
  }, []);

  // Filtrar rutas
  const filteredRoutes = routes.filter(route => {
    // Filtrar por búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery.trim() ||
      route.name.toLowerCase().includes(searchLower) ||
      route.origin.name.toLowerCase().includes(searchLower) ||
      route.destination.name.toLowerCase().includes(searchLower) ||
      (route.vehicle?.licensePlate && route.vehicle.licensePlate.toLowerCase().includes(searchLower));
    
    // Filtrar por estado
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Funciones de gestión de rutas
  const handleAddRoute = () => {
    setEditingRoute(null);
    setShowRouteForm(true);
  };

  const handleEditRoute = (route: FixedRoute) => {
    console.log("handleEditRoute - Ruta recibida:", route);
    console.log("¿La ruta tiene ID?", !!route.id);
    console.log("Tipo de ID:", typeof route.id);
    
    // Si no tiene ID pero tiene _id (como viene de MongoDB), usarlo como id
    if (!route.id && (route as any)._id) {
      console.log("La ruta no tiene id pero tiene _id:", (route as any)._id);
      route = {
        ...route,
        id: (route as any)._id
      };
      console.log("Ruta con ID asignado:", route);
    }
    
    setEditingRoute(route);
    setShowRouteForm(true);
  };

  const handleViewRouteDetails = (route: FixedRoute, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Si no tiene ID pero tiene _id (como viene de MongoDB), usarlo como id
    if (!route.id && (route as any)._id) {
      route = {
        ...route,
        id: (route as any)._id
      };
    }
    
    setSelectedRoute(route);
    setShowDetailsDialog(true);
  };

  const handleDeleteRoute = (routeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedRouteId(routeId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRouteId) {
      await onDeleteRoute(selectedRouteId);
      setDeleteDialogOpen(false);
      setSelectedRouteId(null);
    }
  };

  const handleRouteSubmit = async (routeData: Partial<FixedRoute>): Promise<boolean> => {
    let success = false;
    
    if (editingRoute) {
      // Actualizar una ruta existente
      console.log("====================================================================================");
      console.log("Intentando actualizar ruta existente");
      console.log("ID de la ruta a actualizar:", editingRoute.id);
      console.log("¿Es válido el ID?:", !!editingRoute.id);
      console.log("Tipo de ID:", typeof editingRoute.id);
      console.log("Datos a enviar para actualización:", JSON.stringify(routeData, null, 2));
      
      if (!editingRoute.id) {
        console.error("Error: falta ID de ruta para actualizar");
        toast({
          title: "Error",
          description: "No se puede actualizar la ruta: falta ID",
          variant: "destructive"
        });
        return false;
      }
      
      try {
        success = await onUpdateRoute(editingRoute.id, routeData);
        console.log("Resultado de la actualización:", success);
      } catch (error) {
        console.error("Error capturado durante la actualización:", error);
        success = false;
      }
      console.log("====================================================================================");
    } else {
      // Crear una nueva ruta
      console.log("Intentando crear nueva ruta");
      console.log("Datos a enviar para creación:", routeData);
      
      try {
        success = await onCreateRoute(routeData);
        console.log("Resultado de la creación:", success);
      } catch (error) {
        console.error("Error capturado durante la creación:", error);
        success = false;
      }
    }
    
    if (success) {
      setShowRouteForm(false);
      setEditingRoute(null);
    } else {
      toast({
        title: "Error",
        description: "No se pudo completar la operación. Verifica los datos e inténtalo de nuevo.",
        variant: "destructive"
      });
    }
    
    return success;
  };

  const handleToggleStatus = async (routeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    await onToggleStatus(routeId);
  };

  // Función para obtener el nombre del colaborador
  const getCollaboratorName = (collaboratorId: string | undefined) => {
    if (!collaboratorId) return "Colaborador no asignado";
    
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    return collaborator ? collaborator.name : "Colaborador no encontrado";
  };

  // Nueva función para truncar direcciones SOLO PARA LA TABLA
  const truncateAddressForTable = (address: string) => {
    const commaIndex = address.indexOf(',');
    if (commaIndex !== -1) {
      return address.substring(0, commaIndex);
    }
    return address;
  };

  return (
    <div className="space-y-6">
      {showRouteForm ? (
        <FixedRouteForm
          editMode={!!editingRoute}
          routeData={editingRoute}
          onSubmit={handleRouteSubmit}
          onCancel={() => {
            setShowRouteForm(false);
            setEditingRoute(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Buscar rutas..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex space-x-3">
              <select 
                className="px-3 py-2 border rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
                <option value="draft">Borrador</option>
              </select>
              <Button 
                onClick={handleAddRoute}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PlusCircle size={18} className="mr-2" />
                Nueva Ruta Fija
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origen → Destino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehículo / Chófer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarifas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoutes.map((route, index) => (
                    <tr 
                      key={`route-${route.id || index}`} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => handleViewRouteDetails(route, e)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{route.name}</div>
                        {route.distance && route.estimatedTime && (
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {route.estimatedTime} min
                            <span className="mx-1">•</span>
                            <MapPin className="h-3 w-3 mr-1" />
                            {route.distance} km
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex flex-col">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                            <span>{truncateAddressForTable(route.origin.name)}</span>
                          </div>
                          <div className="flex items-start mt-2">
                            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-1 flex-shrink-0" />
                            <span>{truncateAddressForTable(route.destination.name)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-sm text-gray-900">
                            {getCollaboratorName(route.collaboratorId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {route.vehicles && route.vehicles.length > 0 ? (
                          <div className="space-y-2">
                            {/* Mostrar el primer vehículo */}
                            <div className="flex items-center">
                              {route.vehicles[0].imageUrl ? (
                                <img 
                                  src={route.vehicles[0].imageUrl} 
                                  alt={route.vehicles[0].model}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Car className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{route.vehicles[0].model}</div>
                                <div className="text-xs text-gray-500">{route.vehicles[0].licensePlate}</div>
                              </div>
                            </div>
                            
                            {/* Mostrar contador si hay más vehículos */}
                            {route.vehicles.length > 1 && (
                              <div className="ml-2 text-xs text-blue-600">
                                +{route.vehicles.length - 1} vehículo{route.vehicles.length - 1 > 1 ? 's' : ''} más
                              </div>
                            )}
                            
                            {/* Mostrar conductor del primer vehículo si existe */}
                            {route.drivers && route.drivers.length > 0 ? (
                              <div className="flex items-center mt-2">
                                {route.drivers[0].photo ? (
                                  <img 
                                    src={route.drivers[0].photo} 
                                    alt={route.drivers[0].name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <span className="ml-2 text-xs text-gray-500">
                                  {route.drivers[0].name}
                                  {route.drivers.length > 1 && ` +${route.drivers.length - 1} más`}
                                </span>
                              </div>
                            ) : route.driver && (
                              <div className="flex items-center mt-2">
                                {route.driver.photo ? (
                                  <img 
                                    src={route.driver.photo} 
                                    alt={route.driver.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <span className="ml-2 text-xs text-gray-500">{route.driver.name}</span>
                              </div>
                            )}
                          </div>
                        ) : route.vehicle ? (
                          // Para compatibilidad con versiones anteriores
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {route.vehicle.imageUrl ? (
                                <img 
                                  src={route.vehicle.imageUrl} 
                                  alt={route.vehicle.model}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Car className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{route.vehicle.model}</div>
                                <div className="text-xs text-gray-500">{route.vehicle.licensePlate}</div>
                              </div>
                            </div>
                            {route.driver && (
                              <div className="flex items-center mt-2">
                                {route.driver.photo ? (
                                  <img 
                                    src={route.driver.photo} 
                                    alt={route.driver.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <span className="ml-2 text-xs text-gray-500">{route.driver.name}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">Sin vehículos asignados</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`
                          ${route.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                            route.status === 'inactive' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : 
                            'bg-amber-100 text-amber-800 hover:bg-amber-100'}
                        `}>
                          {route.status === 'active' ? 'Activa' : 
                           route.status === 'inactive' ? 'Inactiva' : 'Borrador'}
                        </Badge>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500 mr-2">
                            {route.availability.days.map((day, index) => (
                              <span key={`${route.id}-day-${index}`}>
                                {day}{index < route.availability.days.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {route.availability.timeSlots.map((slot, index) => (
                              <span key={`${route.id}-slot-${index}`}>
                                {slot}{index < route.availability.timeSlots.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {route.pricing.standard} {route.pricing.currency}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Noche: {route.pricing.night} {route.pricing.currency}
                          </div>
                          <div className="text-xs text-gray-500">
                            Festivo: {route.pricing.holiday} {route.pricing.currency}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRouteDetails(route, e);
                          }}
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(route.id, e);
                          }}
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          {route.status === 'active' ? (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleEditRoute(route); 
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoute(route.id, e);
                          }}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRoutes.length === 0 && (
                <div className="py-10 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    <MapPin className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No se encontraron rutas fijas que coincidan con los criterios de búsqueda</p>
                  <Button 
                    onClick={handleAddRoute}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Crear Nueva Ruta
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Diálogo de detalles de ruta */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {selectedRoute?.name}
              <Badge className={`ml-2 ${
                selectedRoute?.status === 'active' ? 'bg-green-100 text-green-800' : 
                selectedRoute?.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                'bg-amber-100 text-amber-800'
              }`}>
                {selectedRoute?.status === 'active' ? 'Activa' : 
                 selectedRoute?.status === 'inactive' ? 'Inactiva' : 'Borrador'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Detalles de la ruta fija
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Origen y Destino */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-base mb-2">Información General</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Origen</div>
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span className="text-base">{selectedRoute.origin.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500">Destino</div>
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-1 flex-shrink-0" />
                      <span className="text-base">{selectedRoute.destination.name}</span>
                    </div>
                  </div>
                  
                  {selectedRoute.distance && selectedRoute.estimatedTime && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 border-t pt-2">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{selectedRoute.distance} km</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{selectedRoute.estimatedTime} min</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Colaborador */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Colaborador</h3>
                  <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {getCollaboratorName(selectedRoute.collaboratorId)}
                      </div>
                      <div className="text-xs text-gray-500">ID: {selectedRoute.collaboratorId || "No asignado"}</div>
                    </div>
                  </div>
                </div>
                
                {/* Disponibilidad */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Disponibilidad</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Días</div>
                      <div className="mt-1 text-base">
                        {selectedRoute.availability.days.join(', ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Horarios</div>
                      <div className="mt-1 text-base">
                        {selectedRoute.availability.timeSlots.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vehículo, Tarifas y Acciones */}
              <div className="space-y-4">
                {/* Vehículo */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">
                    Vehículos ({selectedRoute.vehicles ? selectedRoute.vehicles.length : 1})
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedRoute.vehicles && selectedRoute.vehicles.length > 0 ? (
                      // Mostrar todos los vehículos disponibles
                      <div className="space-y-4">
                        {selectedRoute.vehicles.map((vehicle, idx) => (
                          <div key={idx} className={idx > 0 ? "pt-4 border-t border-gray-200" : ""}>
                            <div className="flex items-center">
                              {vehicle.imageUrl ? (
                                <img 
                                  src={vehicle.imageUrl} 
                                  alt={vehicle.model}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Car className="h-8 w-8 text-gray-500" />
                                </div>
                              )}
                              <div className="ml-4 flex-1">
                                <div className="text-lg font-medium">{vehicle.model}</div>
                                <div className="text-base text-gray-600">{vehicle.licensePlate}</div>
                              </div>
                            </div>
                            
                            {/* Mostrar conductor asociado a este vehículo si existe */}
                            {selectedRoute.drivers && selectedRoute.drivers[idx] && (
                              <div className="flex items-center mt-2 ml-4">
                                {selectedRoute.drivers[idx].photo ? (
                                  <img 
                                    src={selectedRoute.drivers[idx].photo} 
                                    alt={selectedRoute.drivers[idx].name}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <div className="ml-2">
                                  <div className="text-sm font-medium">Conductor</div>
                                  <div className="text-sm text-gray-600">{selectedRoute.drivers[idx].name}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : selectedRoute.vehicle ? (
                      // Compatibilidad con versión anterior
                      <div>
                        <div className="flex items-center">
                          {selectedRoute.vehicle.imageUrl ? (
                            <img 
                              src={selectedRoute.vehicle.imageUrl} 
                              alt={selectedRoute.vehicle.model}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Car className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                          <div className="ml-4 flex-1">
                            <div className="text-lg font-medium">{selectedRoute.vehicle.model}</div>
                            <div className="text-base text-gray-600">{selectedRoute.vehicle.licensePlate}</div>
                          </div>
                        </div>
                        
                        {selectedRoute.driver && (
                          <div className="flex items-center mt-4 border-t pt-3">
                            {selectedRoute.driver.photo ? (
                              <img 
                                src={selectedRoute.driver.photo} 
                                alt={selectedRoute.driver.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="font-medium">Conductor</div>
                              <div className="text-gray-600">{selectedRoute.driver.name}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4 text-gray-500">
                        <Info className="h-5 w-5 mr-2" />
                        <span>No hay vehículos asignados</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tarifas */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Tarifas</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Estándar:</div>
                      <div className="text-lg font-medium">{selectedRoute.pricing.standard} {selectedRoute.pricing.currency}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Tarifa nocturna:</div>
                      <div>{selectedRoute.pricing.night} {selectedRoute.pricing.currency}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Tarifa en festivos:</div>
                      <div>{selectedRoute.pricing.holiday} {selectedRoute.pricing.currency}</div>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Mapa de la Ruta</h3>
                  <GoogleRouteMap 
                    origin={selectedRoute.origin}
                    destination={selectedRoute.destination}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
              onClick={() => setShowDetailsDialog(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                if (selectedRoute) {
                  setShowDetailsDialog(false);
                  handleEditRoute(selectedRoute);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la ruta fija. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FixedRoutesTab; 