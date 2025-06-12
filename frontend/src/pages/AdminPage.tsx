import { useAuth } from "../context/AuthContext";

import { useState, useEffect } from "react";
import { 
  Users, Car, CalendarClock, Map, MessageSquare, 
  BarChart2, Settings, FileText, LogOut, Home,
  PlusCircle, Search, Bell, ChevronDown, Menu, X, MapPin
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NotificationsMenu from "@/components/admin/NotificationsMenu";

// Importar la sección de vehículos modularizada
import VehiclesSection from "@/components/admin/sections/VehiclesSection";

// Importar la sección de chóferes modularizada
import DriversSection from "@/components/admin/sections/DriversSection";

// Importar la sección de colaboradores modularizada
import CollaboratorsSection from "@/components/admin/sections/CollaboratorsSection";

// Importar la sección de reservas modularizada
import BookingsSection from "@/components/admin/sections/BookingsSection";

// Importar la sección de rutas modularizada
import RoutesSection from "@/components/admin/sections/RoutesSection";

// Importar StatsSection
import StatsSection from "@/components/admin/StatsSection";

// Importar UsersManager con la ruta correcta
import UsersManager from "@/components/admin/UsersManager";

// Importar SupportSection
import SupportSection from "@/components/admin/sections/SupportSection";

// Importar la sección de blog modularizada
import BlogSection from "@/components/admin/sections/BlogSection";

// Definir el tipo para las reservas
export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  pickupDateTime: string;
  pickupLocation: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffLocation: string;
  dropoffCoordinates?: { lat: number; lng: number };
  stops?: { location: string; coordinates?: { lat: number; lng: number } }[];
  serviceType: 'one_way' | 'round_trip' | 'hourly' | 'full_day';
  vehicleId?: string;
  vehicleInfo?: {
    brand: string;
    model: string;
    licensePlate: string;
    image?: string;
  };
  driverId?: string;
  driverInfo?: {
    name: string;
    phone: string;
    photo?: string;
  };
  passengers: number;
  luggage: number;
  price: {
    amount: number;
    currency: string;
    paymentMethod: 'credit_card' | 'paypal' | 'cash' | 'bank_transfer' | 'invoice';
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  };
  notes?: string;
  specialRequests?: string[];
  createdAt: string;
  updatedAt: string;
  incidentHistory?: {
    timestamp: string;
    type: 'delay' | 'cancellation' | 'change' | 'complaint' | 'other';
    description: string;
    resolvedBy?: string;
    resolution?: string;
    status: 'pending' | 'in_progress' | 'resolved';
  }[];
}

// Componente para mostrar una tarjeta de estadísticas
const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
    <div className={`p-4 rounded-xl ${color} mr-4`}>
      {icon}
    </div>
    <div>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Función para obtener parámetros de URL
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    const conversation = searchParams.get('conversation');
    return { section, conversation };
  };

  // Forzar redirección si no es administrador
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Procesar parámetros de URL al cargar la página
  useEffect(() => {
    const { section, conversation } = getUrlParams();
    
    if (section) {
      setActiveSection(section);
    }
    
    if (conversation) {
      setSelectedConversationId(conversation);
    }
  }, [location.search]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para manejar selección de conversación desde notificaciones
  const handleSelectSupportConversation = (conversationId: string) => {
    setActiveSection("support");
    setSelectedConversationId(conversationId);
    
    // Actualizar URL para reflejar el cambio sin recargar la página
    const newUrl = conversationId 
      ? `/admin?section=support&conversation=${conversationId}` 
      : `/admin?section=support`;
    
    window.history.pushState({}, '', newUrl);
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { id: "users", label: "Usuarios", icon: <Users size={20} /> },
    { id: "collaborators", label: "Colaboradores", icon: <Users size={20} /> },
    { id: "drivers", label: "Chóferes", icon: <Users size={20} /> },
    { id: "vehicles", label: "Vehículos", icon: <Car size={20} /> },
    { id: "routes", label: "Rutas", icon: <MapPin size={20} /> },
    { id: "bookings", label: "Reservas", icon: <CalendarClock size={20} /> },
    { id: "support", label: "Soporte", icon: <MessageSquare size={20} /> },
    { id: "blog", label: "Blog", icon: <FileText size={20} /> },
    { id: "stats", label: "Estadísticas", icon: <BarChart2 size={20} /> },
    { id: "settings", label: "Configuración", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Versión escritorio */}
      <div className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-5 border-b">
          <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Privyde Transport</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? "bg-gray-100 text-gray-600" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Sidebar móvil */}
      <div className={`md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-50 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-y-0 left-0 w-64 bg-white transition-transform transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
            <button onClick={() => setMenuOpen(false)} className="text-gray-500">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? "bg-gray-100 text-gray-600" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMenuOpen(false);
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut size={20} className="mr-3" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
          {/* Left side - Mobile menu toggle + Section title */}
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-gray-500"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h2>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center relative">
              <input 
                type="text"
                placeholder="Buscar..." 
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 w-64" 
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            </div>
            
            {/* Notifications */}
            <NotificationsMenu 
              onSelectSupportConversation={handleSelectSupportConversation}
            />
            
            {/* User dropdown */}
            <div className="relative">
              <button className="flex items-center text-gray-700 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="hidden md:block text-sm mr-1">{user?.name || 'Admin'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Contenido dinámico según la sección activa */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <button className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <PlusCircle size={18} className="mr-2" />
                  Nueva acción
                </button>
              </div>
              
              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Usuarios activos" 
                  value="245" 
                  icon={<Users size={24} className="text-black" />} 
                  color="bg-gray-100" 
                />
                <StatCard 
                  title="Reservas hoy" 
                  value="12" 
                  icon={<CalendarClock size={24} className="text-gray-600" />} 
                  color="bg-green-50" 
                />
                <StatCard 
                  title="Vehículos disponibles" 
                  value="18" 
                  icon={<Car size={24} className="text-gray-500" />} 
                  color="bg-purple-50" 
                />
                <StatCard 
                  title="Ingresos semanales" 
                  value="9.854€" 
                  icon={<BarChart2 size={24} className="text-amber-500" />} 
                  color="bg-amber-50" 
                />
              </div>
              
              {/* Secciones principales */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Últimas reservas */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Últimas reservas</h2>
                    <button className="text-sm text-gray-600 hover:text-gray-700">Ver todas</button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map(i => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-4 text-sm text-gray-500">OP-{1000 + i}</td>
                            <td className="py-4 text-sm text-gray-900">Cliente {i}</td>
                            <td className="py-4 text-sm text-gray-500">Madrid</td>
                            <td className="py-4 text-sm text-gray-500">23/06/2024</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                i % 3 === 0 ? "bg-gray-200 text-yellow-800" : 
                                i % 3 === 1 ? "bg-gray-200 text-green-800" : 
                                "bg-gray-200 text-blue-800"
                              }`}>
                                {i % 3 === 0 ? "Pendiente" : i % 3 === 1 ? "Completado" : "En proceso"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Actividad reciente */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Actividad reciente</h2>
                    <button className="text-sm text-gray-600 hover:text-gray-700">Ver todo</button>
                  </div>
                  
                  <div className="space-y-5">
                    {[
                      { icon: <Users size={16} />, text: "Nuevo usuario registrado", time: "Hace 5 min", color: "bg-gray-200 text-gray-600" },
                      { icon: <Car size={16} />, text: "Reserva completada #OP-1005", time: "Hace 30 min", color: "bg-gray-200 text-green-600" },
                      { icon: <MessageSquare size={16} />, text: "Nuevo mensaje de soporte", time: "Hace 1 hora", color: "bg-amber-100 text-amber-600" },
                      { icon: <Settings size={16} />, text: "Mantenimiento programado", time: "Hace 2 horas", color: "bg-gray-200 text-purple-600" },
                      { icon: <Users size={16} />, text: "Nueva empresa registrada", time: "Hace 3 horas", color: "bg-gray-200 text-indigo-600" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start">
                        <div className={`p-2 rounded-full ${item.color} mr-3 flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{item.text}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === "vehicles" && (
            <VehiclesSection />
          )}
          
          {activeSection === "drivers" && (
            <DriversSection />
          )}
          
          {activeSection === "collaborators" && (
            <CollaboratorsSection />
          )}
          
          {activeSection === "bookings" && (
            <BookingsSection />
          )}
          
          {activeSection === "routes" && (
            <RoutesSection />
          )}
          
          {activeSection === "stats" && (
            <StatsSection />
          )}
          
          {activeSection === "users" && (
            <div>
              <UsersManager />
            </div>
          )}
          
          {activeSection === "support" && (
            <SupportSection selectedConversationId={selectedConversationId} />
          )}
          
          {activeSection === "blog" && (
            <BlogSection />
          )}
          
          {activeSection === "settings" && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white shadow-lg rounded-xl p-8 max-w-xl w-full text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Sección {activeSection}</h2>
                <p className="text-gray-600 mb-6">
                  Esta sección está en desarrollo. Aquí se implementará la gestión de {activeSection}.
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <PlusCircle size={18} className="mr-2" />
                  Continuar desarrollo
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 