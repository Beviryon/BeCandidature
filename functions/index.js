const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');
const OpenAI = require('openai');

admin.initializeApp();

// Initialiser Resend avec votre clé API
const resend = new Resend(functions.config().resend.apikey);

// Prompt système côté serveur (non exposé au navigateur)
const AI_SYSTEM_PROMPT = `Tu es un assistant IA de BeCandidature expert en candidatures d'emploi et alternance.
Tu aides les candidats à :
- Rédiger des lettres de motivation professionnelles et personnalisées
- Écrire des emails de relance efficaces
- Améliorer leurs candidatures
- Analyser leur profil et proposer des améliorations

Tu es toujours professionnel, motivant et constructif.
Tes réponses sont structurées avec des conseils concrets et actionnables.`;

const getOpenAIApiKey = () => {
  return functions.config().openai?.apikey || process.env.OPENAI_API_KEY;
};

const buildCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

exports.adminSetUserStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentification requise.');
  }

  const adminUid = context.auth.uid;
  const adminDoc = await admin.firestore().collection('users').doc(adminUid).get();
  if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Accès administrateur requis.');
  }

  const targetUserId = typeof data?.userId === 'string' ? data.userId.trim() : '';
  const requestedStatus = typeof data?.status === 'string' ? data.status.trim() : '';
  const reason = typeof data?.reason === 'string' ? data.reason.trim() : '';
  const validStatuses = new Set(['active', 'pending', 'suspended', 'rejected']);

  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId est requis.');
  }
  if (!validStatuses.has(requestedStatus)) {
    throw new functions.https.HttpsError('invalid-argument', 'status invalide.');
  }

  const userRef = admin.firestore().collection('users').doc(targetUserId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Utilisateur introuvable.');
  }

  const currentUserData = userSnap.data();
  const updates = {
    status: requestedStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  if (requestedStatus === 'active' && currentUserData.status === 'pending') {
    updates.approvedAt = admin.firestore.FieldValue.serverTimestamp();
    updates.approvedBy = adminUid;
  }

  if (requestedStatus === 'suspended') {
    updates.suspendedReason = reason || 'Non spécifiée';
    updates.suspendedAt = admin.firestore.FieldValue.serverTimestamp();
  } else {
    updates.suspendedReason = admin.firestore.FieldValue.delete();
    updates.suspendedAt = admin.firestore.FieldValue.delete();
  }

  await userRef.update(updates);

  return {
    ok: true,
    userId: targetUserId,
    previousStatus: currentUserData.status || null,
    status: requestedStatus
  };
});

exports.generateAIResponse = functions.https.onRequest(async (req, res) => {
  const corsHeaders = buildCorsHeaders();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.set(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.substring('Bearer '.length);
    await admin.auth().verifyIdToken(idToken);

    const { userMessage, conversationHistory = [] } = req.body || {};
    if (!userMessage || typeof userMessage !== 'string') {
      res.status(400).json({ error: 'userMessage is required' });
      return;
    }

    const sanitizedHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter(
            (msg) =>
              msg &&
              typeof msg.content === 'string' &&
              ['user', 'assistant', 'system'].includes(msg.role)
          )
          .slice(-12)
          .map((msg) => ({
            role: msg.role,
            content: msg.content.slice(0, 4000)
          }))
      : [];

    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      console.error('OPENAI_API_KEY / functions.config().openai.apikey manquant');
      res.status(500).json({ error: 'AI backend not configured' });
      return;
    }

    const openai = new OpenAI({ apiKey });
    const model = functions.config().openai?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        ...sanitizedHistory,
        { role: 'user', content: userMessage.slice(0, 4000) }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    const responseText = completion.choices?.[0]?.message?.content || '';
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Erreur génération IA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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


