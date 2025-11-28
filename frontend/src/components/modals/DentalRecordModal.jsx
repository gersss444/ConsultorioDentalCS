// Modal para crear o editar un registro dental
import { useState, useEffect } from 'react';
import { dentalRecordService } from '../../services/dentalRecordService';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import './ModalForms.css';

const DentalRecordModal = ({ isOpen, onClose, recordId = null, onSuccess }) => {
  // Obtiene el usuario actual del contexto para asociarlo al registro
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Estado del formulario con todos los campos del registro dental
  const [formData, setFormData] = useState({
    patient_id: '',              
    description: '',             
    diagnosis: '',               
    treatment_plan: '',          
    treatment_notes: '',         
    treatment_cost: '',          
    payment_status: 'pending',   
    record_type: 'general',      
    next_appointment: '',        
  });
  
  // Lista de pacientes para seleccionar en el formulario
  const [patients, setPatients] = useState([]);
  // Estado de carga mientras se guarda o se cargan datos
  const [loading, setLoading] = useState(false);
  // Estado para mensajes de error
  const [error, setError] = useState('');
  // Término de búsqueda para buscar pacientes
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Cargar pacientes al abrir el modal
      loadPatients();
      if (recordId) {
        loadRecord();
      } else {
        resetForm();
      }
    }
  }, [isOpen, recordId]);

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

  const loadRecord = async () => {
    try {
      setLoading(true);
      const response = await dentalRecordService.getById(recordId);
      const record = response.data;
      const nextAppointment = record.next_appointment 
        ? new Date(record.next_appointment).toISOString().split('T')[0] 
        : '';
      
      setFormData({
        patient_id: record.patient_id?.toString() || '',
        description: record.description || '',
        diagnosis: record.diagnosis || '',
        treatment_plan: record.treatment_plan || '',
        treatment_notes: record.treatment_notes || '',
        treatment_cost: record.treatment_cost || '',
        payment_status: record.payment_status || 'pending',
        record_type: record.record_type || 'general',
        next_appointment: nextAppointment,
      });
      setError('');
    } catch (err) {
      setError('Error al cargar el registro');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      description: '',
      diagnosis: '',
      treatment_plan: '',
      treatment_notes: '',
      treatment_cost: '',
      payment_status: 'pending',
      record_type: 'general',
      next_appointment: '',
    });
    setError('');
    setSearchTerm('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar que se haya seleccionado un paciente
    if (!formData.patient_id) {
      setError('Por favor selecciona un paciente');
      return;
    }
    
    setLoading(true);

    try {
      const recordData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        treatment_cost: parseFloat(formData.treatment_cost) || 0,
        created_by_info: {
          id: user?.id || 'SYSTEM',
          name: user?.name || 'Sistema',
        },
      };

      if (recordId) {
        await dentalRecordService.update(recordId, recordData);
        showToast('Registro dental actualizado con éxito', 'success');
      } else {
        await dentalRecordService.create(recordData);
        showToast('Registro dental creado con éxito', 'success');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el registro');
      showToast('Error al guardar el registro', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordId ? 'Editar Registro Dental' : 'Nuevo Registro Dental'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="patient_id">Paciente *</label>
          {!recordId ? (
            <>
              <input
                type="text"
                placeholder="Buscar paciente por nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ width: '100%', padding: '8px 12px', marginBottom: '8px' }}
              />
              {formData.patient_id && (
                <div style={{ 
                  padding: '8px 12px', 
                  marginBottom: '8px',
                  background: '#f3f4f6',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}>
                  <strong>Paciente seleccionado:</strong> {
                    patients.find(p => p.id === parseInt(formData.patient_id)) 
                      ? `${patients.find(p => p.id === parseInt(formData.patient_id)).first_name} ${patients.find(p => p.id === parseInt(formData.patient_id)).last_name}`
                      : 'Paciente seleccionado'
                  }
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        patient_id: ''
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
              {searchTerm.trim() && !formData.patient_id && (
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
                            patient_id: patient.id.toString()
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
              {patients.find(p => p.id === parseInt(formData.patient_id)) 
                ? `${patients.find(p => p.id === parseInt(formData.patient_id)).first_name} ${patients.find(p => p.id === parseInt(formData.patient_id)).last_name}`
                : 'Paciente no seleccionado'}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="record_type">Tipo de Registro</label>
            <select
              id="record_type"
              name="record_type"
              value={formData.record_type}
              onChange={handleChange}
            >
              <option value="general">General</option>
              <option value="orthodontic">Ortodoncia</option>
              <option value="surgery">Cirugía</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="payment_status">Estado de Pago</label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
            >
              <option value="pending">Pendiente</option>
              <option value="partial">Parcial</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Descripción del tratamiento..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="diagnosis">Diagnóstico *</label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Diagnóstico..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="treatment_plan">Plan de Tratamiento *</label>
          <textarea
            id="treatment_plan"
            name="treatment_plan"
            value={formData.treatment_plan}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Plan de tratamiento..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="treatment_notes">Notas de Tratamiento</label>
          <textarea
            id="treatment_notes"
            name="treatment_notes"
            value={formData.treatment_notes}
            onChange={handleChange}
            rows="3"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="treatment_cost">Costo del Tratamiento</label>
            <input
              type="number"
              id="treatment_cost"
              name="treatment_cost"
              value={formData.treatment_cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="next_appointment">Próxima Cita</label>
            <input
              type="date"
              id="next_appointment"
              name="next_appointment"
              value={formData.next_appointment}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : recordId ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DentalRecordModal;

