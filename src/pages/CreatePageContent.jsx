import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { pageService } from "../services/pageService";
import menuService from "../services/menuService";
import { speakerService }  from "../services/speakerService";
import { sponsorService }  from "../services/sponsorService";
import { documentService } from "../services/documentService";
import { programService }  from "../services/programService";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  save:     "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  chevron:  "M6 9l6 6 6-6",
  insert:   "M12 5v14M5 12h14",
};

function Toggle({ checked, onChange }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-[#1a7a3c]" : "bg-gray-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

/* Insert text at cursor position in a textarea */
function insertAtCursor(textareaRef, snippet) {
  const el = textareaRef.current;
  if (!el) return;
  const start = el.selectionStart;
  const end   = el.selectionEnd;
  const before = el.value.substring(0, start);
  const after  = el.value.substring(end);
  const newVal = before + snippet + after;
  el.focus();
  const nativeInput = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
  nativeInput.set.call(el, newVal);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  const cursorPos = start + snippet.length;
  el.setSelectionRange(cursorPos, cursorPos);
}

/* Collapsible section for the right panel */
function InsertSection({ title, count, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
          {count !== undefined && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${count > 0 ? 'bg-[#1a7a3c]/10 text-[#1a7a3c]' : 'bg-gray-100 text-gray-400'}`}>
              {count}
            </span>
          )}
        </div>
        <Icon d={ICONS.chevron} size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

/* Generic insert widget: select + button */
function InsertWidget({ items, labelKey, onInsert, placeholder = "Choisir…" }) {
  const [selected, setSelected] = useState("");
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic text-center py-1">Aucun élément disponible</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <select value={selected} onChange={e => setSelected(e.target.value)}
        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c]">
        <option value="">{placeholder}</option>
        {safeItems.map((item, i) => (
          <option key={item.id ?? i} value={item.id}>
            {item[labelKey] || `— item ${item.id ?? i + 1} —`}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          if (selected) {
            const found = safeItems.find(i => String(i.id) === String(selected));
            if (found) { onInsert(found); setSelected(""); }
          }
        }}
        disabled={!selected}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a7a3c] text-white text-xs font-semibold hover:bg-[#155f2f] transition-colors disabled:opacity-40">
        <Icon d={ICONS.insert} size={12} />
        Insérer
      </button>
    </div>
  );
}

/* HTML snippet generators — champs alignés sur les Resources Laravel réels */
const snippets = {
  speaker: (s) => `<div style="background:#f3f4f6;padding:1rem;border-radius:0.5rem;margin-bottom:0.75rem;">
  <p style="font-weight:bold;color:#111827;margin:0 0 0.25rem;">${s.nom_complet ?? ''}</p>
  <p style="color:#6b7280;font-size:0.875rem;margin:0 0 0.25rem;">${s.type ?? ''}</p>
  ${s.affiliation ? `<p style="color:#6b7280;font-size:0.875rem;margin:0;">${s.affiliation}</p>` : ''}
</div>`,

  sponsor: (s) => `<div style="background:#f3f4f6;padding:0.75rem 1rem;border-radius:0.5rem;margin-bottom:0.5rem;">
  <p style="font-weight:bold;color:#111827;margin:0 0 0.125rem;">${s.nom}</p>
  ${s.type ? `<p style="color:#6b7280;font-size:0.875rem;margin:0 0 0.25rem;">${s.type}</p>` : ''}
  ${s.url ? `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;font-size:0.875rem;text-decoration:underline;">${s.url}</a>` : ''}
</div>`,

  document: (d) => `<a href="${d.lien ?? '#'}" target="_blank" rel="noopener noreferrer"
  style="display:inline-flex;align-items:center;gap:0.5rem;background:#16a34a;color:white;padding:0.5rem 1rem;border-radius:0.375rem;text-decoration:none;font-size:0.875rem;font-weight:500;margin-bottom:0.5rem;">
  📄 ${d.nom_document ?? 'Document'}
</a>`,

  program: (p) => `<div style="border-left:4px solid #16a34a;padding:0.75rem 1rem;background:#f3f4f6;margin-bottom:0.75rem;border-radius:0 0.5rem 0.5rem 0;">
  ${p.date_debut ? `<p style="color:#6b7280;font-size:0.75rem;margin:0 0 0.25rem;">${p.date_debut}${p.date_fin ? ' – ' + p.date_fin : ''}</p>` : ''}
  <p style="font-weight:bold;color:#111827;margin:0 0 0.25rem;">${p.titre ?? ''}</p>
  ${p.description ? `<p style="color:#6b7280;font-size:0.875rem;margin:0;">${p.description}</p>` : ''}
</div>`,
};

/* ── Main component ── */
export default function CreatePageContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const textareaRef = useRef(null);

  const [formData, setFormData] = useState({
    titre: "", slug: "", contexte: "", description: "", url_frontend: "",
    contenu_html: "", statut: "draft", activated: true,
    menu_parent_id: "", menu_label: "", menu_ordre: 0,
  });
  const [tab, setTab] = useState("editor");
  const [isLoading, setIsLoading] = useState(false);

  // Data for insert panels
  const [rootMenus,  setRootMenus]  = useState([]);
  const [speakers,   setSpeakers]   = useState([]);
  const [sponsors,   setSponsors]   = useState([]);
  const [documents,  setDocuments]  = useState([]);
  const [programs,   setPrograms]   = useState([]);

  useEffect(() => {
    // Load data for insert panels (best-effort)
    // menuService returns an Axios promise → extract r.data.data
    // speakerService / sponsorService / documentService / programService are async
    // and already return the array directly
    menuService.getAll().then(r => setRootMenus((r.data.data ?? r.data).filter(m => !m.parent_id))).catch(() => {});
    speakerService.getAll().then(arr => {
      const data = Array.isArray(arr) ? arr : [];
      setSpeakers(data.map(s => ({ ...s, nom_complet: `${s.prenom ?? ''} ${s.nom ?? ''}`.trim() })));
    }).catch(() => {});
    sponsorService.getAll().then(arr => setSponsors(Array.isArray(arr) ? arr : [])).catch(() => {});
    documentService.getAll().then(arr => setDocuments(Array.isArray(arr) ? arr : [])).catch(() => {});
    programService.getAll().then(arr => setPrograms(Array.isArray(arr) ? arr : [])).catch(() => {});

    if (isEditing) {
      pageService.getById(id)
        .then(page => {
          setFormData({
            titre:          page.titre          || "",
            slug:           page.slug           || "",
            contexte:       page.contexte       || "",
            description:    page.description    || "",
            url_frontend:   page.url_frontend   || "",
            contenu_html:   page.contenu_html   || "",
            statut:         page.statut         || "draft",
            activated:      page.activated !== undefined ? page.activated : true,
            menu_parent_id: "",
            menu_label:     "",
            menu_ordre:     0,
          });
        })
        .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger la page.' }));
    }
  }, [id, isEditing]);

  const handleTitleChange = (v) => {
    setFormData(prev => ({
      ...prev,
      titre: v,
      slug: v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleSave = async () => {
    if (!formData.titre.trim() || !formData.contenu_html.trim()) {
      Swal.fire({ icon: 'warning', title: 'Attention', text: 'Le titre et le contenu sont requis.' });
      return;
    }
    setIsLoading(true);
    const payload = {
      titre:          formData.titre,
      slug:           formData.slug,
      contexte:       formData.contexte || 'general',
      description:    formData.description    || null,
      url_frontend:   formData.url_frontend   || null,
      contenu_html:   formData.contenu_html,
      statut:         formData.statut,
      activated:      formData.activated,
      menu_parent_id: formData.menu_parent_id ? Number(formData.menu_parent_id) : null,
      menu_label:     formData.menu_label     || null,
      menu_ordre:     formData.menu_ordre     ? Number(formData.menu_ordre) : 0,
    };
    try {
      if (isEditing) {
        await pageService.update(id, payload);
        Swal.fire({ icon: 'success', title: 'Page mise à jour', timer: 1500, showConfirmButton: false });
      } else {
        await pageService.create(payload);
        Swal.fire({ icon: 'success', title: 'Page créée', timer: 1500, showConfirmButton: false });
      }
      navigate("/pages");
    } catch {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a7a3c]/30 focus:border-[#1a7a3c] transition";

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {isEditing ? "Modifier une page" : "Créer une page"}
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/pages")}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleSave} disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a7a3c] text-white text-sm font-semibold hover:bg-[#155f2f] transition-colors shadow-sm disabled:opacity-50">
            <Icon d={ICONS.save} size={15} />
            {isLoading ? "En cours..." : (isEditing ? "Mettre à jour" : "Enregistrer")}
          </button>
        </div>
      </div>

      {/* 3-column body */}
      <div className="flex-1 px-6 pb-6 flex gap-4 overflow-hidden">

        {/* ── Colonne 1 : Informations de la page ── */}
        <div className="w-[260px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 self-start overflow-y-auto max-h-[calc(100vh-120px)]">

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informations</p>

          {/* Titre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Titre <span className="text-[#1a7a3c]">*</span></label>
            <input type="text" value={formData.titre} onChange={e => handleTitleChange(e.target.value)}
              placeholder="Ex: Call for Papers" className={inputClass} />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Slug <span className="text-[#1a7a3c]">*</span></label>
            <input type="text" value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="ex: calls-papers" className={`${inputClass} font-mono text-xs`} />
            <p className="text-xs text-gray-400">auto-généré depuis le titre</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Description</label>
            <textarea value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description courte de la page…" rows={3}
              className={`${inputClass} resize-none`} />
          </div>

          {/* URL Frontend */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">URL sur le site</label>
            <input type="text" value={formData.url_frontend}
              onChange={e => setFormData({ ...formData, url_frontend: e.target.value })}
              placeholder="Ex: /calls/papers" className={inputClass} />
            <p className="text-xs text-gray-400">lien d'accès depuis le site public</p>
          </div>

          <div className="border-t border-gray-100" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menu</p>

          {/* Menu parent */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Placer dans le menu</label>
            <select value={formData.menu_parent_id}
              onChange={e => setFormData({ ...formData, menu_parent_id: e.target.value })}
              className={inputClass}>
              <option value="">— Aucun menu —</option>
              {rootMenus.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          {/* Nom dans le menu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Nom dans le menu</label>
            <input type="text" value={formData.menu_label}
              onChange={e => setFormData({ ...formData, menu_label: e.target.value })}
              placeholder="Ex: Call for Papers" className={inputClass} />
            <p className="text-xs text-gray-400">texte affiché dans la navigation</p>
          </div>

          {/* Ordre dans le menu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Ordre</label>
            <input type="number" min={0} value={formData.menu_ordre}
              onChange={e => setFormData({ ...formData, menu_ordre: e.target.value })}
              className={inputClass} />
          </div>

          <div className="border-t border-gray-100" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Publication</p>

          {/* Statut */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Statut</label>
            <select value={formData.statut}
              onChange={e => setFormData({ ...formData, statut: e.target.value })}
              className={inputClass}>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          {/* Activated */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Activé</span>
            <div className="flex flex-col items-end gap-1">
              <Toggle checked={formData.activated} onChange={v => setFormData({ ...formData, activated: v })} />
              <span className={`text-xs font-medium ${formData.activated ? "text-[#1a7a3c]" : "text-gray-400"}`}>
                {formData.activated ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Colonne 2 : Éditeur HTML + Aperçu ── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              <button onClick={() => setTab("editor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tab === "editor" ? "bg-gray-100 text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon d={ICONS.edit} size={13} />Éditeur HTML
              </button>
              <button onClick={() => setTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tab === "preview" ? "bg-gray-100 text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon d={ICONS.eye} size={13} />Aperçu
              </button>
            </div>
          </div>

          {/* Editor / Preview */}
          <div className="flex-1 flex flex-col">
            {tab === "editor" ? (
              <textarea ref={textareaRef}
                value={formData.contenu_html}
                onChange={e => setFormData({ ...formData, contenu_html: e.target.value })}
                placeholder="<!-- Écrivez votre contenu HTML ici -->"
                spellCheck={false}
                className="flex-1 w-full p-5 text-sm font-mono text-gray-700 placeholder-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed"
                style={{ minHeight: "420px" }}
              />
            ) : (
              <div className="flex-1 p-5 text-sm text-gray-700 overflow-auto"
                dangerouslySetInnerHTML={{ __html: formData.contenu_html || "<p style='color:#9ca3af;font-style:italic'>Aucun contenu à afficher.</p>" }}
              />
            )}
          </div>

          <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/60">
            <p className="text-xs text-gray-400 text-center">
              HTML + CSS inline avec la palette de référence du site vitrine
            </p>
          </div>
        </div>

        {/* ── Colonne 3 : Insérer des éléments ── */}
        <div className="w-[240px] shrink-0 flex flex-col gap-3 self-start overflow-y-auto max-h-[calc(100vh-120px)]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Insérer</p>

          <InsertSection title="Speakers / Committees" count={speakers.length}>
            <InsertWidget
              items={speakers}
              labelKey="nom_complet"
              placeholder="Choisir un speaker…"
              onInsert={s => insertAtCursor(textareaRef, '\n' + snippets.speaker(s) + '\n')}
            />
          </InsertSection>

          <InsertSection title="Sponsors / Partners" count={sponsors.length}>
            <InsertWidget
              items={sponsors}
              labelKey="nom"
              placeholder="Choisir un sponsor…"
              onInsert={s => insertAtCursor(textareaRef, '\n' + snippets.sponsor(s) + '\n')}
            />
          </InsertSection>

          <InsertSection title="Documents" count={documents.length}>
            <InsertWidget
              items={documents}
              labelKey="nom_document"
              placeholder="Choisir un document…"
              onInsert={d => insertAtCursor(textareaRef, '\n' + snippets.document(d) + '\n')}
            />
          </InsertSection>

          <InsertSection title="Programme" count={programs.length}>
            <InsertWidget
              items={programs}
              labelKey="titre"
              placeholder="Choisir une session…"
              onInsert={p => insertAtCursor(textareaRef, '\n' + snippets.program(p) + '\n')}
            />
          </InsertSection>
        </div>
      </div>
    </div>
  );
}
