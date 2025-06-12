import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, X, Trash2, Edit, Save, RefreshCw, FileText, Mail, MapPin, User, Car, Building, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

// Definir el tipo para los colaboradores
export interface Collaborator {
  id: string;
  name: string;
  logo: string;
  type: 'company' | 'individual';
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  taxId: string; // CIF/NIF
  country: string;
  city: string;
  address: string;
  postalCode: string;
  startDate: string; // Fecha de inicio de colaboración
  status: 'active' | 'inactive' | 'pending';
  commissionRate: number; // Porcentaje de comisión
  paymentTerms: string; // Términos de pago
  bankAccount?: string;
  serviceAreas: string[]; // Zonas donde operan
  specialties: string[]; // Especialidades (bodas, eventos, etc.)
  certifications: string[]; // Certificaciones y permisos
  notes?: string;
  rating: number; // Valoración de calidad
  associatedDrivers: string[]; // IDs de los chóferes asociados
  associatedVehicles: string[]; // IDs de los vehículos asociados
}

// Interfaces para los datos de vehículos y choferes
interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  specialty?: string;
  city?: string;
  photo?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  type: string;
  category: string;
  image?: string;
  available: boolean;
  year?: number;
  color?: string;
}

const CollaboratorsSection = () => {
  // Estados para la gestión de colaboradores
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [selectedCollaboratorForDetails, setSelectedCollaboratorForDetails] = useState<Collaborator | null>(null);
  const [isCollaboratorDetailsViewOpen, setIsCollaboratorDetailsViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  // Estados para datos asociados
  const [associatedDrivers, setAssociatedDrivers] = useState<Driver[]>([]);
  const [associatedVehicles, setAssociatedVehicles] = useState<Vehicle[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Función para obtener token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };
  
  // Cargar colaboradores cuando cambian los filtros
  useEffect(() => {
    fetchCollaborators();
  }, [typeFilter, statusFilter, searchQuery]);

  // Extraer la función fetchCollaborators
  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('No hay sesión activa. Por favor inicie sesión');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/api/admin/collaborators/list', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          type: typeFilter !== 'all' ? typeFilter : '',
          status: statusFilter !== 'all' ? statusFilter : '',
          search: searchQuery
        }
      });
      
      if (response.data.status === 'success') {
        setCollaborators(response.data.collaborators);
        setError(null);
      } else {
        setError('Error al cargar los colaboradores: ' + response.data.message);
      }
    } catch (err) {
      console.error('Error al obtener colaboradores:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('No tiene permisos de administrador para ver esta página');
      } else {
        setError('Error al cargar los colaboradores. Intente nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar los choferes asociados a un colaborador
  const fetchAssociatedDrivers = async (collaboratorId: string) => {
    try {
      setLoadingDrivers(true);
      const token = getAuthToken();
      
      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive"
        });
        return;
      }
      
      const response = await axios.get(`/api/admin/drivers/by-collaborator/${collaboratorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.drivers) {
        setAssociatedDrivers(response.data.drivers);
      } else {
        setAssociatedDrivers([]);
      }
    } catch (err) {
      console.error('Error al cargar choferes asociados:', err);
      setAssociatedDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Cargar los vehículos asociados a un colaborador
  const fetchAssociatedVehicles = async (collaboratorId: string) => {
    try {
      setLoadingVehicles(true);
      const token = getAuthToken();
      
      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive"
        });
        return;
      }
      
      const response = await axios.get(`/api/admin/vehicles/by-collaborator/${collaboratorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.vehicles) {
        setAssociatedVehicles(response.data.vehicles);
      } else {
        setAssociatedVehicles([]);
      }
    } catch (err) {
      console.error('Error al cargar vehículos asociados:', err);
      setAssociatedVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Funciones para la gestión de colaboradores
  const handleCollaboratorSubmit = async (collaboratorData: any) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive"
        });
        return;
      }

      if (editingCollaborator) {
        // Actualizar un colaborador existente
        const response = await axios.put(
          `/api/admin/collaborators/update/${editingCollaborator.id}`, 
          collaboratorData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.status === 'success') {
          // Actualizar la lista de colaboradores
          setCollaborators(prev => 
            prev.map(c => c.id === editingCollaborator.id ? response.data.collaborator : c)
          );
          
          toast({
            title: "Colaborador actualizado",
            description: "El colaborador se ha actualizado correctamente"
          });
        } else {
          toast({
            title: "Error",
            description: response.data.message || "Error al actualizar el colaborador",
            variant: "destructive"
          });
        }
      } else {
        // Crear un nuevo colaborador
        const response = await axios.post(
          '/api/admin/collaborators/add', 
          collaboratorData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.status === 'success') {
          // Añadir el nuevo colaborador a la lista
          setCollaborators(prev => [...prev, response.data.collaborator]);
          
          toast({
            title: "Colaborador creado",
            description: "El colaborador se ha creado correctamente"
          });
        } else {
          toast({
            title: "Error",
            description: response.data.message || "Error al crear el colaborador",
            variant: "destructive"
          });
        }
      }
      
      // Cerrar el formulario
      setShowCollaboratorForm(false);
      setEditingCollaborator(null);
      
    } catch (err) {
      console.error('Error al guardar el colaborador:', err);
      toast({
        title: "Error",
        description: axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Error al procesar la solicitud. Intente nuevamente",
        variant: "destructive"
      });
    }
  };

  const handleViewCollaboratorDetails = async (collaborator: Collaborator) => {
    setSelectedCollaboratorForDetails(collaborator);
    setIsCollaboratorDetailsViewOpen(true);
    setIsEditing(false);
    
    // Cargar los datos asociados
    fetchAssociatedDrivers(collaborator.id);
    fetchAssociatedVehicles(collaborator.id);
  };

  const handleCloseCollaboratorDetails = () => {
    setIsCollaboratorDetailsViewOpen(false);
    setSelectedCollaboratorForDetails(null);
    setIsEditing(false);
    // Limpiar datos asociados
    setAssociatedDrivers([]);
    setAssociatedVehicles([]);
  };

  const handleDeleteCollaborator = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evitar que se abra el detalle al hacer clic aquí
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive"
        });
        return;
      }
      
      const confirmar = window.confirm("¿Está seguro que desea eliminar este colaborador? Esta acción no se puede deshacer.");
      
      if (!confirmar) return;
      
      const response = await axios.delete(`/api/admin/collaborators/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        // Eliminar el colaborador de la lista
        setCollaborators(prev => prev.filter(c => c.id !== id));
        
        toast({
          title: "Colaborador eliminado",
          description: "El colaborador se ha eliminado correctamente"
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Error al eliminar el colaborador",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error al eliminar el colaborador:', err);
      toast({
        title: "Error",
        description: axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Error al procesar la solicitud. Intente nuevamente",
        variant: "destructive"
      });
    }
  };

  const handleStartEditing = () => {
    if (!selectedCollaboratorForDetails) return;
    
    // Preparar datos iniciales para el formulario
    setFormData({
      ...selectedCollaboratorForDetails
    });
    
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedCollaboratorForDetails) return;
    setIsSaving(true);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      const response = await axios.put(
        `/api/admin/collaborators/update/${selectedCollaboratorForDetails.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.status === 'success') {
        // Actualizar la lista de colaboradores
        setCollaborators(prev => 
          prev.map(c => c.id === selectedCollaboratorForDetails.id ? response.data.collaborator : c)
        );
        
        // Actualizar el colaborador seleccionado
        setSelectedCollaboratorForDetails(response.data.collaborator);
        
        toast({
          title: "Colaborador actualizado",
          description: "El colaborador se ha actualizado correctamente"
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Error al actualizar el colaborador",
          variant: "destructive"
        });
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar el colaborador:', err);
      toast({
        title: "Error",
        description: axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Error al procesar la solicitud. Intente nuevamente",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Manejar cambios en los filtros
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Renderizar la vista de detalles o la tabla
  if (isCollaboratorDetailsViewOpen && selectedCollaboratorForDetails) {
    return (
      <div className="space-y-6">
        {/* Cabecera mejorada */}
        <div className="bg-white border-b shadow-md py-5 px-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full overflow-hidden shadow-md border-2 border-gray-100">
                <img 
                  src={selectedCollaboratorForDetails.logo} 
                  alt={selectedCollaboratorForDetails.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCollaboratorForDetails.name}
                  <span className="ml-3 text-sm font-medium px-3 py-1 rounded-full bg-gray-200 text-blue-700 inline-flex items-center">
                    {selectedCollaboratorForDetails.type === 'company' ? 'Empresa' : 'Particular'}
                  </span>
                </h2>
                <p className="text-gray-500 text-sm">ID: {selectedCollaboratorForDetails.id}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <Button 
                  variant="outline"
                  onClick={handleStartEditing}
                  className="flex items-center hover:bg-gray-100 transition-colors border-gray-300"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center hover:bg-gray-100 transition-colors border-gray-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center bg-black hover:bg-gray-800 transition-colors"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCloseCollaboratorDetails}
                className="hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-6 space-y-8">
          {/* Información del colaborador */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b py-5">
              <CardTitle className="text-lg text-gray-800 flex items-center">
                <span className="bg-gray-200 p-1.5 rounded-md text-gray-700 mr-3">
                  <FileText className="h-5 w-5" />
                </span>
                Información del Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row md:space-x-6 p-6">
                <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-amber-50 rounded-full blur-md opacity-50"></div>
                    <img 
                      src={selectedCollaboratorForDetails.logo} 
                      alt={selectedCollaboratorForDetails.name}
                      className="h-36 w-36 rounded-full object-cover border-4 border-white shadow-md relative z-10"
                    />
                  </div>
                  
                  {!isEditing ? (
                    <>
                      <h3 className="text-xl font-semibold text-center mb-2">{selectedCollaboratorForDetails.name}</h3>
                      <div className="flex items-center mt-1 text-amber-500 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round(selectedCollaboratorForDetails.rating) ? '' : 'text-gray-300'}>★</span>
                        ))}
                        <span className="ml-1 text-gray-600 text-sm">({selectedCollaboratorForDetails.rating.toFixed(1)})</span>
                      </div>
                      <span className={`mb-3 px-4 py-1.5 text-sm font-medium rounded-full shadow-sm ${
                        selectedCollaboratorForDetails.status === 'active' 
                          ? 'bg-gray-200 text-green-800 border border-green-200' 
                          : selectedCollaboratorForDetails.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800 border border-gray-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                          selectedCollaboratorForDetails.status === 'active' 
                            ? 'bg-gray-600' 
                            : selectedCollaboratorForDetails.status === 'inactive'
                            ? 'bg-gray-500'
                            : 'bg-amber-500'
                        }`}></span>
                        {selectedCollaboratorForDetails.status === 'active' 
                          ? 'Activo' 
                          : selectedCollaboratorForDetails.status === 'inactive'
                          ? 'Inactivo'
                          : 'Pendiente'}
                      </span>
                      <div className="mt-4 px-4 py-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm w-full">
                        <div className="text-sm font-medium text-gray-600 mb-2">Tipo de colaborador</div>
                        <div className="text-lg font-medium text-center">
                          {selectedCollaboratorForDetails.type === 'company' ? 'Empresa' : 'Particular'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <Input
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Estado</label>
                        <Select 
                          value={formData.status || 'active'} 
                          onValueChange={(value) => setFormData({...formData, status: value})}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tipo</label>
                        <Select 
                          value={formData.type || 'company'} 
                          onValueChange={(value) => setFormData({...formData, type: value})}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company">Empresa</SelectItem>
                            <SelectItem value="individual">Particular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-black" />
                        Información de contacto
                      </h4>
                      {!isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">Contacto:</div>
                            <div className="font-medium">{selectedCollaboratorForDetails.contactName}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">Email:</div>
                            <div className="font-medium text-gray-600">{selectedCollaboratorForDetails.contactEmail}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">Teléfono:</div>
                            <div className="font-medium">{selectedCollaboratorForDetails.contactPhone}</div>
                          </div>
                          <div className="flex">
                            <div className="w-28 text-sm text-gray-500">Dirección:</div>
                            <div className="font-medium">{selectedCollaboratorForDetails.address}, {selectedCollaboratorForDetails.postalCode}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">Ubicación:</div>
                            <div className="font-medium">{selectedCollaboratorForDetails.city}, {selectedCollaboratorForDetails.country}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-500">Contacto</label>
                            <Input
                              name="contactName"
                              value={formData.contactName || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <Input
                              name="contactEmail"
                              value={formData.contactEmail || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Teléfono</label>
                            <Input
                              name="contactPhone"
                              value={formData.contactPhone || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Dirección</label>
                            <Input
                              name="address"
                              value={formData.address || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-sm text-gray-500">Código Postal</label>
                              <Input
                                name="postalCode"
                                value={formData.postalCode || ''}
                                onChange={handleInputChange}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Ciudad</label>
                              <Input
                                name="city"
                                value={formData.city || ''}
                                onChange={handleInputChange}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">País</label>
                            <Input
                              name="country"
                              value={formData.country || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-black" />
                        Información fiscal
                      </h4>
                      {!isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">CIF/NIF:</div>
                            <div className="font-medium">{selectedCollaboratorForDetails.taxId}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">Fecha inicio:</div>
                            <div className="font-medium">{new Date(selectedCollaboratorForDetails.startDate).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">Comisión:</div>
                            <div className="font-medium text-green-600">{selectedCollaboratorForDetails.commissionRate}%</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-28 text-sm text-gray-500">Pago:</div>
                            <div className="font-medium">{selectedCollaboratorForDetails.paymentTerms}</div>
                          </div>
                          {selectedCollaboratorForDetails.bankAccount && (
                            <div className="flex items-center">
                              <div className="w-28 text-sm text-gray-500">Cuenta:</div>
                              <div className="font-medium text-gray-700 font-mono text-sm tracking-wide">{selectedCollaboratorForDetails.bankAccount}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-500">CIF/NIF</label>
                            <Input
                              name="taxId"
                              value={formData.taxId || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Fecha de inicio</label>
                            <Input
                              type="date"
                              name="startDate"
                              value={formData.startDate || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Comisión (%)</label>
                            <Input
                              type="number"
                              name="commissionRate"
                              value={formData.commissionRate || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Términos de pago</label>
                            <Input
                              name="paymentTerms"
                              value={formData.paymentTerms || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Cuenta bancaria</label>
                            <Input
                              name="bankAccount"
                              value={formData.bankAccount || ''}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-black" />
                      Zonas y Especialidades
                    </h4>
                    {!isEditing ? (
                      <>
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2 text-gray-600">Zonas de servicio:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCollaboratorForDetails.serviceAreas.map(area => (
                              <span key={area} className="px-3 py-1 bg-gray-100 text-blue-700 border border-blue-100 text-sm rounded-full shadow-sm">{area}</span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2 text-gray-600">Especialidades:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCollaboratorForDetails.specialties.map(specialty => (
                              <span key={specialty} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-sm rounded-full shadow-sm">{specialty}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2 text-gray-600">Certificaciones:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCollaboratorForDetails.certifications.map(cert => (
                              <span key={cert} className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 text-sm rounded-full shadow-sm">{cert}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">Zonas de servicio (separadas por comas)</label>
                          <Input
                            name="serviceAreas"
                            value={Array.isArray(formData.serviceAreas) ? formData.serviceAreas.join(', ') : ''}
                            onChange={(e) => {
                              const areas = e.target.value.split(',').map(area => area.trim()).filter(Boolean);
                              setFormData({...formData, serviceAreas: areas});
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Especialidades (separadas por comas)</label>
                          <Input
                            name="specialties"
                            value={Array.isArray(formData.specialties) ? formData.specialties.join(', ') : ''}
                            onChange={(e) => {
                              const specialties = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setFormData({...formData, specialties: specialties});
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Certificaciones (separadas por comas)</label>
                          <Input
                            name="certifications"
                            value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : ''}
                            onChange={(e) => {
                              const certifications = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
                              setFormData({...formData, certifications: certifications});
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                      <User className="h-4 w-4 mr-2 text-black" />
                      Chóferes asociados
                    </h4>
                    {selectedCollaboratorForDetails.associatedDrivers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {loadingDrivers ? (
                          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Cargando chóferes...</p>
                          </div>
                        ) : (
                          associatedDrivers.length > 0 ? (
                            associatedDrivers.map(driver => (
                              <div key={driver.id} className="flex items-center p-2 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 flex-shrink-0 mr-3">
                                  {driver.photo ? (
                                    <img 
                                      src={driver.photo} 
                                      alt={driver.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                                      <User className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{driver.name}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {driver.email && (
                                      <p className="text-xs text-gray-500">{driver.email}</p>
                                    )}
                                    {driver.phone && (
                                      <p className="text-xs text-gray-500">{driver.phone}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {driver.specialty && (
                                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                                        {driver.specialty}
                                      </span>
                                    )}
                                    {driver.city && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-blue-700 text-xs rounded-full">
                                        {driver.city}
                                      </span>
                                    )}
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      driver.status === 'active' 
                                        ? 'bg-green-50 text-green-700' 
                                        : driver.status === 'inactive'
                                        ? 'bg-gray-50 text-gray-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      {driver.status === 'active' 
                                        ? 'Activo' 
                                        : driver.status === 'inactive'
                                        ? 'Inactivo'
                                        : 'Pendiente'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">No se encontraron datos de los chóferes</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center">
                        <p className="text-sm text-gray-500">No hay chóferes asociados</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                      <Car className="h-4 w-4 mr-2 text-black" />
                      Vehículos asociados
                    </h4>
                    {selectedCollaboratorForDetails.associatedVehicles.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {loadingVehicles ? (
                          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Cargando vehículos...</p>
                          </div>
                        ) : (
                          associatedVehicles.length > 0 ? (
                            associatedVehicles.map(vehicle => (
                              <div key={vehicle.id} className="flex items-center p-2 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="w-12 h-12 flex-shrink-0 mr-3">
                                  {vehicle.image ? (
                                    <img 
                                      src={vehicle.image} 
                                      alt={`${vehicle.brand} ${vehicle.model}`}
                                      className="w-12 h-12 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-600">
                                      <Car className="h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{vehicle.brand} {vehicle.model}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <p className="text-xs text-gray-500">{vehicle.licensePlate}</p>
                                    {vehicle.year && (
                                      <p className="text-xs text-gray-500">{vehicle.year}</p>
                                    )}
                                    {vehicle.color && (
                                      <p className="text-xs text-gray-500">{vehicle.color}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-gray-100 text-blue-700 text-xs rounded-full">
                                      {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                                    </span>
                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                                      {vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1).replace('_', ' ')}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      vehicle.available 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {vehicle.available ? 'Disponible' : 'No disponible'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center">
                              <p className="text-sm text-gray-500">No se encontraron datos de los vehículos</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 flex items-center justify-center">
                        <p className="text-sm text-gray-500">No hay vehículos asociados</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-6 pt-0">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-black" />
                    Notas
                  </h4>
                  {!isEditing ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm">{selectedCollaboratorForDetails.notes || 'Sin notas'}</p>
                    </div>
                  ) : (
                    <Textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={4}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista de la tabla (cuando no se está viendo un colaborador específico)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Colaboradores</h1>
        {!showCollaboratorForm && (
          <Button 
            onClick={() => {
              setEditingCollaborator(null);
              setShowCollaboratorForm(true);
            }}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Añadir Colaborador
          </Button>
        )}
      </div>
      
      {showCollaboratorForm ? (
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle>{editingCollaborator ? 'Editar' : 'Añadir'} Colaborador</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              // Recoger todos los datos del formulario
              const formData = new FormData(e.currentTarget);
              const data: any = {};
              
              // Convertir campos de texto en arrays
              const serviceAreas = formData.get('serviceAreas')?.toString() || '';
              const specialties = formData.get('specialties')?.toString() || '';
              const certifications = formData.get('certifications')?.toString() || '';
              
              // Preparar los datos para enviar
              for (const [key, value] of formData.entries()) {
                if (key !== 'serviceAreas' && key !== 'specialties' && key !== 'certifications') {
                  data[key] = value;
                }
              }
              
              // Convertir strings a arrays
              data.serviceAreas = serviceAreas.split(',').map(item => item.trim()).filter(Boolean);
              data.specialties = specialties.split(',').map(item => item.trim()).filter(Boolean);
              data.certifications = certifications.split(',').map(item => item.trim()).filter(Boolean);
              
              // Forzar conversión de campos numéricos
              data.commissionRate = parseFloat(data.commissionRate) || 0;
              
              // Añadir campos necesarios que puedan faltar y tengan valores por defecto
              data.rating = editingCollaborator?.rating || 0;
              data.associatedDrivers = editingCollaborator?.associatedDrivers || [];
              data.associatedVehicles = editingCollaborator?.associatedVehicles || [];
              
              // Crear o actualizar colaborador
              handleCollaboratorSubmit(data);
            }} className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Información básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del colaborador*
                    </label>
                    <Input 
                      name="name" 
                      defaultValue={editingCollaborator?.name || ''} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL del Logo
                    </label>
                    <Input 
                      name="logo" 
                      defaultValue={editingCollaborator?.logo || ''} 
                      placeholder="https://example.com/logo.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de colaborador*
                    </label>
                    <Select 
                      name="type"
                      defaultValue={editingCollaborator?.type || 'company'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Empresa</SelectItem>
                        <SelectItem value="individual">Particular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado*
                    </label>
                    <Select 
                      name="status"
                      defaultValue={editingCollaborator?.status || 'active'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Información de contacto */}
              <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Información de contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de contacto*
                    </label>
                    <Input 
                      name="contactName" 
                      defaultValue={editingCollaborator?.contactName || ''} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de contacto*
                    </label>
                    <Input 
                      type="email"
                      name="contactEmail" 
                      defaultValue={editingCollaborator?.contactEmail || ''} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de contacto*
                    </label>
                    <Input 
                      name="contactPhone" 
                      defaultValue={editingCollaborator?.contactPhone || ''} 
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <Input 
                      name="address" 
                      defaultValue={editingCollaborator?.address || ''} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <Input 
                      name="postalCode" 
                      defaultValue={editingCollaborator?.postalCode || ''} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <Input 
                      name="city" 
                      defaultValue={editingCollaborator?.city || ''} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </label>
                    <Input 
                      name="country" 
                      defaultValue={editingCollaborator?.country || ''} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Información fiscal y contractual */}
              <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Información fiscal y contractual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CIF/NIF*
                    </label>
                    <Input 
                      name="taxId" 
                      defaultValue={editingCollaborator?.taxId || ''} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de inicio*
                    </label>
                    <Input 
                      type="date"
                      name="startDate" 
                      defaultValue={editingCollaborator?.startDate || new Date().toISOString().split('T')[0]} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comisión (%)*
                    </label>
                    <Input 
                      type="number"
                      name="commissionRate" 
                      defaultValue={editingCollaborator?.commissionRate || 10} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Términos de pago
                    </label>
                    <Input 
                      name="paymentTerms" 
                      defaultValue={editingCollaborator?.paymentTerms || ''} 
                      placeholder="Ej: Pago mensual, 30 días"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuenta bancaria
                    </label>
                    <Input 
                      name="bankAccount" 
                      defaultValue={editingCollaborator?.bankAccount || ''} 
                      placeholder="ES12 1234 5678 9012 3456 7890"
                    />
                  </div>
                </div>
              </div>
              
              {/* Zonas, especialidades y certificaciones */}
              <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Zonas y especialidades</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zonas de servicio (separadas por comas)
                    </label>
                    <Input 
                      name="serviceAreas" 
                      defaultValue={
                        editingCollaborator?.serviceAreas 
                          ? editingCollaborator.serviceAreas.join(', ') 
                          : ''
                      } 
                      placeholder="Madrid, Barcelona, Sevilla"
                    />
                    <p className="text-xs text-gray-500 mt-1">Indica las zonas geográficas donde opera el colaborador</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidades (separadas por comas)
                    </label>
                    <Input 
                      name="specialties" 
                      defaultValue={
                        editingCollaborator?.specialties 
                          ? editingCollaborator.specialties.join(', ') 
                          : ''
                      } 
                      placeholder="Bodas, Eventos corporativos, Traslados aeropuerto"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tipo de servicios que ofrece el colaborador</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificaciones (separadas por comas)
                    </label>
                    <Input 
                      name="certifications" 
                      defaultValue={
                        editingCollaborator?.certifications 
                          ? editingCollaborator.certifications.join(', ') 
                          : ''
                      } 
                      placeholder="ISO 9001, Licencia VTC"
                    />
                    <p className="text-xs text-gray-500 mt-1">Permisos y certificaciones que posee el colaborador</p>
                  </div>
                </div>
              </div>
              
              {/* Notas adicionales */}
              <div>
                <h3 className="text-lg font-medium border-b pb-2 mb-4">Información adicional</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <Textarea 
                    name="notes" 
                    defaultValue={editingCollaborator?.notes || ''} 
                    placeholder="Información adicional sobre el colaborador"
                    rows={4}
                  />
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end mt-6 space-x-3">
                <Button 
                  type="button"
                  onClick={() => {
                    setShowCollaboratorForm(false);
                    setEditingCollaborator(null);
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-black hover:bg-gray-800"
                >
                  {editingCollaborator ? 'Actualizar' : 'Crear'} Colaborador
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros y búsqueda */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar colaboradores..."
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 pl-10 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  <Select 
                    defaultValue="all"
                    value={typeFilter}
                    onValueChange={handleTypeFilterChange}
                  >
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Tipo de colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="company">Empresas</SelectItem>
                      <SelectItem value="individual">Particulares</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    defaultValue="all"
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de colaboradores */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collaborators.map(collaborator => (
                      <tr 
                        key={collaborator.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewCollaboratorDetails(collaborator)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <img 
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-100" 
                                src={collaborator.logo} 
                                alt={collaborator.name} 
                              />
                              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${
                                collaborator.type === 'company' 
                                  ? 'bg-gray-200 text-gray-600 border border-blue-200' 
                                  : 'bg-amber-100 text-amber-600 border border-amber-200'
                              }`}>
                                {collaborator.type === 'company' 
                                  ? <Building className="h-3.5 w-3.5" /> 
                                  : <Briefcase className="h-3.5 w-3.5" />
                                }
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{collaborator.name}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <span className={`px-2 py-0.5 rounded-sm text-xs font-medium inline-flex items-center ${
                                  collaborator.type === 'company' 
                                    ? 'bg-gray-100 text-blue-700' 
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {collaborator.type === 'company' ? 'Empresa' : 'Particular'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{collaborator.contactName}</div>
                          <div className="text-sm text-gray-500">{collaborator.contactEmail}</div>
                          <div className="text-sm text-gray-500">{collaborator.contactPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{collaborator.city}</div>
                          <div className="text-sm text-gray-500">{collaborator.country}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{collaborator.commissionRate}%</div>
                          <div className="text-sm text-gray-500">{collaborator.paymentTerms}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            collaborator.status === 'active' 
                              ? 'bg-gray-200 text-green-800' 
                              : collaborator.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-gray-200 text-yellow-800'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full mr-1.5 mt-0.5 ${
                              collaborator.status === 'active' ? 'bg-black' : 
                              collaborator.status === 'inactive' ? 'bg-gray-600' : 'bg-yellow-600'
                            }`}></span>
                            {collaborator.status === 'active' 
                              ? 'Activo' 
                              : collaborator.status === 'inactive'
                              ? 'Inactivo'
                              : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDeleteCollaborator(e, collaborator.id)}
                            className="text-gray-600 border-gray-200 hover:bg-gray-100"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {collaborators.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-gray-500">No se encontraron colaboradores</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CollaboratorsSection; 