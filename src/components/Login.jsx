import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { DEMO_MODE, DEMO_USER } from '../demoData'
import { handleFirebaseError } from '../utils/firebaseErrors'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Mode DÉMO
      if (DEMO_MODE && email === DEMO_USER.email && password === DEMO_USER.password) {
        localStorage.setItem('demo_session', JSON.stringify({
          user: { id: DEMO_USER.id, email: DEMO_USER.email },
          access_token: 'demo-token'
        }))
        setTimeout(() => {
          navigate('/')
          window.location.reload()
        }, 500)
        return
      }

      // Mode Firebase normal
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (error) {
      setError(handleFirebaseError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Glass card */}
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-purple-500/30">
          {/* Logo section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 neon-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              BeCandidature
            </h1>
            <p className="text-gray-400">Gérez vos candidatures intelligemment</p>
          </div>

          {/* Demo mode indicator */}
          {DEMO_MODE && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 animate-fade-in">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-300 mb-2">Mode Démo Activé</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div><span className="text-blue-400 font-medium">Email:</span> {DEMO_USER.email}</div>
                    <div><span className="text-blue-400 font-medium">Mot de passe:</span> {DEMO_USER.password}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-300"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 
                       hover:from-purple-600 hover:to-pink-600
                       text-white font-semibold rounded-xl
                       transform transition-all duration-300 
                       hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10 -top-4 -left-4 w-24 h-24 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -z-10 -bottom-4 -right-4 w-24 h-24 bg-pink-500 rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Login
