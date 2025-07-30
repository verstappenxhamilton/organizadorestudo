import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const Calendar = ({ 
  studySessions, 
  syllabusItems,
  onDateClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primeiro dia do mês e quantos dias tem o mês
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Verificar se há sessões ou revisões em uma data
  const getDateInfo = (day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    
    const sessionsOnDate = studySessions.filter(session => 
      session.date === dateStr
    );

    const reviewsOnDate = syllabusItems.filter(item => 
      item.nextReviewDate === dateStr
    );

    return {
      hasSessions: sessionsOnDate.length > 0,
      hasReviews: reviewsOnDate.length > 0,
      sessionsCount: sessionsOnDate.length,
      reviewsCount: reviewsOnDate.length,
      totalHours: sessionsOnDate.reduce((total, session) => total + (session.duration || 0), 0) / 60
    };
  };

  // Verificar se é hoje
  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  // Gerar array de dias
  const days = [];
  
  // Dias vazios do início
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon size={16} />
          <span>Calendário de Estudos</span>
        </div>
        
        <div className="calendar-navigation">
          <button 
            className="calendar-nav-btn"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="calendar-month-year">
            {monthNames[month]} {year}
          </span>
          
          <button 
            className="calendar-nav-btn"
            onClick={goToNextMonth}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {/* Cabeçalho dos dias da semana */}
        {dayNames.map(dayName => (
          <div key={dayName} className="calendar-day-header">
            {dayName}
          </div>
        ))}

        {/* Dias do mês */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day-empty" />;
          }

          const dateInfo = getDateInfo(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={`day-${day}-${month}-${year}`}
              className={`calendar-day ${isCurrentDay ? 'today' : ''} ${
                dateInfo.hasSessions || dateInfo.hasReviews ? 'has-events' : ''
              }`}
              onClick={() => onDateClick && onDateClick(new Date(year, month, day))}
            >
              <span className="calendar-day-number">{day}</span>
              
              {/* Indicadores */}
              <div className="calendar-day-indicators">
                {dateInfo.hasSessions && (
                  <div 
                    className="calendar-indicator study"
                    title={`${dateInfo.sessionsCount} sessão(ões) - ${dateInfo.totalHours.toFixed(1)}h`}
                  >
                    {dateInfo.sessionsCount}
                  </div>
                )}
                {dateInfo.hasReviews && (
                  <div 
                    className="calendar-indicator review"
                    title={`${dateInfo.reviewsCount} revisão(ões) agendada(s)`}
                  >
                    R
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color study"></div>
          <span>Sessões de Estudo</span>
        </div>
        <div className="legend-item">
          <div className="legend-color review"></div>
          <span>Revisões Agendadas</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Hoje</span>
        </div>
      </div>
    </div>
  );
};
