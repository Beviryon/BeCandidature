import { useMemo } from 'react'
import { 
  TrendingUp, TrendingDown, Target, Clock, Brain, Zap,
  Calendar, Award, AlertCircle, CheckCircle, BarChart3
} from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
         Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCandidatures } from '../hooks/useCandidatures'
import { DashboardSkeleton } from './Loading'

function Dashboard() {
  const { candidatures, loading } = useCandidatures()

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
    const aRelancer = candidatures.filter(c => {
      if (c.statut !== 'En attente') return false
      const dateCandidat = new Date(c.date_candidature)
      const dateActuelle = new Date()
      const diffJours = Math.floor((dateActuelle - dateCandidat) / (1000 * 60 * 60 * 24))
      return diffJours >= 7
    }).length

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
      aRelancer
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
        <p className="text-gray-400">
          Ajoutez des candidatures pour voir vos statistiques
        </p>
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

