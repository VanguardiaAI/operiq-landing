import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Loader2, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

// Importar los componentes específicos para vehículos
import VehicleForm from "@/components/admin/VehicleForm";
import VehiclesTable from "@/components/admin/VehiclesTable";
import VehicleDetailsView, { Vehicle as VehicleDetailType } from "@/components/admin/VehicleDetailsView";

const VehiclesSection = () => {
  const { toast } = useToast();
  
  // Estados para la gestión de vehículos
  const [vehicles, setVehicles] = useState<VehicleDetailType[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDetailType | null>(null);
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<VehicleDetailType | null>(null);
  const [isVehicleDetailsViewOpen, setIsVehicleDetailsViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  // Cargar datos de vehículos desde la API al montar el componente
  useEffect(() => {
    fetchVehicles();
  }, []);

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

  // Función para obtener todos los vehículos
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/admin/vehicles/list', getAuthHeaders());
      
      if (response.data && response.data.vehicles) {
        const adaptedVehicles = response.data.vehicles.map((v: any) => adaptVehicleFromApi(v));
        setVehicles(adaptedVehicles);
      }
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      setError('Error al cargar los datos de vehículos. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener detalles de un vehículo
  const fetchVehicleDetails = async (vehicleId: string) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/admin/vehicles/${vehicleId}`, getAuthHeaders());
      
      if (response.data && response.data.vehicle) {
        return adaptVehicleFromApi(response.data.vehicle);
      }
      
      return null;
    } catch (error) {
      console.error(`Error al cargar detalles del vehículo ${vehicleId}:`, error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del vehículo",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar las asociaciones en el documento del colaborador
  const updateCollaboratorAssociations = async (collaboratorId: string, vehicleId: string, driverIds: string[]) => {
    try {
      const response = await axios.post(
        `/api/admin/collaborators/${collaboratorId}/update-associations`,
        { vehicleId, driverIds },
        getAuthHeaders()
      );

      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: "Asociaciones de colaborador actualizadas correctamente"
        });
        return true;
      } else {
        toast({
          title: "Advertencia",
          description: "No se pudieron actualizar las asociaciones del colaborador",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar asociaciones del colaborador:', error);
      toast({
        title: "Error",
        description: "Error al actualizar asociaciones del colaborador",
        variant: "destructive"
      });
      return false;
    }
  };

  // Función para crear un nuevo vehículo
  const createVehicle = async (vehicleData: any) => {
    try {
      setLoading(true);
      const apiVehicleData = adaptVehicleToApi(vehicleData);
      const response = await axios.post('/api/admin/vehicles/create', apiVehicleData, getAuthHeaders());
      
      if (response.status === 201) {
        toast({
          title: "Éxito",
          description: "Vehículo creado correctamente"
        });
        
        if (apiVehicleData.collaboratorId && response.data.vehicle?._id) {
          await updateCollaboratorAssociations(
            apiVehicleData.collaboratorId,
            response.data.vehicle._id,
            apiVehicleData.associatedDrivers || []
          );
        }
        
        fetchVehicles();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el vehículo",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar un vehículo existente
  const updateVehicle = async (vehicleId: string, vehicleData: any) => {
    try {
      setLoading(true);
      const apiVehicleData = adaptVehicleToApi(vehicleData);
      const response = await axios.put(`/api/admin/vehicles/${vehicleId}/update`, apiVehicleData, getAuthHeaders());
      
      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: "Vehículo actualizado correctamente"
        });
        
        if (apiVehicleData.collaboratorId) {
          await updateCollaboratorAssociations(
            apiVehicleData.collaboratorId,
            vehicleId,
            apiVehicleData.associatedDrivers || []
          );
        }
        
        fetchVehicles();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error al actualizar vehículo ${vehicleId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el vehículo",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un vehículo
  const deleteVehicle = async (vehicleId: string) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/admin/vehicles/${vehicleId}/delete`, getAuthHeaders());
      
      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: "Vehículo eliminado correctamente"
        });
        fetchVehicles();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error al eliminar vehículo ${vehicleId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar la disponibilidad de un vehículo
  const toggleVehicleAvailability = async (vehicleId: string) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/admin/vehicles/${vehicleId}/toggle-availability`, {}, getAuthHeaders());
      
      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: `Vehículo marcado como ${response.data.available ? 'disponible' : 'no disponible'}`
        });
        fetchVehicles();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error al cambiar disponibilidad del vehículo ${vehicleId}:`, error);
      toast({
        title: "Error",
        description: "No se pudo cambiar la disponibilidad del vehículo",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Adaptar el formato del vehículo de la API al formato que espera el frontend
  const adaptVehicleFromApi = (apiVehicle: any): VehicleDetailType => {
    const availabilityTypeArray = Array.isArray(apiVehicle.availabilityType)
      ? apiVehicle.availabilityType
      : apiVehicle.availabilityType ? [apiVehicle.availabilityType] : ["zone"];
      
    return {
      id: apiVehicle._id || apiVehicle.id || "",
      brand: apiVehicle.details?.brand || "",
      model: apiVehicle.details?.model || "",
      year: apiVehicle.details?.year || 2023,
      color: apiVehicle.details?.color || "",
      seats: apiVehicle.capacity?.passengers || 0,
      luggageCapacity: apiVehicle.capacity?.luggage || 0,
      type: apiVehicle.type || "sedan",
      category: apiVehicle.category || "standard",
      licensePlate: apiVehicle.licensePlate || "",
      image: apiVehicle.image || "",
      available: apiVehicle.available || false,
      ownerType: apiVehicle.ownerType || "company",
      ownerName: apiVehicle.ownerName || "",
      ownerCountry: apiVehicle.ownerCountry || "",
      associatedDrivers: apiVehicle.associatedDrivers || [],
      availabilityType: availabilityTypeArray,
      availabilityDetails: apiVehicle.availabilityDetails || "",
      insurancePolicyNumber: apiVehicle.insurancePolicyNumber || "",
      lastMaintenanceDate: apiVehicle.lastMaintenanceDate || "",
      contractEndDate: apiVehicle.contractEndDate || "",
      notes: apiVehicle.description || apiVehicle.notes || "",
      pricing: apiVehicle.pricing || { base_fare: 0, currency: "EUR" },
      details: {
        features: apiVehicle.details?.features || [],
        armored: apiVehicle.details?.armored || false,
        armor_level: apiVehicle.details?.armor_level || ""
      },
      location: apiVehicle.location || {
        type: "Point",
        coordinates: [-3.7038, 40.4168]
      },
      availability_radius: apiVehicle.availability_radius || 50,
      collaboratorId: apiVehicle.collaboratorId || ""
    };
  };

  // Adaptar el formato del vehículo del frontend al formato que espera la API
  const adaptVehicleToApi = (frontendVehicle: any): any => {
    if (frontendVehicle.details) {
      return {
        type: frontendVehicle.type,
        category: frontendVehicle.category,
        name: frontendVehicle.name || `${frontendVehicle.details.brand} ${frontendVehicle.details.model}`,
        description: frontendVehicle.description || frontendVehicle.notes || "",
        details: {
          brand: frontendVehicle.details.brand,
          model: frontendVehicle.details.model,
          year: parseInt(frontendVehicle.details.year),
          color: frontendVehicle.details.color,
          features: frontendVehicle.details.features || [],
          armored: frontendVehicle.details.armored || false,
          armor_level: frontendVehicle.details.armor_level || ""
        },
        capacity: {
          passengers: parseInt(frontendVehicle.capacity?.passengers.toString()),
          luggage: parseInt(frontendVehicle.capacity?.luggage.toString())
        },
        pricing: frontendVehicle.pricing,
        location: frontendVehicle.location || { 
          type: "Point", 
          coordinates: [-3.7038, 40.4168] 
        },
        availability_radius: frontendVehicle.availability_radius,
        image: frontendVehicle.image,
        licensePlate: frontendVehicle.licensePlate,
        ownerType: frontendVehicle.ownerType,
        ownerName: frontendVehicle.ownerName,
        ownerCountry: frontendVehicle.ownerCountry,
        availabilityType: frontendVehicle.availabilityType,
        availabilityDetails: frontendVehicle.availabilityDetails,
        associatedDrivers: frontendVehicle.associatedDrivers || [],
        insurancePolicyNumber: frontendVehicle.insurancePolicyNumber,
        lastMaintenanceDate: frontendVehicle.lastMaintenanceDate,
        contractEndDate: frontendVehicle.contractEndDate,
        notes: frontendVehicle.notes || frontendVehicle.description,
        collaboratorId: frontendVehicle.collaboratorId || "",
        available: frontendVehicle.available || false
      };
    }
    
    return {
      type: frontendVehicle.type,
      category: frontendVehicle.category,
      name: `${frontendVehicle.brand} ${frontendVehicle.model}`,
      description: frontendVehicle.notes || "",
      details: {
        brand: frontendVehicle.brand,
        model: frontendVehicle.model,
        year: frontendVehicle.year,
        color: frontendVehicle.color,
        features: frontendVehicle.details?.features || [],
        armored: frontendVehicle.details?.armored || false,
        armor_level: frontendVehicle.details?.armor_level || ""
      },
      capacity: {
        passengers: frontendVehicle.seats,
        luggage: frontendVehicle.luggageCapacity
      },
      pricing: frontendVehicle.pricing,
      location: frontendVehicle.location,
      availability_radius: frontendVehicle.availability_radius,
      image: frontendVehicle.image,
      licensePlate: frontendVehicle.licensePlate,
      ownerType: frontendVehicle.ownerType,
      ownerName: frontendVehicle.ownerName,
      ownerCountry: frontendVehicle.ownerCountry,
      availabilityType: frontendVehicle.availabilityType,
      availabilityDetails: frontendVehicle.availabilityDetails,
      associatedDrivers: frontendVehicle.associatedDrivers,
      insurancePolicyNumber: frontendVehicle.insurancePolicyNumber,
      lastMaintenanceDate: frontendVehicle.lastMaintenanceDate,
      contractEndDate: frontendVehicle.contractEndDate,
      notes: frontendVehicle.notes,
      collaboratorId: frontendVehicle.collaboratorId || "",
      available: frontendVehicle.available || false
    };
  };

  // Funciones para la gestión de vehículos
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle: VehicleDetailType) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleVehicleSubmit = async (vehicleData: any) => {
    if (editingVehicle) {
      const success = await updateVehicle(editingVehicle.id, vehicleData);
      if (success) {
        setShowVehicleForm(false);
        setEditingVehicle(null);
      }
    } else {
      const success = await createVehicle(vehicleData);
      if (success) {
        setShowVehicleForm(false);
      }
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    await deleteVehicle(vehicleId);
  };

  const handleToggleVehicleAvailability = async (vehicleId: string) => {
    await toggleVehicleAvailability(vehicleId);
  };

  const handleViewVehicleDetails = async (vehicle: VehicleDetailType) => {
    const vehicleDetails = await fetchVehicleDetails(vehicle.id);
    setSelectedVehicleForDetails(vehicleDetails || vehicle);
    setIsVehicleDetailsViewOpen(true);
  };

  const handleCloseVehicleDetails = () => {
    setIsVehicleDetailsViewOpen(false);
    setSelectedVehicleForDetails(null);
    fetchVehicles();
  };

  const handleEditFromDetailsView = (vehicleToEdit: VehicleDetailType) => {
    setIsVehicleDetailsViewOpen(false);
    
    const adaptedVehicle: any = {
      ...vehicleToEdit,
      name: `${vehicleToEdit.brand} ${vehicleToEdit.model}`,
      description: vehicleToEdit.notes || "",
      details: { ...vehicleToEdit.details },
      capacity: {
        passengers: vehicleToEdit.seats,
        luggage: vehicleToEdit.luggageCapacity
      },
      _original: vehicleToEdit
    };
    
    setEditingVehicle(adaptedVehicle);
    setShowVehicleForm(true);
  };

  const handleAssignDriver = (vehicleId: string) => {
    console.log("Asignar conductor al vehículo:", vehicleId);
    toast({
      title: "Función pendiente",
      description: "La asignación de conductores está en desarrollo",
      variant: "default"
    });
  };

  // Filtrar vehículos
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery.trim() ||
      `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate.toLowerCase().includes(searchLower) ||
      vehicle.ownerName.toLowerCase().includes(searchLower);
    
    const matchesType = vehicleTypeFilter === 'all' || vehicle.type === vehicleTypeFilter;
    
    const matchesAvailability = 
      availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && vehicle.available) ||
      (availabilityFilter === 'unavailable' && !vehicle.available);
    
    return matchesSearch && matchesType && matchesAvailability;
  });

  if (isVehicleDetailsViewOpen && selectedVehicleForDetails) {
    return (
      <VehicleDetailsView 
        vehicle={selectedVehicleForDetails}
        onClose={handleCloseVehicleDetails}
        onEdit={handleEditFromDetailsView}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 text-black animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-600">Cargando vehículos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-12 w-12 text-black mb-4" />
        <h2 className="text-xl font-medium text-gray-600">{error}</h2>
        <Button 
          onClick={fetchVehicles} 
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
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Vehículos</h1>
        {!showVehicleForm && (
          <Button 
            onClick={handleAddVehicle}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Añadir Vehículo
          </Button>
        )}
      </div>
      
      {showVehicleForm ? (
        <VehicleForm 
          editMode={!!editingVehicle}
          vehicleData={editingVehicle}
          onSubmit={handleVehicleSubmit}
          onCancel={() => {
            setShowVehicleForm(false);
            setEditingVehicle(null);
          }}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Buscar vehículos..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex space-x-3">
              <select 
                className="px-3 py-2 border rounded-lg"
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="sedan">Sedán</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="limousine">Limusina</option>
                <option value="helicopter">Helicóptero</option>
                <option value="jet">Jet</option>
              </select>
              <select
                className="px-3 py-2 border rounded-lg"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">Toda disponibilidad</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">No disponibles</option>
              </select>
            </div>
          </div>
          <VehiclesTable 
            vehicles={filteredVehicles} 
            onEdit={handleEditVehicle} 
            onDelete={handleDeleteVehicle}
            onToggleAvailability={handleToggleVehicleAvailability}
            onViewDetails={handleViewVehicleDetails}
            onAssignDriver={handleAssignDriver}
          />
        </div>
      )}
    </div>
  );
};

export default VehiclesSection; 