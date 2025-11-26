# 🎭 Mode DÉMO - BeCandidature

## ✅ Mode DÉMO activé !

Votre application fonctionne maintenant **sans Supabase** avec un utilisateur et des données de démonstration.

---

## 🔐 Identifiants de connexion

```
Email : demo@candidature.fr
Mot de passe : demo123
```

Ces identifiants sont affichés directement sur la page de connexion !

---

## 🎯 Fonctionnalités disponibles

### ✅ Tout fonctionne en mode DÉMO :

1. **Connexion** avec l'utilisateur de démo
2. **Voir 6 candidatures d'exemple** :
   - Google France - Développeur Full Stack (Entretien)
   - Airbus - Data Engineer (En attente)
   - Decathlon - DevOps (Refus)
   - BNP Paribas - Développeur React (Entretien)
   - Capgemini - Consultant Développeur (En attente)
   - Thales - Ingénieur Logiciel Embarqué (En attente)

3. **Ajouter de nouvelles candidatures**
   - Elles seront sauvegardées dans votre navigateur (localStorage)

4. **Modifier des candidatures**
   - Toutes les modifications sont sauvegardées localement

5. **Supprimer des candidatures**
   - La suppression fonctionne et est persistante

6. **Voir les statistiques**
   - Total, Entretiens, En attente, Refus

7. **Toutes les fonctionnalités de l'interface**
   - Code couleur (vert/orange/rouge)
   - Alertes de relance
   - Calcul automatique des dates
   - Design responsive

---

## 💾 Sauvegarde des données

- Les données sont sauvegardées dans le **localStorage** de votre navigateur
- Elles persistent même si vous fermez et rouvrez le navigateur
- Elles sont **locales** à votre ordinateur (pas de base de données cloud)

---

## 🔄 Réinitialiser les données de démo

Pour retrouver les 6 candidatures d'exemple initiales :

1. Ouvrez la console du navigateur (F12)
2. Tapez : `localStorage.removeItem('demo_candidatures')`
3. Rechargez la page (F5)

---

## 🚀 Comment utiliser le mode DÉMO

### Étape 1 : Ouvrir l'application

Allez sur [http://localhost:5173](http://localhost:5173)

### Étape 2 : Se connecter

Vous verrez un encadré bleu avec les identifiants :
- Email : `demo@candidature.fr`
- Mot de passe : `demo123`

Entrez ces identifiants et cliquez sur "Se connecter"

### Étape 3 : Explorer l'application

Vous êtes maintenant dans l'application avec 6 candidatures d'exemple !

**Testez toutes les fonctionnalités** :
- ➕ Ajouter une nouvelle candidature
- ✏️ Modifier une candidature existante
- 🗑️ Supprimer une candidature
- 📊 Voir les statistiques
- 🔍 Observer les alertes de relance

---

## 🔧 Désactiver le mode DÉMO

Quand vous voudrez passer en mode **production** avec une vraie base de données Supabase :

1. Ouvrez le fichier `src/demoData.js`
2. Changez la ligne :
   ```js
   export const DEMO_MODE = true
   ```
   en :
   ```js
   export const DEMO_MODE = false
   ```
3. Configurez vos vraies clés Supabase dans `.env`
4. Redémarrez l'application

---

## 🎨 Testez ces scénarios

### Scénario 1 : Ajouter une candidature
1. Cliquez sur "+ Nouvelle candidature"
2. Remplissez le formulaire (exemple : Spotify - Développeur Backend)
3. Choisissez un statut (En attente, Entretien, Refus)
4. Ajoutez des notes si vous voulez
5. Cliquez sur "Ajouter"
6. ✅ Votre candidature apparaît dans la liste !

### Scénario 2 : Modifier le statut
1. Dans la liste, cliquez sur "Modifier" pour Airbus
2. Changez le statut de "En attente" à "Entretien"
3. Ajoutez une note : "Entretien prévu la semaine prochaine"
4. Cliquez sur "Enregistrer"
5. ✅ Le statut est maintenant vert (Entretien) !

### Scénario 3 : Supprimer une candidature
1. Cliquez sur "Supprimer" pour Decathlon (refusée)
2. Confirmez la suppression
3. ✅ La candidature disparaît de la liste !

### Scénario 4 : Observer les alertes
1. Regardez la colonne "Date relance"
2. Les candidatures de plus de 7 jours avec statut "En attente" affichent "⚠️ Relancer !"
3. ✅ Vous savez quand relancer les entreprises !

---

## 📊 Aperçu des statistiques

En bas de la page, vous verrez 4 cartes :
- **Total** : Nombre total de candidatures
- **Entretiens** (vert) : Candidatures en phase d'entretien
- **En attente** (orange) : Candidatures sans réponse
- **Refus** (rouge) : Candidatures refusées

Les statistiques se mettent à jour automatiquement quand vous ajoutez/modifiez/supprimez des candidatures !

---

## 💡 Astuces

1. **Code couleur** : Repérez rapidement les statuts
   - 🟢 Vert = Entretien (youpi !)
   - 🟠 Orange = En attente (patience...)
   - 🔴 Rouge = Refus (next !)

2. **Relances** : La date de relance est calculée automatiquement (+7 jours)

3. **Notes** : Utilisez le champ notes pour vos impressions après chaque candidature

4. **Liens** : Ajoutez le lien de l'offre pour pouvoir la retrouver facilement

5. **Contact** : Notez le nom du recruteur et ses coordonnées

---

## 🐛 En cas de problème

### Les données ne se sauvegardent pas
- Vérifiez que JavaScript est activé
- Vérifiez que le localStorage n'est pas désactivé dans votre navigateur

### Je ne vois pas les candidatures d'exemple
- Ouvrez la console (F12) et tapez : `localStorage.removeItem('demo_candidatures')`
- Rechargez la page (F5)

### L'interface est vide après connexion
- Vérifiez que vous êtes bien connecté (email : demo@candidature.fr)
- Rechargez la page (F5)

---

## 🚀 Passer en mode production

Quand vous serez prêt à utiliser l'application avec Supabase :

1. Suivez le guide `CONFIGURATION_SUPABASE.md`
2. Créez votre projet Supabase
3. Configurez `.env` avec vos vraies clés
4. Désactivez le mode DÉMO (`DEMO_MODE = false` dans `src/demoData.js`)
5. Redémarrez l'application

Vos vraies données seront alors sauvegardées dans Supabase, accessibles de n'importe où !

---

**Profitez du mode DÉMO ! 🎉**

