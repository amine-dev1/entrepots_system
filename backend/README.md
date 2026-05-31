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
  -d '{"name":"Test","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# Accès protégé
curl http://127.0.0.1:8000/api/user -H "Authorization: Bearer <token>"
```

## Structure

- `app/Http/Controllers/AuthController.php` — logique d'authentification
- `app/Models/User.php` — modèle User (trait `HasApiTokens`)
- `routes/api.php` — routes API
- `routes/web.php` — route `/health`
