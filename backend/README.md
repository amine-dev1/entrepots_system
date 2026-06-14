# Entrepôts System — Backend (API)

API REST construite avec **Laravel 12** et **PostgreSQL** (Neon), authentification via **Laravel Sanctum** (tokens).

## Prérequis

- PHP >= 8.2 (8.3 recommandé)
- Composer >= 2.0
- Extensions PHP : `openssl`, `pdo_pgsql`, `pgsql`, `mbstring`, `fileinfo`, `curl`, `zip`
- Une base PostgreSQL (Neon)

Voir [`requirements.txt`](requirements.txt) pour le détail des dépendances.

## Installation

```bash
composer install
cp .env.example .env        # puis renseigner les variables DB_*
php artisan key:generate
php artisan migrate
```

### Configuration base de données (.env)

```env
DB_CONNECTION=pgsql
DB_HOST=<host-neon>
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=<user>
DB_PASSWORD=<password>
DB_SSLMODE=require
```

> **Neon — endpoint direct vs pooler :** utiliser l'hôte **direct** (sans `-pooler`)
> pour `php artisan migrate` et l'API. L'endpoint `-pooler` (PgBouncer) met en cache
> les plans de requêtes préparées et provoque des erreurs après un changement de schéma
> (`invalid input syntax for type bigint`) ainsi que des échecs de transaction DDL.

## Lancer le serveur

```bash
php artisan serve --port=8000
```

## Endpoints

### Health
| Méthode | Route      | Description                          |
|---------|------------|--------------------------------------|
| GET     | `/health`  | Vérifie la connexion à la base       |

### Authentification (Sanctum)
| Méthode | Route            | Auth          | Description                          |
|---------|------------------|---------------|--------------------------------------|
| POST    | `/api/register`  | —             | Crée un utilisateur, retourne un token |
| POST    | `/api/login`     | —             | Vérifie les identifiants, retourne un token |
| GET     | `/api/user`      | `auth:sanctum`| Retourne l'utilisateur authentifié   |
| POST    | `/api/logout`    | `auth:sanctum`| Révoque le token courant             |

Les routes protégées attendent l'en-tête : `Authorization: Bearer <token>`.

#### Exemple

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# Accès protégé
curl http://127.0.0.1:8000/api/user -H "Authorization: Bearer <token>"
```

## Modèles de données (Gestion des stocks)

Le schéma couvre la gestion multi-entrepôts :

| Modèle          | Table              | Description                                 |
|-----------------|--------------------|----------------------------------------------|
| `Warehouse`     | `warehouses`       | Entrepôts (nom, code, adresse, responsable) |
| `Category`      | `categories`       | Catégories de produits                      |
| `Product`       | `products`         | Catalogue produits                          |
| `Stock`         | `stocks`           | Quantités en stock par entrepôt/produit     |
| `StockMovement` | `stock_movements`  | Historique des mouvements de stock          |
| `Transfer`      | `transfers`        | Transferts inter-entrepôts                  |
| `TransferItem`  | `transfer_items`   | Lignes de transfert                         |
| `Inventory`     | `inventories`      | Inventaires (sessions de comptage)          |
| `InventoryItem` | `inventory_items`  | Lignes d'inventaire                         |

Les migrations correspondantes sont dans `database/migrations/`.

### Seeders

```bash
php artisan migrate
php artisan db:seed
```

- `RolePermissionSeeder` — crée les rôles et permissions (voir [Rôles & Permissions](#rôles--permissions-spatie-laravel-permission))
- `DemoSeeder` — crée des utilisateurs, entrepôts, catégories, produits et stocks de démonstration

## Rôles & Permissions (Spatie laravel-permission)

La gestion des rôles/permissions utilise le package [`spatie/laravel-permission`](https://spatie.be/docs/laravel-permission).

### Installation

```bash
composer require spatie/laravel-permission
php artisan migrate
```

> La configuration (`config/permission.php`) et la migration des tables de permissions sont déjà présentes dans le projet — seul le package Composer doit être installé.

### Rôles seedés

| Rôle             | Permissions principales                                                        |
|------------------|----------------------------------------------------------------------------------|
| `administrateur` | Toutes les permissions                                                          |
| `gestionnaire`   | dashboard, rapports, export, validation/annulation transferts, ajustement inventaires |
| `magasinier`     | mouvements de stock, création/réception transferts, mise à jour inventaires    |
| `auditeur`       | activité, rapports, export, dashboard                                          |

```bash
php artisan db:seed --class=RolePermissionSeeder
```

### Utilisateurs de démonstration

Le `DemoSeeder` crée un utilisateur par rôle (mot de passe : `password`) :

| Email                      | Rôle             |
|-----------------------------|------------------|
| `admin@stockflow.ma`        | `administrateur` |
| `gestionnaire@stockflow.ma` | `gestionnaire`   |
| `magasinier@stockflow.ma`   | `magasinier`     |

## Structure

- `app/Http/Controllers/AuthController.php` — logique d'authentification
- `app/Models/User.php` — modèle User (trait `HasApiTokens`, `HasRoles`)
- `app/Models/` — modèles du domaine (entrepôts, produits, stocks, transferts, inventaires)
- `routes/api.php` — routes API
- `routes/web.php` — route `/health`
- `database/seeders/` — `RolePermissionSeeder`, `DemoSeeder`
