# 🚀 Guide de démarrage rapide - BeCandidature

Ce guide vous permet de démarrer en 5 minutes chrono !

## ⚡ Installation rapide

### Étape 1 : Installer les dépendances (30 secondes)

```bash
npm install
```

### Étape 2 : Configurer Supabase (2 minutes)

1. **Créer un compte Supabase** (si pas déjà fait)
   - Allez sur [supabase.com](https://supabase.com)
   - Cliquez sur "Start your project"
   - Créez un compte gratuit

2. **Créer un nouveau projet**
   - Cliquez sur "New Project"
   - Nom du projet : `BeCandidature`
   - Mot de passe de la base : (choisissez un mot de passe fort)
   - Région : `West EU (Frankfurt)` (ou la plus proche de vous)
   - Cliquez sur "Create new project"
   - ⏳ Attendez 1-2 minutes que le projet soit prêt

3. **Créer la table candidatures**
   - Dans le menu latéral, cliquez sur **SQL Editor**
   - Cliquez sur "+ New query"
   - Copiez-collez **TOUT** le contenu du fichier `supabase-setup.sql`
   - Cliquez sur **RUN** en bas à droite
   - ✅ Vous devriez voir "Success. No rows returned"

4. **Récupérer les clés API**
   - Dans le menu latéral, cliquez sur **Settings** (icône engrenage)
   - Cliquez sur **API**
   - Copiez les deux valeurs suivantes :
     - `Project URL` (exemple : https://abcdefgh.supabase.co)
     - `anon` `public` (la clé qui commence par `eyJ...`)

### Étape 3 : Configurer les variables d'environnement (30 secondes)

1. **Créer le fichier .env**
   ```bash
   # Sur Windows (PowerShell)
   Copy-Item .env.example .env

   # Sur Mac/Linux
   cp .env.example .env
   ```

2. **Éditer le fichier .env**
   
   Ouvrez le fichier `.env` et remplacez les valeurs :

   ```env
   VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_tres_longue_qui_commence_par_eyJ
   ```

   ⚠️ **IMPORTANT** : Ne supprimez pas le préfixe `VITE_` !

### Étape 4 : Lancer l'application (10 secondes)

```bash
npm run dev
```

Ouvrez votre navigateur sur [http://localhost:5173](http://localhost:5173)

## 🎉 C'est parti !

1. **Créer un compte**
   - Cliquez sur "S'inscrire"
   - Entrez votre email et mot de passe (min. 6 caractères)
   - Cliquez sur "S'inscrire"

2. **Se connecter**
   - Utilisez vos identifiants pour vous connecter
   - Vous arrivez sur la page d'accueil

3. **Ajouter votre première candidature**
   - Cliquez sur "+ Nouvelle candidature"
   - Remplissez les champs obligatoires :
     - Entreprise (ex: Google)
     - Poste (ex: Développeur Full Stack)
     - Date de candidature (aujourd'hui par défaut)
     - Statut (En attente par défaut)
   - Ajoutez éventuellement :
     - Contact
     - Lien vers l'offre
     - Notes personnelles
   - Cliquez sur "Ajouter la candidature"

4. **Gérer vos candidatures**
   - **Modifier** : Cliquez sur "Modifier" dans le tableau
   - **Supprimer** : Cliquez sur "Supprimer" (avec confirmation)
   - **Voir les statistiques** : En bas du tableau

## 🎨 Aperçu des fonctionnalités

### Code couleur des statuts
- 🟢 **Vert** = Entretien (super !)
- 🟠 **Orange** = En attente (patience...)
- 🔴 **Rouge** = Refus (next !)

### Alerte de relance
Si une candidature "En attente" a plus de 7 jours, vous verrez :
```
⚠️ Relancer !
```

### Calcul automatique
La date de relance est calculée automatiquement : **Date de candidature + 7 jours**

## 🐛 Problèmes courants

### ❌ Erreur "Missing Supabase environment variables"

**Solution** :
1. Vérifiez que le fichier `.env` existe à la racine du projet
2. Vérifiez que les variables commencent bien par `VITE_`
3. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)

### ❌ Erreur lors de l'inscription

**Solution** :
- Vérifiez votre connexion internet
- Vérifiez que les clés API sont correctes dans `.env`
- Essayez avec un autre email

### ❌ Impossible de voir mes candidatures

**Solution** :
1. Allez dans Supabase > SQL Editor
2. Exécutez cette requête pour vérifier :
   ```sql
   SELECT * FROM candidatures;
   ```
3. Vérifiez que les politiques RLS sont créées :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'candidatures';
   ```
   Vous devriez voir 4 politiques (SELECT, INSERT, UPDATE, DELETE)

### ❌ Les styles ne s'affichent pas correctement

**Solution** :
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
npm run dev
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React](https://react.dev)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)

## 💡 Astuces

1. **Sauvegarder régulièrement** : Les données sont automatiquement sauvegardées dans Supabase
2. **Exporter vos données** : Allez dans Supabase > Table Editor > candidatures > Export
3. **Relancer régulièrement** : Consultez la colonne "Date relance" chaque semaine
4. **Prendre des notes** : Utilisez le champ "Notes" pour vos impressions après chaque candidature

## 🎯 Prochaines étapes

Une fois l'application fonctionnelle, vous pouvez :

1. **Personnaliser le design** : Modifier les couleurs dans `tailwind.config.js`
2. **Ajouter des champs** : Modifier la table dans Supabase et les composants
3. **Déployer en ligne** : Suivre le guide de déploiement dans `README.md`

---

**Besoin d'aide ?** Consultez le `README.md` complet pour plus de détails !

