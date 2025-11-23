const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// Definición de las rutas que el usuario ve en el navegador
router.get('/login', viewController.getLoginView);
router.get('/register', viewController.getRegisterView);

// Redirección: Si entran a la raíz '/', enviarlos al login por ahora
router.get('/', (req, res) => {
    res.redirect('/login');
});

// Acceso: http://localhost:3000/patients/new
router.get('/patients/new', viewController.getCreatePatientView);

// Acceso: http://localhost:3000/dashboard
router.get('/dashboard', viewController.getDashboardView);
router.get('/appointments/new', viewController.getCreateAppointmentView);
module.exports = router;