import { Clock, Mail, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { useNavigate } from 'react-router-dom'

function PendingApproval() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-purple-500/30">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center gradient-text mb-4">
            Compte en attente
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-700 dark:text-gray-300 text-center">
              Merci pour votre inscription ! 🎉
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Votre compte est actuellement <strong className="text-yellow-600 dark:text-yellow-400">en cours de validation</strong> par notre équipe.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-semibold mb-1">Vous recevrez un email</p>
                  <p>Dès que votre compte sera approuvé, vous recevrez une notification par email et pourrez accéder à toutes les fonctionnalités.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Délai estimé */}
          <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              ⏱️ <strong>Délai de validation :</strong> généralement sous 24-48h
            </p>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-all duration-300 border border-red-500/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Besoin d'aide ? Contactez-nous à{' '}
            <a href="mailto:becandidature@gmail.com" className="text-purple-600 dark:text-purple-400 hover:underline">
              becandidature@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PendingApproval

