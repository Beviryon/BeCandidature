import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Plus, List, BarChart3, Calendar, Bot, Search, Sparkles, FileText, Mail, MessageSquare, Linkedin, Menu, X, Moon, Sun, Shield, FileSpreadsheet } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { DEMO_MODE } from '../demoData'
import { useTheme } from '../hooks/useTheme'
import NotificationCenter from './NotificationCenter'
import { useState, useEffect } from 'react'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [userRole, setUserRole] = useState('user')

  useEffect(() => {
    const loadUserRole = async () => {
      if (!DEMO_MODE && auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user')
          }
        } catch (error) {
          console.error('Erreur chargement rôle:', error)
        }
      }
    }
    loadUserRole()
  }, [])

  const handleLogout = async () => {
    if (DEMO_MODE) {
      localStorage.removeItem('demo_session')
      navigate('/login')
      window.location.reload()
      return
    }
    await signOut(auth)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 neon-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">BeCandidature</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Suivi intelligent</p>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-2 mr-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/candidatures"
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  isActive('/candidatures')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Liste</span>
              </Link>
              <Link
                to="/calendrier"
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  isActive('/calendrier')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendrier</span>
              </Link>
              <Link
                to="/assistant"
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  isActive('/assistant')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Assistant</span>
              </Link>
              <Link
                to="/scan-offres"
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  isActive('/scan-offres')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Offres</span>
              </Link>

              {/* Menu Burger */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-300 dark:border-white/10"
                >
                  {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  <span>Plus</span>
                </button>

                {/* Dropdown Menu - Modern Grid */}
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-500/20 z-40 p-4 backdrop-blur-xl">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                        Plus d&apos;options
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          to="/cv"
                          onClick={() => setIsMenuOpen(false)}
                          className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            isActive('/cv')
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-md'
                          }`}
                        >
                          <FileText className={`w-8 h-8 mb-2 ${isActive('/cv') ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                          <span className="text-sm font-semibold text-center">CV</span>
                        </Link>
                        <Link
                          to="/import-email"
                          onClick={() => setIsMenuOpen(false)}
                          className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            isActive('/import-email')
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'
                          }`}
                        >
                          <Mail className={`w-8 h-8 mb-2 ${isActive('/import-email') ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                          <span className="text-sm font-semibold text-center">Email</span>
                        </Link>
                        <Link
                          to="/import-excel"
                          onClick={() => setIsMenuOpen(false)}
                          className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            isActive('/import-excel')
                              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md'
                          }`}
                        >
                          <FileSpreadsheet className={`w-8 h-8 mb-2 ${isActive('/import-excel') ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                          <span className="text-sm font-semibold text-center">Excel</span>
                        </Link>
                        <Link
                          to="/templates"
                          onClick={() => setIsMenuOpen(false)}
                          className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            isActive('/templates')
                              ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:shadow-md'
                          }`}
                        >
                          <Sparkles className={`w-8 h-8 mb-2 ${isActive('/templates') ? 'text-white' : 'text-pink-600 dark:text-pink-400'}`} />
                          <span className="text-sm font-semibold text-center">Templates</span>
                        </Link>
                        <Link
                          to="/linkedin"
                          onClick={() => setIsMenuOpen(false)}
                          className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            isActive('/linkedin')
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'
                          }`}
                        >
                          <Linkedin className={`w-8 h-8 mb-2 ${isActive('/linkedin') ? 'text-white' : 'text-blue-700 dark:text-blue-400'}`} />
                          <span className="text-sm font-semibold text-center">LinkedIn</span>
                        </Link>
                        
                        {/* Lien Admin (uniquement pour les admins) */}
                        {userRole === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className={`group col-span-2 flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                              isActive('/admin')
                                ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 border-red-500'
                                : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 text-red-700 dark:text-red-400 hover:from-red-500/20 hover:to-orange-500/20 hover:shadow-md border-red-500/30'
                            }`}
                          >
                            <Shield className={`w-8 h-8 mb-2 ${isActive('/admin') ? 'text-white' : 'text-red-600 dark:text-red-400'}`} />
                            <span className="text-sm font-semibold text-center">🔐 Admin Dashboard</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationCenter />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-medium transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Mobile navigation - Dropdown Menu */}
          {isMobileNavOpen && (
            <>
              {/* Overlay */}
              <div
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
                onClick={() => setIsMobileNavOpen(false)}
              />
              {/* Dropdown Menu */}
              <div className="md:hidden fixed top-20 left-4 right-4 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-slide-down">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Navigation</h3>
                    <button
                      onClick={() => setIsMobileNavOpen(false)}
                      className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <nav className="grid grid-cols-3 gap-3 pb-2">
            <Link
              to="/"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-1" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/candidatures"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/candidatures')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <List className="w-4 h-4 mb-1" />
              <span>Liste</span>
            </Link>
            <Link
              to="/calendrier"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/calendrier')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4 mb-1" />
              <span>Calendrier</span>
            </Link>
            <Link
              to="/cv"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/cv')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 mb-1" />
              <span>CV</span>
            </Link>
            <Link
              to="/assistant"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/assistant')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Bot className="w-4 h-4 mb-1" />
              <span>Assistant</span>
            </Link>
            <Link
              to="/scan-offres"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/scan-offres')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4 mb-1" />
              <span>Offres</span>
            </Link>
            <Link
              to="/import-email"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/import-email')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Mail className="w-4 h-4 mb-1" />
              <span>Email</span>
            </Link>
            <Link
              to="/import-excel"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/import-excel')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mb-1" />
              <span>Excel</span>
            </Link>
            <Link
              to="/templates"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/templates')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4 mb-1" />
              <span>Templates</span>
            </Link>
            <Link
              to="/linkedin"
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/linkedin')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-white border border-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Linkedin className="w-4 h-4 mb-1" />
              <span>LinkedIn</span>
            </Link>
                  </nav>
                </div>
              </div>
            </>
          )}

          {/* FAB - Bouton Burger flottant (mobile uniquement) */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden fixed top-[100px] right-3 z-30 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center transform hover:scale-110 transition-all duration-300 neon-glow"
            aria-label="Navigation"
          >
            {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; 2025 BeCandidature - Suivi de candidatures d&apos;alternance
            </p>
            {DEMO_MODE && (
              <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                <Sparkles className="w-3 h-3" />
                <span>Mode Démo</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Floating Add Button */}
      <Link
        to="/ajouter"
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 z-50 neon-glow"
      >
        <Plus className="w-8 h-8 text-white" />
      </Link>
    </div>
  )
}

export default Layout
