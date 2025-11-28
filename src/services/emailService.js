import emailjs from '@emailjs/browser';

// Configuration EmailJS
const EMAILJS_CONFIG = {
  serviceId: 'service_tbbakdr',
  publicKey: 'k1y1LDW1JZtKa6Flk',
  templates: {
    welcome: 'template_3ze3d9v',
    approval: 'template_zztznym'
  }
};

// Initialiser EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

/**
 * Envoie un email de bienvenue à un nouvel utilisateur
 * @param {Object} user - Les informations de l'utilisateur
 * @param {string} user.name - Le nom de l'utilisateur
 * @param {string} user.email - L'email de l'utilisateur
 */
export const sendWelcomeEmail = async (user) => {
  try {
    const templateParams = {
      to_name: user.name || 'Utilisateur',
      to_email: user.email,
      user_name: user.name || 'Utilisateur',
      user_email: user.email
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.welcome,
      templateParams
    );

    console.log('✅ Email de bienvenue envoyé avec succès !');
    return { success: true, response };
  } catch (error) {
    console.warn('⚠️ L\'email de bienvenue n\'a pas pu être envoyé, mais l\'inscription a réussi.');
    // Ne pas bloquer l'inscription si l'email échoue
    return { success: false, error };
  }
};

/**
 * Envoie un email d'approbation à un utilisateur
 * @param {Object} user - Les informations de l'utilisateur
 * @param {string} user.name - Le nom de l'utilisateur
 * @param {string} user.email - L'email de l'utilisateur
 */
export const sendApprovalEmail = async (user) => {
  try {
    const templateParams = {
      to_name: user.name || 'Utilisateur',
      to_email: user.email,
      user_name: user.name || 'Utilisateur',
      user_email: user.email,
      app_url: window.location.origin
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.approval,
      templateParams
    );

    console.log('✅ Email d\'approbation envoyé avec succès !');
    return { success: true, response };
  } catch (error) {
    console.warn('⚠️ L\'email d\'approbation n\'a pas pu être envoyé, mais l\'approbation a réussi.');
    // Ne pas bloquer l'approbation si l'email échoue
    return { success: false, error };
  }
};

/**
 * Envoie un email personnalisé
 * @param {string} templateId - L'ID du template EmailJS
 * @param {Object} params - Les paramètres du template
 */
export const sendCustomEmail = async (templateId, params) => {
  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      params
    );

    console.log('✅ Email personnalisé envoyé avec succès:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email personnalisé:', error);
    return { success: false, error };
  }
};

export default {
  sendWelcomeEmail,
  sendApprovalEmail,
  sendCustomEmail
};

