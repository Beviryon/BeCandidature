const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

admin.initializeApp();

// Initialiser Resend avec votre clé API
const resend = new Resend(functions.config().resend.apikey);

// Email après inscription (statut = pending)
exports.sendWelcomeEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const email = userData.email;

    if (userData.status === 'pending') {
      try {
        await resend.emails.send({
          from: 'BeCandidature <noreply@becandidature.com>',
          to: email,
          subject: '🎯 Bienvenue sur BeCandidature !',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .badge { display: inline-block; background: #ffc107; color: #000; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✨ Bienvenue sur BeCandidature !</h1>
                </div>
                <div class="content">
                  <p>Bonjour,</p>
                  <p>Merci pour votre inscription sur <strong>BeCandidature</strong> ! 🎉</p>
                  
                  <div style="background: #fff; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <span class="badge">⏳ En attente de validation</span>
                    <p><strong>Votre compte est actuellement en cours de validation par notre équipe.</strong></p>
                    <p>Vous recevrez un email de confirmation dès que votre compte sera activé.</p>
                  </div>

                  <p><strong>⏱️ Délai habituel :</strong> 24-48 heures</p>
                  
                  <p>En attendant, préparez vos candidatures ! 📝</p>

                  <div class="footer">
                    <p>Besoin d'aide ? Contactez-nous à support@becandidature.com</p>
                    <p>© 2025 BeCandidature - Tous droits réservés</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log('✅ Email de bienvenue envoyé à:', email);
      } catch (error) {
        console.error('❌ Erreur envoi email bienvenue:', error);
      }
    }
  });

// Email après approbation (statut passe à "active")
exports.sendApprovalEmail = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const email = afterData.email;

    // Vérifier si le statut est passé de "pending" à "active"
    if (beforeData.status === 'pending' && afterData.status === 'active') {
      try {
        await resend.emails.send({
          from: 'BeCandidature <noreply@becandidature.com>',
          to: email,
          subject: '✅ Votre compte BeCandidature est activé !',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Compte activé !</h1>
                </div>
                <div class="content">
                  <p>Bonjour,</p>
                  
                  <div style="background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <span class="badge">✅ Compte actif</span>
                    <p><strong>Bonne nouvelle ! Votre compte BeCandidature est maintenant activé.</strong></p>
                  </div>

                  <p>Vous pouvez maintenant accéder à toutes les fonctionnalités :</p>
                  <ul>
                    <li>📊 Tableau de bord avec statistiques</li>
                    <li>📝 Suivi de vos candidatures</li>
                    <li>📅 Calendrier de relances</li>
                    <li>🤖 Assistant IA</li>
                    <li>📧 Import d'emails</li>
                    <li>🔍 Scan d'offres</li>
                  </ul>

                  <div style="text-align: center;">
                    <a href="https://becandidature.vercel.app/login" class="button">
                      🚀 Se connecter maintenant
                    </a>
                  </div>

                  <p>Bonne chance dans vos recherches ! 💼</p>

                  <div class="footer">
                    <p>Besoin d'aide ? Contactez-nous à support@becandidature.com</p>
                    <p>© 2025 BeCandidature - Tous droits réservés</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log('✅ Email d\'approbation envoyé à:', email);
      } catch (error) {
        console.error('❌ Erreur envoi email approbation:', error);
      }
    }

    // Email après suspension
    if (beforeData.status === 'active' && afterData.status === 'suspended') {
      const reason = afterData.suspendedReason || 'Non spécifiée';
      try {
        await resend.emails.send({
          from: 'BeCandidature <noreply@becandidature.com>',
          to: email,
          subject: '⚠️ Votre compte BeCandidature a été suspendu',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .badge { display: inline-block; background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⚠️ Compte suspendu</h1>
                </div>
                <div class="content">
                  <p>Bonjour,</p>
                  
                  <div style="background: #fee2e2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
                    <span class="badge">🔒 Suspendu</span>
                    <p><strong>Votre compte BeCandidature a été temporairement suspendu.</strong></p>
                    <p><strong>Raison :</strong> ${reason}</p>
                  </div>

                  <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, contactez-nous :</p>
                  <p><strong>📧 Email :</strong> support@becandidature.com</p>

                  <div class="footer">
                    <p>© 2025 BeCandidature - Tous droits réservés</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log('✅ Email de suspension envoyé à:', email);
      } catch (error) {
        console.error('❌ Erreur envoi email suspension:', error);
      }
    }
  });


