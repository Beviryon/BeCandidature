# ⚡ Démarrage immédiat - BeCandidature

## ❗ IMPORTANT - À faire MAINTENANT

### Étape 1 : Créer le fichier .env

1. **Créez un fichier `.env`** à la racine du projet `E:\BeCandidature\`
2. **Copiez-collez ce contenu** :

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. **Remplacez** `your_supabase_url_here` et `your_supabase_anon_key_here` par vos vraies clés Supabase

---

### Étape 2 : Obtenir vos clés Supabase

#### Si vous n'avez PAS encore de projet Supabase :

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte (gratuit)
3. Cliquez sur **"New project"**
   - Name : `BeCandidature`
   - Database Password : (générez un mot de passe fort)
   - Region : `West EU (Frankfurt)`
4. Attendez 2 minutes que le projet soit créé
5. Allez dans **SQL Editor** (menu gauche)
6. Cliquez **"+ New query"**
7. Ouvrez le fichier `supabase-setup.sql` de votre projet
8. Copiez TOUT son contenu et collez-le dans l'éditeur SQL
9. Cliquez **"RUN"**
10. Allez dans **Settings** > **API**
11. Copiez :
    - **Project URL** (exemple : `https://abcdefgh.supabase.co`)
    - **anon public** key (commence par `eyJ...`)

#### Si vous avez DÉJÀ un projet Supabase :

1. Allez sur [https://supabase.com](https://supabase.com)
2. Ouvrez votre projet `BeCandidature`
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL**
   - **anon public** key

---

### Étape 3 : Mettre à jour le fichier .env

Éditez le fichier `.env` que vous venez de créer :

**Exemple :**
```env
VITE_SUPABASE_URL=https://abcdefghijklmno.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg5MDAwMDAwLCJleHAiOjIwMDQ1NzYwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Attention** :
- Ne supprimez pas le préfixe `VITE_`
- La clé `anon` est très longue (environ 200 caractères), c'est normal
- Pas d'espaces autour du `=`
- Pas de guillemets

---

### Étape 4 : Lancer l'application

Une fois le fichier `.env` configuré :

```bash
npm run dev
```

L'application s'ouvrira sur [http://localhost:5173](http://localhost:5173)

---

## ✅ Vérification rapide

### Vous devriez voir :
- Une page de connexion/inscription avec un design bleu/violet
- Pas d'erreur dans la console (F12)

### Si vous voyez une erreur :
- **"Missing Supabase environment variables"** → Vérifiez le fichier `.env`
- **Page blanche** → Ouvrez la console (F12) et regardez l'erreur
- **"Invalid API key"** → Vérifiez que vous avez copié la bonne clé

---

## 🎯 Prochaines étapes

Une fois que l'application s'affiche :

1. **Créez un compte** :
   - Cliquez sur "S'inscrire"
   - Entrez un email (exemple : `test@example.com`)
   - Entrez un mot de passe (min. 6 caractères)

2. **Connectez-vous** avec vos identifiants

3. **Ajoutez votre première candidature** :
   - Cliquez sur "+ Nouvelle candidature"
   - Remplissez le formulaire
   - Cliquez sur "Ajouter"

---

## 📚 Besoin d'aide ?

- **Guide détaillé** : `CONFIGURATION_SUPABASE.md`
- **Guide rapide** : `GUIDE_DEMARRAGE.md`
- **Documentation complète** : `README.md`
- **Structure du projet** : `STRUCTURE_PROJET.md`

---

**C'est parti ! 🚀**

