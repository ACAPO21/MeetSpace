# Manuel de mise à jour — MeetSpace

Ce document décrit la procédure de mise à jour de l'application vers une
nouvelle version, ainsi que la marche à suivre en cas de retour arrière.

## Mettre à jour vers la dernière version stable

1. Récupérer la dernière version stable :

   ```bash
   git pull origin main
   ```

2. Reconstruire les images Docker :

   ```bash
   docker-compose up --build -d
   ```

3. Appliquer les éventuelles nouvelles migrations de schéma :

   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

4. Vérifier le bon fonctionnement via la route de santé :
   `http://localhost:4000/health` doit répondre `{"status":"ok"}`.

## Versionnage

Chaque version livrable est identifiée par une étiquette Git suivant la
convention **SemVer** (`MAJEUR.MINEUR.CORRECTIF`, par exemple `v0.1.0`) :

- **MAJEUR** : changement incompatible ;
- **MINEUR** : ajout de fonctionnalité rétrocompatible ;
- **CORRECTIF** : correction de bug rétrocompatible.

Lister les versions disponibles :

```bash
git tag -l
```

## Retour arrière (réversibilité)

Le versionnage combiné à la conteneurisation assure un retour arrière fiable.
En cas d'anomalie détectée après une mise à jour, revenir à la version stable
précédente :

```bash
git checkout v0.1.0        # remplacer par le tag stable visé
docker-compose up --build -d
docker-compose exec backend npx prisma migrate deploy
```

Chaque version étant étiquetée et chaque image reconstruite à l'identique,
le retour à un état antérieur stable est immédiat, sans reconstruction manuelle.
