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
php artisan storage:link     # requis pour les images produits (disque "public")
```

> **`storage:link` :** `ProductController` enregistre les images sur le disque
> `public` (`storage/app/public/products`). Sans ce lien symbolique, les images
> uploadées ne seront pas accessibles via `/storage/...`. À exécuter une seule fois.

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

> Toutes les routes sont préfixées par **`/api/v1`** (conception §4.2).

| Méthode | Route               | Auth          | Description                                  |
|---------|---------------------|---------------|----------------------------------------------|
| POST    | `/api/v1/register`  | —             | Crée un utilisateur, retourne un token       |
| POST    | `/api/v1/login`     | —             | Vérifie les identifiants, retourne un token  |
| GET     | `/api/v1/me`        | `auth:sanctum`| Utilisateur authentifié + rôles + permissions |
| GET     | `/api/v1/user`      | `auth:sanctum`| Retourne l'utilisateur authentifié           |
| POST    | `/api/v1/logout`    | `auth:sanctum`| Révoque le token courant                     |

Les routes protégées attendent l'en-tête : `Authorization: Bearer <token>`.

#### Exemple

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# Login puis accès protégé
curl -X POST http://127.0.0.1:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stockflow.ma","password":"password"}'

curl http://127.0.0.1:8000/api/v1/me -H "Authorization: Bearer <token>"
```

### Ressources CRUD

> Toutes ces routes sont sous **`/api/v1`** et requièrent `auth:sanctum`.
> Les routes de **lecture** (`GET`) sont accessibles à tout utilisateur authentifié ;
> les routes d'**écriture** sont protégées par rôle (colonne « Rôle »).

#### Utilisateurs (`administrateur` uniquement)

| Méthode | Route                       | Description                                   |
|---------|-----------------------------|-----------------------------------------------|
| GET     | `/users`                    | Liste des utilisateurs (avec rôles)           |
| POST    | `/users`                    | Crée un utilisateur (`role` optionnel)        |
| GET     | `/users/{user}`             | Détail d'un utilisateur                       |
| PUT     | `/users/{user}`             | Met à jour (peut changer le `role`)           |
| POST    | `/users/{user}/toggle`      | Active / désactive le compte                  |

#### Entrepôts (écriture : `administrateur`)

| Méthode | Route                       | Description                                   |
|---------|-----------------------------|-----------------------------------------------|
| GET     | `/warehouses`               | Liste (actifs ; `?inactifs=true` pour tout)   |
| GET     | `/warehouses/{warehouse}`   | Détail d'un entrepôt                          |
| POST    | `/warehouses`               | Crée un entrepôt                              |
| PUT     | `/warehouses/{warehouse}`   | Met à jour (champ `actif` pour réactiver)     |
| DELETE  | `/warehouses/{warehouse}`   | Désactive (refusé **422** si stock > 0)       |

#### Catégories (écriture : `gestionnaire`, `administrateur`)

| Méthode | Route                       | Description                                   |
|---------|-----------------------------|-----------------------------------------------|
| GET     | `/categories`               | Liste (avec `products_count`)                 |
| GET     | `/categories/{category}`    | Détail d'une catégorie                        |
| POST    | `/categories`               | Crée une catégorie                            |
| PUT     | `/categories/{category}`    | Met à jour                                    |
| DELETE  | `/categories/{category}`    | Supprime (refusé **422** si produits liés)    |

#### Produits (écriture : `gestionnaire`, `administrateur`)

| Méthode | Route                       | Description                                       |
|---------|-----------------------------|---------------------------------------------------|
| GET     | `/products`                 | Liste (actifs ; `?inactifs=true` pour tout)       |
| GET     | `/products/{product}`       | Détail (avec catégorie)                           |
| POST    | `/products`                 | Crée un produit (`multipart/form-data` si `image`)|
| POST    | `/products/{product}`       | Met à jour (POST car `multipart` ne gère pas PUT) |
| DELETE  | `/products/{product}`       | Désactive (`actif = false`)                       |

> **Soft-delete :** `DELETE` sur un produit/entrepôt passe `actif` à `false` et le
> retire des listes par défaut. Pour le réafficher : `?inactifs=true` (lecture) ou
> `actif: true` (mise à jour). Aucune suppression physique.

### Middleware de rôles

Les routes peuvent être protégées par rôle via les alias enregistrés dans
`bootstrap/app.php` :

| Alias                  | Source              | Exemple d'usage                              |
|------------------------|---------------------|----------------------------------------------|
| `checkrole`            | `App\Http\Middleware\CheckRole` | `->middleware('checkrole:administrateur')` |
| `role`                 | Spatie              | `->middleware('role:gestionnaire')`          |
| `permission`           | Spatie              | `->middleware('permission:export')`          |
| `role_or_permission`   | Spatie              | `->middleware('role_or_permission:...')`     |

Un rôle insuffisant renvoie **403**, une requête non authentifiée **401**.

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

## Services métier (logique critique)

Toute règle de gestion passe par une couche de **services** en transactions atomiques
(conception §3). Les contrôleurs délèguent à ces services.

| Service            | Rôle                                                                                   |
|--------------------|----------------------------------------------------------------------------------------|
| `StockService`     | `createMovement()` — tout mouvement de stock en `DB::transaction` + `lockForUpdate` (verrou pessimiste), contrôle du disponible (`InsufficientStockException`), référence auto `MVT-AAAA-NNNNNN`, événement `StockLow` au seuil. `adjustReserve()` pour les réservations. |
| `TransferService`  | Machine à états `brouillon → en_attente → valide → recu \| annule` (`submit/validate/receive/cancel`). Double mouvement : sortie source à la validation (+ réserve dest), entrée dest à la réception (réserve libérée), ré-entrée source si annulation après validation. |
| `InventoryService` | `open()` (snapshot `qte_theorique`), `recordCount()`, `close()`, `adjust()` — génère les mouvements d'écart (`ajustement_entree`/`ajustement_sortie`). |

Composants associés :

- `app/Enums/MovementType.php` — 9 types de mouvement + `isSortie()`
- `app/Enums/TransferStatus.php` — états + transitions autorisées
- `app/Events/StockLow.php` — émis quand `disponible <= stock_minimum`
- `app/Exceptions/InsufficientStockException.php`
- `app/Support/Ref.php` — génération des références séquentielles (`MVT-`, `TRF-`)

## Structure

- `app/Http/Controllers/AuthController.php` — authentification (`login`/`logout`/`me`/`register`)
- `app/Http/Middleware/CheckRole.php` — contrôle de rôle (403 si insuffisant)
- `app/Models/User.php` — modèle User (traits `HasApiTokens`, `HasRoles`, `HasUuids`)
- `app/Models/` — modèles du domaine (entrepôts, produits, stocks, transferts, inventaires)
- `app/Services/` — `StockService`, `TransferService`, `InventoryService`
- `app/Enums/`, `app/Events/`, `app/Exceptions/`, `app/Support/`
- `routes/api.php` — routes API (préfixe `/api/v1`)
- `routes/web.php` — route `/health`
- `database/seeders/` — `RolePermissionSeeder`, `DemoSeeder`
