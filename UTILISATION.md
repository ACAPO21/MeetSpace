# Manuel d'utilisation — MeetSpace

MeetSpace est une application web de réservation de salles de réunion.
Ce manuel décrit les parcours principaux côté utilisateur.

## Connexion

1. Ouvrir l'application (`http://localhost:5173`).
2. Saisir son adresse e-mail et son mot de passe, puis valider.
3. En cas de succès, on est redirigé vers la liste des salles.

> Comptes pré-créés par le seed (comptes provisionnés, pas de création en
> libre-service — voir le manuel de déploiement) :
> - Administrateur : `admin@meetspace.local` / `Password123`
> - Utilisateur : `user@meetspace.local` / `Password123`
> - Utilisateur : `user2@meetspace.local` / `Password123`

Toute tentative d'accès à une page protégée sans être connecté renvoie
automatiquement vers la page de connexion.

## Consulter et filtrer les salles

La liste affiche chaque salle avec sa capacité, ses équipements et son bâtiment.
Deux filtres permettent d'affiner la recherche :

- **Capacité minimale** : n'affiche que les salles d'au moins N places.
- **Équipement** : n'affiche que les salles disposant de l'équipement choisi.

## Réserver une salle

1. Depuis une salle, ouvrir le **calendrier** hebdomadaire.
2. Les créneaux déjà pris apparaissent en blocs « Occupé » (sans détail, pour
   la confidentialité).
3. Sélectionner un créneau libre par glisser-déposer (cela fixe la durée).
   Sans souris, le même créneau peut être renseigné au clavier via le
   formulaire dédié (date, heure de début, heure de fin).
4. Saisir l'intitulé de la réunion.
5. (Facultatif) Inviter des collègues, présentés par nom et e-mail. On ne peut
   pas s'inviter soi-même.
6. Valider.

Si le créneau chevauche une réservation existante, l'opération est refusée
avec le message « Créneau déjà réservé ». Deux réunions qui se suivent
(ex. 10h-11h puis 11h-12h) sont en revanche acceptées.

## Mes réservations

L'espace « Mes réservations » regroupe :

- les réunions que l'on a créées ;
- les réunions auxquelles on a été invité (mention « Invité »).

Seul l'organisateur (propriétaire) peut **annuler** une réservation.

## Administration (rôle administrateur)

Un utilisateur administrateur dispose d'un menu dédié pour :

- créer, modifier et supprimer des bâtiments (suppression refusée tant que le
  bâtiment contient des salles) ;
- créer, modifier et supprimer des salles (suppression refusée tant que la
  salle porte des réservations) ;
- consulter l'ensemble des réservations et en supprimer n'importe laquelle
  (modération).

Ce menu n'apparaît pas pour un utilisateur standard, et les actions
correspondantes sont protégées côté serveur.
