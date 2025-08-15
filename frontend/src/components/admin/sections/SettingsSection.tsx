import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Shield, Key, User, Mail, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "@/config/axios";

interface Admin {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SettingsSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"admins" | "password">("admins");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  
  // Estado para agregar administrador
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: ""
  });
  
  // Estado para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Cargar lista de administradores
  useEffect(() => {
    if (activeTab === "admins") {
      fetchAdmins();
    }
  }, [activeTab]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/settings/admins");
      setAdmins(response.data.admins);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los administradores"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Todos los campos son obligatorios"
      });
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/api/admin/settings/admins", newAdmin);
      
      toast({
        title: "Éxito",
        description: "Administrador agregado correctamente"
      });
      
      setNewAdmin({ name: "", email: "", password: "" });
      setShowAddAdmin(false);
      fetchAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "No se pudo agregar el administrador"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este administrador?")) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(`/api/admin/settings/admins/${adminId}`);
      
      toast({
        title: "Éxito",
        description: "Administrador eliminado correctamente"
      });
      
      fetchAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "No se pudo eliminar el administrador"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres"
      });
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put("/api/admin/settings/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast({
        title: "Éxito",
        description: "Contraseña actualizada correctamente"
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "No se pudo actualizar la contraseña"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
        <p className="text-gray-600 mt-1">Gestiona los administradores y tu contraseña</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("admins")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "admins"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="inline-block w-4 h-4 mr-2" />
            Administradores
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "password"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Key className="inline-block w-4 h-4 mr-2" />
            Cambiar Contraseña
          </button>
        </div>

        <div className="p-6">
          {activeTab === "admins" && (
            <div className="space-y-6">
              {/* Botón agregar administrador */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Lista de Administradores</h2>
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Administrador
                </button>
              </div>

              {/* Formulario para agregar administrador */}
              {showAddAdmin && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Nuevo Administrador</h3>
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="admin@privyde.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña temporal
                      </label>
                      <input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                      >
                        {loading ? "Agregando..." : "Agregar Administrador"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAdmin(false);
                          setNewAdmin({ name: "", email: "", password: "" });
                        }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de administradores */}
              {loading && !showAddAdmin ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha de creación</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              {admin.name}
                              {admin._id === user?.id && (
                                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Tú</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {admin.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {admin._id !== user?.id && (
                              <button
                                onClick={() => handleDeleteAdmin(admin._id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className="max-w-md">
              <h2 className="text-lg font-semibold mb-6">Cambiar tu contraseña</h2>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Actualizando..." : "Actualizar Contraseña"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}