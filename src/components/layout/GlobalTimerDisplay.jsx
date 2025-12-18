import React from 'react';
import { useStudyContext } from '../../context/StudyContext';
import { Play, Pause, StopCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GlobalTimerDisplay = () => {
  const {
    timerState,
    elapsedSeconds,
    pauseTimer,
    resumeTimer,
    activeSubjects,
    syllabusItems
  } = useStudyContext();

  const navigate = useNavigate();

  // Only show if there is accumulated time or it is running
  if (!timerState.subjectId && timerState.accumulatedTime === 0 && !timerState.isRunning) {
    return null;
  }

  const subject = activeSubjects.find(s => s.id === timerState.subjectId);
  const topic = syllabusItems.find(t => t.id === timerState.topicId);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenModal = () => {
     if (subject) {
        // Use navigation to open modal in Subjects page
        navigate('/subjects', {
            state: {
                openSessionModal: true,
                initialData: {
                    subjectId: subject.id,
                    syllabusItemId: timerState.topicId
                }
            }
        });
     }
  };

  return (
    <div className="md:static md:bottom-auto md:right-auto z-50 animate-enter">
        <div className="bg-slate-900 md:bg-slate-800 border border-slate-700 shadow-xl md:shadow-none rounded-full md:rounded-lg py-1.5 px-3 md:py-2 md:px-4 flex items-center gap-2 md:gap-4 transition-all hover:bg-slate-750">
            {/* Mobile: Compact. Desktop: Full info */}

            {/* Info Section (Clickable to open modal) */}
            <div
              className="flex items-center gap-2 md:gap-3 cursor-pointer group"
              onClick={handleOpenModal}
            >
                <div className={`p-1 md:p-1.5 rounded-full ${timerState.isRunning ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'}`}>
                    <Clock size={14} className="md:w-4 md:h-4" />
                </div>

                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                    <span className="text-white font-sans font-bold tracking-wider text-xs md:text-base tabular-nums">
                        {formatTime(elapsedSeconds)}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 max-w-[80px] md:max-w-[150px] truncate">
                        {subject ? subject.name : 'Matéria'}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 border-l border-slate-700 pl-2 md:pl-3">
                {timerState.isRunning ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); pauseTimer(); }}
                        className="p-1 md:p-1.5 rounded-full hover:bg-slate-700 text-amber-400 transition-colors"
                        title="Pausar"
                    >
                        <Pause size={14} className="md:w-4 md:h-4" fill="currentColor" />
                    </button>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); resumeTimer(); }}
                        className="p-1 md:p-1.5 rounded-full hover:bg-slate-700 text-emerald-400 transition-colors"
                        title="Continuar"
                    >
                        <Play size={14} className="md:w-4 md:h-4" fill="currentColor" />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};
