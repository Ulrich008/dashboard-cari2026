import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { programmeService } from "../services/programmeService";

/* ── Inline SVG icon ── */
const Icon = ({ d, size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  filter:   "M4 6h16M7 12h10M10 18h4",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  delete:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  calendar: "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  power:    "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  list:     "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  calendar2:"M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707L13 13.414V19a1 1 0 0 1-.553.894l-4 2A1 1 0 0 1 7 21v-7.586L3.293 6.707A1 1 0 0 1 3 6V4z",
};

const PROGRAM_TYPES = ["keynote", "session", "workshop", "panel", "break", "social"];

/* ── Schedule view helpers ── */
const TRACK_STYLE = {
  A: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
  B: { bg: "#faf5ff", border: "#8b5cf6", text: "#6b21a8" },
  C: { bg: "#fff7ed", border: "#f97316", text: "#9a3412" },
};

const DAY_META = {
  "2026-10-21": { label: "Day 1 — October 21, 2026", sub: "Workshops & Welcome" },
  "2026-10-22": { label: "Day 2 — October 22, 2026", sub: "Official Launch & Parallel Sessions" },
  "2026-10-23": { label: "Day 3 — October 23, 2026", sub: "Keynote, Tutorials & Gala Dinner" },
  "2026-10-24": { label: "Day 4 — October 24, 2026", sub: "Closing & Assembly" },
};

const LEGEND = [
  { label: "Track A",          color: "#3b82f6" },
  { label: "Track B",          color: "#8b5cf6" },
  { label: "Track C",          color: "#f97316" },
  { label: "Plenary",          color: "#16a34a" },
  { label: "Keynote",          color: "#f59e0b" },
  { label: "Panel",            color: "#6366f1" },
  { label: "Social / Welcome", color: "#14b8a6" },
];

const fmtTime = (dt) => (dt ? String(dt).slice(11, 16) : "");

const getRowType = (p) => {
  if (p.type === "break") return "break";
  if (p.type === "keynote") return "keynote";
  if (p.type === "panel") return "panel";
  if (p.type === "social" && !p.salle) return "special";
  if (p.type === "social") return "social";
  return "plenary";
};

const ROW_STYLES = {
  break:   "border-l-2 border-gray-400 bg-gray-100 text-gray-600 font-normal",
  plenary: "border-l-2 border-green-600 bg-green-50 text-green-800 font-semibold",
  keynote: "border-l-2 border-amber-500 bg-amber-50 text-amber-800 font-semibold",
  panel:   "border-l-2 border-indigo-500 bg-indigo-50 text-indigo-800 font-semibold",
  social:  "border-l-2 border-teal-500 bg-teal-50 text-teal-800 font-semibold",
  special: "border-l-2 border-yellow-500 bg-yellow-50 text-yellow-800 font-semibold",
};

/* ── ScheduleRow ── */
const ScheduleRow = ({ slot }) => {
  const timeCell = (
    <span className="w-24 flex-shrink-0 text-xs text-gray-400 pt-1.5 font-mono text-right pr-3">
      {fmtTime(slot.startTime)}–{fmtTime(slot.endTime)}
    </span>
  );

  if (slot.type === "parallel") {
    return (
      <div className="flex gap-2 py-0.5">
        {timeCell}
        <div className="flex-1 grid grid-cols-3 gap-1.5">
          {slot.sessions.map((s, i) => {
            const ts = TRACK_STYLE[s.track] || TRACK_STYLE.A;
            return (
              <div
                key={i}
                className="rounded px-3 py-1.5 text-xs leading-relaxed font-semibold"
                style={{ borderLeft: `3px solid ${ts.border}`, background: ts.bg, color: ts.text }}
              >
                {s.titre}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const cls = ROW_STYLES[slot.type] || ROW_STYLES.plenary;
  const titre = slot.sessions[0]?.titre || "";
  const prefix = slot.type === "keynote" ? "⭐ " : slot.type === "special" ? "🍽 " : "";

  return (
    <div className="flex gap-2 py-0.5">
      {timeCell}
      <div className="flex-1">
        <div className={`rounded px-3 py-1.5 text-xs leading-relaxed ${cls}`}>
          {prefix}{titre}
        </div>
      </div>
    </div>
  );
};

/* ── ScheduleView ── */
const ScheduleView = ({ programs }) => {
  const sorted = [...programs]
    .filter(p => p.activated !== false)
    .sort((a, b) => String(a.date_debut).localeCompare(String(b.date_debut)));

  const byDate = {};
  sorted.forEach(p => {
    const date = String(p.date_debut).slice(0, 10);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(p);
  });

  const dates = Object.keys(byDate).sort();

  const [openDays, setOpenDays] = useState(
    dates.reduce((acc, d) => { acc[d] = true; return acc; }, {})
  );
  const toggleDay = (d) => setOpenDays(prev => ({ ...prev, [d]: !prev[d] }));

  const buildSlots = (daySessions) => {
    const slotMap = {};
    daySessions.forEach(p => {
      const key = `${p.date_debut}|${p.date_fin}`;
      if (!slotMap[key]) {
        slotMap[key] = { startTime: p.date_debut, endTime: p.date_fin, sessions: [] };
      }
      slotMap[key].sessions.push(p);
    });

    return Object.values(slotMap)
      .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
      .map(slot => {
        const hasTrack = slot.sessions.some(s => s.salle && String(s.salle).startsWith("Track "));
        if (hasTrack && slot.sessions.length > 1) {
          return {
            ...slot,
            type: "parallel",
            sessions: slot.sessions
              .map(s => ({ ...s, track: s.salle ? String(s.salle).replace("Track ", "") : "A" }))
              .sort((a, b) => (a.salle || "").localeCompare(b.salle || "")),
          };
        }
        return { ...slot, type: getRowType(slot.sessions[0]) };
      });
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-100">
        {LEGEND.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {dates.map(date => {
        const meta = DAY_META[date] || { label: date, sub: "" };
        const slots = buildSlots(byDate[date]);
        const isOpen = openDays[date] !== false;

        return (
          <div key={date} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleDay(date)}
              className="w-full flex items-center justify-between bg-white border-b-4 border-green-600 px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <div className="text-sm font-bold text-green-600">{meta.label}</div>
                {meta.sub && <div className="text-xs text-gray-400 mt-0.5">{meta.sub}</div>}
              </div>
              <svg
                className={`w-4 h-4 text-green-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="bg-gray-50 px-5 py-4">
                <div className="flex flex-col gap-1">
                  {slots.map((slot, idx) => <ScheduleRow key={idx} slot={slot} />)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function Program() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [programs, setPrograms] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await programmeService.getAll();
      setPrograms(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Erreur", text: "Erreur lors du chargement des programmes" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = programs.filter((p) => {
    const matchesSearch = p.titre.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleActivated = async (id) => {
    try {
      const program = programs.find(p => p.id === id);
      await programmeService.update(id, { ...program, activated: !program.activated });
      await loadPrograms();
      Swal.fire({ icon: "success", title: "Succès", text: "Statut mis à jour", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Erreur", text: "Erreur lors de la mise à jour du statut" });
    }
  };

  const deleteProgram = async (id) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Vous ne pourrez pas récupérer ce programme !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    });
    if (result.isConfirmed) {
      try {
        await programmeService.delete(id);
        await loadPrograms();
        Swal.fire({ icon: "success", title: "Supprimé !", text: "Le programme a été supprimé.", timer: 1500, showConfirmButton: false });
      } catch {
        Swal.fire({ icon: "error", title: "Erreur", text: "Erreur lors de la suppression" });
      }
    }
  };

  const getTypeBadgeColor = (type) => {
    const map = {
      keynote:  "bg-amber-100 text-amber-700",
      session:  "bg-blue-100 text-blue-700",
      workshop: "bg-green-100 text-green-700",
      panel:    "bg-indigo-100 text-indigo-700",
      break:    "bg-gray-100 text-gray-600",
      social:   "bg-teal-100 text-teal-700",
    };
    return map[type] || "bg-gray-100 text-gray-700";
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(".", "");
  };

  const viewProgram = (program) => {
    Swal.fire({
      title: `<strong>${program.titre}</strong>`,
      html: `
        <div class="text-left" style="font-size:14px;">
          <div style="margin-bottom:12px;">
            <strong style="color:#1a7a3c;">Informations générales</strong>
            <div style="margin-top:4px;color:#666;">
              <div><strong>Type:</strong> ${program.type}</div>
              <div><strong>Description:</strong> ${program.description || "-"}</div>
              <div><strong>Salle:</strong> ${program.salle || "-"}</div>
              <div><strong>Statut:</strong> ${program.activated ? "Actif" : "Inactif"}</div>
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <strong style="color:#1a7a3c;">Horaires</strong>
            <div style="margin-top:4px;color:#666;">
              <div><strong>Début :</strong> ${formatDateTime(program.date_debut)}</div>
              <div><strong>Fin :</strong> ${formatDateTime(program.date_fin)}</div>
            </div>
          </div>
          <div>
            <strong style="color:#1a7a3c;">Speakers / Papiers</strong>
            <div style="margin-top:4px;color:#666;">
              <div><strong>Speaker IDs :</strong> ${program.speaker_committee_ids?.length ? program.speaker_committee_ids.join(", ") : "-"}</div>
              <div><strong>Papier IDs :</strong> ${program.papier_ids?.length ? program.papier_ids.join(", ") : "-"}</div>
            </div>
          </div>
        </div>`,
      width: "600px",
      showConfirmButton: true,
      confirmButtonText: "Fermer",
      confirmButtonColor: "#1a7a3c",
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* Page header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Gestion des Programmes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les sessions, keynotes, workshops et panels de la conférence
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 shrink-0">Programmes</span>

            {/* Search — hidden in schedule view */}
            {viewMode === "list" && (
              <div className="flex-1 relative">
                <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par titre..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
                />
              </div>
            )}
            {viewMode === "schedule" && <div className="flex-1" />}

            {/* Filter btn — list only */}
            {viewMode === "list" && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
                  showFilters || selectedType ? "bg-[#1a7a3c] text-white border-[#1a7a3c]" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon d={ICONS.filter} size={16} />
              </button>
            )}

            {/* View mode toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("list")}
                title="Vue liste"
                className={`flex items-center justify-center w-9 h-9 transition-colors ${
                  viewMode === "list" ? "bg-[#1a7a3c] text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon d={ICONS.list} size={15} />
              </button>
              <button
                onClick={() => setViewMode("schedule")}
                title="Vue planning"
                className={`flex items-center justify-center w-9 h-9 transition-colors border-l border-gray-200 ${
                  viewMode === "schedule" ? "bg-[#1a7a3c] text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon d={ICONS.calendar} size={15} />
              </button>
            </div>

            <button
              onClick={() => navigate("/program/create")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm shrink-0"
            >
              <Icon d={ICONS.plus} size={15} />
              Créer
            </button>
          </div>

          {viewMode === "list" && showFilters && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500">Type :</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedType("")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    !selectedType ? "bg-[#1a7a3c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tous
                </button>
                {PROGRAM_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedType === type ? "bg-[#1a7a3c] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Chargement...
          </div>
        ) : viewMode === "schedule" ? (
          <ScheduleView programs={programs} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Titre</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date début</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date fin</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Salle</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        Aucun programme trouvé.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((program, i) => (
                      <tr
                        key={program.id}
                        className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                          i === filtered.length - 1 ? "border-b-0" : ""
                        } ${!program.activated ? "opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">{program.titre}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(program.type)}`}>
                            {program.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Icon d={ICONS.calendar} size={12} className="text-gray-400" />
                            <span>{formatDateTime(program.date_debut)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Icon d={ICONS.calendar} size={12} className="text-gray-400" />
                            <span>{formatDateTime(program.date_fin)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{program.salle || "—"}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => viewProgram(program)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Voir">
                              <Icon d={ICONS.eye} size={16} />
                            </button>
                            <button onClick={() => navigate(`/program/edit/${program.id}`)} className="text-gray-400 hover:text-[#1a7a3c] transition-colors" title="Modifier">
                              <Icon d={ICONS.edit} size={16} />
                            </button>
                            <button
                              onClick={() => toggleActivated(program.id)}
                              className={`transition-colors ${program.activated ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600"}`}
                              title={program.activated ? "Désactiver" : "Activer"}
                            >
                              <Icon d={ICONS.power} size={16} />
                            </button>
                            <button onClick={() => deleteProgram(program.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                              <Icon d={ICONS.delete} size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total : {filtered.length} programme(s)</span>
                <span>
                  Actifs : {filtered.filter(p => p.activated).length} | Inactifs : {filtered.filter(p => !p.activated).length}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
