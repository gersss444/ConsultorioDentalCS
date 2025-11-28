// Componente de página de inicio de sesión
// Permite a los usuarios iniciar sesión con email y contraseña
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  // Estado del formulario: email y contraseña
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  // Estado para mostrar mensajes de error
  const [error, setError] = useState('');
  // Estado para indicar si se está procesando el login
  const [loading, setLoading] = useState(false);
  // Función de login del contexto de autenticación
  const { login } = useAuth();
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

  // Maneja el envío del formulario de login
  // Intenta iniciar sesión y redirige al dashboard si es exitoso
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError('');
    setLoading(true);

    try {
      // Intenta iniciar sesión con las credenciales
      await login(formData.email, formData.password);
      // Si es exitoso, navega al dashboard
      navigate('/dashboard');
    } catch (err) {
      // Si hay error, muestra un mensaje al usuario
      setError(
        err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Consultorio Dental</h1>
        <h2>Iniciar Sesión</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="usuario@consultorio.com"
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
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

