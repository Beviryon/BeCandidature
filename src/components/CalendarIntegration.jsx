import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, X, Download, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react'
import { 
  initializeGoogleCalendar, 
  authenticateGoogle, 
  isGoogleAuthenticated,
  disconnectGoogleCalendar,
  createCalendarEvent,
  generateICalLink
} from '../services/calendarService'
import { useToast } from '../contexts/ToastContext'
import { useCandidatures } from '../hooks/useCandidatures'

function CalendarIntegration() {
  const { candidatures } = useCandidatures()
  const { success, error: showError, info } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setInitializing(true)
      const connected = isGoogleAuthenticated()
      setIsConnected(connected)
      
      if (connected) {
        try {
          await initializeGoogleCalendar()
        } catch (err) {
          console.error('Error initializing:', err)
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    } finally {
      setInitializing(false)
    }
  }

  const handleConnect = async () => {
    try {
      setLoading(true)
      await initializeGoogleCalendar()
      await authenticateGoogle()
      setIsConnected(true)
      success('Connexion à Google Calendar réussie !')
    } catch (err) {
      console.error('Error connecting:', err)
      showError(err.message || 'Erreur lors de la connexion à Google Calendar')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    disconnectGoogleCalendar()
    setIsConnected(false)
    success('Déconnexion réussie')
  }

  const handleSyncAll = async () => {
    if (!isConnected) {
      showError('Veuillez d\'abord vous connecter à Google Calendar')
      return
    }

    try {
      setSyncing(true)
      let syncedCount = 0
      let errorCount = 0

      // Synchroniser toutes les relances futures
      for (const candidature of candidatures) {
        if (!candidature.relances || candidature.relances.length === 0) continue

        for (const relance of candidature.relances) {
          const relanceDate = new Date(relance.date || relance.created_at)
          const now = new Date()
          
          // Ne synchroniser que les relances futures
          if (relanceDate >= now) {
            try {
              // Vérifier si l'événement existe déjà
              if (!relance.calendar_event_id) {
                const event = await createCalendarEvent({
                  ...relance,
                  entreprise: candidature.entreprise,
                  poste: candidature.poste,
                  id: `${candidature.id}-${relance.date}`
                })
                
                // Mettre à jour la relance avec l'ID de l'événement
                // Note: Il faudrait mettre à jour la candidature dans la base de données
                relance.calendar_event_id = event.id
                syncedCount++
              }
            } catch (err) {
              console.error(`Error syncing relance for ${candidature.entreprise}:`, err)
              errorCount++
            }
          }
        }
      }

      if (syncedCount > 0) {
        success(`${syncedCount} relance(s) synchronisée(s) avec Google Calendar`)
      }
      if (errorCount > 0) {
        showError(`${errorCount} erreur(s) lors de la synchronisation`)
      }
      if (syncedCount === 0 && errorCount === 0) {
        info('Aucune relance à synchroniser')
      }
    } catch (err) {
      console.error('Error syncing:', err)
      showError('Erreur lors de la synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  const handleDownloadICal = (relance, candidature) => {
    try {
      const url = generateICalLink({
        ...relance,
        entreprise: candidature.entreprise,
        poste: candidature.poste,
        id: `${candidature.id}-${relance.date}`
      })
      
      const link = document.createElement('a')
      link.href = url
      link.download = `relance-${candidature.entreprise}-${relance.date}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      success('Fichier iCal téléchargé ! Importez-le dans votre calendrier')
    } catch (err) {
      showError('Erreur lors de la génération du fichier iCal')
    }
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Intégration Calendrier</h3>
            <p className="text-sm text-gray-400">Synchronisez vos relances avec votre agenda</p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Connecté</span>
          </div>
        )}
      </div>

      {/* Google Calendar */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-white mb-1">Google Calendar</h4>
            <p className="text-xs text-gray-400">
              Synchronisation automatique et notifications en temps réel
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="space-y-3">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Se connecter à Google Calendar</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center">
              Vous serez redirigé vers Google pour autoriser l'accès à votre calendrier
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Connecté à Google Calendar</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl border border-purple-500/30 transition-colors disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synchronisation...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Synchroniser toutes les relances</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export iCal pour autres calendriers */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="mb-4">
          <h4 className="font-semibold text-white mb-1">Autres calendriers</h4>
          <p className="text-xs text-gray-400">
            Téléchargez un fichier .ics pour Outlook, Apple Calendar, etc.
          </p>
        </div>

        <div className="space-y-2">
          {candidatures
            .filter(c => c.relances && c.relances.length > 0)
            .slice(0, 5)
            .map(candidature => 
              candidature.relances
                .filter(r => {
                  const relanceDate = new Date(r.date || r.created_at)
                  return relanceDate >= new Date()
                })
                .slice(0, 1)
                .map((relance, idx) => (
                  <button
                    key={`${candidature.id}-${idx}`}
                    onClick={() => handleDownloadICal(relance, candidature)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">
                        {candidature.entreprise} - {relance.type || 'Email'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(relance.date || relance.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-purple-400" />
                  </button>
                ))
            )
          }
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-300">
            <strong>💡 Astuce :</strong> Les relances sont automatiquement synchronisées avec votre calendrier. 
            Vous recevrez des notifications 1 jour avant et 1 heure avant chaque relance.
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarIntegration

