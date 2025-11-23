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

// Ruta para registrar pacientes (Historia CD-0003-001)
// Acceso: http://localhost:3000/patients/new
router.get('/patients/new', viewController.getCreatePatientView);

// Ruta del Dashboard Principal (Historia CD-0006-001)
// Acceso: http://localhost:3000/dashboard
router.get('/dashboard', viewController.getDashboardView);

module.exports = router;