// Modal para crear o editar un item de inventario
import { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import Modal from '../common/Modal';
import './ModalForms.css';

const InventoryModal = ({ isOpen, onClose, itemId = null, onSuccess }) => {
  // Estado del formulario con todos los campos del item de inventario
  const [formData, setFormData] = useState({
    name: '',            
    category: '',        
    description: '',     
    current_stock: '',   
    min_stock: '',       
    cost_per_unit: '',   
    supplier: '',        
  });
  
  // Estado de carga mientras se guarda o se cargan datos
  const [loading, setLoading] = useState(false);
  // Estado para mensajes de error
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemId) {
        loadItem();
      } else {
        resetForm();
      }
    }
  }, [isOpen, itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getById(itemId);
      const item = response.data;
      setFormData({
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        current_stock: item.current_stock || '',
        min_stock: item.min_stock || '',
        cost_per_unit: item.cost_per_unit || '',
        supplier: item.supplier || '',
      });
      setError('');
    } catch (err) {
      setError('Error al cargar el item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      current_stock: '',
      min_stock: '',
      cost_per_unit: '',
      supplier: '',
    });
    setError('');
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
    setLoading(true);

    try {
      const itemData = {
        ...formData,
        current_stock: parseInt(formData.current_stock) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
      };

      if (itemId) {
        await inventoryService.update(itemId, itemData);
      } else {
        await inventoryService.create(itemData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemId ? 'Editar Item de Inventario' : 'Nuevo Item de Inventario'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Nombre *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Anestesia local"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            <option value="Medicamentos">Medicamentos</option>
            <option value="Materiales">Materiales</option>
            <option value="Equipos">Equipos</option>
            <option value="Suministros">Suministros</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Descripción del item..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="current_stock">Stock Actual</label>
            <input
              type="number"
              id="current_stock"
              name="current_stock"
              value={formData.current_stock}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="min_stock">Stock Mínimo</label>
            <input
              type="number"
              id="min_stock"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cost_per_unit">Costo por Unidad</label>
            <input
              type="number"
              id="cost_per_unit"
              name="cost_per_unit"
              value={formData.cost_per_unit}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="supplier">Proveedor</label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Nombre del proveedor"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : itemId ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryModal;

