/**
 * Controlador REST de Pacientes
 * Maneja todas las operaciones CRUD (crear, leer, actualizar, eliminar)
 * además de búsqueda y gestión de ortodoncia
 * Usa el modelo Patient.js y requiere autenticación JWT
 */

const Patient = require('../models/Patient');
const databaseConnection = require('../config/database');

// Función auxiliar para filtrar solo las propiedades permitidas de un objeto
// Evita que se inserten campos no deseados en la base de datos
const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));

// Lista de campos permitidos para crear/actualizar pacientes
const allowed = ['first_name', 'last_name', 'email', 'phone', 'birth_date', 'address', 'insurance', 'orthodontics'];

// Obtiene todos los pacientes con paginación
// GET /api/patients?page=&limit=
async function getAllPatients(req, res, next) {
  try {
    // Asegura que la conexión a la base de datos esté activa
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    
    // Obtiene página y límite de la query string (valores por defecto: 1 y 10)
    const page = +req.query.page || 1, limit = +req.query.limit || 10;
    
    // Crea una instancia del modelo Patient y obtiene los pacientes
    const model = new Patient();
    const result = await model.findAll(page, limit);
    
    // Retorna la lista de pacientes con información de paginación
    res.json({
      message: 'Pacientes obtenidos',
      data: result.patients,
      pagination: { total: result.total, page, limit }
    });
  } catch (e) { next(e); }
}

// Obtiene un paciente por su ID
// GET /api/patients/:id
async function getPatientById(req, res, next) {
  try {
    // Asegura que la conexión a la base de datos esté activa
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    
    const model = new Patient();
    // Convierte el ID de string a número y busca el paciente
    const p = await model.findById(+req.params.id);
    
    // Si no se encuentra, retorna error 404
    if (!p) return res.status(404).json({ error: 'Paciente no encontrado' });
    
    res.json({ message: 'Paciente obtenido', data: p });
  } catch (e) { next(e); }
}

// Obtiene un paciente por su email
// GET /api/patients/email?email=
async function getPatientByEmail(req, res, next) {
  try {
    // Asegura que la conexión a la base de datos esté activa
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    
    const model = new Patient();
    // Busca el paciente por email
    const p = await model.findByEmail(req.query.email);
    
    // Si no se encuentra, retorna error 404
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    
    res.json({ message: 'Paciente obtenido', data: p });
  } catch (e) { next(e); }
}

// Busca pacientes por nombre o apellido
// GET /api/patients/search?q=
async function searchPatients(req, res, next) {
  try {
    // Asegura que la conexión a la base de datos esté activa
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    
    const model = new Patient();
    // Busca pacientes que coincidan con el término de búsqueda
    const list = await model.searchByName(req.query.q || '');
    
    res.json({ message: 'Resultados', data: list });
  } catch (e) { next(e); }
}

// Crea un nuevo paciente
// POST /api/patients
async function createPatient(req, res, next) {
  try {
    // Asegura que la conexión a la base de datos esté activa
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    
    const model = new Patient();
    // Filtra solo los campos permitidos del body de la petición
    const data = pick(req.body, allowed);
    
    // Crea el nuevo paciente en la base de datos
    const created = await model.create(data);
    
    // Retorna el paciente creado con código 201 (Created)
    res.status(201).json({ message: 'Paciente creado', data: created });
  } catch (e) {
    // Si el error indica que el paciente ya existe, retorna 409 (Conflict)
    if (String(e.message).includes('ya existe'))
      return res.status(409).json({ error: e.message });
    next(e);
  }
}

// Actualiza un paciente existente
// PUT /api/patients/:id
async function updatePatient(req, res, next) {
  try {
    // Asegura que la conexión a la base de datos esté activa
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    
    // Convierte el ID de string a número
    const id = +req.params.id;
    const model = new Patient();
    const exists = await model.findById(id);
    if (!exists) return res.status(404).json({ error: 'No encontrado' });

    if (req.body.email && req.body.email !== exists.email) {
      const dup = await model.findByEmail(req.body.email);
      if (dup) return res.status(409).json({ error: 'Email duplicado' });
    }

    const data = pick(req.body, allowed);
    const r = await model.update(id, data);
    if (!r.modifiedCount) return res.status(400).json({ error: 'No se actualizó' });

    const updated = await model.findById(id);
    res.json({ message: 'Paciente actualizado', data: updated });
  } catch (e) { next(e); }
}

// DELETE /api/patients/:id
async function deletePatient(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const r = await model.delete(+req.params.id);
    if (!r.deletedCount) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch (e) { next(e); }
}

// POST /api/patients/:id/orthodontics/adjustments
async function addOrthodonticAdjustment(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const r = await model.addOrthodonticAdjustment(+req.params.id, req.body);
    if (!r.modifiedCount) return res.status(400).json({ error: 'No se agregó ajuste' });
    const p = await model.findById(+req.params.id);
    res.status(201).json({ message: 'Ajuste agregado', data: p.orthodontics });
  } catch (e) { next(e); }
}

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientByEmail,
  searchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  addOrthodonticAdjustment
};
