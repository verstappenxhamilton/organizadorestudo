import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RotateCcw, SlidersHorizontal, Zap } from "lucide-react";
import {
  buildSubjectsForCycle,
  generateCycleBatch,
  pickNextTopicForSubject,
  sanitizeCycleConfig,
  sanitizeHexColor,
} from "../utils/studyCycle";

const COLORS = [
  "#60a5fa",
  "#f59e0b",
  "#10b981",
  "#f472b6",
  "#c084fc",
  "#22d3ee",
  "#fb7185",
  "#a3e635",
  "#fbbf24",
  "#8b5cf6",
];

const getColor = (idx, fallback) => fallback || COLORS[idx % COLORS.length];

const clampNumber = (value, min, max) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
};

const buildDonutData = (subjects) => {
  const total = subjects.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = subjects.map((s) => {
    const weight = Number(s.weight) || 0;
    const fraction = total > 0 ? weight / total : 0;
    const length = fraction * circumference;
    const seg = {
      id: s.id,
      name: s.name,
      color: s.color,
      weightLabel: weight.toFixed(1),
      dashArray: `${length} ${Math.max(0, circumference - length)}`,
      dashOffset: -offset,
    };
    offset += length;
    return seg;
  });

  return { total, radius, segments };
};

export const StudyCycle = ({
  subjects,
  profileId,
  syllabusItems = [],
  onSaveConfig,
  onStartSession,
  onMarkTopicStudied,
}) => {
  const configKey = `studyCycle:${profileId}`;
  const modeKey = `studyCycleWeightsMode:${profileId}`;
  const slotsKey = `studyCycleSlots:${profileId}`;
  const selectedKey = `studyCycleSelectedSubject:${profileId}`;
  const queueKey = `studyCycleQueue:${profileId}`;

  const [cycleConfig, setCycleConfig] = useState({});
  const [weightMode, setWeightMode] = useState("edital"); // 'edital' | 'manual'
  const [slots, setSlots] = useState(12);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Persistent Queue State
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (!profileId) return;

    const readStorage = (key) => {
      const raw = localStorage.getItem(key);
      if (raw == null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    };

    try {
      const savedConfig = readStorage(configKey);
      const savedMode = readStorage(modeKey);
      const savedSlots = readStorage(slotsKey);
      const savedSelected = readStorage(selectedKey);
      const savedQueue = readStorage(queueKey);

      setCycleConfig(sanitizeCycleConfig(savedConfig));

      if (savedMode === "manual" || savedMode === "edital") {
        setWeightMode(savedMode);
      } else {
        const hasTargetHours = subjects.some((s) => Number(s.targetHours) > 0);
        setWeightMode(hasTargetHours ? "edital" : "manual");
      }

      const slotsNum = Number(savedSlots);
      setSlots(
        Number.isFinite(slotsNum) && slotsNum >= 6 && slotsNum <= 24
          ? slotsNum
          : 12,
      );

      setSelectedSubjectId(
        typeof savedSelected === "string" && savedSelected
          ? savedSelected
          : null,
      );

      if (Array.isArray(savedQueue)) {
        setQueue(savedQueue);
      }
    } catch {
      setCycleConfig({});
      setWeightMode("manual");
      setSlots(12);
      setSelectedSubjectId(null);
      setQueue([]);
    }
  }, [profileId, configKey, modeKey, slotsKey, selectedKey, subjects, queueKey]);

  const subjectsForCycle = useMemo(() => {
    const built = buildSubjectsForCycle({
      subjects,
      mode: weightMode,
      cycleConfig,
    });
    return built.map((s, idx) => ({
      ...s,
      color: sanitizeHexColor(s.color, getColor(idx, s.color)),
    }));
  }, [subjects, cycleConfig, weightMode]);

  const activeSubjects = subjectsForCycle.filter(
    (s) => s.include && s.weight > 0,
  );

  // Queue Validation, Sync, and Replenishment Effect
  useEffect(() => {
    // If no active subjects, clear queue
    if (activeSubjects.length === 0) {
      if (queue.length > 0) {
        setQueue([]);
        localStorage.removeItem(queueKey);
      }
      return;
    }

    setQueue((prevQueue) => {
      // 1. Validate and Sync: Remove items not in activeSubjects, update names
      let validQueue = prevQueue
        .map((item) => {
          const freshSubject = activeSubjects.find((s) => s.id === item.id);
          if (!freshSubject) return null; // Subject deleted or disabled
          return { ...item, name: freshSubject.name }; // Update name if changed
        })
        .filter(Boolean);

      // 2. Replenish if validQueue is too short
      if (validQueue.length < slots) {
        const batch = generateCycleBatch(activeSubjects, 20);
        // Avoid immediate duplicate: if last of validQueue == first of batch
        if (
          validQueue.length > 0 &&
          batch.length > 0 &&
          validQueue[validQueue.length - 1].id === batch[0].id
        ) {
          // Swap first of batch with second if possible to avoid A->A
          if (batch.length > 1) {
            [batch[0], batch[1]] = [batch[1], batch[0]];
          }
        }
        validQueue = [...validQueue, ...batch];
      }

      // Only update state/storage if something changed
      // (Simple length check or deep compare optimization could go here, 
      // but for now strict sync is safer)
      const prevString = JSON.stringify(prevQueue);
      const nextString = JSON.stringify(validQueue);

      if (prevString !== nextString) {
        localStorage.setItem(queueKey, nextString);
        return validQueue;
      }
      return prevQueue;
    });
  }, [activeSubjects, slots, queueKey]);

  useEffect(() => {
    const isSelectedActive =
      selectedSubjectId &&
      activeSubjects.some((s) => s.id === selectedSubjectId);

    // If current selection is invalid, or null, try to conform to queue or first available
    if (!isSelectedActive) {
      // Don't auto-consume queue here, just peek or pick available
      // Actually, if we pick from queue[0], we should probably consume it?
      // But if user just switched profile, we don't want to auto-complete a session.
      // Just set selected to queue[0] WITHOUT removing it? 
      // This usually means "Next Up".
      const first = queue[0]?.id || activeSubjects[0]?.id || null;
      setSelectedSubjectId(first);
      if (first) localStorage.setItem(selectedKey, first);
    } else {
      localStorage.setItem(selectedKey, selectedSubjectId);
    }
  }, [selectedSubjectId, activeSubjects, selectedKey, queue]);

  const selectedSubject =
    activeSubjects.find((s) => s.id === selectedSubjectId) || null;
  const nextTopic = selectedSubject
    ? pickNextTopicForSubject(syllabusItems, selectedSubject.id)
    : null;
  const hasActionTarget = Boolean(selectedSubject && nextTopic);

  const donutData = useMemo(
    () => buildDonutData(activeSubjects),
    [activeSubjects],
  );

  const handleWeightChange = (id, value) => {
    if (weightMode === "edital") return;
    const val = clampNumber(value, 0, 10);
    setCycleConfig((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), weight: val } };
      localStorage.setItem(configKey, JSON.stringify(next));
      onSaveConfig?.(next);
      return next;
    });
    // Weights changed, we might want to refresh queue eventually, 
    // but letting it drain is smoother to avoid jarring jumps.
  };

  const handleIncludeToggle = (id) => {
    // Access current state directly from the cycleConfig variable in scope
    const prevEntry = cycleConfig[id] || {};
    const isCurrentlyIncluded = prevEntry.include !== false;
    const nextInclude = !isCurrentlyIncluded;

    const nextConfig = {
      ...cycleConfig,
      [id]: { ...prevEntry, include: nextInclude }
    };

    setCycleConfig(nextConfig);
    localStorage.setItem(configKey, JSON.stringify(nextConfig));
    onSaveConfig?.(nextConfig);

    // If we are disabling (nextInclude === false), remove from queue
    if (!nextInclude) {
      setQueue(prev => {
        const nextQ = prev.filter(i => i.id !== id);
        localStorage.setItem(queueKey, JSON.stringify(nextQ));
        return nextQ;
      });
    }
  };

  const handleModeChange = (mode) => {
    setWeightMode(mode);
    localStorage.setItem(modeKey, mode);
    // Mode change affects weights drastically. Should we clear queue?
    // Probably yes, to reflect new weights immediately.
    setQueue([]);
    localStorage.removeItem(queueKey);
  };

  const handleSlotsChange = (value) => {
    const nextSlots = clampNumber(value, 6, 24);
    setSlots(nextSlots);
    localStorage.setItem(slotsKey, String(nextSlots));
  };

  const handlePickNextFromQueue = () => {
    const next = queue[0];
    if (!next) return;

    // Consume the item
    const newQueue = queue.slice(1);
    setQueue(newQueue);
    localStorage.setItem(queueKey, JSON.stringify(newQueue));

    setSelectedSubjectId(next.id);
    localStorage.setItem(selectedKey, next.id);
  };

  const handleEqualize = () => {
    if (weightMode === "edital") return;
    const equal = subjects.reduce(
      (acc, s) => ({ ...acc, [s.id]: { weight: 1, include: true } }),
      {},
    );
    setCycleConfig(equal);
    localStorage.setItem(configKey, JSON.stringify(equal));
    onSaveConfig?.(equal);

    // Clear queue to respect new equal weights
    setQueue([]);
    localStorage.removeItem(queueKey);
  };

  const handleReset = () => {
    setCycleConfig({});
    localStorage.removeItem(configKey);
    onSaveConfig?.({});

    // Reset Queue
    setQueue([]);
    localStorage.removeItem(queueKey);
  };

  const handleStart = () => {
    if (!selectedSubject) return;
    onStartSession?.(selectedSubject.id, nextTopic?.id);
  };

  const handleMarkDone = () => {
    if (!selectedSubject || !nextTopic?.id) return;
    onMarkTopicStudied?.(nextTopic.id);
    handlePickNextFromQueue();
  };

  return (
    <div className="ui-card study-cycle">
      <div className="cycle-head">
        <div>
          <p className="cycle-eyebrow">Ciclo de estudos</p>
          <h3 className="cycle-title">Próxima sessão</h3>
          <p className="cycle-sub">
            Clique no gráfico para escolher a matéria e iniciar.
          </p>
        </div>
        <div className="cycle-head__actions">
          <button
            className="ui-btn ui-btn-secondary"
            onClick={() => setIsConfigOpen((prev) => !prev)}
            aria-expanded={isConfigOpen}
          >
            <SlidersHorizontal size={16} />{" "}
            {isConfigOpen ? "Fechar" : "Configurar"}
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="cycle-empty">Nenhuma matéria neste perfil.</div>
      ) : (
        <div className="cycle-body">
          <div className="cycle-pane cycle-pane--primary">
            {donutData.total === 0 ? (
              <div className="cycle-empty cycle-empty--stack">
                <p className="cycle-muted">
                  {weightMode === "edital"
                    ? "Defina a meta de horas nas matérias (ou use pesos manuais) para montar o ciclo."
                    : "Inclua pelo menos uma matéria com peso."}
                </p>
                <button
                  className="ui-btn ui-btn-primary"
                  onClick={() => setIsConfigOpen(true)}
                >
                  <SlidersHorizontal size={16} /> Configurar ciclo
                </button>
              </div>
            ) : (
              <div className="cycle-wheel">
                <div
                  className="cycle-donut"
                  role="img"
                  aria-label="Distribuição do ciclo"
                >
                  <svg
                    className="cycle-donut__svg"
                    viewBox="0 0 120 120"
                    aria-hidden="true"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r={donutData.radius}
                      fill="transparent"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="16"
                    />
                    <g transform="rotate(-90 60 60)">
                      {donutData.segments.map((seg) => (
                        <circle
                          key={seg.id}
                          className={`cycle-donut__seg ${seg.id === selectedSubjectId ? "is-selected" : ""}`}
                          cx="60"
                          cy="60"
                          r={donutData.radius}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth={seg.id === selectedSubjectId ? 18 : 16}
                          strokeDasharray={seg.dashArray}
                          strokeDashoffset={seg.dashOffset}
                          strokeLinecap="butt"
                          role="button"
                          tabIndex={0}
                          aria-label={`Selecionar ${seg.name}`}
                          onClick={() => setSelectedSubjectId(seg.id)}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            setSelectedSubjectId(seg.id);
                          }}
                        >
                          <title>{`${seg.name} (${seg.weightLabel})`}</title>
                        </circle>
                      ))}
                    </g>
                  </svg>

                  <div className="cycle-donut__center">
                    <span className="cycle-muted text-xs">Próxima sessão</span>
                    <div className="cycle-next-title">
                      {selectedSubject?.name || "-"}
                    </div>
                    <span className="cycle-muted text-xs">
                      Depois: {queue[0]?.name || "-"}
                    </span>
                  </div>
                </div>

                <div className="cycle-wheel__side">
                  <div className="cycle-select-row">
                    <div className="cycle-select__meta">
                      <div>
                        <span className="cycle-muted text-xs">Matéria</span>
                        <div className="cycle-next-title">
                          {selectedSubject?.name || "-"}
                        </div>
                      </div>
                      <div>
                        <span className="cycle-muted text-xs">
                          Tópico sugerido
                        </span>
                        <div className="cycle-next-title">
                          {nextTopic?.name || "Cadastre tópicos"}
                        </div>
                      </div>
                      <div>
                        <span className="cycle-muted text-xs">Depois</span>
                        <div className="cycle-next-title">
                          {queue[0]?.name || "-"}
                        </div>
                      </div>
                    </div>

                    <select
                      value={selectedSubjectId || ""}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      aria-label="Selecionar matéria para o ciclo"
                    >
                      {activeSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <div className="cycle-actions">
                      <button
                        className="ui-btn ui-btn-primary"
                        onClick={handleStart}
                        disabled={!selectedSubject}
                      >
                        Iniciar sessão
                      </button>
                      <button
                        className="ui-btn ui-btn-secondary"
                        onClick={handleMarkDone}
                        disabled={!hasActionTarget}
                      >
                        Concluir tópico
                      </button>
                      <button
                        className="ui-btn ui-btn-secondary"
                        onClick={handlePickNextFromQueue}
                        disabled={!queue[0]?.id}
                      >
                        <Zap size={16} /> Próximo do ciclo
                      </button>
                    </div>
                  </div>


                </div>
              </div>
            )}
          </div>

          <details
            className="cycle-pane cycle-config"
            open={isConfigOpen}
            onToggle={(e) => setIsConfigOpen(e.currentTarget.open)}
          >
            <summary className="cycle-config__summary">
              <span>Configuração do ciclo</span>
              <span className="cycle-config__badge">
                {weightMode === "edital" ? "Edital" : "Manual"}
              </span>
            </summary>

            <div className="cycle-config__content">
              <p className="cycle-muted">
                {weightMode === "edital"
                  ? "Os pesos são calculados a partir da meta de horas de cada matéria."
                  : "Defina pesos (0 a 10) e pause matérias quando necessário."}
              </p>

              <div className="cycle-config__controls">
                <div
                  className="mode-switch"
                  aria-label="Modo de pesos do ciclo"
                >
                  <button
                    className={weightMode === "edital" ? "is-active" : ""}
                    onClick={() => handleModeChange("edital")}
                    type="button"
                  >
                    Pesos do edital
                  </button>
                  <button
                    className={weightMode === "manual" ? "is-active" : ""}
                    onClick={() => handleModeChange("manual")}
                    type="button"
                  >
                    Pesos manuais
                  </button>
                </div>

                <div className="cycle-actions">
                  <button
                    className="ui-btn ui-btn-secondary"
                    onClick={handleEqualize}
                    disabled={weightMode === "edital"}
                  >
                    <Zap size={16} /> Pesos iguais
                  </button>
                  <button
                    className="ui-btn ui-btn-secondary"
                    onClick={handleReset}
                  >
                    <RotateCcw size={16} /> Resetar
                  </button>
                </div>
              </div>

              <div className="cycle-config__row">

              </div>

              <div className="cycle-list">
                {subjectsForCycle.map((s) => {
                  const items = syllabusItems.filter(
                    (i) => i.subjectId === s.id,
                  );
                  const studied = items.filter((i) => i.isStudied).length;

                  return (
                    <div key={s.id} className="cycle-item">
                      <div className="cycle-item__top">
                        <div className="cycle-item__title">
                          <span
                            className="cycle-dot"
                            style={{ background: s.color }}
                          />
                          <div>
                            <div className="cycle-item__name">{s.name}</div>
                            <div className="cycle-item__meta">
                              {studied}/{items.length || 0} tópicos{" "}
                              {weightMode === "edital"
                                ? `| meta ${s._targetHours || 0}h | peso ${s.weight}`
                                : `| peso ${s.weight}`}
                            </div>
                          </div>
                        </div>
                        <button
                          className="cycle-pill"
                          onClick={() => handleIncludeToggle(s.id)}
                          type="button"
                        >
                          {s.include ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
                          {s.include ? "Pausar" : "Ativar"}
                        </button>
                      </div>

                      {weightMode === "manual" && (
                        <div className="cycle-weight">
                          <span className="cycle-muted text-xs">
                            Peso manual
                          </span>
                          <div className="cycle-weight__controls">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.5"
                              value={s.weight}
                              onChange={(e) =>
                                handleWeightChange(s.id, e.target.value)
                              }
                            />
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.5"
                              value={s.weight}
                              onChange={(e) =>
                                handleWeightChange(s.id, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
