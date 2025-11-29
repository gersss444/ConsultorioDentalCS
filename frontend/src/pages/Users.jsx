import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import UserModal from '../components/modals/UserModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './PageStyles.css';

const Users = () => {
  const { showToast } = useToast();
  const { dialog, showConfirm, closeDialog, handleConfirm } = useConfirmDialog();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll(page, limit);
      setUsers(response.data || []);
      setTotal(response.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: 'Desactivar Usuario',
      message: '¿Estás seguro de desactivar este usuario? Esta acción no se puede deshacer.',
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      await userService.delete(id);
      showToast('Usuario desactivado con éxito', 'success');
      loadUsers();
    } catch (err) {
      setError('Error al desactivar usuario');
      showToast('Error al desactivar usuario', 'error');
      console.error(err);
    }
  };

  const getRoleConfig = (role) => {
    const configs = {
      admin: { color: '#111827', bg: '#d1d5db', label: 'Administrador' },
      doctor: { color: '#374151', bg: '#e5e7eb', label: 'Doctor' },
      assistant: { color: '#6b7280', bg: '#f3f4f6', label: 'Asistente' },
    };
    return configs[role] || configs.assistant;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Usuarios</h1>
        <a href="/register" className="btn-primary">
          <UserPlus size={18} />
          Nuevo Usuario
        </a>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Especialidad</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    return (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <div className="cell-name">
                            {`${user.name} ${user.last_name || ''}`}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: roleConfig.bg,
                              color: roleConfig.color,
                            }}
                          >
                            {roleConfig.label}
                          </span>
                        </td>
                        <td>{user.specialty || '-'}</td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-sm btn-edit" 
                              title="Editar"
                              onClick={() => {
                                setEditingUserId(user.id);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-sm btn-delete"
                              onClick={() => handleDelete(user.id)}
                              title="Desactivar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUserId(null);
        }}
        userId={editingUserId}
        onSuccess={() => {
          loadUsers();
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

export default Users;
