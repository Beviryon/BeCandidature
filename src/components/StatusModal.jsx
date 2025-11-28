import { useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { AlertCircle, XCircle, Clock, X } from 'lucide-react'

function StatusModal({ status, reason, onClose }) {
  useEffect(() => {
    // Empêcher le scroll du body quand le modal est ouvert
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    onClose()
  }

  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-400" />,
          title: '⏳ Compte en attente d\'approbation',
          message: 'Votre compte est en cours de vérification par notre équipe. Vous recevrez un email dès que votre compte sera activé.',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400'
        }
      case 'suspended':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400" />,
          title: '🔒 Compte suspendu',
          message: reason 
            ? `Votre compte a été suspendu. Raison : ${reason}` 
            : 'Votre compte a été temporairement suspendu.',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          extra: 'Pour plus d\'informations ou pour contester cette décision, contactez-nous à becandidature@gmail.com'
        }
      case 'rejected':
        return {
          icon: <XCircle className="w-16 h-16 text-gray-400" />,
          title: '❌ Compte rejeté',
          message: 'Votre demande de compte a été rejetée. Vous ne pouvez pas accéder à l\'application.',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          extra: 'Pour plus d\'informations, contactez-nous à becandidature@gmail.com'
        }
      default:
        return null
    }
  }

  const content = getStatusContent()
  if (!content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-300 dark:border-purple-500/30 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${content.bgColor} border ${content.borderColor} mb-6`}>
            {content.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {content.title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {content.message}
          </p>

          {/* Extra info */}
          {content.extra && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 italic">
              {content.extra}
            </p>
          )}

          {/* Action button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

export default StatusModal

