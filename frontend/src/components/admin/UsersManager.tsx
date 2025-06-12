import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, Eye, Tag, AlertTriangle, BarChart, BadgeCheck, Loader2, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
// Importar componente de detalles del usuario
import UserDetailsView, { UserExtended } from "./UserDetailsView";

// AlertDialog personalizado para evitar el error de hooks
const CustomAlertDialog = (props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
}) => {
  const {
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    cancelText = "Cancelar",
    confirmText = "Eliminar"
  } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)}></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            className="bg-black hover:bg-gray-800 text-white"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Tipo para usuarios
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "blocked";
  created_at: string;
  avatar?: string;
  tags?: string[];
  totalSpent?: number;
  bookingsCount?: number;
  lastBookingDate?: string;
  phone?: string;
  address?: string;
  profile_completed?: boolean;
  profile?: {
    title?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    country_code?: string;
    address?: string;
  };
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
};

const UsersManager = () => {
  const { toast } = useToast();
  
  // Estado para usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Estado para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserRole, setNewUserRole] = useState<string>("user");
  
  // Estado para vista de detalles
  const [detailsViewOpen, setDetailsViewOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserExtended | null>(null);

  // Filtrar usuarios localmente
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const searchLower = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.company_profile?.companyName || '').toLowerCase().includes(searchLower)
    );
  }, [users, searchQuery]);

  // Cargar usuarios cuando cambian los filtros
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, tagFilter]);

  // Efecto para actualizar campos cuando cambia el rol
  useEffect(() => {
    // Este efecto solo se ejecuta cuando se está creando un nuevo usuario
    if (!editingUser && userFormOpen) {
      // Reiniciar formulario según el rol seleccionado
      console.log('Cambiando formulario para rol:', newUserRole);
    }
  }, [newUserRole, editingUser, userFormOpen]);

  // Función para obtener token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Extraer la función fetchUsers
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('No hay sesión activa. Por favor inicie sesión');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/api/admin/users/list', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          role: roleFilter !== 'all' ? roleFilter : '',
          status: statusFilter !== 'all' ? statusFilter : '',
          tag: tagFilter !== 'all' ? tagFilter : ''
        }
      });
      
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('No tiene permisos de administrador para ver esta página');
      } else {
        setError('Error al cargar los usuarios. Intente nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los tags únicos
  const allTags = Array.from(new Set(users.flatMap(user => user.tags || [])));

  // Funciones para gestionar usuarios
  const handleAddUser = () => {
    setEditingUser(null);
    setNewUserRole("user");
    setUserFormOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUserId) {
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
        
        await axios.delete(`/api/admin/users/${selectedUserId}/delete`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUsers(users.filter(user => user.id !== selectedUserId));
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado correctamente",
        });
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        toast({
          title: "Error",
          description: "No se pudo eliminar el usuario. Intente nuevamente",
          variant: "destructive"
        });
      } finally {
        setDeleteDialogOpen(false);
        setSelectedUserId(null);
      }
    }
  };

  const handleUserSubmit = async (formData: any) => {
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
      
      // Comprobar si es administrador (no se puede editar)
      if (editingUser && editingUser.role === 'admin') {
        toast({
          title: "Acción no permitida",
          description: "Los administradores no pueden ser editados una vez creados",
          variant: "destructive"
        });
        setUserFormOpen(false);
        return;
      }
      
      // Preparar los datos según el tipo de usuario
      const userData: any = { ...formData };
      
      // Estructurar los datos del perfil
      if (editingUser?.role === 'user' || (formData.role === 'user' && !editingUser)) {
        userData.profile = {
          title: formData.title || '',
          first_name: formData.first_name || '',
          last_name: formData.last_name || '',
          phone: formData.phone || '',
          country_code: formData.country_code || '',
          address: formData.address || ''
        };
      }
      
      // Estructurar los datos de la empresa
      if (editingUser?.role === 'company' || (formData.role === 'company' && !editingUser)) {
        userData.is_company = true;
        userData.company_profile = {
          companyName: formData.companyName || '',
          phoneNumber: formData.phoneNumber || '',
          country: formData.country || '',
          location: formData.location || '',
          companySize: formData.companySize || '',
          hearAbout: formData.hearAbout || '',
          additionalInfo: formData.additionalInfo || '',
          representativeInfo: {
            firstName: formData.representativeFirstName || '',
            lastName: formData.representativeLastName || '',
            email: formData.representativeEmail || formData.email || ''
          },
          isCompany: true
        };
      }
      
      if (editingUser) {
        // Actualizar usuario existente
        const response = await axios.put(`/api/admin/users/${editingUser.id}/update`, userData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...response.data.user } : user
        ));
        
        toast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado correctamente",
        });
      } else {
        // Crear nuevo usuario
        const response = await axios.post('/api/admin/users/create', userData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const newUser: User = {
          ...response.data.user,
          tags: [],
          totalSpent: 0,
          bookingsCount: 0
        };
        
        setUsers([...users, newUser]);
        
        toast({
          title: "Usuario creado",
          description: "El usuario ha sido creado correctamente",
        });
      }
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      toast({
        title: "Error",
        description: axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "No se pudo guardar el usuario. Intente nuevamente",
        variant: "destructive"
      });
    } finally {
      setUserFormOpen(false);
      setEditingUser(null);
    }
  };

  // Funciones para detalles de usuario
  const handleViewUserDetails = async (userId: string) => {
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
      
      const response = await axios.get(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSelectedUserDetails(response.data.user);
      setDetailsViewOpen(true);
    } catch (err) {
      console.error('Error al obtener detalles del usuario:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del usuario",
        variant: "destructive"
      });
    }
  };

  // Agregar función para manejar el cierre del detalle y actualizar datos
  const handleCloseUserDetails = () => {
    setDetailsViewOpen(false);
    
    // Recargar los usuarios con los parámetros actuales
    const reloadUsers = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          setError('No hay sesión activa. Por favor inicie sesión');
          return;
        }
        
        const response = await axios.get('/api/admin/users/list', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            role: roleFilter !== 'all' ? roleFilter : '',
            status: statusFilter !== 'all' ? statusFilter : '',
            search: searchQuery,
            tag: tagFilter !== 'all' ? tagFilter : ''
          }
        });
        
        setUsers(response.data.users);
      } catch (err) {
        console.error('Error al recargar usuarios:', err);
      } finally {
        setLoading(false);
      }
    };
    
    reloadUsers();
  };

  // Función para asignar etiqueta
  const handleAssignTag = async (userId: string, tag: string) => {
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
      
      const response = await axios.post(`/api/admin/users/${userId}/tags`, 
        { 
          action: 'add',
          tag 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Actualizar estado de usuarios
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, tags: response.data.tags };
        }
        return user;
      }));
      
      // Actualizar detalles de usuario si están abiertos
      if (selectedUserDetails && selectedUserDetails.id === userId) {
        setSelectedUserDetails({ 
          ...selectedUserDetails, 
          tags: response.data.tags 
        });
      }
      
      toast({
        title: "Etiqueta asignada",
        description: `La etiqueta "${tag}" ha sido asignada correctamente`,
      });
    } catch (err) {
      console.error('Error al asignar etiqueta:', err);
      toast({
        title: "Error",
        description: "No se pudo asignar la etiqueta",
        variant: "destructive"
      });
    }
  };

  // Función para eliminar etiqueta
  const handleRemoveTag = async (userId: string, tag: string) => {
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
      
      const response = await axios.post(`/api/admin/users/${userId}/tags`, 
        { 
          action: 'remove',
          tag 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Actualizar estado de usuarios
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, tags: response.data.tags };
        }
        return user;
      }));
      
      // Actualizar detalles de usuario si están abiertos
      if (selectedUserDetails && selectedUserDetails.id === userId) {
        setSelectedUserDetails({ 
          ...selectedUserDetails, 
          tags: response.data.tags 
        });
      }
      
      toast({
        title: "Etiqueta eliminada",
        description: `La etiqueta "${tag}" ha sido eliminada correctamente`,
      });
    } catch (err) {
      console.error('Error al eliminar etiqueta:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la etiqueta",
        variant: "destructive"
      });
    }
  };

  // Renderizar mensaje de error o carga
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-12 w-12 text-black mb-4" />
        <h2 className="text-2xl font-bold text-black">Error</h2>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 text-black animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-600">Cargando usuarios...</h2>
      </div>
    );
  }

  // Renderizar la interfaz
  if (detailsViewOpen && selectedUserDetails) {
    return (
      <UserDetailsView 
        user={selectedUserDetails}
        onClose={handleCloseUserDetails}
        onAssignTag={handleAssignTag}
        onRemoveTag={handleRemoveTag}
      />
    );
  }

  // Renderizar la tabla de usuarios
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <Button 
          onClick={handleAddUser}
          className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Añadir Usuario
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 pl-10 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={tagFilter}
                onValueChange={setTagFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por etiqueta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las etiquetas</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-200 text-gray-600 mr-4">
                <BadgeCheck size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Usuarios activos</p>
                <h3 className="text-2xl font-bold">
                  {users.filter(u => u.status === "active" && u.role === "user").length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
                            <div className="p-2 rounded-full bg-gray-200 text-indigo-600 mr-4">                <Building2 size={20} />              </div>
              <div>
                <p className="text-sm text-gray-500">Empresas registradas</p>
                <h3 className="text-2xl font-bold">
                  {users.filter(u => u.role === "company").length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-200 text-purple-600 mr-4">
                <BarChart size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gasto promedio</p>
                <h3 className="text-2xl font-bold">
                  {users.length > 0 
                    ? `${(users.reduce((acc, user) => acc + (user.totalSpent || 0), 0) / users.length).toFixed(2)}€` 
                    : "0€"}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-4">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Usuarios VIP</p>
                <h3 className="text-2xl font-bold">
                  {users.filter(u => u.tags?.includes("VIP")).length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-200 text-gray-600 mr-4">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Usuarios inactivos</p>
                <h3 className="text-2xl font-bold">
                  {users.filter(u => u.status === "inactive").length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiquetas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewUserDetails(user.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium">
                              {user.name[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-gray-200 text-purple-800' :
                        user.role === 'company' ? 'bg-gray-200 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' :
                         user.role === 'company' ? 'Empresa' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.tags && user.tags.length > 0 ? (
                          user.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Sin etiquetas</span>
                        )}
                        {user.tags && user.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{user.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.totalSpent ? (
                        <span className="font-medium">{user.totalSpent.toFixed(2)}€</span>
                      ) : (
                        <span className="text-gray-400">0€</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${
                        user.status === 'active' ? 'bg-gray-200 text-green-800' : 
                        user.status === 'inactive' ? 'bg-gray-200 text-gray-800' :
                        'bg-gray-200 text-yellow-800'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          user.status === 'active' ? 'bg-black' : 
                          user.status === 'inactive' ? 'bg-black' :
                          'bg-yellow-600'
                        }`}></span>
                        {user.status === 'active' ? 'Activo' : 
                         user.status === 'inactive' ? 'Inactivo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar que se abra el detalle al hacer clic aquí
                            handleDeleteUser(user.id);
                          }}
                          className="text-gray-600 border-gray-200 hover:bg-gray-100"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-500">No se encontraron usuarios que coincidan con los criterios de búsqueda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo personalizado de eliminar usuario */}
      <CustomAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Estás seguro?"
        description="Esta acción eliminará permanentemente al usuario. Esta acción no se puede deshacer."
      />

      {/* Formulario de usuario */}
      <Dialog open={userFormOpen} onOpenChange={setUserFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Añadir Usuario"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Actualiza los datos del usuario" : "Completa el formulario para crear un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data: any = {};
            
            // Recopilar todos los valores del formulario
            for (const [key, value] of formData.entries()) {
              data[key] = value;
            }
            
            handleUserSubmit(data);
          }}>
            <div className="grid gap-4 py-4">
              {/* Campos comunes para todos los tipos de usuario */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm">
                  Nombre
                </label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingUser?.name || ''}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email || ''}
                  className="col-span-3"
                  required
                />
              </div>
              
              {/* Contraseña (solo para nuevos usuarios) */}
              {!editingUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="password" className="text-right text-sm">
                    Contraseña
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="col-span-3"
                  />
                </div>
              )}
              
              {/* Selector de rol (solo para nuevos usuarios) */}
              {!editingUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="role" className="text-right text-sm">
                    Rol
                  </label>
                  <Select
                    name="role"
                    defaultValue="user"
                    onValueChange={(value) => setNewUserRole(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="company">Empresa</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Mostrar rol como etiqueta para usuarios existentes */}
              {editingUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="role" className="text-right text-sm">
                    Rol
                  </label>
                  <div className="col-span-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      editingUser.role === 'admin' ? 'bg-gray-200 text-purple-800' :
                      editingUser.role === 'company' ? 'bg-gray-200 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {editingUser.role === 'admin' ? 'Administrador' :
                      editingUser.role === 'company' ? 'Empresa' : 'Usuario'}
                    </span>
                    <input type="hidden" name="role" value={editingUser.role} />
                  </div>
                </div>
              )}
              
              {/* Mostrar estado solo para usuarios existentes */}
              {editingUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="status" className="text-right text-sm">
                    Estado
                  </label>
                  <Select
                    name="status"
                    defaultValue={editingUser?.status || 'active'}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Campos específicos para usuarios regulares */}
              {(!editingUser || editingUser.role === 'user') && (
                <>
                  <div className="mt-4 mb-2">
                    <h3 className="text-md font-medium">Información personal</h3>
                    <hr className="mt-2" />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="title" className="text-right text-sm">
                      Título
                    </label>
                    <Select
                      name="title"
                      defaultValue={editingUser?.profile?.title || ''}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar título" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr.">Sr.</SelectItem>
                        <SelectItem value="Mrs.">Sra.</SelectItem>
                        <SelectItem value="Ms.">Srta.</SelectItem>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="first_name" className="text-right text-sm">
                      Nombre
                    </label>
                    <Input
                      id="first_name"
                      name="first_name"
                      defaultValue={editingUser?.profile?.first_name || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="last_name" className="text-right text-sm">
                      Apellidos
                    </label>
                    <Input
                      id="last_name"
                      name="last_name"
                      defaultValue={editingUser?.profile?.last_name || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="country_code" className="text-right text-sm">
                      Código de país
                    </label>
                    <Input
                      id="country_code"
                      name="country_code"
                      placeholder="+34, +52..."
                      defaultValue={editingUser?.profile?.country_code || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="phone" className="text-right text-sm">
                      Teléfono
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingUser?.profile?.phone || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="address" className="text-right text-sm">
                      Dirección
                    </label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={editingUser?.profile?.address || ''}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              
              {/* Campos específicos para empresas */}
              {((!editingUser && newUserRole === 'company') || 
                (editingUser && editingUser.role === 'company')) && (
                <>
                  <div className="mt-4 mb-2">
                    <h3 className="text-md font-medium">Información de la empresa</h3>
                    <hr className="mt-2" />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="companyName" className="text-right text-sm">
                      Nombre de la empresa
                    </label>
                    <Input
                      id="companyName"
                      name="companyName"
                      defaultValue={editingUser?.company_profile?.companyName || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="phoneNumber" className="text-right text-sm">
                      Teléfono de contacto
                    </label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      defaultValue={editingUser?.company_profile?.phoneNumber || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="country" className="text-right text-sm">
                      País
                    </label>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={editingUser?.company_profile?.country || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="location" className="text-right text-sm">
                      Ubicación
                    </label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue={editingUser?.company_profile?.location || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="companySize" className="text-right text-sm">
                      Tamaño de la empresa
                    </label>
                    <Select
                      name="companySize"
                      defaultValue={editingUser?.company_profile?.companySize || ''}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10 empleados">1-10 empleados</SelectItem>
                        <SelectItem value="11-50 empleados">11-50 empleados</SelectItem>
                        <SelectItem value="51-200 empleados">51-200 empleados</SelectItem>
                        <SelectItem value="201-500 empleados">201-500 empleados</SelectItem>
                        <SelectItem value="501+ empleados">501+ empleados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="hearAbout" className="text-right text-sm">
                      ¿Cómo nos conociste?
                    </label>
                    <Select
                      name="hearAbout"
                      defaultValue={editingUser?.company_profile?.hearAbout || ''}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Búsqueda en Google">Búsqueda en Google</SelectItem>
                        <SelectItem value="Redes sociales">Redes sociales</SelectItem>
                        <SelectItem value="Recomendación">Recomendación</SelectItem>
                        <SelectItem value="Publicidad">Publicidad</SelectItem>
                        <SelectItem value="Otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="additionalInfo" className="text-right text-sm align-top pt-2">
                      Información adicional
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      defaultValue={editingUser?.company_profile?.additionalInfo || ''}
                      className="col-span-3 min-h-[80px] px-3 py-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="mt-4 mb-2">
                    <h3 className="text-md font-medium">Información del representante</h3>
                    <hr className="mt-2" />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="representativeFirstName" className="text-right text-sm">
                      Nombre
                    </label>
                    <Input
                      id="representativeFirstName"
                      name="representativeFirstName"
                      defaultValue={editingUser?.company_profile?.representativeInfo?.firstName || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="representativeLastName" className="text-right text-sm">
                      Apellidos
                    </label>
                    <Input
                      id="representativeLastName"
                      name="representativeLastName"
                      defaultValue={editingUser?.company_profile?.representativeInfo?.lastName || ''}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="representativeEmail" className="text-right text-sm">
                      Email de contacto
                    </label>
                    <Input
                      id="representativeEmail"
                      name="representativeEmail"
                      defaultValue={editingUser?.company_profile?.representativeInfo?.email || ''}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              {editingUser?.role === 'admin' ? (
                <p className="text-amber-600 text-sm mr-auto">Los administradores no pueden ser editados</p>
              ) : null}
              <Button type="submit" disabled={editingUser?.role === 'admin'}>
                {editingUser ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManager; 