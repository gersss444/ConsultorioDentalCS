// Componente que protege rutas privadas

// Verifica que el usuario esté autenticado y tenga los permisos necesarios
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';

// Props:
// children: El componente hijo a renderizar si el usuario tiene acceso
// requiredPermission: Permiso opcional requerido para acceder a la ruta
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Muestra un mensaje de carga mientras se verifica la sesión
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si el usuario no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un permiso específico, verificar que el usuario lo tenga
  // si no tiene el permiso, redirige al dashboard
  if (requiredPermission && user?.role) {
    if (!hasPermission(user.role, requiredPermission)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si pasa todas las verificaciones, renderiza el componente hijo
  return children;
};

export default ProtectedRoute;

