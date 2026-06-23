import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
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

/* Generic insert widget: select + button (used for Programme) */
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

const FILE_ICON = "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7ZM14 2v4a2 2 0 0 0 2 2h4";

/* Avatar : tente de charger l'image ; si échec → icône fichier */
function ItemAvatar({ src }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img src={src} alt="" onError={() => setFailed(true)}
        className="w-8 h-8 object-cover rounded flex-shrink-0 border border-gray-100" />
    );
  }
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      className="text-gray-300 flex-shrink-0 mt-0.5">
      <path d={FILE_ICON} />
    </svg>
  );
}

/* Dynamic block widget: multi-checkbox → inserts data-cari-block placeholder */
function BlockInsertWidget({ items, labelKey, blockType, onInsert, typeFilters, fichierIdKey, linkKey, linkType = 'url', extraFields = [], smartFileTag = false }) {
  const [selected, setSelected] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState("");
  const safeItems = Array.isArray(items) ? items : [];

  const displayed = activeFilter
    ? safeItems.filter(it => it.type === activeFilter)
    : safeItems;

  const toggleItem = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === displayed.length && displayed.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(displayed.map(it => it.id)));
    }
  };

  const handleInsert = () => {
    const ids = [...selected];
    const targets = ids.length > 0
      ? displayed.filter(it => selected.has(it.id))
      : displayed;

    let html = `<div data-cari-block="${blockType}"`;
    if (ids.length > 0) html += ` data-ids="${ids.join(',')}"`;
    if (activeFilter)   html += ` data-filter="${activeFilter}"`;
    html += ` style="margin:24px 0;">`;

    for (const item of targets) {
      const fichierId  = fichierIdKey ? item[fichierIdKey] : null;
      const fichierUrl = fichierId ? `${apiBase}/public/fichiers/${fichierId}` : null;
      const label      = item[labelKey] || '';
      const link       = linkKey ? item[linkKey] : null;
      const href       = link ? (linkType === 'email' ? `mailto:${link}` : link) : null;

      const IMAGE_EXT = ['jpg','jpeg','png','gif','svg','webp','bmp'];
      const isImage = smartFileTag && IMAGE_EXT.includes((item.fichier_extension || '').toLowerCase());

      let block = `<p data-id="${item.id}" style="font-weight:600;margin:0 0 0.25rem;">`;
      if (fichierUrl) {
        if (isImage) {
          block += `<img src="${fichierUrl}" alt="${label}" style="max-width:100%;height:auto;border-radius:0.5rem;" />`;
          block += `<br><span style="font-size:0.8rem;color:#6b7280;">${fichierUrl}</span>`;
        } else {
          block += `<a href="${fichierUrl}" target="_blank" download style="display:inline-flex;align-items:center;gap:6px;color:#dc2626;text-decoration:underline;font-weight:500">${_FILE_DOWN} ${label}</a>`;
          block += `<br><span style="font-size:0.75rem;color:#9ca3af;font-family:monospace;">${fichierUrl}</span>`;
        }
      } else {
        block += `<span>${label}</span>`;
      }
      block += `</p>`;
      if (href) {
        block += `<p style="margin:0 0 0.2rem;font-size:0.875rem;"><a href="${href}" style="color:#2563eb;">${link}</a></p>`;
      }
      for (const field of extraFields) {
        const val = item[field.key];
        if (!val) continue;
        let content = val;
        if (field.type === 'email') content = `<a href="mailto:${val}" style="color:#2563eb;">${val}</a>`;
        else if (field.type === 'url') content = `<a href="${val}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;">${val}</a>`;
        block += `<p style="margin:0 0 0.2rem;font-size:0.875rem;color:#374151;">${content}</p>`;
      }
      html += `<div style="margin-bottom:0.75rem;padding:0.75rem;border:1px solid #e5e7eb;border-radius:0.5rem;background:#fafafa;">${block}</div>`;
    }

    html += `</div>`;
    onInsert(html);
    setSelected(new Set());
  };

  if (safeItems.length === 0) {
    return <p className="text-xs text-gray-400 italic text-center py-1">Aucun élément disponible</p>;
  }

  const allChecked = displayed.length > 0 && selected.size === displayed.length;
  const apiBase = import.meta.env.VITE_API_URL ?? '';

  return (
    <div className="flex flex-col gap-2">
      {typeFilters && (
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setActiveFilter(""); setSelected(new Set()); }}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${!activeFilter ? 'bg-[#1a7a3c] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tous
          </button>
          {typeFilters.map(f => (
            <button key={f.value}
              onClick={() => { setActiveFilter(f.value); setSelected(new Set()); }}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${activeFilter === f.value ? 'bg-[#1a7a3c] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={allChecked} onChange={toggleAll}
            className="accent-[#1a7a3c] w-3 h-3" />
          <span className="text-xs text-gray-500">Tout sélectionner</span>
        </label>
        <span className="text-xs text-gray-400">{selected.size}/{displayed.length}</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
        {displayed.map((item, i) => {
          const fichierId = fichierIdKey ? item[fichierIdKey] : null;
          const fichierUrl = fichierId ? `${apiBase}/public/fichiers/${fichierId}` : null;
          const link = linkKey ? item[linkKey] : null;
          const href = link ? (linkType === 'email' ? `mailto:${link}` : link) : null;

          return (
            <label key={item.id ?? i}
              className="flex items-start gap-2 cursor-pointer p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleItem(item.id)}
                className="mt-0.5 accent-[#1a7a3c] w-3 h-3 flex-shrink-0" />

              <ItemAvatar src={fichierUrl} />

              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                {/* 1 — Nom */}
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {item[labelKey] || `— ${item.id} —`}
                </span>
                {/* 2 — Lien d'accès au fichier en base de données */}
                {fichierUrl ? (
                  <a href={fichierUrl} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    title={fichierUrl}
                    className="text-[10px] text-gray-400 hover:text-blue-500 hover:underline truncate leading-tight font-mono">
                    /public/fichiers/{fichierId}
                  </a>
                ) : fichierIdKey ? (
                  <span className="text-[10px] text-gray-300 italic leading-tight">Aucun fichier</span>
                ) : null}
                {/* 3 — URL du lien ou du mail associé */}
                {href && (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] text-blue-500 hover:underline truncate leading-tight">
                    {link}
                  </a>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <button
        onClick={handleInsert}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a7a3c] text-white text-xs font-semibold hover:bg-[#155f2f] transition-colors">
        <Icon d={ICONS.insert} size={12} />
        {selected.size > 0 ? `Insérer (${selected.size})` : 'Insérer tous'}
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

/* ── Résolution preview data-cari-block ── */

const _PREVIEW_BASE = import.meta.env.VITE_API_URL ?? '';
const _pFileUrl = (id) => id ? `${_PREVIEW_BASE}/public/fichiers/${id}` : null;
const _FILE_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>`;

const _renderSponsors = (items) => {
  if (!items.length) return '<p style="color:#6b7280;font-style:italic;">Aucun sponsor disponible.</p>';
  const cards = items.map(s => {
    const logo = _pFileUrl(s.logo_fichier_id);
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;padding:1.25rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:0.75rem;text-align:center;">
      ${logo ? `<img src="${logo}" alt="${s.nom}" style="max-width:120px;max-height:80px;object-fit:contain;" onerror="this.style.display='none'" />` : `<div style="width:80px;height:60px;background:#e5e7eb;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:0.75rem;">Logo</div>`}
      ${s.url ? `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="font-weight:600;color:#111827;text-decoration:none;font-size:0.95rem;">${s.nom}</a>` : `<span style="font-weight:600;color:#111827;font-size:0.95rem;">${s.nom}</span>`}
      ${s.type ? `<span style="color:#6b7280;font-size:0.8rem;">${s.type}</span>` : ''}
    </div>`;
  }).join('');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;">${cards}</div>`;
};

const _renderSpeakers = (items) => {
  if (!items.length) return '<p style="color:#6b7280;font-style:italic;">Aucun intervenant disponible.</p>';
  const cards = items.map(s => {
    const photo = _pFileUrl(s.photo_fichier_id);
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;padding:1.25rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:0.75rem;text-align:center;">
      ${photo
        ? `<img src="${photo}" alt="${s.prenom ?? ''} ${s.nom ?? ''}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #e5e7eb;" onerror="this.style.display='none'" />`
        : `<div style="width:80px;height:80px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:1.5rem;">&#128100;</div>`}
      <div>
        <p style="font-weight:600;color:#111827;margin:0 0 0.25rem;">${s.prenom ?? ''} ${s.nom ?? ''}</p>
        ${s.affiliation ? `<p style="color:#6b7280;font-size:0.8rem;margin:0 0 0.25rem;">${s.affiliation}</p>` : ''}
        ${s.bio        ? `<p style="color:#374151;font-size:0.78rem;margin:0 0 0.5rem;font-style:italic;line-height:1.4;">${s.bio}</p>` : ''}
        ${s.email      ? `<p style="margin:0 0 0.2rem;"><a href="mailto:${s.email}" style="color:#2563eb;font-size:0.8rem;text-decoration:none;">${s.email}</a></p>` : ''}
        ${s.telephone  ? `<p style="color:#374151;font-size:0.8rem;margin:0 0 0.2rem;">${s.telephone}</p>` : ''}
        ${s.website    ? `<p style="margin:0;"><a href="${s.website}" target="_blank" rel="noopener noreferrer" style="color:#16a34a;font-size:0.8rem;">Site web</a></p>` : ''}
      </div>
    </div>`;
  }).join('');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;">${cards}</div>`;
};

const _renderDocuments = (items) => {
  if (!items.length) return '<p style="color:#6b7280;font-style:italic;">Aucun document disponible.</p>';
  const IMAGE_EXT = ['jpg','jpeg','png','gif','svg','webp','bmp'];
  const rows = items.map(d => {
    const href = _pFileUrl(d.fichier_id) || d.lien || '#';
    const ext  = (d.fichier_extension || '').toLowerCase();
    const isImage = IMAGE_EXT.includes(ext);
    if (isImage) {
      return `<figure style="margin:0 0 0.75rem;">
        <img src="${href}" alt="${d.nom_document ?? ''}" style="max-width:100%;height:auto;border-radius:0.5rem;" />
        <figcaption style="font-size:0.8rem;color:#6b7280;margin-top:0.25rem;">${d.nom_document ?? ''}</figcaption>
        ${d.description ? `<p style="font-size:0.8rem;color:#374151;margin:0.25rem 0 0;">${d.description}</p>` : ''}
      </figure>`;
    }
    return `<p style="margin:0 0 0.5rem;">
      <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;color:#dc2626;text-decoration:underline;font-weight:500;font-size:0.9rem;">${_FILE_DOWN}${d.nom_document ?? 'Document'}</a>
      ${d.description ? `<span style="display:block;font-size:0.8rem;color:#6b7280;margin-top:0.2rem;">${d.description}</span>` : ''}
    </p>`;
  }).join('');
  return `<div style="display:flex;flex-direction:column;">${rows}</div>`;
};

const resolvePreviewBlocks = async (container) => {
  if (!container) return;
  const blocks = container.querySelectorAll('[data-cari-block]');
  if (!blocks.length) return;
  for (const block of blocks) {
    const type   = block.getAttribute('data-cari-block');
    const ids    = (block.getAttribute('data-ids') ?? '').split(',').map(Number).filter(Boolean);
    const filter = block.getAttribute('data-filter');
    block.innerHTML = '<p style="color:#9ca3af;font-style:italic;font-size:0.8rem;padding:0.5rem 0;">Chargement…</p>';
    try {
      if (type === 'sponsors') {
        const res = await api.get('/public/sponsors');
        const all = res.data?.data ?? res.data ?? [];
        block.innerHTML = _renderSponsors(ids.length ? all.filter(s => ids.includes(s.id)) : all);
      } else if (type === 'speakers') {
        const res = await api.get('/public/speakers');
        const all = res.data?.data ?? res.data ?? [];
        let items = ids.length ? all.filter(s => ids.includes(s.id)) : all;
        if (filter) items = items.filter(s => s.type === filter);
        block.innerHTML = _renderSpeakers(items);
      } else if (type === 'documents') {
        const res = await api.get('/public/documents');
        const all = res.data?.data ?? res.data ?? [];
        block.innerHTML = _renderDocuments(ids.length ? all.filter(d => ids.includes(d.id)) : all);
      }
    } catch (_) {
      block.innerHTML = '<p style="color:#ef4444;font-size:0.8rem;padding:0.5rem 0;">Erreur de chargement</p>';
    }
  }
};

/* ── Main component ── */
export default function CreatePageContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const textareaRef = useRef(null);
  const previewRef  = useRef(null);

  const [formData, setFormData] = useState({
    titre: "", slug: "", contexte: "", description: "", url_frontend: "",
    contenu_html: "", statut: "published", activated: true,
    menu_parent_id: "", menu_sub_id: "", menu_label: "", menu_ordre: 0,
  });
  const [tab, setTab] = useState("editor");
  const [isLoading, setIsLoading] = useState(false);

  // Data for insert panels
  const [allMenus,   setAllMenus]   = useState([]);
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
    menuService.getAll().then(r => {
      const data = r.data.data ?? r.data;
      const flatten = (arr) =>
        arr.flatMap(m => [m, ...(m.children?.length ? flatten(m.children) : [])]);
      const flat = flatten(data);
      setAllMenus(flat);
      setRootMenus(flat.filter(m => !m.parent_id));
    }).catch(() => {});
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
          const mi = page.menu ?? null;
          setFormData({
            titre:          page.titre          || "",
            slug:           page.slug           || "",
            contexte:       page.contexte       || "",
            description:    page.description    || "",
            url_frontend:   page.url_frontend   || "",
            contenu_html:   page.contenu_html   || "",
            statut:         page.statut         || "draft",
            activated:      page.activated !== undefined ? page.activated : true,
            menu_parent_id: mi
              ? (mi.parent_id ? String(mi.parent_id) : String(mi.id))
              : "",
            menu_sub_id:    mi?.parent_id ? String(mi.id) : "",
            menu_label:     mi?.label     || "",
            menu_ordre:     mi?.ordre     ?? 0,
          });
        })
        .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger la page.' }));
    }
  }, [id, isEditing]);

  /* Résoudre les blocs data-cari-block quand le tab Aperçu est actif */
  useEffect(() => {
    if (tab !== 'preview' || !previewRef.current) return;
    previewRef.current.innerHTML = formData.contenu_html
      || "<p style='color:#9ca3af;font-style:italic'>Aucun contenu à afficher.</p>";
    resolvePreviewBlocks(previewRef.current);
  }, [tab, formData.contenu_html]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMenuParentChange = (value) => {
    setFormData(prev => ({ ...prev, menu_parent_id: value, menu_sub_id: "" }));
  };

  const handleSubMenuChange = (value) => {
    const sub = allMenus.find(m => String(m.id) === value);
    setFormData(prev => {
      const updates = { menu_sub_id: value };
      if (sub) {
        if (sub.page_slug) updates.slug = sub.page_slug;
        if (sub.url && !prev.url_frontend) updates.url_frontend = sub.url;
        if (sub.label && !prev.menu_label) updates.menu_label = sub.label;
      }
      return { ...prev, ...updates };
    });
  };

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
      menu_sub_id:    formData.menu_sub_id    ? Number(formData.menu_sub_id)    : null,
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

  const subMenus = allMenus.filter(
    m => String(m.parent_id) === String(formData.menu_parent_id)
  );

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
            <label className="text-xs font-semibold text-gray-700">Slug</label>
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
              onChange={e => handleMenuParentChange(e.target.value)}
              className={inputClass}>
              <option value="">— Aucun menu —</option>
              {rootMenus.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          {/* Sous-menu (conditionnel) */}
          {formData.menu_parent_id && subMenus.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Sous-menu</label>
              <select value={formData.menu_sub_id}
                onChange={e => handleSubMenuChange(e.target.value)}
                className={inputClass}>
                <option value="">— Aucun sous-menu —</option>
                {subMenus.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <p className="text-xs text-gray-400">remplit le slug si disponible</p>
            </div>
          )}

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
              <div ref={previewRef}
                className="flex-1 p-5 text-sm text-gray-700 overflow-auto" />
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
            <BlockInsertWidget
              items={speakers}
              labelKey="nom_complet"
              blockType="speakers"
              onInsert={html => insertAtCursor(textareaRef, '\n' + html + '\n')}
              fichierIdKey="photo_fichier_id"
              linkKey="email"
              linkType="email"
              typeFilters={[
                { value: 'speaker',              label: 'Speakers' },
                { value: 'program_committee',    label: 'Prog.' },
                { value: 'organizing_committee', label: 'Org.' },
              ]}
              extraFields={[
                { key: 'affiliation' },
                { key: 'bio' },
                { key: 'telephone' },
                { key: 'website', type: 'url' },
              ]}
            />
          </InsertSection>

          <InsertSection title="Sponsors / Partners" count={sponsors.length}>
            <BlockInsertWidget
              items={sponsors}
              labelKey="nom"
              blockType="sponsors"
              onInsert={html => insertAtCursor(textareaRef, '\n' + html + '\n')}
              fichierIdKey="logo_fichier_id"
              linkKey="url"
              linkType="url"
            />
          </InsertSection>

          <InsertSection title="Documents" count={documents.length}>
            <BlockInsertWidget
              items={documents}
              labelKey="nom_document"
              blockType="documents"
              onInsert={html => insertAtCursor(textareaRef, '\n' + html + '\n')}
              fichierIdKey="fichier_id"
              linkKey="lien"
              linkType="url"
              smartFileTag={true}
              extraFields={[
                { key: 'description' },
                { key: 'id_public' },
                { key: 'lien', type: 'url' },
              ]}
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
