import { useState, useEffect } from 'react';
import { dentalRecordService } from '../services/dentalRecordService';
import { patientService } from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Plus, Edit, Trash2, FileText, Search } from 'lucide-react';
import DentalRecordModal from '../components/modals/DentalRecordModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './PageStyles.css';

const DentalRecords = () => {
  const { checkPermission } = useAuth();
  const { showToast } = useToast();
  const { dialog, showConfirm, closeDialog, handleConfirm } = useConfirmDialog();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientsMap, setPatientsMap] = useState({});

  useEffect(() => {
    loadPatients();
    loadRecords();
  }, []);

  // Búsqueda en tiempo real mientras se escribe
  useEffect(() => {
    // Si el término de búsqueda está vacío, cargar todos los registros
    if (!searchTerm.trim()) {
      loadRecords();
      return;
    }

    // Crear un nuevo timeout para buscar después de 500ms de inactividad
    const timeout = setTimeout(() => {
      performSearch(searchTerm);
    }, 500);

    // Limpiar timeout al desmontar o cuando cambie el término de búsqueda
    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const loadPatients = async () => {
    try {
      // Cargar todos los pacientes para crear un mapa
      let allPatients = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await patientService.getAll(page, 100);
        const patients = response.data || [];
        allPatients = [...allPatients, ...patients];
        
        if (patients.length < 100 || page * 100 >= (response.pagination?.total || 0)) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      // Crear un mapa de ID a nombre
      const map = {};
      allPatients.forEach(patient => {
        map[patient.id] = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || `Paciente ID: ${patient.id}`;
      });
      setPatientsMap(map);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await dentalRecordService.getAll();
      const recordsData = response.data || [];
      setRecords(recordsData);
      
      // Asegurar que tenemos los pacientes cargados para los registros
      const patientIds = [...new Set(recordsData.map(r => r.patient_id))];
      const missingPatientIds = patientIds.filter(id => !patientsMap[id]);
      
      if (missingPatientIds.length > 0) {
        // Cargar pacientes faltantes
        await loadMissingPatients(missingPatientIds);
      }
      
      setError('');
    } catch (err) {
      setError('Error al cargar registros dentales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMissingPatients = async (patientIds) => {
    try {
      const newMap = { ...patientsMap };
      for (const id of patientIds) {
        try {
          const response = await patientService.getById(id);
          const patient = response.data;
          if (patient) {
            newMap[patient.id] = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || `Paciente ID: ${patient.id}`;
          }
        } catch (err) {
          console.error(`Error al cargar paciente ${id}:`, err);
        }
      }
      setPatientsMap(newMap);
    } catch (err) {
      console.error('Error al cargar pacientes faltantes:', err);
    }
  };

  const performSearch = async (term) => {
    if (!term.trim()) {
      loadRecords();
      return;
    }

    try {
      setLoading(true);
      const response = await dentalRecordService.search(term);
      const recordsData = response.data || [];
      setRecords(recordsData);
      
      // Asegurar que tenemos los pacientes cargados para los registros encontrados
      const patientIds = [...new Set(recordsData.map(r => r.patient_id))];
      const missingPatientIds = patientIds.filter(id => !patientsMap[id]);
      
      if (missingPatientIds.length > 0) {
        // Cargar pacientes faltantes
        await loadMissingPatients(missingPatientIds);
      }
      
      setError('');
    } catch (err) {
      setError('Error al buscar registros dentales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleDelete = async (id) => {
    const record = records.find(r => r.id === id);
    const recordInfo = record ? `registro #${id}` : 'este registro';
    
    const confirmed = await showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar ${recordInfo}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      await dentalRecordService.delete(id);
      showToast(`Registro dental #${id} eliminado con éxito`, 'success');
      setError('');
      loadRecords();
    } catch (err) {
      showToast('Error al eliminar registro', 'error');
      setError('Error al eliminar registro');
      console.error(err);
    }
  };

  const getPaymentStatusConfig = (status) => {
    const configs = {
      paid: { color: '#111827', bg: '#d1d5db', label: 'Pagado' },
      pending: { color: '#6b7280', bg: '#f3f4f6', label: 'Pendiente' },
      partial: { color: '#4b5563', bg: '#e5e7eb', label: 'Parcial' },
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Registros Dentales</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingRecordId(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          Nuevo Registro
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <input
            type="text"
            placeholder="Buscar por nombre de paciente, descripción, diagnóstico o plan de tratamiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
          <button
            type="submit"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Search size={16} />
            Buscar
          </button>
          {searchTerm && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearchTerm('');
                loadRecords();
              }}
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="loading">Cargando registros...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Descripción</th>
                <th>Diagnóstico</th>
                <th>Tipo</th>
                <th>Costo</th>
                <th>Estado Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No hay registros dentales
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const paymentConfig = getPaymentStatusConfig(record.payment_status);
                  return (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>
                        <div className="cell-name">
                          {patientsMap[record.patient_id] || `Paciente ID: ${record.patient_id}`}
                        </div>
                      </td>
                      <td>
                        <div className="cell-name">{record.description || '-'}</div>
                      </td>
                      <td>{record.diagnosis || '-'}</td>
                      <td>{record.record_type || 'general'}</td>
                      <td>
                        {record.treatment_cost
                          ? `$${record.treatment_cost.toLocaleString()}`
                          : '-'}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: paymentConfig.bg,
                            color: paymentConfig.color,
                          }}
                        >
                          {paymentConfig.label}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-sm btn-edit" 
                            title="Editar"
                            onClick={() => {
                              setEditingRecordId(record.id);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          {checkPermission('canDeleteDentalRecords') && (
                            <button
                              className="btn-sm btn-delete"
                              onClick={() => handleDelete(record.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <DentalRecordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecordId(null);
        }}
        recordId={editingRecordId}
        onSuccess={() => {
          loadRecords();
        }}
      />
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </div>
  );
};

export default DentalRecords;
