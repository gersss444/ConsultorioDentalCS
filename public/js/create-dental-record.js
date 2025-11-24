document.addEventListener('DOMContentLoaded', () => {
    // 1. Seguridad
    const token = localStorage.getItem('token');
    if (!token) return; 

    // Referencias
    const patientSelect = document.getElementById('patientSelect');
    const form = document.getElementById('createRecordForm');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const alertBox = document.getElementById('alert-box');

    // 2. Cargar Pacientes para el Select
    async function loadPatients() {
        try {
            // Reutilizamos el endpoint de listar pacientes
            const response = await fetch('/api/patients?limit=100', { // Traemos un buen número
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                populatePatientSelect(result.data || []);
            } else {
                throw new Error('Error al cargar pacientes');
            }
        } catch (error) {
            console.error(error);
            patientSelect.innerHTML = '<option value="">Error al cargar pacientes</option>';
        }
    }

    function populatePatientSelect(patients) {
        if (patients.length === 0) {
            patientSelect.innerHTML = '<option value="">No hay pacientes registrados</option>';
            return;
        }

        // Intentar ver si venimos de una redirección con ID de paciente (Opcional futuro)
        const urlParams = new URLSearchParams(window.location.search);
        const preSelectedId = urlParams.get('patient_id');

        let html = '<option value="">-- Seleccione un paciente --</option>';
        patients.forEach(p => {
            const selected = preSelectedId == p.id ? 'selected' : '';
            html += `<option value="${p.id}" ${selected}>${p.first_name} ${p.last_name}</option>`;
        });
        patientSelect.innerHTML = html;
    }

    // 3. Guardar Registro
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading
        const originalBtnText = btnSave.textContent;
        btnSave.textContent = 'Guardando...';
        btnSave.disabled = true;
        alertBox.classList.add('hidden');

        try {
            // Obtener usuario actual para "created_by_info"
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            const formData = {
                patient_id: document.getElementById('patientSelect').value,
                record_type: document.getElementById('recordType').value,
                description: document.getElementById('description').value,
                diagnosis: document.getElementById('diagnosis').value,
                treatment_plan: document.getElementById('treatmentPlan').value,
                treatment_notes: document.getElementById('treatmentNotes').value,
                treatment_cost: document.getElementById('treatmentCost').value || 0,
                payment_status: document.getElementById('paymentStatus').value,
                
                // Info de auditoría
                created_by_info: {
                    id: currentUser.id || 'SYS',
                    name: currentUser.name || 'Usuario Sistema'
                }
            };

            const response = await fetch('/api/dentalrecords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registro clínico guardado exitosamente');
                // Redirigir a la lista de pacientes o al historial del paciente
                window.location.href = '/patients'; 
            } else {
                throw new Error(data.message || data.error || 'Error al guardar');
            }

        } catch (error) {
            console.error(error);
            alertBox.textContent = error.message;
            alertBox.className = 'alert alert-error';
            alertBox.classList.remove('hidden');
        } finally {
            btnSave.textContent = originalBtnText;
            btnSave.disabled = false;
        }
    });

    // Cancelar
    btnCancel.addEventListener('click', () => {
        if(confirm('¿Descartar cambios?')) {
            window.history.back(); // Regresar a la página anterior
        }
    });

    // Iniciar
    loadPatients();
});