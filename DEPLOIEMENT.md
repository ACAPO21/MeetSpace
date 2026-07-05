# Manuel de déploiement — MeetSpace

Ce document décrit comment déployer l'application MeetSpace. Le déploiement
repose entièrement sur **Docker**, ce qui garantit un environnement identique
sur tout poste (mêmes versions de Node, PostgreSQL et dépendances).

## Prérequis

- Docker et Docker Compose installés.
- Le code source du dépôt récupéré (`git clone`).

## 1. Configuration

À la racine du projet, créer un fichier `.env` à partir du modèle fourni :

```bash
cp .env.example .env
```

Puis renseigner les valeurs :

| Variable | Rôle |
|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | identifiants et nom de la base PostgreSQL |
| `DATABASE_URL` | URL de connexion du back-end à la base (hôte `db` via docker-compose) |
| `JWT_SECRET` | secret de signature des jetons JWT (valeur longue et aléatoire) |
| `CORS_ORIGIN` | URL du front-end autorisée à appeler l'API |

## 2. Lancement (développement)

```bash
docker-compose up --build
```

Cette unique commande démarre les trois services : la base **PostgreSQL**,
le **back-end** (API sur le port 4000) et le **front-end** (interface sur le
port 5173).

## 3. Migrations de la base

Appliquer le schéma à la base :

```bash
docker-compose exec backend npx prisma migrate deploy
```

Charger le jeu de données initial (3 comptes, 1 bâtiment, plusieurs salles).
Cette étape est **nécessaire** pour disposer de comptes de connexion : le PoC
ne gère pas la création de compte en libre-service (prévue via le SSO
d'entreprise, hors périmètre) ; les comptes sont donc pré-provisionnés ici.

```bash
docker-compose exec backend npm run seed
```

Comptes créés par le seed (mot de passe `Password123`) :
`admin@meetspace.local` (administrateur), `user@meetspace.local` et
`user2@meetspace.local` (utilisateurs).

## 4. Vérification

- API : `http://localhost:4000/health` doit répondre `{"status":"ok"}`.
- Interface : `http://localhost:5173`.

## 5. Déploiement en configuration de production

Une configuration dédiée `docker-compose.prod.yml` prend le relais : secrets
injectés par variables d'environnement, base de données **persistante**,
redémarrage automatique et **absence de montage du code source** (l'image est
autonome).

```bash
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Technologies

- **Back-end** : Node.js 24, Express, TypeScript, Prisma (ORM), PostgreSQL 16.
- **Front-end** : React + Vite (TypeScript).
- **Conteneurisation** : Docker et Docker Compose.
