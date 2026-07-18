# MeetSpace

Application web de réservation de salles de réunion (PoC), multi-utilisateur et
multi-bâtiment. Un collaborateur se connecte, cherche une salle libre selon ses
critères et la réserve sur un créneau, sans qu'aucune réservation ne puisse en
chevaucher une autre.

## Stack technique

- **Back-end** : Node.js 24, Express, TypeScript, Prisma (ORM), PostgreSQL 16.
- **Front-end** : React + Vite (TypeScript).
- **Conteneurisation** : Docker et Docker Compose.

## Prérequis

- **Docker** et **Docker Compose** installés et démarrés.
- Rien d'autre : Node, PostgreSQL et les dépendances sont fournis par les conteneurs.

## Lancement rapide

Toutes les commandes se lancent **à la racine du projet**.

### 1. Créer le fichier de configuration

L'application a besoin d'un fichier `.env` (non versionné car il contient des
secrets). On le crée à partir du modèle fourni :

```bash
cp .env.example .env
```

Pour un test en local, les valeurs d'exemple fonctionnent telles quelles, aucune
modification n'est nécessaire. Le fichier doit contenir ces six variables :
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`,
`JWT_SECRET`, `CORS_ORIGIN`.

> Le mot de passe doit être identique dans `POSTGRES_PASSWORD` et dans
> `DATABASE_URL`.

### 2. Démarrer les trois services

```bash
docker-compose up --build
```

Cette commande démarre la base **PostgreSQL**, le **back-end** (API sur le port
4000) et le **front-end** (interface sur le port 5173).

### 3. Appliquer les migrations et charger les données

Dans un second terminal :

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed
```

Le seed crée un bâtiment, plusieurs salles et trois comptes (mot de passe
`Password123`) :

| Rôle | E-mail |
|---|---|
| Administrateur | `admin@meetspace.local` |
| Utilisateur | `user@meetspace.local` |
| Utilisateur | `user2@meetspace.local` |

### 4. Vérifier

- API : ouvrir `http://localhost:4000/health`, qui doit répondre `{"status":"ok"}`.
- Interface : ouvrir `http://localhost:5173` et se connecter avec un compte du seed.

## Réinitialiser la base

Si la base a été initialisée avec une mauvaise configuration (par exemple un
`.env` incomplet lors du premier lancement), il faut **effacer son volume** :
PostgreSQL n'applique les identifiants qu'à sa toute première initialisation.

```bash
docker-compose down -v
docker-compose up --build
```

Puis relancer les migrations et le seed (étape 3).

## Tests

```bash
docker-compose exec backend npm test
```

Lance la suite de tests (unitaires et d'intégration) avec le rapport de
couverture.

## Configuration de production

Une configuration dédiée `docker-compose.prod.yml` est fournie (secrets injectés
par l'environnement, base persistante, pas de montage du code source) :

```bash
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Documentation

- [`DEPLOIEMENT.md`](DEPLOIEMENT.md) — manuel de déploiement détaillé.
- [`UTILISATION.md`](UTILISATION.md) — manuel d'utilisation (parcours utilisateur).
- [`MISE_A_JOUR.md`](MISE_A_JOUR.md) — manuel de mise à jour.
