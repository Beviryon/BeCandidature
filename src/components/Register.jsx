import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, UserPlus, Sparkles, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCw, Check, X } from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { sendWelcomeEmail, sendAdminNotification } from '../services/emailService'
import { handleFirebaseError } from '../utils/firebaseErrors'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  // Fonction pour générer un mot de passe sécurisé
  const generatePassword = () => {
    const length = 16
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    let newPassword = ''
    
    // Assurer au moins un caractère de chaque type
    newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    newPassword += '0123456789'[Math.floor(Math.random() * 10)]
    newPassword += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Remplir le reste
    for (let i = 4; i < length; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Mélanger
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')
    
    setPassword(newPassword)
    setConfirmPassword(newPassword)
  }

  // Vérifier la force du mot de passe
  const checkPasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)
    }
    
    const passedChecks = Object.values(checks).filter(Boolean).length
    
    return {
      checks,
      strength: passedChecks <= 2 ? 'Faible' : passedChecks <= 3 ? 'Moyen' : passedChecks <= 4 ? 'Bon' : 'Excellent',
      color: passedChecks <= 2 ? 'red' : passedChecks <= 3 ? 'orange' : passedChecks <= 4 ? 'yellow' : 'green',
      percentage: (passedChecks / 5) * 100
    }
  }

  const passwordStrength = password ? checkPasswordStrength(password) : null

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('❌ Les mots de passe ne correspondent pas. Veuillez vérifier.')
      return
    }

    if (password.length < 8) {
      setError('❌ Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    const strength = checkPasswordStrength(password)
    if (!strength.checks.uppercase) {
      setError('❌ Le mot de passe doit contenir au moins une majuscule.')
      return
    }
    if (!strength.checks.lowercase) {
      setError('❌ Le mot de passe doit contenir au moins une minuscule.')
      return
    }
    if (!strength.checks.number) {
      setError('❌ Le mot de passe doit contenir au moins un chiffre.')
      return
    }
    if (!strength.checks.special) {
      setError('❌ Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*).')
      return
    }

    setLoading(true)

    try {
      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Créer le document utilisateur dans Firestore avec statut "pending"
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        status: 'pending', // En attente d'approbation
        role: 'user',
        createdAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null
      })
      
      // Envoyer l'email de bienvenue à l'utilisateur
      await sendWelcomeEmail({
        name: user.email.split('@')[0], // Utilise la partie avant @ comme nom
        email: user.email
      })
      
      // Envoyer une notification à l'admin
      await sendAdminNotification({
        name: user.email.split('@')[0],
        email: user.email
      })
      
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
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
            <p className="text-gray-400">Créez votre compte</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 animate-fade-in">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-300">
                  <div className="font-semibold mb-1">✅ Inscription réussie !</div>
                  <div className="text-xs">Votre compte est en attente d'approbation. Vous recevrez un email de confirmation.</div>
                </div>
              </div>
            </div>
          )}

          {/* Register form */}
          <form onSubmit={handleRegister} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  title="Générer un mot de passe sécurisé"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Générer</span>
                </button>
              </div>
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
              
              {/* Indicateur de force du mot de passe */}
              {password && passwordStrength && (
                <div className="space-y-2">
                  {/* Barre de progression */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'orange' ? 'bg-orange-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color === 'red' ? 'text-red-400' :
                      passwordStrength.color === 'orange' ? 'text-orange-400' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  
                  {/* Critères de sécurité */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center space-x-1 ${passwordStrength.checks.length ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>8+ caractères</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordStrength.checks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Majuscule</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordStrength.checks.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Minuscule</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordStrength.checks.number ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Chiffre</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordStrength.checks.special ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Spécial (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300" htmlFor="confirmPassword">
                Confirmer le mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  <span>Inscription...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>S'inscrire</span>
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
              >
                Se connecter
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

export default Register
