import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Edit2,
  CheckCircle,
  ListChecks,
  History,
  Edit,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { saveToLocalStorage } from "../utils/localStorage";

/* --- MODERN UI STYLES --- */
const STYLES = `
  /* VARIABLES */
  .subjects-container {
    --bg-base: #0f172a; /* Slate 900 */
    --bg-card: #1e293b; /* Slate 800 */
    --bg-card-hover: #334155; /* Slate 700 */
    --bg-contrast: #020617; /* Slate 950 */
    
    --border-subtle: rgba(148, 163, 184, 0.1);
    --border-focus: rgba(59, 130, 246, 0.5);
    
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    --accent-primary: #3b82f6;
    --accent-success: #10b981;
    --accent-warning: #f59e0b;
    --accent-danger: #ef4444;
    --accent-info: #0ea5e9;
  }

  /* LAYOUT CONTAINER */
  .subjects-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  /* CARD BASE */
  .subject-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  /* DESIGN IMPROVEMENT: Closed State */
  .subject-card:not(.expanded) {
    background: linear-gradient(145deg, var(--bg-card) 0%, #1a2436 100%);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .subject-card:not(.expanded):hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
    border-color: var(--border-focus);
    background: linear-gradient(145deg, var(--bg-card-hover) 0%, var(--bg-card) 100%);
  }

  .subject-card:not(.expanded) .header-title {
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

  /* HEADER SECTION */
  .card-header {
    padding: 18px 20px;
    cursor: pointer;
    background: transparent;
  }

  .expanded .card-header {
    border-bottom: 1px solid var(--border-subtle);
    background: rgba(0,0,0,0.2);
    padding-bottom: 24px;
  }

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .header-title-group {
    flex: 1;
  }

  .header-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    line-height: 1.3;
    transition: color 0.2s;
  }

  .header-chevron {
    color: var(--text-secondary);
    padding: 6px;
    border-radius: 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .card-header:hover .header-chevron {
    background: rgba(255,255,255,0.1);
    color: white;
    border-color: rgba(255,255,255,0.1);
  }

  /* PROGRESS BAR */
  .progress-track {
    height: 8px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;
    border: 1px solid rgba(255,255,255,0.05);
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-primary) 0%, #60a5fa 100%);
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }

  /* STATS PILLS */
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .stat-pill {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: rgba(15, 23, 42, 0.4);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .subject-card:not(.expanded):hover .stat-pill {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(255,255,255,0.1);
    color: var(--text-primary);
  }

  /* EXPANDED CONTENT AREA */
  .expanded-content {
    border-top: 1px solid var(--border-subtle);
    background: rgba(0, 0, 0, 0.15);
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ACTION TOOLBAR */
  .toolbar {
    padding: 16px 20px;
    background: var(--bg-contrast);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .toolbar::-webkit-scrollbar { display: none; }

  .btn-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .btn-action.primary {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.3);
  }
  .btn-action.primary:hover {
    background: rgba(59, 130, 246, 0.25);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
  }

  .btn-action.info { background: rgba(6, 182, 212, 0.1); color: #22d3ee; border-color: rgba(6, 182, 212, 0.3); }
  .btn-action.info:hover { background: rgba(6, 182, 212, 0.2); }

  .btn-action.secondary { background: rgba(148, 163, 184, 0.1); color: #cbd5e1; border-color: rgba(148, 163, 184, 0.3); }
  .btn-action.secondary:hover { background: rgba(148, 163, 184, 0.2); }

  .btn-action.warning { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }
  .btn-action.warning:hover { background: rgba(245, 158, 11, 0.2); }

  .btn-action.danger { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
  .btn-action.danger:hover { background: rgba(239, 68, 68, 0.2); }
  
  .btn-action.ghost { background: transparent; color: var(--text-secondary); padding: 8px; }
  .btn-action.ghost:hover { background: rgba(255,255,255,0.05); color: white; }

  /* FILTER BAR */
  .filter-bar {
    display: flex;
    gap: 8px;
    padding: 12px 20px;
    overflow-x: auto;
    scrollbar-width: none;
    background: rgba(0,0,0,0.2);
    border-bottom: 1px solid var(--border-subtle);
  }
  .filter-bar::-webkit-scrollbar { display: none; }

  .filter-chip {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  
  .filter-chip:hover { background: rgba(255,255,255,0.05); color: white; }
  
  .filter-chip.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  /* SYLLABUS LIST */
  .syllabus-container {
    padding-bottom: 16px;
  }

  .syllabus-row {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-subtle);
    transition: background 0.1s;
  }
  .syllabus-row:last-child { border-bottom: none; }
  .syllabus-row:hover { background: rgba(255,255,255,0.03); }

  .item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-title-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
  }

  .item-status-dot {
    width: 16px;
    height: 16px;
    border-radius: 4px; /* Soft square check */
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(2, 6, 23, 0.35);
    flex: 0 0 auto;
    margin-top: 2px;
    position: relative;
    transition: all 0.2s;
  }

  .item-status-dot.is-studied {
    border-color: rgba(16, 185, 129, 0.9);
    background: rgba(16, 185, 129, 0.95);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }

  .item-status-dot.is-studied::after {
    content: "\\2713";
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    color: #0b1220;
  }

  .item-title {
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.4;
    font-weight: 500;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .item-title.bold { font-weight: 700; color: white; }
  .item-title.sub { font-weight: 400; color: var(--text-secondary); font-size: 0.9rem; }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex-shrink: 0;
    margin-left: 12px;
    max-width: min(220px, 45%);
  }

  .badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    min-width: 32px;
    text-align: center;
  }

  .icon-btn {
    padding: 6px;
    border-radius: 6px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    transition: all 0.2s;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }

  /* EDIT MODE */
  .edit-mode {
    padding: 12px 20px;
    background: var(--bg-contrast);
    display: flex;
    gap: 10px;
    align-items: center;
    border-bottom: 1px solid var(--border-subtle);
  }
  .edit-input {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    width: 80px;
  }
  .edit-input:focus {
    border-color: var(--accent-primary);
    outline: none;
  }
  .edit-mode .btn-action {
    flex: 0 0 auto;
    padding: 6px 12px;
    min-width: 0;
  }

  /* --- MOBILE SPECIFIC (< 640px) --- */
  @media (max-width: 640px) {
    .subjects-container {
      gap: 12px;
      width: calc(100% + 24px);
      margin-left: -12px;
      margin-right: -12px;
    }

    .subject-card {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: var(--bg-card);
      margin-bottom: 0;
      box-shadow: none;
    }

    .subject-card:not(.expanded) {
        background: rgba(30, 41, 59, 0.6);
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .card-header {
      padding: 16px;
    }

    .header-main {
      margin-bottom: 12px;
    }

    .header-title {
      font-size: 1.05rem;
    }

    .toolbar {
      padding: 12px 16px;
      gap: 8px;
    }
    .btn-action {
      padding: 8px 12px;
      flex: 1;
      justify-content: center;
      font-size: 0.8rem;
    }

    .syllabus-row {
      padding: 12px 16px;
    }

    .item-actions {
      gap: 4px;
      margin-left: 8px;
      max-width: min(200px, 50%);
    }

    .icon-btn {
      padding: 4px;
    }
    
    .edit-mode {
      flex-wrap: wrap;
      gap: 8px;
    }
  }
`;

/* --- HELPER FUNCTIONS --- */
const getAccuracyColor = (accuracy) => {
  if (accuracy >= 80) return "#10b981";
  if (accuracy >= 60) return "#f59e0b";
  if (accuracy >= 40) return "#f97316";
  return "#ef4444";
};

const getRelativeColor = (value, max) => {
  if (!max || max === 0) return "#94a3b8"; // Gray if no max
  const ratio = value / max;

  if (ratio >= 0.9) return "#10b981"; // Top 10% -> Emerald (Green)
  if (ratio >= 0.7) return "#34d399"; // High -> Light Green
  if (ratio >= 0.5) return "#facc15"; // Mid -> Yellow
  if (ratio >= 0.3) return "#fb923c"; // Low-Mid -> Orange
  return "#ef4444"; // Low -> Red
};

const hexToRgba = (hex, alpha = 0.08) => {
  if (!hex || typeof hex !== "string") return `rgba(59, 130, 246, ${alpha})`;
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getHierarchyLevel = (itemName) => {
  if (!itemName || typeof itemName !== "string") return 0;
  const trimmed = itemName.trim();
  if (trimmed.startsWith("- ") || itemName.startsWith(" - ")) return 1;
  const numberMatch = trimmed.match(/^(\d+\.)+/);
  if (numberMatch) {
    const dots = (numberMatch[0].match(/\./g) || []).length;
    return dots > 1 ? dots - 1 : 0;
  }
  return 0;
};

const isSubItem = (itemName) => {
  if (!itemName || typeof itemName !== "string") return false;
  return (
    itemName.startsWith(" - ") ||
    itemName.startsWith("- ") ||
    /^\d+\.\d+/.test(itemName.trim())
  );
};

const calculateNextReviewDate = (accuracy) => {
  const today = new Date();
  let daysToAdd = 1;
  if (accuracy >= 90) daysToAdd = 7;
  else if (accuracy >= 80) daysToAdd = 5;
  else if (accuracy >= 70) daysToAdd = 3;
  else if (accuracy >= 60) daysToAdd = 2;
  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split("T")[0];
};

/* --- COMPONENTS --- */

const SyllabusItem = React.memo(({
  item,
  studySessions,
  isEditing,
  onEditStart,
  onCancelEdit,
  onViewDetails,
  onSaveAccuracy,
  onSaveWeight,
  onSaveAccAndWeight,
  onToggleStudied,
  maxWeightForSubject, // New prop
}) => {
  const [tempAccuracy, setTempAccuracy] = useState(
    item.accuracy?.toString() || "",
  );
  const [tempWeight, setTempWeight] = useState(item.weight?.toString() || "");

  const hierarchyLevel = getHierarchyLevel(item.name);
  const isSub = isSubItem(item.name);
  const isStudied = Boolean(item.isStudied);
  const weightValue = Number(item.weight);
  const hasWeight = !Number.isNaN(weightValue);
  // Use relative color
  const weightColor = hasWeight ? getRelativeColor(weightValue, maxWeightForSubject) : null;
  const weightStyles = hasWeight
    ? {
      background: `linear-gradient(90deg, ${hexToRgba(weightColor, 0.18)} 0%, rgba(15,23,42,0.6) 60%)`,
      borderColor: hexToRgba(weightColor, 0.4),
      boxShadow: `inset 4px 0 0 ${hexToRgba(weightColor, 0.7)}`,
    }
    : {};

  const getSessionAccuracy = () => {
    if (!Array.isArray(studySessions)) return undefined;
    const itemSessions = studySessions.filter(
      (s) => s.syllabusItemId === item.id && Number.isFinite(s.accuracy),
    );
    if (itemSessions.length === 0) return undefined;
    return Math.round(
      itemSessions.reduce((sum, s) => sum + s.accuracy, 0) /
      itemSessions.length,
    );
  };

  const displayAccuracy = item.accuracy ?? getSessionAccuracy();
  // Use relative color for text badge too
  const weightColors = item.weight
    ? {
      bg: hexToRgba(getRelativeColor(item.weight, maxWeightForSubject), 0.1),
      text: getRelativeColor(item.weight, maxWeightForSubject),
    }
    : null;

  return (
    <>
      <div
        className="syllabus-row"
        style={{
          paddingLeft: `calc(20px + (${hierarchyLevel} * 12px))`,
          ...weightStyles,
        }}
      >
        <div className="item-content">
          <div className="item-title-row">
            {isStudied && (
              <span
                className="item-status-dot is-studied"
                aria-hidden="true"
              />
            )}
            <span className={`item-title ${isSub ? "sub" : "bold"}`}>
              {item.name}
            </span>
          </div>
        </div>

        <div className="item-actions">
          {displayAccuracy !== undefined && (
            <div
              className="badge"
              style={{
                backgroundColor: getAccuracyColor(displayAccuracy),
                color: "#000",
              }}
            >
              {displayAccuracy}%
            </div>
          )}

          {item.weight !== undefined && (
            <div
              className="badge"
              style={{
                backgroundColor: hasWeight
                  ? hexToRgba(weightColor, 0.25)
                  : "rgba(255,255,255,0.1)",
                color: hasWeight ? weightColor : "#cbd5e1",
              }}
            >
              {item.weight}
            </div>
          )}

          <button className="icon-btn" onClick={() => onViewDetails(item)}>
            <Eye size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              setTempAccuracy(item.accuracy?.toString() || "");
              setTempWeight(item.weight?.toString() || "");
              onEditStart(item.id);
            }}
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="edit-mode">
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Editar:
          </span>
          <input
            className="edit-input"
            placeholder="%"
            type="number"
            value={tempAccuracy}
            onChange={(e) => setTempAccuracy(e.target.value)}
          />
          <input
            className="edit-input"
            placeholder="Peso"
            type="number"
            value={tempWeight}
            onChange={(e) => setTempWeight(e.target.value)}
          />
          <button
            className="btn-action success"
            style={{ padding: "6px 12px", fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}
            onClick={() => {
              if (onSaveAccAndWeight) {
                onSaveAccAndWeight(item.id, tempAccuracy, tempWeight);
              } else {
                onSaveAccuracy(item.id, tempAccuracy);
                onSaveWeight(item.id, tempWeight);
              }
              onCancelEdit();
            }}
          >
            Salvar
          </button>

          <button
            className={`btn-action ${isStudied ? "success" : "secondary"}`}
            style={{ padding: "6px", fontSize: "0.8rem", display: "flex", alignItems: "center" }}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleStudied) onToggleStudied(item.id);
            }}
            title={isStudied ? "Marcar como não estudado" : "Marcar como estudado"}
          >
            {isStudied ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>

          <button
            className="btn-action secondary"
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            onClick={onCancelEdit}
          >
            X
          </button>
        </div>
      )}
    </>
  );
});

const SubjectCard = React.memo(({
  subject,
  syllabusItems,
  studySessions,
  isExpanded,
  onToggleExpand,
  // Actions
  onOpenSession,
  onOpenSyllabus,
  onHistory,
  onEditSubject,
  onDeleteSubject,
  // Data
  getSubjectStudyTime,
  calculateSubjectProgress,
  onSaveItemAccuracy,
  onSaveItemWeight,
  onSaveAccAndWeight,
  onViewItemDetails,
  onToggleStudied,
}) => {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [editingItemId, setEditingItemId] = useState(null);

  const subjectItems = syllabusItems.filter((i) => i.subjectId === subject.id);
  const studiedItems = subjectItems.filter((i) => i.isStudied);

  // Calculate Max Weight for this Subject
  const maxWeight = Math.max(...subjectItems.map(i => Number(i.weight) || 0), 1); // Avoid div by zero

  const filteredItems = (() => {
    switch (activeFilter) {
      case "nao-estudados":
        return subjectItems.filter((i) => !i.isStudied);
      case "com-revisao":
        return subjectItems.filter((i) => i.isStudied && i.accuracy >= 0);
      case "estudados-sem-revisao":
        return subjectItems.filter(
          (i) => i.isStudied && (i.accuracy === undefined || i.accuracy < 0),
        );
      default:
        return subjectItems;
    }
  })();

  const progress = calculateSubjectProgress
    ? calculateSubjectProgress(subject.id)
    : 0;
  const avgAccuracy =
    studiedItems.length > 0
      ? studiedItems.reduce((sum, i) => sum + (i.accuracy || 0), 0) /
      studiedItems.length
      : 0;
  const hours = getSubjectStudyTime(subject.id);

  return (
    <div className={`subject-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={() => onToggleExpand(subject.id)}>
        <div className="header-main">
          <div className="header-title-group">
            <h3 className="header-title">{subject.name}</h3>
          </div>
          <div className="header-chevron">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="stats-row">
          <div className="stat-pill" title="Progresso Geral">{progress.toFixed(0)}%</div>
          <div className="stat-pill">
            {studiedItems.length}/{subjectItems.length} <span className="hidden sm:inline">tópicos</span>
          </div>
          <div className="stat-pill hidden xs:block">Média: {avgAccuracy.toFixed(0)}%</div>
          <div className="stat-pill">{hours.toFixed(1)}h</div>
        </div>
      </div>

      {isExpanded && (
        <div className="expanded-content">
          {/* Actions Toolbar */}
          <div className="toolbar">
            <button
              className="btn-action primary"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSession(subject.id);
              }}
            >
              <CheckCircle size={16} /> <span>Sessão</span>
            </button>
            <button
              className="btn-action secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSyllabus(subject);
              }}
            >
              <ListChecks size={16} /> <span>Edital</span>
            </button>
            <div style={{ flex: 1 }} />
            <button
              className="btn-action ghost"
              onClick={(e) => {
                e.stopPropagation();
                onHistory(subject);
              }}
              title="Histórico"
            >
              <History size={18} />
            </button>
            <button
              className="btn-action ghost warning"
              onClick={(e) => {
                e.stopPropagation();
                onEditSubject(subject);
              }}
              title="Editar"
            >
              <Edit size={18} />
            </button>
            <button
              className="btn-action ghost danger"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSubject(subject);
              }}
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Filters */}
          <div className="filter-bar">
            {[
              { id: "todos", label: "Todos" },
              { id: "nao-estudados", label: "A Estudar" },
              { id: "com-revisao", label: "Revisados" },
              { id: "estudados-sem-revisao", label: "Sem Revisão" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`filter-chip ${activeFilter === f.id ? "active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="syllabus-container">
            {filteredItems.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontStyle: "italic",
                }}
              >
                Nenhum tópico encontrado.
              </div>
            ) : (
              filteredItems.map((item) => (
                <SyllabusItem
                  key={item.id}
                  item={item}
                  studySessions={studySessions}
                  isEditing={editingItemId === item.id}
                  onEditStart={setEditingItemId}
                  onCancelEdit={() => setEditingItemId(null)}
                  onViewDetails={onViewItemDetails}
                  onSaveAccuracy={onSaveItemAccuracy}
                  onSaveItemWeight={onSaveItemWeight}
                  onSaveAccAndWeight={onSaveAccAndWeight}
                  onToggleStudied={onToggleStudied}
                  maxWeightForSubject={maxWeight}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export const SubjectsOverview = (props) => {
  const {
    subjects,
    syllabusItems,
    setSyllabusItems,
    expandedSubjects,
    setExpandedSubjects,
    getSubjectStudyTime,
    setSelectedSyllabusItem,
    setIsItemDetailsModalOpen,
    studySessions,
    setIsSubjectModalOpen,
    setCurrentSubjectForSession,
    setIsSessionModalOpen,
    setCurrentSubjectForSyllabus,
    setIsSyllabusModalOpen,
    setEditingSubject,
    setConfirmationDialog,
    handleDeleteSubject,
    calculateSubjectProgress,
    setIsSessionHistoryModalOpen,
    setSelectedSubjectForHistory,
    addOrUpdateSession,
    onToggleStudied,
  } = props;

  /* Handlers */
  const handleToggle = (id) =>
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));

  const recordAccuracyHistory = (syllabusItemId, accuracy, nextReviewDate) => {
    if (!addOrUpdateSession) return;
    if (!Number.isFinite(accuracy)) return;

    const item = syllabusItems.find((i) => i.id === syllabusItemId);
    if (!item?.subjectId) return;

    addOrUpdateSession({
      subjectId: item.subjectId,
      date: new Date().toISOString().split("T")[0],
      duration: 0,
      syllabusItemId,
      accuracy,
      nextReviewDate,
      notes: "Acerto registrado (edição do tópico)",
    });
  };

  const handleSaveAcc = (id, val) => {
    const acc = parseFloat(val);
    if (acc >= 0 && acc <= 100) {
      const nextDate = calculateNextReviewDate(acc);
      setSyllabusItems((prev) => {
        const updated = prev.map((i) =>
          i.id === id
            ? { ...i, accuracy: acc, nextReviewDate: nextDate, isStudied: true }
            : i,
        );
        saveToLocalStorage("syllabusItems", updated);
        return updated;
      });
      recordAccuracyHistory(id, acc, nextDate);
    }
  };

  const handleSaveWgt = (id, val) => {
    const wgt = parseFloat(val);
    if (wgt >= 0 && wgt <= 100) {
      setSyllabusItems((prev) => {
        const updated = prev.map((i) =>
          i.id === id ? { ...i, weight: wgt } : i,
        );
        saveToLocalStorage("syllabusItems", updated);
        return updated;
      });
    }
  };

  const handleSaveAccAndWeight = (id, accVal, weightVal) => {
    const acc = parseFloat(accVal);
    const wgt = parseFloat(weightVal);
    const validAcc = acc >= 0 && acc <= 100 && !Number.isNaN(acc);
    const validWgt = wgt >= 0 && wgt <= 100 && !Number.isNaN(wgt);

    if (!validAcc && !validWgt) return;

    const nextDate = validAcc ? calculateNextReviewDate(acc) : null;

    setSyllabusItems((prev) => {
      const updated = prev.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i };
        if (validAcc) {
          next.accuracy = acc;
          next.nextReviewDate = nextDate;
          next.isStudied = true;
        }
        if (validWgt) {
          next.weight = wgt;
        }
        return next;
      });
      saveToLocalStorage("syllabusItems", updated);
      return updated;
    });

    if (validAcc) {
      recordAccuracyHistory(id, acc, nextDate);
    }
  };

  const handleDeleteClick = (subject) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Excluir Matéria",
      message: `Deseja excluir "${subject.name}" e todo o seu progresso?`,
      onConfirm: () => {
        handleDeleteSubject(subject.id);
        setConfirmationDialog({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: () => { },
        });
      },
    });
  };

  return (
    <div className="subjects-container">
      <style>{STYLES}</style>
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          syllabusItems={syllabusItems}
          studySessions={studySessions}
          isExpanded={expandedSubjects[subject.id]}
          onToggleExpand={handleToggle}
          // Actions
          onOpenSession={(id) => {
            setCurrentSubjectForSession(id);
            setIsSessionModalOpen(true);
          }}
          onOpenSyllabus={(subj) => {
            setCurrentSubjectForSyllabus(subj);
            setIsSyllabusModalOpen(true);
          }}
          onHistory={(subj) => {
            setSelectedSubjectForHistory(subj);
            setIsSessionHistoryModalOpen(true);
          }}
          onEditSubject={(subj) => {
            setEditingSubject(subj);
            setIsSubjectModalOpen(true);
          }}
          onDeleteSubject={handleDeleteClick}
          // Data Helpers
          getSubjectStudyTime={getSubjectStudyTime}
          calculateSubjectProgress={calculateSubjectProgress}
          onSaveItemAccuracy={handleSaveAcc}
          onSaveItemWeight={handleSaveWgt}
          onSaveAccAndWeight={handleSaveAccAndWeight}
          onToggleStudied={onToggleStudied}
          onViewItemDetails={(item) => {
            setSelectedSyllabusItem(item);
            setIsItemDetailsModalOpen(true);
          }}
        />
      ))}
    </div>
  );
};
