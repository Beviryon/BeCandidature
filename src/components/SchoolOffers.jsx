import { Link, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, Sparkles, CreditCard } from 'lucide-react'

const SCHOOL_OFFERS = [
  {
    id: 'trial-30',
    name: 'Essai 30 jours',
    price: '0 EUR pendant 30 jours',
    badge: 'Découverte',
    description: 'Validez la plateforme avec un pilote court avant engagement.',
    benefits: [
      'Jusqu a 100 etudiants suivis',
      'Dashboard ecole de base',
      'Suivi des leads et rattachements',
      'Support email standard'
    ]
  },
  {
    id: 'school-pro',
    name: 'School Pro',
    price: '149 EUR / mois',
    badge: 'Le plus choisi',
    description: 'Pour les equipes insertion qui pilotent plusieurs promos.',
    benefits: [
      'Jusqu a 500 etudiants',
      'Alertes et segmentation avancee',
      'Exports et reporting institutionnel',
      'Support prioritaire'
    ]
  },
  {
    id: 'school-enterprise',
    name: 'School Enterprise',
    price: '399 EUR / mois',
    badge: 'Premium',
    description: 'Pour les ecoles multi-campus avec besoins de gouvernance.',
    benefits: [
      'Volume etudiants personnalise',
      'Multi-campus et roles etendus',
      'Accompagnement onboarding dedie',
      'Support strategic et SLA'
    ]
  }
]

function SchoolOffers() {
  const navigate = useNavigate()

  const selectOffer = (offerId) => {
    navigate(`/register/ecole/inscription?plan=${offerId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-6xl animate-scale-in">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-indigo-500/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 neon-glow">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Offres Ecole</h1>
            <p className="text-gray-500 dark:text-gray-300">
              Choisissez une offre pour votre etablissement avant de creer votre compte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCHOOL_OFFERS.map((offer) => (
              <div
                key={offer.id}
                className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{offer.name}</h2>
                  <span className="text-xs px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    {offer.badge}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-2">{offer.price}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{offer.description}</p>

                <ul className="space-y-2 mb-5">
                  {offer.benefits.map((item) => (
                    <li key={item} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => selectOffer(offer.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all"
                >
                  Choisir cette offre
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <CreditCard className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>
              Information importante: une carte bancaire est obligatoire pour finaliser l inscription, y compris pour l offre d essai 30 jours.
            </p>
          </div>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vous etes etudiant ?{' '}
              <Link to="/register/etudiant" className="text-purple-400 hover:text-purple-300 font-semibold">
                Inscription etudiant
              </Link>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Deja un compte ?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  )
}

export default SchoolOffers
