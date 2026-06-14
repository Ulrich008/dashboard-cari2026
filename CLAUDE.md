# CLAUDE.md — Dashboard Admin CARI'2026 (Frontend React)

> Fichier de référence pour Claude Code — Frontend uniquement.
> À lire **en premier** avant toute tâche sur ce dossier.

---

## 1. Vue d'ensemble

Tableau de bord d'administration de la conférence **CARI'2026**, SPA React consommant l'API Laravel (`http://127.0.0.1:8000/api`).

| Élément | Valeur |
|---------|--------|
| Framework | React 19.2.6 |
| Bundler | Vite 8.0.12 |
| Routing | React Router DOM 7.15.1 |
| HTTP | Axios 1.16.1 |
| UI alerts | SweetAlert2 11.x |
| CSS | Tailwind CSS via **CDN** dans `index.html` (pas de `tailwind.config.js`) |
| Auth | JWT Bearer token stocké dans `localStorage` |
| Dev server | `http://localhost:5173` (proxy `/api` → `http://localhost:8000`) |

---

## 2. Structure des dossiers

```
src/
├── App.jsx                    # Routing principal + composant Layout
├── main.jsx                   # Point d'entrée React
├── index.css                  # Styles globaux (minimal)
├── assets/                    # Images statiques
├── components/
│   ├── ProtectedRoute.jsx     # Guard de route (redirige /login si pas de token)
│   └── Sidebar.jsx            # Navigation latérale avec 9 items + logout
├── contexts/
│   └── AuthContext.jsx        # État global auth : user, login(), logout(), checkAuth()
├── pages/                     # Une page = un composant
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── PagesListContent.jsx / CreatePageContent.jsx
│   ├── Participants.jsx / CreateParticipant.jsx
│   ├── Program.jsx / CreateProgramContent.jsx
│   ├── Speakers.jsx / CreateSpeaker.jsx
│   ├── Sponsors.jsx / CreateSponsor.jsx
│   ├── Documents.jsx / CreateDocument.jsx
│   ├── UsersRoles.jsx / CreateUser.jsx
│   └── SiteInfo.jsx
└── services/
    ├── api.js                 # Instance Axios centrale (intercepteurs inclus)
    ├── authService.js
    ├── participantService.js
    ├── pageService.js
    ├── programService.js      # ⚠ doublon avec programmeService.js — voir §8
    ├── programmeService.js    # ⚠ doublon — utiliser programService.js
    ├── speakerService.js
    ├── sponsorService.js
    ├── documentService.js
    ├── userService.js
    ├── siteService.js
    └── evenementService.js    # Créé mais sans page/route associée
```

---

## 3. Patterns de code à respecter

### 3.1 Instance Axios (src/services/api.js)

Toujours importer `api` depuis `./api` ou `../services/api`, jamais créer une autre instance.

```js
// Injecte automatiquement Authorization: Bearer {token}
// Sur 401 : supprime le token + redirige vers /login
import api from '../services/api';
```

### 3.2 Pattern Service

Chaque service suit exactement ce modèle :

```js
import api from './api';

const moduleService = {
  getAll: (params = {}) => api.get('/admin/modules', { params }),
  getById: (id)         => api.get(`/admin/modules/${id}`),
  create:  (data)       => api.post('/admin/modules', data),
  update:  (id, data)   => api.put(`/admin/modules/${id}`, data),
  delete:  (id)         => api.patch(`/admin/modules/${id}`, { activated: false }),
};

export default moduleService;
```

**Récupération des données** : toujours utiliser `response.data.data ?? response.data` car l'API Laravel peut retourner `{ data: [...] }` ou directement `[...]`.

### 3.3 Pattern Page Liste

```jsx
const [items, setItems]     = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  moduleService.getAll()
    .then(res => setItems(res.data.data ?? res.data))
    .catch(() => Swal.fire('Erreur', 'Impossible de charger les données.', 'error'))
    .finally(() => setLoading(false));
}, []);
```

### 3.4 Pattern Page Formulaire (Create/Edit unifié)

- Détecter create vs edit via `useParams()` : si `id` présent → mode edit, charger les données au mount
- Soumettre via `moduleService.create(data)` ou `moduleService.update(id, data)`
- Succès → `Swal.fire(...)` puis `navigate('/module')`
- Erreur → `Swal.fire('Erreur', error.response?.data?.message ?? 'Erreur', 'error')`

### 3.5 Auth — useAuth()

```jsx
import { useAuth } from '../contexts/AuthContext';

const { user, login, logout } = useAuth();
```

`user` contient les infos de l'admin connecté (nom, email, rôle).

### 3.6 UI — Conventions visuelles

| Élément | Convention |
|---------|------------|
| Couleur primaire | `#1a7a3c` (vert CARI) |
| Fond de page | `bg-[#f5f6f8]` |
| Icônes | SVG inline (paths) — pas de lib externe |
| Alertes / confirmations | SweetAlert2 (`Swal.fire(...)`) uniquement |
| CSS | Classes Tailwind uniquement (pas de CSS module, pas de style inline sauf couleur hex) |
| Mobile | Classes responsives `md:` pour adapter la sidebar |

---

## 4. Routing

Structure dans `src/App.jsx` :

```
/login                   → Login (public)
/*                       → ProtectedRoute → Layout
    /dashboard           → Dashboard
    /pages               → PagesListContent
    /pages/create        → CreatePageContent
    /pages/edit/:id      → CreatePageContent (mode edit)
    /participants        → Participants
    /participants/create → CreateParticipant
    /participants/edit/:id → CreateParticipant (mode edit)
    /program             → Program
    /program/create      → CreateProgramContent
    /program/edit/:id    → CreateProgramContent (mode edit)
    /speakers            → Speakers
    /speakers/create     → CreateSpeaker
    /speakers/edit/:id   → CreateSpeaker (mode edit)
    /sponsors            → Sponsors
    /sponsors/create     → CreateSponsor
    /sponsors/edit/:id   → CreateSponsor (mode edit)
    /documents           → Documents
    /documents/create    → CreateDocument
    /documents/edit/:id  → CreateDocument (mode edit)
    /roles               → UsersRoles
    /roles/create        → CreateUser
    /roles/edit/:id      → CreateUser (mode edit)
    /site                → SiteInfo
    *                    → redirect /dashboard
```

Quand on ajoute un module, mettre à jour :
1. `PATH_TO_LABEL` dans `App.jsx` (pour l'état actif de la sidebar)
2. Les `<Route>` dans `Layout` dans `App.jsx`
3. L'item dans `Sidebar.jsx`

---

## 5. Format de demande pour une feature frontend

```
📌 CONTEXTE :
- Module : [ex: Registrations, Papiers, Discount Codes]
- Pages à créer : [liste ou CRUD complet]
- Endpoint API : [ex: /api/admin/registrations]

🎯 OBJECTIF :
[Description en 1-2 phrases]

📋 DÉTAILS TECHNIQUES :
- Champs du formulaire : [liste avec types]
- Colonnes du tableau liste : [liste]
- Actions disponibles : [voir, éditer, désactiver, exporter, ...]
- Réponse API attendue : [structure JSON]

🔗 CONTEXTE ADDITIONNEL :
- Service existant à réutiliser ou à créer ?
- Sidebar item à ajouter ?
- Confirmation SweetAlert2 avant suppression/désactivation ?
- Cas d'erreur spécifiques ?
```

---

## 6. Ce que Claude Code doit produire pour chaque feature frontend

Pour chaque demande, générer dans l'ordre :

1. **Service** `src/services/{module}Service.js` — CRUD complet selon pattern §3.2
2. **Page liste** `src/pages/{Module}s.jsx` — tableau + boutons action
3. **Page formulaire** `src/pages/Create{Module}.jsx` — create/edit unifié via `useParams`
4. **Routes** à ajouter dans `src/App.jsx` (dans `Layout`) + entrée dans `PATH_TO_LABEL`
5. **Item sidebar** dans `src/components/Sidebar.jsx` si c'est un nouveau module principal

---

## 7. Workflow frontend

```
1. Lire ce CLAUDE.md                       → toujours en premier

2. Poser la demande (format §5)

3. Claude Code génère :
   - src/services/{module}Service.js
   - src/pages/{Module}s.jsx
   - src/pages/Create{Module}.jsx
   - Routes + PATH_TO_LABEL dans src/App.jsx
   - Item dans src/components/Sidebar.jsx si nouveau module

4. Tester visuellement :
   npm run dev
   → ouvrir http://localhost:5173
   → naviguer vers la page générée
   → DevTools > Network : vérifier les appels API (status 200/201/204)
   → DevTools > Console : aucune erreur JS

5. Vérifier l'intégration end-to-end :
   → Se connecter avec un compte admin réel
   → Flux complet : liste → créer → éditer → désactiver
   → Erreurs API : vérifier qu'elles s'affichent en SweetAlert2
   → Mobile : vérifier la sidebar en < 768px

6. Versionner :
   git add src/
   git commit -m "feat(module): description courte"
```

---

## 8. Known issues — ne pas reproduire

| Problème | Statut | Action |
|----------|--------|--------|
| `programService.js` et `programmeService.js` sont identiques | Doublon actif | Utiliser `programService.js`, supprimer `programmeService.js` quand les imports seront mis à jour |
| `evenementService.js` existe sans page/route | Orphelin | Créer la page Events ou supprimer le service |
| `Register.jsx` existe sans route | Orphelin | Décider si nécessaire ou supprimer |
| `Dashboard.jsx` — Recent Activities hardcodé `[]` | À connecter | Brancher sur `/api/admin/audit-logs` quand disponible |

---

## 9. Checklist avant de livrer une feature

- [ ] Service importe `api` depuis `./api` (pas de nouvelle instance Axios)
- [ ] Pattern `response.data.data ?? response.data` utilisé
- [ ] Tous les erreurs catchées → `Swal.fire('Erreur', ...)`
- [ ] Confirmations destructives (désactivation, suppression) → `Swal.fire({ showCancelButton: true, ... })`
- [ ] Couleur primaire `#1a7a3c` respectée sur les boutons principaux
- [ ] Aucun `console.log` laissé en prod
- [ ] Routes ajoutées dans `PATH_TO_LABEL` pour l'état actif de la sidebar
- [ ] Icônes en SVG inline (pas d'import de bibliothèque)

---

## 10. Commandes utiles

```bash
# Démarrer le dev server
npm run dev

# Build production
npm run build

# Linter
npm run lint

# Vérifier que le proxy API fonctionne
curl http://localhost:5173/api/admin/auth/me -H "Authorization: Bearer {token}"

# Taille du bundle
npm run build && npx vite-bundle-visualizer
```

---

## 11. Variables d'environnement

```env
# .env
VITE_API_URL=http://127.0.0.1:8000/api
```

Toutes les variables doivent être préfixées `VITE_` pour être accessibles dans le code via `import.meta.env.VITE_*`.

---

*Dernière mise à jour : juin 2026 — basé sur l'état réel du projet*
