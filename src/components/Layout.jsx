import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Plus, List, BarChart3, Calendar, Bot, Search, Sparkles, FileText, Mail, MessageSquare, Linkedin, Menu, X, Moon, Sun } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { DEMO_MODE } from '../demoData'
import { useTheme } from '../hooks/useTheme'
import NotificationCenter from './NotificationCenter'
import { useState } from 'react'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

            {/* Navigation */}
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

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-purple-500/20 z-40 overflow-hidden">
                      <Link
                        to="/cv"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 transition-all duration-300 ${
                          isActive('/cv')
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Générateur CV</span>
                      </Link>
                      <Link
                        to="/import-email"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 transition-all duration-300 ${
                          isActive('/import-email')
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Import Email</span>
                      </Link>
                      <Link
                        to="/templates"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 transition-all duration-300 ${
                          isActive('/templates')
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Templates</span>
                      </Link>
                      <Link
                        to="/linkedin"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 transition-all duration-300 ${
                          isActive('/linkedin')
                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </Link>
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

          {/* Mobile navigation */}
          <nav className="md:hidden grid grid-cols-3 gap-2 mt-4">
            <Link
              to="/"
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
              to="/templates"
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
