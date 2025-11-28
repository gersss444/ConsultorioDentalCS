import api from '../config/api';

export const userService = {
  // Obtener todos los usuarios con paginación
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener usuario por ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Buscar usuarios por nombre
  search: async (query) => {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  },

  // Buscar usuarios por rol
  getByRole: async (role) => {
    const response = await api.get(`/users/role?role=${role}`);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Desactivar usuario
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};




