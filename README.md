# BeCandidature - Application de suivi des candidatures d'alternance

Application React complète avec Firebase pour gérer et suivre vos candidatures d'alternance.

## 🚀 Fonctionnalités

- ✅ **Authentification complète** avec Supabase (email + mot de passe)
- ✅ **CRUD complet** pour gérer vos candidatures
- ✅ **Tableau responsive** avec code couleur selon le statut :
  - 🟢 Vert : Entretien
  - 🟠 Orange : En attente
  - 🔴 Rouge : Refus
- ✅ **Calcul automatique** de la date de relance (+7 jours)
- ✅ **Alerte automatique** pour relancer après 7 jours
- ✅ **Statistiques** en temps réel
- ✅ **Design moderne** avec TailwindCSS

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd BeCandidature
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### A. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Créez un nouveau projet
3. Attendez que le projet soit initialisé (1-2 minutes)

#### B. Créer la table dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez et exécutez le script SQL suivant :

```sql
-- Créer la table candidatures
CREATE TABLE candidatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entreprise TEXT NOT NULL,
  poste TEXT NOT NULL,
  date_candidature DATE NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('En attente', 'Entretien', 'Refus')),
  date_relance DATE,
  contact TEXT,
  lien TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Activer RLS (Row Level Security)
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres candidatures
CREATE POLICY "Users can view their own candidatures"
  ON candidatures FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres candidatures
CREATE POLICY "Users can create their own candidatures"
  ON candidatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leurs propres candidatures
CREATE POLICY "Users can update their own candidatures"
  ON candidatures FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres candidatures
CREATE POLICY "Users can delete their own candidatures"
  ON candidatures FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_candidatures_updated_at
  BEFORE UPDATE ON candidatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### C. Récupérer les clés API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez :
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)

#### D. Configurer les variables d'environnement

1. Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

2. Éditez le fichier `.env` et remplacez les valeurs :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173)

## 📁 Structure du projet

```
BeCandidature/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # Layout principal (header, footer, navigation)
│   │   ├── Login.jsx               # Page de connexion
│   │   ├── Register.jsx            # Page d'inscription
│   │   ├── ListeCandidatures.jsx   # Affichage du tableau des candidatures
│   │   ├── AjouterCandidature.jsx  # Formulaire d'ajout
│   │   └── ModifierCandidature.jsx # Formulaire de modification
│   ├── App.jsx                     # Composant principal avec routes
│   ├── supabaseClient.js           # Configuration Supabase
│   ├── main.jsx                    # Point d'entrée React
│   └── index.css                   # Styles globaux (Tailwind)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 💾 Structure de la base de données

### Table `candidatures`

| Colonne           | Type      | Description                                    |
|-------------------|-----------|------------------------------------------------|
| id                | UUID      | Identifiant unique (généré automatiquement)    |
| user_id           | UUID      | Référence à l'utilisateur (auth.users)         |
| entreprise        | TEXT      | Nom de l'entreprise                            |
| poste             | TEXT      | Intitulé du poste                              |
| date_candidature  | DATE      | Date d'envoi de la candidature                 |
| statut            | TEXT      | Statut : "En attente", "Entretien", "Refus"    |
| date_relance      | DATE      | Date calculée automatiquement (+7 jours)       |
| contact           | TEXT      | Informations de contact (optionnel)            |
| lien              | TEXT      | URL de l'offre (optionnel)                     |
| notes             | TEXT      | Notes personnelles (optionnel)                 |
| created_at        | TIMESTAMP | Date de création                               |
| updated_at        | TIMESTAMP | Date de dernière modification                  |

## 🎨 Fonctionnalités détaillées

### Authentification
- Inscription avec email et mot de passe
- Connexion sécurisée
- Déconnexion
- Protection des routes (redirection automatique)

### Gestion des candidatures
- **Créer** : Formulaire complet avec tous les champs
- **Lire** : Tableau responsive avec filtres visuels
- **Modifier** : Édition complète de chaque candidature
- **Supprimer** : Suppression avec confirmation

### Fonctionnalités avancées
- **Calcul automatique** de la date de relance (+7 jours)
- **Alerte visuelle** "⚠️ Relancer !" si plus de 7 jours
- **Code couleur** selon le statut (vert/orange/rouge)
- **Statistiques** : Total, Entretiens, En attente, Refus
- **Liens cliquables** vers les offres d'emploi
- **Notes personnalisées** pour chaque candidature

## 🔒 Sécurité

- Row Level Security (RLS) activée sur Supabase
- Chaque utilisateur ne peut voir que ses propres candidatures
- Authentification sécurisée avec tokens JWT
- Variables d'environnement pour les clés API

## 🚀 Déploiement

### Netlify / Vercel

1. Créez un compte sur [Netlify](https://netlify.com) ou [Vercel](https://vercel.com)
2. Connectez votre repository Git
3. Configurez les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command : `npm run build`
5. Publish directory : `dist`

## 🛠️ Scripts disponibles

```bash
npm run dev      # Lancer en mode développement
npm run build    # Construire pour la production
npm run preview  # Prévisualiser le build de production
npm run lint     # Vérifier le code avec ESLint
```

## 📝 Notes

- La date de relance est **calculée automatiquement** (+7 jours après la date de candidature)
- Une alerte apparaît automatiquement si une candidature "En attente" a plus de 7 jours
- Le design est **entièrement responsive** (mobile, tablette, desktop)
- Les données sont **sécurisées** avec Row Level Security de Supabase

## 🐛 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifiez que le fichier `.env` existe à la racine du projet
- Vérifiez que les variables commencent bien par `VITE_`
- Redémarrez le serveur de développement après modification du `.env`

### Erreur lors de l'insertion de données
- Vérifiez que les politiques RLS sont bien créées dans Supabase
- Vérifiez que l'utilisateur est bien connecté

### Les styles ne s'affichent pas
- Vérifiez que TailwindCSS est bien configuré
- Exécutez `npm install` pour installer toutes les dépendances

## 📄 Licence

MIT

## 👨‍💻 Auteur

Développé avec ❤️ pour faciliter la recherche d'alternance

---

**Bon courage pour vos candidatures ! 🚀**

