import { ChevronDown, Globe, Menu, User, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"

// Definición de tipos para los servicios (opcional pero buena práctica)
interface Service {
  title: string;
  // description?: string; // La descripción es opcional para algunos elementos del menú
  // link?: string; // Enlace opcional
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLanguageOpen, setIsMobileLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Referencias para los temporizadores
  const servicesTimeoutRef = useRef<number | null>(null);
  const companyTimeoutRef = useRef<number | null>(null);
  const languageTimeoutRef = useRef<number | null>(null);
  const userMenuTimeoutRef = useRef<number | null>(null);

  // Limpiar los temporizadores al desmontar el componente
  useEffect(() => {
    return () => {
      if (servicesTimeoutRef.current) window.clearTimeout(servicesTimeoutRef.current);
      if (companyTimeoutRef.current) window.clearTimeout(companyTimeoutRef.current);
      if (languageTimeoutRef.current) window.clearTimeout(languageTimeoutRef.current);
      if (userMenuTimeoutRef.current) window.clearTimeout(userMenuTimeoutRef.current);
    };
  }, []);

  const services: Service[] = [
    { title: "Viajes de ciudad a ciudad" },
    { title: "Traslados al aeropuerto" },
    { title: "Alquiler por horas/días" },
    { title: "Servicios eventos especiales" },
    { title: "Servicios de limusinas" },
    { title: "Jets privados" },
    { title: "Traslados corporativos VIP" },
    { title: "Servicios de seguridad ejecutiva discreta" },
  ];

  const companyMenuItems: Service[] = [
    { title: "Resumen" },
    { title: "Empresas" },
    { title: "Agencias de viajes" },
    { title: "Asociaciones estratégicas" },
  ];

  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleServicesMenu = () => {
    if (window.innerWidth < 768) {
      setIsServicesMenuOpen(!isServicesMenuOpen);
    }
  };

  const toggleCompanyMenu = () => {
    if (window.innerWidth < 768) {
      setIsCompanyMenuOpen(!isCompanyMenuOpen);
    }
  };

  const toggleMobileLanguage = () => {
    setIsMobileLanguageOpen(!isMobileLanguageOpen);
  };

  // Funciones para gestionar los menús con retraso
  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) window.clearTimeout(servicesTimeoutRef.current);
    setIsServicesMenuOpen(true);
  };
  
  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = window.setTimeout(() => {
      setIsServicesMenuOpen(false);
    }, 300); // 300ms de retraso
  };
  
  const handleCompanyMouseEnter = () => {
    if (companyTimeoutRef.current) window.clearTimeout(companyTimeoutRef.current);
    setIsCompanyMenuOpen(true);
  };
  
  const handleCompanyMouseLeave = () => {
    companyTimeoutRef.current = window.setTimeout(() => {
      setIsCompanyMenuOpen(false);
    }, 300);
  };
  
  const handleLanguageMouseEnter = () => {
    if (languageTimeoutRef.current) window.clearTimeout(languageTimeoutRef.current);
    setIsLanguageMenuOpen(true);
  };
  
  const handleLanguageMouseLeave = () => {
    languageTimeoutRef.current = window.setTimeout(() => {
      setIsLanguageMenuOpen(false);
    }, 300);
  };

  // Funciones para gestionar el menú de usuario con retraso
  const handleUserMenuMouseEnter = () => {
    if (userMenuTimeoutRef.current) window.clearTimeout(userMenuTimeoutRef.current);
    setIsUserMenuOpen(true);
  };
  
  const handleUserMenuMouseLeave = () => {
    userMenuTimeoutRef.current = window.setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 300);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Navigation */}
      <nav className="nav-container bg-white shadow-md py-2 px-4 md:px-6 flex items-center justify-between text-gray-700 font-sans">
        <Link to="/" className="nav-logo text-xl font-bold text-black">PRIVYDE</Link>
        <div className="hidden md:flex nav-menu items-center">
          <div 
            className="nav-menu-item group relative px-3"
            onMouseEnter={handleServicesMouseEnter}
            onMouseLeave={handleServicesMouseLeave}
          >
            <span className="cursor-pointer flex items-center hover:text-black">
              Nuestros servicios
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isServicesMenuOpen ? 'rotate-180' : ''}`} />
            </span>
            {isServicesMenuOpen && (
              <div 
                className="absolute left-0 top-full mt-1 w-64 bg-white shadow-md border border-gray-100 rounded-md z-50"
                onMouseEnter={handleServicesMouseEnter}
                onMouseLeave={handleServicesMouseLeave}
              >
                {services.map((service, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-b-0">
                    <Link to={service.title === "Viajes de ciudad a ciudad" ? "/city-to-city" : 
                               service.title === "Traslados al aeropuerto" ? "/airport-transfers" : 
                               service.title === "Alquiler por horas/días" ? "/hourly-hire" : 
                               service.title === "Servicios eventos especiales" ? "/special-events" : 
                               service.title === "Servicios de limusinas" ? "/limousine-service" : 
                               service.title === "Jets privados" ? "/private-jets" : 
                               service.title === "Traslados corporativos VIP" ? "/corporate-transfers" : 
                               service.title === "Servicios de seguridad ejecutiva discreta" ? "/security-services" : "#"} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">
                      {service.title}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div 
            className="nav-menu-item group relative px-3"
            onMouseEnter={handleCompanyMouseEnter}
            onMouseLeave={handleCompanyMouseLeave}
          >
            <span className="cursor-pointer flex items-center hover:text-black">
              Para empresas
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isCompanyMenuOpen ? 'rotate-180' : ''}`} />
            </span>
            {isCompanyMenuOpen && (
              <div 
                className="absolute left-0 top-full mt-1 w-64 bg-white shadow-md border border-gray-100 rounded-md z-50"
                onMouseEnter={handleCompanyMouseEnter}
                onMouseLeave={handleCompanyMouseLeave}
              >
                {companyMenuItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-b-0">
                    <Link to={item.title === "Resumen" ? "/company-overview" : item.title === "Empresas" ? "/companies" : item.title === "Agencias de viajes" ? "/travel-agencies" : item.title === "Asociaciones estratégicas" ? "/strategic-partnerships" : "#"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">
                      {item.title}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/drivers" className="nav-menu-item px-3 hover:text-black">Para chóferes</Link>
          <Link to="/help" className="nav-menu-item px-3 hover:text-black">Ayuda</Link>
          <div 
            className="nav-menu-item group relative px-3"
            onMouseEnter={handleLanguageMouseEnter}
            onMouseLeave={handleLanguageMouseLeave}
          >
            <span className="cursor-pointer flex items-center hover:text-black">
              <Globe className="mr-1 h-4 w-4" />
              Español
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
            </span>
            {isLanguageMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-40 bg-white shadow-md border border-gray-100 rounded-md z-50"
                onMouseEnter={handleLanguageMouseEnter}
                onMouseLeave={handleLanguageMouseLeave}
              >
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black border-b border-gray-100">English</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">Français</a>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
            {user ? (
              // Si el usuario está autenticado, mostrar el nombre del usuario con menú desplegable
              <div 
                className="nav-menu-item group relative px-3 md:block hidden"
                onMouseEnter={handleUserMenuMouseEnter}
                onMouseLeave={handleUserMenuMouseLeave}
              >
                <span className="cursor-pointer flex items-center hover:text-black font-medium">
                  {user.name || user.email}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </span>
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-40 bg-white shadow-md border border-gray-100 rounded-md z-50"
                    onMouseEnter={handleUserMenuMouseEnter}
                    onMouseLeave={handleUserMenuMouseLeave}
                  >
                    <Link to="/trips" className="block px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-50 hover:text-black border-b border-gray-100">
                      Viajes
                    </Link>
                    <Link to="/account" className="block px-4 py-2 text-sm text-center text-gray-700 hover:bg-gray-50 hover:text-black border-b border-gray-100">
                      Cuenta
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                    >
                      Salir
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Si no hay usuario, mostrar "Iniciar sesión"
              <Link to="/login" className="nav-menu-item hover:text-black px-3 font-medium md:block hidden">
                Iniciar sesión
              </Link>
            )}
            
            {/* Botón de menú para móviles */}
            <button 
              className="md:hidden ml-2 p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100 pt-1 pb-4 z-50">
          <div className="flex flex-col">
            <div className="border-b border-gray-100">
              <div 
                className="flex justify-center items-center py-3 px-4"
                onClick={toggleServicesMenu}
              >
                <span className="font-medium text-gray-800">Nuestros servicios</span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isServicesMenuOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isServicesMenuOpen && (
                <div className="bg-gray-50">
                  {services.map((service, index) => (
                    <Link 
                      key={index} 
                      to={service.title === "Viajes de ciudad a ciudad" ? "/city-to-city" : 
                         service.title === "Traslados al aeropuerto" ? "/airport-transfers" : 
                         service.title === "Alquiler por horas/días" ? "/hourly-hire" : 
                         service.title === "Servicios eventos especiales" ? "/special-events" : 
                         service.title === "Servicios de limusinas" ? "/limousine-service" : 
                         service.title === "Jets privados" ? "/private-jets" : 
                         service.title === "Traslados corporativos VIP" ? "/corporate-transfers" : 
                         service.title === "Servicios de seguridad ejecutiva discreta" ? "/security-services" : "#"} 
                      className="block py-3 px-4 text-center text-gray-700 border-b border-gray-100 last:border-b-0"
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-b border-gray-100">
              <div 
                className="flex justify-center items-center py-3 px-4"
                onClick={toggleCompanyMenu}
              >
                <span className="font-medium text-gray-800">Para empresas</span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isCompanyMenuOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isCompanyMenuOpen && (
                <div className="bg-gray-50">
                  {companyMenuItems.map((item, index) => (
                    <Link 
                      key={index} 
                      to={item.title === "Resumen" ? "/company-overview" : item.title === "Empresas" ? "/companies" : item.title === "Agencias de viajes" ? "/travel-agencies" : item.title === "Asociaciones estratégicas" ? "/strategic-partnerships" : "#"} 
                      className="block py-3 px-4 text-center text-gray-700 border-b border-gray-100 last:border-b-0"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link to="/drivers" className="py-3 px-4 text-center font-medium text-gray-800 border-b border-gray-100">
              Para chóferes
            </Link>
            
            <Link to="/help" className="py-3 px-4 text-center font-medium text-gray-800 border-b border-gray-100">
              Ayuda
            </Link>
            
            <div className="border-b border-gray-100">
              <div 
                className="flex justify-center items-center py-3 px-4"
                onClick={toggleMobileLanguage}
              >
                <Globe className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium text-gray-800">Español</span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isMobileLanguageOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isMobileLanguageOpen && (
                <div className="bg-gray-50">
                  {languages.filter(lang => lang.code !== "es").map((lang, index) => (
                    <a 
                      key={index} 
                      href="#" 
                      className="block py-3 px-4 text-center text-gray-700 border-b border-gray-100 last:border-b-0"
                    >
                      {lang.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4">
              {user ? (
                <div>
                  <div className="flex justify-center items-center mb-3 font-medium text-gray-800">
                    <User className="w-5 h-5 mr-2" />
                    {user.name || user.email}
                  </div>
                  <Link to="/trips" className="block text-center py-2 mb-2 font-medium text-gray-800 bg-gray-100 rounded-md">
                    Viajes
                  </Link>
                  <Link to="/account" className="block text-center py-2 mb-2 font-medium text-gray-800 bg-gray-100 rounded-md">
                    Cuenta
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block text-center py-2 font-medium text-gray-800 bg-gray-100 rounded-md w-full"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link to="/login" className="block text-center py-3 font-medium text-gray-800 bg-gray-100 rounded-md">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 