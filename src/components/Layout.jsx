import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Plus, List, Sparkles, BarChart3, MessageSquare, Linkedin } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { DEMO_MODE } from '../demoData'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="glass-dark border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 neon-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">BeCandidature</h1>
                <p className="text-xs text-gray-400">Suivi intelligent</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/candidatures"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/candidatures')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Candidatures</span>
              </Link>
              <Link
                to="/templates"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/templates')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Templates</span>
              </Link>
              <Link
                to="/linkedin"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/linkedin')
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </Link>
            </nav>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-medium transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="md:hidden grid grid-cols-4 gap-2 mt-4">
            <Link
              to="/"
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-1" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/candidatures"
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/candidatures')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <List className="w-4 h-4 mb-1" />
              <span>Liste</span>
            </Link>
            <Link
              to="/templates"
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/templates')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4 mb-1" />
              <span>Templates</span>
            </Link>
            <Link
              to="/linkedin"
              className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                isActive('/linkedin')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
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
      <footer className="glass-dark border-t border-white/10 py-6 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; 2025 BeCandidature - Suivi de candidatures d'alternance
            </p>
            {DEMO_MODE && (
              <div className="flex items-center space-x-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
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
