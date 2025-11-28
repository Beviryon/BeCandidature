# 📧 Configuration des Emails Automatiques - BeCandidature

## 🎯 Vue d'ensemble

Le système envoie automatiquement 3 types d'emails :

1. **📨 Inscription** : "Bienvenue, votre compte est en attente"
2. **✅ Approbation** : "Votre compte est activé !"
3. **⚠️ Suspension** : "Votre compte a été suspendu"

---

## 📋 **Prérequis**

- [ ] Firebase CLI installé
- [ ] Compte Resend créé (gratuit)
- [ ] Firebase Functions activé

---

## 🚀 **Étape 1 : Créer un compte Resend**

### 1.1 Inscription

1. Allez sur **https://resend.com**
2. Cliquez sur **"Sign Up"**
3. Inscrivez-vous avec votre email
4. Vérifiez votre email

### 1.2 Obtenir la clé API

1. Une fois connecté, allez dans **"API Keys"**
2. Cliquez sur **"Create API Key"**
3. Nom : `BeCandidature`
4. Permission : **"Full access"**
5. Cliquez sur **"Add"**
6. **COPIEZ LA CLÉ** (format: `re_xxxxxxxxxxxxxxxxxx`)
   ⚠️ Vous ne pourrez plus la voir après !

### 1.3 Configurer le domaine (Optionnel mais recommandé)

**Option A : Utiliser le domaine de test Resend**
- Par défaut, Resend vous donne `onboarding@resend.dev`
- Limité à 100 emails
- **Pour tester, c'est suffisant !**

**Option B : Configurer votre propre domaine**
1. Allez dans **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `becandidature.com`)
4. Ajoutez les enregistrements DNS fournis
5. Attendez la validation (quelques minutes)

---

## 🔧 **Étape 2 : Installer Firebase CLI**

### 2.1 Installer Firebase Tools

```bash
npm install -g firebase-tools
```

### 2.2 Se connecter à Firebase

```bash
firebase login
```

### 2.3 Initialiser Firebase Functions

```bash
# Dans le dossier racine du projet
firebase init functions
```

Répondez :
- **Language** : JavaScript
- **ESLint** : No (optionnel)
- **Install dependencies** : Yes

---

## ⚙️ **Étape 3 : Configurer la clé API Resend**

### 3.1 Définir la clé API dans Firebase

```bash
firebase functions:config:set resend.apikey="re_VOTRE_CLE_API_ICI"
```

Remplacez `re_VOTRE_CLE_API_ICI` par votre vraie clé Resend.

### 3.2 Vérifier la configuration

```bash
firebase functions:config:get
```

Vous devriez voir :
```json
{
  "resend": {
    "apikey": "re_xxxxxxxxx"
  }
}
```

---

## 📦 **Étape 4 : Installer les dépendances**

```bash
cd functions
npm install
cd ..
```

---

## 🚀 **Étape 5 : Déployer les Functions**

### 5.1 Mettre à jour Firebase (si nécessaire)

```bash
firebase deploy --only functions
```

### 5.2 Attendre le déploiement

Cela peut prendre 2-5 minutes.

Vous verrez :
```
✔ functions[sendWelcomeEmail]: Successful create operation.
✔ functions[sendApprovalEmail]: Successful create operation.
```

---

## ✅ **Étape 6 : Tester**

### Test 1 : Email d'inscription

1. Allez sur votre site
2. Créez un NOUVEAU compte (autre email)
3. ➡️ L'utilisateur devrait recevoir : **"Bienvenue sur BeCandidature !"**

### Test 2 : Email d'approbation

1. Connectez-vous en admin
2. Allez sur `/admin`
3. Approuvez le compte créé
4. ➡️ L'utilisateur devrait recevoir : **"Votre compte est activé !"**

### Test 3 : Email de suspension

1. Dans le dashboard admin
2. Suspendez un compte actif
3. ➡️ L'utilisateur devrait recevoir : **"Votre compte a été suspendu"**

---

## 📊 **Étape 7 : Vérifier les logs**

### Logs Firebase Functions

```bash
firebase functions:log
```

### Logs Resend

1. Allez sur **https://resend.com/emails**
2. Vous verrez tous les emails envoyés
3. Statut : **Sent** ✅ ou **Failed** ❌

---

## 🎨 **Personnalisation des emails**

### Modifier l'expéditeur

Dans `functions/index.js`, ligne ~20, 67, 115 :

```javascript
from: 'BeCandidature <noreply@votredomaine.com>'
```

### Modifier les templates

Les templates HTML sont dans `functions/index.js` :
- Email de bienvenue : ligne ~24
- Email d'approbation : ligne ~71
- Email de suspension : ligne ~119

---

## 💰 **Limites gratuites Resend**

- **3,000 emails/mois** gratuits
- **100 emails/jour** avec le domaine de test
- **Illimité** avec votre propre domaine

Si vous dépassez :
- **1,000 emails supplémentaires = $1**
- Très abordable ! 💵

---

## 🐛 **Dépannage**

### "Emails non reçus"

1. **Vérifiez les logs Firebase**
   ```bash
   firebase functions:log
   ```

2. **Vérifiez les spams**
   Les emails peuvent arriver dans les spams

3. **Vérifiez Resend Dashboard**
   Allez sur https://resend.com/emails

### "Error: Unauthorized"

➡️ Votre clé API Resend est incorrecte
```bash
firebase functions:config:set resend.apikey="NOUVELLE_CLE"
firebase deploy --only functions
```

### "Functions not deployed"

➡️ Réessayez le déploiement
```bash
firebase deploy --only functions --force
```

---

## 📝 **Résumé des commandes**

```bash
# 1. Installer Firebase CLI
npm install -g firebase-tools

# 2. Se connecter
firebase login

# 3. Initialiser
firebase init functions

# 4. Configurer Resend
firebase functions:config:set resend.apikey="re_VOTRE_CLE"

# 5. Installer dépendances
cd functions && npm install && cd ..

# 6. Déployer
firebase deploy --only functions

# 7. Vérifier logs
firebase functions:log
```

---

## 🎯 **Prochaines étapes**

Une fois les emails configurés, vous aurez un système complet :

- ✅ Inscription automatique
- ✅ Email de bienvenue
- ✅ Approbation admin
- ✅ Email d'activation
- ✅ Suspension avec notification

**Votre système d'approbation est maintenant PROFESSIONNEL ! 🚀**

---

**Besoin d'aide ? Contact : support@becandidature.com**


