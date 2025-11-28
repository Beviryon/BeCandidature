# Guide EmailJS - BeCandidate

## 📧 Configuration EmailJS

### Informations de configuration
- **Service ID**: `service_tbbakdr`
- **Public Key**: `k1y1LDW1JZtKa6Flk`
- **Template Bienvenue**: `template_3ze3d9v`
- **Template Approbation**: `template_zztznym`

## 🚀 Fonctionnalités implémentées

### 1. Email de Bienvenue
**Quand**: Envoyé automatiquement lors de l'inscription d'un nouvel utilisateur
**Fichier**: `src/components/Register.jsx`
**Fonction**: `sendWelcomeEmail()`

**Contenu de l'email**:
- Confirmation d'inscription
- Information sur l'approbation en attente
- Email envoyé à l'adresse inscrite

### 2. Email d'Approbation
**Quand**: Envoyé quand l'admin approuve un compte
**Fichier**: `src/components/AdminDashboard.jsx`
**Fonction**: `sendApprovalEmail()`

**Contenu de l'email**:
- Notification d'approbation
- Lien vers l'application
- Invitation à se connecter

## 📝 Variables utilisées dans les templates

### Template Bienvenue
```
{{user_name}} - Nom de l'utilisateur (extrait de l'email)
{{user_email}} - Email de l'utilisateur
{{to_email}} - Destinataire de l'email
```

### Template Approbation
```
{{user_name}} - Nom de l'utilisateur
{{user_email}} - Email de l'utilisateur
{{to_email}} - Destinataire de l'email
{{app_url}} - URL de l'application (https://be-candidature.vercel.app)
```

## 🔧 Service EmailJS

Le service est centralisé dans `src/services/emailService.js` avec trois fonctions :

1. **sendWelcomeEmail(user)** - Envoie l'email de bienvenue
2. **sendApprovalEmail(user)** - Envoie l'email d'approbation
3. **sendCustomEmail(templateId, params)** - Fonction générique pour d'autres emails

## ✅ Avantages de cette solution

- ✅ **Gratuit**: 200 emails/mois
- ✅ **Pas de backend**: Pas besoin de Cloud Functions
- ✅ **Simple**: Configuration facile
- ✅ **Templates**: Personnalisables dans EmailJS
- ✅ **Logs**: Suivi des envois dans la console EmailJS

## 🧪 Test des emails

### Tester l'email de bienvenue:
1. Créez un nouveau compte sur l'application
2. Vérifiez votre boîte de réception
3. Vous devriez recevoir un email "Bienvenue sur BeCandidate !"

### Tester l'email d'approbation:
1. Connectez-vous en tant qu'admin (becandidature@gmail.com)
2. Allez dans le Dashboard Admin
3. Approuvez un utilisateur en attente
4. L'utilisateur reçoit l'email d'approbation

## 📊 Suivi des emails

Pour voir les emails envoyés :
1. Allez sur [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Cliquez sur **"Email History"**
3. Vous verrez tous les emails envoyés avec leur statut

## 🔍 Debug

Si les emails ne sont pas envoyés :
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que les templates IDs sont corrects
3. Vérifiez que le service EmailJS est bien configuré
4. Vérifiez les logs dans EmailJS Dashboard

## 💡 Amélioration future

Si vous dépassez 200 emails/mois, vous pouvez :
- Passer au plan payant EmailJS (~7$/mois)
- Migrer vers Firebase Functions + Resend (nécessite le plan Blaze)

