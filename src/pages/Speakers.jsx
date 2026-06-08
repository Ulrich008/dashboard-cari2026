import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { speakerService } from "../services/speakerService";

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
  building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  type:     "M4 7h16M4 12h16M4 17h10",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

const MEMBER_TYPES = [
  { value: "speaker", label: "Speaker", color: "purple" },
  { value: "program_committee", label: "Program Committee", color: "blue" },
  { value: "organizing_committee", label: "Organizing Committee", color: "green" },
];

export default function Speakers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await speakerService.getAll();
      setMembers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des speakers:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des speakers'
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = members.filter((m) => {
    const fullName = `${m.prenom} ${m.nom}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) ||
                          m.affiliation.toLowerCase().includes(search.toLowerCase()) ||
                          m.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleActivated = async (id) => {
    try {
      const member = members.find(m => m.id === id);
      const updatedData = {
        ...member,
        activated: !member.activated,
      };
      await speakerService.update(id, updatedData);
      await loadMembers();
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

  const deleteMember = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer ce membre !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await speakerService.delete(id);
        await loadMembers();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Le membre a été supprimé.',
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
    const typeMap = {
      "speaker": "bg-purple-100 text-purple-700",
      "program_committee": "bg-blue-100 text-blue-700",
      "organizing_committee": "bg-green-100 text-green-700",
    };
    return typeMap[type] || "bg-gray-100 text-gray-700";
  };

  const viewMember = (member) => {
    Swal.fire({
      title: `<strong>${member.prenom} ${member.nom}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations générales</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Type:</strong> ${member.type}</div>
              <div><strong>Email:</strong> ${member.email || '-'}</div>
              <div><strong>Statut:</strong> ${member.activated ? 'Actif' : 'Inactif'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Professionnel</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Affiliation:</strong> ${member.affiliation || '-'}</div>
              <div><strong>Website:</strong> ${member.website ? `<a href="${member.website}" target="_blank">${member.website}</a>` : '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Contact</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Téléphone:</strong> ${member.telephone || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Bio</strong>
            <div style="margin-top: 4px; color: #666;">
              ${member.bio || '-'}
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
          Gestion des Speakers / Committees
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les intervenants et membres des comités de la conférence
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 shrink-0">
              Speakers / Committees
            </span>

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
                placeholder="Rechercher par nom, affiliation ou email..."
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
              onClick={() => navigate("/speakers/create")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm shrink-0"
            >
              <Icon d={ICONS.plus} size={15} />
              Ajouter un speaker / committee
            </button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 flex-wrap">
              <span className="text-xs font-medium text-gray-500">Filtrer par type :</span>
              <div className="flex gap-2 flex-wrap">
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
                {MEMBER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedType === type.value
                        ? "bg-[#1a7a3c] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type.label}
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
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Affiliation</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    Aucun membre trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((member, i) => (
                  <tr
                    key={member.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    } ${!member.activated ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a7a3c] to-[#2d5a3f] flex items-center justify-center text-white font-semibold">
                          {member.prenom[0]}{member.nom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.prenom} {member.nom}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Icon d={ICONS.building} size={12} className="text-gray-400" />
                        <span className="text-gray-600">{member.affiliation}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(member.type)}`}>
                        {member.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${member.activated ? "text-green-600" : "text-gray-400"}`}>
                        {member.activated ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/speakers/edit/${member.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Modifier"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button
                          onClick={() => toggleActivated(member.id)}
                          className={`transition-colors ${
                            member.activated ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600"
                          }`}
                          title={member.activated ? "Désactiver" : "Activer"}
                        >
                          <Icon d={ICONS.speaker} size={16} />
                        </button>
                        <button
                          onClick={() => deleteMember(member.id)}
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
            <span>Total : {filtered.length} membre(s)</span>
            <span>
              Actifs : {filtered.filter(m => m.activated).length} |
              Inactifs : {filtered.filter(m => !m.activated).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}