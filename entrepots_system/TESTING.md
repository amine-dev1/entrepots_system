# StockFlow — Register / Login (à tester)

Ce zip contient le projet avec le module **register/login** complété côté
frontend (le backend l'avait déjà). `vendor/` et `node_modules/` ne sont PAS
inclus (trop lourds) — il faut les réinstaller, voir plus bas.

⚠️ Important sur la sécurité : tu as collé le mot de passe de ta base Neon en
clair dans la conversation. Pour un projet d'école ça reste correct pour
l'instant, mais pense à régénérer ce mot de passe (dashboard Neon → Reset
password) une fois le projet rendu, et ne le commite jamais sur un repo public
(le `.env` est déjà dans `.gitignore`, c'est bien).

## Ce qui a été fait

**Backend (déjà fonctionnel avant, vérifié et corrigé) :**
- `AuthController` : `register`, `login`, `logout`, `me` — déjà corrects
  (hash bcrypt, token Sanctum, validation).
- `routes/api.php` : `/api/v1/register` et `/api/v1/login` publics, le reste
  derrière `auth:sanctum`.
- `config/database.php` : le `sslmode` pgsql lit maintenant `DB_SSLMODE`
  depuis le `.env` (utile pour Neon qui exige `require`).
- `.env` : déjà configuré avec ta connexion Neon.
- `database/seeders/DemoSeeder.php` : crée déjà 3 comptes de test (voir
  identifiants ci-dessous) — rien à changer ici.

**Frontend (ajouté — il n'y avait que la couche API/contexte, pas d'écrans) :**
- `src/features/auth/LoginPage.jsx` et `RegisterPage.jsx`
- `src/features/auth/AuthLayout.jsx` (mise en page partagée)
- `src/features/dashboard/DashboardPage.jsx` (page de test post-connexion)
- `src/components/shared/ProtectedRoute.jsx`
- `src/App.jsx` : routes `/login`, `/register`, `/dashboard` (protégée)
- `react-router-dom` et `lucide-react` ajoutés à `package.json`

## ⚠️ Je n'ai pas pu exécuter le code moi-même

Mon environnement n'a pas PHP/Composer installé, et son accès réseau est
restreint à quelques domaines (npm, packagist via GitHub, etc.) — il ne peut
pas joindre `*.neon.tech`. J'ai donc relu et corrigé le code statiquement,
mais **tu dois lancer toi-même les commandes ci-dessous pour vérifier**.

## Installation

### Backend

```bash
cd entrepots_system/backend
composer install
php artisan migrate          # crée les tables dans ta base Neon
php artisan db:seed          # crée les comptes de test + données démo
php artisan serve            # http://localhost:8000
```

### Frontend

```bash
cd entrepots_system/frontend
npm install
npm run dev                  # http://localhost:5173
```

Ouvre `http://localhost:5173/login`.

## Identifiants de test (créés par le seeder)

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@stockflow.ma` | `password` | administrateur |
| `gestionnaire@stockflow.ma` | `password` | gestionnaire |
| `magasinier@stockflow.ma` | `password` | magasinier |

Tu peux aussi tester `/register` pour créer un nouveau compte — il sera créé
directement dans ta base Neon, sans rôle assigné par défaut.

## Si `php artisan migrate` échoue

- Vérifie que `DB_SSLMODE=require` est bien dans `backend/.env`.
- Vérifie l'extension PHP `pdo_pgsql` est installée (`php -m | grep pgsql`).
- Si tu utilises Laravel Herd/XAMPP/WAMP, active `pdo_pgsql` et `pgsql` dans
  `php.ini`.
