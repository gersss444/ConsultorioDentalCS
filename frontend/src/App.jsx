// Componente principal de la aplicación
// Define todas las rutas y la estructura de navegación
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Users from './pages/Users';
import DentalRecords from './pages/DentalRecords';
import './App.css';

function App() {
  return (
    // Provider de autenticación que envuelve toda la aplicación
    <AuthProvider>
      <ToastProvider>
      {/* Router principal para manejar la navegación */}
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas: login y registro */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas: requieren autenticación */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirige a dashboard por defecto */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Rutas principales del sistema */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="dental-records" element={<DentalRecords />} />
            
            {/* Rutas con permisos especiales */}
            {/* Solo usuarios con permiso de inventario pueden acceder */}
            <Route 
              path="inventory" 
              element={
                <ProtectedRoute requiredPermission="canManageInventory">
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            
            {/* Solo administradores pueden acceder a usuarios */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute requiredPermission="canManageUsers">
                  <Users />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
