import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { sponsorService } from "../services/sponsorService";

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
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  link:     "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  power:    "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
};

const SPONSOR_TYPES = [
  { value: "Platinum Sponsor", label: "Platinum Sponsor", color: "purple" },
  { value: "Gold Sponsor", label: "Gold Sponsor", color: "yellow" },
  { value: "Silver Sponsor", label: "Silver Sponsor", color: "gray" },
  { value: "Bronze Sponsor", label: "Bronze Sponsor", color: "orange" },
  { value: "Partners Institution", label: "Partners Institution", color: "blue" },
  { value: "Media Partner", label: "Media Partner", color: "pink" },
  { value: "Academic Partner", label: "Academic Partner", color: "green" },
];

export default function Sponsors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sponsors, setSponsors] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const data = await sponsorService.getAll();
      setSponsors(data);
    } catch (error) {
      console.error("Erreur lors du chargement des sponsors:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des sponsors'
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = sponsors.filter((s) => {
    const matchesSearch = (s.nom || s.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (s.type || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || s.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleOnline = async (id) => {
    try {
      const sponsor = sponsors.find(s => s.id === id);
      const updatedData = {
        ...sponsor,
        affiche_site_public: !sponsor.affiche_site_public,
      };
      await sponsorService.update(id, updatedData);
      await loadSponsors();
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

  const deleteSponsor = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer ce sponsor !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await sponsorService.delete(id);
        await loadSponsors();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Le sponsor a été supprimé.',
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
      "Platinum Sponsor": "bg-purple-100 text-purple-700",
      "Gold Sponsor": "bg-yellow-100 text-yellow-700",
      "Silver Sponsor": "bg-gray-100 text-gray-700",
      "Bronze Sponsor": "bg-orange-100 text-orange-700",
      "Partners Institution": "bg-blue-100 text-blue-700",
      "Media Partner": "bg-pink-100 text-pink-700",
      "Academic Partner": "bg-green-100 text-green-700",
    };
    return typeMap[type] || "bg-gray-100 text-gray-700";
  };

  const viewSponsor = (sponsor) => {
    Swal.fire({
      title: `<strong>${sponsor.nom}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations générales</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Type:</strong> ${sponsor.type}</div>
              <div><strong>Statut:</strong> ${sponsor.activated ? 'Actif' : 'Inactif'}</div>
              <div><strong>Affiché sur site public:</strong> ${sponsor.affiche_site_public ? 'Oui' : 'Non'}</div>
              <div><strong>Ordre d'affichage:</strong> ${sponsor.ordre_affichage || 0}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Contact</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Email:</strong> ${sponsor.email || '-'}</div>
              <div><strong>Téléphone:</strong> ${sponsor.telephone || '-'}</div>
              <div><strong>Site web:</strong> ${sponsor.url ? `<a href="${sponsor.url}" target="_blank">${sponsor.url}</a>` : '-'}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Description</strong>
            <div style="margin-top: 4px; color: #666;">
              ${sponsor.description || '-'}
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
          Gestion des Sponsors / Partners
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les sponsors et partenaires de la conférence
        </p>
      </div>

      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 shrink-0">
              Sponsors / Partners
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
                placeholder="Rechercher par nom, ID public ou type..."
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
              onClick={() => navigate("/sponsors/create")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm shrink-0"
            >
              <Icon d={ICONS.plus} size={15} />
              Ajouter un sponsor/partner
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
                {SPONSOR_TYPES.map((type) => (
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
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Id Public</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Lien</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    Aucun sponsor trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((sponsor, i) => (
                  <tr
                    key={sponsor.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    } ${!sponsor.activated ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a7a3c] to-[#2d5a3f] flex items-center justify-center text-white font-semibold text-sm">
                          {(sponsor.nom || sponsor.name || "").charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{sponsor.nom || sponsor.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(sponsor.type)}`}>
                        {sponsor.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={sponsor.url || sponsor.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#1a7a3c] hover:underline text-sm"
                      >
                        <Icon d={ICONS.link} size={14} />
                        <span>Site web</span>
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${sponsor.affiche_site_public !== undefined ? (sponsor.affiche_site_public ? "text-green-600" : "text-gray-400") : (sponsor.online ? "text-green-600" : "text-gray-400")}`}>
                        {sponsor.affiche_site_public !== undefined ? (sponsor.affiche_site_public ? "Visible" : "Masqué") : (sponsor.online ? "Actif" : "Inactif")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => viewSponsor(sponsor)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Voir les détails"
                        >
                          <Icon d={ICONS.eye} size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/sponsors/edit/${sponsor.id}`)}
                          className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                          title="Modifier"
                        >
                          <Icon d={ICONS.edit} size={16} />
                        </button>
                        <button
                          onClick={() => toggleOnline(sponsor.id)}
                          className={`transition-colors ${
                            sponsor.affiche_site_public !== undefined ? (sponsor.affiche_site_public ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600") : (sponsor.online ? "text-green-600 hover:text-red-400" : "text-gray-300 hover:text-green-600")
                          }`}
                          title={sponsor.affiche_site_public !== undefined ? (sponsor.affiche_site_public ? "Masquer" : "Afficher") : (sponsor.online ? "Désactiver" : "Activer")}
                        >
                          <Icon d={ICONS.power} size={16} />
                        </button>
                        <button
                          onClick={() => deleteSponsor(sponsor.id)}
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
            <span>Total : {filtered.length} sponsor(s)</span>
            <span>
              Actifs : {filtered.filter(s => s.online).length} | 
              Inactifs : {filtered.filter(s => !s.online).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}