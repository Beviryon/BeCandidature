# 🔥 Configuration Firebase - Guide Complet

## 📋 Étape 1 : Créer un projet Firebase

1. **Allez sur** [https://console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez sur **"Ajouter un projet"** ou **"Add project"**
3. **Nom du projet** : `BeCandidature` (ou le nom de votre choix)
4. **Google Analytics** : Vous pouvez désactiver (optionnel pour ce projet)
5. Cliquez sur **"Créer le projet"**
6. Attendez 30 secondes que le projet soit créé

---

## 📋 Étape 2 : Configurer l'application Web

1. Dans la console Firebase, cliquez sur l'icône **Web** (`</>`)
2. **Nom de l'application** : `BeCandidature Web`
3. **Firebase Hosting** : Décochez (pas nécessaire pour l'instant)
4. Cliquez sur **"Enregistrer l'application"**

5. **Copiez les valeurs de configuration** qui s'affichent :

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 📋 Étape 3 : Activer l'authentification

1. Dans le menu gauche, cliquez sur **"Authentication"**
2. Cliquez sur **"Get started"**
3. Onglet **"Sign-in method"**
4. Activez **"Email/Password"** :
   - Cliquez sur "Email/Password"
   - Activez le toggle
   - Cliquez sur "Save"

---

## 📋 Étape 4 : Créer la base de données Firestore

1. Dans le menu gauche, cliquez sur **"Firestore Database"**
2. Cliquez sur **"Create database"**
3. **Mode de démarrage** : Sélectionnez **"Start in production mode"**
4. **Emplacement** : Choisissez **"europe-west"** (ou le plus proche de vous)
5. Cliquez sur **"Enable"**

---

## 📋 Étape 5 : Configurer les règles de sécurité

1. Dans Firestore Database, cliquez sur l'onglet **"Rules"**
2. Remplacez les règles par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règle pour la collection candidatures
    match /candidatures/{candidatureId} {
      // L'utilisateur peut lire, créer, modifier et supprimer uniquement ses propres candidatures
      allow read, write, update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      // Permettre la création si l'userId correspond à l'utilisateur authentifié
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Cliquez sur **"Publish"**

---

## 📋 Étape 6 : Configurer votre application

1. **Créez le fichier `.env`** à la racine du projet :

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

2. **Ouvrez le fichier `.env`** et remplacez les valeurs par celles de votre projet Firebase :

```env
VITE_FIREBASE_API_KEY=AIza...votre_cle
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 📋 Étape 7 : Désactiver le mode DÉMO

1. Ouvrez le fichier `src/demoData.js`
2. Changez `export const DEMO_MODE = true` en :

```javascript
export const DEMO_MODE = false
```

---

## 📋 Étape 8 : Tester l'application

1. **Redémarrez le serveur** si nécessaire :
   ```bash
   npm run dev
   ```

2. Ouvrez [http://localhost:5173](http://localhost:5173)

3. **Créez un compte** :
   - Cliquez sur "S'inscrire"
   - Entrez votre email et mot de passe
   - Cliquez sur "S'inscrire"

4. **Connectez-vous** avec vos identifiants

5. **Ajoutez une candidature** pour tester

---

## ✅ Vérification dans Firebase

1. **Vérifier l'authentification** :
   - Allez dans Firebase Console > Authentication > Users
   - Vous devriez voir votre compte créé

2. **Vérifier les données** :
   - Allez dans Firebase Console > Firestore Database
   - Vous devriez voir la collection `candidatures`
   - Cliquez dessus pour voir vos candidatures

---

## 🎉 C'est terminé !

Votre application est maintenant connectée à Firebase avec :
- ✅ Authentification par email/mot de passe
- ✅ Base de données Firestore sécurisée
- ✅ Règles de sécurité configurées
- ✅ Toutes les fonctionnalités opérationnelles

---

## 💡 Limites du plan gratuit Firebase (Spark)

- **Authentification** : Illimité
- **Firestore** :
  - 1 GB de stockage
  - 10 GB/mois de transfert sortant
  - 50,000 lectures/jour
  - 20,000 écritures/jour
  - 20,000 suppressions/jour

**C'est largement suffisant pour votre usage !** 🚀

---

## 🐛 Dépannage

### Erreur "Missing Firebase config"
- Vérifiez que le fichier `.env` existe
- Vérifiez que toutes les variables commencent par `VITE_`
- Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)

### Erreur d'authentification
- Vérifiez que Email/Password est activé dans Firebase Console > Authentication
- Vérifiez les règles Firestore

### Les données ne s'enregistrent pas
- Vérifiez les règles Firestore
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que vous êtes bien connecté

---

**Besoin d'aide ?** Consultez la [documentation Firebase](https://firebase.google.com/docs)

