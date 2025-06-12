import './App.css'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Drivers from './pages/Drivers'
import CompanyOverview from './pages/CompanyOverview'
import Companies from './pages/Companies'
import TravelAgencies from './pages/TravelAgencies'
import StrategicPartnerships from './pages/StrategicPartnerships'
import CityToCity from './pages/CityToCity'
import AirportTransfers from './pages/AirportTransfers'
import HourlyHire from './pages/HourlyHire'
import SpecialEvents from './pages/SpecialEvents'
import LimousineService from './pages/LimousineServices'
import PrivateJets from './pages/PrivateJets'
import CorporateTransfers from './pages/CorporateTransfers'
import SecurityServices from './pages/SecurityServices'
import LoginPage from './pages/LoginPage'
import LoginCompaniesPage from './pages/LoginCompaniesPage'
import RegisterPage from './pages/RegisterPage'
import RegisterCompaniesPage from './pages/RegisterCompaniesPage'
import CompleteProfilePage from './pages/CompleteProfilePage'
import TripsPage from './pages/TripsPage'
import AccountPage from './pages/AccountPage'
import BookingWizard from './pages/BookingWizard'
import AdminPage from './pages/AdminPage'
// Blog pages
import BlogPage from './pages/blog/BlogPage'
import BlogPostPage from './pages/blog/BlogPostPage'
import CategoryPage from './pages/blog/CategoryPage'
import TagPage from './pages/blog/TagPage'
// import HowItWorks from './pages/HowItWorks'; // Removed import
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ScrollToTop from './components/ScrollToTop'
import { useAuth } from './context/AuthContext'
import { useEffect, useState } from 'react'

// Componente para rutas protegidas
function PrivateRoute() {
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Cuando termina la carga de autenticación, dejamos de revisar
    if (!isLoading) {
      setChecking(false);
    }
  }, [isLoading]);

  if (checking || isLoading) {
    // Mientras carga, mostrar spinner
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si el usuario existe pero no ha completado su perfil, redirigir a completar perfil
  if (user && user.profile_completed === false) {
    return <Navigate to="/complete-profile" />;
  }

  // Si todo está en orden, mostrar el contenido de la ruta
  return <Outlet />;
}

// Ruta para usuarios que deben completar su perfil
function ProfileCompletionRoute() {
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Cuando termina la carga de autenticación, dejamos de revisar
    if (!isLoading) {
      setChecking(false);
    }
  }, [isLoading]);

  if (checking || isLoading) {
    // Mientras carga, mostrar spinner
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si el usuario ya completó su perfil, redirigirlo a inicio
  if (user.profile_completed) {
    return <Navigate to="/" />;
  }

  // Si el usuario está logueado pero sin perfil completo, mostrar la página para completarlo
  return <Outlet />;
}

// Componente para rutas exclusivas de administradores
function AdminRoute() {
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Cuando termina la carga de autenticación, dejamos de revisar
    if (!isLoading) {
      setChecking(false);
    }
  }, [isLoading]);

  if (checking || isLoading) {
    // Mientras carga, mostrar spinner
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si no hay usuario o no es administrador, redirigir a la página principal
  if (!user || user.role !== 'admin') {
    console.log("Usuario no es admin, redirigiendo a inicio", user);
    return <Navigate to="/" />;
  }

  // Para administradores, siempre permitimos acceso al panel de admin independientemente del estado del perfil
  console.log("Usuario admin verificado, mostrando AdminPage", user);
  
  // Si todo está en orden y es un administrador, mostrar el contenido de la ruta
  return <Outlet />;
}

function App() {
  // ID de cliente de Google OAuth - Usar el mismo que está en tu panel de Google Cloud Console
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '988275836239-hr8p8btrvc1rbb3hcgg37ucgq2vjsbif.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="w-full h-full">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login-companies" element={<LoginCompaniesPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-companies" element={<RegisterCompaniesPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/company-overview" element={<CompanyOverview />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/travel-agencies" element={<TravelAgencies />} />
              <Route path="/strategic-partnerships" element={<StrategicPartnerships />} />
              <Route path="/city-to-city" element={<CityToCity />} />
              <Route path="/airport-transfers" element={<AirportTransfers />} />
              <Route path="/hourly-hire" element={<HourlyHire />} />
              <Route path="/special-events" element={<SpecialEvents />} />
              <Route path="/limousine-service" element={<LimousineService />} />
              <Route path="/private-jets" element={<PrivateJets />} />
              <Route path="/corporate-transfers" element={<CorporateTransfers />} />
              <Route path="/security-services" element={<SecurityServices />} />
              
              {/* Rutas del Blog */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/blog/categoria/:category" element={<CategoryPage />} />
              <Route path="/blog/tag/:tag" element={<TagPage />} />
              
              {/* Ruta para el wizard de reserva */}
              <Route path="/reserva/:sessionId" element={<BookingWizard />} />

              {/* Ruta para completar perfil */}
              <Route element={<ProfileCompletionRoute />}>
                <Route path="/complete-profile" element={<CompleteProfilePage />} />
              </Route>

              {/* Rutas protegidas que requieren autenticación y perfil completo */}
              <Route element={<PrivateRoute />}>
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>
              
              {/* Rutas protegidas exclusivas para administradores */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
              
              {/* Ruta de fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App 