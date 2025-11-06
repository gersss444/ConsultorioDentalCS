# Sistema Consultorio Dental

API REST para gestión de consultorio dental.

## 1. Instalar dependencias
```bash
npm install
```

## 2. Configurar Base de Datos
- Crear base de datos MongoDB con nombre: `consultorio_dental`

## 3. Iniciar el servidor
```bash
npm run dev
```

## Uso con Postman

Una vez iniciado el servidor, puedes probar todos los endpoints con Postman:

### Endpoints disponibles:

#### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario (obtiene token automáticamente)
- `POST /api/auth/login` - Iniciar sesión y obtener token JWT

**¿Dónde ingresar JWT?** - Ve a Authorization, Selecciona Bearer Token, Pega tu TOKEN.

#### Users (Usuarios)
- `GET /api/users?page=1&limit=10` - Listar usuarios con paginación (requiere JWT)
- `GET /api/users/:id` - Obtener usuario por ID (requiere JWT)
- `GET /api/users/search?q=termino` - Buscar usuarios por nombre (requiere JWT)
- `GET /api/users/role?role=doctor` - Buscar usuarios por rol (requiere JWT)
- `PUT /api/users/:id` - Actualizar usuario (requiere JWT)
- `DELETE /api/users/:id` - Desactivar usuario (requiere JWT)

#### Appointments (Citas)
- `GET /api/appointments?page=1&limit=10` - Listar citas con paginación (requiere JWT)
- `GET /api/appointments/:id` - Obtener cita por ID (requiere JWT)
- `GET /api/appointments/date?date=YYYY-MM-DD` - Buscar citas por fecha (requiere JWT)
- `GET /api/appointments/patient?patient_id=N` - Buscar citas por paciente (requiere JWT)
- `POST /api/appointments` - Crear nueva cita (requiere JWT)
- `PUT /api/appointments/:id` - Actualizar cita completa (requiere JWT)
- `PATCH /api/appointments/:id/status` - Actualizar estado de cita (requiere JWT)
- `DELETE /api/appointments/:id` - Eliminar cita (requiere JWT)

#### Patients (Pacientes)
- `GET /api/patients?page=1&limit=10` - Listar pacientes con paginación (requiere JWT)
- `GET /api/patients/:id` - Obtener paciente por ID (requiere JWT)
- `GET /api/patients/search?q=termino` - Buscar pacientes por nombre/apellido (requiere JWT)
- `GET /api/patients/email?email=correo@ejemplo.com` - Buscar paciente por email (requiere JWT)
- `POST /api/patients` - Crear nuevo paciente (requiere JWT)
- `PUT /api/patients/:id` - Actualizar paciente completo (requiere JWT)
- `DELETE /api/patients/:id` - Eliminar paciente (requiere JWT)
- `POST /api/patients/:id/orthodontics/adjustments` - Agregar ajuste de ortodoncia (requiere JWT)

#### Dental Records (Registros Dentales)
- `GET /api/dentalrecords` - Listar todos los registros dentales sin paginación (requiere JWT)
- `GET /api/dentalrecords/:id` - Obtener registro dental por ID (requiere JWT)
- `GET /api/dentalrecords/patient?patient_id=N` - Buscar registros por paciente (requiere JWT)
- `POST /api/dentalrecords` - Crear nuevo registro dental (requiere JWT, valida que patient_id exista)
- `PUT /api/dentalrecords/:id` - Actualizar registro dental completo (requiere JWT)
- `PATCH /api/dentalrecords/:id` - Actualizar varios campos del registro (requiere JWT)
- `DELETE /api/dentalrecords/:id` - Eliminar registro dental (requiere JWT)

#### Inventory (Inventario)
- `GET /api/inventory?page=1&limit=10` - Listar items del inventario con paginación (requiere JWT)
- `GET /api/inventory/:id` - Obtener item por ID (requiere JWT)
- `GET /api/inventory/category?category=materiales` - Buscar items por categoría (requiere JWT)
- `GET /api/inventory/search?name=termino` - Buscar items por nombre (requiere JWT)
- `POST /api/inventory` - Crear nuevo item en el inventario (requiere JWT)
- `PUT /api/inventory/:id` - Actualizar item completo (requiere JWT)
- `PATCH /api/inventory/:id/stock` - Ajustar stock de un item (requiere JWT)
- `DELETE /api/inventory/:id` - Eliminar item del inventario (requiere JWT)

## Primer uso

1. **Registra tu primer usuario** con `POST /api/auth/register`:
```json
{
    "email": "admin@consultorio.com",
    "password": "contraseña",
    "name": "Administrador",
    "role": "admin"
}
```

2. El registro automáticamente te devuelve un token JWT que puedes usar para las demás peticiones.

3. Para futuros accesos, usa `POST /api/auth/login` con tus credenciales.



