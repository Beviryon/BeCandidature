# ⚡ Guide Rapide - Activer les Emails en 10 minutes

## 📋 Checklist

- [ ] Compte Resend créé
- [ ] Clé API Resend obtenue
- [ ] Firebase CLI installé
- [ ] Functions déployées
- [ ] Test envoyé

---

## 🚀 **Commandes à exécuter (dans l'ordre)**

### 1️⃣ Créer un compte Resend

👉 **https://resend.com/signup**

- Inscrivez-vous gratuitement
- Vérifiez votre email
- **3,000 emails/mois gratuits** 🎁

---

### 2️⃣ Obtenir la clé API

1. Dans Resend, allez dans **"API Keys"**
2. Cliquez sur **"Create API Key"**
3. Nom : `BeCandidature`
4. **COPIEZ LA CLÉ** : `re_xxxxxxxxxxxxxxxxxx`

---

### 3️⃣ Installer Firebase CLI (si pas déjà fait)

```powershell
npm install -g firebase-tools
```

---

### 4️⃣ Se connecter à Firebase

```powershell
firebase login
```

Une page web s'ouvrira → Connectez-vous avec votre compte Google

---

### 5️⃣ Initialiser le projet Firebase

```powershell
firebase init
```

Sélectionnez :
- **Firestore** : Yes
- **Functions** : Yes
  - Language : **JavaScript**
  - ESLint : No
  - Install dependencies : **Yes**

---

### 6️⃣ Configurer la clé Resend

```powershell
firebase functions:config:set resend.apikey="re_VOTRE_CLE_API_ICI"
```

⚠️ Remplacez `re_VOTRE_CLE_API_ICI` par votre vraie clé !

---

### 7️⃣ Installer les dépendances

```powershell
cd functions
npm install
cd ..
```

---

### 8️⃣ Déployer les Functions

```powershell
firebase deploy --only functions
```

⏱️ Attendez 2-5 minutes...

Vous verrez :
```
✔ functions[sendWelcomeEmail]: Successful create operation.
✔ functions[sendApprovalEmail]: Successful create operation.
```

---

### 9️⃣ Publier les règles Firestore

```powershell
firebase deploy --only firestore:rules
```

---

### 🔟 TESTER ! 🎉

1. Créez un **nouveau compte** sur votre site (autre email)
2. ➡️ L'utilisateur devrait recevoir : **"Bienvenue sur BeCandidature !"**
3. Approuvez-le depuis le dashboard admin
4. ➡️ L'utilisateur devrait recevoir : **"Votre compte est activé !"**

---

## 🎯 **Commandes en un coup d'œil**

```powershell
# Installation et setup
npm install -g firebase-tools
firebase login
firebase init

# Configuration Resend
firebase functions:config:set resend.apikey="re_VOTRE_CLE"

# Installation dépendances
cd functions
npm install
cd ..

# Déploiement
firebase deploy --only functions
firebase deploy --only firestore:rules

# Vérifier logs
firebase functions:log
```

---

## 📧 **Modifier l'expéditeur**

Par défaut : `BeCandidature <noreply@becandidature.com>`

Si vous utilisez le domaine de test Resend :
```javascript
from: 'BeCandidature <onboarding@resend.dev>'
```

Si vous avez configuré votre propre domaine :
```javascript
from: 'BeCandidature <noreply@votredomaine.com>'
```

Modifiez dans `functions/index.js` lignes 20, 67, 115.

---

## 🐛 **Problèmes courants**

### "Command not found: firebase"
```powershell
npm install -g firebase-tools
```

### "Permission denied"
```powershell
firebase login --reauth
```

### "Emails not sent"
```powershell
# Vérifier les logs
firebase functions:log

# Vérifier la config
firebase functions:config:get
```

### "Error deploying functions"
```powershell
# Forcer le redéploiement
firebase deploy --only functions --force
```

---

## ✅ **C'est fait quand vous voyez :**

1. ✅ Functions déployées sur Firebase
2. ✅ Premier email de test reçu
3. ✅ Logs Firebase montrent "✅ Email envoyé"
4. ✅ Dashboard Resend montre l'email comme "Sent"

---

## 🎉 **Félicitations !**

Vous avez maintenant un **système d'approbation professionnel** avec :
- ✅ Emails automatiques
- ✅ Dashboard admin
- ✅ Gestion des statuts
- ✅ Notifications par email

**Votre application est maintenant niveau SaaS ! 🚀**

---

**Questions ? Suivez le guide détaillé dans `EMAILS_SETUP.md`**


