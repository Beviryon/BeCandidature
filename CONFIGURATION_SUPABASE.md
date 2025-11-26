# 🔧 Configuration détaillée de Supabase

Guide complet pour configurer Supabase pour l'application BeCandidature.

## 📋 Table des matières

1. [Création du projet Supabase](#1-création-du-projet-supabase)
2. [Configuration de la base de données](#2-configuration-de-la-base-de-données)
3. [Configuration de l'authentification](#3-configuration-de-lauthentification)
4. [Récupération des clés API](#4-récupération-des-clés-api)
5. [Test de la configuration](#5-test-de-la-configuration)

---

## 1. Création du projet Supabase

### Étape 1.1 : Créer un compte

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Inscrivez-vous avec :
   - Email + mot de passe, OU
   - GitHub, OU
   - Google

### Étape 1.2 : Créer un nouveau projet

1. Une fois connecté, cliquez sur **"New project"**
2. Remplissez les informations :
   - **Name** : `BeCandidature` (ou le nom de votre choix)
   - **Database Password** : Générez un mot de passe fort (sauvegardez-le !)
   - **Region** : Choisissez la région la plus proche :
     - 🇫🇷 Europe : `West EU (Frankfurt)` ou `West EU (London)`
     - 🇺🇸 USA : `East US (North Virginia)`
     - 🇸🇬 Asie : `Southeast Asia (Singapore)`
   - **Pricing Plan** : Sélectionnez **Free** (gratuit)

3. Cliquez sur **"Create new project"**

4. ⏳ **Attendez 1-2 minutes** que le projet s'initialise
   - Vous verrez un indicateur de progression
   - Ne fermez pas la page pendant ce temps

---

## 2. Configuration de la base de données

### Étape 2.1 : Accéder au SQL Editor

1. Dans le menu latéral gauche, cliquez sur l'icône **SQL Editor** (icône de base de données avec `<>`)
2. Cliquez sur **"+ New query"** en haut à droite

### Étape 2.2 : Exécuter le script SQL

1. **Ouvrez le fichier** `supabase-setup.sql` de votre projet
2. **Copiez TOUT le contenu** du fichier (Ctrl+A, Ctrl+C)
3. **Collez** dans l'éditeur SQL de Supabase (Ctrl+V)
4. Cliquez sur **"RUN"** en bas à droite (ou appuyez sur Ctrl+Enter)

### Étape 2.3 : Vérifier l'exécution

Vous devriez voir en bas :
```
Success. No rows returned
```

✅ Si vous voyez ça, c'est parfait !

❌ Si vous voyez une erreur, vérifiez :
- Que vous avez bien copié TOUT le script
- Qu'il n'y a pas d'erreurs de syntaxe

### Étape 2.4 : Vérifier la table créée

1. Dans le menu latéral, cliquez sur **Table Editor** (icône de tableau)
2. Vous devriez voir une table **`candidatures`**
3. Cliquez dessus pour voir sa structure

Vous devriez voir ces colonnes :
- `id` (UUID)
- `user_id` (UUID)
- `entreprise` (TEXT)
- `poste` (TEXT)
- `date_candidature` (DATE)
- `statut` (TEXT)
- `date_relance` (DATE)
- `contact` (TEXT)
- `lien` (TEXT)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 3. Configuration de l'authentification

### Étape 3.1 : Accéder aux paramètres d'authentification

1. Dans le menu latéral, cliquez sur **Authentication** (icône de cadenas)
2. Cliquez sur **Providers**

### Étape 3.2 : Configurer Email Auth (déjà activé par défaut)

1. Vérifiez que **Email** est activé (toggle vert)
2. Vous pouvez personnaliser les options si besoin :
   - **Confirm email** : Activé par défaut (recommandé)
   - **Secure email change** : Activé par défaut (recommandé)

### Étape 3.3 : (Optionnel) Désactiver la confirmation d'email pour le développement

⚠️ **Pour le développement seulement** (ne faites pas ça en production !)

1. Allez dans **Authentication** > **Settings**
2. Cherchez **Email Auth**
3. Désactivez **"Enable email confirmations"**
4. Cliquez sur **Save**

Cela vous permet de tester sans avoir à confirmer l'email à chaque inscription.

---

## 4. Récupération des clés API

### Étape 4.1 : Accéder aux paramètres API

1. Dans le menu latéral, cliquez sur **Settings** (icône d'engrenage)
2. Cliquez sur **API**

### Étape 4.2 : Copier les clés

Vous verrez plusieurs sections :

#### Project URL
```
https://abcdefghijklmno.supabase.co
```
📋 **Copiez cette URL** → C'est votre `VITE_SUPABASE_URL`

#### Project API keys

Vous verrez deux clés :

1. **`anon` `public`** (clé publique)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```
   📋 **Copiez cette clé** → C'est votre `VITE_SUPABASE_ANON_KEY`

2. **`service_role` `secret`** (clé secrète)
   ⚠️ **NE PAS UTILISER** dans le frontend !

### Étape 4.3 : Créer le fichier .env

1. À la racine de votre projet, créez un fichier `.env`
2. Ajoutez ces deux lignes :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre_cle_complete...
```

3. **Remplacez** les valeurs par celles que vous avez copiées

⚠️ **IMPORTANT** :
- Ne supprimez pas le préfixe `VITE_`
- Ne mettez pas d'espaces autour du `=`
- Ne mettez pas de guillemets
- La clé anon est très longue (environ 200 caractères), c'est normal !

---

## 5. Test de la configuration

### Étape 5.1 : Tester la connexion

1. Ouvrez un terminal dans votre projet
2. Lancez l'application :
   ```bash
   npm run dev
   ```
3. Ouvrez [http://localhost:5173](http://localhost:5173)

### Étape 5.2 : Créer un compte de test

1. Cliquez sur **"S'inscrire"**
2. Entrez un email de test : `test@example.com`
3. Entrez un mot de passe : `password123`
4. Cliquez sur **"S'inscrire"**

✅ **Si ça fonctionne** : Vous êtes redirigé vers la page de connexion

❌ **Si ça ne fonctionne pas** :
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs
- Vérifiez que les clés dans `.env` sont correctes
- Redémarrez le serveur de dev

### Étape 5.3 : Se connecter

1. Utilisez les identifiants que vous venez de créer
2. Vous devriez arriver sur la page d'accueil (vide pour l'instant)

### Étape 5.4 : Ajouter une candidature de test

1. Cliquez sur **"+ Nouvelle candidature"**
2. Remplissez le formulaire :
   - Entreprise : `Google`
   - Poste : `Développeur React`
   - Date : Aujourd'hui
   - Statut : `Entretien`
3. Cliquez sur **"Ajouter la candidature"**

✅ **Si ça fonctionne** : Vous êtes redirigé vers la liste et vous voyez votre candidature

❌ **Si ça ne fonctionne pas** :
- Vérifiez que les politiques RLS sont créées (voir ci-dessous)

### Étape 5.5 : Vérifier dans Supabase

1. Retournez sur Supabase
2. Allez dans **Table Editor** > **candidatures**
3. Vous devriez voir votre candidature test

---

## 🐛 Dépannage

### Erreur : "Missing Supabase environment variables"

**Cause** : Le fichier `.env` n'est pas trouvé ou les variables ne sont pas correctes

**Solution** :
1. Vérifiez que le fichier `.env` est bien à la **racine** du projet (pas dans `src/`)
2. Vérifiez que les variables commencent par `VITE_`
3. Redémarrez le serveur de dev

### Erreur : "Invalid API key"

**Cause** : La clé API est incorrecte ou mal copiée

**Solution** :
1. Retournez dans Supabase > Settings > API
2. Re-copiez la clé `anon` `public` (en entier !)
3. Remplacez dans `.env`
4. Redémarrez le serveur

### Erreur : "new row violates row-level security policy"

**Cause** : Les politiques RLS ne sont pas créées correctement

**Solution** :
1. Allez dans Supabase > SQL Editor
2. Exécutez cette requête pour vérifier :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'candidatures';
   ```
3. Vous devriez voir **4 politiques**
4. Si ce n'est pas le cas, ré-exécutez le script `supabase-setup.sql`

### Erreur : "Failed to fetch"

**Cause** : Problème de connexion réseau ou URL incorrecte

**Solution** :
1. Vérifiez votre connexion internet
2. Vérifiez que l'URL dans `.env` est correcte (sans `/` à la fin)
3. Vérifiez que le projet Supabase n'est pas en pause (plan gratuit)

---

## ✅ Checklist finale

Avant de commencer à développer, vérifiez que :

- [ ] Le projet Supabase est créé et actif
- [ ] La table `candidatures` existe avec toutes les colonnes
- [ ] Les 4 politiques RLS sont créées (SELECT, INSERT, UPDATE, DELETE)
- [ ] Le fichier `.env` existe à la racine du projet
- [ ] Les deux variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont renseignées
- [ ] L'application se lance sans erreur (`npm run dev`)
- [ ] Vous pouvez créer un compte et vous connecter
- [ ] Vous pouvez ajouter une candidature test

---

## 📚 Ressources supplémentaires

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Supabase Database](https://supabase.com/docs/guides/database)
- [Documentation Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Tout est prêt ! Vous pouvez maintenant utiliser l'application ! 🎉**

