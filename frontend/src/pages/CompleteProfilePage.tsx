import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { User, ChevronDown, ChevronLeft, Phone } from "lucide-react";
import Navbar from "../components/Navbar";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function CompleteProfilePage() {
  const { user, isLoading: authLoading, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Estados para los campos del formulario
  const [title, setTitle] = useState("Mr.");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Si el usuario ya completó su perfil, redirigir a inicio
    if (user && user.profile_completed) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        '/api/profile/complete',
        {
          title,
          first_name: firstName,
          last_name: lastName,
          country_code: countryCode,
          phone: phone
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Actualizar datos del usuario en el contexto
      if (response.data.user) {
        setUser(response.data.user);
      }

      // Redirigir a la página principal
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="font-bold text-xl">OPERIQ</a>
          <div className="flex items-center gap-4">
            <a href="/help" className="text-sm text-gray-600">Ayuda</a>
            <a href="#" className="text-sm flex items-center gap-1">
              Español
              <ChevronDown size={16} />
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto pt-8 pb-16 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6 hover:text-black"
        >
          <ChevronLeft size={20} />
          <span>Volver</span>
        </button>

        <h1 className="text-2xl font-bold mb-2">Añada sus datos personales</h1>
        <p className="text-gray-600 mb-8">
          Complete su perfil para mantener su cuenta actualizada y segura.
        </p>

        {error && (
          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600 text-sm mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Título</Label>
              <Select value={title} onValueChange={setTitle}>
                <SelectTrigger className="bg-gray-50 border-gray-300 h-12">
                  <SelectValue placeholder="Seleccione un título" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr.">Sr.</SelectItem>
                  <SelectItem value="Mrs.">Sra.</SelectItem>
                  <SelectItem value="Ms.">Srta.</SelectItem>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-gray-50 border-gray-300 h-12"
                placeholder="Ingrese su nombre"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-gray-50 border-gray-300 h-12"
                placeholder="Ingrese su apellido"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Número de móvil</Label>
              <div className="flex">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-24 bg-gray-50 border-gray-300 h-12 rounded-r-none">
                    <SelectValue placeholder="+1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+34">+34</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+52">+52</SelectItem>
                    <SelectItem value="+33">+33</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="flex-1 bg-gray-50 border-gray-300 h-12 rounded-l-none"
                  placeholder="Ingrese su número de teléfono"
                  type="tel"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Añade tu número de teléfono móvil para recibir notificaciones de los trayectos.
              </p>
            </div>

            <div className="text-sm text-gray-500 mt-8">
              Al añadir sus datos personales, acepta nuestra <a href="#" className="text-blue-600 hover:underline">Política de privacidad</a> y 
              nuestras <a href="#" className="text-blue-600 hover:underline">Condiciones de uso</a>.
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition-colors h-12"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar y continuar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 