import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import InventoryModal from '../components/modals/InventoryModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './PageStyles.css';

const Inventory = () => {
  const { checkPermission } = useAuth();
  const { dialog, showConfirm, closeDialog, handleConfirm } = useConfirmDialog();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    loadItems();
  }, [page]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAll(page, limit);
      setItems(response.data || []);
      setTotal(response.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError('Error al cargar inventario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Item',
      message: '¿Estás seguro de eliminar este item del inventario? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      await inventoryService.delete(id);
      loadItems();
    } catch (err) {
      setError('Error al eliminar item');
      console.error(err);
    }
  };

  const getStockStatus = (current, min) => {
    if (current <= min) {
      return { text: 'Bajo', color: '#6b7280', bg: '#f3f4f6' };
    }
    if (current <= min * 1.5) {
      return { text: 'Medio', color: '#4b5563', bg: '#e5e7eb' };
    }
    return { text: 'Bueno', color: '#111827', bg: '#d1d5db' };
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Inventario</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingItemId(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          Nuevo Item
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Cargando inventario...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No hay items en el inventario
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const stockStatus = getStockStatus(
                      item.current_stock,
                      item.min_stock
                    );
                    return (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          <div className="cell-name">{item.name}</div>
                        </td>
                        <td>{item.category}</td>
                        <td>{item.current_stock || 0}</td>
                        <td>{item.min_stock || 0}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: stockStatus.bg,
                              color: stockStatus.color,
                            }}
                          >
                            {stockStatus.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-sm btn-edit" 
                              title="Editar"
                              onClick={() => {
                                setEditingItemId(item.id);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            {checkPermission('canDeleteInventory') && (
                              <button
                                className="btn-sm btn-delete"
                                onClick={() => handleDelete(item.id)}
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

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItemId(null);
        }}
        itemId={editingItemId}
        onSuccess={() => {
          loadItems();
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

export default Inventory;
