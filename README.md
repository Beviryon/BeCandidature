# BeCandidature - Application de suivi des candidatures

Application React complète avec Firebase pour gérer et suivre vos candidatures (alternance, stage, CDI).

## Fonctionnalités

- Authentification complète avec Firebase Auth (email + mot de passe)
- CRUD complet des candidatures avec Firestore
- Tableau de suivi et dashboard de statistiques
- Détail candidature, calendrier des relances, import Excel/email
- Assistant IA pour aide à la rédaction et aux relances
- Espace admin (validation utilisateurs, suspension, rejet)
- Emails automatiques via Firebase Functions + Resend

## Stack technique

- Frontend: React 18, Vite, TailwindCSS
- Backend: Firebase (Auth, Firestore, Cloud Functions)
- IA: OpenAI via Cloud Function backend (clé non exposée au navigateur)

## Prérequis

- Node.js 18+ (recommandé)
- Un projet Firebase
- Firebase CLI installée (`npm i -g firebase-tools`)

## Installation

```bash
npm install
```

Puis pour les Cloud Functions:

```bash
cd functions
npm install
```

## Configuration Firebase (frontend)

Créez un fichier `.env` à la racine du projet:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Optionnel (calendrier Google):

```env
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_API_KEY=...
```

## Configuration IA sécurisée (backend)

L'assistant IA n'utilise plus de clé OpenAI côté navigateur.  
La clé est stockée côté Cloud Functions.

### 1) Configurer la clé OpenAI sur Firebase Functions

```bash
firebase functions:config:set openai.apikey="sk-..."
firebase functions:config:set openai.model="gpt-4o-mini"
```

### 2) Déployer les functions

```bash
firebase deploy --only functions
```

### 3) Configurer l'URL backend côté frontend

Dans `.env` (racine), ajoutez:

```env
VITE_AI_FUNCTION_URL=https://<region>-<project-id>.cloudfunctions.net/generateAIResponse
```

> Sans cette variable, l'assistant IA bascule automatiquement en mode démo.

## Lancer l'application

```bash
npm run dev
```

Application accessible sur [http://localhost:5173](http://localhost:5173).

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Dans `functions/`:

```bash
npm run serve
npm run deploy
npm run logs
```

## Structure du projet

```text
BeCandidature/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── firebaseConfig.js
├── functions/
│   ├── index.js
│   └── package.json
├── public/
└── README.md
```

## Notes de sécurité

- Ne jamais exposer une clé OpenAI en variable `VITE_*`
- Conserver les clés sensibles dans Firebase Functions config ou variables serveur
- Vérifier que les règles Firestore limitent l'accès aux données de l'utilisateur connecté

## Déploiement

- Frontend: Vercel / Netlify / Firebase Hosting
- Backend: Firebase Functions

Assurez-vous d'ajouter les variables d'environnement frontend sur la plateforme de déploiement.

## Licence

MIT
