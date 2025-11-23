document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificación de Seguridad (Fail-safe)
    // Aunque layout.js ya valida, esto evita que se ejecuten scripts si no hay token
    const token = localStorage.getItem('token');
    if (!token) return;

    // 2. Referencias a elementos del DOM
    const tableBody = document.getElementById('appointments-body');
    const emptyState = document.getElementById('empty-state');
    const alertBox = document.getElementById('dashboard-alert');
    const filterDate = document.getElementById('filter-date');
    const filterSearch = document.getElementById('filter-search');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnNewAppointment = document.getElementById('btn-new-appointment');

    // Estado local para almacenar las citas y poder filtrar por texto sin recargar
    let allAppointments = [];

    // --- FUNCIONES PRINCIPALES ---

    /**
     * Carga las citas desde el servidor
     * @param {string|null} date - Fecha en formato YYYY-MM-DD para filtrar (opcional)
     */
    async function loadAppointments(date = null) {
        try {
            // Animación de carga visual (opcional, podrías poner un spinner aquí)
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Cargando datos...</td></tr>';

            let url = '/api/appointments';
            
            // Si hay fecha seleccionada, usamos el endpoint de filtrado por fecha
            if (date) {
                url = `/api/appointments/date?date=${date}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Si el token expiró, layout.js lo manejará, pero forzamos por si acaso
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Error al obtener la lista de citas');
            }

            const result = await response.json();
            allAppointments = result.data || [];
            
            // Renderizamos la tabla con los datos obtenidos
            renderTable(allAppointments);

        } catch (error) {
            console.error(error);
            showAlert('No se pudieron cargar las citas. Intente nuevamente.', 'error');
            tableBody.innerHTML = ''; // Limpiar mensaje de carga
        }
    }

    /**
     * Genera el HTML de la tabla basado en los datos
     * @param {Array} appointments - Lista de objetos cita
     */
    function renderTable(appointments) {
        tableBody.innerHTML = '';
        
        // 1. Filtrado local por texto (Búsqueda por nombre de paciente)
        const searchTerm = filterSearch.value.toLowerCase().trim();
        
        const filtered = appointments.filter(app => {
            // Construimos el nombre completo si existe la info del paciente
            const patientName = app.patient_info 
                ? `${app.patient_info.first_name} ${app.patient_info.last_name}`.toLowerCase() 
                : '';
            
            // Verificamos si el nombre incluye el término de búsqueda
            return patientName.includes(searchTerm);
        });

        // 2. Manejo de estado vacío
        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // 3. Generación de filas
        filtered.forEach(app => {
            // Formatear fecha (Ajuste simple de zona horaria para visualización correcta)
            const dateObj = new Date(app.appointment_date);
            // Usamos UTC para evitar que la fecha se atrase un día por la zona horaria local
            const dateStr = dateObj.toLocaleDateString('es-MX', { timeZone: 'UTC' });
            
            // Nombre del paciente o fallback
            const patientName = app.patient_info 
                ? `${app.patient_info.first_name} ${app.patient_info.last_name}` 
                : '<span style="color:red;">Sin Paciente</span>';

            // Clases y Textos de Estado
            const statusMap = {
                'scheduled': { text: 'Programada', class: 'status-scheduled' },
                'completed': { text: 'Completada', class: 'status-completed' },
                'cancelled': { text: 'Cancelada', class: 'status-cancelled' }
            };

            const statusInfo = statusMap[app.status] || { text: app.status, class: 'status-scheduled' };

            // Creación de la fila
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${app.appointment_time}</td>
                <td><strong>${patientName}</strong></td>
                <td>${app.type || 'Consulta General'}</td>
                <td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="action-btn btn-edit" onclick="editAppointment(${app.id})">
                        Editar
                    </button>
                    <button class="action-btn btn-delete" style="margin-right: 0;" onclick="deleteAppointment(${app.id})">
                        Eliminar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- ACCIONES GLOBALES (Expuestas a window para el onclick del HTML) ---

    /**
     * Eliminar una cita
     * @param {number} id - ID de la cita
     */
    window.deleteAppointment = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta cita permanentemente?')) return;

        try {
            const response = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                showAlert('Cita eliminada correctamente', 'success');
                // Recargar datos manteniendo el filtro de fecha actual si existe
                loadAppointments(filterDate.value || null);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            showAlert('Error al eliminar la cita: ' + error.message, 'error');
        }
    };

    /**
     * Redirigir a editar cita (Placeholder por ahora)
     * @param {number} id - ID de la cita
     */
    window.editAppointment = (id) => {
        // En el futuro, esto redirigirá a una vista de edición
        alert(`Funcionalidad de editar para ID ${id} en construcción.`);
        // window.location.href = `/appointments/edit/${id}`;
    };

    // --- EVENT LISTENERS ---

    // 1. Filtro de Fecha: Recarga datos desde la API
    if (filterDate) {
        filterDate.addEventListener('change', (e) => {
            loadAppointments(e.target.value);
        });
    }

    // 2. Filtro de Búsqueda: Filtra localmente los datos ya cargados
    if (filterSearch) {
        filterSearch.addEventListener('keyup', () => {
            renderTable(allAppointments);
        });
    }

    // 3. Botón Refrescar: Limpia filtros y recarga todo
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            filterDate.value = '';
            filterSearch.value = '';
            loadAppointments();
        });
    }

    // 4. Botón Nueva Cita: Redirige a la vista de creación
    if (btnNewAppointment) {
        btnNewAppointment.addEventListener('click', () => {
            // Esta ruta debe coincidir con la que crearemos próximamente
            window.location.href = '/appointments/new'; 
        });
    }

    // --- UTILIDADES ---

    /**
     * Muestra una alerta flotante
     * @param {string} msg - Mensaje a mostrar
     * @param {string} type - 'success' o 'error'
     */
    function showAlert(msg, type) {
        if (!alertBox) return;
        
        alertBox.textContent = msg;
        // Reseteamos clases y añadimos las nuevas
        alertBox.className = `alert alert-${type}`; 
        alertBox.classList.remove('hidden');
        
        // Ocultar automáticamente después de 3 segundos
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 3000);
    }

    // --- INICIALIZACIÓN ---
    // Cargar citas al abrir la página
    loadAppointments();
});