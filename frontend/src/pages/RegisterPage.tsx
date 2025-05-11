import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const { register, error, isLoading, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(email, password, name);
  };

  return (
    <>
      <Navbar />
      <div className="w-full max-w-7xl mx-auto py-20 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Registro de administradores</h1>
          
          <Card className="w-full shadow-lg bg-white rounded-xl overflow-hidden border-0 relative z-20">
            <CardContent className="p-6">
              {error && (
                <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600 text-sm mb-4">
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
                  <p>Este formulario es exclusivo para administradores. No debe compartirse públicamente.</p>
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