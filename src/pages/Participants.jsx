import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { participantService } from "../services/participantService";
import Swal from "sweetalert2";

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
  user:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  calendar: "M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  check:    "M20 6L9 17l-5-5",
  clock:    "M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  ticket:   "M20 12v-2a2 2 0 0 0-2-2h-2M4 12v-2a2 2 0 0 1 2-2h2M20 12v4a2 2 0 0 1-2 2h-2M4 12v4a2 2 0 0 0 2 2h2M8 8h8M8 16h8",
};

const PARTICIPANT_TYPES = [
  { value: "regular", label: "Regular", color: "blue" },
  { value: "student", label: "Student", color: "green" },
];

const ACCOUNT_STATUS = [
  { value: "ACTIF", label: "Actif", color: "green" },
  { value: "DESACTIVE", label: "Désactivé", color: "red" },
];

const SAMPLE_PARTICIPANTS = [];

export default function Participants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const data = await participantService.getAll();
      setParticipants(data);
    } catch (error) {
      console.error("Erreur lors du chargement des participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = participants.filter((p) => {
    const matchesSearch = p.email?.toLowerCase().includes(search.toLowerCase()) ||
                          p.prenom?.toLowerCase().includes(search.toLowerCase()) ||
                          p.nom?.toLowerCase().includes(search.toLowerCase()) ||
                          p.affiliation?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || p.type_participant === selectedType;
    const matchesStatus = !selectedStatus || p.statut_compte === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedParticipants.length === filtered.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(filtered.map(p => p.id));
    }
  };

  const toggleSelectParticipant = (id) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(i => i !== id));
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  useEffect(() => {
    setShowBulkActions(selectedParticipants.length > 0);
  }, [selectedParticipants]);

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      const participant = participants.find(p => p.id === id);
      const updatedData = {
        ...participant,
        statut_compte: newStatus,
      };
      await participantService.update(id, updatedData);
      await loadParticipants();
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: `Statut mis à jour avec succès`,
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

  const deleteParticipant = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer ce participant !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await participantService.delete(id);
        await loadParticipants();
        setSelectedParticipants(selectedParticipants.filter(i => i !== id));
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Le participant a été supprimé.',
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

  const generateCertificate = (id) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === id ? { ...p, certificateGenerated: true } : p
      )
    );
    alert(`Certificat généré pour le participant #${id}`);
  };

  const printBadge = (id) => {
    const participant = participants.find(p => p.id === id);
    if (participant) {
      // Simuler l'impression du badge
      alert(`Impression du badge pour ${participant.name}`);
      setParticipants(prev =>
        prev.map(p =>
          p.id === id ? { ...p, badgePrinted: true } : p
        )
      );
    }
  };

  const exportParticipants = () => {
    const csv = [
      ["Nom", "Prénom", "Email", "Type", "Statut", "Affiliation", "Pays", "Téléphone", "Auteur"],
      ...filtered.map(p => [
        p.nom || '',
        p.prenom || '',
        p.email || '',
        p.type_participant || '',
        p.statut_compte || '',
        p.affiliation || '',
        p.pays || '',
        p.telephone || '',
        p.est_auteur ? 'Oui' : 'Non'
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeBadgeColor = (type) => {
    const typeMap = {
      "regular": "bg-blue-100 text-blue-700",
      "student": "bg-green-100 text-green-700",
    };
    return typeMap[type] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      "ACTIF": "bg-green-100 text-green-700",
      "DESACTIVE": "bg-red-100 text-red-700",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      "ACTIF": "Actif",
      "DESACTIVE": "Désactivé",
    };
    return statusMap[status] || status;
  };

  const viewParticipant = (participant) => {
    Swal.fire({
      title: `<strong>${participant.prenom} ${participant.nom}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations de compte</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Email:</strong> ${participant.email}</div>
              <div><strong>Type:</strong> ${participant.type_participant === 'regular' ? 'Régulier' : 'Étudiant'}</div>
              <div><strong>Statut:</strong> ${getStatusLabel(participant.statut_compte)}</div>
              <div><strong>Auteur:</strong> ${participant.est_auteur ? 'Oui' : 'Non'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Identité personnelle</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Titre:</strong> ${participant.titre || '-'}</div>
              <div><strong>Genre:</strong> ${participant.genre || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations professionnelles</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Institution:</strong> ${participant.institution || '-'}</div>
              <div><strong>Département:</strong> ${participant.departement || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Adresse</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Adresse:</strong> ${participant.adresse || '-'}</div>
              <div><strong>Ville:</strong> ${participant.ville || '-'}</div>
              <div><strong>Région:</strong> ${participant.region || '-'}</div>
              <div><strong>Code postal:</strong> ${participant.code_postal || '-'}</div>
              <div><strong>Pays:</strong> ${participant.pays || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Contact</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Téléphone:</strong> ${participant.telephone || '-'}</div>
              <div><strong>Mobile:</strong> ${participant.mobile || '-'}</div>
              <div><strong>Fax:</strong> ${participant.fax || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Préférences</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Préférences alimentaires:</strong> ${participant.preferences_alimentaires || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Facturation</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Institution de facturation:</strong> ${participant.facturation_institution || '-'}</div>
              <div><strong>Adresse de facturation:</strong> ${participant.facturation_adresse || '-'}</div>
              <div><strong>Bureau fiscal:</strong> ${participant.bureau_fiscal || '-'}</div>
              <div><strong>Numéro fiscal:</strong> ${participant.numero_fiscal || '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Diversité</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Résidence:</strong> ${participant.residence || '-'}</div>
              <div><strong>Handicap:</strong> ${participant.handicap || '-'}</div>
              <div><strong>Autre religion:</strong> ${participant.autre_religion || '-'}</div>
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

  const stats = {
    total: participants.length,
    active: participants.filter(p => p.statut_compte === "ACTIF").length,
    inactive: participants.filter(p => p.statut_compte === "DESACTIVE").length,
    authors: participants.filter(p => p.est_auteur).length,
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* En-tête */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Gestion des participants
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les inscriptions, paiements et badges des participants
        </p>
      </div>

      {/* Statistiques */}
      <div className="px-8 pb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Total participants</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Actifs</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Désactivés</p>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Auteurs</p>
            <p className="text-2xl font-bold text-[#1a7a3c]">{stats.authors}</p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 shrink-0">
              Participants
            </span>

            <div className="flex-1 relative">
              <Icon d={ICONS.search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email ou institution..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 transition-colors shrink-0 ${
                showFilters || selectedType || selectedStatus ? "bg-[#1a7a3c] text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon d={ICONS.filter} size={16} />
            </button>

            <button
              onClick={exportParticipants}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors shrink-0"
            >
              <Icon d={ICONS.download} size={15} />
              Exporter CSV
            </button>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Type :</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
                >
                  <option value="">Tous</option>
                  {PARTICIPANT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Statut :</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none"
                >
                  <option value="">Tous</option>
                  {ACCOUNT_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              {(selectedType || selectedStatus) && (
                <button
                  onClick={() => { setSelectedType(""); setSelectedStatus(""); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions groupées */}
        {showBulkActions && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedParticipants.length} participant(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  for (const id of selectedParticipants) {
                    await updatePaymentStatus(id, "ACTIF");
                  }
                  setSelectedParticipants([]);
                }}
                className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
              >
                Activer
              </button>
              <button
                onClick={async () => {
                  for (const id of selectedParticipants) {
                    await updatePaymentStatus(id, "DESACTIVE");
                  }
                  setSelectedParticipants([]);
                }}
                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
              >
                Désactiver
              </button>
              <button
                onClick={async () => {
                  const result = await Swal.fire({
                    title: 'Êtes-vous sûr ?',
                    text: `Supprimer ${selectedParticipants.length} participant(s) ?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Oui, supprimer !',
                    cancelButtonText: 'Annuler'
                  });

                  if (result.isConfirmed) {
                    for (const id of selectedParticipants) {
                      await deleteParticipant(id);
                    }
                    setSelectedParticipants([]);
                  }
                }}
                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                  />
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Affiliation</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Pays</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Auteur</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
                    Aucun participant trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((participant, i) => (
                  <tr
                    key={participant.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => toggleSelectParticipant(participant.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1a7a3c] focus:ring-[#1a7a3c]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a7a3c] to-[#2d5a3f] flex items-center justify-center text-white text-xs font-semibold">
                          {participant.prenom?.[0] || ''}{participant.nom?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{participant.prenom} {participant.nom}</p>
                          <p className="text-xs text-gray-400">{participant.pays}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Icon d={ICONS.mail} size={12} className="text-gray-400" />
                        <span className="text-gray-600 text-sm">{participant.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(participant.type_participant)}`}>
                        {participant.type_participant}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm max-w-xs truncate">
                      {participant.affiliation}
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      {participant.pays}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={participant.statut_compte}
                        onChange={(e) => updatePaymentStatus(participant.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 focus:ring-1 focus:ring-[#1a7a3c] ${getStatusBadgeColor(participant.statut_compte)}`}
                      >
                        {ACCOUNT_STATUS.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${participant.est_auteur ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                        {participant.est_auteur ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewParticipant(participant)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Voir les détails"
                        >
                          <Icon d={ICONS.eye} size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/participants/edit/${participant.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Modifier"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button
                          onClick={() => deleteParticipant(participant.id)}
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total : {filtered.length} participant(s)</span>
            <div className="flex gap-4">
              <span>Actifs : {filtered.filter(p => p.statut_compte === "ACTIF").length}</span>
              <span>Désactivés : {filtered.filter(p => p.statut_compte === "DESACTIVE").length}</span>
              <span>Auteurs : {filtered.filter(p => p.est_auteur).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}