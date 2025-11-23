document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a los elementos del DOM
    const form = document.getElementById('loginForm');
    const alertBox = document.getElementById('alert-box');
    const btnLogin = document.getElementById('btn-login');
    const linkToRegister = document.getElementById('link-to-register');

    // 2. Manejo de navegación manual (Sin <a> href)
    if (linkToRegister) {
        linkToRegister.addEventListener('click', () => {
            // Redirección forzada controlada por JS
            window.location.href = '/register';
        });
    }

    // 3. Manejo del envío del formulario
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que la página se recargue sola

            // A. Limpiar estado anterior (Alertas y botón)
            alertBox.style.display = 'none';
            alertBox.textContent = '';
            
            const originalBtnText = btnLogin.textContent;
            btnLogin.textContent = 'Verificando...';
            btnLogin.disabled = true; // Desactivar botón para evitar doble click

            // B. Capturar datos
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // C. Petición al Backend
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // D. Éxito: Guardar sesión
                    // Guardamos el JWT para usarlo en futuras peticiones
                    localStorage.setItem('token', data.token);
                    // Guardamos datos básicos del usuario (nombre, rol)
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Redireccionar al dashboard principal
                    // (Asegúrate de que esta ruta exista o cámbiala temporalmente si no la hemos creado)
                    window.location.href = '/dashboard'; 
                } else {
                    // E. Error del servidor (401, 400, 500)
                    throw new Error(data.message || 'Error al iniciar sesión');
                }

            } catch (error) {
                // F. Mostrar error en la cajita roja
                console.error('Login error:', error);
                alertBox.textContent = error.message;
                alertBox.style.display = 'block'; // Mostrar la alerta
            } finally {
                // G. Restaurar botón (pase lo que pase)
                btnLogin.textContent = originalBtnText;
                btnLogin.disabled = false;
            }
        });
    }
});