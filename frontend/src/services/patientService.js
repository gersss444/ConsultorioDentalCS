import api from '../config/api';

export const patientService = {
  // Obtener todos los pacientes con paginación
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/patients?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener paciente por ID
  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Buscar pacientes por nombre
  search: async (query) => {
    const response = await api.get(`/patients/search?q=${query}`);
    return response.data;
  },

  // Buscar paciente por email
  getByEmail: async (email) => {
    const response = await api.get(`/patients/email?email=${email}`);
    return response.data;
  },

  // Crear paciente
  create: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  // Actualizar paciente
  update: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  // Eliminar paciente
  delete: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  // Agregar ajuste de ortodoncia
  addOrthodonticAdjustment: async (id, adjustmentData) => {
    const response = await api.post(`/patients/${id}/orthodontics/adjustments`, adjustmentData);
    return response.data;
  },
};




