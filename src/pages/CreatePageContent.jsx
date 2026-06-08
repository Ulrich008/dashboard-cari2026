import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { pageService } from "../services/pageService";
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
  save:     "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  link:     "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
};

/* ── Toggle component ── */
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#1a7a3c]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ── Main component ── */
export default function CreatePageContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    titre: "",
    slug: "",
    contexte: "",
    contenu_html: "",
    statut: "draft",
    activated: true,
  });
  const [tab, setTab] = useState("editor"); // "editor" | "preview"
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadPage();
    }
  }, [id, isEditing]);

  const loadPage = async () => {
    try {
      const page = await pageService.getById(id);
      setFormData({
        titre: page.titre || "",
        slug: page.slug || "",
        contexte: page.contexte || "",
        contenu_html: page.contenu_html || "",
        statut: page.statut || "draft",
        activated: page.activated !== undefined ? page.activated : true,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la page:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du chargement de la page'
      });
    }
  };

  /* Auto-generate slug from title */
  const handleTitleChange = (v) => {
    setFormData({ ...formData, titre: v });
    setFormData(prev => ({
      ...prev,
      slug: v
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    }));
  };

  const handleSave = async () => {
    if (!formData.titre.trim() || !formData.contenu_html.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Le titre et le contenu sont requis'
      });
      return;
    }

    setIsLoading(true);
    try {
      const pageData = {
        titre: formData.titre,
        slug: formData.slug,
        contexte: formData.contexte,
        contenu_html: formData.contenu_html,
        statut: formData.statut,
        activated: formData.activated,
      };

      if (isEditing) {
        await pageService.update(id, pageData);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Page mise à jour avec succès',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await pageService.create(pageData);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Page créée avec succès',
          timer: 1500,
          showConfirmButton: false
        });
      }

      navigate("/pages");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la sauvegarde de la page'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isEditing ? "Modifier une page" : "Créer une page"}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/pages")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50"
          >
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "En cours..." : (isEditing ? "Mettre à jour" : "Enregistrer")}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 px-8 pb-8 flex gap-6">
        {/* ── Left: form ── */}
        <div className="w-[320px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5 self-start">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Titre <span className="text-[#1a7a3c]">*</span>
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ex: À propos"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Slug (URL) <span className="text-[#1a7a3c]">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="ex: a-propos"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition font-mono"
            />
            <p className="text-xs text-gray-400">sans espace ni accents</p>
          </div>

          {/* Context */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Contexte (Type) <span className="text-[#1a7a3c]">*</span>
            </label>
            <input
              type="text"
              value={formData.contexte}
              onChange={(e) => setFormData({ ...formData, contexte: e.target.value })}
              placeholder="Ex: header, footer…"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            />
            <p className="text-xs text-gray-400">où cette page doit-elle apparaître ?</p>
          </div>

          {/* Statut */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Statut
            </label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* État */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Activé</span>
            <div className="flex flex-col items-end gap-1">
              <Toggle checked={formData.activated} onChange={(v) => setFormData({ ...formData, activated: v })} />
              <span className={`text-xs font-medium ${formData.activated ? "text-[#1a7a3c]" : "text-gray-400"}`}>
                {formData.activated ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: editor ── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setTab("editor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tab === "editor"
                    ? "bg-gray-100 text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon d={ICONS.edit} size={13} />
                Éditeur React/HTML
              </button>
              <button
                onClick={() => setTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tab === "preview"
                    ? "bg-gray-100 text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon d={ICONS.eye} size={13} />
                Aperçu
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Icon d={ICONS.link} size={13} />
              Insérer Document
            </button>
          </div>

          {/* Editor / Preview area */}
          <div className="flex-1 flex flex-col">
            {tab === "editor" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<!-- Écrivez votre contenu React/HTML ici -->"
                spellCheck={false}
                className="flex-1 w-full p-5 text-sm font-mono text-gray-700 placeholder-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed"
                style={{ minHeight: "420px" }}
              />
            ) : (
              <div
                className="flex-1 p-5 text-sm text-gray-700 overflow-auto"
                dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-300 italic'>Aucun contenu à afficher.</p>" }}
              />
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/60">
            <p className="text-xs text-gray-400 text-center">
              Utilisez des balises React/HTML pour formater votre contenu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}