import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, ToggleLeft, ToggleRight, MapPin, Car, User, Building, X, Eye, Info, DollarSign, Maximize2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FlexibleZone } from "@/components/admin/sections/RoutesSection";
import FlexibleZoneForm from "./FlexibleZoneForm";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Nueva interfaz para la información del colaborador
interface Collaborator {
  id: string;
  name: string;
}

interface FlexibleRoutesTabProps {
  zones: FlexibleZone[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateZone: (zoneData: Partial<FlexibleZone>) => Promise<boolean>;
  onUpdateZone: (zoneId: string, zoneData: Partial<FlexibleZone>) => Promise<boolean>;
  onDeleteZone: (zoneId: string) => Promise<boolean>;
  onToggleStatus: (zoneId: string) => Promise<boolean>;
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
const GoogleZoneMap = ({ center, radius }: { 
  center: { name: string; location: { type: string; coordinates: [number, number]; }; }; 
  radius: number 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // Inicializar la API key al montar el componente
  useEffect(() => {
    initGoogleMapsKey();
  }, []);
  
  // Validar datos de entrada
  if (!center?.location?.coordinates) {
    return (
      <div className="h-64 w-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
        Faltan coordenadas para mostrar el mapa
      </div>
    );
  }

  // Extraer coordenadas de manera segura
  const centerCoords = {
    lat: center.location.coordinates[1], 
    lng: center.location.coordinates[0]
  };

  // Ajustar el zoom basado en el radio
  let zoom = 12;
  if (radius > 20) zoom = 10;
  else if (radius > 10) zoom = 11;
  else if (radius < 5) zoom = 13;

  // Obtener la API key del localStorage
  const googleApiKey = localStorage.getItem('GOOGLE_MAPS_API_KEY') || initGoogleMapsKey();
  
  // URL para el iframe de Google Maps
  const googleUrl = `https://www.google.com/maps/embed/v1/place?key=${googleApiKey}&q=${centerCoords.lat},${centerCoords.lng}&zoom=${zoom}`;
  
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
        
        <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 p-2 rounded-md text-xs flex flex-col">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold">Centro:</span> {center.name}
            </div>
            <div>
              <span className="font-bold">Radio:</span> {radius} km
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500 flex justify-between items-center">
            {error ? (
              <span className="text-black">{error}</span>
            ) : (
              <span>Google Maps</span>
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
                    <div className="font-bold text-lg mb-1">Zona Flexible</div>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-black mr-1 flex-shrink-0" />
                        <span className="font-medium">Centro:</span>
                        <span className="ml-1">{center.name}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="font-medium">Radio de cobertura:</span>
                        <span className="ml-1">{radius} km</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span className="italic">El área sombreada muestra la zona aproximada de cobertura</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    className="bg-black hover:bg-gray-800 text-white"
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

const FlexibleRoutesTab = ({
  zones,
  searchQuery,
  setSearchQuery,
  onCreateZone,
  onUpdateZone,
  onDeleteZone,
  onToggleStatus
}: FlexibleRoutesTabProps) => {
  // Estados locales
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<FlexibleZone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Estado para el diálogo de detalles
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<FlexibleZone | null>(null);
  
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

  // Filtrar zonas
  const filteredZones = zones.filter(zone => {
    // Filtrar por búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery.trim() ||
      zone.name.toLowerCase().includes(searchLower) ||
      zone.center.name.toLowerCase().includes(searchLower) ||
      zone.vehicles.some(v => v.model.toLowerCase().includes(searchLower) || 
                              v.licensePlate.toLowerCase().includes(searchLower));
    
    // Filtrar por estado
    const matchesStatus = statusFilter === 'all' || zone.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Función para obtener el nombre del colaborador
  const getCollaboratorName = (collaboratorId: string | undefined) => {
    if (!collaboratorId) return "Colaborador no asignado";
    
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    return collaborator ? collaborator.name : "Colaborador no encontrado";
  };

  // Funciones de gestión de zonas
  const handleAddZone = () => {
    setEditingZone(null);
    setShowZoneForm(true);
  };

  const handleEditZone = (zone: FlexibleZone) => {
    setEditingZone(zone);
    setShowZoneForm(true);
  };
  
  const handleViewZoneDetails = (zone: FlexibleZone, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Si no tiene ID pero tiene _id (como viene de MongoDB), usarlo como id
    if (!zone.id && (zone as any)._id) {
      zone = {
        ...zone,
        id: (zone as any)._id
      };
    }
    
    setSelectedZone(zone);
    setShowDetailsDialog(true);
  };

  const handleDeleteZone = (zoneId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedZoneId(zoneId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedZoneId) {
      await onDeleteZone(selectedZoneId);
      setDeleteDialogOpen(false);
      setSelectedZoneId(null);
    }
  };

  const handleZoneSubmit = async (zoneData: Partial<FlexibleZone>): Promise<boolean> => {
    let success = false;
    
    if (editingZone) {
      // Actualizar una zona existente
      success = await onUpdateZone(editingZone.id, zoneData);
    } else {
      // Crear una nueva zona
      success = await onCreateZone(zoneData);
    }
    
    setShowZoneForm(false);
    setEditingZone(null);
    return success;
  };

  const handleToggleStatus = async (zoneId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    await onToggleStatus(zoneId);
  };

  return (
    <div className="space-y-6">
      {showZoneForm ? (
        <FlexibleZoneForm
          editMode={!!editingZone}
          zoneData={editingZone}
          onSubmit={handleZoneSubmit}
          onCancel={() => {
            setShowZoneForm(false);
            setEditingZone(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Buscar zonas..."
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
              </select>
              <Button 
                onClick={handleAddZone}
                className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <PlusCircle size={18} className="mr-2" />
                Nueva Zona Flexible
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre de Zona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Centro y Radio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehículos Asignados
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
                  {filteredZones.map((zone, index) => (
                    <tr 
                      key={`zone-${zone.id || index}`} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => handleViewZoneDetails(zone, e)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0" />
                            <span>{zone.center.name}</span>
                          </div>
                          <div className="ml-5 mt-1 text-xs text-gray-500">
                            Radio: {zone.radius} km
                          </div>
                          {zone.restrictions && (
                            <div className="ml-5 mt-1 text-xs text-gray-500">
                              {zone.restrictions.minDistance && `Mín: ${zone.restrictions.minDistance} km`}
                              {zone.restrictions.maxDistance && zone.restrictions.minDistance && ` • `}
                              {zone.restrictions.maxDistance && `Máx: ${zone.restrictions.maxDistance} km`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <Building className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="text-sm text-gray-900">
                            {getCollaboratorName(zone.collaboratorId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {zone.vehicles.length > 0 ? (
                            <div className="flex flex-col space-y-2">
                              {zone.vehicles.slice(0, 3).map((vehicle, idx) => (
                                <div key={idx} className="flex items-center">
                                  <Car className="h-4 w-4 text-gray-500 mr-2" />
                                  <div>
                                    <span className="font-medium">{vehicle.model}</span>
                                    <span className="ml-2 text-xs text-gray-500">{vehicle.licensePlate}</span>
                                  </div>
                                </div>
                              ))}
                              {zone.vehicles.length > 3 && (
                                <div className="text-xs text-gray-600">
                                  +{zone.vehicles.length - 3} vehículos más
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Sin vehículos asignados</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`
                          ${zone.status === 'active' 
                            ? 'bg-gray-200 text-green-800 hover:bg-gray-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                        `}>
                          {zone.status === 'active' ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {zone.pricing.perKm} {zone.pricing.currency}/km
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Tarifa mínima: {zone.pricing.minFare} {zone.pricing.currency}
                          </div>
                          <div className="text-xs text-gray-500">
                            Recargo noche: +{zone.pricing.nightSurcharge}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Recargo festivo: +{zone.pricing.holidaySurcharge}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewZoneDetails(zone, e);
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
                            handleToggleStatus(zone.id, e);
                          }}
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          {zone.status === 'active' ? (
                            <ToggleRight className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditZone(zone);
                          }}
                          className="text-gray-600 hover:text-blue-800 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteZone(zone.id, e);
                          }}
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredZones.length === 0 && (
                <div className="py-10 text-center">
                  <div className="h-20 w-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    <MapPin className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No se encontraron zonas flexibles que coincidan con los criterios de búsqueda</p>
                  <Button 
                    onClick={handleAddZone}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Crear Nueva Zona
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Diálogo de detalles de zona */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {selectedZone?.name}
              <Badge className={`ml-2 ${
                selectedZone?.status === 'active' ? 'bg-gray-200 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedZone?.status === 'active' ? 'Activa' : 'Inactiva'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Detalles de la zona flexible
            </DialogDescription>
          </DialogHeader>
          
          {selectedZone && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Información General */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-base mb-2">Información General</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Centro de la Zona</div>
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 text-black mt-0.5 mr-1 flex-shrink-0" />
                      <span className="text-base">{selectedZone.center.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500">Radio de Cobertura</div>
                    <div className="flex items-start mt-1">
                      <span className="text-base">{selectedZone.radius} km</span>
                    </div>
                  </div>
                  
                  {selectedZone.restrictions && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-500">Restricciones de Distancia</div>
                      <div className="flex gap-3 mt-1 text-sm text-gray-700">
                        {selectedZone.restrictions.minDistance && (
                          <div>Mínima: {selectedZone.restrictions.minDistance} km</div>
                        )}
                        {selectedZone.restrictions.maxDistance && (
                          <div>Máxima: {selectedZone.restrictions.maxDistance} km</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedZone.description && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-500">Descripción</div>
                      <p className="mt-1 text-gray-700">{selectedZone.description}</p>
                    </div>
                  )}
                </div>
                
                {/* Colaborador */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Colaborador</h3>
                  <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <Building className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {getCollaboratorName(selectedZone.collaboratorId)}
                      </div>
                      <div className="text-xs text-gray-500">ID: {selectedZone.collaboratorId || "No asignado"}</div>
                    </div>
                  </div>
                </div>
                
                {/* Tarifas */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Tarifas</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Por Kilómetro:</div>
                      <div className="text-lg font-medium">{selectedZone.pricing.perKm} {selectedZone.pricing.currency}/km</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Tarifa mínima:</div>
                      <div>{selectedZone.pricing.minFare} {selectedZone.pricing.currency}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Recargo nocturno:</div>
                      <div>+{selectedZone.pricing.nightSurcharge}%</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-500">Recargo en festivos:</div>
                      <div>+{selectedZone.pricing.holidaySurcharge}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vehículos y Acciones */}
              <div className="space-y-4">
                {/* Vehículos */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Vehículos Asignados ({selectedZone.vehicles.length})</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      {selectedZone.vehicles.length > 0 ? (
                        selectedZone.vehicles.map((vehicle, idx) => (
                          <div key={idx} className="flex items-center p-2 border-b last:border-b-0">
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Car className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">{vehicle.model}</div>
                              <div className="text-sm text-gray-600">{vehicle.licensePlate}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          Sin vehículos asignados
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mapa */}
                <div>
                  <h3 className="font-medium text-gray-900 text-base mb-2">Mapa de la Zona</h3>
                  <GoogleZoneMap 
                    center={selectedZone.center}
                    radius={selectedZone.radius}
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
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                if (selectedZone) {
                  setShowDetailsDialog(false);
                  handleEditZone(selectedZone);
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
              Esta acción eliminará permanentemente la zona flexible. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-black hover:bg-gray-800">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FlexibleRoutesTab; 