
// Manejo del estado del usuario y las funciones de login, registro y logout
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { hasPermission } from '../utils/permissions';

const AuthContext = createContext(null);

// Provider que envuelve la aplicación y proporciona funcionalidades de autenticación
export const AuthProvider = ({ children }) => {
  // Estado del usuario actual (null si no hay sesión activa)
  const [user, setUser] = useState(null);
  // Estado de carga inicial (verifica si hay sesión guardada)
  const [loading, setLoading] = useState(true);

  // Al cargar la aplicación verifica si hay un usuario guardado en localStorage
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  // Recibe email y contraseña, guarda el token y datos del usuario
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Función para registrar un nuevo usuario
  // Recibe los datos del usuario y lo registra en el sistema
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Función para cerrar sesión
  // Elimina el token y datos del usuario de localStorage
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Verifica si el usuario actual tiene un permiso específico
  // Retorna true si tiene el permiso, false si no
  const checkPermission = (permission) => {
    if (!user || !user.role) return false;
    return hasPermission(user.role, permission);
  };

  // Valores que se comparten a través del contexto
  const value = {
    user,                    
    login,                   
    register,                
    logout,                  
    isAuthenticated: !!user, 
    loading,                 
    checkPermission,         
    userRole: user?.role,    
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto de autenticación

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

