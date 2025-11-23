const path = require('path');

// Sirve la vista de Login
const getLoginView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/login.html'));
};

// Sirve la vista de Registro
const getRegisterView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/register.html'));
};

/**
 * Sirve la vista de Crear Paciente
 * GET /patients/new
 */
const getCreatePatientView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/create-patient.html'));
};

/**
 * Sirve la vista del Dashboard Principal
 * GET /dashboard
 */
const getDashboardView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/dashboard.html'));
};

/**
 * Sirve la vista de Crear Cita
 * GET /appointments/new
 */
const getCreateAppointmentView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/create-appointment.html'));
};

module.exports = {
    getLoginView,
    getRegisterView,
    getCreatePatientView,
    getDashboardView,
    getCreateAppointmentView
};