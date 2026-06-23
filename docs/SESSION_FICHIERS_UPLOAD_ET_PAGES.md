# SESSION — Upload Fichiers + BlockInsertWidget + Previews (Dashboard Admin)

> Date : Juin 2026
> Scope : `dashboard-cari2026/`
> Objectif : Corriger le flux d'upload des logos/photos dans les formulaires admin, et améliorer le `BlockInsertWidget` de l'éditeur de pages (affichage des items + HTML généré à l'insertion).

---

## Contexte

Trois bugs distincts ont été identifiés et corrigés :

1. **Upload logo/photo cassé** — `CreateSponsor.jsx` envoyait le logo en base64 (champ `logo` ignoré par le backend). `CreateSpeaker.jsx` hardcodait `photo_fichier_id: 1`. Aucun fichier n'était réellement enregistré.
2. **Preview image en mode édition cassée** — `loadSponsor` / `loadSpeaker` faisaient `setPreview(sponsor.logo_fichier_id)` (entier nu comme `src` de `<img>`).
3. **`BlockInsertWidget` incomplet** — n'affichait pas l'URL du fichier DB, pas de preview image, et le HTML généré à l'insertion ne contenait que du texte brut (URL non cliquable).

---

## 1. Nouveau service — `src/services/fichierService.js`

**Fichier créé de zéro.**

```js
import api from './api';

const fichierService = {
  upload: async (file, contexte) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contexte', contexte);
    // Content-Type: undefined → le navigateur génère multipart/form-data + boundary automatiquement
    const response = await api.post('/admin/fichiers/upload', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data.data || response.data;
  },
  // ...getAll, getById, delete
};

export default fichierService;
```

**Point technique important :** Passer `'Content-Type': undefined` dans les headers Axios efface le default `application/json` et laisse le navigateur définir `multipart/form-data; boundary=...`. Sans cela, le backend ne peut pas parser les parties du formulaire.

**Endpoint backend utilisé :** `POST /api/admin/fichiers/upload`
**Retourne :** `{ id, nom_original, contexte, chemin, ... }`

---

## 2. Fix — `src/pages/CreateSponsor.jsx`

### 2.1 Import et état ajoutés

```jsx
import fichierService from "../services/fichierService";
// ...
const [logoUploading, setLogoUploading] = useState(false);
```

### 2.2 `handleLogoChange` — avant / après

**Avant (cassé) :**
```jsx
reader.onloadend = () => {
  setLogoPreview(reader.result);
  setFormData({ ...formData, logo: reader.result }); // base64 envoyé, ignoré backend
};
```

**Après (corrigé) :**
```jsx
const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    Swal.fire({ icon: 'warning', title: 'Fichier trop lourd', text: 'Max 2MB.' });
    return;
  }
  // Preview local immédiat (UX)
  const reader = new FileReader();
  reader.onloadend = () => setLogoPreview(reader.result);
  reader.readAsDataURL(file);
  // Upload asynchrone → récupérer l'ID réel
  setLogoUploading(true);
  fichierService.upload(file, 'logo_sponsor')
    .then(fichier => setFormData(prev => ({ ...prev, logo_fichier_id: fichier.id })))
    .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: "Impossible d'uploader le logo." }))
    .finally(() => setLogoUploading(false));
};
```

### 2.3 `loadSponsor` — fix preview URL

**Avant :** `setLogoPreview(sponsor.logo_fichier_id)` → entier `5` utilisé comme `src`, l'image ne charge pas.

**Après :**
```jsx
if (sponsor.logo_fichier_id) {
  setLogoPreview(`${import.meta.env.VITE_API_URL}/public/fichiers/${sponsor.logo_fichier_id}`);
}
```

**Pourquoi l'endpoint public ?** Les `<img src>` du navigateur ne transmettent pas le header `Authorization`. Les contextes `logo_sponsor` et `photo_speaker` sont autorisés dans `FichierPublicController` sans authentification.

---

## 3. Fix — `src/pages/CreateSpeaker.jsx`

Même pattern que `CreateSponsor.jsx` :

| Élément | Avant | Après |
|---------|-------|-------|
| Import | — | `import fichierService from "../services/fichierService"` |
| État | — | `const [photoUploading, setPhotoUploading] = useState(false)` |
| `handlePhotoChange` | `photo_fichier_id: 1` hardcodé | Upload réel → `photo_fichier_id: fichier.id` |
| `loadSpeaker` preview | `setPhotoPreview(speaker.photo_fichier_id)` (entier) | URL complète via endpoint public |
| Contexte upload | — | `'photo_speaker'` |

---

## 4. Ajout — `src/pages/CreateProgramContent.jsx`

Ajout d'un champ optionnel **Fichier planning** :

```jsx
import fichierService from "../services/fichierService";

// État initial
planning_fichier_id: null,

// États UI
const [planningFileName, setPlanningFileName] = useState(null);
const [planningUploading, setPlanningUploading] = useState(false);

// Handler
const handlePlanningChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { /* Swal warning */ return; }
  setPlanningFileName(file.name);
  setPlanningUploading(true);
  fichierService.upload(file, 'planning')
    .then(fichier => setFormData(prev => ({ ...prev, planning_fichier_id: fichier.id })))
    .catch(/* Swal error */)
    .finally(() => setPlanningUploading(false));
};
```

**Note :** Le contexte `planning` n'est PAS dans la liste des contextes publics du `FichierPublicController` (qui n'autorise que `logo_sponsor`, `photo_speaker`, `document_public`). Le fichier est accessible uniquement via `GET /api/admin/fichiers/{id}/download` (avec JWT).

---

## 5. Fix — `src/pages/CreatePageContent.jsx` — `BlockInsertWidget`

### 5.1 Affichage des items dans le widget

Chaque item de la liste affiche désormais 3 informations :

1. **Avatar** — `<img>` depuis `${VITE_API_URL}/public/fichiers/{fichierIdKey}` avec fallback SVG file icon (`ItemAvatar` component)
2. **URL DB complète** — ex. `http://127.0.0.1:8000/api/public/fichiers/33` en lien `<a>` monospace gris (ou texte "Aucun fichier" si absent)
3. **URL/email externe** — lien bleu cliquable

Props concernés : `fichierIdKey="logo_fichier_id"` (sponsors), `fichierIdKey="photo_fichier_id"` (speakers), `fichierIdKey="fichier_id"` (documents).

### 5.2 `handleInsert` — HTML généré à l'insertion

**Avant :** texte brut non cliquable
```html
<div data-cari-block="speakers" data-ids="54" style="margin:24px 0;">
  <div data-id="54">http://...fichiers/33 · Nom · email</div>
</div>
```

**Après :** HTML complet avec `<a>` + icône SVG file-down
```html
<div data-cari-block="speakers" data-ids="54" style="margin:24px 0;">
  <p data-id="54">
    <a href="http://127.0.0.1:8000/api/public/fichiers/33" target="_blank"
       style="display:inline-flex;align-items:center;gap:6px;color:#dc2626;text-decoration:underline;font-weight:500">
      [SVG file-down] Fuga Odio quo velit Tempor nulla volupta
    </a>
    · <a href="mailto:jubukovi@mailinator.com" target="_blank" style="color:#2563eb;">jubukovi@mailinator.com</a>
  </p>
</div>
```

L'icône SVG réutilise `_FILE_DOWN` (constante module-level déjà définie dans `CreatePageContent.jsx`).
Si pas de `fichierUrl` → `<span>Nom</span>`. Si pas de lien externe → pas de `· <a>`.

**Avantage :** le HTML fonctionne tel quel sur le site public sans JavaScript. L'admin peut modifier librement le `<p>` en `<div>` ou changer les styles inline.

### 5.3 Preview admin (`resolvePreviewBlocks`)

Ajout de fonctions module-level `_renderSponsors`, `_renderSpeakers`, `_renderDocuments` pour la prévisualisation dans l'onglet "Prévisualisation" de l'éditeur de pages. Ces fonctions construisent les URLs depuis les IDs (même logique que `last_cari2026/dynamicPageInteractions.js`).

---

## Impact cross-repo

| Repo impacté | Dépendance |
|---|---|
| `the_back/back_cari2026` | `POST /api/admin/fichiers/upload` — endpoint déjà en place dans `FichierController` |
| `the_back/back_cari2026` | `GET /api/public/fichiers/{id}` — sert les images inline pour les previews (`Storage::response()`) |
| `last_cari2026` | `activateDynamicBlocks` lit les attributs `data-cari-block` + `data-ids` générés par `handleInsert` |
