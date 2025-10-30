# Sistema REST API - Consultorio Dental

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

## Primer uso

1. **Registra tu primer usuario** con `POST /api/auth/register`:
```json
{
    "email": "admin@consultorio.com",
    "password": "tu_password_segura",
    "name": "Administrador",
    "role": "admin"
}
```

2. El registro automáticamente te devuelve un token JWT que puedes usar para las demás peticiones.

3. Para futuros accesos, usa `POST /api/auth/login` con tus credenciales.

### Nota sobre autenticación
Para acceder a las rutas protegidas, debes incluir el token en el header:
```
Authorization: Bearer <tu_token_jwt>
```
