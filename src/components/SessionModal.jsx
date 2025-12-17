import React, { useState, useEffect } from "react";
import { sanitizeMultilineText, sanitizeText } from "../utils/helpers";

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
  const [formData, setFormData] = useState({
    subjectId: "",
    date: "",
    duration: 0,
    syllabusItemId: "",
    markTopicStudied: false,
    accuracy: "",
    notes: "",
    isReview: false,
    nextReviewDate: "",
    reviewDays: null,
    noNextReview: false,
  });

  useEffect(() => {
    // Reset or populate form data based on props
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
    if (formData.duration <= 0) {
      showToast("Duração deve ser maior que zero", "warning");
      return;
    }

    const submissionData = {
      ...formData,
      date: sanitizeText(formData.date).slice(0, 20),
      duration: Math.max(0, Math.round(Number(formData.duration) || 0)),
      accuracy:
        formData.accuracy === ""
          ? ""
          : Math.max(0, Math.min(100, Number(formData.accuracy) || 0)),
      notes: sanitizeMultilineText(formData.notes).slice(0, 2000),
      nextReviewDate: sanitizeText(formData.nextReviewDate).slice(0, 20),
    };

    onSubmit(submissionData);
  };

  if (!isOpen) return null;

  const relevantSyllabusItems = formData.subjectId
    ? syllabusItems.filter((item) => item.subjectId === formData.subjectId)
    : [];

  return (
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Subject Select */}
            <div className="form-group">
              <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                Matéria <span className="text-red-500">*</span>
              </label>
              <select
                className="form-select w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
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
                <option value="">Selecione uma matéria</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Input */}
              <div className="form-group">
                <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="form-input w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Duration Input */}
              <div className="form-group">
                <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                  Duração (h) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                  value={formData.duration > 0 ? formData.duration / 60 : ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: parseFloat(e.target.value) * 60 || 0,
                    }))
                  }
                  min="0.1"
                  placeholder="1.5"
                  required
                />
              </div>
            </div>

            {/* Syllabus Item Select */}
            <div className="form-group">
              <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                Tópico Estudado (opcional)
              </label>
              <select
                className="form-select w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
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
                <option value="">Selecione um tópico</option>
                {relevantSyllabusItems.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={item.isStudied ? { color: '#10b981', fontWeight: 'bold' } : {}}
                  >
                    {item.name} {item.isStudied ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            <label
              className={`flex items-center gap-2 cursor-pointer ${!formData.syllabusItemId ? "opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                className="form-checkbox rounded border-gray-600 text-emerald-500 bg-slate-800 focus:ring-offset-0 focus:ring-emerald-500"
                checked={formData.markTopicStudied}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    markTopicStudied: e.target.checked,
                  }))
                }
                disabled={!formData.syllabusItemId}
              />
              <span className="text-sm text-gray-300">
                Marcar tópico como concluído
              </span>
            </label>

            {/* Accuracy Input */}
            <div className="form-group">
              <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                % de Acerto (opcional)
              </label>
              <input
                type="number"
                className="form-input w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none"
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
            </div>

            {/* Review Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox rounded border-gray-600 text-blue-600 bg-slate-800 focus:ring-offset-0 focus:ring-blue-500"
                checked={formData.isReview}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isReview: e.target.checked,
                  }))
                }
              />
              <span className="text-sm text-gray-300">Foi apenas revisão?</span>
            </label>

            {/* Next Review Scheduler */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-3">
                Agendar Próxima Revisão
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
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
                      px-3 py-1 rounded-full text-xs font-medium border transition-colors
                      ${formData.reviewDays === days
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-800 border-slate-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400"
                      }
                    `}
                  >
                    {days}d
                  </button>
                ))}
              </div>

              {formData.nextReviewDate && !formData.noNextReview && (
                <div className="text-xs text-indigo-400 font-medium mb-2">
                  Agendada para:{" "}
                  {new Date(formData.nextReviewDate).toLocaleDateString(
                    "pt-BR",
                  )}
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox rounded border-gray-600 text-gray-500 bg-slate-800 focus:ring-offset-0 focus:ring-gray-500"
                  checked={formData.noNextReview}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      noNextReview: e.target.checked,
                      nextReviewDate: e.target.checked
                        ? ""
                        : prev.nextReviewDate,
                      reviewDays: e.target.checked ? null : prev.reviewDays,
                    }))
                  }
                />
                <span className="text-xs text-gray-500">
                  Não agendar revisão
                </span>
              </label>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                Observações
              </label>
              <textarea
                className="form-textarea w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 outline-none resize-none h-20 text-sm"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Detalhes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-2">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 rounded text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-6 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {editingSession ? "Salvar" : "Registrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
