-- ================================================================
-- SCRIPT SQL POUR SUPABASE - BeCandidature
-- ================================================================
-- À exécuter dans le SQL Editor de votre projet Supabase
-- ================================================================

-- 1. Créer la table candidatures
CREATE TABLE candidatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entreprise TEXT NOT NULL,
  poste TEXT NOT NULL,
  date_candidature DATE NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('En attente', 'Entretien', 'Refus')),
  date_relance DATE,
  contact TEXT,
  lien TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Activer Row Level Security (RLS)
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques de sécurité

-- Politique : Les utilisateurs peuvent voir leurs propres candidatures
CREATE POLICY "Users can view their own candidatures"
  ON candidatures FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres candidatures
CREATE POLICY "Users can create their own candidatures"
  ON candidatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leurs propres candidatures
CREATE POLICY "Users can update their own candidatures"
  ON candidatures FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres candidatures
CREATE POLICY "Users can delete their own candidatures"
  ON candidatures FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_candidatures_updated_at
  BEFORE UPDATE ON candidatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Créer des index pour améliorer les performances
CREATE INDEX idx_candidatures_user_id ON candidatures(user_id);
CREATE INDEX idx_candidatures_statut ON candidatures(statut);
CREATE INDEX idx_candidatures_date_candidature ON candidatures(date_candidature DESC);

-- ================================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ================================================================
-- Décommentez les lignes ci-dessous pour insérer des données de test
-- Remplacez 'YOUR_USER_ID' par votre UUID d'utilisateur (visible dans auth.users)

/*
INSERT INTO candidatures (user_id, entreprise, poste, date_candidature, statut, date_relance, contact, lien, notes)
VALUES 
  (
    'YOUR_USER_ID',
    'Google France',
    'Alternant Développeur Full Stack',
    '2025-11-15',
    'Entretien',
    '2025-11-22',
    'Marie Dupont - marie.dupont@google.com',
    'https://careers.google.com/jobs/...',
    'Premier entretien prévu le 25/11. Préparer des questions sur React et Node.js.'
  ),
  (
    'YOUR_USER_ID',
    'Airbus',
    'Alternant Data Engineer',
    '2025-11-18',
    'En attente',
    '2025-11-25',
    'Jean Martin - RH',
    'https://www.airbus.com/careers',
    'Candidature spontanée envoyée. Relancer début décembre.'
  ),
  (
    'YOUR_USER_ID',
    'Decathlon',
    'Alternant DevOps',
    '2025-10-20',
    'Refus',
    '2025-10-27',
    'Sophie Bernard',
    'https://recrutement.decathlon.fr',
    'Profil trop junior pour le poste. Réessayer l''année prochaine.'
  );
*/

-- ================================================================
-- VÉRIFICATION
-- ================================================================
-- Exécutez ces requêtes pour vérifier que tout fonctionne :

-- Vérifier que la table existe
SELECT * FROM candidatures LIMIT 1;

-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'candidatures';

-- Vérifier les triggers
SELECT * FROM pg_trigger WHERE tgname = 'update_candidatures_updated_at';

-- ================================================================
-- FIN DU SCRIPT
-- ================================================================

