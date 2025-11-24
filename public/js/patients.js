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

    // Debounce para la búsqueda (evitar muchas peticiones al escribir rápido)
    let searchTimeout;

    // --- CARGA DE DATOS ---
    
    /**
     * Carga pacientes. Si hay término de búsqueda usa el endpoint de search,
     * si no, carga la lista general paginada.
     */
    async function loadPatients(searchTerm = '') {
        try {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #6B7280;">Cargando pacientes...</td></tr>';
            emptyState.classList.add('hidden');

            let url = '/api/patients?limit=50'; // Traemos 50 por defecto
            
            if (searchTerm) {
                // Usamos el endpoint de búsqueda definido en patient.js
                url = `/api/patients/search?q=${encodeURIComponent(searchTerm)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) throw new Error('Error al cargar la lista');

            const result = await response.json();
            const patients = result.data || [];
            
            renderTable(patients);

        } catch (error) {
            console.error(error);
            showAlert('Error al obtener pacientes', 'error');
            tableBody.innerHTML = '';
        }
    }

    // --- RENDERIZADO ---
    
    function renderTable(patients) {
        tableBody.innerHTML = '';

        if (patients.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        patients.forEach(p => {
            // Estado de Ortodoncia (si existe)
            let orthoBadge = '<span style="color: #9CA3AF; font-size: 0.8rem;">N/A</span>';
            if (p.orthodontics && p.orthodontics.status === 'active') {
                orthoBadge = '<span class="status-badge status-scheduled">Tratamiento Activo</span>';
            }

            // Fila
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
                    <button class="action-btn" title="Ver Historial" onclick="viewHistory(${p.id})">
                        📄
                    </button>
                    <button class="action-btn btn-edit" title="Editar" onclick="editPatient(${p.id})">
                        ✏️
                    </button>
                    <button class="action-btn btn-delete" style="margin-right: 0;" title="Eliminar" onclick="deletePatient(${p.id})">
                        🗑️
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- ACCIONES GLOBALES ---

    window.deletePatient = async (id) => {
        if (!confirm(`¿Estás seguro de eliminar al paciente ID ${id}? Esta acción no se puede deshacer.`)) return;

        try {
            const res = await fetch(`/api/patients/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                showAlert('Paciente eliminado correctamente', 'success');
                loadPatients(searchInput.value);
            } else {
                const data = await res.json();
                throw new Error(data.error || 'No se pudo eliminar');
            }
        } catch (e) {
            showAlert(e.message, 'error');
        }
    };

    window.editPatient = (id) => {
        // Futura implementación: redirigir a /patients/edit/:id
        alert(`Editar paciente ${id}: Próximamente`);
    };

    window.viewHistory = (id) => {
        // Futura implementación: Historial Dental
        alert(`Ver historial clínico de paciente ${id}: Próximamente`);
    };

    // --- EVENTOS ---

    // Búsqueda con "Debounce" (espera a que el usuario deje de escribir)
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadPatients(e.target.value);
        }, 500); // Espera 500ms antes de buscar
    });

    btnRefresh.addEventListener('click', () => {
        searchInput.value = '';
        loadPatients();
    });

    btnNewPatient.addEventListener('click', () => {
        window.location.href = '/patients/new';
    });

    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = `alert alert-${type}`;
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 3000);
    }

    // Inicializar
    loadPatients();
});