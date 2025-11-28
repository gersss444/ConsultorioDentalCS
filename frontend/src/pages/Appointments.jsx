import { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, CheckCircle, List, Calendar, Clock } from 'lucide-react';
import AppointmentModal from '../components/modals/AppointmentModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CalendarView from '../components/appointments/CalendarView';
import DayView from '../components/appointments/DayView';
import './PageStyles.css';

const Appointments = () => {
  const { checkPermission } = useAuth();
  const { showToast } = useToast();
  const { dialog, showConfirm, closeDialog, handleConfirm } = useConfirmDialog();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'calendar', 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allAppointments, setAllAppointments] = useState([]);

  useEffect(() => {
    if (view === 'list') {
      loadAppointments();
    } else {
      loadAllAppointments();
    }
  }, [page, view]);

  const loadAllAppointments = async () => {
    try {
      setLoading(true);
      // Cargar todas las citas haciendo múltiples llamadas si es necesario
      let allAppointmentsData = [];
      let page = 1;
      let hasMore = true;
      const limit = 100;
      
      while (hasMore) {
        const response = await appointmentService.getAll(page, limit);
        const appointments = response.data || [];
        allAppointmentsData = [...allAppointmentsData, ...appointments];
        
        const total = response.pagination?.total || 0;
        if (appointments.length < limit || page * limit >= total) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      setAllAppointments(allAppointmentsData);
      setError('');
    } catch (err) {
      setError('Error al cargar citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAll(page, limit);
      setAppointments(response.data || []);
      setTotal(response.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError('Error al cargar citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentService.updateStatus(id, 'completed');
      showToast(`Cita #${id} marcada como completada`, 'success');
      setError('');
      if (view === 'list') {
        loadAppointments();
      } else {
        loadAllAppointments();
      }
    } catch (err) {
      showToast('Error al completar cita', 'error');
      setError('Error al completar cita');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const appointment = appointments.find(a => a.id === id);
    const appointmentInfo = appointment 
      ? `la cita del ${appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('es-ES') : 'fecha'} con ${appointment.patient_info?.name || 'el paciente'}`
      : 'esta cita';
    
    const confirmed = await showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar ${appointmentInfo}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      await appointmentService.delete(id);
      showToast(`Cita #${id} eliminada con éxito`, 'success');
      setError('');
      loadAppointments();
    } catch (err) {
      showToast('Error al eliminar cita', 'error');
      setError('Error al eliminar cita');
      console.error(err);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { color: '#374151', bg: '#f3f4f6', label: 'Programada' },
      completed: { color: '#111827', bg: '#e5e7eb', label: 'Completada' },
      cancelled: { color: '#6b7280', bg: '#f9fafb', label: 'Cancelada' },
      rescheduled: { color: '#4b5563', bg: '#f3f4f6', label: 'Reprogramada' },
    };
    return configs[status] || configs.scheduled;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Citas</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingAppointmentId(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          Nueva Cita
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          className={view === 'list' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setView('list')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <List size={16} />
          Lista
        </button>
        <button
          className={view === 'calendar' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setView('calendar')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <Calendar size={16} />
          Calendario
        </button>
        <button
          className={view === 'day' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setView('day')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <Clock size={16} />
          Día
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando citas...</div>
      ) : view === 'list' ? (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No hay citas registradas
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => {
                    const statusConfig = getStatusConfig(appointment.status);
                    return (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>
                          {appointment.appointment_date
                            ? new Date(appointment.appointment_date).toLocaleDateString('es-ES')
                            : '-'}
                        </td>
                        <td>{appointment.appointment_time || '-'}</td>
                        <td>
                          <div className="cell-name">
                            {appointment.patient_info?.name || `ID: ${appointment.patient_info?.id}`}
                          </div>
                        </td>
                        <td>{appointment.type || '-'}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {appointment.status !== 'completed' && (
                              <button 
                                className="btn-sm btn-success" 
                                title="Marcar como completada"
                                onClick={() => handleComplete(appointment.id)}
                                style={{ backgroundColor: '#10b981', color: 'white' }}
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button 
                              className="btn-sm btn-edit" 
                              title="Editar"
                              onClick={() => {
                                setEditingAppointmentId(appointment.id);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            {checkPermission('canDeleteAppointments') && (
                              <button
                                className="btn-sm btn-delete"
                                onClick={() => handleDelete(appointment.id)}
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-secondary"
              >
                Anterior
              </button>
              <span>
                Página {page} de {Math.ceil(total / limit)}
              </span>
              <button
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage(page + 1)}
                className="btn-secondary"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : view === 'calendar' ? (
        <CalendarView 
          appointments={allAppointments}
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setView('day');
          }}
          onAppointmentClick={(id) => {
            setEditingAppointmentId(id);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <DayView
          appointments={allAppointments}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAppointmentClick={(id) => {
            setEditingAppointmentId(id);
            setIsModalOpen(true);
          }}
          onComplete={handleComplete}
        />
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointmentId(null);
        }}
        appointmentId={editingAppointmentId}
        onSuccess={() => {
          loadAppointments();
          if (view !== 'list') {
            loadAllAppointments();
          }
        }}
      />
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </div>
  );
};

export default Appointments;
