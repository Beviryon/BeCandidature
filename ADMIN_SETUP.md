# 🛡️ Configuration Admin - BeCandidature

## 📋 Comment définir un utilisateur comme Admin

### Méthode 1 : Via Firebase Console (Recommandé)

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **BeCandidature**
3. Allez dans **Firestore Database**
4. Trouvez la collection `users`
5. Sélectionnez l'utilisateur que vous voulez rendre admin
6. Modifiez le document :
   ```json
   {
     "email": "becandidature@gmail.com",
     "role": "admin",        ← Changez "user" en "admin"
     "status": "active",      ← Assurez-vous que c'est "active"
     "createdAt": ...,
     "approvedAt": ...,
     "approvedBy": null
   }
   ```
7. Cliquez sur **Update**
8. L'utilisateur est maintenant admin !

---

### Méthode 2 : Via code (Pour le premier admin)

Si c'est la **première fois** et qu'aucun admin n'existe :

1. **Inscrivez-vous normalement** via l'interface
2. **Connectez-vous à Firebase Console**
3. Allez dans **Firestore** → Collection `users`
4. Trouvez votre compte fraîchement créé
5. Modifiez :
   - `status`: `"pending"` → `"active"`
   - `role`: `"user"` → `"admin"`

---

## 🎯 Fonctionnalités Admin

Une fois connecté en tant qu'admin, vous avez accès à :

### **Dashboard Admin** (`/admin`)
- 📊 Vue d'ensemble des utilisateurs
- ⏳ Liste des inscriptions en attente
- ✅ Approuver/Rejeter des comptes
- 🔒 Suspendre/Réactiver des comptes
- 📈 Statistiques en temps réel

### **Actions disponibles**
- ✅ **Approuver** : Activer un compte en attente
- ❌ **Rejeter** : Refuser définitivement un compte
- ⏸️ **Suspendre** : Bloquer temporairement (avec raison)
- ▶️ **Réactiver** : Débloquer un compte suspendu

---

## 🔐 Sécurité

### Statuts utilisateurs
- `pending` : En attente d'approbation (ne peut pas se connecter)
- `active` : Compte actif et opérationnel
- `suspended` : Compte suspendu temporairement
- `rejected` : Compte rejeté définitivement

### Rôles
- `user` : Utilisateur normal
- `admin` : Administrateur (accès au dashboard admin)

---

## 📧 Emails automatiques (À venir)

Pour l'instant, **les emails ne sont PAS envoyés automatiquement**.

Pour activer l'envoi d'emails :
1. Installer un service email (Resend, SendGrid, etc.)
2. Créer des Firebase Functions
3. Configurer les templates d'emails

**Guide complet dans `EMAILS_SETUP.md`** (à venir)

---

## 🐛 Dépannage

### "Je ne vois pas le lien Admin"
→ Vérifiez que votre `role` est bien `"admin"` dans Firestore

### "Je suis bloqué en 'Pending'"
→ Connectez-vous à Firebase Console et changez `status` en `"active"`

### "Les utilisateurs ne voient pas leur statut changer"
→ Demandez-leur de se déconnecter/reconnecter

---

## 📝 Structure Firestore

```
users (collection)
  └─ {userId} (document)
      ├─ email: string
      ├─ role: "user" | "admin"
      ├─ status: "pending" | "active" | "suspended" | "rejected"
      ├─ createdAt: timestamp
      ├─ approvedAt: timestamp | null
      ├─ approvedBy: string | null
      ├─ suspendedAt: timestamp | null
      └─ suspendedReason: string | null
```

---

## 🚀 Prochaines étapes

- [ ] Ajouter l'envoi d'emails automatiques
- [ ] Logs d'audit (historique des actions admin)
- [ ] Dashboard analytics avancé
- [ ] Export de données utilisateurs

---

**Besoin d'aide ? Contact : becandidature@gmail.com**


