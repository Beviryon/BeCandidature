import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react'
import { getCandidatures, updateCandidature } from '../services/candidaturesService'
import { DEMO_MODE, getDemoCandidatures } from '../demoData'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'

function Calendrier() {
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchCandidatures()
  }, [])

  const fetchCandidatures = async () => {
    try {
      setLoading(true)
      
      if (DEMO_MODE) {
        const demoCandidatures = getDemoCandidatures()
        setCandidatures(demoCandidatures)
        setLoading(false)
        return
      }

      const data = await getCandidatures()
      setCandidatures(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Obtenir les jours du mois
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Jours du mois précédent
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Obtenir les candidatures pour une date donnée
  const getCandidaturesForDate = (date) => {
    if (!date) return []
    
    return candidatures.filter(c => {
      const relanceDate = new Date(c.date_relance)
      return (
        relanceDate.getDate() === date.getDate() &&
        relanceDate.getMonth() === date.getMonth() &&
        relanceDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Vérifier si une candidature doit être relancée
  const shouldRelancer = (candidature) => {
    if (candidature.statut !== 'En attente') return false
    const dateCandidat = new Date(candidature.date_candidature)
    const dateActuelle = new Date()
    const diffJours = Math.floor((dateActuelle - dateCandidat) / (1000 * 60 * 60 * 24))
    return diffJours >= 7
  }

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate])
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  const next7DaysRelances = useMemo(() => {
    const now = new Date()
    const end = new Date()
    end.setDate(now.getDate() + 7)

    return candidatures
      .map((c) => ({
        ...c,
        relanceDateObj: c.date_relance ? new Date(c.date_relance) : null
      }))
      .filter((c) => c.relanceDateObj && c.relanceDateObj >= now && c.relanceDateObj <= end)
      .sort((a, b) => a.relanceDateObj - b.relanceDateObj)
      .slice(0, 6)
  }, [candidatures])

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const applyQuickAction = async (candidature, daysToAdd, actionLabel) => {
    try {
      const nextRelance = new Date()
      nextRelance.setDate(nextRelance.getDate() + daysToAdd)
      const nextRelanceDate = nextRelance.toISOString().split('T')[0]

      const existingRelances = Array.isArray(candidature.relances) ? candidature.relances : []
      const updatedRelances = [
        {
          type: actionLabel,
          date: new Date().toISOString().split('T')[0],
          note: actionLabel,
          created_at: new Date().toISOString()
        },
        ...existingRelances
      ]

      if (DEMO_MODE) {
        setCandidatures((prev) =>
          prev.map((c) =>
            c.id === candidature.id
              ? { ...c, date_relance: nextRelanceDate, relances: updatedRelances, updated_at: new Date().toISOString() }
              : c
          )
        )
      } else {
        await updateCandidature(candidature.id, {
          date_relance: nextRelanceDate,
          relances: updatedRelances
        })
        await fetchCandidatures()
      }

      success(`${actionLabel} enregistree. Prochaine relance: ${nextRelance.toLocaleDateString('fr-FR')}`)
    } catch (err) {
      console.error(err)
      showError('Impossible de mettre a jour cette relance.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            📅 Calendrier de Relances
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Visualisez vos relances à venir
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={previousMonth}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-medium transition-all duration-300 border border-purple-500/30"
          >
            Aujourd&apos;hui
          </button>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prochains jours */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Prochaines relances (7 jours)
          </h3>
          <button
            onClick={goToToday}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
          >
            Revenir a aujourd&apos;hui
          </button>
        </div>

        {next7DaysRelances.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Aucune relance planifiee dans les 7 prochains jours.
          </div>
        ) : (
          <div className="space-y-2">
            {next7DaysRelances.map((item) => (
              <div
                key={item.id}
                className="w-full text-left p-3 rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{item.entreprise}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.poste}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                    <span>
                      {item.relanceDateObj?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/candidatures/${item.id}`)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 transition-colors"
                  >
                    Voir detail
                  </button>
                  <button
                    onClick={() => applyQuickAction(item, 7, 'Relance faite')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-700 dark:text-green-300 border border-green-500/30 transition-colors inline-flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Marquer relance faite
                  </button>
                  <button
                    onClick={() => applyQuickAction(item, 3, 'Relance replanifiee')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition-colors inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Replanifier +3j
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendrier */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        {/* Titre du mois */}
        <div className="flex items-center justify-center mb-6">
          <CalendarIcon className="w-5 h-5 mr-2 text-purple-500" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
            {monthName}
          </h3>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const candidaturesOfDay = day ? getCandidaturesForDate(day) : []
            const isToday = day && 
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 rounded-xl border transition-all duration-300 ${
                  day
                    ? isToday
                      ? 'bg-purple-500/10 border-purple-500/50 dark:bg-purple-500/20'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-purple-500/30 dark:hover:border-purple-500/30'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Candidatures du jour */}
                    <div className="space-y-1">
                      {candidaturesOfDay.map(candidature => (
                        <button
                          key={candidature.id}
                          onClick={() => navigate(`/modifier/${candidature.id}`)}
                          className={`w-full text-left p-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 ${
                            candidature.statut === 'Entretien'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30'
                              : candidature.statut === 'En attente'
                              ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 hover:bg-orange-500/30'
                              : 'bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-500/30'
                          }`}
                        >
                          <div className="flex items-center space-x-1">
                            {shouldRelancer(candidature) && (
                              <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            )}
                            <span className="truncate">{candidature.entreprise}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Légende</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Entretien prévu</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">En attente de réponse</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Refus reçu</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendrier

