document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificación de Seguridad
    const token = localStorage.getItem('token');
    if (!token) return; // Layout.js redirigirá si falla

    // 2. Referencias DOM
    const tableBody = document.getElementById('appointments-body');
    const emptyState = document.getElementById('empty-state');
    const alertBox = document.getElementById('dashboard-alert');
    const filterDate = document.getElementById('filter-date');
    const filterSearch = document.getElementById('filter-search');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnNewAppointment = document.getElementById('btn-new-appointment');

    let allAppointments = [];

    // --- CARGA DE DATOS ---
    async function loadAppointments(date = null) {
        try {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #6B7280;">Cargando datos...</td></tr>';

            let url = '/api/appointments';
            if (date) url = `/api/appointments/date?date=${date}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al obtener citas');

            const result = await response.json();
            allAppointments = result.data || [];
            renderTable(allAppointments);

        } catch (error) {
            console.error(error);
            showAlert('Error al conectar con el servidor', 'error');
            tableBody.innerHTML = '';
        }
    }

    // --- RENDERIZADO (CON SELECT DE ESTADO) ---
    function renderTable(appointments) {
        tableBody.innerHTML = '';
        
        // Filtrado Local
        const searchTerm = filterSearch.value.toLowerCase().trim();
        const filtered = appointments.filter(app => {
            const pName = app.patient_info 
                ? `${app.patient_info.first_name} ${app.patient_info.last_name}`.toLowerCase() 
                : '';
            return pName.includes(searchTerm);
        });

        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        filtered.forEach(app => {
            // Fecha formato local
            const dateObj = new Date(app.appointment_date);
            const dateStr = dateObj.toLocaleDateString('es-MX', { timeZone: 'UTC' });
            
            const pName = app.patient_info 
                ? `${app.patient_info.first_name} ${app.patient_info.last_name}` 
                : '<span style="color:red">Sin Paciente</span>';

            // Determinar clase de color según el estado actual
            const currentStatus = app.status || 'scheduled';
            const statusClass = `status-${currentStatus}`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${app.appointment_time}</td>
                <td><strong>${pName}</strong></td>
                <td>${app.type || 'General'}</td>
                <td>
                    <select 
                        class="status-select ${statusClass}" 
                        onchange="changeStatus(${app.id}, this)"
                    >
                        <option value="scheduled" ${currentStatus === 'scheduled' ? 'selected' : ''}>Programada</option>
                        <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completada</option>
                        <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="action-btn btn-edit" onclick="editAppointment(${app.id})">Editar</button>
                    <button class="action-btn btn-delete" style="margin-right:0;" onclick="deleteAppointment(${app.id})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- ACCIONES GLOBALES (Expuestas a window) ---

    /**
     * CAMBIAR ESTADO DE CITA (CD-0007-001)
     * Se dispara al cambiar el select en la tabla
     */
    window.changeStatus = async (id, selectElement) => {
        const newStatus = selectElement.value;
        const originalStatus = selectElement.getAttribute('data-prev') || 'scheduled'; // Fallback visual

        // Feedback visual inmediato: Cambiar color del select
        selectElement.className = `status-select status-${newStatus}`;
        selectElement.disabled = true; // Bloquear mientras guarda

        try {
            const response = await fetch(`/api/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Error al actualizar');

            showAlert(`Estado actualizado a: ${translateStatus(newStatus)}`, 'success');
            
            // Actualizar dato en memoria local para filtros sin recargar
            const appIndex = allAppointments.findIndex(a => a.id === id);
            if (appIndex !== -1) allAppointments[appIndex].status = newStatus;

        } catch (error) {
            console.error(error);
            showAlert('No se pudo cambiar el estado', 'error');
            // Revertir visualmente si falla
            selectElement.value = originalStatus; // (Necesitaríamos guardar el previo, simplificado aquí recargando)
            loadAppointments(filterDate.value); // Recarga segura
        } finally {
            selectElement.disabled = false;
        }
    };

    window.deleteAppointment = async (id) => {
        if (!confirm('¿Eliminar esta cita permanentemente?')) return;
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showAlert('Cita eliminada', 'success');
                loadAppointments(filterDate.value);
            } else throw new Error();
        } catch (e) { showAlert('Error al eliminar', 'error'); }
    };

    window.editAppointment = (id) => alert(`Editar cita ${id}: Próximamente`);

    // --- EVENT LISTENERS ---
    if(filterDate) filterDate.addEventListener('change', (e) => loadAppointments(e.target.value));
    if(filterSearch) filterSearch.addEventListener('keyup', () => renderTable(allAppointments));
    
    if(btnRefresh) btnRefresh.addEventListener('click', () => {
        filterDate.value = '';
        filterSearch.value = '';
        loadAppointments();
    });

    if(btnNewAppointment) btnNewAppointment.addEventListener('click', () => {
        window.location.href = '/appointments/new'; 
    });

    // --- UTILIDADES ---
    function translateStatus(status) {
        const dict = { 'scheduled': 'Programada', 'completed': 'Completada', 'cancelled': 'Cancelada' };
        return dict[status] || status;
    }

    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = `alert alert-${type}`;
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 3000);
    }

    // Inicializar
    loadAppointments();
});