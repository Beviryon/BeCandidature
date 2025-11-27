// Mode DÉMO - Données et utilisateur de démonstration

export const DEMO_MODE = true // Mode démo activé par défaut - Désactivez si Firebase est configuré

// Utilisateur de démonstration
export const DEMO_USER = {
  email: 'demo@candidature.fr',
  password: 'demo123',
  id: 'demo-user-123'
}

// Candidatures de démonstration
export const DEMO_CANDIDATURES = [
  {
    id: '1',
    user_id: 'demo-user-123',
    entreprise: 'Google France',
    poste: 'Développeur Full Stack',
    date_candidature: '2025-11-15',
    statut: 'Entretien',
    date_relance: '2025-11-22',
    contact: 'Marie Dupont - marie.dupont@google.com',
    lien: 'https://careers.google.com',
    notes: 'Premier entretien prévu le 25/11. Stack : React, Node.js, PostgreSQL. Très bon feeling avec le recruteur.',
    created_at: '2025-11-15T10:00:00Z',
    updated_at: '2025-11-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'demo-user-123',
    entreprise: 'Airbus',
    poste: 'Data Engineer Alternance',
    date_candidature: '2025-11-18',
    statut: 'En attente',
    date_relance: '2025-11-25',
    contact: 'Jean Martin - RH',
    lien: 'https://www.airbus.com/careers',
    notes: 'Candidature spontanée envoyée. Projet sur Big Data et Cloud AWS.',
    created_at: '2025-11-18T14:30:00Z',
    updated_at: '2025-11-18T14:30:00Z'
  },
  {
    id: '3',
    user_id: 'demo-user-123',
    entreprise: 'Decathlon',
    poste: 'Alternant DevOps',
    date_candidature: '2025-10-20',
    statut: 'Refus',
    date_relance: '2025-10-27',
    contact: 'Sophie Bernard',
    lien: 'https://recrutement.decathlon.fr',
    notes: 'Profil trop junior pour le poste. Réessayer l\'année prochaine avec plus d\'expérience en Kubernetes.',
    created_at: '2025-10-20T09:15:00Z',
    updated_at: '2025-10-25T16:00:00Z'
  },
  {
    id: '4',
    user_id: 'demo-user-123',
    entreprise: 'BNP Paribas',
    poste: 'Développeur React',
    date_candidature: '2025-11-10',
    statut: 'Entretien',
    date_relance: '2025-11-17',
    contact: 'Thomas Leroy - thomas.leroy@bnpparibas.com - 06 12 34 56 78',
    lien: 'https://careers.bnpparibas/fr',
    notes: 'Entretien technique passé. En attente du retour RH. Stack : React, TypeScript, GraphQL.',
    created_at: '2025-11-10T11:00:00Z',
    updated_at: '2025-11-20T10:00:00Z'
  },
  {
    id: '5',
    user_id: 'demo-user-123',
    entreprise: 'Capgemini',
    poste: 'Consultant Développeur',
    date_candidature: '2025-11-12',
    statut: 'En attente',
    date_relance: '2025-11-19',
    contact: 'Laura Martinez',
    lien: 'https://www.capgemini.com/careers',
    notes: 'Candidature via LinkedIn. Mission client dans le secteur bancaire.',
    created_at: '2025-11-12T15:45:00Z',
    updated_at: '2025-11-12T15:45:00Z'
  },
  {
    id: '6',
    user_id: 'demo-user-123',
    entreprise: 'Thales',
    poste: 'Ingénieur Logiciel Embarqué',
    date_candidature: '2025-11-05',
    statut: 'En attente',
    date_relance: '2025-11-12',
    contact: 'Pierre Dubois - recrutement@thales.com',
    lien: 'https://www.thalesgroup.com/fr/carrieres',
    notes: 'Projet sur systèmes embarqués. Nécessite habilitation défense (en cours).',
    created_at: '2025-11-05T13:20:00Z',
    updated_at: '2025-11-05T13:20:00Z'
  }
]

// Fonction pour récupérer les candidatures depuis localStorage ou utiliser les données de démo
export const getDemoCandidatures = () => {
  const stored = localStorage.getItem('demo_candidatures')
  if (stored) {
    return JSON.parse(stored)
  }
  // Sauvegarder les données de démo au premier chargement
  localStorage.setItem('demo_candidatures', JSON.stringify(DEMO_CANDIDATURES))
  return DEMO_CANDIDATURES
}

// Fonction pour sauvegarder les candidatures
export const saveDemoCandidatures = (candidatures) => {
  localStorage.setItem('demo_candidatures', JSON.stringify(candidatures))
}

// Fonction pour générer un nouvel ID
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

