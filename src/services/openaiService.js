import { auth } from '../firebaseConfig'

const AI_FUNCTION_URL = import.meta.env.VITE_AI_FUNCTION_URL || ''

/**
 * Génère une réponse IA pour l'assistant de candidatures
 * @param {string} userMessage - Le message de l'utilisateur
 * @param {Array} conversationHistory - L'historique de la conversation
 * @returns {Promise<string>} - La réponse de l'IA
 */
export async function generateAIResponse(userMessage, conversationHistory = []) {
  try {
    // Si pas d'endpoint backend, utiliser les réponses de démonstration
    if (!AI_FUNCTION_URL) {
      return getDemoResponse(userMessage)
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      return getDemoResponse(userMessage)
    }

    const idToken = await currentUser.getIdToken()

    const response = await fetch(AI_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory
      })
    })

    if (!response.ok) {
      throw new Error(`AI backend error: ${response.status}`)
    }

    const data = await response.json()
    return data.response || getDemoResponse(userMessage)
  } catch (error) {
    console.error('Erreur IA backend:', error)
    
    // En cas d'erreur, utiliser les réponses de démo
    return getDemoResponse(userMessage)
  }
}

/**
 * Réponses de démonstration (fallback)
 */
function getDemoResponse(userMessage) {
  const message = userMessage.toLowerCase()

  if (message.includes('lettre') || message.includes('motivation')) {
    return `📝 **Lettre de Motivation Personnalisée**

Madame, Monsieur,

Actuellement étudiant(e) en recherche d'alternance, je me permets de vous adresser ma candidature pour le poste mentionné au sein de votre entreprise.

Passionné(e) par le développement et les nouvelles technologies, j'ai acquis durant mon parcours des compétences solides en React, Node.js et gestion de projets. Mon expérience dans [domaine] m'a permis de développer mon autonomie et ma capacité à travailler en équipe.

Votre entreprise, reconnue pour son innovation et sa culture d'entreprise inspirante, représente pour moi l'opportunité idéale de mettre en pratique mes connaissances tout en continuant à apprendre.

Motivé(e), rigoureux(se) et force de proposition, je serais ravi(e) de contribuer au succès de vos projets.

Je reste à votre disposition pour un entretien afin de vous présenter plus en détail mon parcours et ma motivation.

Cordialement,
[Votre nom]

💡 **Conseils :** Personnalisez cette lettre avec :
- Le nom du recruteur si possible
- Des exemples concrets de vos réalisations
- Des éléments spécifiques à l'entreprise`
  }

  if (message.includes('relance') || message.includes('email')) {
    return `📧 **Email de Relance Professionnel**

**Objet :** Suivi de ma candidature - [Poste]

Bonjour [Prénom du recruteur],

Je me permets de revenir vers vous concernant ma candidature pour le poste de [Intitulé du poste] que j'ai soumise le [date].

Toujours aussi motivé(e) par cette opportunité, je souhaitais savoir si vous aviez eu l'occasion d'examiner mon profil et si des informations complémentaires vous seraient utiles.

Je reste bien entendu à votre entière disposition pour échanger sur ma candidature lors d'un entretien.

Je vous remercie pour votre attention et vous souhaite une excellente journée.

Cordialement,
[Votre nom]
[Votre téléphone]

💡 **Timing parfait :** 7-10 jours après votre candidature
⚠️ **À faire :** Une seule relance, restez courtois et concis`
  }

  if (message.includes('conseil') || message.includes('améliorer')) {
    return `💡 **Conseils pour Optimiser vos Candidatures**

**1. Personnalisation (Clé du succès !)**
- ✅ Adaptez chaque candidature à l'entreprise
- ✅ Mentionnez des projets/valeurs de l'entreprise
- ✅ Utilisez les mots-clés de l'offre

**2. CV Impactant**
- ✅ Mettez vos réalisations en avant (pas juste vos tâches)
- ✅ Quantifiez vos résultats (ex: "Augmenté de 30%")
- ✅ Utilisez un design moderne et lisible

**3. Réseau LinkedIn**
- ✅ Connectez-vous avec les recruteurs AVANT de postuler
- ✅ Commentez les posts de l'entreprise
- ✅ Demandez des recommandations

**4. Timing**
- ✅ Postulez en début de semaine (Lundi-Mardi)
- ✅ Relancez après 7-10 jours
- ✅ Soyez disponible rapidement pour un entretien

**📊 Statistiques :** Avec ces conseils, passez de 2% à 15% de taux de réponse !`
  }

  return `Merci pour votre message ! Je peux vous aider avec :

📝 **Lettres de motivation** personnalisées
💡 **Conseils** pour améliorer vos candidatures  
📧 **Emails de relance** professionnels
🎯 **Analyse** de votre profil

Que souhaitez-vous que je fasse pour vous ?`
}

