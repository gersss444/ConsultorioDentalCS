// Modal para crear o editar un paciente
import { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import './ModalForms.css';

const PatientModal = ({ isOpen, onClose, patientId = null, onSuccess }) => {
  const { showToast } = useToast();
  // Estado del formulario con todos los campos del paciente
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    insurance: '',
  });
  // Estado para indicar si se está cargando o guardando
  const [loading, setLoading] = useState(false);
  // Estado para mostrar mensajes de error
  const [error, setError] = useState('');

  // Cuando se abre el modal, carga el paciente si hay ID o resetea el formulario si es nuevo
  useEffect(() => {
    if (isOpen) {
      if (patientId) {
        // Si hay ID, carga los datos del paciente para editarlos
        loadPatient();
      } else {
        // Si no hay ID, resetea el formulario para crear uno nuevo
        resetForm();
      }
    }
  }, [isOpen, patientId]);

  // Carga los datos de un paciente existente para editarlos
  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await patientService.getById(patientId);
      const patient = response.data;
      
      // Convierte la fecha de nacimiento al formato YYYY-MM-DD para el input de tipo date
      const birthDate = patient.birth_date 
        ? new Date(patient.birth_date).toISOString().split('T')[0] 
        : '';
      
      // Rellena el formulario con los datos del paciente
      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        birth_date: birthDate,
        address: patient.address || '',
        insurance: patient.insurance || '',
      });
      setError('');
    } catch (err) {
      setError('Error al cargar el paciente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Resetea el formulario a sus valores iniciales (vacíos)
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      insurance: '',
    });
    setError('');
  };

  // Actualiza el estado del formulario cuando el usuario escribe
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError('');
    setLoading(true);

    try {
      if (patientId) {
        // Actualiza un paciente existente
        await patientService.update(patientId, formData);
        showToast('Paciente actualizado con éxito', 'success');
      } else {
        // Crea un nuevo paciente
        await patientService.create(formData);
        showToast('Paciente creado con éxito', 'success');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el paciente');
      showToast('Error al guardar el paciente', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patientId ? 'Editar Paciente' : 'Nuevo Paciente'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">Nombre *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              placeholder="Luis"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Apellido *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              placeholder="Suarez"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="luis.suarez@gmail.com"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="622-147-89-46"
            />
          </div>

          <div className="form-group">
            <label htmlFor="birth_date">Fecha de Nacimiento *</label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Dirección</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="San vicente 43"
          />
        </div>

        <div className="form-group">
          <label htmlFor="insurance">Seguro</label>
          <input
            type="text"
            id="insurance"
            name="insurance"
            value={formData.insurance}
            onChange={handleChange}
            placeholder="IMSS"
          />
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : patientId ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientModal;

