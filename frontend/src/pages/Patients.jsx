
// Permit ever, crear, editar y eliminar pacientes del sistema
import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import PatientModal from '../components/modals/PatientModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './PageStyles.css';

const Patients = () => {
  // Hook para verificar permisos del usuario
  const { checkPermission } = useAuth();
  const { showToast } = useToast();
  const { dialog, showConfirm, closeDialog, handleConfirm } = useConfirmDialog();
  
  // lista de pacientes
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Cantidad de pacientes por página
  const [total, setTotal] = useState(0); 
  
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el modal de crear/editar paciente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Carga los pacientes cuando cambia la página
  useEffect(() => {
    // Solo carga pacientes si no hay término de búsqueda activo
    if (!searchTerm.trim()) {
      loadPatients();
    }
  }, [page]);

  // Búsqueda automática cuando cambia el término de búsqueda 
  useEffect(() => {
    // Resetear página cuando se busca
    setPage(1);
    
    // Crear un timer para el debounce (espera 500ms después de que el usuario deje de escribir)
    const searchTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        // Si no hay término de búsqueda, cargar todos los pacientes
        loadPatients();
      }
    }, 500); // Espera 500ms antes de buscar

    // Limpiar el timer si el usuario sigue escribiendo
    return () => clearTimeout(searchTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Carga la lista de pacientes desde el servidor
  // Utiliza paginación para mostrar solo algunos pacientes a la vez
  const loadPatients = async () => {
    try {
      setLoading(true);
      // Obtiene los pacientes de la página actual
      const response = await patientService.getAll(page, limit);
      setPatients(response.data || []);
      setTotal(response.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError('Error al cargar pacientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Busca pacientes por nombre o apellido
  const handleSearch = async (term) => {
    if (!term || !term.trim()) {
      // Si no hay término de búsqueda, carga todos los pacientes
      loadPatients();
      return;
    }
    try {
      setLoading(true);
      // Busca pacientes que coincidan con el término de búsqueda
      const response = await patientService.search(term);
      setPatients(response.data || []);
      setTotal(response.data?.length || 0); // Actualizar total con los resultados de búsqueda
      setError('');
    } catch (err) {
      setError('Error al buscar pacientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Elimina un paciente después de confirmar
  const handleDelete = async (id) => {
    const patient = patients.find(p => p.id === id);
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'este paciente';
    
    // Mostrar diálogo de confirmación personalizado
    const confirmed = await showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar a ${patientName}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      // Elimina el paciente del servidor
      await patientService.delete(id);
      showToast(`Paciente ${patientName} eliminado con éxito`, 'success');
      setError('');
      
      // Recarga la lista según si hay búsqueda activa o no
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        loadPatients();
      }
    } catch (err) {
      showToast('Error al eliminar paciente', 'error');
      setError('Error al eliminar paciente');
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Pacientes</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingPatientId(null);
            setIsModalOpen(true);
          }}
        >
          <UserPlus size={16} />
          Nuevo Paciente
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="btn-secondary"
          >
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Cargando pacientes...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Fecha Nacimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      {searchTerm.trim() 
                        ? `No se encontraron pacientes que coincidan con "${searchTerm}"`
                        : 'No hay pacientes registrados'}
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td>
                        <div className="cell-name">
                          {`${patient.first_name} ${patient.last_name}`}
                        </div>
                      </td>
                      <td>{patient.email}</td>
                      <td>{patient.phone || '-'}</td>
                      <td>
                        {patient.birth_date
                          ? new Date(patient.birth_date).toLocaleDateString('es-ES')
                          : '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-sm btn-edit" 
                            title="Editar"
                            onClick={() => {
                              setEditingPatientId(patient.id);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          {checkPermission('canDeletePatients') && (
                            <button
                              className="btn-sm btn-delete"
                              onClick={() => handleDelete(patient.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && !searchTerm.trim() && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-secondary"
              >
                Anterior
              </button>
              <span>
                Página {page} de {Math.ceil(total / limit)}
              </span>
              <button
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage(page + 1)}
                className="btn-secondary"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatientId(null);
        }}
        patientId={editingPatientId}
        onSuccess={() => {
          // Recargar según si hay búsqueda activa o no
          if (searchTerm.trim()) {
            handleSearch(searchTerm);
          } else {
            loadPatients();
          }
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

export default Patients;
