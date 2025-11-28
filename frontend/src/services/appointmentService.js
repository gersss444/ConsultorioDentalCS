import api from '../config/api';

export const appointmentService = {
  // Obtener todas las citas con paginación
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/appointments?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener cita por ID
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Buscar citas por fecha
  getByDate: async (date) => {
    const response = await api.get(`/appointments/date?date=${date}`);
    return response.data;
  },

  // Buscar citas por paciente
  getByPatient: async (patientId) => {
    const response = await api.get(`/appointments/patient?patient_id=${patientId}`);
    return response.data;
  },

  // Crear cita
  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Actualizar cita
  update: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  // Actualizar estado de cita
  updateStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  // Eliminar cita
  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};




