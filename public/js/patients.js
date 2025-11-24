document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Sesión
    const token = localStorage.getItem('token');
    if (!token) return;

    // 2. Referencias DOM
    const tableBody = document.getElementById('patients-body');
    const emptyState = document.getElementById('empty-state');
    const alertBox = document.getElementById('alert-box');
    const searchInput = document.getElementById('search-input');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnNewPatient = document.getElementById('btn-new-patient');

    // Referencias del Modal
    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    const modalPatientName = document.getElementById('modal-patient-name');
    const btnCloseModal = document.getElementById('btn-close-modal');

    let searchTimeout;

    // --- CARGA DE PACIENTES ---
    async function loadPatients(searchTerm = '') {
        try {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #6B7280;">Cargando pacientes...</td></tr>';
            emptyState.classList.add('hidden');

            let url = '/api/patients?limit=50';
            if (searchTerm) url = `/api/patients/search?q=${encodeURIComponent(searchTerm)}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar la lista');

            const result = await response.json();
            renderTable(result.data || []);

        } catch (error) {
            console.error(error);
            showAlert('Error al obtener pacientes', 'error');
            tableBody.innerHTML = '';
        }
    }

    // --- RENDERIZADO DE TABLA ---
    function renderTable(patients) {
        tableBody.innerHTML = '';

        if (patients.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        patients.forEach(p => {
            let orthoBadge = '<span style="color: #9CA3AF; font-size: 0.8rem;">N/A</span>';
            if (p.orthodontics && p.orthodontics.status === 'active') {
                orthoBadge = '<span class="status-badge status-scheduled">Activo</span>';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: #1F2937;">${p.first_name} ${p.last_name}</div>
                    <div style="font-size: 0.8rem; color: #6B7280;">ID: ${p.id}</div>
                </td>
                <td>
                    <div>${p.email}</div>
                    <div style="font-size: 0.8rem; color: #6B7280;">${p.phone}</div>
                </td>
                <td>${p.insurance || 'Sin seguro'}</td>
                <td>${orthoBadge}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="action-btn" title="Nuevo Registro Clínico" onclick="createRecord(${p.id})">
                        <span style="color: var(--color-primary); font-weight: bold;">+</span> 🩺
                    </button>

                    <button class="action-btn" title="Ver Historial" onclick="viewHistory(${p.id}, '${p.first_name} ${p.last_name}')">
                        📄
                    </button>

                    <button class="action-btn btn-delete" style="margin-right: 0;" title="Eliminar" onclick="deletePatient(${p.id})">
                        🗑️
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- LÓGICA DEL HISTORIAL (MODAL) ---
    
    // Función global para abrir historial
    window.viewHistory = async (id, fullName) => {
        // 1. Abrir modal y mostrar estado de carga
        historyModal.classList.add('active');
        modalPatientName.textContent = `Paciente: ${fullName}`;
        historyList.innerHTML = '<div style="text-align:center; padding: 2rem;">Cargando expediente...</div>';

        try {
            // 2. Consultar API
            const response = await fetch(`/api/dentalrecords/patient?patient_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            const records = result.data || [];

            // 3. Renderizar Historial
            if (records.length === 0) {
                historyList.innerHTML = `
                    <div style="text-align:center; padding: 2rem; color: #6B7280;">
                        <p>No hay registros clínicos para este paciente.</p>
                        <button class="btn-primary" style="margin-top: 1rem;" onclick="createRecord(${id})">
                            Crear Primer Registro
                        </button>
                    </div>
                `;
                return;
            }

            // Generar HTML de las tarjetas
            historyList.innerHTML = records.map(rec => {
                const date = new Date(rec.created_at).toLocaleDateString('es-MX', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                });
                
                // Traducción de tipos
                const types = {
                    'general': 'Consulta General', 'diagnosis': 'Diagnóstico', 
                    'procedure': 'Procedimiento', 'orthodontics': 'Ortodoncia'
                };
                const typeName = types[rec.record_type] || rec.record_type;

                return `
                    <div class="history-card">
                        <div class="history-header">
                            <span class="history-date">${date}</span>
                            <span class="history-type">${typeName}</span>
                        </div>
                        <div style="margin-bottom: 0.5rem;">
                            <strong>Asunto:</strong> ${rec.description}
                        </div>
                        <div style="color: #4B5563; font-size: 0.95rem; margin-bottom: 0.5rem; white-space: pre-line;">
                            ${rec.diagnosis || 'Sin diagnóstico detallado.'}
                        </div>
                        
                        ${rec.treatment_cost > 0 ? `
                            <div style="border-top: 1px solid #F3F4F6; padding-top: 0.5rem; margin-top: 0.5rem; font-size: 0.9rem; display: flex; justify-content: space-between;">
                                <span>Costo: $${rec.treatment_cost}</span>
                                <span style="font-weight: 600; color: ${rec.payment_status === 'paid' ? '#047857' : '#D97706'}">
                                    ${rec.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error(error);
            historyList.innerHTML = '<div style="color:red; text-align:center;">Error al cargar el historial.</div>';
        }
    };

    // Función global para cerrar modal
    window.closeHistoryModal = () => {
        historyModal.classList.remove('active');
    };

    // Cerrar al hacer clic fuera del contenido o en la X
    if(btnCloseModal) btnCloseModal.addEventListener('click', window.closeHistoryModal);
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) window.closeHistoryModal();
    });

    // --- OTRAS ACCIONES GLOBALES ---

    // Redirigir a crear nuevo registro (Pre-seleccionando paciente)
    window.createRecord = (id) => {
        window.location.href = `/dental-records/new?patient_id=${id}`;
    };

    window.deletePatient = async (id) => {
        if (!confirm(`¿Eliminar paciente ID ${id}?`)) return;
        try {
            const res = await fetch(`/api/patients/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showAlert('Paciente eliminado', 'success');
                loadPatients(searchInput.value);
            } else throw new Error();
        } catch (e) { showAlert('Error al eliminar', 'error'); }
    };

    // --- EVENTOS BÚSQUEDA ---
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => loadPatients(e.target.value), 500);
    });

    btnRefresh.addEventListener('click', () => {
        searchInput.value = '';
        loadPatients();
    });

    btnNewPatient.addEventListener('click', () => window.location.href = '/patients/new');

    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = `alert alert-${type}`;
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 3000);
    }

    // Iniciar
    loadPatients();
});