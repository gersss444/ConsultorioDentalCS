// Componente de barra de navegación superior
// Muestra los enlaces de navegación y la información del usuario 
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, Package, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import './TopNavbar.css';

const TopNavbar = () => {
  // Obtiene la ruta actual para resaltar el enlace activo
  const location = useLocation();
  // Obtiene información del usuario y función de logout del contexto
  const { user, logout, userRole } = useAuth();

  // define los elementos del menú con sus rutas, etiquetas, iconos y permisos requeridos
  const allMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'canViewDashboard' },
    { path: '/patients', label: 'Pacientes', icon: Users, permission: 'canManagePatients' },
    { path: '/appointments', label: 'Citas', icon: Calendar, permission: 'canManageAppointments' },
    { path: '/dental-records', label: 'Registros Dentales', icon: FileText, permission: 'canManageDentalRecords' },
    { path: '/inventory', label: 'Inventario', icon: Package, permission: 'canManageInventory' },
    { path: '/users', label: 'Usuarios', icon: UserCircle, permission: 'canManageUsers' },
  ];

  // Filtra los items del menú según los permisos del usuario
  // Solo muestra las opciones a las que el usuario tiene acceso
  const menuItems = allMenuItems.filter(item => {
    if (!userRole) return false;
    return hasPermission(userRole, item.permission);
  });

  // Verifica si una ruta está activa (es la ruta actual)
  const isActive = (path) => location.pathname === path;

  // Convierte el código del rol a su nombre en español
  const getRoleName = (role) => {
    const roleNames = {
      admin: 'Administrador',
      doctor: 'Doctor',
      assistant: 'Asistente'
    };
    return roleNames[role] || role || 'Usuario';
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-container">
        {/* Renderiza cada item del menú filtrado */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {/* Sección del usuario: avatar, nombre, rol y botón de cerrar sesión */}
        <div className="navbar-user-section">
          {/* Información del usuario */}
          <div className="user-info">
            {/* Avatar  con la primera letra del nombre */}
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {/* Detalles: nombre y rol */}
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{getRoleName(userRole)}</span>
            </div>
          </div>
          
          {/* Botón para cerrar sesión */}
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
