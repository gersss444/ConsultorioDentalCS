
// Maneja las peticiones al backend relacionadas con login, registro y sesión
import api from '../config/api';

export const authService = {
  // Envía las credenciales al servidor y retorna el token y datos del usuario
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Envía los datos del usuario al servidor y retorna el token y datos del usuario
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Cierra la sesión del usuario
  // Solo elimina el token y usuario (no hace petición al servidor)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verifica si hay un usuario autenticado
  // Retorna true si hay un token guardado, false si no
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtiene el usuario guardado en localStorage
  // Retorna el objeto del usuario o null si no hay usuario guardado
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

