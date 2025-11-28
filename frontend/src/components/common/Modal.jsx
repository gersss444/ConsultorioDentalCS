// Componente Modal reutilizable
// Props: isOpen (si está abierto), onClose (función para cerrar), title (título), children (contenido), size (tamaño: small, medium, large)
import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  // Cuando el modal está abierto, previene el scroll de la página de fondo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    //  restaura el scroll cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Si el modal no está abierto, no renderiza nada
  if (!isOpen) return null;

  // Solo cierra el modal si se hace clic directamente en el backdrop, no en el contenido
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Fondo oscuro del modal 
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      {/* Contenedor principal */}
      <div className={`modal-container modal-${size}`}>
        {/* Encabezado */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {/* Contenido del modal  */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

