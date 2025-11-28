// Componente de layout principal
// Envuelve todas las páginas protegidas con el navbar y el área de contenido
import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <div className="main-wrapper">
        {/* Barra de navegación superior */}
        <TopNavbar />
        
        {/* Área principal donde se renderizan las páginas */}
        {/* el outlet renderiza el componente hijo según la ruta actual */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
