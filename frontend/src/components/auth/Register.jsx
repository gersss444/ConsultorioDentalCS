// Componente de página de registro
// Permite crear una nueva cuenta de usuario en el sistema
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  // Estado del formulario con todos los campos requeridos
  // El rol por defecto es 'assistant' (asistente)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    last_name: '',
    role: 'assistant',
  });
  // Estado para mostrar mensajes de error
  const [error, setError] = useState('');
  // Estado para indicar si se está procesando el registro
  const [loading, setLoading] = useState(false);
  // Función de registro del contexto de autenticación
  const { register } = useAuth();
  // Hook para navegar a otras páginas
  const navigate = useNavigate();

  // Actualiza el estado del formulario cuando el usuario escribe
  // También limpia el mensaje de error al escribir
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  // Maneja el envío del formulario de registro
  // Crea el nuevo usuario y redirige al dashboard si es exitoso
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError('');
    setLoading(true);

    try {
      // Intenta registrar el nuevo usuario con los datos del formulario
      await register(formData);
      // Si es exitoso, navega al dashboard
      navigate('/dashboard');
    } catch (err) {
      // Si hay error, muestra un mensaje al usuario
      setError(
        err.response?.data?.message || 'Error al registrar usuario. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Consultorio Dental</h1>
        <h2>Registro de Usuario</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Luis"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Apellido</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Suarez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="usuario@gmail.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={4}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="assistant">Asistente</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

