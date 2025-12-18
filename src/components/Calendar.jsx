import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Calendar as CalendarIcon, BookOpen } from 'lucide-react';

export const Calendar = ({
  studySessions,
  syllabusItems,
  subjects = [],
  onDateClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // CSS Styles - Redesigned
  const calendarStyles = `
    .calendar-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 10px;
    }

    /* Main Calendar Card */
    .calendar-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }

    /* Header */
    .cal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .cal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cal-nav {
      display: flex;
      gap: 8px;
      background: rgba(15, 23, 42, 0.4);
      padding: 4px;
      border-radius: 8px;
    }

    .nav-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.1); color: white; }

    /* Grid */
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .day-label {
      text-align: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .day-cell {
      aspect-ratio: 1; /* Square cells */
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
      border: 1px solid transparent;
      cursor: pointer;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .day-cell:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-2px);
    }

    .day-cell.selected {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .day-num {
      font-size: 0.9rem;
      font-weight: 500;
      color: #cbd5e1;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-bottom: 4px;
    }

    .day-cell.today .day-num {
      background: #3b82f6;
      color: white;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }

    /* Indicators */
    .indicators {
      display: flex;
      gap: 3px;
      margin-top: auto;
      width: 100%;
      justify-content: center;
    }

    .pill {
      height: 4px;
      width: 4px;
      border-radius: 2px;
      transition: width 0.2s;
    }
    .day-cell:hover .pill { width: 12px; } /* Expand on hover */

    .pill.study { background: #10b981; box-shadow: 0 0 4px rgba(16, 185, 129, 0.4); }
    .pill.review { background: #f59e0b; box-shadow: 0 0 4px rgba(245, 158, 11, 0.4); }

    /* Agenda Panel */
    .agenda-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 20px;
      animation: fadeIn 0.3s ease-out;
    }

    .agenda-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 12px;
    }

    .agenda-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .agenda-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .agenda-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255,255,255,0.03);
      transition: transform 0.2s;
    }
    .agenda-item:hover { transform: translateX(4px); background: rgba(15, 23, 42, 0.6); }

    .item-icon {
      padding: 8px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    .item-icon.study { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .item-icon.review { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

    .item-content { flex: 1; }
    .item-title { color: #e2e8f0; font-weight: 500; font-size: 0.9rem; margin-bottom: 2px; }
    .item-meta { color: #94a3b8; font-size: 0.75rem; }

    /* Mobile */
    @media (max-width: 640px) {
      .calendar-wrapper { 
        gap: 12px;
        width: 100%;
        margin: 0;
      } 
      .calendar-card, .agenda-card {
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        padding: 16px;
      }
      .cal-title { font-size: 1.1rem; }
      .day-num { width: 24px; height: 24px; font-size: 0.85rem; }
      .day-cell { padding: 4px; border-radius: 8px; }
      .pill { width: 3px; height: 3px; }

      .cal-nav { padding: 2px; }
      .nav-btn { padding: 4px; }
    }
  `;

  // First day of month and days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDateInfo = (day, m = month, y = year) => {
    const dateStr = new Date(y, m, day).toISOString().split('T')[0];
    const sessionsOnDate = studySessions.filter(s => s.date === dateStr);
    const reviewsOnDate = syllabusItems.filter(i => i.nextReviewDate === dateStr);

    return {
      dateStr,
      hasSessions: sessionsOnDate.length > 0,
      hasReviews: reviewsOnDate.length > 0,
      sessions: sessionsOnDate,
      reviews: reviewsOnDate
    };
  };

  const isToday = (day) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const handleDayClick = (day, info) => {
    // If clicking the same day, toggle off? No, always show info.
    const date = new Date(year, month, day);
    setSelectedDayInfo({ day, date, ...info });
    if (onDateClick) onDateClick(date);
  };

  // Generate days array
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Default to today if no day selected, or list upcoming events if strictly required?
  // Let's default to "Today" info if nothing selected initially, OR just empty. 
  // Better: Show "Today's Agenda" by default on load.
  if (!selectedDayInfo && isToday(today.getDate()) && month === today.getMonth()) {
    // Initial state setup could be done in useEffect, but for render render:
    // We'll leave it null to show "Select a day" or "Upcoming".
  }

  // Helper to render agenda items
  const renderAgenda = () => {
    const targetInfo = selectedDayInfo || getDateInfo(today.getDate(), today.getMonth(), today.getFullYear());
    const displayDate = selectedDayInfo ? selectedDayInfo.date : today;
    const isTodayView = !selectedDayInfo || (selectedDayInfo.day === today.getDate() && month === today.getMonth());

    const title = isTodayView ? "Agenda de Hoje" : `Agenda de ${displayDate.getDate()} de ${monthNames[displayDate.getMonth()]}`;
    const sessions = targetInfo.sessions;
    const reviews = targetInfo.reviews;

    if (sessions.length === 0 && reviews.length === 0) {
      return (
        <div className="agenda-card">
          <div className="agenda-header">
            <h3 className="agenda-title">{title}</h3>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
            <BookOpen size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <p>Nenhuma atividade registrada.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="agenda-card">
        <div className="agenda-header">
          <h3 className="agenda-title">{title}</h3>
        </div>
        <div className="agenda-list">
          {sessions.map((s, i) => {
            const subject = subjects?.find(sub => sub.id === s.subjectId);
            const topic = syllabusItems?.find(item => item.id === s.syllabusItemId);

            return (
              <div key={`s-${i}`} className="agenda-item">
                <div className="item-icon study"><CheckCircle2 size={18} /></div>
                <div className="item-content">
                  <div className="item-title">
                    {subject?.name || 'Matéria'} • {topic?.name || 'Tópico'}
                  </div>
                  <div className="item-meta">
                    {(s.duration / 60).toFixed(1)}h de estudo • {Number.isFinite(s.accuracy) ? `${s.accuracy}%` : '-'} acertos
                  </div>
                </div>
              </div>
            );
          })}
          {reviews.map((r, i) => {
            const subject = subjects?.find(s => s.id === r.subjectId);
            return (
              <div key={`r-${i}`} className="agenda-item">
                <div className="item-icon review"><Clock size={18} /></div>
                <div className="item-content">
                  <div className="item-title">{r.name}</div>
                  <div className="item-meta">
                    {subject ? `${subject.name} • ` : ''}Revisão Agendada
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-wrapper">
      <style>{calendarStyles}</style>

      {/* Calendar Grid Card */}
      <div className="calendar-card">
        <div className="cal-header">
          <div className="cal-title">
            <span style={{ textTransform: 'capitalize' }}>{monthNames[month]}</span>
            <span style={{ color: '#3b82f6' }}>{year}</span>
          </div>

          <div className="cal-nav">
            <button className="nav-btn" onClick={goToPreviousMonth}><ChevronLeft size={20} /></button>
            <button className="nav-btn" onClick={goToNextMonth}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="cal-grid">
          {dayNames.map(d => <div key={d} className="day-label">{d}</div>)}

          {days.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} />;

            const info = getDateInfo(day);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDayInfo?.day === day && selectedDayInfo?.dateStr === info.dateStr;

            return (
              <div
                key={`day-${day}`}
                className={`day-cell ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDayClick(day, info)}
              >
                <span className="day-num">{day}</span>
                <div className="indicators">
                  {info.hasSessions && <div className="pill study" />}
                  {info.hasReviews && <div className="pill review" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda/Details Card */}
      {renderAgenda()}
    </div>
  );
};

