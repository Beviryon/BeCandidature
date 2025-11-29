import { useState, useEffect } from 'react'
import { Bell, BellOff, X, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { getCandidatures } from '../services/candidaturesService'
import { DEMO_MODE, getDemoCandidatures } from '../demoData'
import { useNavigate } from 'react-router-dom'

function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [candidatures, setCandidatures] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    checkNotificationPermission()
    fetchCandidatures()
    
    // Vérifier les relances toutes les heures
    const interval = setInterval(checkForRelances, 3600000) // 1 heure
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (candidatures.length > 0) {
      checkForRelances()
    }
  }, [candidatures])

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }

  const requestNotificationPermission = async () => {
    try {
      // Vérifier si le navigateur supporte les notifications
      if (!('Notification' in window)) {
        alert('❌ Votre navigateur ne supporte pas les notifications desktop.\n\nLes notifications fonctionnent sur :\n- Chrome/Edge (Desktop & Android)\n- Firefox (Desktop & Android)\n- Safari (Desktop uniquement)')
        return
      }

      // Vérifier si on est en HTTPS (requis pour les notifications)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert('❌ Les notifications nécessitent une connexion HTTPS sécurisée.')
        return
      }

      console.log('🔔 Demande de permission pour les notifications...')
      
      const permission = await Notification.requestPermission()
      console.log('📋 Permission reçue:', permission)
      
      setNotificationsEnabled(permission === 'granted')
      
      if (permission === 'granted') {
        console.log('✅ Notifications activées avec succès')
        showNotification(
          '🎉 Notifications activées !',
          'Vous recevrez désormais des rappels pour vos relances.'
        )
      } else if (permission === 'denied') {
        alert('❌ Vous avez refusé les notifications.\n\nPour les activer :\n1. Cliquez sur le cadenas 🔒 dans la barre d\'adresse\n2. Autorisez les notifications\n3. Rechargez la page')
      } else {
        console.log('⚠️ Permission non accordée:', permission)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission:', error)
      alert(`❌ Erreur lors de l'activation des notifications.\n\nDétails: ${error.message}\n\nVérifiez les paramètres de votre navigateur.`)
    }
  }

  const fetchCandidatures = async () => {
    try {
      if (DEMO_MODE) {
        const demoCandidatures = getDemoCandidatures()
        setCandidatures(demoCandidatures)
        return
      }

      const data = await getCandidatures()
      setCandidatures(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const checkForRelances = () => {
    const now = new Date()
    const today = now.toDateString()
    
    // Éviter de créer des notifications en double
    const lastCheck = localStorage.getItem('lastNotificationCheck')
    if (lastCheck === today) return
    
    localStorage.setItem('lastNotificationCheck', today)

    const candidaturesARelancer = candidatures.filter(c => {
      // Ne relancer que les candidatures "En attente" ou "Entretien", PAS les "Refus"
      if (c.statut !== 'En attente' && c.statut !== 'Entretien') return false
      
      const dateRelance = new Date(c.date_relance)
      const dateCandidature = new Date(c.date_candidature)
      const diffJours = Math.floor((now - dateCandidature) / (1000 * 60 * 60 * 24))
      
      return diffJours >= 7 || dateRelance <= now
    })

    if (candidaturesARelancer.length > 0) {
      const newNotifications = candidaturesARelancer.map(c => ({
        id: `relance-${c.id}`,
        type: 'relance',
        title: `⚠️ Relance nécessaire`,
        message: `Il est temps de relancer ${c.entreprise} pour le poste de ${c.poste}`,
        timestamp: new Date(),
        candidatureId: c.id,
        read: false
      }))

      setNotifications(prev => [...newNotifications, ...prev])

      // Notification desktop
      if (notificationsEnabled) {
        showNotification(
          `${candidaturesARelancer.length} relance(s) à faire`,
          `Il est temps de relancer vos candidatures en attente !`
        )
      }
    }

    // Vérifier les entretiens à venir
    const entretiensProches = candidatures.filter(c => {
      if (c.statut !== 'Entretien') return false
      
      const dateRelance = new Date(c.date_relance)
      const diffJours = Math.floor((dateRelance - now) / (1000 * 60 * 60 * 24))
      
      return diffJours >= 0 && diffJours <= 2 // Entretiens dans les 2 prochains jours
    })

    if (entretiensProches.length > 0) {
      const newNotifications = entretiensProches.map(c => ({
        id: `entretien-${c.id}`,
        type: 'entretien',
        title: `🎯 Entretien proche`,
        message: `Entretien chez ${c.entreprise} bientôt !`,
        timestamp: new Date(),
        candidatureId: c.id,
        read: false
      }))

      setNotifications(prev => [...newNotifications, ...prev])
    }
  }

  const showNotification = (title, body) => {
    try {
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'becandidature',
          requireInteraction: false,
          silent: false
        })
        
        // Auto-fermer après 5 secondes
        setTimeout(() => notification.close(), 5000)
        
        console.log('✅ Notification affichée:', title)
      } else {
        console.log('⚠️ Notifications non activées ou non autorisées')
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage de la notification:', error)
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const goToCandidature = (candidatureId) => {
    navigate(`/modifier/${candidatureId}`)
    setIsOpen(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'relance':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'entretien':
        return <Clock className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300 border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-14 w-auto md:w-96 max-h-[80vh] md:max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-500/20 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Enable Notifications */}
              {!notificationsEnabled && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-all duration-300"
                >
                  <Bell className="w-4 h-4" />
                  <span>Activer les notifications</span>
                </button>
              )}

              {notificationsEnabled && (
                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Notifications activées</span>
                </div>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="mt-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Tout effacer
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellOff className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucune notification
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Vous serez notifié des relances à faire
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-purple-50/50 dark:bg-purple-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {new Date(notification.timestamp).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="flex items-center space-x-3 mt-3">
                            {notification.candidatureId && (
                              <button
                                onClick={() => goToCandidature(notification.candidatureId)}
                                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                              >
                                Voir la candidature →
                              </button>
                            )}
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                Marquer comme lu
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationCenter

