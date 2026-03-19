/**
 * Traduit les codes d'erreur Firebase en messages compréhensibles en français
 * @param {string} errorCode - Code d'erreur Firebase
 * @returns {string} Message d'erreur en français
 */
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    // Erreurs d'authentification
    'auth/invalid-credential': '❌ Identifiants invalides (email ou mot de passe). Vérifiez aussi que ce compte existe bien dans le projet Firebase en cours.',
    'auth/user-not-found': '❌ Aucun compte trouvé avec cet email.',
    'auth/wrong-password': '❌ Mot de passe incorrect.',
    'auth/invalid-email': '❌ L\'adresse email n\'est pas valide.',
    'auth/user-disabled': '❌ Ce compte a été désactivé. Contactez l\'administrateur.',
    'auth/email-already-in-use': '❌ Cet email est déjà utilisé. Essayez de vous connecter.',
    'auth/weak-password': '❌ Le mot de passe doit contenir au moins 6 caractères.',
    'auth/operation-not-allowed': '❌ Cette opération n\'est pas autorisée.',
    'auth/account-exists-with-different-credential': '❌ Un compte existe déjà avec cette adresse email.',
    
    // Erreurs réseau
    'auth/network-request-failed': '🌐 Erreur de connexion. Vérifiez votre connexion internet.',
    'auth/timeout': '⏱️ La requête a expiré. Veuillez réessayer.',
    
    // Erreurs de session
    'auth/too-many-requests': '⚠️ Trop de tentatives. Veuillez réessayer dans quelques minutes.',
    'auth/requires-recent-login': '🔒 Pour des raisons de sécurité, veuillez vous reconnecter.',
    
    // Erreurs générales
    'auth/popup-closed-by-user': '❌ La fenêtre de connexion a été fermée.',
    'auth/cancelled-popup-request': '❌ Demande annulée.',
    'auth/internal-error': '⚠️ Erreur interne. Veuillez réessayer.',
    
    // Erreurs Firestore
    'permission-denied': '🔒 Vous n\'avez pas les permissions nécessaires.',
    'unavailable': '🌐 Service temporairement indisponible. Réessayez plus tard.',
    'not-found': '❌ Ressource introuvable.',
    'already-exists': '⚠️ Cette ressource existe déjà.',
  };

  return errorMessages[errorCode] || `⚠️ Une erreur est survenue. Veuillez réessayer. (${errorCode})`;
};

/**
 * Extrait le code d'erreur d'un objet erreur Firebase
 * @param {Error} error - Objet erreur
 * @returns {string} Message d'erreur formaté
 */
export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  // Si c'est un objet erreur Firebase
  if (error?.code) {
    return getFirebaseErrorMessage(error.code);
  }
  
  // Si c'est juste un message
  if (typeof error === 'string') {
    return error;
  }
  
  // Erreur générique
  return '⚠️ Une erreur est survenue. Veuillez réessayer.';
};

export default {
  getFirebaseErrorMessage,
  handleFirebaseError
};

