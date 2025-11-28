import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { inventoryService } from '../services/inventoryService';
import { dentalRecordService } from '../services/dentalRecordService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Users, Calendar, FileText, Package, TrendingUp, DollarSign, Activity, Plus, UserPlus } from 'lucide-react';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


// Muestra estadísticas generales del sistema y gráficas de datos
const Dashboard = () => {
  // Obtiene el usuario y función de verificación de permisos del contexto
  const { user, checkPermission } = useAuth();
  // Hook para navegar a otras páginas
  const navigate = useNavigate();
  
  // Total de cada entidad
  const [stats, setStats] = useState({
    patients: 0,      
    appointments: 0,  
    records: 0,       
    inventory: 0,     
  });
  // Estado de carga mientras se obtienen los datos
  const [loading, setLoading] = useState(true);
  // Estados p almacenar los datos necesarios para las gráficas
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [recordsData, setRecordsData] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);

  // Carga todos los datos necesarios cuando el componente se monta
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Carga todos los datos necesarios para el dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carga dee datos totales en paralelo para mejorar el rendimiento
      const [patientsRes, appointmentsRes, inventoryRes, recordsRes, allAppointmentsRes] = await Promise.all([
        patientService.getAll(1, 1),           
        appointmentService.getAll(1, 1),       
        inventoryService.getAll(1, 1),         
        dentalRecordService.getAll(),          
        appointmentService.getAll(1, 100),     
      ]);

      // Actualiza las estadísticas con los totales de cada entidad
      setStats({
        patients: patientsRes.pagination?.total || 0,
        appointments: appointmentsRes.pagination?.total || 0,
        inventory: inventoryRes.pagination?.total || 0,
        records: recordsRes.total || 0,
      });

      // Guarda los datos para usar en las gráficas
      setAppointmentsData(appointmentsRes.data || []);
      setRecordsData(recordsRes.data || []);
      setAllAppointments(allAppointmentsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcula y prepara los datos para la gráfica de citas mensuales
  // Cuenta las citas de los últimos 6 meses 
  const getMonthlyAppointments = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentDate = new Date();
    const last6Months = [];
    const data = new Array(6).fill(0);

    // Obtener últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(months[date.getMonth()]);
    }

    // Contar citas por mes 
    allAppointments.forEach(appointment => {
      if (appointment.appointment_date) {
        const appointmentDate = new Date(appointment.appointment_date);
        const monthsDiff = (currentDate.getFullYear() - appointmentDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - appointmentDate.getMonth());
        
        if (monthsDiff >= 0 && monthsDiff < 6) {
          const index = 5 - monthsDiff;
          if (index >= 0 && index < 6) {
            data[index]++;
          }
        }
      }
    });

    return {
      labels: last6Months,
      datasets: [
        {
          label: 'Citas',
          data: data,
          borderColor: '#4b5563',
          backgroundColor: 'rgba(75, 85, 99, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  };

  // Cuenta cuántas citas hay en cada estado (programadas, completadas, canceladas, reprogramadas)
  const getAppointmentsByStatus = () => {
    const statusCounts = {
      scheduled: allAppointments.filter(a => a.status === 'scheduled').length,
      completed: allAppointments.filter(a => a.status === 'completed').length,
      cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
      rescheduled: allAppointments.filter(a => a.status === 'rescheduled').length,
    };

    const labels = [];
    const data = [];
    const colors = [];

    if (statusCounts.scheduled > 0) {
      labels.push('Programadas');
      data.push(statusCounts.scheduled);
      colors.push('#6b7280');
    }
    if (statusCounts.completed > 0) {
      labels.push('Completadas');
      data.push(statusCounts.completed);
      colors.push('#9ca3af');
    }
    if (statusCounts.cancelled > 0) {
      labels.push('Canceladas');
      data.push(statusCounts.cancelled);
      colors.push('#d1d5db');
    }
    if (statusCounts.rescheduled > 0) {
      labels.push('Reprogramadas');
      data.push(statusCounts.rescheduled);
      colors.push('#e5e7eb');
    }

    return {
      labels: labels.length > 0 ? labels : ['Sin datos'],
      datasets: [
        {
          data: data.length > 0 ? data : [1],
          backgroundColor: colors.length > 0 ? colors : ['#f3f4f6'],
          borderWidth: 0,
        },
      ],
    };
  };

  // Calcula los ingresos mensuales desde los registros dentales
  // Suma el costo de los tratamientos pagados de los últimos 6 meses
  const getMonthlyRevenue = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentDate = new Date();
    const last6Months = [];
    const revenue = new Array(6).fill(0);

    // Obtener últimos 6 meses (del más antiguo al más reciente)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(months[date.getMonth()]);
    }

    // Calcular ingresos por mes desde registros con tratamiento pagado
    recordsData?.forEach((record) => {
      if (record.treatment_cost > 0 && record.payment_status === 'paid') {
        const recordDate = record.created_at ? new Date(record.created_at) : new Date();
        const monthsDiff = (currentDate.getFullYear() - recordDate.getFullYear()) * 12 +
                          (currentDate.getMonth() - recordDate.getMonth());

        if (monthsDiff >= 0 && monthsDiff < 6) {
          const index = 5 - monthsDiff;
          if (index >= 0 && index < 6) {
            revenue[index] += parseFloat(record.treatment_cost) || 0;
          }
        }
      }
    });

    return {
      labels: last6Months,
      datasets: [
        {
          label: 'Ingresos ($)',
          data: revenue,
          backgroundColor: '#9ca3af',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
          color: '#ffffff',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
          color: '#6b7280',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 12,
          usePointStyle: true,
          font: {
            size: 12,
            color: '#6b7280',
          },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        borderRadius: 8,
        bodyFont: {
          color: '#ffffff',
        },
      },
    },
  };

  // Define las tarjetas de estadísticas que se mostrarán
  const statCards = [
    {
      title: 'Pacientes',
      value: stats.patients,
      icon: Users,
    },
    {
      title: 'Citas',
      value: stats.appointments,
      icon: Calendar,
    },
    {
      title: 'Registros',
      value: stats.records,
      icon: FileText,
    },
    {
      title: 'Inventario',
      value: stats.inventory,
      icon: Package,
    },
  ];

  // Muestra un mensaje de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Bienvenido, {user?.name}</p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="quick-actions-section">
        <h2 className="section-title">Accesos Rápidos</h2>
        <div className="quick-actions-grid">
          {checkPermission('canManageAppointments') && (
            <button 
              className="quick-action-btn" 
              onClick={() => navigate('/appointments')}
            >
              <Calendar size={24} />
              <div className="quick-action-content">
                <span className="quick-action-title">Nueva Cita</span>
                <span className="quick-action-subtitle">Crear una nueva cita</span>
              </div>
              <Plus size={18} className="quick-action-icon" />
            </button>
          )}
          
          {checkPermission('canManagePatients') && (
            <button 
              className="quick-action-btn" 
              onClick={() => navigate('/patients')}
            >
              <UserPlus size={24} />
              <div className="quick-action-content">
                <span className="quick-action-title">Nuevo Paciente</span>
                <span className="quick-action-subtitle">Registrar un nuevo paciente</span>
              </div>
              <Plus size={18} className="quick-action-icon" />
            </button>
          )}
          
          {checkPermission('canManageDentalRecords') && (
            <button 
              className="quick-action-btn" 
              onClick={() => navigate('/dental-records')}
            >
              <FileText size={24} />
              <div className="quick-action-content">
                <span className="quick-action-title">Nuevo Registro</span>
                <span className="quick-action-subtitle">Crear registro dental</span>
              </div>
              <Plus size={18} className="quick-action-icon" />
            </button>
          )}
          
          {checkPermission('canManageInventory') && (
            <button 
              className="quick-action-btn" 
              onClick={() => navigate('/inventory')}
            >
              <Package size={24} />
              <div className="quick-action-content">
                <span className="quick-action-title">Nuevo Item</span>
                <span className="quick-action-subtitle">Agregar al inventario</span>
              </div>
              <Plus size={18} className="quick-action-icon" />
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{card.value.toLocaleString()}</h3>
                <p className="stat-title">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Citas Mensuales</h3>
            <TrendingUp size={20} className="chart-icon" />
          </div>
          <div className="chart-container">
            <Line data={getMonthlyAppointments()} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Estado de Citas</h3>
            <Activity size={20} className="chart-icon" />
          </div>
          <div className="chart-container-small">
            <Doughnut data={getAppointmentsByStatus()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <div className="chart-header">
          <h3>Ingresos Mensuales</h3>
          <DollarSign size={20} className="chart-icon" />
        </div>
        <div className="chart-container">
          <Bar data={getMonthlyRevenue()} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
