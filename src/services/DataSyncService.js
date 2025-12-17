import { sanitizeText, sanitizeMultilineText, sanitizeHexColor } from '../utils/helpers';
import { saveToLocalStorage } from '../utils/localStorage';

/**
 * Service to handle data import and export operations.
 */
export const DataSyncService = {
  /**
   * Export application data to a JSON file.
   * @param {Object} data - The data to export.
   * @param {Function} showToast - Function to display toast messages.
   */
  exportData: (data, showToast) => {
    try {
      const exportPayload = {
        ...data,
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      Date.now(); // ensuring uniqueness if needed, though ISO string is enough
      a.download = `backup-estudos-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (showToast) showToast("Exportação concluída!", "success");
    } catch (error) {
      console.error("Export Error:", error);
      if (showToast) showToast("Erro na exportação", "error");
    }
  },

  /**
   * Import application data from a JSON file.
   * @param {File} file - The file to import.
   * @param {Function} callbacks - Object containing state setters (setStudyProfiles, etc.) and showToast.
   */
  importData: (file, callbacks) => {
    const {
      setStudyProfiles,
      setSubjects,
      setStudySessions,
      setSyllabusItems,
      setActiveProfileId,
      showToast
    } = callbacks;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== "object")
          throw new Error("Formato inválido");

        const asArray = (value) => (Array.isArray(value) ? value : []);
        const toId = (value) => sanitizeText(String(value ?? "")).slice(0, 64);

        const incomingProfiles = asArray(
          parsed.studyProfiles || parsed.profiles,
        );
        const incomingSubjects = asArray(parsed.subjects);
        const incomingSessions = asArray(
          parsed.studySessions || parsed.sessions,
        );
        const incomingSyllabusItems = asArray(parsed.syllabusItems);

        const studyProfilesSanitized = incomingProfiles
          .map((p) => ({
            id: toId(p?.id || Date.now()),
            name: sanitizeText(p?.name || "").slice(0, 80),
            description: sanitizeMultilineText(p?.description || "").slice(
              0,
              500,
            ),
            examDate: sanitizeText(p?.examDate || "").slice(0, 20),
            institution: sanitizeText(p?.institution || "").slice(0, 120),
            createdAt: p?.createdAt || new Date().toISOString(),
          }))
          .filter((p) => p.id && p.name);

        const profileIds = new Set(studyProfilesSanitized.map((p) => p.id));

        const subjectsSanitized = incomingSubjects
          .map((s) => ({
            id: toId(s?.id || Date.now()),
            profileId: toId(s?.profileId),
            name: sanitizeText(s?.name || "").slice(0, 80),
            description: sanitizeMultilineText(s?.description || "").slice(
              0,
              800,
            ),
            color: sanitizeHexColor(s?.color, "#3b82f6"),
            targetHours: Math.max(
              0,
              Math.min(10000, parseInt(s?.targetHours, 10) || 0),
            ),
          }))
          .filter(
            (s) => s.id && s.profileId && profileIds.has(s.profileId) && s.name,
          );

        const subjectIds = new Set(subjectsSanitized.map((s) => s.id));

        const sessionsSanitized = incomingSessions
          .map((session) => ({
            id: toId(session?.id || Date.now()),
            profileId: toId(session?.profileId),
            subjectId: toId(session?.subjectId),
            date: sanitizeText(session?.date || "").slice(0, 20),
            duration: Math.max(0, Math.round(Number(session?.duration) || 0)),
            syllabusItemId: toId(session?.syllabusItemId || ""),
            accuracy: session?.accuracy === "" ? "" : session?.accuracy,
            notes: sanitizeMultilineText(session?.notes || "").slice(0, 2000),
            isReview: Boolean(session?.isReview),
            nextReviewDate: sanitizeText(session?.nextReviewDate || "").slice(
              0,
              20,
            ),
          }))
          .filter(
            (session) =>
              session.id &&
              profileIds.has(session.profileId) &&
              subjectIds.has(session.subjectId),
          );

        const syllabusItemsSanitized = incomingSyllabusItems
          .map((item) => ({
            id: toId(item?.id || Date.now()),
            subjectId: toId(item?.subjectId),
            name: sanitizeText(item?.name || "").slice(0, 220),
            isStudied: Boolean(item?.isStudied),
            accuracy: item?.accuracy ?? undefined,
            createdAt: item?.createdAt || new Date().toISOString(),
          }))
          .filter(
            (item) => item.id && subjectIds.has(item.subjectId) && item.name,
          );

        if (studyProfilesSanitized.length === 0) {
          if (showToast) showToast("Backup sem perfis válidos", "warning");
          return;
        }

        setStudyProfiles(studyProfilesSanitized);
        setSubjects(subjectsSanitized);
        setStudySessions(sessionsSanitized);
        setSyllabusItems(syllabusItemsSanitized);

        saveToLocalStorage("studyProfiles", studyProfilesSanitized);
        saveToLocalStorage("subjects", subjectsSanitized);
        saveToLocalStorage("sessions", sessionsSanitized);
        saveToLocalStorage("syllabusItems", syllabusItemsSanitized);

        const nextActive = studyProfilesSanitized[0]?.id || null;
        setActiveProfileId(nextActive);
        saveToLocalStorage("activeProfileId", nextActive);

        if (showToast) showToast("Dados importados!", "success");
      } catch (err) {
        console.error(err);
        if (showToast) showToast("Erro na importação", "error");
      }
    };
    reader.readAsText(file);
  }
};
