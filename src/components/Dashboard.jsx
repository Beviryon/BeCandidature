import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, TrendingDown, Target, Clock, Brain, Zap,
  Calendar, Award, AlertCircle, CheckCircle, BarChart3, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
         Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCandidatures } from '../hooks/useCandidatures'
import { DashboardSkeleton } from './Loading'

function Dashboard() {
  const { candidatures, loading } = useCandidatures()
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  const onboardingChecklist = useMemo(() => {
    const hasFirstCandidature = candidatures.length > 0
    const hasRelance = candidatures.some(c => (c.relances && c.relances.length > 0) || c.date_relance)
    const hasCalendarIntegration = Boolean(localStorage.getItem('google_calendar_token'))
    const hasCVTemplate = Boolean(localStorage.getItem('cv_selected_template'))

    const items = [
      {
        id: 'first-candidature',
        label: 'Creer 1 candidature',
        done: hasFirstCandidature,
        ctaLabel: 'Ajouter',
        ctaPath: '/ajouter'
      },
      {
        id: 'first-relance',
        label: 'Ajouter 1 relance',
        done: hasRelance,
        ctaLabel: 'Ouvrir calendrier',
        ctaPath: '/calendrier'
      },
      {
        id: 'calendar-setup',
        label: 'Configurer le calendrier',
        done: hasCalendarIntegration,
        ctaLabel: 'Configurer',
        ctaPath: '/calendrier/integration'
      },
      {
        id: 'cv-template',
        label: 'Choisir un template CV',
        done: hasCVTemplate,
        ctaLabel: 'Aller au CV',
        ctaPath: '/cv'
      }
    ]

    const completed = items.filter(item => item.done).length
    const progress = Math.round((completed / items.length) * 100)

    return { items, completed, total: items.length, progress }
  }, [candidatures])

  // Calculs et analyses
  const analytics = useMemo(() => {
    if (candidatures.length === 0) return null

    const total = candidatures.length
    const entretiens = candidatures.filter(c => c.statut === 'Entretien').length
    const attente = candidatures.filter(c => c.statut === 'En attente').length
    const refus = candidatures.filter(c => c.statut === 'Refus').length

    // Taux de réussite
    const tauxReussite = total > 0 ? ((entretiens / total) * 100).toFixed(1) : 0
    const tauxRefus = total > 0 ? ((refus / total) * 100).toFixed(1) : 0

    // Candidatures par mois
    const candidaturesParMois = {}
    candidatures.forEach(c => {
      const mois = new Date(c.date_candidature).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      candidaturesParMois[mois] = (candidaturesParMois[mois] || 0) + 1
    })

    const evolutionData = Object.entries(candidaturesParMois).map(([mois, count]) => ({
      mois,
      candidatures: count
    }))

    // Candidatures récentes (7 derniers jours)
    const septJoursAgo = new Date()
    septJoursAgo.setDate(septJoursAgo.getDate() - 7)
    const recenteCandidatures = candidatures.filter(c => 
      new Date(c.date_candidature) >= septJoursAgo
    ).length

    // Moyenne de candidatures par semaine
    const premiereDate = new Date(Math.min(...candidatures.map(c => new Date(c.date_candidature))))
    const aujourdhui = new Date()
    const semainesTotal = Math.max(1, Math.ceil((aujourdhui - premiereDate) / (7 * 24 * 60 * 60 * 1000)))
    const moyenneSemaine = (total / semainesTotal).toFixed(1)

    // Temps moyen de réponse
    const candidaturesAvecReponse = candidatures.filter(c => {
      // Ne garder que les candidatures avec une réponse ET une date de mise à jour valide
      if (c.statut === 'En attente') return false
      if (!c.updated_at) return false
      return true
    })
    
    let tempsMoyen = 0
    if (candidaturesAvecReponse.length > 0) {
      const total = candidaturesAvecReponse.reduce((acc, c) => {
        const dateCandidat = new Date(c.date_candidature)
        const dateUpdate = new Date(c.updated_at)
        const diff = (dateUpdate - dateCandidat) / (24 * 60 * 60 * 1000)
        // Vérifier que le calcul est valide
        return acc + (isNaN(diff) ? 0 : diff)
      }, 0)
      tempsMoyen = Math.round(total / candidaturesAvecReponse.length)
    }

    // À relancer
    const aRelancerItems = candidatures.filter(c => {
      if (c.statut !== 'En attente') return false
      const dateCandidat = new Date(c.date_candidature)
      const dateActuelle = new Date()
      const diffJours = Math.floor((dateActuelle - dateCandidat) / (1000 * 60 * 60 * 24))
      return diffJours >= 7
    })

    const aRelancer = aRelancerItems.length
    const prochaineRelance = [...aRelancerItems]
      .sort((a, b) => new Date(a.date_candidature) - new Date(b.date_candidature))
      .slice(0, 3)

    const entretiensPrevus = candidatures
      .filter(c => c.statut === 'Entretien')
      .slice(0, 2)

    return {
      total,
      entretiens,
      attente,
      refus,
      tauxReussite,
      tauxRefus,
      evolutionData,
      recenteCandidatures,
      moyenneSemaine,
      tempsMoyen,
      aRelancer,
      prochaineRelance,
      entretiensPrevus
    }
  }, [candidatures])

  // Données pour le graphique en donut
  const pieData = analytics ? [
    { name: 'Entretien', value: analytics.entretiens, color: '#22c55e' },
    { name: 'En attente', value: analytics.attente, color: '#f97316' },
    { name: 'Refus', value: analytics.refus, color: '#ef4444' }
  ] : []

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-12 text-center border border-purple-500/30 shadow-lg">
        <BarChart3 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-300 mb-2">
          Pas encore de données
        </h3>
        <p className="text-gray-400 mb-6">
          Ajoutez des candidatures pour voir vos statistiques
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/ajouter"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            Ajouter une candidature
          </Link>
          <Link
            to="/import-excel"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-all"
          >
            Importer un fichier
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold gradient-text mb-2">
          Dashboard
        </h2>
        <p className="text-gray-400">Vue d'ensemble de vos candidatures</p>
      </div>

      {/* Priorités du jour */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-500/20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Priorités du jour
          </h3>
          <Link
            to="/candidatures"
            className="inline-flex items-center justify-center gap-1 w-full sm:w-auto px-3 py-2 text-sm font-medium rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-purple-700 dark:text-purple-300 hover:bg-white dark:hover:bg-white/10 transition-all"
          >
            Voir toutes les candidatures <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-500/15 to-pink-500/10 border border-red-500/30 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-300" />
                </div>
                <p className="font-semibold text-red-700 dark:text-red-300">A relancer aujourd&apos;hui</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30">
                {analytics.aRelancer}
              </span>
            </div>

            {analytics.prochaineRelance.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {analytics.prochaineRelance.map((item) => (
                  <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                    <span className="text-red-500 mr-1">•</span>
                    <span className="font-medium">{item.entreprise}</span>
                    <span className="text-gray-600 dark:text-gray-400"> ({item.poste})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Rien d&apos;urgent, bon rythme de suivi.
              </p>
            )}

            <Link
              to="/candidatures"
              className="inline-flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-300 hover:underline"
            >
              Ouvrir la liste et relancer <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-500/30 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-300" />
                </div>
                <p className="font-semibold text-green-700 dark:text-green-300">Entretiens en cours</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
                {analytics.entretiens}
              </span>
            </div>

            {analytics.entretiensPrevus.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {analytics.entretiensPrevus.map((item) => (
                  <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                    <span className="text-green-500 mr-1">•</span>
                    <span className="font-medium">{item.entreprise}</span>
                    <span className="text-gray-600 dark:text-gray-400"> ({item.poste})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Aucun entretien actif pour le moment.
              </p>
            )}

            <Link
              to="/assistant"
              className="inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              Preparer un entretien avec l&apos;assistant <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Parcours debutant guide */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-500/20 shadow-lg">
        <button
          type="button"
          onClick={() => setIsOnboardingOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
            Parcours debutant guide
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              {onboardingChecklist.completed}/{onboardingChecklist.total} etapes
            </span>
            {isOnboardingOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </div>
        </button>

        {isOnboardingOpen && (
          <>
            <div className="mt-4 mb-4">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                <span>Progression onboarding</span>
                <span>{onboardingChecklist.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${onboardingChecklist.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {onboardingChecklist.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border ${
                    item.done
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/70 dark:bg-white/5 border-gray-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${item.done ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${item.done ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.label}
                      </span>
                    </div>
                    {!item.done && (
                      <Link
                        to={item.ctaPath}
                        className="text-xs font-medium text-purple-700 dark:text-purple-300 hover:underline"
                      >
                        {item.ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-700 dark:text-white">{analytics.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Candidatures</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {analytics.moyenneSemaine} / semaine en moyenne
          </div>
        </div>

        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.tauxReussite}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux de réussite</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {analytics.entretiens} entretien(s) obtenus
          </div>
        </div>

        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{analytics.tempsMoyen}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Jours de réponse</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Temps moyen de réponse
          </div>
        </div>

        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{analytics.aRelancer}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">À relancer</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Plus de 7 jours sans réponse
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en donut */}
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Répartition des statuts
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique d'évolution */}
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Évolution des candidatures
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.evolutionData}>
              <XAxis 
                dataKey="mois" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="candidatures" 
                stroke="#a855f7" 
                strokeWidth={3}
                dot={{ fill: '#a855f7', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights IA */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Insights & Recommandations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.tauxReussite >= 30 ? (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-700 dark:text-green-300 mb-1">Excellent taux de réussite !</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Votre taux de {analytics.tauxReussite}% est au-dessus de la moyenne. Continuez ainsi !
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-orange-700 dark:text-orange-300 mb-1">Optimisez votre approche</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Personnalisez davantage vos candidatures pour améliorer votre taux de réussite.
                  </div>
                </div>
              </div>
            </div>
          )}

          {analytics.recenteCandidatures > 0 ? (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Bonne activité récente</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {analytics.recenteCandidatures} candidature(s) envoyée(s) cette semaine. Gardez le rythme !
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-700 dark:text-red-300 mb-1">Augmentez votre activité</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Aucune candidature cette semaine. Fixez-vous un objectif quotidien !
                  </div>
                </div>
              </div>
            </div>
          )}

          {analytics.aRelancer > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">Relances nécessaires</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {analytics.aRelancer} candidature(s) à relancer. Un suivi régulier augmente vos chances !
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Conseil du jour</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {analytics.tempsMoyen < 7 
                    ? "Les entreprises répondent vite ! Relancez après 5-7 jours."
                    : "Relancez toujours après 7 jours, cela montre votre motivation."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

