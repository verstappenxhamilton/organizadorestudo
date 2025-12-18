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

  /* CARD BASE (Desktop Default) */
  .subject-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
    position: relative;
  }

  /* Closed State styling enhancement */
  .subject-card:not(.expanded):hover {
    background: var(--bg-card-hover);
    border-color: rgba(255,255,255,0.1);
  }

  .subject-card:hover {
    border-color: var(--border-focus);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  /* HEADER SECTION */
  .card-header {
    padding: 16px;
    cursor: pointer;
    background: transparent; /* Cleaner look */
  }

  /* Add separation line if content follows */
  .expanded .card-header {
    border-bottom: 1px solid var(--border-subtle);
    background: rgba(0,0,0,0.2);
  }

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center; /* Better alignment */
    gap: 12px;
    margin-bottom: 12px;
  }

  .header-title-group {
    flex: 1;
  }

  .header-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    line-height: 1.3;
  }

  .header-chevron {
    color: var(--text-secondary);
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .card-header:hover .header-chevron {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  /* PROGRESS BAR */
  .progress-track {
    height: 6px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--accent-primary);
    border-radius: 3px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* STATS PILLS */
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .stat-pill {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-secondary);
    background: rgba(0, 0, 0, 0.2);
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--border-subtle);
    white-space: nowrap;
  }

  /* EXPANDED CONTENT AREA */
  .expanded-content {
    border-top: 1px solid var(--border-subtle);
    background: rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ACTION TOOLBAR */
  .toolbar {
    padding: 12px 16px;
    background: var(--bg-contrast);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
  }
  .toolbar::-webkit-scrollbar { display: none; }

  .btn-action {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .btn-action span { display: inline-block; }

  .btn-action.primary { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3); }
  .btn-action.primary:hover { background: rgba(59, 130, 246, 0.2); }

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
    padding: 12px 16px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .filter-bar::-webkit-scrollbar { display: none; }

  .filter-chip {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  
  .filter-chip:hover { background: rgba(255,255,255,0.05); }
  
  .filter-chip.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  /* SYLLABUS LIST */
  .syllabus-container {
    padding-bottom: 12px;
  }

  .syllabus-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-subtle);
    transition: background 0.1s;
  }
  .syllabus-row:last-child { border-bottom: none; }
  .syllabus-row:hover { background: rgba(255,255,255,0.02); }

  .item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-title-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }

  .item-status-dot {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(2, 6, 23, 0.35);
    flex: 0 0 auto;
    margin-top: 2px;
    position: relative;
  }

  .item-status-dot.is-studied {
    border-color: rgba(16, 185, 129, 0.9);
    background: rgba(16, 185, 129, 0.95);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
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
    font-size: 0.9rem;
    line-height: 1.4;
    font-weight: 500;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .item-title.bold { font-weight: 700; color: white; font-size: 0.95rem; }
  .item-title.sub { font-weight: 400; color: var(--text-secondary); font-size: 0.85rem; }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex-shrink: 0;
    margin-left: 10px;
    max-width: min(220px, 45%);
  }

  .badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
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
  }
  .icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }

  /* EDIT MODE */
  .edit-mode {
    padding: 12px 16px;
    background: var(--bg-contrast);
    display: flex;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid var(--border-subtle);
  }
  .edit-input {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    width: 70px;
  }
  .edit-mode .btn-action {
    flex: 0 0 auto;
    padding: 6px 10px;
    min-width: 0;
  }

  /* --- MOBILE SPECIFIC (< 640px) --- */
  @media (max-width: 640px) {
    /* Reset Container padding influence */
    .subjects-container {
      gap: 12px;
      width: calc(100% + 24px); /* Counteract typical 12px padding */
      margin-left: -12px;
      margin-right: -12px;
    }

    .subject-card {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: var(--bg-card); /* Solid background for legibility */
      margin-bottom: 0;
    }
    
    /* Better distinction for closed cards on mobile */
    .subject-card:not(.expanded) {
        background: rgba(30, 41, 59, 0.6);
    }

    .card-header {
      padding: 14px 16px; /* Slightly more side padding, less vertical */
    }

    .header-main {
      margin-bottom: 16px;
    }

    .header-title {
      font-size: 1rem;
    }

    .toolbar {
      padding: 12px;
      gap: 8px;
    }
    .btn-action {
      padding: 8px 12px;
      flex: 1;
      justify-content: center;
    }

    .syllabus-row {
      padding: 12px;
    }

    .item-actions {
      gap: 4px;
      margin-left: 8px;
      max-width: min(200px, 50%);
    }

    .icon-btn {
      padding: 4px;
    }
    
    .item-title {
      font-size: 0.85rem;
    }
    
    .badge {
      padding: 2px 4px;
      font-size: 0.65rem;
      min-width: auto;
    }

    .edit-mode {
      flex-wrap: wrap;
      gap: 6px;
    }

    .edit-mode .btn-action {
      flex: 0 0 auto;
      padding: 6px 10px;
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
          paddingLeft: `calc(16px + (${hierarchyLevel} * 12px))`,
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
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
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
            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
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
            style={{ padding: "4px", fontSize: "0.75rem", display: "flex", alignItems: "center" }}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleStudied) onToggleStudied(item.id);
            }}
            title={isStudied ? "Marcar como não estudado" : "Marcar como estudado"}
          >
            {isStudied ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>

          <button
            className="btn-action secondary"
            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
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
                  onSaveWeight={onSaveItemWeight}
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
