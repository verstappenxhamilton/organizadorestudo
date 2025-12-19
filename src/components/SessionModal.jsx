import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { sanitizeMultilineText, sanitizeText } from "../utils/helpers";
import { Clock, Calendar, CheckCircle2, Target, BookOpen, FileText, CalendarDays, Timer, Play, Pause, Square } from "lucide-react";
import { useStudyContext } from "../context/StudyContext";

export const SessionModal = ({
  isOpen,
  onClose,
  editingSession,
  initialSessionData,
  currentSubjectForSession,
  subjects,
  syllabusItems,
  onSubmit,
  showToast,
}) => {
  const { timerState, elapsedSeconds, startTimer, pauseTimer, resumeTimer, stopTimer, discardTimer } = useStudyContext();

  const [formData, setFormData] = useState({
    subjectId: "",
    date: "",
    duration: 0,
    syllabusItemId: "",
    markTopicStudied: false,
    accuracy: "",
    notes: "",
    isReview: false,
    studyType: "theory", // theory, questions, legislation, review
    nextReviewDate: "",
    reviewDays: null,
    noNextReview: false,
  });

  // Derived state to check if global timer is active for this session
  const isGlobalTimerActive = timerState.isRunning || (timerState.accumulatedTime > 0 && !timerState.subjectId) || (timerState.subjectId === formData.subjectId);
  // Actually, simplest check: is there a timer running?
  // User Requirement: "que haja um pequeno Cronômetro que liberará tão logo o usuário sete ao menos uma materia"

  useEffect(() => {
    const defaultDate = new Date().toISOString().split("T")[0];

    if (editingSession) {
      setFormData({
        subjectId: editingSession.subjectId || "",
        date: editingSession.date || defaultDate,
        duration: editingSession.duration || 0,
        syllabusItemId: editingSession.syllabusItemId || "",
        markTopicStudied: false,
        accuracy: editingSession.accuracy || "",
        notes: editingSession.notes || "",
        isReview: editingSession.isReview || false,
        studyType: editingSession.studyType || "theory",
        nextReviewDate: editingSession.nextReviewDate || "",
        reviewDays: null,
        noNextReview: false,
      });
    } else {
      const prefilledTopicId = initialSessionData?.syllabusItemId || "";
      setFormData({
        subjectId:
          initialSessionData?.subjectId || currentSubjectForSession || "",
        date: defaultDate,
        duration: 0,
        syllabusItemId: prefilledTopicId,
        markTopicStudied: false,
        accuracy: "",
        notes: "",
        isReview: false,
        studyType: initialSessionData?.isReview ? "review" : "theory",
        nextReviewDate: "",
        reviewDays: null,
        noNextReview: false,
      });
    }
  }, [editingSession, initialSessionData, currentSubjectForSession, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subjectId) {
      showToast("Selecione uma matéria", "warning");
      return;
    }
    if (!formData.date) {
      showToast("Data é obrigatória", "warning");
      return;
    }
    // Calculate final duration: use Timer if active and valid, otherwise Form Data
    let finalDuration = Number(formData.duration) || 0;

    // If timer is running for this session, use its current value
    if (timerState.subjectId === formData.subjectId && (timerState.isRunning || timerState.accumulatedTime > 0)) {
        // Use the live accumulated time + current session time if running
        // We can get this by stopping the timer
        // But wait, stopTimer returns seconds.
        // We should stop it here to "commit" the time.
        const seconds = stopTimer();
        finalDuration = seconds / 60;
    }

    if (finalDuration <= 0) {
      showToast("Duração deve ser maior que zero", "warning");
      return;
    }

    const submissionData = {
      ...formData,
      date: sanitizeText(formData.date).slice(0, 20),
      duration: Math.max(0, Math.round(finalDuration)),
      accuracy:
        formData.accuracy === ""
          ? ""
          : Math.max(0, Math.min(100, Number(formData.accuracy) || 0)),
      notes: sanitizeMultilineText(formData.notes).slice(0, 2000),
      studyType: formData.studyType,
      nextReviewDate: sanitizeText(formData.nextReviewDate).slice(0, 20),
    };

    // Timer is already stopped above if it was running for this subject to get duration

    onSubmit(submissionData);
  };

  const handleStopTimerAndUse = () => {
     const seconds = stopTimer();
     setFormData(prev => ({ ...prev, duration: seconds / 60 }));
  };

  // Timer Controls logic for this modal
  const handleStartTimer = () => {
     if (!formData.subjectId) return;
     startTimer(formData.subjectId, formData.syllabusItemId || null);
  };

  const handlePauseTimer = () => {
     pauseTimer();
  };

  const isTimerForThisSession = timerState.subjectId === formData.subjectId;
  const showTimerControls = !!formData.subjectId;

  const currentDurationInMinutes = isTimerForThisSession && (timerState.isRunning || timerState.accumulatedTime > 0)
     ? (elapsedSeconds / 60)
     : (formData.duration / 60);

  if (!isOpen) return null;

  const relevantSyllabusItems = formData.subjectId
    ? syllabusItems.filter((item) => item.subjectId === formData.subjectId)
    : [];

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {editingSession ? "Editar Sessão" : "Registrar Sessão"}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="modal-content-scroll">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* SEÇÃO 1: O QUE FOI ESTUDADO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-2 mb-2">
                <BookOpen size={18} />
                <h3 className="font-semibold text-sm uppercase tracking-wide">O que foi estudado?</h3>
              </div>

              <div className="form-group">
                <label className="form-label text-sm text-gray-400 mb-1 block">
                  Matéria <span className="text-red-500">*</span>
                </label>
                <select
                  className="form-select w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                  value={formData.subjectId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subjectId: e.target.value,
                      syllabusItemId: "",
                      markTopicStudied: false,
                    }))
                  }
                  required
                >
                  <option value="">Selecione uma matéria...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-sm text-gray-400 mb-1 block">
                  Tópico do Edital
                </label>
                <select
                  className="form-select w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
                  value={formData.syllabusItemId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      syllabusItemId: e.target.value,
                      markTopicStudied: false,
                    }))
                  }
                  disabled={!formData.subjectId}
                >
                  <option value="">(Opcional) Selecione um tópico...</option>
                  {relevantSyllabusItems.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      className={item.isStudied ? "text-emerald-400 font-medium" : ""}
                    >
                       {item.name} {item.isStudied ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Type */}
              <div className="form-group">
                 <label className="form-label text-sm text-gray-400 mb-1 block">Tipo de Estudo</label>
                 <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'theory', label: 'Teoria' },
                      { id: 'questions', label: 'Questões' },
                      { id: 'legislation', label: 'Lei Seca' },
                    ].map(type => (
                       <button
                         key={type.id}
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, studyType: type.id }))}
                         className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all
                           ${formData.studyType === type.id
                             ? 'bg-blue-600 border-blue-500 text-white'
                             : 'bg-slate-800 border-slate-600 text-gray-400 hover:border-blue-500'
                           }
                         `}
                       >
                          {type.label}
                       </button>
                    ))}
                 </div>
              </div>

            </div>

            {/* SEÇÃO 2: TEMPO E DATA */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-500/20 pb-2 mb-2">
                    <Calendar size={18} />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">Quando?</h3>
                  </div>
                   <div className="form-group">
                    <input
                      type="date"
                      className="form-input w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, date: e.target.value }))
                      }
                      required
                    />
                    <label className="form-label text-sm text-gray-400 mt-1 block">
                      Data <span className="text-red-500">*</span>
                    </label>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 border-b border-amber-500/20 pb-2 mb-2">
                    <Clock size={18} />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">Duração</h3>
                  </div>

                  {/* Timer Integrated */}
                  <div className="flex flex-col gap-2">
                      <div className="form-group relative">
                        <input
                          type="number"
                          step="0.01"
                          className="form-input w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-amber-500 outline-none"
                          value={currentDurationInMinutes > 0 ? currentDurationInMinutes.toFixed(2) : ""}
                          onChange={(e) => {
                             // Only allow manual edit if timer is NOT running for this session
                             if (!isTimerForThisSession || (!timerState.isRunning && timerState.accumulatedTime === 0)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  duration: parseFloat(e.target.value) * 60 || 0,
                                }));
                             }
                          }}
                          readOnly={isTimerForThisSession && (timerState.isRunning || timerState.accumulatedTime > 0)}
                          min="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      {/* Controls (Moved below) */}
                      <div className="flex items-center gap-2">
                         {!isTimerForThisSession || !timerState.isRunning ? (
                             <button
                                type="button"
                                disabled={!showTimerControls || (timerState.isRunning && !isTimerForThisSession)}
                                onClick={handleStartTimer}
                                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white flex-1 flex items-center justify-center gap-2 text-sm font-semibold"
                             >
                                <Play size={16} /> Iniciar
                             </button>
                         ) : (
                             <button
                                type="button"
                                onClick={handlePauseTimer}
                                className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white flex-1 flex items-center justify-center gap-2 text-sm font-semibold"
                             >
                                <Pause size={16} /> Pausar
                             </button>
                         )}

                         {isTimerForThisSession && (timerState.accumulatedTime > 0 || timerState.isRunning) && (
                             <button
                                type="button"
                                onClick={handleStopTimerAndUse}
                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                                title="Parar e Usar Tempo"
                             >
                                <Square size={16} fill="currentColor" />
                             </button>
                         )}
                      </div>

                      {isTimerForThisSession && (
                          <div className="text-xs text-emerald-400 text-center animate-pulse">
                              {timerState.isRunning ? "Cronômetro ativo..." : (timerState.accumulatedTime > 0 ? "Cronômetro pausado" : "")}
                          </div>
                      )}
                  </div>
               </div>
            </div>

            {/* SEÇÃO 3: RESULTADO */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-violet-400 border-b border-violet-500/20 pb-2 mb-2">
                  <Target size={18} />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Desempenho</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.markTopicStudied ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-500'} ${!formData.syllabusItemId ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="mt-0.5">
                            <input
                              type="checkbox"
                              className="form-checkbox rounded text-emerald-500 bg-slate-700 border-slate-500 focus:ring-offset-0 focus:ring-emerald-500"
                              checked={formData.markTopicStudied}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  markTopicStudied: e.target.checked,
                                }))
                              }
                              disabled={!formData.syllabusItemId}
                            />
                        </div>
                        <div>
                           <span className={`block text-sm font-medium ${formData.markTopicStudied ? 'text-emerald-400' : 'text-gray-300'}`}>Concluir Tópico</span>
                           <span className="block text-xs text-gray-500">Marcar este item como estudado no edital</span>
                        </div>
                     </label>

                     <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.isReview ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                        <div className="mt-0.5">
                             <input
                              type="checkbox"
                              className="form-checkbox rounded text-blue-500 bg-slate-700 border-slate-500 focus:ring-offset-0 focus:ring-blue-500"
                              checked={formData.isReview}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  isReview: e.target.checked,
                                }))
                              }
                            />
                        </div>
                        <div>
                           <span className={`block text-sm font-medium ${formData.isReview ? 'text-blue-400' : 'text-gray-300'}`}>Apenas Revisão</span>
                           <span className="block text-xs text-gray-500">Não conta como primeiro estudo</span>
                        </div>
                     </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm text-gray-400 mb-1 block">
                      % de Acerto (Questões)
                    </label>
                    <div className="relative">
                        <input
                          type="number"
                          className="form-input w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-violet-500 outline-none pl-4"
                          value={formData.accuracy}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              accuracy: parseFloat(e.target.value) || "",
                            }))
                          }
                          min="0"
                          max="100"
                          placeholder="Ex: 85"
                        />
                        <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* SEÇÃO 4: PLANEJAMENTO */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 border-b border-indigo-500/20 pb-2 mb-2">
                  <CalendarDays size={18} />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Próxima Revisão</h3>
               </div>

               <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 3, 7, 15, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          const nextDate = new Date();
                          nextDate.setDate(nextDate.getDate() + days);
                          setFormData((prev) => ({
                            ...prev,
                            nextReviewDate: nextDate.toISOString().split("T")[0],
                            reviewDays: days,
                            noNextReview: false,
                          }));
                        }}
                        className={`
                          flex-1 min-w-[60px] py-2 rounded-lg text-xs font-semibold border transition-all
                          ${formData.reviewDays === days
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20"
                            : "bg-slate-800 border-slate-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400"
                          }
                        `}
                      >
                        +{days} dias
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                     {formData.nextReviewDate && !formData.noNextReview ? (
                        <div className="text-sm text-indigo-300 font-medium bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                          Agendada para: <span className="text-white ml-1">{new Date(formData.nextReviewDate).toLocaleDateString("pt-BR")}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic px-2">
                           Nenhuma data selecionada
                        </div>
                      )}

                      <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <input
                          type="checkbox"
                          className="form-checkbox rounded text-gray-500 bg-slate-700 border-slate-600 focus:ring-0"
                          checked={formData.noNextReview}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              noNextReview: e.target.checked,
                              nextReviewDate: e.target.checked ? "" : prev.nextReviewDate,
                              reviewDays: e.target.checked ? null : prev.reviewDays,
                            }))
                          }
                        />
                        <span className="text-xs font-medium text-gray-400">Não agendar</span>
                      </label>
                  </div>
               </div>
            </div>

            {/* SEÇÃO 5: OBSERVAÇÕES */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-gray-400 border-b border-gray-700 pb-2 mb-2">
                  <FileText size={18} />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Observações</h3>
               </div>
              <textarea
                className="form-textarea w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-gray-400 outline-none resize-none h-24 text-sm leading-relaxed"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Detalhes sobre o estudo, dificuldades, pontos de atenção..."
              />
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50 mt-2">
              <button
                type="button"
                className="btn btn-secondary px-6 py-2.5 rounded-lg text-sm font-medium"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-8 py-2.5 rounded-lg text-sm font-bold tracking-wide"
              >
                {editingSession ? "Salvar Alterações" : "Confirmar Sessão"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
