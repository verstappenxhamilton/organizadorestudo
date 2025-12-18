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
    <div className="fixed bottom-4 right-4 md:static md:bottom-auto md:right-auto z-50 animate-enter">
        <div className="bg-slate-800 border border-slate-700 shadow-xl md:shadow-none rounded-full md:rounded-lg py-2 px-4 flex items-center gap-3 md:gap-4 transition-all hover:bg-slate-750">
            {/* Mobile: Just Icon + Time? Desktop: Full info */}

            {/* Info Section (Clickable to open modal) */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={handleOpenModal}
            >
                <div className={`p-1.5 rounded-full ${timerState.isRunning ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'}`}>
                    <Clock size={16} />
                </div>

                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                    <span className="text-white font-mono font-bold tracking-widest text-sm md:text-base">
                        {formatTime(elapsedSeconds)}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 max-w-[100px] md:max-w-[150px] truncate hidden xs:block">
                        {subject ? subject.name : 'Matéria'}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
                {timerState.isRunning ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); pauseTimer(); }}
                        className="p-1.5 rounded-full hover:bg-slate-700 text-amber-400 transition-colors"
                        title="Pausar"
                    >
                        <Pause size={16} fill="currentColor" />
                    </button>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); resumeTimer(); }}
                        className="p-1.5 rounded-full hover:bg-slate-700 text-emerald-400 transition-colors"
                        title="Continuar"
                    >
                        <Play size={16} fill="currentColor" />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};
