import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, Users, Link2, LogOut, Sparkles, Plus, Layers } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../firebaseConfig'
import { DEMO_MODE } from '../demoData'

function SchoolLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [schoolId, setSchoolId] = useState('')
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [className, setClassName] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [classDescription, setClassDescription] = useState('')
  const [creatingClass, setCreatingClass] = useState(false)
  const [classError, setClassError] = useState('')

  const isActive = (path) => location.pathname === path
  const navItems = [
    { path: '/ecole', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ecole/demandes', label: 'Demandes', icon: Link2 },
    { path: '/ecole/etudiants', label: 'Étudiants', icon: Users },
    { path: '/ecole/classes', label: 'Classes', icon: Layers }
  ]

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

  useEffect(() => {
    const loadSchoolContext = async () => {
      if (!auth.currentUser) return
      try {
        const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (userSnap.exists()) {
          setSchoolId(userSnap.data().schoolId || '')
        }
      } catch (error) {
        console.error('Erreur chargement contexte école:', error)
      }
    }
    loadSchoolContext()
  }, [])

  const openClassModal = () => {
    setClassError('')
    setIsClassModalOpen(true)
  }

  const closeClassModal = () => {
    setIsClassModalOpen(false)
    setClassError('')
    setClassName('')
    setClassLevel('')
    setAcademicYear('')
    setClassDescription('')
  }

  const handleCreateClass = async () => {
    if (!schoolId) {
      setClassError('Code école introuvable pour ce compte.')
      return
    }
    if (!className.trim()) {
      setClassError('Le nom de la classe est obligatoire.')
      return
    }

    try {
      setCreatingClass(true)
      setClassError('')
      await addDoc(collection(db, 'schools', schoolId, 'classes'), {
        name: className.trim(),
        level: classLevel.trim(),
        academicYear: academicYear.trim(),
        description: classDescription.trim(),
        normalizedName: className.trim().toLowerCase(),
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || null
      })
      closeClassModal()
    } catch (error) {
      console.error('Erreur création classe (layout):', error)
      setClassError("Impossible de créer la classe pour l'instant.")
    } finally {
      setCreatingClass(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex md:w-72 md:flex-col bg-white/80 dark:bg-black/40 backdrop-blur-xl border-r border-gray-200 dark:border-white/10">
          <div className="p-5 border-b border-gray-200 dark:border-white/10">
            <Link to="/ecole" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">Espace École</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Pilotage insertion étudiants</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-all ${
                    active
                      ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}

            <div className="pt-4 border-t border-gray-200 dark:border-white/10 mt-4 space-y-2">
              <button
                onClick={openClassModal}
                className="w-full px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                Créer une classe
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500/20 inline-flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-40">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center md:hidden">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Portail Établissement</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Vue école dédiée</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="md:hidden px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500/20 inline-flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
              <button
                onClick={openClassModal}
                className="md:hidden px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 inline-flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Créer une classe
              </button>
            </div>

            <div className="md:hidden px-4 pb-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1 border ${
                        active
                          ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                          : 'bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-white/10'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </header>

          <main className="flex-grow px-4 py-6">
            <Outlet />
          </main>

          <footer className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 py-4 px-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span>BeCandidature - Espace École</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Pilotage
            </span>
          </footer>
        </div>
      </div>

      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-indigo-500/30 shadow-2xl p-5">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Créer une classe</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Renseignez les informations de la classe pour organiser vos étudiants.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="Nom de la classe (ex: BTS SIO 1A)"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/70 dark:bg-white/5 text-gray-900 dark:text-white"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={classLevel}
                  onChange={(event) => setClassLevel(event.target.value)}
                  placeholder="Niveau (ex: Bac+2)"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/70 dark:bg-white/5 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={academicYear}
                  onChange={(event) => setAcademicYear(event.target.value)}
                  placeholder="Année scolaire (ex: 2026-2027)"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/70 dark:bg-white/5 text-gray-900 dark:text-white"
                />
              </div>
              <textarea
                value={classDescription}
                onChange={(event) => setClassDescription(event.target.value)}
                rows={3}
                placeholder="Description (optionnel)"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/70 dark:bg-white/5 text-gray-900 dark:text-white resize-none"
              />
              {classError && (
                <p className="text-xs text-red-600 dark:text-red-300">{classError}</p>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleCreateClass}
                disabled={creatingClass}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium disabled:opacity-60"
              >
                {creatingClass ? 'Création...' : 'Créer la classe'}
              </button>
              <button
                onClick={closeClassModal}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchoolLayout
