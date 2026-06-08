# Intégration Backend - Frontend CARI 2026

## Configuration Backend (Laravel)

### CORS
Le middleware CORS a été configuré dans `bootstrap/app.php` pour autoriser les requêtes depuis le frontend.

### Routes API
Les routes API sont définies dans `routes/api.php` :
- `/api/auth/*` - Authentification participants
- `/api/participant/*` - Profil participant
- `/api/participants` - Gestion participants
- `/api/pages` - Gestion pages
- `/api/program` - Gestion programme
- `/api/speakers` - Gestion speakers
- `/api/sponsors` - Gestion sponsors
- `/api/documents` - Gestion documents
- `/api/users` - Gestion utilisateurs
- `/api/site` - Informations site

## Configuration Frontend (React + Vite)

### Variables d'environnement
Le fichier `.env` contient :
```
VITE_API_URL=http://localhost:8000/api
```

### Dépendances installées
- `axios` - Pour les requêtes HTTP

### Services API créés
- `src/services/api.js` - Configuration axios de base avec intercepteurs
- `src/services/authService.js` - Service d'authentification
- `src/services/participantService.js` - Service participants
- `src/services/pageService.js` - Service pages
- `src/services/programService.js` - Service programme
- `src/services/speakerService.js` - Service speakers
- `src/services/sponsorService.js` - Service sponsors
- `src/services/documentService.js` - Service documents
- `src/services/userService.js` - Service utilisateurs
- `src/services/siteService.js` - Service site

### Contexte d'authentification
- `src/contexts/AuthContext.jsx` - Gestion de l'état d'authentification
- `src/components/ProtectedRoute.jsx` - Composant de route protégée

### Pages d'authentification
- `src/pages/Login.jsx` - Page de connexion
- `src/pages/Register.jsx` - Page d'inscription

### Configuration Vite
Le proxy est configuré dans `vite.config.js` pour rediriger les requêtes `/api` vers `http://localhost:8000`.

## Utilisation

### Démarrage du backend
```bash
cd back_cari2026
php artisan serve
```

### Démarrage du frontend
```bash
cd dashboard-cari2026
npm run dev
```

### Authentification
1. Accéder à `/register` pour créer un compte participant
2. Accéder à `/login` pour se connecter
3. Les routes protégées redirigent automatiquement vers `/login` si non authentifié

### Utilisation des services API
```javascript
import { participantService } from './services/participantService';

// Récupérer tous les participants
const participants = await participantService.getAll();

// Créer un participant
const newParticipant = await participantService.create(data);
```

## Structure des services

Chaque service suit la même structure avec les méthodes CRUD :
- `getAll()` - Récupérer tous les éléments
- `getById(id)` - Récupérer un élément par ID
- `create(data)` - Créer un nouvel élément
- `update(id, data)` - Mettre à jour un élément
- `delete(id)` - Supprimer un élément

## Intercepteurs Axios

### Request
Ajoute automatiquement le token d'authentification depuis `localStorage` aux requêtes.

### Response
- Gère les erreurs 401 en redirigeant vers `/login`
- Supprime le token en cas d'erreur d'authentification
