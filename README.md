# Next

Next organise des tâches et des dossiers hiérarchiques. Son accueil propose les tâches exécutables selon un score de priorité calculé à partir de critères et de poids réglables.

## Fonctionnalités

- Création et édition de tâches et dossiers imbriqués, navigation par fil d’Ariane et progression des branches.
- Accueil centré sur les tâches non-dossiers sans enfants, classées par priorité ; nombre de tâches affichées réglable de 1 à 50.
- Échéance, âge, importance, durée en minutes, effort et appréciation pris en compte dans le score.
- Validation des tâches, possibilité de les ignorer pour la journée et réinitialisation des tâches ignorées.
- Statistiques par période et projet, affichage optionnel des scores et export CSV de la hiérarchie.
- Suppression d’un élément et de ses descendants après confirmation, nettoyage de l’historique ou réinitialisation depuis les paramètres.
- Thèmes clair et sombre persistants, stockage local ou Firebase.

## Écrans

| URL | Écran |
| --- | --- |
| `/home` | Home : tâches proposées et ajout |
| `/database` | Database : dossiers et tâches |
| `/stats` | Statistics |
| `/settings` | Settings : poids, affichage, thème, compte et export |

La racine `/` redirige vers l’accueil. La connexion s’affiche lorsqu’aucune session n’est active. Les écrans secondaires sont chargés à la demande.

## Stack et organisation

React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, React Router, Lucide et Firebase Authentication / Firestore, avec Recharts pour les graphiques.

- [src/pages/](src/pages/) : écrans de l’application.
- [src/hooks/useData.tsx](src/hooks/useData.tsx) : état applicatif et opérations sur les tâches.
- [src/services/](src/services/) : interfaces et fournisseurs locaux/Firebase.
- [src/lib/tree.ts](src/lib/tree.ts) : navigation et calculs dans la hiérarchie.
- [src/lib/priority.ts](src/lib/priority.ts) : score de priorité et départage.
- [src/lib/export.ts](src/lib/export.ts) : export CSV.
- [src/styles/](src/styles/) : imports des styles partagés et styles propres à l’application.

## Installation

Environnement de référence : Node.js 24 et npm. Exécuter les commandes depuis ce dépôt.

```bash
npm ci
npm run dev
```

Le serveur de développement écoute sur le port 3000. Ouvrir `http://localhost:3000`.

## Configuration et données

Sans configuration Firebase complète, Next utilise ses fournisseurs locaux et une session de développement. Avec Firebase, la connexion et l’inscription utilisent email et mot de passe.

Le mode local conserve ses données dans le `localStorage` du navigateur, sans synchronisation entre appareils. Sa session de développement n’est pas une authentification distante. Changer de mode de stockage ne transfère pas automatiquement ces données.

Pour utiliser Firebase, copier [.env.example](.env.example) vers `.env.local` et renseigner la configuration de l’application web :

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Activer l’authentification email/mot de passe et Firestore dans le projet Firebase concerné. Ces variables sont lues par Vite au démarrage et lors du build : redémarrer le serveur ou reconstruire après une modification. Conserver les fichiers d’environnement locaux hors Git.

## Commandes et validation

| Commande | Rôle |
| --- | --- |
| `npm ci` | Installer les versions du lockfile, y compris l’archive UI locale |
| `npm run dev` | Lancer le serveur de développement sur le port 3000 |
| `npm run lint` | Vérifier les types avec `tsc --noEmit` |
| `npm run check:ui` | Vérifier l’archive UI, son empreinte, le lockfile et les réexports |
| `npm run build` | Exécuter `prebuild` puis générer le site statique dans `dist/` |
| `npm run preview` | Prévisualiser le dernier build localement |

Aucun script `npm test` n’est défini actuellement ; les contrôles disponibles sont le typage, la vérification du package UI et le build.

## Priorité

Le score est une somme pondérée de six critères normalisés : proximité de l’échéance, âge, importance, durée, effort et appréciation. Les poids sont réglables dans les paramètres. Les dossiers ne portent pas les mêmes critères qu’une tâche exécutable ; les fonctions de l’arbre restent dans `src/lib/tree.ts`.

Les variables `GEMINI_API_KEY` et `APP_URL` présentes dans le fichier d’exemple sont héritées du projet initial et ne sont pas nécessaires aux fonctionnalités actuelles de gestion des tâches.

## Interface partagée

L’application utilise `@3gaspo/app-ui`, actuellement en version 0.1.5, pour la navigation, les titres, dialogues, formulaires, commandes, retours d’état et formats visibles. L’interface utilise Inter et des thèmes clair et sombre communs. Les dates affichées utilisent `en-GB` et les heures le format 24 h ; les formats de stockage et d’export restent propres à l’application.

L’archive est incluse dans [vendor/](vendor/) et référencée par `package.json` et `package-lock.json`. Ce dépôt est installable et déployable seul : aucun accès au dépôt source voisin `app-ui` ni à un registre privé n’est nécessaire. Relancer `npm ci` après un pull qui change les dépendances. La vérification du package partagé s’exécute automatiquement avant le build.

## Déploiement

Le site statique est servi par Firebase Hosting depuis `dist/`. [firebase.json](firebase.json) redirige les routes de l’application vers `index.html` et déclare aussi les règles et index Firestore.

Après avoir authentifié la CLI Firebase et sélectionné le bon projet :

```bash
git pull
npm ci
npm run build
firebase deploy --only hosting
```

Ajouter `--project ID_DU_PROJET` si aucun projet n’est sélectionné. Un `firebase deploy` sans restriction peut aussi publier les règles et index Firestore déclarés. Un retour à une version conservée dans l’historique Firebase Hosting restaure le site, pas les données.
