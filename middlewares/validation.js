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

/**
 * Validaciones para citas (Appointments)
 */

// Validación para crear una cita (POST)
const validateCreateAppointment = [
    body('appointment_date')
        .notEmpty().withMessage('La fecha de la cita es requerida')
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('appointment_time')
        .notEmpty().withMessage('La hora de la cita es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe estar en formato HH:MM (24 horas)'),
    body('type')
        .notEmpty().withMessage('El tipo de cita es requerido')
        .isString().withMessage('El tipo debe ser una cadena de texto')
        .trim(),
    body('status')
        .optional()
        .isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']).withMessage('El estado debe ser: scheduled, completed, cancelled o rescheduled'),
    body('notes')
        .optional()
        .isString().withMessage('Las notas deben ser una cadena de texto'),
    body('patient_info')
        .notEmpty().withMessage('La información del paciente es requerida')
        .isObject().withMessage('patient_info debe ser un objeto'),
    body('patient_info.id')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
    body('doctor_info')
        .optional()
        .isObject().withMessage('doctor_info debe ser un objeto'),
    body('duration_minutes')
        .optional()
        .isInt({ min: 1 }).withMessage('La duración debe ser un número entero positivo en minutos'),
    handleValidationErrors
];

// Validación para actualizar una cita (PUT)
const validateUpdateAppointment = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    body('appointment_date')
        .optional()
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('appointment_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe estar en formato HH:MM (24 horas)'),
    body('type')
        .optional()
        .isString().withMessage('El tipo debe ser una cadena de texto')
        .trim(),
    body('status')
        .optional()
        .isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']).withMessage('El estado debe ser: scheduled, completed, cancelled o rescheduled'),
    body('notes')
        .optional()
        .isString().withMessage('Las notas deben ser una cadena de texto'),
    body('patient_info')
        .optional()
        .isObject().withMessage('patient_info debe ser un objeto'),
    body('doctor_info')
        .optional()
        .isObject().withMessage('doctor_info debe ser un objeto'),
    body('duration_minutes')
        .optional()
        .isInt({ min: 1 }).withMessage('La duración debe ser un número entero positivo en minutos'),
    handleValidationErrors
];

// Validación para obtener una cita por ID
const validateAppointmentId = [
    param('id')
        .notEmpty().withMessage('El ID es requerido')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

// Validación para actualizar estado de cita
const validateUpdateStatus = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    body('status')
        .notEmpty().withMessage('El estado es requerido')
        .isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']).withMessage('El estado debe ser: scheduled, completed, cancelled o rescheduled'),
    handleValidationErrors
];

// Validación para búsqueda por fecha
const validateDate = [
    query('date')
        .notEmpty().withMessage('La fecha es requerida')
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    handleValidationErrors
];

// Validación para búsqueda por paciente (query param)
const validatePatientId = [
    query('patient_id')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
    handleValidationErrors
];

/**
 * Validaciones para pacientes (Patients)
 */

// Validación de ID de paciente (param)
const validatePatientIdParam = [
    param('id')
        .notEmpty().withMessage('El ID es requerido')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

// Validación para búsqueda por email (query)
const validatePatientEmailQuery = [
    query('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email debe tener un formato válido')
        .trim(),
    handleValidationErrors
];

// Validación para crear paciente
const validateCreatePatient = [
    body('first_name')
        .notEmpty().withMessage('El nombre es requerido')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('last_name')
        .notEmpty().withMessage('El apellido es requerido')
        .isString().withMessage('El apellido debe ser una cadena de texto')
        .trim(),
    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email debe tener un formato válido')
        .trim(),
    body('phone')
        .optional()
        .isString().withMessage('El teléfono debe ser una cadena de texto')
        .trim(),
    body('birth_date')
        .notEmpty().withMessage('La fecha de nacimiento es requerida')
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('address')
        .optional()
        .isString().withMessage('La dirección debe ser una cadena de texto')
        .trim(),
    body('insurance')
        .optional()
        .isString().withMessage('El seguro debe ser una cadena de texto')
        .trim(),
    body('orthodontics')
        .optional()
        .isObject().withMessage('orthodontics debe ser un objeto'),
    handleValidationErrors
];

// Validación para actualizar paciente
const validateUpdatePatient = [
    body('first_name')
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
    body('phone')
        .optional()
        .isString().withMessage('El teléfono debe ser una cadena de texto')
        .trim(),
    body('birth_date')
        .optional()
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('address')
        .optional()
        .isString().withMessage('La dirección debe ser una cadena de texto')
        .trim(),
    body('insurance')
        .optional()
        .isString().withMessage('El seguro debe ser una cadena de texto')
        .trim(),
    body('orthodontics')
        .optional()
        .isObject().withMessage('orthodontics debe ser un objeto'),
    handleValidationErrors
];

// Validación para ajuste de ortodoncia
const validateOrthodonticAdjustment = [
    body('adjustment_date')
        .notEmpty().withMessage('La fecha del ajuste es requerida')
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('adjustment_type')
        .notEmpty().withMessage('El tipo de ajuste es requerido')
        .isString().withMessage('El tipo de ajuste debe ser una cadena de texto')
        .trim(),
    body('notes')
        .optional()
        .isString().withMessage('Las notas deben ser una cadena de texto')
        .trim(),
    body('next_appointment')
        .optional()
        .isISO8601().withMessage('La fecha de la próxima cita debe estar en formato ISO8601 (YYYY-MM-DD)'),
    handleValidationErrors
];

/**
 * Validaciones para registros dentales (Dental Records)
 */

// Validación para crear registro dental
const validateCreateDentalRecord = [
    body('patient_id')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
    body('description')
        .notEmpty().withMessage('La descripción es requerida')
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim(),
    body('diagnosis')
        .optional()
        .isString().withMessage('El diagnóstico debe ser una cadena de texto')
        .trim(),
    body('treatment_plan')
        .optional()
        .isString().withMessage('El plan de tratamiento debe ser una cadena de texto')
        .trim(),
    body('treatment_notes')
        .optional()
        .isString().withMessage('Las notas de tratamiento deben ser una cadena de texto')
        .trim(),
    body('treatment_cost')
        .optional()
        .isFloat({ min: 0 }).withMessage('El costo del tratamiento debe ser un número positivo'),
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial']).withMessage('El estado de pago debe ser: pending, paid o partial'),
    body('record_type')
        .optional()
        .isString().withMessage('El tipo de registro debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación para actualizar registro dental
const validateUpdateDentalRecord = [
    param('id')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    body('patient_id')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim(),
    body('diagnosis')
        .optional()
        .isString().withMessage('El diagnóstico debe ser una cadena de texto')
        .trim(),
    body('treatment_plan')
        .optional()
        .isString().withMessage('El plan de tratamiento debe ser una cadena de texto')
        .trim(),
    body('treatment_notes')
        .optional()
        .isString().withMessage('Las notas de tratamiento deben ser una cadena de texto')
        .trim(),
    body('treatment_cost')
        .optional()
        .isFloat({ min: 0 }).withMessage('El costo del tratamiento debe ser un número positivo'),
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial']).withMessage('El estado de pago debe ser: pending, paid o partial'),
    body('record_type')
        .optional()
        .isString().withMessage('El tipo de registro debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación de ID de registro dental
const validateDentalRecordId = [
    param('id')
        .notEmpty().withMessage('El ID es requerido')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

/**
 * Validaciones para inventario (Inventory)
 */

// Validación para crear item de inventario
const validateCreateInventory = [
    body('name')
        .notEmpty().withMessage('El nombre es requerido')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('category')
        .notEmpty().withMessage('La categoría es requerida')
        .isString().withMessage('La categoría debe ser una cadena de texto')
        .trim(),
    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim(),
    body('current_stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock actual debe ser un número entero positivo'),
    body('min_stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero positivo'),
    body('cost_per_unit')
        .optional()
        .isFloat({ min: 0 }).withMessage('El costo por unidad debe ser un número positivo'),
    body('supplier')
        .optional()
        .isString().withMessage('El proveedor debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación para actualizar item de inventario
const validateUpdateInventory = [
    body('name')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('category')
        .optional()
        .isString().withMessage('La categoría debe ser una cadena de texto')
        .trim(),
    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim(),
    body('current_stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock actual debe ser un número entero positivo'),
    body('min_stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero positivo'),
    body('cost_per_unit')
        .optional()
        .isFloat({ min: 0 }).withMessage('El costo por unidad debe ser un número positivo'),
    body('supplier')
        .optional()
        .isString().withMessage('El proveedor debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación de ID de inventario
const validateInventoryId = [
    param('id')
        .notEmpty().withMessage('El ID es requerido')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

// Validación para ajustar stock
const validateAdjustStock = [
    body('adjustment')
        .notEmpty().withMessage('El ajuste es requerido')
        .isInt().withMessage('El ajuste debe ser un número entero'),
    body('reason')
        .optional()
        .isString().withMessage('La razón debe ser una cadena de texto')
        .trim(),
    body('notes')
        .optional()
        .isString().withMessage('Las notas deben ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación para búsqueda por categoría
const validateCategoryQuery = [
    query('category')
        .notEmpty().withMessage('La categoría es requerida')
        .isString().withMessage('La categoría debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

// Validación para búsqueda por nombre en inventory
const validateInventorySearchQuery = [
    query('name')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim(),
    handleValidationErrors
];

module.exports = {
    validateUserId,
    validateUpdateUser,
    validateRoleQuery,
    validateSearchQuery,
    validatePagination,
    validateCreateAppointment,
    validateUpdateAppointment,
    validateAppointmentId,
    validateUpdateStatus,
    validateDate,
    validatePatientId,
    validatePatientIdParam,
    validatePatientEmailQuery,
    validateCreatePatient,
    validateUpdatePatient,
    validateOrthodonticAdjustment,
    validateCreateDentalRecord,
    validateUpdateDentalRecord,
    validateDentalRecordId,
    validateCreateInventory,
    validateUpdateInventory,
    validateInventoryId,
    validateAdjustStock,
    validateCategoryQuery,
    validateInventorySearchQuery,
    handleValidationErrors
};
