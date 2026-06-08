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
  speaker:  "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  calendar: "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  time:     "M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  power:    "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

const PROGRAM_TYPES = ["keynote", "session", "workshop", "panel", "break", "social"];

export default function Program() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [programs, setPrograms] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les programmes depuis l'API au démarrage
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await programmeService.getAll();
      setPrograms(data);
    } catch (error) {
      console.error("Erreur lors du chargement des programmes:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des programmes'
      });
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
      const updatedData = {
        ...program,
        activated: !program.activated,
      };
      await programmeService.update(id, updatedData);
      await loadPrograms();
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Statut mis à jour avec succès',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la mise à jour du statut'
      });
    }
  };

  const deleteProgram = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer ce programme !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await programmeService.delete(id);
        await loadPrograms();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Le programme a été supprimé.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression'
        });
      }
    }
  };

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case "keynote": return "bg-purple-100 text-purple-700";
      case "session": return "bg-blue-100 text-blue-700";
      case "workshop": return "bg-green-100 text-green-700";
      case "panel": return "bg-orange-100 text-orange-700";
      case "break": return "bg-pink-100 text-pink-700";
      case "social": return "bg-indigo-100 text-indigo-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', '');
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const viewProgram = (program) => {
    Swal.fire({
      title: `<strong>${program.titre}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations générales</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Type:</strong> ${program.type}</div>
              <div><strong>Description:</strong> ${program.description || '-'}</div>
              <div><strong>Salle:</strong> ${program.salle || '-'}</div>
              <div><strong>Statut:</strong> ${program.activated ? 'Actif' : 'Inactif'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Horaires</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Date de début:</strong> ${formatDateTime(program.date_debut)}</div>
              <div><strong>Date de fin:</strong> ${formatDateTime(program.date_fin)}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Speakers/Committees</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Speaker IDs:</strong> ${program.speaker_committee_ids && program.speaker_committee_ids.length > 0 ? program.speaker_committee_ids.join(', ') : '-'}</div>
              <div><strong>Papier IDs:</strong> ${program.papier_ids && program.papier_ids.length > 0 ? program.papier_ids.join(', ') : '-'}</div>
            </div>
          </div>
        </div>
      `,
      width: '600px',
      showConfirmButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#1a7a3c',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Gestion des Programmes
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les sessions, keynotes, workshops et panels de la conférence
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 shrink-0">Programmes</span>

            <div className="flex-1 relative">
              <Icon
                d={ICONS.search}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre ou speaker..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
                showFilters || selectedType ? "bg-[#1a7a3c] text-white border-[#1a7a3c]" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon d={ICONS.filter} size={16} />
            </button>

            <button
              onClick={() => navigate("/program/create")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm shrink-0"
            >
              <Icon d={ICONS.plus} size={15} />
              Créer un programme
            </button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500">Filtrer par type :</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType("")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    !selectedType
                      ? "bg-[#1a7a3c] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tous
                </button>
                {PROGRAM_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedType === type
                        ? "bg-[#1a7a3c] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {program.titre}
                    </td>
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
                    <td className="px-4 py-4 text-gray-600">
                      {program.salle}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => viewProgram(program)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Voir les détails"
                        >
                          <Icon d={ICONS.eye} size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/program/edit/${program.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Modifier"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button
                          onClick={() => toggleActivated(program.id)}
                          className={`transition-colors ${
                            program.activated ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600"
                          }`}
                          title={program.activated ? "Désactiver" : "Activer"}
                        >
                          <Icon d={ICONS.power} size={16} />
                        </button>
                        <button
                          onClick={() => deleteProgram(program.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
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
              Actifs : {filtered.filter(p => p.activated).length} |
              Inactifs : {filtered.filter(p => !p.activated).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}