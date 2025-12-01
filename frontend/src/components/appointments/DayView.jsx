import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Edit } from 'lucide-react';
import './DayView.css';

const DayView = ({ appointments, selectedDate, onDateChange, onAppointmentClick, onComplete }) => {
  const [dayAppointments, setDayAppointments] = useState([]);

  useEffect(() => {
    const selectedYear = selectedDate.getUTCFullYear();
    const selectedMonth = selectedDate.getUTCMonth();
    const selectedDay = selectedDate.getUTCDate();

    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const aptYear = aptDate.getUTCFullYear();
      const aptMonth = aptDate.getUTCMonth();
      const aptDay = aptDate.getUTCDate();

      return selectedYear === aptYear &&
             selectedMonth === aptMonth &&
             selectedDay === aptDay;
    });
    
    // Ordenar por hora
    filtered.sort((a, b) => {
      const timeA = a.appointment_time || '00:00';
      const timeB = b.appointment_time || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    setDayAppointments(filtered);
  }, [appointments, selectedDate]);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    // Para asegurar que la fecha se formatee en base a UTC para evitar desfases
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    return utcDate.toLocaleDateString('es-ES', options);
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

  // Generar horas del día (8:00 AM - 8:00 PM)
  const hours = [];
  for (let hour = 8; hour <= 20; hour++) {
    hours.push(hour);
  }

  const getAppointmentsForHour = (hour) => {
    return dayAppointments.filter(apt => {
      if (!apt.appointment_time) return false;
      const aptHour = parseInt(apt.appointment_time.split(':')[0]);
      return aptHour === hour;
    });
  };

  return (
    <div className="day-view">
      <div className="day-view-header">
        <button onClick={goToPreviousDay} className="day-nav-btn">
          <ChevronLeft size={20} />
        </button>
        <div className="day-view-date">
          <h2>{formatDate(selectedDate)}</h2>
          <button onClick={goToToday} className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
            Hoy
          </button>
        </div>
        <button onClick={goToNextDay} className="day-nav-btn">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="day-view-content">
        {dayAppointments.length === 0 ? (
          <div className="day-view-empty">
            <p>No hay citas programadas para este día</p>
          </div>
        ) : (
          <div className="day-view-hours">
            {hours.map(hour => {
              const hourAppointments = getAppointmentsForHour(hour);
              return (
                <div key={hour} className="day-view-hour-row">
                  <div className="day-view-hour-label">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="day-view-hour-appointments">
                    {hourAppointments.length === 0 ? (
                      <div className="day-view-hour-empty"></div>
                    ) : (
                      hourAppointments.map(apt => {
                        const statusConfig = getStatusConfig(apt.status);
                        return (
                          <div
                            key={apt.id}
                            className="day-view-appointment"
                            onClick={() => onAppointmentClick(apt.id)}
                          >
                            <div className="day-view-appointment-header">
                              <span className="day-view-appointment-time">{apt.appointment_time}</span>
                              <span
                                className="day-view-appointment-status"
                                style={{
                                  backgroundColor: statusConfig.bg,
                                  color: statusConfig.color,
                                }}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="day-view-appointment-patient">
                              {apt.patient_info?.name || `Paciente ID: ${apt.patient_info?.id}`}
                            </div>
                            {apt.type && (
                              <div className="day-view-appointment-type">{apt.type}</div>
                            )}
                            {apt.notes && (
                              <div className="day-view-appointment-notes">{apt.notes}</div>
                            )}
                            {apt.status !== 'completed' && (
                              <button
                                className="day-view-appointment-complete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onComplete(apt.id);
                                }}
                                title="Marcar como completada"
                              >
                                <CheckCircle size={16} />
                                Completar
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;


