import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarView.css';

const CalendarView = ({ appointments, selectedDate, onDateSelect, onAppointmentClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior para completar la primera semana
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }
    
    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    // Normalizar la fecha del calendario a YYYY-MM-DD UTC
    const calendarYear = date.getUTCFullYear();
    const calendarMonth = date.getUTCMonth();
    const calendarDay = date.getUTCDate();

    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      // Normalizar la fecha de la cita a YYYY-MM-DD UTC
      const aptYear = aptDate.getUTCFullYear();
      const aptMonth = aptDate.getUTCMonth();
      const aptDay = aptDate.getUTCDate();
      
      return calendarYear === aptYear &&
             calendarMonth === aptMonth &&
             calendarDay === aptDay;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(today);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-btn">
          <ChevronLeft size={20} />
        </button>
        <div className="calendar-month-year">
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <button onClick={goToToday} className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
            Hoy
          </button>
        </div>
        <button onClick={goToNextMonth} className="calendar-nav-btn">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date);
            const today = isToday(day.date);
            const selected = isSelected(day.date);
            
            return (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${today ? 'today' : ''} ${selected ? 'selected' : ''}`}
                onClick={() => onDateSelect(day.date)}
              >
                <div className="calendar-day-number">{day.date.getDate()}</div>
                <div className="calendar-day-appointments">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      className={`calendar-appointment ${apt.status}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt.id);
                      }}
                      title={`${apt.appointment_time} - ${apt.patient_info?.name || 'Paciente'}`}
                    >
                      {apt.appointment_time} - {apt.patient_info?.name?.split(' ')[0] || 'Paciente'}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="calendar-more-appointments">
                      +{dayAppointments.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

