document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Autenticación al cargar
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sesión no iniciada. Redirigiendo al login...');
        window.location.href = '/login';
        return;
    }

    // 2. Referencias DOM
    const form = document.getElementById('createPatientForm');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const alertBox = document.getElementById('alert-box');
    const successBox = document.getElementById('success-box');

    // Botón Cancelar
    btnCancel.addEventListener('click', () => {
        if(confirm('¿Estás seguro de cancelar? Se perderán los datos.')) {
            window.location.href = '/dashboard';
        }
    });

    // 3. Enviar Formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar alertas previas
        alertBox.classList.add('hidden');
        alertBox.textContent = '';
        successBox.classList.add('hidden');
        successBox.textContent = '';

        // Feedback visual de carga
        const originalText = btnSave.textContent;
        btnSave.textContent = 'Guardando...';
        btnSave.disabled = true;

        // Recopilar datos
        const formData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            birth_date: document.getElementById('birth_date').value,
            address: document.getElementById('address').value,
            insurance: document.getElementById('insurance').value || 'Sin seguro'
        };

        try {
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // IMPORTANTE: Enviar el token JWT
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Éxito: Mostrar mensaje y limpiar formulario
                successBox.textContent = '¡Paciente registrado correctamente!';
                successBox.classList.remove('hidden');
                form.reset();
                
                // Opcional: Redirigir después de unos segundos
                // setTimeout(() => window.location.href = '/dashboard', 2000);
            } else {
                // Error: Mostrar mensaje del backend
                throw new Error(data.error || data.message || 'Error al guardar paciente');
            }

        } catch (error) {
            console.error('Error:', error);
            alertBox.textContent = error.message;
            alertBox.classList.remove('hidden');
        } finally {
            // Restaurar botón
            btnSave.textContent = originalText;
            btnSave.disabled = false;
        }
    });
});