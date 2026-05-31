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

Le backend (Laravel + Sanctum) expose une API sur `http://127.0.0.1:8000/api`.
L'authentification se fait par token : après `login`/`register`, stocker le token
et l'envoyer dans l'en-tête `Authorization: Bearer <token>`.

```js
import axios from 'axios'

const api = axios.create({ baseURL: 'http://127.0.0.1:8000/api' })

// après login
api.defaults.headers.common['Authorization'] = `Bearer ${token}`
```
