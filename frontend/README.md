# Entrepôts System — Frontend

Interface construite avec **React 19** + **Vite**, stylée avec **Tailwind CSS v4**, et **axios** pour les appels API.

## Prérequis

- Node.js >= 24 (24.16.0 recommandé)
- npm >= 11

Voir [`requirements.txt`](requirements.txt) pour le détail des dépendances.

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

L'application démarre par défaut sur http://localhost:5173.

## Build de production

```bash
npm run build      # génère le dossier dist/
npm run preview    # prévisualise le build
```

## Stack

- **React 19** — `react`, `react-dom`
- **Vite** — bundler / dev server (`@vitejs/plugin-react`)
- **Tailwind CSS v4** — `tailwindcss`, `@tailwindcss/vite` (importé dans `src/index.css`)
- **axios** — client HTTP pour l'API backend

## Connexion à l'API

La couche API suit la conception §4.1. L'URL de base est lue depuis `VITE_API_URL`
(voir `.env`), par défaut `http://localhost:8000/api/v1`.

```
src/
├── api/
│   ├── axios.js            # instance Axios + intercepteur token Bearer + gestion 401
│   ├── auth.api.js         # login / register / logout / me
│   ├── users.api.js        # CRUD utilisateurs + toggle
│   ├── warehouses.api.js   # CRUD entrepôts (param ?inactifs)
│   ├── categories.api.js   # CRUD catégories
│   └── products.api.js     # CRUD produits (FormData pour l'image)
├── contexts/AuthContext.jsx  # user + token + rôles/permissions, hook useAuth
└── lib/utils.js              # formatDate, formatMoney, cn
```

### Configuration

```bash
cp .env.example .env     # ajuster VITE_API_URL si le backend n'est pas en local
```

> **CORS :** le backend autorise par défaut `http://localhost:5173` et
> `http://127.0.0.1:5173` (voir `backend/config/cors.php`, variable
> `CORS_ALLOWED_ORIGINS`). L'auth se fait par token Bearer (pas de cookies).

### Utilisation

```jsx
import { useAuth } from './contexts/AuthContext'
import { listProducts } from './api/products.api'

const { user, roles, login, logout, isAuthenticated } = useAuth()

await login({ email, password })   // stocke le token + charge /me
const products = await listProducts()  // token injecté automatiquement
```

Le token est conservé dans `localStorage` (`stockflow_token`) et ré-injecté
automatiquement par l'intercepteur. Un `401` purge le token et renvoie vers `/login`.

> `src/App.jsx` contient une **page de démonstration** de la connexion (login →
> `/me` → listes produits/entrepôts). À remplacer par le routeur (`routes/` +
> `features/`) lors de l'implémentation des écrans.
