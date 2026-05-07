import { Link } from 'react-router-dom'
import { GraduationCap, Building2, Sparkles, ArrowRight } from 'lucide-react'

function RegisterTypeChoice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-4xl animate-scale-in">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-purple-500/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 neon-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">BeCandidature</h1>
            <p className="text-gray-400">Choisissez votre type d&apos;inscription</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/register/etudiant"
              className="group rounded-2xl p-6 bg-white/70 dark:bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <GraduationCap className="w-8 h-8 text-purple-500" />
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Inscription Étudiant</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Créez votre compte personnel pour suivre vos candidatures et relances.
              </p>
            </Link>

            <Link
              to="/register/ecole"
              className="group rounded-2xl p-6 bg-white/70 dark:bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <Building2 className="w-8 h-8 text-indigo-500" />
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Inscription École</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ouvrez un compte établissement pour suivre l&apos;activité et l&apos;insertion de vos étudiants.
              </p>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterTypeChoice
