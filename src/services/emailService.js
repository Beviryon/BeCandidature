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
      user_email: user.email,
      email_subject: 'Bienvenue sur BeCandidate !',
      message: 'Merci de vous être inscrit sur BeCandidate !\n\nVotre compte est en attente d\'approbation par notre équipe.',
      extra_info: 'Vous recevrez un email dès que votre compte sera activé.'
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
 * Envoie une notification à l'admin pour une nouvelle inscription
 * @param {Object} user - Les informations de l'utilisateur
 * @param {string} user.name - Le nom de l'utilisateur
 * @param {string} user.email - L'email de l'utilisateur
 */
export const sendAdminNotification = async (user) => {
  try {
    const now = new Date().toLocaleString('fr-FR');
    const templateParams = {
      to_name: 'Admin',
      to_email: 'becandidature@gmail.com', // Email de l'admin
      user_name: 'Admin',
      user_email: user.email,
      email_subject: '🔔 Nouvelle inscription sur BeCandidate',
      message: `Une nouvelle inscription vient d'être effectuée sur BeCandidate !\n\n👤 Utilisateur : ${user.name || 'Nouvel utilisateur'}\n📅 Date : ${now}\n\nCette inscription est en attente d'approbation.`,
      extra_info: `👉 Connectez-vous au Dashboard Admin pour approuver ou rejeter cette demande :\n${window.location.origin}/admin`
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.welcome,
      templateParams
    );

    console.log('✅ Notification admin envoyée avec succès !');
    return { success: true, response };
  } catch (error) {
    console.warn('⚠️ La notification admin n\'a pas pu être envoyée.');
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
  sendAdminNotification,
  sendCustomEmail
};

