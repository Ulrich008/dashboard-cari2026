import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import menuService from "../services/menuService";
import { pageService } from "../services/pageService";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
};

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
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );
}

export default function CreateMenuContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    label:     "",
    url:       "",
    parent_id: searchParams.get('parent_id') || "",
    ordre:     0,
    page_slug: "",
    activated: true,
  });
  const [rootMenus,        setRootMenus]        = useState([]);
  const [allPages,         setAllPages]         = useState([]);
  const [assignedSlugs,    setAssignedSlugs]    = useState(new Set());
  const [showSuggestions,  setShowSuggestions]  = useState(false);
  const [isLoading,        setIsLoading]        = useState(false);

  useEffect(() => {
    const flattenMenus = (arr) =>
      arr.flatMap(m => [m, ...(m.children?.length ? flattenMenus(m.children) : [])]);

    pageService.getAll()
      .then(data => setAllPages(Array.isArray(data) ? data : []))
      .catch(() => {});

    menuService.getAll()
      .then(res => {
        const all = res.data.data ?? res.data;
        setRootMenus(all.filter(m => !m.parent_id));

        const flat = flattenMenus(all);
        const used = new Set(flat.map(m => m.page_slug).filter(Boolean));
        setAssignedSlugs(used);
      })
      .catch(() => {});

    if (isEditing) {
      menuService.getById(id)
        .then(res => {
          const item = res.data.data ?? res.data;
          setFormData({
            label:     item.label     || "",
            url:       item.url       || "",
            parent_id: item.parent_id ? String(item.parent_id) : "",
            ordre:     item.ordre     ?? 0,
            page_slug: item.page_slug || "",
            activated: item.activated !== undefined ? item.activated : true,
          });
          // En mode edit, le slug actuel ne doit pas bloquer la suggestion
          setAssignedSlugs(prev => {
            const next = new Set(prev);
            next.delete(item.page_slug);
            return next;
          });
        })
        .catch(() => Swal.fire('Erreur', 'Impossible de charger le menu.', 'error'));
    }
  }, [id, isEditing]);

  const slugSuggestions = useMemo(() => {
    const query = formData.page_slug.toLowerCase();
    return allPages
      .map(p => p.slug)
      .filter(s => s && !assignedSlugs.has(s) && s.toLowerCase().includes(query));
  }, [allPages, assignedSlugs, formData.page_slug]);

  const handleSave = async () => {
    if (!formData.label.trim()) {
      Swal.fire({ icon: 'warning', title: 'Attention', text: 'Le libellé est requis.' });
      return;
    }
    setIsLoading(true);
    const payload = {
      label:     formData.label,
      url:       formData.url       || null,
      parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      ordre:     Number(formData.ordre) || 0,
      page_slug: formData.page_slug || null,
      activated: formData.activated,
    };
    try {
      if (isEditing) {
        await menuService.update(id, payload);
        Swal.fire({ icon: 'success', title: 'Menu mis à jour', timer: 1500, showConfirmButton: false });
      } else {
        await menuService.create(payload);
        Swal.fire({ icon: 'success', title: 'Menu créé', timer: 1500, showConfirmButton: false });
      }
      navigate('/menus');
    } catch (err) {
      Swal.fire('Erreur', err?.response?.data?.message ?? 'Erreur lors de la sauvegarde.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const field = (label, required = false, children) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-[#1a7a3c]">*</span>}
      </label>
      {children}
    </div>
  );

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition";

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isEditing ? "Modifier un menu" : "Créer un menu"}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/menus')}
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

      {/* Form */}
      <div className="px-8 pb-8">
        <div className="max-w-xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          {field("Libellé du menu", true,
            <input type="text" value={formData.label}
              onChange={e => setFormData({ ...formData, label: e.target.value })}
              placeholder="Ex: CALLS, Call for Papers…" className={inputClass} />
          )}

          {field("URL (lien de navigation)", false,
            <>
              <input type="text" value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                placeholder="Ex: /calls/papers (vide pour menu parent sans lien)" className={inputClass} />
              <p className="text-xs text-gray-400">Laisser vide pour les menus parents sans lien direct.</p>
            </>
          )}

          {field("Menu parent (sous-menu de…)", false,
            <select value={formData.parent_id}
              onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
              className={inputClass}>
              <option value="">— Aucun (menu racine) —</option>
              {rootMenus.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          )}

          {field("Ordre d'affichage", false,
            <input type="number" min={0} value={formData.ordre}
              onChange={e => setFormData({ ...formData, ordre: e.target.value })}
              className={inputClass} />
          )}

          {field("Slug de la page associée (optionnel)", false,
            <>
              <div className="relative">
                <input
                  type="text"
                  value={formData.page_slug}
                  onChange={e => setFormData({ ...formData, page_slug: e.target.value })}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Ex: calls-papers"
                  className={`${inputClass} font-mono`}
                  autoComplete="off"
                />
                {showSuggestions && slugSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {slugSuggestions.map(slug => (
                      <li
                        key={slug}
                        onMouseDown={() => {
                          setFormData(prev => ({ ...prev, page_slug: slug }));
                          setShowSuggestions(false);
                        }}
                        className="px-3 py-2 text-sm font-mono text-gray-700 hover:bg-[#1a7a3c]/10 cursor-pointer"
                      >
                        {slug}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Relier ce menu à une page existante. Tapez pour filtrer les slugs disponibles.
                {formData.page_slug && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, page_slug: "" }))}
                    className="ml-2 text-red-400 hover:text-red-600"
                  >
                    Effacer
                  </button>
                )}
              </p>
            </>
          )}

          <div className="border-t border-gray-100" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Activé</span>
            <div className="flex flex-col items-end gap-1">
              <Toggle checked={formData.activated} onChange={v => setFormData({ ...formData, activated: v })} />
              <span className={`text-xs font-medium ${formData.activated ? "text-[#1a7a3c]" : "text-gray-400"}`}>
                {formData.activated ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
