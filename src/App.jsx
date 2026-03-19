import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebaseConfig'
import { DEMO_MODE } from './demoData'
import { migrateLocalStorageToFirestore } from './utils/migrateLocalStorage'
import OnboardingTour from './components/OnboardingTour'
import Login from './components/Login'
import Register from './components/Register'
import PendingApproval from './components/PendingApproval'
import StatusModal from './components/StatusModal'
import AdminDashboard from './components/AdminDashboard'
import ListeCandidatures from './components/ListeCandidatures'
import AjouterCandidature from './components/AjouterCandidature'
import ModifierCandidature from './components/ModifierCandidature'
import Dashboard from './components/Dashboard'
import Calendrier from './components/Calendrier'
import CVGenerator from './components/CVGenerator'
import AssistantIA from './components/AssistantIA'
import InterviewSimulator from './components/InterviewSimulator'
import EmailImport from './components/EmailImport'
import ExcelImport from './components/ExcelImport'
import JobScanner from './components/JobScanner'
import Templates from './components/Templates'
import LinkedInIntegration from './components/LinkedInIntegration'
import CandidatureDetail from './components/CandidatureDetail'
import CalendarIntegration from './components/CalendarIntegration'
import Layout from './components/Layout'

function App() {
  const [session, setSession] = useState(null)
  const [userStatus, setUserStatus] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [suspensionReason, setSuspensionReason] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Vérifier d'abord la session DÉMO
    if (DEMO_MODE) {
      const demoSession = localStorage.getItem('demo_session')
      if (demoSession) {
        setSession(JSON.parse(demoSession))
        setUserStatus('active') // Demo toujours actif
        setUserRole('user')
        setLoading(false)
        return
      }
    }

    // Écouter les changements d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Charger le statut de l'utilisateur depuis Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Si pas de statut, c'est un ancien utilisateur → considéré comme actif
            setUserStatus(userData.status || 'active')
            setUserRole(userData.role || 'user')
            setSuspensionReason(userData.suspendedReason || null)
            
            // Afficher le modal si suspendu ou rejeté
            if (userData.status === 'suspended' || userData.status === 'rejected') {
              setShowStatusModal(true)
            }
          } else {
            // Si pas de document, créer un pour l'ancien utilisateur (considéré comme actif)
            console.log('📝 Création du document Firestore pour ancien utilisateur:', user.email)
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              status: 'active', // Ancien utilisateur = automatiquement actif
              role: 'user',
              createdAt: serverTimestamp(),
              migratedAt: serverTimestamp() // Pour savoir que c'est un ancien utilisateur migré
            })
            setUserStatus('active')
            setUserRole('user')
          }
          
          // Migration automatique des données localStorage → Firestore
          if (!DEMO_MODE) {
            try {
              const migrationResult = await migrateLocalStorageToFirestore()
              if (migrationResult.success && migrationResult.count > 0) {
                console.log(`✅ ${migrationResult.count} candidatures migrées depuis localStorage`);
              }
            } catch (migrationError) {
              console.error('❌ Erreur migration:', migrationError);
              // Ne pas bloquer l'utilisateur si la migration échoue
            }
          }
          
          // Vérifier si c'est la première connexion pour afficher l'onboarding
          const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${user.uid}`)
          if (!hasSeenOnboarding) {
            setShowOnboarding(true)
          }
        } catch (error) {
          console.error('Erreur chargement statut:', error)
          // En cas d'erreur, considérer comme actif pour ne pas bloquer les anciens utilisateurs
          setUserStatus('active')
          setUserRole('user')
        }
      }
      setSession(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleOnboardingComplete = () => {
    if (session) {
      localStorage.setItem(`onboarding_seen_${session.uid}`, 'true')
      setShowOnboarding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Onboarding Tour - S'affiche uniquement à la première connexion */}
      {showOnboarding && session && userStatus === 'active' && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      
      {/* Modal de statut (suspendu, rejeté) */}
      {showStatusModal && (userStatus === 'suspended' || userStatus === 'rejected') && (
        <StatusModal 
          status={userStatus} 
          reason={suspensionReason}
          onClose={() => setShowStatusModal(false)} 
        />
      )}
      
      <Routes>
        {!session ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : userStatus === 'pending' ? (
          <>
            {/* Utilisateur en attente d'approbation */}
            <Route path="*" element={<PendingApproval />} />
          </>
        ) : userStatus === 'suspended' || userStatus === 'rejected' ? (
          <>
            {/* Compte suspendu ou rejeté - Affichage du modal + page de connexion */}
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <>
            {/* Utilisateur actif */}
            {userRole === 'admin' && (
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            )}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/candidatures" element={<ListeCandidatures />} />
              <Route path="/candidatures/:id" element={<CandidatureDetail />} />
              <Route path="/calendrier" element={<Calendrier />} />
              <Route path="/calendrier/integration" element={<CalendarIntegration />} />
              <Route path="/cv" element={<CVGenerator />} />
              <Route path="/assistant" element={<AssistantIA />} />
              <Route path="/simulateur" element={<InterviewSimulator />} />
              <Route path="/import-email" element={<EmailImport />} />
              <Route path="/import-excel" element={<ExcelImport />} />
              <Route path="/scan-offres" element={<JobScanner />} />
              <Route path="/ajouter" element={<AjouterCandidature />} />
              <Route path="/modifier/:id" element={<ModifierCandidature />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/linkedin" element={<LinkedInIntegration />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App

