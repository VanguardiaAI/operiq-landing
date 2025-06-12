import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, error, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  
  // Redireccionar si ya hay un usuario con rol admin
  useEffect(() => {
    if (user) {
      console.log("Usuario autenticado:", user); // Agregar para debugging
      if (user.role === 'admin') {
        console.log("Redirigiendo a /admin porque el usuario es admin"); // Agregar para debugging
        navigate('/admin');
      } else if (user.profile_completed === false) {
        console.log("Redirigiendo a /complete-profile porque el perfil no está completo"); // Agregar para debugging
        navigate('/complete-profile');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Iniciando registro con rol admin"); // Agregar para debugging
      await register(email, password, name, 'admin');
      console.log("Registro completado, esperando actualización del estado de usuario"); // Mejorar el logging
      
      // Verificar el estado del usuario después del registro
      setTimeout(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
          const currentUser = JSON.parse(userData);
          console.log("Estado del usuario después del registro:", currentUser);
          
          // Forzar redirección si el usuario es admin
          if (currentUser.role === 'admin') {
            console.log("Forzando redirección a /admin");
            navigate('/admin');
          }
        }
      }, 1000); // Esperar 1 segundo para que el estado se actualice
    } catch (error) {
      console.error("Error en el registro:", error); // Agregar para debugging
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full max-w-7xl mx-auto py-20 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Registro de administradores</h1>
          
          <div className="bg-gray-100 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Este registro es exclusivo para administradores. Serás redirigido directamente al panel de administración.
              </p>
            </div>
          </div>
          
          <Card className="w-full shadow-lg bg-white rounded-xl overflow-hidden border-0 relative z-20">
            <CardContent className="p-6">
              {error && (
                <div className="bg-gray-100 p-3 rounded border border-gray-200 text-gray-600 text-sm mb-4">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="relative">
                  <User className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-black hover:border-gray-400 bg-gray-50">
                    <Label className="mb-0 text-left text-xs">Nombre</Label>
                    <Input 
                      className="border-0 p-0 h-6 focus:ring-0 placeholder:text-gray-400 bg-gray-50" 
                      placeholder="Tu nombre" 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-black hover:border-gray-400 bg-gray-50">
                    <Label className="mb-0 text-left text-xs">Email</Label>
                    <Input 
                      className="border-0 p-0 h-6 focus:ring-0 placeholder:text-gray-400 bg-gray-50" 
                      placeholder="tu@email.com" 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  <div className="flex flex-col pl-10 pt-1 border rounded-md h-[52px] focus-within:border-black hover:border-gray-400 bg-gray-50">
                    <Label className="mb-0 text-left text-xs">Contraseña</Label>
                    <Input 
                      className="border-0 p-0 h-6 focus:ring-0 placeholder:text-gray-400 bg-gray-50" 
                      placeholder="Crea una contraseña segura" 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Este formulario es exclusivo para administradores. Una vez registrado, tendrás acceso completo al panel de administración sin necesidad de completar un perfil adicional.</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 select-button text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Registrando..." : "Crear cuenta de administrador"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
} 