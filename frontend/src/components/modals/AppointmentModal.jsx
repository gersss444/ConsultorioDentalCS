// Modal para crear o editar una cita
import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import './ModalForms.css';

const AppointmentModal = ({ isOpen, onClose, appointmentId = null, onSuccess }) => {
  // Obtiene el usuario actual del contexto para asociarlo a la cita
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Estado del formulario con todos los campos de la cita
  const [formData, setFormData] = useState({
    appointment_date: '',           
    appointment_time: '',           
    type: '',                       
    status: 'scheduled',           
    notes: '',                      
    patient_info: { id: '', name: '' }, 
    duration_minutes: 30,           
  });
  
  // Lista de pacientes para seleccionar en el formulario
  const [patients, setPatients] = useState([]);
  // Estado de carga mientras se guarda o se cargan datos
  const [loading, setLoading] = useState(false);
  // Estado para mensajes de error
  const [error, setError] = useState('');
  // Término de búsqueda para filtrar pacientes
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Cargar pacientes al abrir el modal
      loadPatients();
      if (appointmentId) {
        loadAppointment();
      } else {
        resetForm();
      }
    }
  }, [isOpen, appointmentId]);

  // Búsqueda automática cuando cambia el término de búsqueda (con debounce)
  useEffect(() => {
    if (!isOpen) return;
    
    const searchTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearchPatients(searchTerm);
      } else {
        loadPatients();
      }
    }, 500); // Espera 500ms antes de buscar

    return () => clearTimeout(searchTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isOpen]);

  const loadPatients = async () => {
    try {
      const response = await patientService.getAll(1, 100);
      setPatients(response.data || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const handleSearchPatients = async (term) => {
    try {
      const response = await patientService.search(term);
      setPatients(response.data || []);
    } catch (err) {
      console.error('Error searching patients:', err);
      setPatients([]);
    }
  };

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getById(appointmentId);
      const appointment = response.data;
      const appointmentDate = appointment.appointment_date 
        ? new Date(appointment.appointment_date).toISOString().split('T')[0] 
        : '';
      
      setFormData({
        appointment_date: appointmentDate,
        appointment_time: appointment.appointment_time || '',
        type: appointment.type || '',
        status: appointment.status || 'scheduled',
        notes: appointment.notes || '',
        patient_info: appointment.patient_info || { id: '', name: '' },
        duration_minutes: appointment.duration_minutes || 30,
      });
      setError('');
    } catch (err) {
      setError('Error al cargar la cita');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      appointment_date: '',
      appointment_time: '',
      type: '',
      status: 'scheduled',
      notes: '',
      patient_info: { id: '', name: '' },
      duration_minutes: 30,
    });
    setError('');
    setSearchTerm('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patient_id') {
      const selectedPatient = patients.find(p => p.id === parseInt(value));
      setFormData({
        ...formData,
        patient_info: {
          id: selectedPatient ? selectedPatient.id : '',
          name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : '',
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar que se haya seleccionado un paciente
    if (!formData.patient_info.id) {
      setError('Por favor selecciona un paciente');
      return;
    }
    
    setLoading(true);

    try {
      const appointmentData = {
        ...formData,
        patient_info: {
          id: parseInt(formData.patient_info.id),
          name: formData.patient_info.name,
        },
        doctor_info: {
          id: user?.id || 'SYSTEM',
          name: user?.name || 'Sistema',
        },
      };

      if (appointmentId) {
        await appointmentService.update(appointmentId, appointmentData);
        showToast('Cita actualizada con éxito', 'success');
      } else {
        await appointmentService.create(appointmentData);
        showToast('Cita creada con éxito', 'success');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la cita');
      showToast('Error al guardar la cita', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ya no necesitamos filtrar localmente, la búsqueda se hace en el servidor

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointmentId ? 'Editar Cita' : 'Nueva Cita'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="patient_id">Paciente *</label>
          {!appointmentId ? (
            <>
              <input
                type="text"
                placeholder="Buscar paciente por nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ width: '100%', padding: '8px 12px', marginBottom: '8px' }}
              />
              {formData.patient_info.id && (
                <div style={{ 
                  padding: '8px 12px', 
                  marginBottom: '8px',
                  background: '#f3f4f6',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}>
                  <strong>Paciente seleccionado:</strong> {formData.patient_info.name}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        patient_info: { id: '', name: '' }
                      });
                      setSearchTerm('');
                    }}
                    style={{
                      marginLeft: '12px',
                      padding: '2px 8px',
                      fontSize: '12px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Quitar
                  </button>
                </div>
              )}
              {searchTerm.trim() && !formData.patient_info.id && (
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  marginTop: '4px'
                }}>
                  {patients.length === 0 ? (
                    <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
                      No se encontraron pacientes
                    </div>
                  ) : (
                    patients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            patient_info: {
                              id: patient.id,
                              name: `${patient.first_name} ${patient.last_name}`
                            }
                          });
                          setSearchTerm('');
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        <div style={{ fontWeight: 500 }}>
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {patient.email}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ 
              padding: '8px 12px',
              background: '#f3f4f6',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }}>
              {formData.patient_info.name || 'Paciente no seleccionado'}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="appointment_date">Fecha *</label>
            <input
              type="date"
              id="appointment_date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="appointment_time">Hora *</label>
            <input
              type="time"
              id="appointment_time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Tipo *</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              placeholder="Consulta, Limpieza, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="scheduled">Programada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="rescheduled">Reprogramada</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="duration_minutes">Duración (minutos)</label>
          <input
            type="number"
            id="duration_minutes"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            min="15"
            step="15"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : appointmentId ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;

