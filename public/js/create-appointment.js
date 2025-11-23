document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Sesión
    const token = localStorage.getItem('token');
    if (!token) return; // layout.js maneja la redirección

    // Referencias DOM
    const patientSelect = document.getElementById('patientSelect');
    const form = document.getElementById('createAppointmentForm');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const alertBox = document.getElementById('alert-box');

    // Variable para almacenar la lista completa de pacientes (para extraer datos después)
    let patientsCache = [];

    // 2. Cargar lista de pacientes para el Select
    async function loadPatients() {
        try {
            const response = await fetch('/api/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                patientsCache = result.data || [];
                populatePatientSelect(patientsCache);
            } else {
                throw new Error('Error al cargar pacientes');
            }
        } catch (error) {
            console.error(error);
            patientSelect.innerHTML = '<option value="">Error al cargar pacientes</option>';
            showAlert('No se pudo cargar la lista de pacientes', 'error');
        }
    }

    function populatePatientSelect(patients) {
        if (patients.length === 0) {
            patientSelect.innerHTML = '<option value="">No hay pacientes registrados</option>';
            return;
        }

        let html = '<option value="">-- Seleccione un paciente --</option>';
        patients.forEach(p => {
            html += `<option value="${p.id}">${p.first_name} ${p.last_name} (${p.email})</option>`;
        });
        patientSelect.innerHTML = html;
    }

    // 3. Manejar Envío del Formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validaciones básicas de UI
        const patientId = patientSelect.value;
        if (!patientId) {
            showAlert('Debe seleccionar un paciente', 'error');
            return;
        }

        // Preparar UI
        const originalBtnText = btnSave.textContent;
        btnSave.textContent = 'Guardando...';
        btnSave.disabled = true;
        alertBox.classList.add('hidden');

        try {
            // A. Obtener datos del paciente seleccionado (para patient_info)
            // Esto es necesario porque tu modelo guarda el objeto, no solo el ID
            const selectedPatient = patientsCache.find(p => p.id == patientId);
            
            // B. Obtener datos del doctor (usuario logueado)
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            // C. Construir el objeto Cita
            const appointmentData = {
                appointment_date: document.getElementById('appointmentDate').value,
                appointment_time: document.getElementById('appointmentTime').value,
                type: document.getElementById('appointmentType').value,
                duration_minutes: parseInt(document.getElementById('duration').value),
                notes: document.getElementById('notes').value,
                status: 'scheduled',
                
                // Información embebida (Desnormalización para MongoDB)
                patient_info: {
                    id: selectedPatient.id,
                    first_name: selectedPatient.first_name,
                    last_name: selectedPatient.last_name,
                    email: selectedPatient.email,
                    phone: selectedPatient.phone
                },
                doctor_info: {
                    id: currentUser.id || 0, // Fallback si no hay ID
                    name: currentUser.name || 'Desconocido',
                    email: currentUser.email
                }
            };

            // D. Enviar al Backend
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });

            const result = await response.json();

            if (response.ok) {
                // Éxito
                alert('Cita agendada correctamente');
                window.location.href = '/dashboard';
            } else {
                throw new Error(result.message || 'Error al guardar la cita');
            }

        } catch (error) {
            console.error(error);
            showAlert(error.message, 'error');
            btnSave.textContent = originalBtnText;
            btnSave.disabled = false;
        }
    });

    // Cancelar
    btnCancel.addEventListener('click', () => {
        if(confirm('¿Descartar cambios?')) {
            window.location.href = '/dashboard';
        }
    });

    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = `alert alert-${type}`;
        alertBox.classList.remove('hidden');
    }

    // Inicializar
    loadPatients();
    
    // Setear fecha mínima a hoy (UX)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
});