document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias al DOM
    const form = document.getElementById('registerForm');
    const alertBox = document.getElementById('alert-box');
    const btnRegister = document.getElementById('btn-register');
    const linkToLogin = document.getElementById('link-to-login');

    // 2. Navegación manual al Login
    if (linkToLogin) {
        linkToLogin.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }

    // 3. Manejo del registro
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // A. Limpiar UI
            alertBox.style.display = 'none';
            alertBox.textContent = '';
            
            const originalBtnText = btnRegister.textContent;
            btnRegister.textContent = 'Procesando...';
            btnRegister.disabled = true;

            // B. Recolectar datos
            const formData = {
                name: document.getElementById('name').value,
                last_name: document.getElementById('last_name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value,
                specialty: document.getElementById('specialty').value,
                phone: document.getElementById('phone').value
            };

            try {
                // C. Petición a la API
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // D. Registro Exitoso
                    alert('Usuario registrado exitosamente. Iniciando sesión...');
                    
                    // Auto-login: Guardamos token
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirigir al dashboard
                    window.location.href = '/dashboard';
                } else {
                    // E. Manejo de errores
                    let errorMsg = data.message || 'Error al registrar';
                    
                    // Si el backend envía lista de errores (express-validator)
                    if(data.errors && Array.isArray(data.errors)) {
                        errorMsg = data.errors[0].msg; 
                    }

                    throw new Error(errorMsg);
                }

            } catch (error) {
                // F. Mostrar error
                console.error('Register Error:', error);
                alertBox.textContent = error.message;
                alertBox.style.display = 'block';
            } finally {
                // G. Restaurar botón
                btnRegister.textContent = originalBtnText;
                btnRegister.disabled = false;
            }
        });
    }
});