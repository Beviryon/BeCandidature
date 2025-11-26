# 🚀 Déploiement sur Vercel - Guide Complet

Guide étape par étape pour déployer BeCandidature sur Vercel (gratuit et rapide !).

---

## 📋 **Étape 1 : Préparer votre projet**

### 1.1 Vérifier que tout fonctionne localement

Assurez-vous que votre application fonctionne sans erreur :

```bash
npm run build
```

Si le build réussit, vous êtes prêt ! ✅

---

## 📋 **Étape 2 : Initialiser Git (si pas déjà fait)**

### 2.1 Vérifier si Git est initialisé

```bash
git status
```

### 2.2 Si Git n'est pas initialisé :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - BeCandidature app"
```

### 2.3 (Optionnel) Créer un repo GitHub

1. Allez sur [github.com](https://github.com) et créez un nouveau repository
2. Nommez-le : `BeCandidature`
3. Laissez-le **public** ou **privé** selon votre préférence
4. **Ne cochez rien** (pas de README, pas de .gitignore)
5. Cliquez sur **"Create repository"**

6. Connectez votre projet local au repo :

```bash
git remote add origin https://github.com/votre-username/BeCandidature.git
git branch -M main
git push -u origin main
```

---

## 📋 **Étape 3 : Déployer sur Vercel**

### 3.1 Créer un compte Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec **GitHub** (recommandé) ou email

### 3.2 Importer votre projet

**Option A : Depuis GitHub** (recommandé si vous avez push)
1. Dans Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez **"Import Git Repository"**
3. Autorisez Vercel à accéder à vos repos GitHub
4. Sélectionnez **"BeCandidature"**
5. Cliquez sur **"Import"**

**Option B : Sans GitHub** (upload direct)
1. Dans Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Cliquez sur **"Browse"** ou glissez votre dossier
3. Sélectionnez le dossier `E:\BeCandidature`

### 3.3 Configurer le projet

Sur la page de configuration :

**Framework Preset :** Vite (détecté automatiquement ✅)

**Build Settings :**
- Build Command: `npm run build` ✅
- Output Directory: `dist` ✅
- Install Command: `npm install` ✅

**Root Directory :** `.` (racine) ✅

---

## 📋 **Étape 4 : Configurer les variables d'environnement**

**IMPORTANT** : Avant de déployer, configurez vos variables Firebase !

### 4.1 Dans Vercel, section "Environment Variables"

Ajoutez ces 6 variables **une par une** :

```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyDfG5NVpCqy4_SuFTpsRQfM7PxVJX0sXJ4
```

```
Name: VITE_FIREBASE_AUTH_DOMAIN
Value: bevfollow.firebaseapp.com
```

```
Name: VITE_FIREBASE_PROJECT_ID
Value: bevfollow
```

```
Name: VITE_FIREBASE_STORAGE_BUCKET
Value: bevfollow.firebasestorage.app
```

```
Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 526577060698
```

```
Name: VITE_FIREBASE_APP_ID
Value: 1:526577060698:web:700e7411ed383fe5fb0163
```

**Pour chaque variable :**
- Cliquez sur **"Add"** ou **"Add Another"**
- Entrez le **Name** (exactement comme écrit)
- Entrez la **Value**
- Cochez **"Production"**, **"Preview"**, et **"Development"**

---

## 📋 **Étape 5 : Déployer !**

1. Une fois les variables configurées, cliquez sur **"Deploy"**
2. Attendez 1-2 minutes que Vercel construise et déploie
3. Vous verrez une animation de build en temps réel

### Quand le déploiement est terminé :

🎉 **Vous verrez un écran de succès avec confettis !**

Vous obtiendrez une URL du type :
```
https://be-candidature.vercel.app
```

ou

```
https://be-candidature-votre-username.vercel.app
```

---

## 📋 **Étape 6 : Configurer Firebase pour Vercel**

### 6.1 Ajouter le domaine Vercel à Firebase

1. Allez dans [Firebase Console](https://console.firebase.google.com/project/bevfollow)
2. **Authentication** → **Settings** → **Authorized domains**
3. Cliquez sur **"Add domain"**
4. Ajoutez votre domaine Vercel :
   ```
   be-candidature-votre-username.vercel.app
   ```
5. Cliquez sur **"Add"**

### 6.2 Mettre à jour l'Auth Domain (optionnel mais recommandé)

Dans votre `.env` et dans Vercel, vous pouvez aussi mettre à jour :
```
VITE_FIREBASE_AUTH_DOMAIN=be-candidature-votre-username.vercel.app
```

---

## 📋 **Étape 7 : Tester votre application en ligne**

1. Ouvrez l'URL Vercel dans votre navigateur
2. Créez un compte ou connectez-vous
3. Testez toutes les fonctionnalités

**Tout devrait fonctionner parfaitement !** 🎉

---

## 🔄 **Déploiements futurs**

### Si vous avez connecté GitHub :

Chaque fois que vous faites un `git push`, Vercel **redéploie automatiquement** ! 🚀

```bash
git add .
git commit -m "Amélioration de l'interface"
git push
```

### Si vous déployez manuellement :

Dans Vercel Dashboard :
1. Allez sur votre projet
2. Cliquez sur **"Deployments"**
3. Cliquez sur **"Redeploy"**

---

## 🎨 **Personnaliser votre domaine (optionnel)**

### Domaine personnalisé gratuit :

Vercel vous permet d'avoir un meilleur nom :

1. Dans votre projet Vercel, allez dans **"Settings"** → **"Domains"**
2. Ajoutez un domaine personnalisé :
   ```
   becandidature.vercel.app
   ```
   (si disponible)

### Votre propre domaine :

Si vous avez un domaine (ex: `moncv.com`) :
1. Ajoutez-le dans Vercel
2. Configurez les DNS chez votre registrar
3. Certificat SSL automatique !

---

## 📊 **Avantages de Vercel**

- ✅ **Gratuit** : Bande passante illimitée
- ✅ **Rapide** : CDN global
- ✅ **HTTPS** : Certificat SSL automatique
- ✅ **CI/CD** : Déploiement automatique avec Git
- ✅ **Preview** : Aperçu pour chaque commit
- ✅ **Analytics** : Statistiques de visites

---

## 🐛 **Dépannage**

### Le build échoue

**Erreur commune :** "Module not found"
- Vérifiez que toutes les dépendances sont dans `package.json`
- Relancez : `npm install` localement

### L'application ne démarre pas

1. Vérifiez les variables d'environnement dans Vercel
2. Vérifiez que toutes commencent par `VITE_`
3. Redéployez le projet

### Firebase ne se connecte pas

1. Vérifiez que le domaine Vercel est ajouté dans Firebase Auth
2. Vérifiez les variables d'environnement

### Erreur 404 sur les routes

C'est normal ! Le fichier `vercel.json` gère les redirections SPA.
Si le problème persiste, vérifiez que `vercel.json` est bien à la racine.

---

## 📱 **Partager votre application**

Une fois déployée, vous pouvez partager l'URL avec :
- 👨‍💼 Votre conseiller en alternance
- 👥 Vos amis cherchant aussi une alternance
- 💼 Des recruteurs (pour montrer votre sérieux !)

---

## 🎯 **Checklist de déploiement**

- [ ] `npm run build` fonctionne localement
- [ ] Git est initialisé
- [ ] (Optionnel) Repo GitHub créé
- [ ] Compte Vercel créé
- [ ] Projet importé dans Vercel
- [ ] 6 variables d'environnement configurées
- [ ] Déploiement lancé
- [ ] Domaine Vercel ajouté à Firebase Auth
- [ ] Application testée en ligne

---

**Suivez ce guide et votre application sera en ligne en 10 minutes ! 🚀**

