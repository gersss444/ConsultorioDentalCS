import api from '../config/api';

export const inventoryService = {
  // Obtener todos los items con paginación
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/inventory?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener item por ID
  getById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  // Buscar items por categoría
  getByCategory: async (category) => {
    const response = await api.get(`/inventory/category?category=${category}`);
    return response.data;
  },

  // Buscar items por nombre
  search: async (name) => {
    const response = await api.get(`/inventory/search?name=${name}`);
    return response.data;
  },

  // Crear item
  create: async (itemData) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  },

  // Actualizar item
  update: async (id, itemData) => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  // Ajustar stock
  adjustStock: async (id, quantity, reason) => {
    const response = await api.patch(`/inventory/${id}/stock`, { quantity, reason });
    return response.data;
  },

  // Eliminar item
  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },
};




