import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import { getCandidatures } from '../services/candidaturesService'
import { DEMO_MODE, getDemoCandidatures } from '../demoData'
import { useNavigate } from 'react-router-dom'

function Calendrier() {
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()

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

  // Obtenir la couleur selon le statut
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Entretien':
        return 'bg-green-500'
      case 'En attente':
        return 'bg-orange-500'
      case 'Refus':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate])
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
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

