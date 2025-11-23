/**
 * Layout Component
 * Se encarga de renderizar la estructura común (Sidebar + Topbar)
 * y manejar la lógica de navegación y cierre de sesión global.
 */
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    
    // Validación de seguridad básica
    if (!localStorage.getItem('token') || !userStr) {
        window.location.href = '/login';
        return;
    }

    const user = JSON.parse(userStr);
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    // 1. Definir el HTML del Sidebar y Topbar
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="/dashboard" class="brand-logo">
                    <span>🦷</span> DentalSoft
                </a>
            </div>
            <nav class="sidebar-nav">
                <a href="/dashboard" class="nav-link" data-path="/dashboard">
                    <span class="nav-icon">📅</span> <span>Agenda</span>
                </a>
                <a href="/patients" class="nav-link" data-path="/patients">
                    <span class="nav-icon">👥</span> <span>Pacientes</span>
                </a>
                <a href="/users" class="nav-link" data-path="/users">
                    <span class="nav-icon">🛡️</span> <span>Usuarios</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <button id="global-logout-desktop" class="btn-secondary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                     Salir
                </button>
            </div>
        </aside>
    `;

    const topbarHTML = `
        <header class="top-bar">
            <div class="mobile-logo">DentalSoft</div>
            <div class="user-profile">
                <div class="user-details">
                    <div class="user-name">${user.name || 'Usuario'}</div>
                    <div class="user-role">${user.role || 'Rol'}</div>
                </div>
                <div class="user-avatar">${initial}</div>
                <button id="global-logout-mobile" class="btn-icon" style="width: 36px; height: 36px; border: none; background: transparent; color: #EF4444;" title="Salir">
                    Salir
                </button>
            </div>
        </header>
    `;

    // 2. Inyectar el Layout en el DOM
    // Buscamos el contenedor donde el programador puso el contenido específico de la vista
    const pageContent = document.getElementById('app-content');
    
    if (pageContent) {
        // Creamos la estructura envolvente
        const layoutWrapper = document.createElement('div');
        layoutWrapper.className = 'admin-layout';
        
        // Contenedor principal derecho
        const mainContent = document.createElement('main');
        mainContent.className = 'main-content';
        
        // Insertamos Topbar + El contenido original de la página
        mainContent.innerHTML = topbarHTML;
        
        // Movemos el contenido específico dentro de la estructura
        // (Usamos un wrapper para padding)
        const contentContainer = document.createElement('div');
        contentContainer.className = 'page-container';
        
        // Movemos los hijos del div original al nuevo contenedor
        while (pageContent.firstChild) {
            contentContainer.appendChild(pageContent.firstChild);
        }
        
        mainContent.appendChild(contentContainer);

        // Ensamblamos todo
        layoutWrapper.innerHTML = sidebarHTML; // Agrega el sidebar string
        layoutWrapper.appendChild(mainContent); // Agrega el contenido derecho

        // Reemplazamos el body o el contenedor raíz
        // Para evitar borrar scripts al final del body, insertamos al inicio
        document.body.insertBefore(layoutWrapper, document.body.firstChild);
        
        // Eliminamos el contenedor temporal viejo si quedó vacío
        pageContent.remove();
    }

    // 3. Marcar enlace activo según la URL
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
        // Si la URL empieza con el data-path (ej: /patients/new activa /patients)
        if (currentPath.startsWith(link.dataset.path)) {
            link.classList.add('active');
        }
    });

    // 4. Lógica Global de Logout
    const handleLogout = () => {
        if(confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    const btnDesktop = document.getElementById('global-logout-desktop');
    const btnMobile = document.getElementById('global-logout-mobile');
    
    if(btnDesktop) btnDesktop.addEventListener('click', handleLogout);
    if(btnMobile) btnMobile.addEventListener('click', handleLogout);
});