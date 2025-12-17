import React from 'react';
import { useStudyContext } from '../../context/StudyContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer = () => {
  const { toast } = useStudyContext();

  if (!toast.isVisible) return null;

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-slate-900 border-emerald-500/20',
    error: 'bg-slate-900 border-red-500/20',
    info: 'bg-slate-900 border-blue-500/20'
  };

  return (
    <div className="fixed top-24 right-6 z-50 animate-enter">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md
        ${bgColors[toast.type] || bgColors.info}
      `}>
        {icons[toast.type] || icons.info}
        <span className="text-white text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};
