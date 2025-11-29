import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

/**
 * Migre les candidatures du localStorage vers Firestore
 * Cette fonction ne s'exécute qu'une seule fois par utilisateur
 */
export const migrateLocalStorageToFirestore = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ Utilisateur non connecté, migration impossible');
      return { success: false, message: 'Utilisateur non connecté' };
    }

    // Vérifier si la migration a déjà été faite
    const migrationFlag = localStorage.getItem(`migration_done_${user.uid}`);
    if (migrationFlag === 'true') {
      console.log('✅ Migration déjà effectuée pour cet utilisateur');
      return { success: true, message: 'Déjà migré', alreadyMigrated: true };
    }

    // Récupérer les candidatures du localStorage
    const storedCandidatures = localStorage.getItem('demo_candidatures');
    if (!storedCandidatures) {
      console.log('ℹ️ Aucune candidature à migrer');
      localStorage.setItem(`migration_done_${user.uid}`, 'true');
      return { success: true, message: 'Aucune donnée à migrer', count: 0 };
    }

    const candidatures = JSON.parse(storedCandidatures);
    
    if (!Array.isArray(candidatures) || candidatures.length === 0) {
      console.log('ℹ️ Aucune candidature valide à migrer');
      localStorage.setItem(`migration_done_${user.uid}`, 'true');
      return { success: true, message: 'Aucune donnée valide', count: 0 };
    }

    // Vérifier si des candidatures existent déjà dans Firestore
    const candidaturesRef = collection(db, 'candidatures');
    const q = query(candidaturesRef, where('user_id', '==', user.uid));
    const existingDocs = await getDocs(q);
    
    if (existingDocs.size > 0) {
      console.log('✅ Des candidatures existent déjà dans Firestore, migration annulée');
      localStorage.setItem(`migration_done_${user.uid}`, 'true');
      return { success: true, message: 'Candidatures déjà présentes', count: existingDocs.size };
    }

    console.log(`🔄 Migration de ${candidatures.length} candidatures vers Firestore...`);

    // Migrer chaque candidature
    let migratedCount = 0;
    const errors = [];

    for (const candidature of candidatures) {
      try {
        // Préparer les données pour Firestore
        const firestoreData = {
          user_id: user.uid,
          entreprise: candidature.entreprise || '',
          poste: candidature.poste || '',
          date_candidature: candidature.date_candidature || new Date().toISOString().split('T')[0],
          statut: candidature.statut || 'En attente',
          date_relance: candidature.date_relance || '',
          contact: candidature.contact || '',
          lien: candidature.lien || '',
          notes: candidature.notes || '',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };

        await addDoc(collection(db, 'candidatures'), firestoreData);
        migratedCount++;
        console.log(`✅ Candidature migrée : ${candidature.entreprise} - ${candidature.poste}`);
      } catch (error) {
        console.error(`❌ Erreur migration candidature :`, error);
        errors.push({ candidature: candidature.entreprise, error: error.message });
      }
    }

    // Marquer la migration comme terminée
    localStorage.setItem(`migration_done_${user.uid}`, 'true');

    console.log(`🎉 Migration terminée ! ${migratedCount}/${candidatures.length} candidatures migrées`);

    return {
      success: true,
      message: 'Migration réussie',
      count: migratedCount,
      total: candidatures.length,
      errors: errors
    };

  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
};

/**
 * Réinitialise le flag de migration (pour tester)
 */
export const resetMigrationFlag = () => {
  const user = auth.currentUser;
  if (user) {
    localStorage.removeItem(`migration_done_${user.uid}`);
    console.log('🔄 Flag de migration réinitialisé');
  }
};

