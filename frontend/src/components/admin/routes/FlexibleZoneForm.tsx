import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Car, DollarSign, Save, X, Loader2, Info, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { FlexibleZone } from "@/components/admin/sections/RoutesSection";
import axios from "axios";
import GooglePlacesAutocomplete, { PlacePrediction, PlaceDetails } from "../common/GooglePlacesAutocomplete";

// Tipo para los vehículos
interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  imageUrl?: string;
  details?: any;
}

// Tipo para colaboradores
interface Collaborator {
  id: string;
  name: string;
  country: string;
  type: 'company' | 'individual';
}

interface FlexibleZoneFormProps {
  editMode: boolean;
  zoneData: FlexibleZone | null;
  onSubmit: (zoneData: Partial<FlexibleZone>) => Promise<boolean>;
  onCancel: () => void;
}

const FlexibleZoneForm = ({
  editMode,
  zoneData,
  onSubmit,
  onCancel
}: FlexibleZoneFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<PlacePrediction | null>(null);
  const [, setCenterDetails] = useState<PlaceDetails | null>(null);
  const [enableDistanceRestrictions, setEnableDistanceRestrictions] = useState(false);
  
  // Valores del formulario
  const [formValues, setFormValues] = useState({
    name: "",
    collaboratorId: "",
    center: {
      name: "",
      place_id: "",
      location: {
        type: "Point",
        coordinates: [-99.1332, 19.4326] as [number, number] // Centro CDMX por defecto
      }
    },
    radius: 10,
    pricing: {
      perKm: 25,
      minFare: 300,
      nightSurcharge: 10,
      holidaySurcharge: 15,
      currency: "MXN"
    },
    restrictions: {
      minDistance: 3,
      maxDistance: 30
    },
    vehicleIds: [] as string[],
    status: "active",
    description: ""
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchCollaborators();
    
    if (editMode && zoneData) {
      // Inicializar el formulario con los datos de la zona existente
      setFormValues({
        name: zoneData.name,
        collaboratorId: zoneData.collaboratorId || "", // Usar el ID del colaborador de la zona si existe
        center: {
          name: zoneData.center.name,
          place_id: "",
          location: zoneData.center.location
        },
        radius: zoneData.radius,
        pricing: {
          perKm: zoneData.pricing.perKm,
          minFare: zoneData.pricing.minFare,
          nightSurcharge: zoneData.pricing.nightSurcharge,
          holidaySurcharge: zoneData.pricing.holidaySurcharge,
          currency: zoneData.pricing.currency
        },
        restrictions: {
          minDistance: zoneData.restrictions?.minDistance || 0,
          maxDistance: zoneData.restrictions?.maxDistance || 0
        },
        vehicleIds: zoneData.vehicles.map(v => v.id),
        status: zoneData.status,
        description: zoneData.description || ""
      });
      
      // Configurar estado para restricciones de distancia
      setEnableDistanceRestrictions(
        !!zoneData.restrictions && 
        ((zoneData.restrictions?.minDistance ?? 0) > 0 || (zoneData.restrictions?.maxDistance ?? 0) > 0)
      );
      
      // Configurar vehículos seleccionados
      setSelectedVehicles(zoneData.vehicles.map(v => v.id));
      
      // Si hay un collaboratorId, cargar los vehículos de ese colaborador
      if (zoneData.collaboratorId && zoneData.collaboratorId.trim() !== '') {
        fetchVehiclesByCollaborator(zoneData.collaboratorId);
      }
    }
  }, [editMode, zoneData]);

  // Cargar vehículos cuando cambia el colaborador seleccionado
  useEffect(() => {
    if (formValues.collaboratorId && formValues.collaboratorId.trim() !== '') {
      fetchVehiclesByCollaborator(formValues.collaboratorId);
    }
  }, [formValues.collaboratorId]);

  // Actualizar nombre de la zona cuando cambia el centro seleccionado
  useEffect(() => {
    if (formValues.center.name && !editMode) {
      // Extraer parte principal para nombre más corto
      const centerName = selectedCenter?.structured_formatting?.main_text || formValues.center.name;
      
      // Crear un nombre para la zona basado en la ubicación central
      const zoneName = `Zona ${centerName} (${formValues.radius}km)`;
      setFormValues(prev => ({ ...prev, name: zoneName }));
    }
  }, [formValues.center.name, formValues.radius, editMode, selectedCenter]);

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

  // Obtener colaboradores
  const fetchCollaborators = async () => {
    try {
      setLoadingCollaborators(true);
      
      // Llamada real a la API
      const response = await axios.get('/api/admin/collaborators/list', getAuthHeaders());
      if (response.data && response.data.status === 'success') {
        setCollaborators(response.data.collaborators);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los colaboradores",
          variant: "destructive"
        });
        setCollaborators([]);
      }
    } catch (error) {
      console.error('Error al cargar colaboradores:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los colaboradores",
        variant: "destructive"
      });
      setCollaborators([]);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  // Obtener vehículos por colaborador
  const fetchVehiclesByCollaborator = async (collaboratorId: string) => {
    try {
      setLoadingVehicles(true);
      
      // Llamada real a la API
      const response = await axios.get(`/api/admin/vehicles/by-collaborator/${collaboratorId}`, getAuthHeaders());
      
      if (response.data && response.data.vehicles) {
        console.log("Datos de vehículos recibidos:", response.data.vehicles);
        
        // Convertir formato de API al formato que espera el componente
        const formattedVehicles = response.data.vehicles.map((v: any) => ({
          id: v.id,
          licensePlate: v.licensePlate,
          model: v.model, // Usar el modelo ya formateado desde el backend
          imageUrl: v.image || "",
          details: v.details || {}
        }));
        
        console.log("Vehículos formateados:", formattedVehicles);
        setVehicles(formattedVehicles);
      } else {
        // En caso de que no haya vehículos o la respuesta sea incorrecta
        setVehicles([]);
        toast({
          title: "Advertencia",
          description: "No se encontraron vehículos para este colaborador",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive"
      });
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Manejar inputs anidados
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormValues(prev => {
        // Crear una copia del objeto padre o un objeto vacío si no existe
        const parentObj = prev[parent as keyof typeof prev] || {};
        
        // Retornar el nuevo estado con la propiedad anidada actualizada
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: parent === 'restrictions' ? parseFloat(value) || 0 : value
          }
        };
      });
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejar cambios en el slider de radio
  const handleRadiusChange = (value: number[]) => {
    setFormValues(prev => ({
      ...prev,
      radius: value[0]
    }));
  };

  // Manejar selección de ubicación del centro
  const handleCenterSelect = (prediction: PlacePrediction | null) => {
    setSelectedCenter(prediction);
    if (prediction) {
      setFormValues(prev => ({
        ...prev,
        center: {
          ...prev.center,
          name: prediction.description,
          place_id: prediction.place_id
        }
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        center: {
          ...prev.center,
          name: "",
          place_id: ""
        }
      }));
    }
  };

  // Manejar detalles del centro
  const handleCenterDetails = (details: PlaceDetails) => {
    setCenterDetails(details);
    if (details && details.geometry && details.geometry.location) {
      const { lat, lng } = details.geometry.location;
      setFormValues(prev => ({
        ...prev,
        center: {
          ...prev.center,
          location: {
            type: "Point",
            coordinates: [lng, lat]
          }
        }
      }));
    }
  };

  // Manejar cambios en los select
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'currency') {
      setFormValues(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          currency: value
        }
      }));
    } else if (name === 'status') {
      setFormValues(prev => ({ ...prev, status: value }));
    } else if (name === 'collaboratorId') {
      // Evitar cambios innecesarios si el valor es el mismo
      if (value === formValues.collaboratorId) {
        return;
      }
      
      // Primero actualizar el estado
      setFormValues(prev => ({ 
        ...prev, 
        collaboratorId: value,
        vehicleIds: [] // Resetear los vehículos seleccionados
      }));
      
      // Luego resetear los vehículos seleccionados
      setSelectedVehicles([]);
      
      // Por último, cargar vehículos del colaborador si hay un ID válido
      if (value && value.trim() !== '') {
        fetchVehiclesByCollaborator(value);
      }
    }
  };

  // Manejar cambios en los precios
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setFormValues(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: numValue
      }
    }));
  };

  // Manejar selección de vehículos
  const handleVehicleToggle = (vehicleId: string) => {
    // Actualizar la lista de vehículos seleccionados
    setSelectedVehicles(prevSelected => {
      const newSelected = prevSelected.includes(vehicleId)
        ? prevSelected.filter(id => id !== vehicleId)
        : [...prevSelected, vehicleId];
      
      // Actualizar formValues.vehicleIds en la misma operación para evitar rerenders adicionales
      setFormValues(prev => ({
        ...prev,
        vehicleIds: newSelected
      }));
      
      return newSelected;
    });
  };

  // Validar formulario
  const validateForm = () => {
    if (!formValues.collaboratorId) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar un colaborador",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formValues.name) {
      toast({
        title: "Error de validación",
        description: "El nombre de la zona es obligatorio",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formValues.center.name) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar el centro de la zona",
        variant: "destructive"
      });
      return false;
    }
    
    if (formValues.radius <= 0) {
      toast({
        title: "Error de validación",
        description: "El radio debe ser mayor que cero",
        variant: "destructive"
      });
      return false;
    }
    
    if (formValues.pricing.perKm <= 0) {
      toast({
        title: "Error de validación",
        description: "El precio por kilómetro debe ser mayor que cero",
        variant: "destructive"
      });
      return false;
    }
    
    if (formValues.pricing.minFare <= 0) {
      toast({
        title: "Error de validación",
        description: "La tarifa mínima debe ser mayor que cero",
        variant: "destructive"
      });
      return false;
    }
    
    if (selectedVehicles.length === 0) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar al menos un vehículo",
        variant: "destructive"
      });
      return false;
    }
    
    if (enableDistanceRestrictions) {
      if (formValues.restrictions.minDistance >= formValues.restrictions.maxDistance) {
        toast({
          title: "Error de validación",
          description: "La distancia mínima debe ser menor que la distancia máxima",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar vehículos
      const selectedVehicleObjects = vehicles
        .filter(vehicle => selectedVehicles.includes(vehicle.id))
        .map(vehicle => {
          console.log("Vehículo seleccionado para enviar:", vehicle);
          return {
            id: vehicle.id,
            model: vehicle.model,  // Usar el modelo ya formateado
            licensePlate: vehicle.licensePlate
          };
        });
      
      console.log("Vehículos formateados para enviar:", selectedVehicleObjects);
      
      // Preparar datos para enviar
      const zoneDataToSubmit: Partial<FlexibleZone> = {
        name: formValues.name,
        center: {
          name: formValues.center.name,
          location: formValues.center.location
        },
        radius: formValues.radius,
        pricing: formValues.pricing,
        vehicles: selectedVehicleObjects,
        status: formValues.status as 'active' | 'inactive',
        description: formValues.description,
        collaboratorId: formValues.collaboratorId
      };
      
      // Incluir restricciones solo si están habilitadas
      if (enableDistanceRestrictions) {
        zoneDataToSubmit.restrictions = formValues.restrictions;
      }
      
      // Enviar datos
      const success = await onSubmit(zoneDataToSubmit);
      
      if (success) {
        toast({
          title: "Éxito",
          description: editMode 
            ? "Zona actualizada correctamente" 
            : "Zona creada correctamente"
        });
      }
    } catch (error) {
      console.error('Error al guardar zona:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la zona",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {editMode ? "Editar Zona Flexible" : "Nueva Zona Flexible"}
            </h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center bg-black hover:bg-gray-800"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editMode ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </div>

          <form className="space-y-6">
            {/* Selección de colaborador */}
            <div className="mb-6">
              <Label className="font-medium text-base">Seleccionar Colaborador</Label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Select 
                value={formValues.collaboratorId || ""}
                onValueChange={(value) => {
                  if (value && value !== formValues.collaboratorId) {
                    handleSelectChange('collaboratorId', value);
                  }
                }}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder={loadingCollaborators ? "Cargando colaboradores..." : "Seleccionar colaborador"} />
                </SelectTrigger>
                <SelectContent>
                  {collaborators.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.name} ({collaborator.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>
            
            {/* Nombre de la zona */}
            <div>
              <Label htmlFor="name">Nombre de la Zona</Label>
              <Input 
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="El nombre se generará automáticamente"
                className="mt-1"
              />
            </div>

            {/* Ubicación central con Google Places */}
            <div>
              <Label htmlFor="center">Centro de la Zona</Label>
              <GooglePlacesAutocomplete
                label="Ubicación central"
                placeholder="Buscar dirección, aeropuerto, hotel..."
                value={formValues.center.name}
                onChange={handleCenterSelect}
                onSelect={handleCenterDetails}
                className="mt-1"
              />
            </div>

            {/* Radio de cobertura */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="radius">Radio de Cobertura: <span className="font-semibold">{formValues.radius} km</span></Label>
              </div>
              <div className="py-4">
                <Slider
                  value={[formValues.radius]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={handleRadiusChange}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>

            {/* Precios */}
            <div>
              <h3 className="text-lg font-medium mb-3">Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="perKm">Precio por Kilómetro</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="perKm"
                      name="perKm"
                      type="number"
                      value={formValues.pricing.perKm}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="minFare">Tarifa Mínima</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="minFare"
                      name="minFare"
                      type="number"
                      value={formValues.pricing.minFare}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nightSurcharge">Recargo Nocturno (%)</Label>
                  <div className="relative mt-1">
                    <Input 
                      id="nightSurcharge"
                      name="nightSurcharge"
                      type="number"
                      value={formValues.pricing.nightSurcharge}
                      onChange={handlePriceChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="holidaySurcharge">Recargo Festivo (%)</Label>
                  <div className="relative mt-1">
                    <Input 
                      id="holidaySurcharge"
                      name="holidaySurcharge"
                      type="number"
                      value={formValues.pricing.holidaySurcharge}
                      onChange={handlePriceChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="currency">Moneda</Label>
                <Select 
                  value={formValues.pricing.currency || "MXN"}
                  onValueChange={(value) => {
                    if (value && value !== formValues.pricing.currency) {
                      handleSelectChange('currency', value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                    <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Restricciones de distancia */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Restricciones de Distancia</h3>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={enableDistanceRestrictions}
                    onCheckedChange={setEnableDistanceRestrictions}
                    id="enableRestrictions"
                  />
                  <Label htmlFor="enableRestrictions" className="cursor-pointer">
                    {enableDistanceRestrictions ? "Activadas" : "Desactivadas"}
                  </Label>
                </div>
              </div>
              
              {enableDistanceRestrictions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <div>
                    <Label htmlFor="minDistance">Distancia Mínima (km)</Label>
                    <Input 
                      id="minDistance"
                      name="restrictions.minDistance"
                      type="number"
                      value={formValues.restrictions.minDistance}
                      onChange={handleInputChange}
                      min={0}
                      step={0.5}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDistance">Distancia Máxima (km)</Label>
                    <Input 
                      id="maxDistance"
                      name="restrictions.maxDistance"
                      type="number"
                      value={formValues.restrictions.maxDistance}
                      onChange={handleInputChange}
                      min={0}
                      step={0.5}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Vehículos disponibles */}
            <div>
              <h3 className="text-lg font-medium mb-3">Vehículos Disponibles</h3>
              {!formValues.collaboratorId ? (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-md bg-gray-50">
                  <Info className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-500">Seleccione un colaborador para ver vehículos disponibles</span>
                </div>
              ) : loadingVehicles ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 text-black animate-spin" />
                  <span className="ml-2">Cargando vehículos...</span>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-md bg-gray-50">
                  <Info className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-500">No hay vehículos disponibles para este colaborador</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {vehicles.map((vehicle) => (
                    <div 
                      key={vehicle.id}
                      className={`
                        flex items-center p-3 border rounded-md cursor-pointer transition-colors
                        ${selectedVehicles.includes(vehicle.id) 
                          ? 'border-gray-300 bg-gray-100' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'}
                      `}
                      onClick={() => handleVehicleToggle(vehicle.id)}
                    >
                      <div className="flex-shrink-0">
                        {vehicle.imageUrl ? (
                          <img 
                            src={vehicle.imageUrl} 
                            alt={vehicle.model} 
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                            <Car className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{vehicle.model}</div>
                        <div className="text-sm text-gray-500">{vehicle.licensePlate}</div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Checkbox 
                          checked={selectedVehicles.includes(vehicle.id)}
                          onCheckedChange={(_checked) => {
                            // Evitar la propagación de eventos para que no se llame handleVehicleToggle dos veces
                            // El div padre ya maneja el clic
                          }}
                          className="h-5 w-5"
                          onClick={(e) => {
                            // Detener la propagación para que el evento del div padre no se active
                            e.stopPropagation();
                            handleVehicleToggle(vehicle.id);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Estado de la zona */}
            <div>
              <h3 className="text-lg font-medium mb-3">Estado</h3>
              <div className="flex items-center space-x-4">
                <Label htmlFor="status">Estado de la zona:</Label>
                <Select 
                  value={formValues.status || "active"}
                  onValueChange={(value) => {
                    if (value && value !== formValues.status) {
                      handleSelectChange('status', value);
                    }
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notas o descripción */}
            <div>
              <Label htmlFor="description">Notas o Descripción (opcional)</Label>
              <Textarea 
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                placeholder="Añade notas o detalles adicionales sobre esta zona..."
                rows={3}
                className="mt-1"
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlexibleZoneForm; 