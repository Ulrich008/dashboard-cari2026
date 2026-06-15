# SESSION — Menu Navigation + Refonte CreatePageContent (Dashboard Admin)

> Date : Juin 2026
> Scope : `dashboard-cari2026/`
> Objectif : Ajouter la gestion des menus de navigation et refondre l'éditeur de pages en 3 colonnes.

---

## Contexte

Le site vitrine CARI'2026 passe à une navigation dynamique pilotée par la DB (table `menu_item`).
Côté dashboard admin, cela implique :
1. Un nouveau module **Menus** (liste + formulaire create/edit)
2. La refonte de l'éditeur de pages en **3 colonnes** avec panneau d'insertion d'éléments

---

## 1. Service — `src/services/menuService.js` — NOUVEAU

Pattern identique à tous les services du projet (instance axios centrale `api`).

```js
const menuService = {
  getAll:  ()         => api.get('/admin/menus'),
  getById: (id)       => api.get(`/admin/menus/${id}`),
  create:  (data)     => api.post('/admin/menus', data),
  update:  (id, data) => api.put(`/admin/menus/${id}`, data),
  toggle:  (id)       => api.patch(`/admin/menus/${id}/toggle`),
};
```

Pas de `delete` — désactivation via `toggle` (cohérent avec le pattern `activated` du backend).

---

## 2. Page liste — `src/pages/MenusPage.jsx` — NOUVEAU

### Fonctionnalités

- Affiche l'arborescence complète : menus racines + sous-menus indentés
- Composant récursif `MenuItem` (render `depth=0` pour racines, `depth=1` pour enfants)
- Indentation visuelle : `└─` + `paddingLeft: depth * 20px`
- Badge statut : vert (`Actif`) / gris (`Inactif`)

### Actions disponibles par ligne

| Bouton | Icône | Comportement |
|---|---|---|
| Modifier | Crayon | `navigate('/menus/edit/:id')` |
| Ajouter sous-menu | Plus | `navigate('/menus/create?parent_id=X')` — uniquement sur racines |
| Activer / Désactiver | Power | `menuService.toggle(id)` avec confirm SweetAlert2 |

### En-tête

Bouton **"Ajouter un menu"** → `navigate('/menus/create')` (nouveau menu racine).

### États

- Spinner de chargement (`border-[#1a7a3c] border-t-transparent animate-spin`)
- État vide : message `"Aucun menu configuré."`
- Erreur réseau : `Swal.fire('Erreur', ...)` catch

---

## 3. Formulaire — `src/pages/CreateMenuContent.jsx` — NOUVEAU

### Create vs Edit

Détecte le mode via `useParams().id` :
- Sans `id` → mode création
- Avec `id` → mode édition (charge les données au `mount` via `menuService.getById(id)`)

### Champs du formulaire

| Champ | Type | Détail |
|---|---|---|
| `label` | text (requis) | Libellé affiché dans la nav (ex: "Call for Papers") |
| `url` | text (optionnel) | Lien de navigation (vide pour les menus parents sans cible) |
| `parent_id` | select | Liste des menus racines via `menuService.getAll()` filtré `!m.parent_id` |
| `ordre` | number | Ordre d'affichage dans le menu |
| `page_slug` | text monospace | Slug de la page DB associée (optionnel) |
| `activated` | Toggle | Actif / Inactif |

### Pré-remplissage `parent_id`

Quand l'utilisateur clique "Ajouter sous-menu" sur `MenusPage`, l'URL contient `?parent_id=X`.
`useSearchParams()` lit ce paramètre et pré-remplit le select dès l'initialisation du `useState`.

### Payload envoyé

```js
{
  label:     "Call for Papers",
  url:       "/calls/papers",       // null si vide
  parent_id: 2,                     // Number ou null
  ordre:     1,
  page_slug: "calls-papers",        // null si vide
  activated: true,
}
```

---

## 4. Refonte — `src/pages/CreatePageContent.jsx` — RÉÉCRITURE COMPLÈTE

### Architecture 3 colonnes

```
┌─────────────────────┬──────────────────────────────────┬────────────────────┐
│  Colonne gauche     │     Colonne centre               │  Colonne droite    │
│  260px — fixe       │     flex-1 — extensible          │  240px — fixe      │
│                     │                                  │                    │
│  Informations       │  [Éditeur HTML] [Aperçu]         │  Speakers          │
│  • Titre*           │                                  │  Sponsors          │
│  • Slug             │  <textarea ref={textareaRef} />  │  Documents         │
│  • Description      │       ou                         │  Programme         │
│  • URL Frontend     │  <div dangerouslySetInnerHTML />  │                    │
│                     │                                  │  Chaque section :  │
│  Menu               │                                  │  select + Insérer  │
│  • Parent (select)  │                                  │                    │
│  • Nom dans menu    │                                  │                    │
│  • Ordre            │                                  │                    │
│                     │                                  │                    │
│  Publication        │                                  │                    │
│  • Statut           │                                  │                    │
│  • Activated        │                                  │                    │
└─────────────────────┴──────────────────────────────────┴────────────────────┘
```

### Colonne gauche — Informations de la page

**Champs nouveaux (non présents avant) :**

| Champ | Détail |
|---|---|
| `description` | Textarea 3 lignes — résumé court |
| `url_frontend` | URL d'accès sur le site vitrine (ex: `/calls/papers`) |
| `menu_parent_id` | Select → racines via `menuService.getAll()` |
| `menu_label` | Texte affiché dans la navigation |
| `menu_ordre` | Ordre de l'item dans son parent |

**Logique slug auto-généré :**
```js
const slug = titre
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")  // retire les accents
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9-]/g, "");
```
Le slug reste éditable manuellement après la génération automatique.

### Colonne centre — Éditeur HTML

Comportement **identique à l'ancienne version** :
- Onglet **Éditeur** : `<textarea>` avec `ref={textareaRef}` (nécessaire pour l'insertion curseur)
- Onglet **Aperçu** : `dangerouslySetInnerHTML={{ __html: formData.contenu_html }}`
- Le bouton "Insérer Document" non fonctionnel de l'ancienne version a été **supprimé**

### Colonne droite — Panneaux d'insertion

**Composants réutilisables :**

`InsertSection` — section pliable avec chevron (état open/close local)

`InsertWidget` — select + bouton Insérer :
```
[ Select un item ▾ ]
[ + Insérer        ]
```

**Logique d'insertion au curseur :**
```js
function insertAtCursor(textareaRef, snippet) {
  const el    = textareaRef.current;
  const start = el.selectionStart;
  const end   = el.selectionEnd;
  // Utilise nativeInputValueSetter pour déclencher le re-render React
  const nativeInput = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  );
  nativeInput.set.call(el, before + snippet + after);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.setSelectionRange(cursorPos, cursorPos);
}
```

**Snippets HTML générés par section :**

*Speakers / Committees* :
```html
<div style="display:flex;align-items:flex-start;gap:1rem;background:#f3f4f6;padding:1rem;border-radius:0.5rem;">
  <img src="{photo_url}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;" />
  <div>
    <p style="font-weight:bold;color:#111827;">{nom_complet}</p>
    <p style="color:#6b7280;font-size:0.875rem;">{role}</p>
    <p style="color:#6b7280;font-size:0.875rem;">{institution}</p>
  </div>
</div>
```

*Sponsors / Partners* :
```html
<div style="display:flex;align-items:center;gap:1rem;background:#f3f4f6;padding:0.75rem 1rem;border-radius:0.5rem;">
  <img src="{logo_url}" style="height:48px;object-fit:contain;" />
  <div>
    <p style="font-weight:bold;color:#111827;">{nom}</p>
    <a href="{url}" style="color:#2563eb;font-size:0.875rem;">{url}</a>
  </div>
</div>
```

*Documents* :
```html
<a href="{url}" target="_blank"
  style="display:inline-flex;align-items:center;gap:0.5rem;background:#16a34a;color:white;
         padding:0.5rem 1rem;border-radius:0.375rem;text-decoration:none;">
  📄 {titre}
</a>
```

*Programme (session)* :
```html
<div style="border-left:4px solid #16a34a;padding:0.75rem 1rem;background:#f3f4f6;border-radius:0 0.5rem 0.5rem 0;">
  <p style="color:#6b7280;font-size:0.75rem;">{heure_debut} – {heure_fin}</p>
  <p style="font-weight:bold;color:#111827;">{titre}</p>
  <p style="color:#6b7280;font-size:0.875rem;">{intervenant}</p>
</div>
```

### Payload `handleSave` (complet)

```js
const payload = {
  titre:          formData.titre,
  slug:           formData.slug,
  contexte:       formData.contexte || 'general',
  description:    formData.description    || null,   // nouveau
  url_frontend:   formData.url_frontend   || null,   // nouveau
  contenu_html:   formData.contenu_html,
  statut:         formData.statut,
  activated:      formData.activated,
  menu_parent_id: formData.menu_parent_id ? Number(formData.menu_parent_id) : null, // nouveau
  menu_label:     formData.menu_label     || null,   // nouveau
  menu_ordre:     Number(formData.menu_ordre) || 0,  // nouveau
};
```

### Chargement des données pour les panneaux d'insertion

Au `mount`, 5 appels parallèles (best-effort, erreurs ignorées silencieusement) :
```js
menuService.getAll()     → rootMenus (filtré !m.parent_id)
speakerService.getAll()  → speakers
sponsorService.getAll()  → sponsors
documentService.getAll() → documents
programService.getAll()  → programs
```

---

## 5. Sidebar + Routing — MODIFIÉS

### `src/components/Sidebar.jsx`

`NAV_ITEMS` — ajout entre "Pages" et "Participants" :
```js
{ label: "Menus", icon: "menu", path: "/menus" }
```
L'icône `menu` (`M3 12h18M3 6h18M3 18h18`) existait déjà dans l'objet `ICONS`.

### `src/App.jsx`

**`PATH_TO_LABEL`** — ajouts :
```js
"/menus":        "Menus",
"/menus/create": "Menus",
"/menus/edit":   "Menus",
```

**`activeItem` logic** — ajout :
```js
location.pathname.startsWith("/menus") ? "Menus"
```

**Routes ajoutées dans `Layout`** :
```jsx
<Route path="/menus"          element={<MenusPage />} />
<Route path="/menus/create"   element={<CreateMenuContent />} />
<Route path="/menus/edit/:id" element={<CreateMenuContent />} />
```

---

## 6. Tests à effectuer

```bash
# Démarrer le dev server
cd /home/gerard/cari26/dashboard-cari2026
npm run dev

# Navigations à tester
# → /menus              : liste arborescente avec données réelles
# → /menus/create       : formulaire vide
# → /menus/create?parent_id=2 : select parent pré-rempli
# → /menus/edit/:id     : chargement des données du menu
# → /pages/create       : 3 colonnes visibles
# → /pages/edit/:id     : chargement + 3 colonnes

# Golden paths
# 1. Créer un menu racine → apparaît dans la liste
# 2. Ajouter un sous-menu via bouton "+" → parent pré-sélectionné
# 3. Créer une page avec lien menu → MenuItem créé via PagePublicService
# 4. Insérer un speaker dans l'éditeur → snippet HTML à la position curseur
# 5. Basculer entre onglets Éditeur/Aperçu → contenu préservé

# Vérifier dans DevTools > Network
# POST /admin/menus     → 201 Created
# PUT  /admin/menus/:id → 200 OK
# PATCH /admin/menus/:id/toggle → 200 { activated: false }
```

---

## Récapitulatif des fichiers

| Fichier | Action |
|---|---|
| `src/services/menuService.js` | Créé |
| `src/pages/MenusPage.jsx` | Créé |
| `src/pages/CreateMenuContent.jsx` | Créé |
| `src/pages/CreatePageContent.jsx` | Réécriture complète (3 colonnes) |
| `src/components/Sidebar.jsx` | Modifié (+item Menus) |
| `src/App.jsx` | Modifié (+routes, +PATH_TO_LABEL, +imports) |
