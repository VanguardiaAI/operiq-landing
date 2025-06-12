import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Car, 
  Clock, 
  DollarSign, 
  Save, 
  X, 
  Loader2,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  User,
  Building,
  Info
} from "lucide-react";
import { FixedRoute } from "@/components/admin/sections/RoutesSection";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import GooglePlacesAutocomplete, { PlacePrediction, PlaceDetails } from "../common/GooglePlacesAutocomplete";

// Tipo para los vehículos obtenidos de la API
interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  imageUrl?: string;
  details?: any;
  driver?: {
    id: string;
    name: string;
    photo?: string;
  };
}

// Tipo para colaboradores
interface Collaborator {
  id: string;
  name: string;
  country: string;
  type: 'company' | 'individual';
}

interface FixedRouteFormProps {
  editMode: boolean;
  routeData: FixedRoute | null;
  onSubmit: (routeData: Partial<FixedRoute>) => Promise<boolean>;
  onCancel: () => void;
}

const FixedRouteForm = ({
  editMode,
  routeData,
  onSubmit,
  onCancel
}: FixedRouteFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<PlacePrediction | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<PlacePrediction | null>(null);
  const [, setOriginDetails] = useState<PlaceDetails | null>(null);
  const [, setDestinationDetails] = useState<PlaceDetails | null>(null);
  
  // Valores del formulario
  const [formValues, setFormValues] = useState({
    name: "",
    collaboratorId: "",
    origin: {
      name: "",
      place_id: "",
      location: {
        type: "Point",
        coordinates: [-99.0, 19.4] as [number, number]
      }
    },
    destination: {
      name: "",
      place_id: "",
      location: {
        type: "Point",
        coordinates: [-99.2, 19.3] as [number, number]
      }
    },
    vehicleIds: [] as string[],
    pricing: {
      standard: 0,
      night: 0,
      holiday: 0,
      currency: "MXN"
    },
    timeSlots: [""],
    days: [] as string[],
    status: "draft",
    description: ""
  });

  // Cargar datos iniciales
  useEffect(() => {
    console.log("FixedRouteForm - Datos recibidos:", {
      editMode,
      routeData,
      routeId: routeData?.id
    });
    
    fetchCollaborators();
    
    if (editMode && routeData) {
      // Inicializar el formulario con los datos de la ruta existente
      setFormValues({
        name: routeData.name,
        collaboratorId: routeData.collaboratorId || "", // Usar el ID del colaborador de la ruta si existe
        origin: {
          name: routeData.origin.name,
          place_id: "",
          location: routeData.origin.location
        },
        destination: {
          name: routeData.destination.name,
          place_id: "",
          location: routeData.destination.location
        },
        // Cargar todos los IDs de vehículos si existen, o usar el vehicle principal como fallback
        vehicleIds: routeData.vehicles ? routeData.vehicles.map(v => v.id) : (routeData.vehicle ? [routeData.vehicle.id] : []),
        pricing: {
          standard: routeData.pricing.standard,
          night: routeData.pricing.night,
          holiday: routeData.pricing.holiday,
          currency: routeData.pricing.currency
        },
        timeSlots: routeData.availability.timeSlots,
        days: routeData.availability.days,
        status: routeData.status,
        description: ""
      });
      
      // Agregar los vehículos seleccionados a la lista
      if (routeData.vehicles && routeData.vehicles.length > 0) {
        // Si hay un array de vehículos, usarlos
        setSelectedVehicles(routeData.vehicles.map(v => ({
          id: v.id,
          licensePlate: v.licensePlate,
          model: v.model,
          imageUrl: v.imageUrl,
          driver: routeData.drivers?.find(d => d.id === v.id)
        })));
      } else if (routeData.vehicle) {
        // Compatibilidad con versión anterior: usar el vehicle individual
        setSelectedVehicles([{
          id: routeData.vehicle.id,
          licensePlate: routeData.vehicle.licensePlate,
          model: routeData.vehicle.model,
          imageUrl: routeData.vehicle.imageUrl,
          driver: routeData.driver
        }]);
      }
      
      // Si hay un collaboratorId, cargar los vehículos de ese colaborador
      if (routeData.collaboratorId && routeData.collaboratorId.trim() !== '') {
        fetchVehiclesByCollaborator(routeData.collaboratorId);
      }
    }
  }, [editMode, routeData]);

  // Cargar vehículos cuando cambia el colaborador seleccionado
  useEffect(() => {
    if (formValues.collaboratorId && formValues.collaboratorId.trim() !== '') {
      fetchVehiclesByCollaborator(formValues.collaboratorId);
    }
  }, [formValues.collaboratorId]);

  // Actualizar nombre de la ruta cuando cambian origen y destino
  useEffect(() => {
    if (formValues.origin.name && formValues.destination.name && !editMode) {
      // Extraer partes principales para nombre más corto
      const originName = selectedOrigin?.structured_formatting?.main_text || formValues.origin.name;
      const destinationName = selectedDestination?.structured_formatting?.main_text || formValues.destination.name;
      
      // Crear un nombre de ruta basado en origen y destino
      const routeName = `${originName} → ${destinationName}`;
      setFormValues(prev => ({ ...prev, name: routeName }));
    }
  }, [formValues.origin.name, formValues.destination.name, editMode, selectedOrigin, selectedDestination]);

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

  // Obtener vehículos disponibles por colaborador
  const fetchVehiclesByCollaborator = async (collaboratorId: string) => {
    try {
      setLoadingVehicles(true);
      
      // Llamada real a la API
      const response = await axios.get(`/api/admin/vehicles/by-collaborator/${collaboratorId}`, getAuthHeaders());
      if (response.data && response.data.vehicles) {
        console.log("Datos de vehículos recibidos:", response.data.vehicles);
        
        // Convertir formato de API al formato que espera el componente
        const formattedVehicles: Vehicle[] = response.data.vehicles.map((v: any) => ({
          id: v.id,
          licensePlate: v.licensePlate,
          // Usar el campo model ya formateado con marca, modelo y año
          model: v.model,
          imageUrl: v.image || "",
          // Guardar los detalles completos
          details: v.details || {},
          // Si hay un conductor asociado, incluirlo
          ...(v.associatedDriver ? {
            driver: {
              id: v.associatedDriver.id,
              name: v.associatedDriver.name,
              photo: v.associatedDriver.photo || ""
            }
          } : {})
        }));
        
        console.log("Vehículos formateados:", formattedVehicles);
        
        // Si estamos en modo edición y tenemos un vehículo seleccionado que no está en la lista,
        // lo agregamos para asegurarnos de que esté disponible para selección
        if (editMode && selectedVehicles.length > 0 && !formattedVehicles.some(v => v.id === selectedVehicles[0].id)) {
          formattedVehicles.push(selectedVehicles[0]);
        }
        
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
        description: "No se pudieron cargar los vehículos disponibles",
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
            [child]: value
          }
        };
      });
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejar selección de origen con Google Places
  const handleOriginSelect = (prediction: PlacePrediction | null) => {
    setSelectedOrigin(prediction);
    if (prediction) {
      setFormValues(prev => ({
        ...prev,
        origin: {
          ...prev.origin,
          name: prediction.description,
          place_id: prediction.place_id
        }
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        origin: {
          ...prev.origin,
          name: "",
          place_id: ""
        }
      }));
    }
  };

  // Manejar selección de destino con Google Places
  const handleDestinationSelect = (prediction: PlacePrediction | null) => {
    setSelectedDestination(prediction);
    if (prediction) {
      setFormValues(prev => ({
        ...prev,
        destination: {
          ...prev.destination,
          name: prediction.description,
          place_id: prediction.place_id
        }
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        destination: {
          ...prev.destination,
          name: "",
          place_id: ""
        }
      }));
    }
  };

  // Manejar detalles de origen
  const handleOriginDetails = (details: PlaceDetails) => {
    setOriginDetails(details);
    if (details && details.geometry && details.geometry.location) {
      const { lat, lng } = details.geometry.location;
      setFormValues(prev => ({
        ...prev,
        origin: {
          ...prev.origin,
          location: {
            type: "Point",
            coordinates: [lng, lat]
          }
        }
      }));
    }
  };

  // Manejar detalles de destino
  const handleDestinationDetails = (details: PlaceDetails) => {
    setDestinationDetails(details);
    if (details && details.geometry && details.geometry.location) {
      const { lat, lng } = details.geometry.location;
      setFormValues(prev => ({
        ...prev,
        destination: {
          ...prev.destination,
          location: {
            type: "Point",
            coordinates: [lng, lat]
          }
        }
      }));
    }
  };

  // Manejar selección de vehículos (nuevo)
  const handleVehicleToggle = (vehicleId: string) => {
    // Verificar si el vehículo ya está seleccionado
    const isSelected = formValues.vehicleIds.includes(vehicleId);
    let newVehicleIds: string[];
    
    if (isSelected) {
      // Si ya está seleccionado, quitarlo
      newVehicleIds = formValues.vehicleIds.filter(id => id !== vehicleId);
    } else {
      // Si no está seleccionado, agregarlo
      newVehicleIds = [...formValues.vehicleIds, vehicleId];
    }
    
    // Actualizar los IDs de vehículos
    setFormValues(prev => ({
      ...prev,
      vehicleIds: newVehicleIds
    }));
    
    // Actualizar los vehículos seleccionados
    const selectedVehicleObjects = vehicles.filter(vehicle => 
      newVehicleIds.includes(vehicle.id)
    );
    setSelectedVehicles(selectedVehicleObjects);
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
      
      // En modo edición, conservar el vehículo y driver originales si es posible
      if (editMode && routeData && selectedVehicles.length > 0) {
        setFormValues(prev => ({ 
          ...prev, 
          collaboratorId: value,
        }));
      } else {
        // En modo creación, reseteamos los vehículos
        setFormValues(prev => ({ 
          ...prev, 
          collaboratorId: value,
          vehicleIds: [] // Resetear los vehículos seleccionados
        }));
        setSelectedVehicles([]);
      }
      
      // Cargar vehículos del nuevo colaborador seleccionado, solo si hay un ID válido
      if (value && value.trim() !== '') {
        fetchVehiclesByCollaborator(value);
      }
    }
  };

  // Manejar cambios en los precios
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    setFormValues(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: numValue
      }
    }));
  };

  // Manejar cambios en los horarios
  const handleTimeSlotChange = (index: number, value: string) => {
    setFormValues(prev => {
      const newTimeSlots = [...prev.timeSlots];
      newTimeSlots[index] = value;
      return { ...prev, timeSlots: newTimeSlots };
    });
  };

  // Añadir nuevo horario
  const addTimeSlot = () => {
    setFormValues(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, ""]
    }));
  };

  // Eliminar horario
  const removeTimeSlot = (index: number) => {
    setFormValues(prev => {
      const newTimeSlots = [...prev.timeSlots];
      newTimeSlots.splice(index, 1);
      return { ...prev, timeSlots: newTimeSlots };
    });
  };

  // Manejar cambios en los días
  const handleDayToggle = (day: string) => {
    setFormValues(prev => {
      // Si el día ya está seleccionado, eliminarlo. Si no, añadirlo.
      const newDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      
      return { ...prev, days: newDays };
    });
  };

  // Validar formulario
  const validateForm = () => {
    console.log("Iniciando validación del formulario...");
    
    // Validaciones básicas
    if (!formValues.name) {
      console.error("Validación fallida: Nombre de ruta vacío");
      toast({
        title: "Error de validación",
        description: "El nombre de la ruta es obligatorio",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formValues.collaboratorId) {
      console.error("Validación fallida: No se seleccionó colaborador");
      toast({
        title: "Error de validación",
        description: "Debe seleccionar un colaborador",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formValues.origin.name) {
      console.error("Validación fallida: Origen vacío");
      toast({
        title: "Error de validación",
        description: "El origen es obligatorio",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formValues.destination.name) {
      console.error("Validación fallida: Destino vacío");
      toast({
        title: "Error de validación",
        description: "El destino es obligatorio",
        variant: "destructive"
      });
      return false;
    }
    
    if (formValues.origin.place_id === formValues.destination.place_id && formValues.origin.place_id) {
      console.error("Validación fallida: Origen y destino son iguales");
      toast({
        title: "Error de validación",
        description: "El origen y el destino no pueden ser el mismo",
        variant: "destructive"
      });
      return false;
    }
    
    // Validar que se ha seleccionado al menos un vehículo
    if (formValues.vehicleIds.length === 0) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar al menos un vehículo",
        variant: "destructive"
      });
      return false;
    }
    
    if (formValues.pricing.standard <= 0) {
      console.error("Validación fallida: Precio estándar inválido");
      toast({
        title: "Error de validación",
        description: "El precio estándar debe ser mayor que cero",
        variant: "destructive"
      });
      return false;
    }
    
    if (formValues.timeSlots.some(slot => !slot)) {
      console.error("Validación fallida: Hay horarios vacíos");
      toast({
        title: "Error de validación",
        description: "Todos los horarios deben estar completados",
        variant: "destructive"
      });
      return false;
    }
    
    if (formValues.days.length === 0) {
      console.error("Validación fallida: No se seleccionaron días");
      toast({
        title: "Error de validación",
        description: "Debe seleccionar al menos un día disponible",
        variant: "destructive"
      });
      return false;
    }
    
    console.log("Validación exitosa: Todos los campos son válidos");
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
      
      // Obtener los vehículos seleccionados
      const allSelectedVehicles = selectedVehicles.map(v => {
        console.log("Vehículo original en selectedVehicles:", v);
        
        // El modelo ya viene formateado desde el backend
        return {
          id: v.id,
          licensePlate: v.licensePlate, 
          model: v.model,
          imageUrl: v.imageUrl
        };
      });
      
      console.log("Vehículos formateados para enviar:", allSelectedVehicles);
      
      // Obtener el vehículo principal para compatibilidad
      const mainVehicle = selectedVehicles.find(v => v.id === formValues.vehicleIds[0]);
      
      // Obtener conductores asociados a los vehículos
      const driversFromVehicles = selectedVehicles
        .filter(v => v.driver)
        .map(v => v.driver)
        .filter((driver): driver is NonNullable<typeof driver> => !!driver);
      
      if (!mainVehicle) {
        toast({
          title: "Error",
          description: "No se pudo encontrar el vehículo seleccionado",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Preparar los datos para enviar
      const routeDataToSubmit: Partial<FixedRoute> = {
        name: formValues.name,
        origin: {
          name: formValues.origin.name,
          location: formValues.origin.location
        },
        destination: {
          name: formValues.destination.name,
          location: formValues.destination.location
        },
        // Enviar todos los vehículos seleccionados
        vehicles: allSelectedVehicles,
        // Mantener vehicle para compatibilidad
        vehicle: {
          id: mainVehicle.id,
          licensePlate: mainVehicle.licensePlate,
          model: mainVehicle.model,
          imageUrl: mainVehicle.imageUrl
        },
        pricing: formValues.pricing,
        availability: {
          timeSlots: formValues.timeSlots,
          days: formValues.days
        },
        status: formValues.status as 'active' | 'inactive' | 'draft',
        collaboratorId: formValues.collaboratorId
      };
      
      // Agregar los conductores si existen
      if (driversFromVehicles.length > 0) {
        routeDataToSubmit.drivers = driversFromVehicles;
        // Usar el primer conductor como principal para compatibilidad
        routeDataToSubmit.driver = driversFromVehicles[0];
      }
      
      // Enviar los datos
      console.log("--------------------------------------------------------");
      console.log("DATOS FINALES QUE SE ENVIARÁN:", JSON.stringify(routeDataToSubmit, null, 2));
      console.log("--------------------------------------------------------");
      
      const success = await onSubmit(routeDataToSubmit);
      
      if (success) {
        toast({
          title: "Éxito",
          description: editMode 
            ? "Ruta actualizada correctamente" 
            : "Ruta creada correctamente"
        });
      }
    } catch (error) {
      console.error('Error al guardar ruta:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la ruta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar días de semana
  const renderDaysSelection = () => {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "Todos"];
    
    return (
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <div 
            key={day}
            onClick={() => handleDayToggle(day)}
            className={`
              px-3 py-1 rounded-full text-sm cursor-pointer transition-colors
              ${formValues.days.includes(day) 
                ? 'bg-gray-200 text-gray-800 border border-gray-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}
            `}
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {editMode ? "Editar Ruta Fija" : "Nueva Ruta Fija"}
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

            {/* Nombre de la ruta */}
            <div>
              <Label htmlFor="name">Nombre de la Ruta</Label>
              <Input 
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="El nombre se generará automáticamente"
                className="mt-1"
              />
            </div>

            {/* Origen y Destino con Google Places Autocomplete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="origin">Origen</Label>
                <GooglePlacesAutocomplete
                  label="Origen"
                  placeholder="Buscar dirección, aeropuerto, hotel..."
                  value={formValues.origin.name}
                  onChange={handleOriginSelect}
                  onSelect={handleOriginDetails}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destino</Label>
                <GooglePlacesAutocomplete
                  label="Destino"
                  placeholder="Buscar dirección, aeropuerto, hotel..."
                  value={formValues.destination.name}
                  onChange={handleDestinationSelect}
                  onSelect={handleDestinationDetails}
                  className="mt-1"
                />
                {selectedOrigin && selectedDestination && 
                 formValues.origin.place_id && formValues.destination.place_id &&
                 formValues.origin.place_id === formValues.destination.place_id && (
                  <div className="flex items-center mt-2 text-black text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    El origen y destino no pueden ser iguales
                  </div>
                )}
              </div>
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
                        ${formValues.vehicleIds.includes(vehicle.id) 
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
                        {vehicle.driver && (
                          <div className="text-xs text-gray-500 mt-1">
                            <User className="h-3 w-3 inline mr-1" />
                            {vehicle.driver.name}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <Checkbox 
                          checked={formValues.vehicleIds.includes(vehicle.id)}
                          onCheckedChange={(_checked: boolean | 'indeterminate') => {
                            // El div padre maneja el click
                          }}
                          className="h-5 w-5"
                          onClick={(e: React.MouseEvent) => {
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

            {/* Precios */}
            <div>
              <h3 className="text-lg font-medium mb-3">Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="standard">Precio Estándar</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="standard"
                      name="standard"
                      type="number"
                      value={formValues.pricing.standard}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="night">Precio Nocturno</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="night"
                      name="night"
                      type="number"
                      value={formValues.pricing.night}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="holiday">Precio Día Festivo</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="holiday"
                      name="holiday"
                      type="number"
                      value={formValues.pricing.holiday}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="currency">Moneda</Label>
                <Select 
                  value={formValues.pricing.currency}
                  onValueChange={(value) => handleSelectChange('currency', value)}
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

            {/* Disponibilidad: Días y Horarios (combinados) */}
            <div>
              <h3 className="text-lg font-medium mb-3">Disponibilidad</h3>
              
              {/* Días disponibles */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="days" className="text-sm text-gray-600">Días Disponibles</Label>
                </div>
                {renderDaysSelection()}
              </div>
              
              {/* Horarios */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="timeSlots" className="text-sm text-gray-600">Horarios Disponibles</Label>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={addTimeSlot}
                    className="flex items-center h-8"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formValues.timeSlots.map((timeSlot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          value={timeSlot}
                          onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                          placeholder="Ej: 08:00-12:00"
                          className="pl-10"
                        />
                      </div>
                      {formValues.timeSlots.length > 1 && (
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeTimeSlot(index)}
                          className="text-black hover:bg-gray-100 hover:text-gray-600"
                        >
                          <MinusCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Estado de la ruta */}
            <div>
              <h3 className="text-lg font-medium mb-3">Estado</h3>
              <div className="flex items-center space-x-4">
                <Label htmlFor="status">Estado de la ruta:</Label>
                <Select 
                  value={formValues.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
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
                placeholder="Añade notas o detalles adicionales sobre esta ruta..."
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

export default FixedRouteForm; 