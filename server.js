// Servidor principal de Express
// Configura la aplicación, rutas y middlewares del backend
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar módulo de conexión a la base de datos MongoDB
const databaseConnection = require('./config/database');

// Importar rutas de autenticación
const authRoutes = require('./routes/auth');

// Importar middleware para manejar errores globalmente
const errorHandler = require('./middlewares/errorHandler');

// Crear aplicación Express
const app = express();

// Middlewares globales de la aplicación
app.use(cors()); // Habilita CORS para permitir peticiones desde el frontend
app.use(express.json()); // Parsea JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Parsea datos URL-encoded

// Endpoint de verificación de salud (health check)
// No requiere autenticación, se usa para verificar que el servidor esté funcionando
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servicio REST de Consultorio Dental está funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Configuración de rutas del API
// Las rutas de autenticación no requieren JWT
app.use('/api/auth', authRoutes);

// Las siguientes rutas requieren autenticación JWT (manejado por middleware)
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointment');
const patientRoutes = require('./routes/patient');
const dentalRecordsRoutes = require('./routes/dentalRecordsRoutes');
const inventoryRoutes = require('./routes/inventory');

app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dentalrecords', dentalRecordsRoutes);
app.use('/api/inventory', inventoryRoutes);

// Manejo de rutas no encontradas (404)
// Se ejecuta cuando una petición no coincide con ninguna ruta definida
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.method} ${req.path} no existe`,
        availableRoutes: [
            'GET /health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/users',
            'GET /api/users/:id',
            'GET /api/users/search?q=',
            'GET /api/users/role?role=',
            'PUT /api/users/:id',
            'DELETE /api/users/:id',
            'GET /api/appointments',
            'GET /api/appointments/:id',
            'GET /api/appointments/date?date=YYYY-MM-DD',
            'GET /api/appointments/patient?patient_id=N',
            'POST /api/appointments',
            'PUT /api/appointments/:id',
            'PATCH /api/appointments/:id/status',
            'DELETE /api/appointments/:id',
            'GET /api/patients',
            'GET /api/patients/:id',
            'GET /api/patients/search?q=',
            'GET /api/patients/email?email=',
            'POST /api/patients',
            'PUT /api/patients/:id',
            'DELETE /api/patients/:id',
            'POST /api/patients/:id/orthodontics/adjustments',
            'GET /api/dentalrecords',
            'GET /api/dentalrecords/:id',
            'GET /api/dentalrecords/patient?patient_id=N',
            'POST /api/dentalrecords',
            'PUT /api/dentalrecords/:id',
            'PATCH /api/dentalrecords/:id',
            'DELETE /api/dentalrecords/:id',
            'GET /api/inventory',
            'GET /api/inventory/:id',
            'GET /api/inventory/category?category=',
            'GET /api/inventory/search?name=',
            'POST /api/inventory',
            'PUT /api/inventory/:id',
            'PATCH /api/inventory/:id/stock',
            'DELETE /api/inventory/:id'
        ]
    });
});

// Middleware de manejo de errores global
// Debe ir al final de todas las rutas para capturar errores no manejados
app.use(errorHandler);

// Puerto del servidor (usa variable de entorno o 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
// Conecta a la base de datos y luego inicia el servidor HTTP
async function startServer() {
    try {
        // Verifica y conecta a la base de datos si no está conectada
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        // Inicia el servidor HTTP en el puerto especificado
        app.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log('Servicio REST - Consultorio Dental');
            console.log('='.repeat(60));
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
            console.log(`Appointments: http://localhost:${PORT}/api/appointments`);
            console.log(`Dental Records: http://localhost:${PORT}/api/dentalrecords`);
            console.log(`Patients: http://localhost:${PORT}/api/patients`);
            console.log(`Inventory: http://localhost:${PORT}/api/inventory`);
            console.log(`Users: http://localhost:${PORT}/api/users`);
            console.log('='.repeat(60));
            console.log(' Todas las rutas requieren autenticación JWT');
            console.log('='.repeat(60));
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful del servidor
// Se ejecuta cuando se recibe SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\nCerrando servidor...');
    try {
        // Cierra la conexión a la base de datos antes de salir
        if (databaseConnection.isConnectionActive()) {
            await databaseConnection.disconnect();
        }
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar:', error);
        process.exit(1);
    }
});

// Manejo de cierre graceful del servidor
// Se ejecuta cuando se recibe SIGTERM (terminación del proceso)
process.on('SIGTERM', async () => {
    console.log('\nCerrando servidor...');
    try {
        // Cierra la conexión a la base de datos antes de salir
        if (databaseConnection.isConnectionActive()) {
            await databaseConnection.disconnect();
        }
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar:', error);
        process.exit(1);
    }
});

// Inicia el servidor solo si este archivo se ejecuta directamente
// (no cuando se importa como módulo en tests u otros archivos)
if (require.main === module) {
    startServer();
}

module.exports = app;

