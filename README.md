# Next

Next organise des tâches et des dossiers hiérarchiques. Son accueil propose les tâches exécutables selon un score de priorité calculé à partir de critères et de poids réglables.

Le nom affiché dans l’application, les favoris et les métadonnées d’installation web est **Next** ; le nom technique npm est `next`. Le manifeste est dans `public/manifest.json`, l’icône de l’application dans `public/next.svg` et le logo des paramètres dans `public/gaspo_logo.svg`.

Les icônes utilisent un canevas de 512 × 512, un fond noir opaque et des formes gris-blanc `#D9D9D9`. Les PNG `public/next-192.png` et `next-512.png` sont les exports standard ; `next-maskable-512.png` (Android) et `next-apple-touch-icon.png` (Apple, 180 × 180) appliquent la même marge de 10 % par côté, avec un symbole à 80 % de sa taille d’origine. Ils dérivent du SVG et sont référencés par le manifeste et les métadonnées Apple. Après modification du SVG, régénérer ces exports.

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

Un tutoriel présente le but de l’app, puis les fonctions principales de ses quatre onglets avec leurs icônes. Il s’ouvre à la première visite de l’accueil après connexion et sa fermeture est mémorisée pour ce compte dans le navigateur. La section Help de Settings regroupe `View tutorial` et `Detailed functionalities`, qui ouvre un guide des parcours et des calculs de l’app.

Une page du tutoriel explique les six facteurs du score de priorité par défaut. Le guide détaillé donne la formule et ses poids.

Un échec de lecture affiche un message bref avec la commande `Reload page`, sans présenter une fausse liste vide. Le rechargement relance la lecture des données existantes. Les échecs d'enregistrement conservent leurs messages et parcours de nouvelle tentative dans le formulaire ou l'action concernés.

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

Avec Firebase, `Forgot password?` envoie un lien de réinitialisation à l’adresse saisie. Le formulaire indique qu’une adresse est inconnue si Firebase le signale. Lorsque Firebase protège l’existence des comptes, l’accusé de réception reste générique.

`Continue as guest` ouvre une session de test sans compte. Les données et réglages invités restent dans le `sessionStorage` de l’onglet, sans écriture dans Firestore. Ils sont conservés au rechargement et effacés à la fermeture de l’onglet ou après confirmation avec `End guest session` dans Settings.

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

Dans Firebase Console → Authentication → Templates → Password reset, renseigner `Next` dans le champ `Sender name`. [Paramètres du modèle Firebase](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v2/Config#EmailTemplate)

## Commandes et validation

| Commande | Rôle |
| --- | --- |
| `npm ci` | Installer les versions du lockfile, y compris l’archive UI locale |
| `npm run dev` | Lancer le serveur de développement sur le port 3000 |
| `npm run lint` | Vérifier les types avec `tsc --noEmit` |
| `npm test` | Vérifier les scores, les tranches de priorité et les échéances urgentes |
| `npm run check:ui` | Vérifier l’archive UI, son empreinte, le lockfile et les réexports |
| `npm run build` | Exécuter `prebuild` puis générer le site statique dans `dist/` |
| `npm run preview` | Prévisualiser le dernier build localement |

Les tests de priorité utilisent le runner Node via `tsx`. Les autres contrôles disponibles sont le typage, la vérification du package UI et le build.

## Priorité

Le score est une somme pondérée de six critères normalisés : proximité de l’échéance, âge, importance, durée, effort et appréciation. Les poids sont réglables dans les paramètres. Les dossiers ne portent pas les mêmes critères qu’une tâche exécutable ; les fonctions de l’arbre restent dans `src/lib/tree.ts`.

L’ancienneté et la durée suivent une courbe quadratique en U : `(2 × clamp(valeur / plafond, 0, 1) − 1)²`. Les plafonds restent de 360 jours et 250 minutes. Avec les poids positifs par défaut, les tâches récentes ou très anciennes, ainsi que les tâches courtes ou très longues, sont favorisées ; les minima sont à 180 jours et 125 minutes. L’ancienneté utilise les jours calendaires locaux. Les poids par défaut restent `2, 3, 2, 1, −1, 1` ; une tâche nouvelle avec les champs préremplis obtient 4,78.

Chaque tâche active affiche un badge de priorité parmi cinq tranches égales de l’intervalle théorique autorisé par les poids : `Very low priority`, `Low priority`, `Medium priority`, `High priority`, `Very high priority`. Les bornes sont les sommes des poids négatifs et positifs ; avec les poids par défaut, les seuils sont −1, 1, 3, 5, 7 et 9. Cette plage couvre aussi les anciennes données contenant des notes à zéro. Les tranches s’adaptent aux poids personnalisés ; avec tous les poids à zéro, le badge est neutre (`Medium priority`).

Le badge `Urgent` s’affiche sur les tâches non terminées dont l’échéance est au plus tard demain, retards inclus. Les scores et les indicateurs se recalculent au changement de journée locale et au retour dans l’application. Les badges ne changent pas les règles de classement. Les moyennes `Overall Score` et `Category Score` sont supprimées.

`Show Priority Scores` est désactivé par défaut ; son choix est enregistré. Il commande le score individuel et les valeurs détaillées d’importance, durée, effort et appréciation sur l’accueil. Les badges de priorité, l’urgence, l’échéance et le nom du projet restent visibles. Les paramètres déjà choisis sont conservés. Sur l’accueil, `Skip for today` se trouve immédiatement à gauche du bouton de validation.

Les variables `GEMINI_API_KEY` et `APP_URL` présentes dans le fichier d’exemple sont héritées du projet initial et ne sont pas nécessaires aux fonctionnalités actuelles de gestion des tâches.


Les réglages signalent une sauvegarde en cours et les échecs avec Retry. Les changements sont écrits dans l’ordre ; une valeur rejetée n’est pas présentée comme enregistrée. Les champs numériques conservent la saisie pendant l’attente.

## Interface partagée

L’application utilise `@3gaspo/app-ui`, actuellement en version 0.1.23, pour la navigation, les titres, dialogues, formulaires, commandes, retours d’état et formats visibles. Inter et Source Sans 3 sont hébergées avec l’application. Source Sans 3 sert au titre portant le nom de l’app, et Inter au reste de l’interface. Les dates affichées utilisent `en-GB` et les heures le format 24 h ; les formats de stockage et d’export restent propres à l’application.

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

## Corrections du 28 novembre 2026

Le nettoyage de l’historique conserve les parents terminés tant qu’ils contiennent des descendants actifs, pour garder leur chemin accessible dans Database (Show done). Les autres éléments terminés restent supprimables. Les champs du formulaire de tâche sont associés à leurs libellés.
