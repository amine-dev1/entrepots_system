# Mise en ligne de StockFlow (Fly.io + Vercel)

Rien n'est encore créé ni déployé. Backend Laravel sur Fly.io, frontend React sur Vercel (compte d'Amine, créé par lui).

## 1. Backend sur Fly.io (`backend/`)
Les clés ne sont JAMAIS dans le dépôt : elles vont dans les « secrets » Fly.

```powershell
cd backend
flyctl apps create stockflow-api-amine
flyctl secrets set APP_KEY="base64:<32 octets aléatoires en base64>" DB_URL="<adresse Neon>" APP_URL="https://stockflow-api-amine.fly.dev"
flyctl secrets set CORS_ALLOWED_ORIGINS="https://<domaine Vercel du frontend>"
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

## 2. Frontend sur Vercel (`frontend/`)
Dans le compte Vercel d'Amine : « Add New > Project », importer le dépôt, puis :
- **Root Directory** : `frontend`
- **Framework Preset** : Vite
- **Variable d'environnement** : `VITE_API_URL` = `https://stockflow-api-amine.fly.dev/api/v1`
- `vercel.json` gère les routes de l'application (React Router).

Une fois l'adresse Vercel connue, la mettre dans `CORS_ALLOWED_ORIGINS` côté Fly (`flyctl secrets set ...`).
