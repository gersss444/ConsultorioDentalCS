const User = require('../models/User');
const databaseConnection = require('../config/database');

/**
 * Obtener todos los usuarios con paginación
 * GET /api/users?page=1&limit=10
 */
const getAllUsers = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const userModel = new User();
        const result = await userModel.findAll(page, limit);

        // Excluir passwords de la respuesta
        const usersWithoutPassword = result.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.status(200).json({
            message: 'Usuarios obtenidos exitosamente',
            data: usersWithoutPassword,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un usuario por ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const userId = parseInt(req.params.id);
        const userModel = new User();
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${userId}`
            });
        }

        // Excluir password de la respuesta
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Usuario obtenido exitosamente',
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Buscar usuarios por nombre
 * GET /api/users/search?q=termino
 */
const searchUsers = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const searchTerm = req.query.q || '';
        const userModel = new User();
        const users = await userModel.searchByName(searchTerm);

        // Excluir passwords de la respuesta
        const usersWithoutPassword = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.status(200).json({
            message: 'Búsqueda de usuarios completada',
            data: usersWithoutPassword,
            total: usersWithoutPassword.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Buscar usuarios por rol
 * GET /api/users/role?role=doctor
 */
const getUsersByRole = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const role = req.query.role;
        const userModel = new User();
        const users = await userModel.findByRole(role);

        // Excluir passwords de la respuesta
        const usersWithoutPassword = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.status(200).json({
            message: 'Usuarios obtenidos por rol',
            data: usersWithoutPassword,
            total: usersWithoutPassword.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar un usuario
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const userId = parseInt(req.params.id);
        const userModel = new User();

        // Verificar que el usuario existe
        const existingUser = await userModel.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${userId}`
            });
        }

        // Verificar si el email ya está en uso por otro usuario
        if (req.body.email && req.body.email !== existingUser.email) {
            const userWithEmail = await userModel.findByEmail(req.body.email);
            if (userWithEmail && userWithEmail.id !== userId) {
                return res.status(409).json({
                    error: 'Email ya en uso',
                    message: `El email ${req.body.email} ya está registrado por otro usuario`
                });
            }
        }

        // Excluir campos que no deben actualizarse directamente
        const { password, id, created_at, _id, ...updateData } = req.body;

        const result = await userModel.update(userId, updateData);

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Obtener el usuario actualizado
        const updatedUser = await userModel.findById(userId);
        
        // Excluir password de la respuesta
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Desactivar un usuario (soft delete)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const userId = parseInt(req.params.id);
        const userModel = new User();

        // Verificar que el usuario existe
        const existingUser = await userModel.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${userId}`
            });
        }

        // Desactivar usuario (soft delete)
        const result = await userModel.update(userId, { is_active: false });

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            message: 'Usuario desactivado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    searchUsers,
    getUsersByRole,
    updateUser,
    deleteUser
};

