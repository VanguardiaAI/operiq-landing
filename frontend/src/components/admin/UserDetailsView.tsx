import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from "@/components/ui/select";
import { useState } from "react";
import {
  X, Save, Edit, CheckCircle, AlertTriangle, Mail, Phone, User as UserIcon, Building, CreditCard, Clock, FileText,
  Award, BookOpen, RefreshCw, BarChart
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Tipo para usuarios con propiedades extendidas
export type UserExtended = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "blocked";
  created_at: string;
  avatar?: string;
  phone?: string;
  address?: string;
  // Datos de transporte y financieros
  totalSpent?: number;
  bookingsCount?: number;
  lastBookingDate?: string;
  favoriteDestinations?: string[];
  // Preferencias
  preferences?: {
    vehicleType?: string;
    paymentMethod?: string;
    notifications?: boolean;
  };
  // Etiquetas
  tags?: string[];
  // Campos de perfil
  profile?: {
    title?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    country_code?: string;
    address?: string;
  };
  // Campos de perfil de empresa
  company_profile?: {
    companyName?: string;
    phoneNumber?: string;
    country?: string;
    location?: string;
    companySize?: string;
    hearAbout?: string;
    additionalInfo?: string;
    representativeInfo?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    isCompany?: boolean;
  };
  is_company?: boolean;
  profile_completed?: boolean;
};

interface UserDetailsViewProps {
  user: UserExtended;
  onClose: () => void;
  onAssignTag: (userId: string, tag: string) => void;
  onRemoveTag: (userId: string, tag: string) => void;
}

const UserDetailsView = ({
  user,
  onClose,
  onAssignTag,
  onRemoveTag}: UserDetailsViewProps) => {
  const { toast } = useToast();
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Consola para depuración - Ver la estructura exacta de usuario recibida
  console.log('Datos de usuario recibidos:', JSON.stringify(user, null, 2));
  
  // Etiquetas disponibles para asignar
  const availableTags = [
    "VIP", "Corporativo", "Frecuente", "Internacional", 
    "Evento Especial", "Pago Rápido", "Primera Clase",
    "Regular", "Ocasional", "Premium", "Facturación Mensual"
  ];

  // Manejar la asignación de una nueva etiqueta
  const handleAddTag = (tag: string) => {
    // Verificar si el usuario ya tiene esta etiqueta
    if (!user.tags?.includes(tag)) {
      onAssignTag(user.id, tag);
    }
  };

  // Manejar la eliminación de una etiqueta
  const handleRemoveTag = (tag: string) => {
    onRemoveTag(user.id, tag);
  };
  
  // Iniciar modo edición
  const handleStartEditing = () => {
    // Preparar datos iniciales para el formulario según el rol
    let initialData: any = {
      name: user.name,
      email: user.email,
      status: user.status};
    
    if (user.role === 'user') {
      initialData = {
        ...initialData,
        title: user.profile?.title || 'none',
        first_name: user.profile?.first_name || '',
        last_name: user.profile?.last_name || '',
        phone: user.profile?.phone || '',
        country_code: user.profile?.country_code || '',
        address: user.profile?.address || ''};
    } else if (user.role === 'company') {
      initialData = {
        ...initialData,
        companyName: user.company_profile?.companyName || '',
        phoneNumber: user.company_profile?.phoneNumber || '',
        country: user.company_profile?.country || '',
        location: user.company_profile?.location || '',
        companySize: user.company_profile?.companySize || '',
        hearAbout: user.company_profile?.hearAbout || '',
        additionalInfo: user.company_profile?.additionalInfo || '',
        representativeFirstName: user.company_profile?.representativeInfo?.firstName || '',
        representativeLastName: user.company_profile?.representativeInfo?.lastName || '',
        representativeEmail: user.company_profile?.representativeInfo?.email || ''};
    }
    
    setFormData(initialData);
    setIsEditing(true);
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    // Si el usuario es administrador, no permitir la edición
    if (user.role === 'admin') {
      toast({
        title: "Acción no permitida",
        description: "Los administradores no pueden ser editados",
        variant: "destructive"
      });
      setIsEditing(false);
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Preparar los datos para enviar al backend según el rol
      let dataToSend: any = { ...formData };
      
      // Si el título es "none", establecerlo como cadena vacía para la API
      if (dataToSend.title === 'none') {
        dataToSend.title = '';
      }
      
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Error",
          description: "No hay sesión activa. Por favor inicie sesión",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Enviando datos:', dataToSend);
      
      // Enviar los datos al backend
      await axios.put(`/api/admin/users/${user.id}/update`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente"
      });
      
      // Actualizar UI con los datos actualizados
      // Idealmente deberíamos recargar el usuario actualizado, pero por ahora simulamos la actualización
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      toast({
        title: "Error",
        description: axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "No se pudo actualizar el usuario. Intente nuevamente",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto">
      {/* Cabecera mejorada */}
      <div className="bg-white border-b shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800">
                {user.name} 
                <span className="ml-2 text-lg text-gray-500">
                  ({user.role === 'admin' ? 'Administrador' : 
                   user.role === 'company' ? 'Empresa' : 'Usuario'})
                </span>
              </h2>
              <p className="text-gray-500 text-sm">ID: {user.id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <Button 
                variant="outline"
                onClick={handleStartEditing}
                disabled={user.role === 'admin'}
                className="flex items-center hover:bg-gray-100 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex items-center hover:bg-gray-100 transition-colors"
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
              onClick={onClose}
              className="hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal - Vista única sin pestañas */}
      <div className="px-6 space-y-8">
        {/* Unificar Perfil de Usuario y Datos Personales en un solo contenedor */}
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center text-lg">
              <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Panel izquierdo - Avatar e información de contacto */}
              <div className="lg:col-span-4">
                {/* Avatar y datos básicos */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-24 w-24 rounded-full border-4 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 text-gray-600 flex items-center justify-center text-2xl font-bold border-4 border-gray-100 shadow-sm">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  
                  {!isEditing ? (
                    <>
                      <h3 className="text-xl font-medium mt-2">{user.name}</h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge 
                          className={cn(
                            "px-3 py-1 flex items-center",
                            user.role === 'admin' ? 'bg-gray-200 text-purple-800 hover:bg-gray-200' : 
                            user.role === 'company' ? 'bg-gray-200 text-blue-800 hover:bg-gray-200' : 
                            'bg-gray-100 text-gray-800 hover:bg-gray-100'
                          )}
                        >
                          {user.role === 'admin' ? 'Administrador' : 
                           user.role === 'company' ? 'Empresa' : 'Usuario'}
                        </Badge>
                        <Badge 
                          className={cn(
                            "px-3 py-1 flex items-center",
                            user.status === 'active' 
                              ? 'bg-gray-200 text-green-800 hover:bg-gray-200' 
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-200'
                          )}
                        >
                          <span className={`h-2 w-2 rounded-full mr-1.5 ${
                            user.status === 'active' ? 'bg-black' : 
                            'bg-black'
                          }`}></span>
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full space-y-2">
                        <label className="text-sm font-medium text-gray-500">Nombre:</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                        />
                      </div>
                      <div className="w-full space-y-2">
                        <label className="text-sm font-medium text-gray-500">Estado:</label>
                        <Select 
                          name="status" 
                          value={formData.status}
                          onValueChange={(value) => setFormData({...formData, status: value})}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="blocked">Bloqueado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {user.profile_completed ? (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0" />
                      <p className="text-sm text-green-700">Perfil completo</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-amber-700">Perfil incompleto</p>
                    </div>
                  </div>
                )}

                {user.role === 'admin' && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-amber-700">Los administradores no pueden ser editados</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel derecho - Datos específicos según rol */}
              <div className="lg:col-span-8">
                {/* Información de contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">Email:</span>
                    </div>
                    {isEditing ? (
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                      />
                    ) : (
                      <p className="text-sm font-medium pl-6">{user.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">Teléfono:</span>
                    </div>
                    {isEditing ? (
                      <div className="flex pl-6 gap-2">
                        <Input
                          name="country_code"
                          value={formData.country_code}
                          onChange={handleInputChange}
                          className="mt-1 w-20 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                          placeholder="+52"
                        />
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1 flex-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-medium pl-6">
                        {user.role === 'company' 
                          ? user.company_profile && user.company_profile.phoneNumber ? user.company_profile.phoneNumber : 'No especificado'
                          : user.profile && user.profile.country_code && user.profile.phone
                            ? `${user.profile.country_code} ${user.profile.phone}`
                            : 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>

                {user.role === 'company' ? (
                  // Datos de empresa
                  <div>
                    <h4 className="text-base font-medium mb-4 flex items-center border-b border-gray-200 pb-2">
                      <Building className="h-5 w-5 mr-2 text-gray-500" />
                      Datos de la Empresa
                    </h4>
                    
                    {!isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="md:space-y-2">
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Nombre de la empresa</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.companyName ? user.company_profile.companyName : 'No especificado'}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Ubicación</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.location ? user.company_profile.location : 'No especificado'}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">País</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.country ? user.company_profile.country : 'No especificado'}</p>
                          </div>
                        </div>
                        
                        <div className="md:space-y-2">
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Tamaño de la empresa</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.companySize ? user.company_profile.companySize : 'No especificado'}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">¿Cómo nos conoció?</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.hearAbout ? user.company_profile.hearAbout : 'No especificado'}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Información adicional</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.additionalInfo ? user.company_profile.additionalInfo : 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Modo edición para empresa
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Nombre de la empresa</label>
                            <Input
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Ubicación</label>
                            <Input
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">País</label>
                            <Input
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Tamaño de la empresa</label>
                            <Input
                              name="companySize"
                              value={formData.companySize}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">¿Cómo nos conoció?</label>
                            <Input
                              name="hearAbout"
                              value={formData.hearAbout}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Información adicional</label>
                            <Textarea
                              name="additionalInfo"
                              value={formData.additionalInfo}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Información del representante */}
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <h4 className="text-base font-medium mb-4 flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Información del Representante
                      </h4>
                      
                      {!isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Nombre</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.representativeInfo && user.company_profile.representativeInfo.firstName ? user.company_profile.representativeInfo.firstName : 'No especificado'}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Apellido</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.representativeInfo && user.company_profile.representativeInfo.lastName ? user.company_profile.representativeInfo.lastName : 'No especificado'}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="font-medium">{user.company_profile && user.company_profile.representativeInfo && user.company_profile.representativeInfo.email ? user.company_profile.representativeInfo.email : 'No especificado'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Nombre</label>
                            <Input
                              name="representativeFirstName"
                              value={formData.representativeFirstName}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Apellido</label>
                            <Input
                              name="representativeLastName"
                              value={formData.representativeLastName}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <Input
                              name="representativeEmail"
                              value={formData.representativeEmail}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Datos de usuario regular
                  <div>
                    <h4 className="text-base font-medium mb-4 flex items-center border-b border-gray-200 pb-2">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      Datos Personales
                    </h4>

                    {!isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-500">Título</p>
                          <p className="font-medium">{user.profile && user.profile.title ? user.profile.title : 'No especificado'}</p>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-500">Nombre</p>
                          <p className="font-medium">{user.profile && user.profile.first_name ? user.profile.first_name : 'No especificado'}</p>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-500">Apellido</p>
                          <p className="font-medium">{user.profile && user.profile.last_name ? user.profile.last_name : 'No especificado'}</p>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-500">Dirección</p>
                          <p className="font-medium">{user.profile && user.profile.address ? user.profile.address : 'No especificado'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Título</label>
                            <Select 
                              name="title" 
                              value={formData.title || 'none'}
                              onValueChange={(value) => setFormData({...formData, title: value})}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md">
                                <SelectValue placeholder="Seleccionar título" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Ninguno</SelectItem>
                                <SelectItem value="Mr.">Sr.</SelectItem>
                                <SelectItem value="Mrs.">Sra.</SelectItem>
                                <SelectItem value="Ms.">Srta.</SelectItem>
                                <SelectItem value="Dr.">Dr.</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Nombre</label>
                            <Input
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Apellido</label>
                            <Input
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Dirección</label>
                            <Textarea
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="mt-1 border-gray-300 focus:border-gray-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-md"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas y Preferencias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Estadísticas de actividad */}
          <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="bg-gray-50 border-b pb-3">
              <CardTitle className="flex items-center text-lg">
                <BarChart className="h-5 w-5 mr-2 text-gray-500" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Total gastado:</span>
                  </div>
                  <span className="font-medium text-gray-900">{user.totalSpent ? `${user.totalSpent.toFixed(2)}€` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Reservas totales:</span>
                  </div>
                  <span className="font-medium text-gray-900">{user.bookingsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Última reserva:</span>
                  </div>
                  <span className="font-medium text-gray-900">{user.lastBookingDate || 'N/A'}</span>
                </div>
              </div>

              {/* Destinos favoritos */}
              {user.favoriteDestinations && user.favoriteDestinations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Destinos favoritos</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.favoriteDestinations.map((destination, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1 bg-gray-100 text-blue-700 hover:bg-gray-200">
                        {destination}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferencias */}
          <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="bg-gray-50 border-b pb-3">
              <CardTitle className="flex items-center text-lg">
                <Award className="h-5 w-5 mr-2 text-gray-500" />
                Etiquetas y Preferencias
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">Tipo de vehículo:</span>
                  <span className="font-medium text-gray-900">{user.preferences?.vehicleType || 'No especificado'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">Método de pago:</span>
                  <span className="font-medium text-gray-900">{user.preferences?.paymentMethod || 'No especificado'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">Notificaciones:</span>
                  <Badge variant="outline" className={`${user.preferences?.notifications ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {user.preferences?.notifications ? 'Activadas' : 'Desactivadas'}
                  </Badge>
                </div>
              </div>

              {/* Etiquetas asignadas */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Etiquetas asignadas</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.tags && user.tags.length > 0 ? (
                    user.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer group px-3 py-1 border-gray-300 flex items-center" onClick={() => handleRemoveTag(tag)}>
                        {tag}
                        <X className="ml-1 h-3 w-3 opacity-60 group-hover:opacity-100" />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Sin etiquetas asignadas</p>
                  )}
                </div>

                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 mt-4">Asignar etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter(tag => !user.tags?.includes(tag))
                    .map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-gray-200 px-3 py-1 flex items-center"
                        onClick={() => handleAddTag(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Reservas */}
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="bg-gray-50 border-b pb-3">
            <CardTitle className="flex items-center text-lg">
              <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
              Historial de Reservas
            </CardTitle>
            <CardDescription>
              Últimas reservas realizadas por el usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            {user.bookingsCount && user.bookingsCount > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Aquí irían los datos de reservas (mockup) */}
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 text-sm text-gray-500">R-12345</td>
                      <td className="py-4 text-sm text-gray-900">Madrid - Barcelona</td>
                      <td className="py-4 text-sm text-gray-500">15/06/2024</td>
                      <td className="py-4 text-sm text-gray-500">Mercedes-Benz Clase S</td>
                      <td className="py-4 text-sm text-gray-500">450€</td>
                      <td className="py-4">
                        <Badge variant="secondary" className="bg-gray-200 text-green-800 hover:bg-gray-200">
                          Completado
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mb-4 flex justify-center">
                  <BookOpen className="h-12 w-12 text-gray-300" />
                </div>
                <p className="text-gray-500">No hay reservas registradas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailsView; 