import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Eye,
  EyeOff,
  RotateCcw,
  SlidersHorizontal,
  Zap,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  ArrowRight,
  Settings2,
  ChevronDown
} from "lucide-react";
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

const normalizeId = (value) => {
  if (value == null) return null;
  const str = String(value).trim();
  return str ? str : null;
};

const buildDonutData = (subjects) => {
  const total = subjects.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const tau = 2 * Math.PI;
  let offset = 0;

  const segments = subjects.map((s) => {
    const weight = Number(s.weight) || 0;
    const fraction = total > 0 ? weight / total : 0;
    const length = fraction * circumference;
    const startAngle = total > 0 ? (offset / circumference) * tau : 0;
    const endAngle = total > 0 ? ((offset + length) / circumference) * tau : 0;
    const seg = {
      id: s.id,
      name: s.name,
      color: s.color,
      weightLabel: weight.toFixed(1),
      dashArray: `${length} ${Math.max(0, circumference - length)}`,
      dashOffset: -offset,
      startAngle,
      endAngle,
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
  advanceNonce,
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
  const [skippedTopicIds, setSkippedTopicIds] = useState([]);

  // New States for UI requests
  const [hasInteractedWithChart, setHasInteractedWithChart] = useState(false);
  const [overrideTopicId, setOverrideTopicId] = useState(null);

  // Persistent Queue State
  const [queue, setQueue] = useState([]);

  // Ref to ensure we only load config ONCE per profile change
  const loadedProfileRef = useRef(null);

  useEffect(() => {
    if (!profileId) return;

    if (loadedProfileRef.current === profileId) {
      return;
    }
    loadedProfileRef.current = profileId;

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

      const normalizedSelected =
        (typeof savedSelected === "string" || typeof savedSelected === "number") &&
        savedSelected
          ? String(savedSelected)
          : null;
      setSelectedSubjectId(normalizedSelected);

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

  const activeSubjects = useMemo(() => subjectsForCycle.filter(
    (s) => s.include && s.weight > 0,
  ), [subjectsForCycle]);

  // Queue Validation and Sync
  useEffect(() => {
    if (activeSubjects.length === 0) {
      if (queue.length > 0) {
        setQueue([]);
        localStorage.removeItem(queueKey);
      }
      return;
    }

    setQueue((prevQueue) => {
      let validQueue = prevQueue
        .map((item) => {
          const freshSubject = activeSubjects.find((s) => s.id === item.id);
          if (!freshSubject) return null;
          return { ...item, name: freshSubject.name };
        })
        .filter(Boolean);

      if (validQueue.length < slots) {
        const batch = generateCycleBatch(activeSubjects, 20);
        if (
          validQueue.length > 0 &&
          batch.length > 0 &&
          validQueue[validQueue.length - 1].id === batch[0].id
        ) {
          if (batch.length > 1) {
            [batch[0], batch[1]] = [batch[1], batch[0]];
          }
        }
        validQueue = [...validQueue, ...batch];
      }

      const prevString = JSON.stringify(prevQueue);
      const nextString = JSON.stringify(validQueue);

      if (prevString !== nextString) {
        localStorage.setItem(queueKey, nextString);
        return validQueue;
      }
      return prevQueue;
    });
  }, [activeSubjects, slots, queueKey, queue.length]);

  useEffect(() => {
    const id = normalizeId(selectedSubjectId);
    if (!id) return;
    localStorage.setItem(selectedKey, JSON.stringify(id));
  }, [selectedSubjectId, selectedKey]);

  const hasInitialCheckRef = useRef(false);

  useEffect(() => {
    if (activeSubjects.length === 0) return;

    const currentId = normalizeId(selectedSubjectId);
    const isValid = currentId && activeSubjects.some((s) => s.id === currentId);

    if (!hasInitialCheckRef.current) {
      if (!isValid) {
        const first = queue[0]?.id || activeSubjects[0]?.id;
        if (first) setSelectedSubjectId(first);
      }
      hasInitialCheckRef.current = true;
      return;
    }

    if (currentId && !isValid) {
      const first = queue[0]?.id || activeSubjects[0]?.id;
      setSelectedSubjectId(first || null);
    }

    if (!currentId && queue.length > 0) {
      setSelectedSubjectId(queue[0].id);
    }

  }, [activeSubjects, queue, selectedSubjectId]);

  const normalizedSelectedSubjectId = normalizeId(selectedSubjectId);
  const selectedSubject =
    (normalizedSelectedSubjectId &&
      activeSubjects.find((s) => s.id === normalizedSelectedSubjectId)) ||
    null;

  useEffect(() => {
    setSkippedTopicIds([]);
    setOverrideTopicId(null); // Reset manual topic selection
  }, [normalizedSelectedSubjectId]);

  const suggestedTopic = selectedSubject
    ? pickNextTopicForSubject(syllabusItems, selectedSubject.id, skippedTopicIds)
    : null;

  // Determine effective topic (Manual override > Algorithm Suggestion)
  const effectiveTopicId = overrideTopicId || suggestedTopic?.id;
  const effectiveTopic = useMemo(() => {
      return syllabusItems.find(t => t.id === effectiveTopicId) || null;
  }, [effectiveTopicId, syllabusItems]);

  const hasActionTarget = Boolean(selectedSubject && effectiveTopic);

  // Get all topics for the selected subject (for the dropdown)
  const subjectTopics = useMemo(() => {
      if (!selectedSubject) return [];
      return syllabusItems
          .filter(t => t.subjectId === selectedSubject.id)
          .sort((a, b) => {
              // Simple sort: unstudied first, then by name/order
              if (a.isStudied === b.isStudied) return 0; // Maintain original order roughly
              return a.isStudied ? 1 : -1;
          });
  }, [selectedSubject, syllabusItems]);

  const donutData = useMemo(() => buildDonutData(activeSubjects), [activeSubjects]);
  const lastAdvanceNonceRef = useRef(advanceNonce);

  const nextSubject = useMemo(() => {
    const segments = donutData.segments;
    if (segments.length === 0) return null;

    const currentId = normalizedSelectedSubjectId;
    const currentIndex = currentId
      ? segments.findIndex((seg) => seg.id === currentId)
      : -1;
    const nextIndex =
      (currentIndex >= 0 ? currentIndex + 1 : 0) % segments.length;

    return segments[nextIndex] || null;
  }, [donutData.segments, normalizedSelectedSubjectId]);

  useEffect(() => {
    if (advanceNonce == null) return;
    if (advanceNonce === lastAdvanceNonceRef.current) return;
    lastAdvanceNonceRef.current = advanceNonce;

    if (donutData.segments.length < 2) return;
    if (!nextSubject?.id) return;
    setSelectedSubjectId(nextSubject.id);
  }, [advanceNonce, donutData.segments.length, nextSubject?.id]);

  const handleWeightChange = (id, value) => {
    if (weightMode === "edital") return;
    const val = clampNumber(value, 0, 10);
    setCycleConfig((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), weight: val } };
      localStorage.setItem(configKey, JSON.stringify(next));
      onSaveConfig?.(next);
      return next;
    });
  };

  const handleIncludeToggle = (id) => {
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
    setQueue([]);
    localStorage.removeItem(queueKey);
  };

  const handlePickNextFromQueue = () => {
    if (!nextSubject?.id) return;
    setSelectedSubjectId(nextSubject.id);
  };

  const handleDonutClick = (e) => {
    setHasInteractedWithChart(true);
    const segments = donutData.segments;
    if (!Array.isArray(segments) || segments.length === 0) return;

    const svg = e.currentTarget;
    if (!svg?.createSVGPoint) return;

    const ctm = svg.getScreenCTM?.();
    if (!ctm) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const local = point.matrixTransform(ctm.inverse());
    const dx = local.x - 60;
    const dy = local.y - 60;
    const r = Math.sqrt(dx * dx + dy * dy);

    const maxStrokeWidth = 18;
    const tolerance = 2;
    const innerRadius = donutData.radius - maxStrokeWidth / 2 - tolerance;
    const outerRadius = donutData.radius + maxStrokeWidth / 2 + tolerance;
    if (r < innerRadius || r > outerRadius) return;

    const tau = 2 * Math.PI;
    const angleFromX = Math.atan2(dy, dx);
    const normalized = (angleFromX + tau) % tau;
    const angleFromTop = (normalized + Math.PI / 2) % tau;

    const picked =
      segments.find((seg) => angleFromTop >= seg.startAngle && angleFromTop < seg.endAngle) ||
      segments[segments.length - 1];

    if (picked?.id) handleSelectSubject(picked.id);
  };

  const handleSelectSubject = (nextIdRaw) => {
    const nextId = normalizeId(nextIdRaw);
    if (!nextId) return;
    if (normalizeId(selectedSubjectId) === nextId) return;
    setSelectedSubjectId(nextId);
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
    setQueue([]);
    localStorage.removeItem(queueKey);
  };

  const handleReset = () => {
    setCycleConfig({});
    localStorage.removeItem(configKey);
    onSaveConfig?.({});
    setQueue([]);
    localStorage.removeItem(queueKey);
  };

  const handleStart = () => {
    if (!selectedSubject) return;
    onStartSession?.(selectedSubject.id, effectiveTopic?.id);
  };

  const handleMarkDone = () => {
    if (!selectedSubject || !effectiveTopic?.id) return;
    onMarkTopicStudied?.(effectiveTopic.id);
    handlePickNextFromQueue();
  };

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
        <p className="text-slate-400 mb-4">Você ainda não tem matérias cadastradas.</p>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsConfigOpen(true)}>
          Adicionar Matérias
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" />
            Painel do Ciclo
          </h3>
          <p className="text-sm text-slate-400">
            Visualize sua rotação e gerencie o próximo passo.
          </p>
        </div>
        <button
          className={`ui-btn ${isConfigOpen ? 'bg-slate-700 text-white' : 'ui-btn-secondary'}`}
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          <SlidersHorizontal size={16} />
          {isConfigOpen ? "Ocultar Ajustes" : "Ajustar Ciclo"}
        </button>
      </div>

      {/* --- CONFIGURATION PANEL (Collapsible) --- */}
      {isConfigOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-enter shadow-inner">
           <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                 <Settings2 size={18} className="text-indigo-400"/> Configuração de Pesos
              </h4>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => handleModeChange("edital")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${weightMode === 'edital' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Automático (Edital)
                </button>
                <button
                  onClick={() => handleModeChange("manual")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${weightMode === 'manual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Manual
                </button>
              </div>
           </div>

           <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {subjectsForCycle.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}40` }} />
                      <div>
                        <p className="font-semibold text-slate-200">{s.name}</p>
                        <p className="text-xs text-slate-500">Peso atual: {s.weight}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      {weightMode === 'manual' && (
                         <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
                            <input
                              type="range" min="0" max="10" step="0.5"
                              value={s.weight}
                              onChange={(e) => handleWeightChange(s.id, e.target.value)}
                              className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="w-8 text-center text-sm font-mono text-slate-300">{s.weight}</span>
                         </div>
                      )}

                      <button
                        onClick={() => handleIncludeToggle(s.id)}
                        className={`p-2 rounded-lg transition-colors ${s.include ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-slate-500 hover:text-slate-300'}`}
                        title={s.include ? "Incluído no ciclo" : "Pausado"}
                      >
                         {s.include ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
             {weightMode === 'manual' && (
               <button onClick={handleEqualize} className="ui-btn ui-btn-ghost text-xs">
                 Equalizar Pesos
               </button>
             )}
             <button onClick={handleReset} className="ui-btn ui-btn-ghost text-red-400 hover:bg-red-400/10 text-xs">
                 <RotateCcw size={14}/> Resetar Configuração
             </button>
           </div>
        </div>
      )}

      {/* --- MAIN CONTENT GRID --- */}
      {activeSubjects.length === 0 ? (
        <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200 text-center">
            <p>Todas as matérias estão pausadas ou sem peso. Ajuste a configuração acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* LEFT: VISUALIZATION */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

             <div className="relative z-10 scale-110 sm:scale-125 transition-transform duration-500 mb-8">
                <svg
                    viewBox="0 0 120 120"
                    className="w-[280px] h-[280px] drop-shadow-2xl"
                    onClick={handleDonutClick}
                >
                    {/* Track */}
                    <circle cx="60" cy="60" r={donutData.radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />

                    {/* Segments */}
                    <g transform="rotate(-90 60 60)">
                      {donutData.segments.map((seg) => {
                         const isSelected = seg.id === normalizedSelectedSubjectId;
                         return (
                            <circle
                              key={seg.id}
                              cx="60"
                              cy="60"
                              r={donutData.radius}
                              fill="none"
                              stroke={seg.color}
                              strokeWidth={isSelected ? 18 : 16}
                              strokeDasharray={seg.dashArray}
                              strokeDashoffset={seg.dashOffset}
                              className={`transition-all duration-300 cursor-pointer hover:opacity-100 ${isSelected ? 'opacity-100' : 'opacity-80 hover:stroke-[17px]'}`}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setHasInteractedWithChart(true);
                                 handleSelectSubject(seg.id);
                              }}
                            >
                               <title>{seg.name}</title>
                            </circle>
                         );
                      })}
                    </g>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-center max-w-[140px]">
                       <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Atual</span>
                       <p className="text-lg font-bold text-white leading-tight line-clamp-2">
                          {selectedSubject?.name || "Selecione"}
                       </p>
                    </div>
                </div>
             </div>

             {/* Moved "Na sequência" here */}
             <div className="w-full max-w-sm">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700 flex-shrink-0">
                      <ArrowRight size={18} />
                  </div>
                  <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Na sequência</p>
                      <p className="text-sm text-slate-300 font-semibold truncate">
                          {nextSubject?.name || "..."}
                      </p>
                  </div>
                </div>
             </div>

             {!hasInteractedWithChart && (
               <p className="mt-8 text-slate-500 text-sm flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"/>
                  Clique nos segmentos para navegar
               </p>
             )}
          </div>

          {/* RIGHT: CONTROLLER CARD */}
          <div className="flex flex-col gap-5">

             {/* ACTIVE SUBJECT CARD */}
             <div className="relative bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl overflow-hidden group">

                {/* Colored Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
                  style={{ background: selectedSubject?.color || '#475569' }}
                />

                <div className="mb-6 relative z-10">
                   <div className="flex justify-between items-start">
                      <div className="w-full">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700 px-2 py-1 rounded-md bg-slate-900/50">
                            Matéria da Vez
                        </span>

                        {/* Dropdown for quick switching */}
                        <div className="relative mt-3 group-hover:bg-slate-700/30 p-2 -ml-2 rounded-lg transition-colors min-w-0">
                            {/* Visible Text Layer */}
                            <div className="flex items-start justify-between gap-2 pr-6">
                                <h2 className="text-2xl font-bold text-white leading-tight break-words">
                                    {selectedSubject?.name}
                                </h2>
                                <ChevronDown className="text-slate-500 flex-shrink-0 mt-1" size={20} />
                            </div>

                            {/* Invisible Interactive Layer */}
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                                value={selectedSubjectId || ""}
                                onChange={(e) => handleSelectSubject(e.target.value)}
                                aria-label="Alterar matéria selecionada"
                            >
                                {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                      </div>

                      {/* Removed the Initial Letter Icon as requested */}
                   </div>
                </div>

                {/* TOPIC SELECTOR BOX (Replaced Static Display) */}
                <div className="bg-slate-900/60 rounded-xl p-4 mb-6 border border-slate-700/50 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <BookOpen size={14} /> Sugestão do Edital
                        </span>
                    </div>

                    <div className="relative z-10">
                         {/* This Select mimics the behavior of the Subject select but for Topics */}
                         <div className="relative">
                            <select
                                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                                value={effectiveTopicId || ""}
                                onChange={(e) => setOverrideTopicId(e.target.value)}
                                disabled={!selectedSubject}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: `right 0.5rem center`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundSize: `1.5em 1.5em`,
                                    paddingRight: `2.5rem`
                                }}
                            >
                                <option value="" disabled>Selecione um tópico...</option>
                                {subjectTopics.map(topic => (
                                    <option key={topic.id} value={topic.id} className="text-slate-900 bg-white">
                                        {topic.name} {topic.isStudied ? "(Estudado)" : ""}
                                    </option>
                                ))}
                            </select>
                         </div>

                         {/* Info about why this is selected if it is the suggestion */}
                         {!overrideTopicId && suggestedTopic && (
                             <p className="text-[10px] text-slate-500 mt-2">
                                 Sugerido automaticamente pelo algoritmo.
                             </p>
                         )}
                    </div>
                </div>

                {/* MAIN ACTION BUTTON */}
                <button
                    onClick={handleStart}
                    disabled={!hasActionTarget}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mb-3"
                >
                    <PlayCircle size={24} className="fill-white/20" />
                    INICIAR SESSÃO
                </button>

                {/* SECONDARY ACTIONS GRID */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleMarkDone}
                        disabled={!hasActionTarget}
                        className="ui-btn bg-slate-700/50 hover:bg-emerald-500/10 hover:text-emerald-400 border-slate-700 text-slate-300 py-3 rounded-lg justify-center text-xs font-semibold transition-all"
                    >
                        <CheckCircle2 size={16} />
                        Marcar Visto
                    </button>
                    <button
                        onClick={handlePickNextFromQueue}
                        disabled={donutData.segments.length < 2}
                        className="ui-btn bg-slate-700/50 hover:bg-amber-500/10 hover:text-amber-400 border-slate-700 text-slate-300 py-3 rounded-lg justify-center text-xs font-semibold transition-all"
                    >
                        <Zap size={16} />
                        Avançar Ciclo
                    </button>
                </div>
             </div>

          </div>
        </div>
      )}

    </div>
  );
};
