

 //SeDefine qué puede hacer cada rol en el sistema

// Objeto que contiene todos los permisos para cada rol del sistema
const rolePermissions = {
  // Administrador: tiene acceso completo a todas las funcionalidades
  admin: {
    canViewDashboard: true,          // Puede ver el dashboard
    canManagePatients: true,         // Puede gestionar pacientes
    canManageAppointments: true,    // Puede gestionar citas
    canManageDentalRecords: true,    // Puede gestionar registros dentales
    canManageInventory: true,        // Puede gestionar inventario
    canManageUsers: true,            // Puede gestionar usuarios
    canDeletePatients: true,         // Puede eliminar pacientes
    canDeleteAppointments: true,     // Puede eliminar citas
    canDeleteDentalRecords: true,   // Puede eliminar registros dentales
    canDeleteInventory: true,        // Puede eliminar items del inventario
    canDeleteUsers: true,            // Puede eliminar usuarios
    canEditAllRecords: true,        // Puede editar todos los registros
    canViewReports: true,            // Puede ver reportes
  },
  
  // Doctor: tiene acceso a operaciones médicas pero no puede gestionar usuarios
  doctor: {
    canViewDashboard: true,
    canManagePatients: true,
    canManageAppointments: true,
    canManageDentalRecords: true,
    canManageInventory: true,
    canManageUsers: false,           // No puede gestionar usuarios
    canDeletePatients: true,
    canDeleteAppointments: true,
    canDeleteDentalRecords: true,
    canDeleteInventory: false,      // No puede eliminar items del inventario
    canEditAllRecords: true,
    canViewReports: true,
  },
  
  // Asistente: tiene acceso limitado, principalmente puede ver y crear
  assistant: {
    canViewDashboard: true,
    canManagePatients: true,
    canManageAppointments: true,
    canManageDentalRecords: true,
    canManageInventory: true,      
    canManageUsers: false,           //No puede gestionar usuarios
    canDeletePatients: true,        
    canDeleteAppointments: true,    
    canDeleteDentalRecords: true,   
    canDeleteInventory: true,
    canEditAllRecords: true,       
    canViewReports: true,
  },
};

/**
 * Verifica si un rol tiene un permiso específico
 * @param {string} role - El rol del usuario (admin, doctor, assistant)
 * @param {string} permission - El permiso a verificar
 * @returns {boolean} - true si tiene el permiso, false si no
 */
export const hasPermission = (role, permission) => {
  // Si no hay rol o el rol no existe en los permisos, retorna false
  if (!role || !rolePermissions[role]) {
    return false;
  }
  // Retorna true solo si el permiso está explícitamente en true
  return rolePermissions[role][permission] === true;
};

/**
 * Verifica si un rol tiene cualquiera de los permisos especificados
 * Retorna true si el rol tiene al menos uno de los permisos
 * @param {string} role - El rol del usuario
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean} - true si tiene al menos un permiso
 */
export const hasAnyPermission = (role, permissions) => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Verifica si un rol tiene todos los permisos especificados
 * Retorna true solo si el rol tiene todos los permisos requeridos
 * @param {string} role - El rol del usuario
 * @param {string[]} permissions - Array de permisos a verificar
 * @returns {boolean} - true si tiene todos los permisos
 */
export const hasAllPermissions = (role, permissions) => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Obtiene todos los permisos de un rol
 * Retorna un objeto con todos los permisos del rol especificado
 * @param {string} role - El rol del usuario
 * @returns {object} - Objeto con todos los permisos del rol (vacío si el rol no existe)
 */
export const getRolePermissions = (role) => {
  return rolePermissions[role] || {};
};

/**
 * Verifica si el usuario es administrador
 * @param {string} role - El rol del usuario
 * @returns {boolean} - true si el rol es 'admin'
 */
export const isAdmin = (role) => {
  return role === 'admin';
};

/**
 * Verifica si el usuario es doctor
 * @param {string} role - El rol del usuario
 * @returns {boolean} - true si el rol es 'doctor'
 */
export const isDoctor = (role) => {
  return role === 'doctor';
};

/**
 * Verifica si el usuario es asistente
 * @param {string} role - El rol del usuario
 * @returns {boolean} - true si el rol es 'assistant'
 */
export const isAssistant = (role) => {
  return role === 'assistant';
};

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isAdmin,
  isDoctor,
  isAssistant,
};

