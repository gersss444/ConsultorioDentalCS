import api from '../config/api';

export const dentalRecordService = {
  // Obtener todos los registros dentales
  getAll: async () => {
    const response = await api.get('/dentalrecords');
    return response.data;
  },

  // Obtener registro por ID
  getById: async (id) => {
    const response = await api.get(`/dentalrecords/${id}`);
    return response.data;
  },

  // Buscar registros por paciente
  getByPatient: async (patientId) => {
    const response = await api.get(`/dentalrecords/patient?patient_id=${patientId}`);
    return response.data;
  },

  // Buscar registros dentales
  search: async (searchTerm) => {
    const response = await api.get(`/dentalrecords/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Crear registro dental
  create: async (recordData) => {
    const response = await api.post('/dentalrecords', recordData);
    return response.data;
  },

  // Actualizar registro dental
  update: async (id, recordData) => {
    const response = await api.put(`/dentalrecords/${id}`, recordData);
    return response.data;
  },

  // Actualizar parcialmente registro dental
  patch: async (id, recordData) => {
    const response = await api.patch(`/dentalrecords/${id}`, recordData);
    return response.data;
  },

  // Eliminar registro dental
  delete: async (id) => {
    const response = await api.delete(`/dentalrecords/${id}`);
    return response.data;
  },
};



