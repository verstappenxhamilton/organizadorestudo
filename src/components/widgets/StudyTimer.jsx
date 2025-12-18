import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Save, RotateCcw } from 'lucide-react';

export const StudyTimer = ({ initialDuration = 0, onSave, autoStart = false }) => {
  const [seconds, setSeconds] = useState(initialDuration);
  const [isActive, setIsActive] = useState(autoStart);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const toggle = () => setIsActive(!isActive);

  const reset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-4">
      <div className="text-4xl font-mono font-bold text-white tracking-widest tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="flex items-center gap-2 w-full">
        {!isActive ? (
          <button
            type="button"
            onClick={toggle}
            className="flex-1 btn bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg flex justify-center items-center gap-2 font-semibold"
          >
            <Play size={18} fill="currentColor" /> Iniciar
          </button>
        ) : (
          <button
            type="button"
            onClick={toggle}
            className="flex-1 btn bg-amber-500 hover:bg-amber-400 text-white p-2 rounded-lg flex justify-center items-center gap-2 font-semibold"
          >
            <Pause size={18} fill="currentColor" /> Pausar
          </button>
        )}

        <button
          type="button"
          onClick={reset}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700"
          title="Reiniciar"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="w-full pt-2 border-t border-slate-800">
         <button
            type="button"
            onClick={() => onSave(seconds)}
            className="w-full btn bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg flex justify-center items-center gap-2 font-semibold text-sm"
          >
            <Save size={16} /> Usar este tempo
          </button>
      </div>
    </div>
  );
};
