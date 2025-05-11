import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definir tipos para el usuario y los datos de autenticación
type UserProfile = {
  title: string;
  first_name: string;
  last_name: string;
  phone: string;
  country_code: string;
  company?: string;
  address?: string;
};

type User = {
  id: string;
  email: string;
  name?: string;
  profile_completed?: boolean;
  profile?: UserProfile;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
          
          // Verificar el token con el backend, pero sin redirecciones forzadas
          try {
            await validateToken();
          } catch (error) {
            console.error('Error al validar token:', error);
            // No hacemos logout automático para evitar redirecciones no deseadas
            // El usuario puede navegar por páginas públicas sin problema
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        // No hacemos logout para evitar redirecciones no deseadas
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Función para validar el token con el backend
  const validateToken = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error al validar token:', error);
      // Solo limpiamos el estado pero no redireccionamos automáticamente
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      throw error;
    }
  };

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token y datos del usuario
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error desconocido al iniciar sesión');
      }
      console.error('Error al iniciar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // Guardar token y datos del usuario
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error desconocido al registrar');
      }
      console.error('Error al registrar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Función para guardar el token manualmente
  const setToken = (token: string) => {
    localStorage.setItem('authToken', token);
  };

  // Función para actualizar el perfil del usuario
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el perfil');
      }

      // Actualizar el usuario en el estado y localStorage
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error desconocido al actualizar el perfil');
      }
      console.error('Error al actualizar el perfil:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      error, 
      login, 
      register, 
      logout,
      clearError,
      setUser,
      setToken,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
} 