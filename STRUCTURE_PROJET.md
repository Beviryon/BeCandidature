# 📂 Structure du projet BeCandidature

Documentation complète de l'architecture du projet.

## 🌳 Arborescence complète

```
BeCandidature/
│
├── public/                          # Fichiers statiques
│   └── vite.svg                     # Logo Vite
│
├── src/                             # Code source de l'application
│   ├── components/                  # Composants React
│   │   ├── Layout.jsx              # Layout principal (Header, Footer, Navigation)
│   │   ├── Login.jsx               # Page de connexion
│   │   ├── Register.jsx            # Page d'inscription
│   │   ├── ListeCandidatures.jsx   # Liste et tableau des candidatures
│   │   ├── AjouterCandidature.jsx  # Formulaire d'ajout de candidature
│   │   └── ModifierCandidature.jsx # Formulaire de modification
│   │
│   ├── App.jsx                     # Composant racine avec routes
│   ├── supabaseClient.js           # Configuration du client Supabase
│   ├── main.jsx                    # Point d'entrée de l'application
│   └── index.css                   # Styles globaux avec Tailwind
│
├── node_modules/                    # Dépendances (généré par npm install)
│
├── .eslintrc.cjs                   # Configuration ESLint
├── .gitignore                      # Fichiers à ignorer par Git
├── .env.example                    # Exemple de fichiers d'environnement
├── .env                            # Variables d'environnement (à créer)
│
├── index.html                      # Point d'entrée HTML
├── package.json                    # Dépendances et scripts npm
├── vite.config.js                  # Configuration Vite
├── tailwind.config.js              # Configuration Tailwind CSS
├── postcss.config.js               # Configuration PostCSS
│
├── supabase-setup.sql              # Script SQL pour créer la base de données
│
├── README.md                       # Documentation principale
├── GUIDE_DEMARRAGE.md              # Guide de démarrage rapide
├── CONFIGURATION_SUPABASE.md       # Guide de configuration Supabase
└── STRUCTURE_PROJET.md             # Ce fichier
```

---

## 📄 Description détaillée des fichiers

### 🔧 Configuration du projet

#### `package.json`
**Rôle** : Fichier de configuration npm
- Définit les dépendances du projet
- Contient les scripts de développement
- Gère les versions des packages

**Dépendances principales** :
- `react` & `react-dom` : Framework React
- `@supabase/supabase-js` : Client Supabase
- `react-router-dom` : Gestion des routes

**Scripts disponibles** :
```bash
npm run dev      # Lancer en développement
npm run build    # Build pour production
npm run preview  # Prévisualiser le build
npm run lint     # Vérifier le code
```

#### `vite.config.js`
**Rôle** : Configuration du bundler Vite
- Configure React pour Vite
- Optimise le build
- Gère le hot-reload en développement

#### `tailwind.config.js`
**Rôle** : Configuration de Tailwind CSS
- Définit où chercher les classes Tailwind
- Permet de personnaliser les couleurs, fonts, etc.

#### `postcss.config.js`
**Rôle** : Configuration PostCSS
- Nécessaire pour que Tailwind fonctionne
- Ajoute autoprefixer pour la compatibilité navigateurs

#### `.eslintrc.cjs`
**Rôle** : Configuration ESLint
- Définit les règles de qualité du code
- Configure les plugins React
- Désactive `prop-types` (car on utilise pas TypeScript)

#### `.gitignore`
**Rôle** : Fichiers à ignorer par Git
- Ignore `node_modules/`
- Ignore `.env` (secrets)
- Ignore les fichiers de build

---

### 🌐 Fichiers HTML/CSS

#### `index.html`
**Rôle** : Point d'entrée HTML
- Template HTML de base
- Charge le script React via `<script src="/src/main.jsx">`
- Contient la balise `<div id="root">` où React se monte

#### `src/index.css`
**Rôle** : Styles globaux
- Import des directives Tailwind (`@tailwind base`, etc.)
- Styles globaux pour `body` et `code`

---

### ⚛️ Code React

#### `src/main.jsx`
**Rôle** : Point d'entrée JavaScript
- Monte l'application React sur `#root`
- Enveloppe `<App />` dans `<StrictMode>`

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `src/App.jsx`
**Rôle** : Composant racine de l'application
- **Gère l'authentification** : Vérifie si l'utilisateur est connecté
- **Configure les routes** avec React Router :
  - Routes publiques : `/login`, `/register`
  - Routes privées : `/`, `/ajouter`, `/modifier/:id`
- **Protège les routes** : Redirige vers `/login` si non connecté

**État** :
- `session` : Session utilisateur Supabase
- `loading` : État de chargement de la session

#### `src/supabaseClient.js`
**Rôle** : Configuration du client Supabase
- Initialise le client Supabase avec les variables d'environnement
- Exporte l'instance `supabase` utilisée partout dans l'app

```js
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### 🧩 Composants React

#### `src/components/Layout.jsx`
**Rôle** : Layout principal de l'application
- **Header** : Logo, navigation, bouton de déconnexion
- **Main** : Contenu dynamique via `<Outlet />`
- **Footer** : Copyright

**Navigation** :
- "Mes candidatures" → `/`
- "Ajouter une candidature" → `/ajouter`
- "Déconnexion" → Sign out + redirection

#### `src/components/Login.jsx`
**Rôle** : Page de connexion
- Formulaire email + mot de passe
- Appelle `supabase.auth.signInWithPassword()`
- Redirige vers `/` après connexion réussie
- Lien vers la page d'inscription

**État** :
- `email` : Email saisi
- `password` : Mot de passe saisi
- `error` : Message d'erreur éventuel
- `loading` : État de chargement

#### `src/components/Register.jsx`
**Rôle** : Page d'inscription
- Formulaire email + mot de passe + confirmation
- Valide que les mots de passe correspondent
- Valide la longueur minimale (6 caractères)
- Appelle `supabase.auth.signUp()`
- Affiche un message de succès puis redirige vers `/login`

**État** :
- `email`, `password`, `confirmPassword`
- `error`, `loading`, `success`

#### `src/components/ListeCandidatures.jsx`
**Rôle** : Affichage du tableau des candidatures
- **Fetch les candidatures** de l'utilisateur connecté au montage
- **Affiche un tableau responsive** avec toutes les colonnes
- **Code couleur** selon le statut (vert/orange/rouge)
- **Alerte de relance** si > 7 jours et statut "En attente"
- **Actions** : Modifier, Supprimer (avec confirmation)
- **Statistiques** : Total, Entretiens, En attente, Refus

**État** :
- `candidatures` : Tableau des candidatures
- `loading` : État de chargement
- `error` : Message d'erreur éventuel

**Fonctions** :
- `fetchCandidatures()` : Récupère les candidatures depuis Supabase
- `handleDelete(id)` : Supprime une candidature
- `getStatusColor(statut)` : Retourne les classes CSS selon le statut
- `shouldRelancer(date)` : Calcule si on doit relancer (> 7 jours)

#### `src/components/AjouterCandidature.jsx`
**Rôle** : Formulaire d'ajout de candidature
- Formulaire avec tous les champs
- **Calcul automatique** de la date de relance (+7 jours)
- Récupère l'`user_id` de l'utilisateur connecté
- Insère dans Supabase avec `supabase.from('candidatures').insert()`
- Redirige vers `/` après ajout

**État** :
- `formData` : Objet avec tous les champs du formulaire
- `loading` : État de chargement
- `error` : Message d'erreur éventuel

**Champs du formulaire** :
- `entreprise` * (requis)
- `poste` * (requis)
- `date_candidature` * (requis)
- `statut` * (select : En attente, Entretien, Refus)
- `contact` (optionnel)
- `lien` (optionnel, type URL)
- `notes` (optionnel, textarea)

#### `src/components/ModifierCandidature.jsx`
**Rôle** : Formulaire de modification de candidature
- **Similaire à AjouterCandidature** mais pour l'édition
- Récupère l'`id` depuis les paramètres de route (`useParams`)
- **Fetch la candidature** au montage pour pré-remplir le formulaire
- Met à jour avec `supabase.from('candidatures').update()`
- Recalcule la date de relance si la date de candidature change

**État** :
- `formData` : Objet avec tous les champs
- `loading` : État de chargement
- `loadingData` : État de chargement des données initiales
- `error` : Message d'erreur éventuel

---

### 🗄️ Base de données Supabase

#### `supabase-setup.sql`
**Rôle** : Script SQL pour créer la table et les politiques
- Crée la table `candidatures` avec toutes les colonnes
- Active **Row Level Security (RLS)**
- Crée 4 politiques de sécurité :
  - SELECT : Les utilisateurs peuvent voir leurs candidatures
  - INSERT : Les utilisateurs peuvent créer leurs candidatures
  - UPDATE : Les utilisateurs peuvent modifier leurs candidatures
  - DELETE : Les utilisateurs peuvent supprimer leurs candidatures
- Crée une fonction et un trigger pour mettre à jour `updated_at`
- Crée des index pour optimiser les performances

**Structure de la table** :
```sql
candidatures (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  entreprise TEXT NOT NULL,
  poste TEXT NOT NULL,
  date_candidature DATE NOT NULL,
  statut TEXT NOT NULL,
  date_relance DATE,
  contact TEXT,
  lien TEXT,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

### 🔐 Variables d'environnement

#### `.env.example`
**Rôle** : Exemple de fichier d'environnement
- Montre quelles variables sont nécessaires
- **Ne contient pas** les vraies clés

#### `.env` (à créer)
**Rôle** : Variables d'environnement secrètes
- Contient les vraies clés API Supabase
- **NE JAMAIS commit ce fichier** (dans `.gitignore`)

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

⚠️ Le préfixe `VITE_` est **obligatoire** pour que Vite expose les variables au frontend

---

### 📚 Documentation

#### `README.md`
**Rôle** : Documentation principale du projet
- Vue d'ensemble du projet
- Instructions d'installation complètes
- Description des fonctionnalités
- Guide de configuration Supabase
- Guide de déploiement
- Dépannage

#### `GUIDE_DEMARRAGE.md`
**Rôle** : Guide de démarrage rapide (5 minutes)
- Installation express
- Configuration minimale
- Premier test de l'application

#### `CONFIGURATION_SUPABASE.md`
**Rôle** : Guide détaillé de configuration Supabase
- Création du projet Supabase pas à pas
- Configuration de la base de données
- Récupération des clés API
- Tests de la configuration
- Dépannage des erreurs courantes

#### `STRUCTURE_PROJET.md`
**Rôle** : Ce fichier - Documentation de l'architecture
- Arborescence complète
- Description de chaque fichier
- Explication du flow de données

---

## 🔄 Flow de données

### 1. Authentification

```
User → Login.jsx → supabase.auth.signInWithPassword()
                ↓
         Session créée
                ↓
         App.jsx détecte la session
                ↓
         Redirection vers "/"
```

### 2. Affichage des candidatures

```
ListeCandidatures.jsx (montage)
         ↓
fetchCandidatures()
         ↓
supabase.from('candidatures').select()
         ↓
Politique RLS vérifie user_id
         ↓
Retourne les candidatures de l'utilisateur
         ↓
setState(candidatures)
         ↓
Render du tableau
```

### 3. Ajout d'une candidature

```
AjouterCandidature.jsx
         ↓
User remplit le formulaire
         ↓
handleSubmit()
         ↓
Calcul date_relance (+7 jours)
         ↓
supabase.from('candidatures').insert()
         ↓
Politique RLS vérifie user_id
         ↓
Insertion dans la DB
         ↓
Redirection vers "/"
```

### 4. Modification d'une candidature

```
ModifierCandidature.jsx (montage)
         ↓
fetchCandidature(id)
         ↓
supabase.from('candidatures').select().eq('id', id)
         ↓
Pré-remplit le formulaire
         ↓
User modifie les champs
         ↓
handleSubmit()
         ↓
supabase.from('candidatures').update()
         ↓
Redirection vers "/"
```

### 5. Suppression d'une candidature

```
ListeCandidatures.jsx
         ↓
User clique sur "Supprimer"
         ↓
Confirmation (window.confirm)
         ↓
handleDelete(id)
         ↓
supabase.from('candidatures').delete().eq('id', id)
         ↓
Suppression de la DB
         ↓
Mise à jour de l'état local
         ↓
Re-render du tableau
```

---

## 🔒 Sécurité

### Row Level Security (RLS)

Supabase applique automatiquement les politiques RLS :

```sql
-- L'utilisateur ne peut voir QUE ses candidatures
WHERE auth.uid() = user_id
```

**Avantages** :
- ✅ Sécurité côté serveur (pas bypassable)
- ✅ Pas besoin de vérifications côté client
- ✅ Protection contre les accès non autorisés

### Variables d'environnement

- ✅ Clés API dans `.env` (pas dans le code)
- ✅ `.env` dans `.gitignore` (pas committé)
- ✅ Préfixe `VITE_` pour exposition contrôlée

---

## 🎨 Styling

### Tailwind CSS

**Classes principales utilisées** :
- Layouts : `flex`, `grid`, `container`
- Spacing : `p-4`, `m-2`, `space-x-4`
- Colors : `bg-blue-600`, `text-gray-700`
- Borders : `border`, `rounded-lg`
- Hover : `hover:bg-blue-700`
- Responsive : `md:grid-cols-2`, `md:w-1/2`

**Code couleur des statuts** :
- 🟢 Entretien : `bg-green-100 text-green-800`
- 🟠 En attente : `bg-orange-100 text-orange-800`
- 🔴 Refus : `bg-red-100 text-red-800`

---

## 🚀 Commandes utiles

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Preview du build
npm run preview

# Linting
npm run lint

# Créer le fichier .env
cp .env.example .env  # Mac/Linux
Copy-Item .env.example .env  # Windows PowerShell
```

---

## 📦 Dépendances

### Production
- `react` (^18.2.0) : Framework UI
- `react-dom` (^18.2.0) : Rendu React
- `react-router-dom` (^6.20.1) : Routing
- `@supabase/supabase-js` (^2.39.0) : Client Supabase

### Développement
- `vite` (^5.0.8) : Bundler rapide
- `@vitejs/plugin-react` (^4.2.1) : Plugin Vite pour React
- `tailwindcss` (^3.4.0) : Framework CSS
- `autoprefixer` (^10.4.16) : Prefixes CSS automatiques
- `postcss` (^8.4.32) : Transformation CSS
- `eslint` (^8.55.0) : Linter JavaScript

---

## ✅ Checklist de fonctionnalités

- [x] Authentification (login/register/logout)
- [x] Protection des routes
- [x] CRUD complet sur les candidatures
- [x] Tableau responsive
- [x] Code couleur selon statut
- [x] Calcul automatique date de relance
- [x] Alerte de relance (> 7 jours)
- [x] Statistiques en temps réel
- [x] Row Level Security
- [x] Design moderne avec Tailwind
- [x] Navigation fluide
- [x] Gestion des erreurs

---

**Projet complet et prêt à l'emploi ! 🎉**

