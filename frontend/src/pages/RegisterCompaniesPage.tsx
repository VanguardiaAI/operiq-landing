import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import { Mail, Lock, Building, User, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";

type CompanyRegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  phonePrefix: string;
  phoneNumber: string;
  country: string;
  location: string;
  companySize: string;
  hearAbout: string;
  additionalInfo: string;
  termsAccepted: boolean;
};

const initialFormData: CompanyRegistrationData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  phonePrefix: "+34",
  phoneNumber: "",
  country: "España",
  location: "",
  companySize: "1-10 empleados",
  hearAbout: "Búsqueda en Google",
  additionalInfo: "",
  termsAccepted: false
};

export default function RegisterCompaniesPage() {
  const { register, error, isLoading, clearError, setUser, setToken, setError } = useAuth();
  const [formData, setFormData] = useState<CompanyRegistrationData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof CompanyRegistrationData, string>>>({});
  const [isFromCompaniesForm, setIsFromCompaniesForm] = useState(false);
  const navigate = useNavigate();

  // Cargar datos de localStorage si existen
  useEffect(() => {
    const savedContactData = localStorage.getItem('companyContactData');
    if (savedContactData) {
      setIsFromCompaniesForm(true);
      try {
        const contactData = JSON.parse(savedContactData);
        // Actualizar el estado con los datos guardados
        setFormData(prevData => ({
          ...prevData,
          firstName: contactData.firstName || prevData.firstName,
          lastName: contactData.lastName || prevData.lastName,
          companyName: contactData.companyName || prevData.companyName,
          phonePrefix: contactData.phonePrefix || prevData.phonePrefix,
          phoneNumber: contactData.phoneNumber || prevData.phoneNumber,
          country: contactData.country || prevData.country,
          location: contactData.location || prevData.location,
          companySize: contactData.companySize || prevData.companySize,
          hearAbout: contactData.hearAbout || prevData.hearAbout,
          additionalInfo: contactData.message || prevData.additionalInfo
        }));
        
        // Limpiar datos guardados después de cargarlos
        localStorage.removeItem('companyContactData');
      } catch (err) {
        console.error("Error al cargar los datos de contacto:", err);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error de validación al editar
    if (validationErrors[name as keyof CompanyRegistrationData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      termsAccepted: checked
    }));

    if (validationErrors.termsAccepted) {
      setValidationErrors(prev => ({
        ...prev,
        termsAccepted: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CompanyRegistrationData, string>> = {};
    
    // Validaciones básicas
    if (!formData.firstName.trim()) errors.firstName = "El nombre es requerido";
    if (!formData.lastName.trim()) errors.lastName = "El apellido es requerido";
    if (!formData.email.trim()) errors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email inválido";
    
    if (!formData.password) errors.password = "La contraseña es requerida";
    else if (formData.password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres";
    
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";
    
    if (!formData.companyName.trim()) errors.companyName = "El nombre de la empresa es requerido";
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "El número de teléfono es requerido";
    if (!formData.location.trim()) errors.location = "La ubicación es requerida";
    
    if (!formData.termsAccepted) errors.termsAccepted = "Debe aceptar los términos y condiciones";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // 1. Registrar el usuario básico (autenticación) con rol "company"
      await register(formData.email, formData.password, `${formData.firstName} ${formData.lastName}`, 'company');
      
      // 2. Obtener el token de autenticación (generado por el registro)
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación después del registro');
      }
      
      // 3. Preparar los datos de la empresa
      const companyData = {
        companyName: formData.companyName,
        phoneNumber: `${formData.phonePrefix}${formData.phoneNumber}`,
        country: formData.country,
        location: formData.location,
        companySize: formData.companySize,
        hearAbout: formData.hearAbout,
        additionalInfo: formData.additionalInfo,
        // Añadir información del representante
        representativeInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        },
        isCompany: true // Marcar que es una empresa
      };
      
      // 4. Enviar los datos de la empresa al backend
      const companyResponse = await axios.post(
        `${import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'}/api/profile/update-company`,
        companyData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!companyResponse.data.success) {
        throw new Error('Error al guardar los datos de la empresa');
      }
      
      // 5. Actualizar el usuario en localStorage con los datos de la empresa
      if (companyResponse.data.user) {
        localStorage.setItem('user', JSON.stringify(companyResponse.data.user));
        setUser(companyResponse.data.user);
      }
      
      // 6. Redirigir según el estado del perfil
      navigate('/complete-profile');
      
    } catch (err: any) {
      console.error("Error en registro:", err);
      // Si hay un error en la segunda petición, asegurarse de que el usuario sepa que algo falló
      if (err.response) {
        setError(err.response.data.error || 'Error al guardar los datos de la empresa');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error desconocido durante el registro de la empresa');
      }
      
      // Si falló la segunda petición, pero el usuario ya fue creado,
      // podemos mantener la sesión iniciada y solo mostrar un mensaje
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full bg-gray-50 py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto mb-16">
            <h1 className="text-3xl font-bold text-center mb-8">Registro de Empresas</h1>
            
            {isFromCompaniesForm && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-700 mb-6 text-center">
                Casi has terminado. Completa tu registro de empresa para continuar.
              </div>
            )}
            
            <Card className="w-full shadow-lg bg-white rounded-xl overflow-hidden border-0 relative z-20">
              <CardContent className="p-6 md:p-8">
                {error && (
                  <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600 text-sm mb-6">
                    {error}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Información Personal
                    </h2>
                    <p className="text-sm text-gray-500">
                      Datos del representante o administrador de la cuenta empresarial
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full ${validationErrors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {validationErrors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full ${validationErrors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {validationErrors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Corporativo <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          placeholder="empresa@dominio.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`pl-10 ${validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input 
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`pl-10 ${validationErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                      </div>
                      {validationErrors.password && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input 
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Repite tu contraseña"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`pl-10 ${validationErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 pt-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Información de la Empresa
                    </h2>
                    <p className="text-sm text-gray-500">
                      Datos de la empresa para configurar su cuenta corporativa
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la empresa <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`w-full ${validationErrors.companyName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {validationErrors.companyName && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.companyName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        País <span className="text-red-500">*</span>
                      </Label>
                      <select 
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option>España</option>
                        <option>Estados Unidos</option>
                        <option>México</option>
                        <option>Argentina</option>
                        <option>Colombia</option>
                        <option>Chile</option>
                        <option>Perú</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="phonePrefix" className="block text-sm font-medium text-gray-700 mb-1">
                        Prefijo <span className="text-red-500">*</span>
                      </Label>
                      <select 
                        id="phonePrefix"
                        name="phonePrefix"
                        value={formData.phonePrefix}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option>+34</option>
                        <option>+1</option>
                        <option>+52</option>
                        <option>+54</option>
                        <option>+57</option>
                        <option>+56</option>
                        <option>+51</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de teléfono <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input 
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          placeholder="912345678"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`pl-10 ${validationErrors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                      </div>
                      {validationErrors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad / Ubicación <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="location"
                      name="location"
                      placeholder="Ej: Madrid, Barcelona, etc."
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full ${validationErrors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {validationErrors.location && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
                      Tamaño de la empresa
                    </Label>
                    <select 
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option>1-10 empleados</option>
                      <option>11-50 empleados</option>
                      <option>51-200 empleados</option>
                      <option>201-500 empleados</option>
                      <option>501-1000 empleados</option>
                      <option>1000+ empleados</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="hearAbout" className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Cómo se enteró de nosotros?
                    </Label>
                    <select 
                      id="hearAbout"
                      name="hearAbout"
                      value={formData.hearAbout}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option>Búsqueda en Google</option>
                      <option>Redes sociales</option>
                      <option>Recomendación</option>
                      <option>Publicidad</option>
                      <option>Otro</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                      Información adicional o necesidades específicas
                    </Label>
                    <textarea 
                      id="additionalInfo"
                      name="additionalInfo"
                      rows={4}
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      placeholder="Descríbanos las necesidades específicas de transporte de su empresa"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={handleCheckboxChange}
                      className={validationErrors.termsAccepted ? 'border-red-300 data-[state=checked]:bg-red-500' : ''}
                    />
                    <div>
                      <label 
                        htmlFor="termsAccepted" 
                        className={`block text-sm ${validationErrors.termsAccepted ? 'text-red-600' : 'text-gray-500'}`}
                      >
                        Acepto los <a href="#" className="text-primary underline">Términos y Condiciones</a> y la <a href="#" className="text-primary underline">Política de Privacidad</a> <span className="text-red-500">*</span>
                      </label>
                      {validationErrors.termsAccepted && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.termsAccepted}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 select-button text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrando..." : "Registrarse"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    ¿Ya tienes una cuenta? <Link to="/login-companies" className="text-primary font-semibold hover:underline">Inicia sesión</Link>
                  </p>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Beneficios para empresas</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Al registrarse, su empresa tendrá acceso a tarifas corporativas especiales, facturación centralizada, panel de administración exclusivo y atención personalizada.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 