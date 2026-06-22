# StockFlow — Frontend (Tâches Hiba)

## Stack
React 18 · Vite · Tailwind CSS · Recharts · Axios · React Router v6

## Installation

```bash
cd stockflow-frontend
npm install
```

## Configuration

Copier `.env.example` en `.env` et ajuster l'URL du backend :
```
VITE_API_URL=http://localhost:8000/api
```

## Démarrage

```bash
npm run dev
# Ouvre http://localhost:5173
```

## Structure (tâches Hiba)

```
src/
├── api/
│   ├── axios.js           # instance Axios + intercepteur token + 401
│   ├── auth.api.js
│   ├── warehouses.api.js
│   ├── categories.api.js
│   ├── users.api.js
│   └── dashboard.api.js
├── contexts/
│   └── AuthContext.jsx    # user + token + login/logout + hasRole
├── routes/
│   └── ProtectedRoute.jsx # garde de route par rôle
├── components/shared/
│   ├── AppLayout.jsx      # sidebar + header + outlet
│   ├── Sidebar.jsx        # navigation filtrée par rôle
│   ├── DataTable.jsx      # tableau réutilisable tri/pagination/recherche
│   ├── Badges.jsx         # StockBadge + StatusBadge
│   ├── ConfirmDialog.jsx
│   └── Modal.jsx
├── features/
│   ├── auth/LoginPage.jsx
│   ├── dashboard/DashboardPage.jsx   # KPI cards + 3 graphiques Recharts
│   ├── warehouses/WarehousesPage.jsx # liste + modale create/edit
│   ├── categories/CategoriesPage.jsx # liste + modale create/edit
│   └── users/UsersPage.jsx           # liste + modale + toggle actif
└── lib/utils.js           # formatDate, formatMoney, cn, getRoleBadgeColor
```

## Pages à compléter (Othman & Youssef)
- `/products` — Othman
- `/stocks` — Othman
- `/movements` — Othman
- `/transfers` — Youssef
- `/inventories` — Youssef
- `/reports` — Youssef
- `/activity` — Youssef

## Notes
- Toutes les données sont récupérées depuis l'API Laravel backend
- Token Sanctum stocké dans localStorage, envoyé via `Authorization: Bearer`
- La route `/api` est proxiée vers `http://localhost:8000` en dev (voir vite.config.js)
- Pour la prod, modifier `VITE_API_URL` dans `.env`
