import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, X, PlusCircle, Car, DollarSign, User, Check, ChevronsUpDown } from "lucide-react";
import axios from "axios";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interfaces para colaboradores y choferes
interface Collaborator {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  status: string;
}

type VehicleFormProps = {
  editMode?: boolean;
  vehicleData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

// Definir la interfaz para manejar la estructura exacta de un vehículo
interface VehicleFormData {
  id?: string;
  name: string;
  type: string;
  category: string;
  description: string;
  details: {
    brand: string;
    model: string;
    year: string;
    color: string;
    features: string[];
    armored: boolean;
    armor_level: string;
  };
  capacity: {
    passengers: number;
    luggage: number;
  };
  pricing: {
    base_fare: number;
    per_km: number;
    per_hour: number;
    currency: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  availability_radius: number;
  available: boolean;
  image: string;
  licensePlate: string;
  ownerType: string;
  ownerName: string;
  ownerCountry: string;
  availabilityType: string[];
  availabilityDetails: string;
  insurancePolicyNumber: string;
  lastMaintenanceDate: string;
  contractEndDate: string;
  associatedDrivers: string[];
  notes: string;
  // Nuevos campos para ids
  collaboratorId?: string;
}

const VehicleForm = ({ editMode = false, vehicleData, onSubmit, onCancel }: VehicleFormProps) => {
  const [formData, setFormData] = useState<VehicleFormData>(() => {
    const defaultData: VehicleFormData = {
      name: "",
      type: "sedan",
      category: "business_class",
      description: "",
      details: {
        brand: "",
        model: "",
        year: "",
        color: "",
        features: [],
        armored: false,
        armor_level: ""
      },
      capacity: {
        passengers: 4,
        luggage: 2
      },
      pricing: {
        base_fare: 50,
        per_km: 2,
        per_hour: 30,
        currency: "EUR"
      },
      location: {
        type: "Point",
        coordinates: [-3.7038, 40.4168] // Madrid por defecto
      },
      availability_radius: 50,
      available: true,
      image: "",
      licensePlate: "",
      ownerType: "company",
      ownerName: "",
      ownerCountry: "ES",
      availabilityType: ["zone"],
      availabilityDetails: "",
      insurancePolicyNumber: "",
      lastMaintenanceDate: "",
      contractEndDate: "",
      associatedDrivers: [],
      notes: "",
      collaboratorId: ""
    };

    if (!vehicleData) return defaultData;

    // Si viene de la API (estructura completa)
    if (
      vehicleData.details && 
      typeof vehicleData.details.brand !== 'undefined' && 
      vehicleData.capacity && 
      typeof vehicleData.capacity.passengers !== 'undefined'
    ) {
      // Convertir availabilityType a array si viene como string
      const availabilityTypeArray = Array.isArray(vehicleData.availabilityType) 
        ? vehicleData.availabilityType 
        : vehicleData.availabilityType ? [vehicleData.availabilityType] : ["zone"];
      
      // Asegurar que tenemos todos los campos obligatorios
      return {
        ...defaultData,
        ...vehicleData,
        details: {
          ...defaultData.details,
          ...vehicleData.details
        },
        capacity: {
          ...defaultData.capacity,
          ...vehicleData.capacity
        },
        pricing: {
          ...defaultData.pricing,
          ...vehicleData.pricing
        },
        location: vehicleData.location || defaultData.location,
        notes: vehicleData.notes || vehicleData.description || "",
        collaboratorId: vehicleData.collaboratorId || "",
        availabilityType: availabilityTypeArray,
        associatedDrivers: vehicleData.associatedDrivers || []
      };
    }

    // Si viene con estructura plana (desde la tabla)
    // Convertir availabilityType a array si viene como string
    const availabilityTypeArray = Array.isArray(vehicleData.availabilityType) 
      ? vehicleData.availabilityType 
      : vehicleData.availabilityType ? [vehicleData.availabilityType] : ["zone"];
    
    return {
      name: vehicleData.name || `${vehicleData.brand || ''} ${vehicleData.model || ''}`.trim(),
      type: vehicleData.type || "sedan",
      category: vehicleData.category || "business_class",
      description: vehicleData.description || "",
      details: {
        brand: vehicleData.brand || "",
        model: vehicleData.model || "",
        year: vehicleData.year ? vehicleData.year.toString() : "",
        color: vehicleData.color || "",
        features: vehicleData.details?.features || [],
        armored: vehicleData.details?.armored || false,
        armor_level: vehicleData.details?.armor_level || ""
      },
      capacity: {
        passengers: vehicleData.seats || vehicleData.capacity?.passengers || 4,
        luggage: vehicleData.luggageCapacity || vehicleData.capacity?.luggage || 2
      },
      pricing: vehicleData.pricing || {
        base_fare: 50,
        per_km: 2,
        per_hour: 30,
        currency: "EUR"
      },
      location: vehicleData.location || {
        type: "Point",
        coordinates: [-3.7038, 40.4168] // Madrid por defecto
      },
      available: typeof vehicleData.available !== 'undefined' ? vehicleData.available : true,
      image: vehicleData.image || "",
      licensePlate: vehicleData.licensePlate || "",
      ownerType: vehicleData.ownerType || "company",
      ownerName: vehicleData.ownerName || "",
      ownerCountry: vehicleData.ownerCountry || "ES",
      availabilityType: availabilityTypeArray,
      availabilityDetails: vehicleData.availabilityDetails || "",
      insurancePolicyNumber: vehicleData.insurancePolicyNumber || "",
      lastMaintenanceDate: vehicleData.lastMaintenanceDate || "",
      contractEndDate: vehicleData.contractEndDate || "",
      associatedDrivers: vehicleData.associatedDrivers || [],
      availability_radius: vehicleData.availability_radius || 50,
      notes: vehicleData.notes || vehicleData.description || "",
      collaboratorId: vehicleData.collaboratorId || ""
    };
  });

  const [featuresInput, setFeaturesInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image || null);
  const [loading, setLoading] = useState(false);
  
  // Estados para colaboradores y choferes
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [searchDriverQuery, setSearchDriverQuery] = useState("");
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);

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

  // Cargar colaboradores al montar el componente
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        setLoadingCollaborators(true);
        const response = await axios.get('/api/admin/collaborators/list', getAuthHeaders());
        
        if (response.data && response.data.collaborators) {
          setCollaborators(response.data.collaborators);
          
          // Si estamos en modo edición y ya hay un collaboratorId, actualizar el ownerName
          if (editMode && formData.collaboratorId) {
            const selectedCollaborator = response.data.collaborators.find(
              (c: Collaborator) => c.id === formData.collaboratorId
            );
            if (selectedCollaborator) {
              setFormData(prev => ({
                ...prev,
                ownerName: selectedCollaborator.name
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar colaboradores:', error);
      } finally {
        setLoadingCollaborators(false);
      }
    };

    fetchCollaborators();
  }, [editMode, formData.collaboratorId]);

  // Cargar choferes cuando cambie el colaborador seleccionado
  useEffect(() => {
    const fetchDrivers = async () => {
      // Solo buscar choferes si hay un colaborador seleccionado
      if (!formData.collaboratorId) {
        setDrivers([]);
        return;
      }
      
      try {
        setLoadingDrivers(true);
        const response = await axios.get(`/api/admin/drivers/by-collaborator/${formData.collaboratorId}`, getAuthHeaders());
        
        if (response.data && response.data.drivers) {
          setDrivers(response.data.drivers);
        }
      } catch (error) {
        console.error('Error al cargar choferes:', error);
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [formData.collaboratorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      if (section === 'details') {
        setFormData({
          ...formData,
          details: {
            ...formData.details,
            [field]: value
          }
        });
      } else if (section === 'capacity') {
        setFormData({
          ...formData,
          capacity: {
            ...formData.capacity,
            [field]: value
          }
        });
      } else if (section === 'pricing') {
        setFormData({
          ...formData,
          pricing: {
            ...formData.pricing,
            [field]: value
          }
        });
      } else if (section === 'location') {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            [field]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleBooleanChange = (field: string, value: boolean) => {
    if (field.includes('.')) {
      const [section, subfield] = field.split('.');
      if (section === 'details') {
        setFormData({
          ...formData,
          details: {
            ...formData.details,
            [subfield]: value
          }
        });
      } else if (section === 'capacity') {
        setFormData({
          ...formData,
          capacity: {
            ...formData.capacity,
            [subfield]: value
          }
        });
      } else if (section === 'pricing') {
        setFormData({
          ...formData,
          pricing: {
            ...formData.pricing,
            [subfield]: value
          }
        });
      } else if (section === 'location') {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            [subfield]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    if (field.includes('.')) {
      const [section, subfield] = field.split('.');
      if (section === 'details') {
        setFormData({
          ...formData,
          details: {
            ...formData.details,
            [subfield]: value
          }
        });
      } else if (section === 'capacity') {
        setFormData({
          ...formData,
          capacity: {
            ...formData.capacity,
            [subfield]: value
          }
        });
      } else if (section === 'pricing') {
        setFormData({
          ...formData,
          pricing: {
            ...formData.pricing,
            [subfield]: value
          }
        });
      } else if (section === 'location') {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            [subfield]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  // La función handleCoordinateChange se ha eliminado ya que las coordenadas 
  // se actualizarán automáticamente

  const handleAddFeature = () => {
    if (featuresInput.trim()) {
      const newFeatures = [...formData.details.features, featuresInput.trim()];
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          features: newFeatures
        }
      });
      setFeaturesInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...formData.details.features];
    newFeatures.splice(index, 1);
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        features: newFeatures
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En un caso real, subiríamos la imagen a un servidor
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({
          ...formData,
          image: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtrar choferes según la búsqueda
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchDriverQuery.toLowerCase())
  );

  // Función para manejar la selección/deselección de tipos de disponibilidad
  const handleAvailabilityTypeChange = (type: string) => {
    const currentTypes = [...formData.availabilityType];
    const index = currentTypes.indexOf(type);
    
    if (index > -1) {
      // Si ya está seleccionado, quitarlo
      currentTypes.splice(index, 1);
    } else {
      // Si no está seleccionado, añadirlo
      currentTypes.push(type);
    }
    
    setFormData({
      ...formData,
      availabilityType: currentTypes
    });
  };

  // Constantes con los tipos de disponibilidad disponibles
  const availabilityTypes = [
    { id: "fixed_route", label: "Ruta fija" },
    { id: "flexible_route", label: "Ruta flexible" },
    { id: "zone", label: "Zona" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Preparar datos finales
      const finalData = {
        ...formData,
        // Aseguramos que description y notes sean compatibles
        description: formData.notes || formData.description,
        // Convertir capacity a números
        capacity: {
          passengers: parseInt(formData.capacity.passengers.toString()),
          luggage: parseInt(formData.capacity.luggage.toString())
        },
        // Convertir pricing a números
        pricing: {
          base_fare: parseFloat(formData.pricing.base_fare.toString()),
          per_km: parseFloat(formData.pricing.per_km.toString()),
          per_hour: parseFloat(formData.pricing.per_hour.toString()),
          currency: formData.pricing.currency
        },
        // Convertir availability_radius a número
        availability_radius: parseFloat(formData.availability_radius.toString()),
        // Asegurar que collaboratorId está definido
        collaboratorId: formData.collaboratorId || "",
        // Asegurar que availabilityType siempre sea un array no vacío
        availabilityType: formData.availabilityType.length === 0 ? ["zone"] : formData.availabilityType,
        // Usar associatedDrivers directamente
        associatedDrivers: formData.associatedDrivers || []
      };
      
      // Procesar el envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(finalData);
    } catch (error) {
      console.error("Error al guardar el vehículo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{editMode ? "Editar Vehículo" : "Añadir Nuevo Vehículo"}</CardTitle>
        <CardDescription>
          {editMode 
            ? "Actualice los detalles del vehículo seleccionado" 
            : "Complete el formulario para añadir un nuevo vehículo al sistema"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Car className="mr-2 h-5 w-5" />
                Información Básica
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre del Vehículo</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Mercedes-Benz Clase S" 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="licensePlate">Matrícula</Label>
                  <Input 
                    id="licensePlate" 
                    name="licensePlate" 
                    value={formData.licensePlate} 
                    onChange={handleChange} 
                    placeholder="1234ABC" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange(value, 'type')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedán</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="van">Van/Minivan</SelectItem>
                        <SelectItem value="limousine">Limusina</SelectItem>
                        <SelectItem value="helicopter">Helicóptero</SelectItem>
                        <SelectItem value="jet">Jet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange(value, 'category')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business_class">Business Class</SelectItem>
                        <SelectItem value="first_class">First Class</SelectItem>
                        <SelectItem value="business_van">Business Van</SelectItem>
                        <SelectItem value="armored_class">Blindado</SelectItem>
                        <SelectItem value="limousine_class">Limusina</SelectItem>
                        <SelectItem value="air_transfer">Transporte Aéreo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Descripción/Notas</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    placeholder="Descripción breve del vehículo" 
                    className="resize-none" 
                    rows={3} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="details.brand">Marca</Label>
                    <Input 
                      id="details.brand" 
                      name="details.brand" 
                      value={formData.details.brand} 
                      onChange={handleChange} 
                      placeholder="Mercedes-Benz" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="details.model">Modelo</Label>
                    <Input 
                      id="details.model" 
                      name="details.model" 
                      value={formData.details.model} 
                      onChange={handleChange} 
                      placeholder="Clase S" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="details.year">Año</Label>
                    <Input 
                      id="details.year" 
                      name="details.year" 
                      value={formData.details.year} 
                      onChange={handleChange} 
                      placeholder="2023" 
                      type="number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="details.color">Color</Label>
                    <Input 
                      id="details.color" 
                      name="details.color" 
                      value={formData.details.color} 
                      onChange={handleChange} 
                      placeholder="Negro" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="capacity.passengers">Capacidad Pasajeros</Label>
                    <Input 
                      id="capacity.passengers" 
                      name="capacity.passengers" 
                      value={formData.capacity.passengers.toString()} 
                      onChange={handleChange} 
                      type="number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity.luggage">Capacidad Equipaje</Label>
                    <Input 
                      id="capacity.luggage" 
                      name="capacity.luggage" 
                      value={formData.capacity.luggage.toString()} 
                      onChange={handleChange} 
                      type="number"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="details.armored"
                        checked={formData.details.armored}
                        onCheckedChange={(checked: boolean) => handleBooleanChange('details.armored', checked)}
                      />
                      <Label htmlFor="details.armored">Blindado</Label>
                    </div>
                  </div>
                </div>
                
                {formData.details.armored && (
                  <div>
                    <Label htmlFor="details.armor_level">Nivel de Blindaje</Label>
                    <Input 
                      id="details.armor_level" 
                      name="details.armor_level" 
                      value={formData.details.armor_level} 
                      onChange={handleChange} 
                      placeholder="VR9" 
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="features">Características/Amenidades</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="features-input" 
                      value={featuresInput} 
                      onChange={(e) => setFeaturesInput(e.target.value)} 
                      placeholder="Añadir característica" 
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddFeature}
                      variant="outline"
                    >
                      <PlusCircle size={18} />
                    </Button>
                  </div>
                  
                  {formData.details.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.details.features.map((feature: string, index: number) => (
                        <div 
                          key={index} 
                          className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {feature}
                          <button 
                            type="button" 
                            className="ml-2 text-gray-600 hover:text-gray-600" 
                            onClick={() => handleRemoveFeature(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Propietario e información adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <User className="mr-2 h-5 w-5" />
                Propietario y Disponibilidad
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ownerType">Tipo de Propietario</Label>
                  <Select
                    value={formData.ownerType}
                    onValueChange={(value) => handleSelectChange(value, 'ownerType')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de propietario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Empresa</SelectItem>
                      <SelectItem value="private_driver">Chófer Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="collaboratorId">Seleccionar Colaborador</Label>
                  <Select
                    value={formData.collaboratorId || ""}
                    onValueChange={(value) => {
                      // Al cambiar el colaborador, resetear los choferes seleccionados
                      if (formData.collaboratorId !== value) {
                        setFormData({
                          ...formData,
                          collaboratorId: value,
                          associatedDrivers: [],
                          ownerName: collaborators.find(c => c.id === value)?.name || ""
                        });
                      }
                    }}
                    disabled={loadingCollaborators}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCollaborators ? "Cargando colaboradores..." : "Seleccionar colaborador"} />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.length > 0 ? (
                        collaborators.map((collaborator) => (
                          <SelectItem key={collaborator.id} value={collaborator.id}>
                            {collaborator.name} ({collaborator.type})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_collaborators" disabled>
                          No hay colaboradores disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-2 block">Choferes Asignados</Label>
                  
                  <Popover open={driverPopoverOpen} onOpenChange={(open) => {
                    // Resetear la búsqueda al abrir/cerrar
                    if (!open) {
                      setSearchDriverQuery("");
                    }
                    setDriverPopoverOpen(open);
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !formData.collaboratorId && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!formData.collaboratorId || loadingDrivers}
                      >
                        {formData.associatedDrivers.length > 0
                          ? `${formData.associatedDrivers.length} chofer(es) seleccionado(s)`
                          : "Seleccionar choferes"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      {loadingDrivers ? (
                        <div className="p-4 text-center">
                          <span className="animate-spin inline-block mr-2">⏳</span>
                          Cargando choferes...
                        </div>
                      ) : (
                        <div className="p-1">
                          <div className="border-b px-3 py-2">
                            <input
                              className="w-full border-none bg-transparent outline-none placeholder:text-gray-400"
                              placeholder="Buscar chofer..."
                              value={searchDriverQuery}
                              onChange={(e) => {
                                setSearchDriverQuery(e.target.value);
                              }}
                            />
                          </div>
                          <ScrollArea className="h-60 py-2">
                            {filteredDrivers.length === 0 ? (
                              <div className="py-6 text-center text-sm">
                                {drivers.length === 0 
                                  ? "No hay choferes disponibles para este colaborador." 
                                  : "No se encontraron choferes con esa búsqueda."}
                              </div>
                            ) : (
                              <div className="px-1">
                                {filteredDrivers.map((driver) => {
                                  const isSelected = formData.associatedDrivers.includes(driver.id);
                                  return (
                                    <button
                                      key={driver.id}
                                      type="button"
                                      className={cn(
                                        "flex w-full items-center rounded-md px-2 py-2 text-sm relative select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                                      )}
                                      onClick={() => {
                                        console.log("Seleccionando chofer:", driver.id);
                                        let updatedDrivers;
                                        
                                        if (isSelected) {
                                          // Si ya está seleccionado, quitarlo
                                          updatedDrivers = formData.associatedDrivers.filter(id => id !== driver.id);
                                        } else {
                                          // Si no está seleccionado, añadirlo
                                          updatedDrivers = [...formData.associatedDrivers, driver.id];
                                        }
                                        
                                        setFormData({
                                          ...formData,
                                          associatedDrivers: updatedDrivers
                                        });
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span>{driver.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  
                  {formData.associatedDrivers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.associatedDrivers.map((driverId) => {
                        const driverInfo = drivers.find(d => d.id === driverId);
                        return driverInfo ? (
                          <Badge 
                            key={driverId} 
                            className="py-1.5 pl-2 pr-1 flex items-center bg-gray-200 text-blue-800 hover:bg-blue-200"
                          >
                            {driverInfo.name}
                            <button 
                              type="button"
                              className="ml-1 text-gray-600 hover:text-blue-800 focus:outline-none"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  associatedDrivers: formData.associatedDrivers.filter(id => id !== driverId)
                                });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="ownerCountry">País del Propietario</Label>
                  <Select
                    value={formData.ownerCountry}
                    onValueChange={(value) => handleSelectChange(value, 'ownerCountry')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ES">🇪🇸 España</SelectItem>
                      <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
                      <SelectItem value="FR">🇫🇷 Francia</SelectItem>
                      <SelectItem value="IT">🇮🇹 Italia</SelectItem>
                      <SelectItem value="DE">🇩🇪 Alemania</SelectItem>
                      <SelectItem value="GB">🇬🇧 Reino Unido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-2 block">Tipo de Disponibilidad</Label>
                  <div className="space-y-2 border p-3 rounded-md">
                    {availabilityTypes.map((type) => (
                      <div key={type.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`availability-${type.id}`}
                          checked={formData.availabilityType.includes(type.id)}
                          onChange={() => handleAvailabilityTypeChange(type.id)}
                          className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-red-500"
                        />
                        <label 
                          htmlFor={`availability-${type.id}`}
                          className="ml-2 block text-sm text-gray-900"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="availabilityDetails">Detalles de disponibilidad</Label>
                  <Textarea
                    id="availabilityDetails"
                    name="availabilityDetails"
                    value={formData.availabilityDetails}
                    onChange={handleChange}
                    placeholder="Ej: Disponible para Madrid Capital, Recorrido Aeropuerto-Centro, etc."
                    className="resize-none h-20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="insurancePolicyNumber">Número de Póliza de Seguro</Label>
                  <Input
                    id="insurancePolicyNumber"
                    name="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={handleChange}
                    placeholder="Ej: POL-12345"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastMaintenanceDate">Último Mantenimiento</Label>
                    <Input
                      id="lastMaintenanceDate"
                      name="lastMaintenanceDate"
                      value={formData.lastMaintenanceDate}
                      onChange={handleChange}
                      type="date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contractEndDate">Fin de Contrato</Label>
                    <Input
                      id="contractEndDate"
                      name="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={handleChange}
                      type="date"
                    />
                  </div>
                </div>
                
                
              </div>
            </div>
            
            {/* Precios e imagen */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Precios y Disponibilidad
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricing.base_fare">Tarifa Base</Label>
                    <Input 
                      id="pricing.base_fare" 
                      name="pricing.base_fare" 
                      value={formData.pricing.base_fare.toString()} 
                      onChange={handleChange} 
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pricing.currency">Moneda</Label>
                    <Select 
                      value={formData.pricing.currency} 
                      onValueChange={(value) => handleSelectChange(value, 'pricing.currency')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="USD">USD - Dólar</SelectItem>
                        <SelectItem value="GBP">GBP - Libra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricing.per_km">Precio por km</Label>
                    <Input 
                      id="pricing.per_km" 
                      name="pricing.per_km" 
                      value={formData.pricing.per_km.toString()} 
                      onChange={handleChange} 
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pricing.per_hour">Precio por hora</Label>
                    <Input 
                      id="pricing.per_hour" 
                      name="pricing.per_hour" 
                      value={formData.pricing.per_hour.toString()} 
                      onChange={handleChange} 
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="availability_radius">Radio de disponibilidad (km)</Label>
                  <Input 
                    id="availability_radius" 
                    name="availability_radius" 
                    value={formData.availability_radius.toString()} 
                    onChange={handleChange} 
                    type="number"
                    min="1"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked: boolean) => handleBooleanChange('available', checked)}
                  />
                  <Label htmlFor="available">Vehículo Disponible</Label>
                </div>
                
                <div className="pt-4">
                  <Label className="mb-2 block">Imagen del Vehículo</Label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Vista previa" 
                          className="mx-auto max-h-48 rounded-lg object-cover"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({...formData, image: ""});
                          }}
                          className="absolute -top-2 -right-2 bg-gray-200 text-gray-600 rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <label 
                          htmlFor="image-upload"
                          className="mt-2 cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 inline-block"
                        >
                          Subir imagen
                        </label>
                        <input 
                          id="image-upload" 
                          name="image" 
                          type="file" 
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP hasta 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading 
                ? "Guardando..." 
                : (editMode ? "Actualizar Vehículo" : "Añadir Vehículo")
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VehicleForm; 