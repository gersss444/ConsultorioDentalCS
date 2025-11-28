const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');
const {
    validateUserId,
    validateUpdateUser,
    validateSearchQuery,
    validateRoleQuery,
    validatePagination
} = require('../middlewares/validation');

/**
 * Rutas para gestión de usuarios (Users)
 * Todas las rutas requieren autenticación JWT
 */

// Aplicar auth a todas las rutas de este router
router.use(authenticateToken);

// Ruta para obtener todos los usuarios con paginación
// GET /api/users?page=1&limit=10
router.get(
    '/',
    validatePagination,
    userController.getAllUsers
);

// Ruta para buscar usuarios por nombre
// GET /api/users/search?q=termino
router.get(
    '/search',
    validateSearchQuery,
    userController.searchUsers
);

// Ruta para buscar usuarios por rol
// GET /api/users/role?role=doctor
router.get(
    '/role',
    validateRoleQuery,
    userController.getUsersByRole
);

// Ruta para obtener un usuario por ID
// GET /api/users/:id
router.get(
    '/:id',
    validateUserId,
    userController.getUserById
);

// Ruta para actualizar un usuario
// PUT /api/users/:id
router.put(
    '/:id',
    validateUserId,
    validateUpdateUser,
    userController.updateUser
);

// Ruta para desactivar un usuario
// DELETE /api/users/:id
router.delete(
    '/:id',
    validateUserId,
    userController.deleteUser
);

module.exports = router;

