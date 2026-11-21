# Mise en ligne de StockFlow (Fly.io + Netlify)

Rien n'est encore créé ni déployé. Backend Laravel sur Fly.io, frontend React sur Netlify (compte d'Amine, créé par lui).

## 1. Backend sur Fly.io (`backend/`)
Les clés ne sont JAMAIS dans le dépôt : elles vont dans les « secrets » Fly.

```powershell
cd backend
flyctl apps create stockflow-api-amine
flyctl secrets set APP_KEY="base64:<32 octets aléatoires en base64>" DB_URL="<adresse Neon>" APP_URL="https://stockflow-api-amine.fly.dev"
flyctl secrets set CORS_ALLOWED_ORIGINS="https://<site>.netlify.app"
flyctl deploy
```

Ensuite, les migrations sont lancées **à la main** (volontairement pas au démarrage) :

```powershell
flyctl ssh console -C "php artisan migrate --force"
flyctl ssh console -C "php artisan db:seed --class=RolePermissionSeeder --force"
```

Vérifier : `https://stockflow-api-amine.fly.dev/health`.

- **Base de données** : le README parle d'une base Neon. Dire s'il faut utiliser celle de l'équipe (données de développement)
  ou en créer une nouvelle pour la production. Ne lancer le seeder de démonstration (`DemoSeeder`) que si on veut des données d'exemple.
- **Région** : `iad` par défaut dans `fly.toml`. La changer pour la région la plus proche de la base Neon.
- Le Dockerfile n'a pas pu être testé ici (pas de Docker sur ce PC) : Fly le construit à distance, la première construction
  peut demander un ajustement.

## 2. Frontend sur Netlify (`frontend/`)
Dans le compte Netlify d'Amine : « Add new site > Import an existing project », choisir le dépôt `amine-dev1/entrepots_system`, puis :
- **Base directory** : `frontend` (c'est là que se trouve `netlify.toml`)
- **Build command** : `npm run build` — **Publish directory** : `dist` (déjà dans `netlify.toml`)
- **Variable d'environnement** : `VITE_API_URL` = `https://stockflow-api-amine.fly.dev/api/v1`
  (à définir AVANT le premier déploiement : Vite l'intègre à la construction)
- `netlify.toml` gère les routes de l'application (React Router).

Une fois l'adresse `.netlify.app` connue, la mettre dans `CORS_ALLOWED_ORIGINS` côté Fly (`flyctl secrets set ...`).
