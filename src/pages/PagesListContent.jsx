import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { pageService } from "../services/pageService";

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
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  filter:  "M4 6h16M7 12h10M10 18h4",
  plus:    "M12 5v14M5 12h14",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  power:   "M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10",
  chevron: "M9 18l6-6-6-6",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  delete:  "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
};

export default function PagesListContent() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [pages, setPages]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await pageService.getAll();
      setPages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des pages:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement des pages'
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = pages.filter(
    (p) =>
      (p.titre || p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.slug || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleOnline = async (id) => {
    try {
      const page = pages.find(p => p.id === id);
      const updatedData = {
        ...page,
        activated: !page.activated,
      };
      await pageService.update(id, updatedData);
      await loadPages();
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

  const deletePage = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas récupérer cette page !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await pageService.delete(id);
        await loadPages();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'La page a été supprimée.',
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

  const viewPage = (page) => {
    Swal.fire({
      title: `<strong>${page.titre || page.title}</strong>`,
      html: `
        <div class="text-left" style="font-size: 14px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Informations générales</strong>
            <div style="margin-top: 4px; color: #666;">
              <div><strong>Slug:</strong> ${page.slug || '-'}</div>
              <div><strong>Contexte:</strong> ${page.contexte || page.context || '-'}</div>
              <div><strong>Statut:</strong> ${page.statut || '-'}</div>
              <div><strong>Activé:</strong> ${page.activated !== undefined ? (page.activated ? 'Oui' : 'Non') : (page.online ? 'Oui' : 'Non')}</div>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #1a7a3c;">Contenu</strong>
            <div style="margin-top: 4px; color: #666; max-height: 200px; overflow-y: auto;">
              ${page.contenu_html || page.content || '-'}
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
      {/* ── Page title ── */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Gestions des pages publiques
        </h1>
      </div>

      {/* ── Table card ── */}
      <div className="mx-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="text-base font-bold text-gray-900 shrink-0">Pages</span>

          {/* Search */}
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
              placeholder="Recherchez une page"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
          </div>

          {/* Filter button */}
          <button className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
            <Icon d={ICONS.filter} size={16} />
          </button>

          {/* Create button */}
          <button
            onClick={() => navigate("/pages/create")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm shrink-0"
          >
            <Icon d={ICONS.plus} size={15} />
            Créer une page
          </button>
        </div>

        {/* ── Table ── */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Titre</th>
              <th className="text-left px-4 py-3 text-gray-400 font-normal italic">slug</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">contexte</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Dernière modif.</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  Aucune page trouvée.
                </td>
              </tr>
            ) : (
              filtered.map((page, i) => (
                <tr
                  key={page.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{page.titre || page.title}</td>
                  <td className="px-4 py-4 text-gray-500 font-mono text-xs">{page.slug}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide">
                      {page.contexte || page.context}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{page.updated_at || page.lastModified}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      page.statut === 'published' ? 'bg-green-100 text-green-700' :
                      page.statut === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {page.statut === 'published' ? 'Publié' : page.statut === 'draft' ? 'Brouillon' : 'Archivé'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => viewPage(page)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Voir les détails"
                      >
                        <Icon d={ICONS.eye} size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/pages/edit/${page.id}`)}
                        className="text-gray-400 hover:text-[#1a7a3c] transition-colors"
                        title="Modifier"
                      >
                        <Icon d={ICONS.edit} size={16} />
                      </button>
                      <button
                        onClick={() => toggleOnline(page.id)}
                        className={`transition-colors ${
                          page.activated !== undefined ? (page.activated ? "text-[#1a7a3c] hover:text-red-400" : "text-gray-300 hover:text-[#1a7a3c]") : (page.online ? "text-[#1a7a3c] hover:text-red-400" : "text-gray-300 hover:text-[#1a7a3c]")
                        }`}
                        title={page.activated !== undefined ? (page.activated ? "Désactiver" : "Activer") : (page.online ? "Mettre hors ligne" : "Mettre en ligne")}
                      >
                        <Icon d={ICONS.power} size={16} />
                      </button>
                      <button
                        onClick={() => deletePage(page.id)}
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
    </div>
  );
}