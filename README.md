# StockFlow — entrepots_system

Application web de **gestion de stock multi-entrepôts** pour une entreprise.
Projet de fin d'études 2025/2026 — HighTech Rabat.

## Stack

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React + Vite + Tailwind CSS + Axios |
| **Backend** | Laravel 12 + Sanctum + Spatie Permission |
| **Base de données** | PostgreSQL (Neon) |

## Structure du dépôt

```
entrepots_system/
├── backend/    # API REST Laravel 12  → voir backend/README.md
└── frontend/   # SPA React + Vite     → voir frontend/README.md
```

- 📦 **[Documentation backend](backend/README.md)** — installation, base de données, rôles/permissions, services métier, endpoints `/api/v1`.
- 🎨 **[Documentation frontend](frontend/README.md)** — installation, lancement, connexion à l'API.

## Démarrage rapide

```bash
# Backend
cd backend
composer install
cp .env.example .env      # renseigner les variables DB_* (hôte Neon direct, sans -pooler)
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --port=8000

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

## Fonctionnalités principales

- Gestion des **entrepôts**, **catégories** et **produits** (catalogue).
- Suivi des **stocks** par entrepôt avec disponible calculé (`quantite − reserve`) et alertes de seuil.
- **Mouvements de stock** transactionnels (entrées/sorties) avec verrou pessimiste.
- **Transferts inter-entrepôts** en machine à états (brouillon → en_attente → valide → reçu | annulé).
- **Inventaires** (sessions de comptage) avec calcul des écarts et ajustement.
- **RBAC à 4 rôles** (administrateur, gestionnaire, magasinier, auditeur) via Spatie Permission.

## Équipe

Chef de projet : **Amine** — Équipe : Hiba · Ayoub · Othman · Youssef · Abdelhamid.
