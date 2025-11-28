
// Manejo las peticiones HTTP al servidor backend
import axios from 'axios';

// URL base del servidor API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones (request)
// Se ejecuta antes de enviar cada petición al servidor
// Agrega el token JWT 
api.interceptors.request.use(
  (config) => {
    // Obtiene el token del localStorage
    const token = localStorage.getItem('token');
    // Si hay token, lo agrega al header de la petición
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas (response)
// Se ejecuta cuando llega una respuesta del servidor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (no autorizado), el token es inválido o expirado
    if (error.response?.status === 401) {
      // Limpia el token y usuario del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirige al login para que el usuario se autentique de nuevo
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

