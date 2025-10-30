const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Error de validación',
            message: 'Los datos proporcionados no son válidos',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validaciones para usuarios (Users)
 */

// Validación de ID de usuario
const validateUserId = [
    param('id')
        .notEmpty().withMessage('El ID es requerido')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

// Validación para actualizar usuario (PUT /api/users/:id)
const validateUpdateUser = [
    body('name')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('last_name')
        .optional()
        .isString().withMessage('El apellido debe ser una cadena de texto')
        .trim(),
    body('email')
        .optional()
        .isEmail().withMessage('El email debe tener un formato válido')
        .trim(),
    body('role')
        .optional()
        .isIn(['admin', 'doctor', 'assistant']).withMessage('El rol debe ser: admin, doctor o assistant'),
    body('specialty')
        .optional()
        .isString().withMessage('La especialidad debe ser una cadena de texto')
        .trim(),
    body('phone')
        .optional()
        .isString().withMessage('El teléfono debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación para búsqueda por rol (GET /api/users/role?role=...)
const validateRoleQuery = [
    query('role')
        .notEmpty().withMessage('El rol es requerido')
        .isIn(['admin', 'doctor', 'assistant']).withMessage('El rol debe ser: admin, doctor o assistant'),
    handleValidationErrors
];

// Validación para búsqueda por nombre (GET /api/users/search?q=...)
const validateSearchQuery = [
    query('q')
        .notEmpty().withMessage('El término de búsqueda es requerido')
        .isLength({ min: 2 }).withMessage('El término de búsqueda debe tener al menos 2 caracteres')
        .isString().withMessage('El término de búsqueda debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación para paginación
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
    handleValidationErrors
];

module.exports = {
    validateUserId,
    validateUpdateUser,
    validateRoleQuery,
    validateSearchQuery,
    validatePagination,
    handleValidationErrors
};
