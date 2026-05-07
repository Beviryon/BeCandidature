import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebaseConfig'
import { DEMO_MODE } from './demoData'
import { migrateLocalStorageToFirestore } from './utils/migrateLocalStorage'
import OnboardingTour from './components/OnboardingTour'
import Login from './components/Login'
import Register from './components/Register'
import RegisterTypeChoice from './components/RegisterTypeChoice'
import RegisterSchool from './components/RegisterSchool'
import SchoolOffers from './components/SchoolOffers'
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
import SchoolLinkRequest from './components/SchoolLinkRequest'
import StudentProfile from './components/StudentProfile'
import EmailImport from './components/EmailImport'
import ExcelImport from './components/ExcelImport'
import JobScanner from './components/JobScanner'
import Templates from './components/Templates'
import LinkedInIntegration from './components/LinkedInIntegration'
import CandidatureDetail from './components/CandidatureDetail'
import CalendarIntegration from './components/CalendarIntegration'
import Layout from './components/Layout'
import SchoolLayout from './components/SchoolLayout'
import SchoolDashboard from './components/SchoolDashboard'
import SchoolRequests from './components/SchoolRequests'
import SchoolStudents from './components/SchoolStudents'
import SchoolClasses from './components/SchoolClasses'
import SchoolStudentDetail from './components/SchoolStudentDetail'

function App() {
  const [session, setSession] = useState(null)
  const [userStatus, setUserStatus] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userAccountType, setUserAccountType] = useState('student')
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
        setUserAccountType('student')
        setLoading(false)
        return
      }
    }

    // Écouter les changements d'authentification Firebase
    let unsubscribeUserDoc = null
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
            setUserAccountType(userData.accountType || 'student')
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
            setUserAccountType('student')
          }

          // Garder le statut synchronisé en temps réel (ex: approbation admin)
          unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (!snapshot.exists()) return
            const liveUserData = snapshot.data()
            setUserStatus(liveUserData.status || 'active')
            setUserRole(liveUserData.role || 'user')
            setUserAccountType(liveUserData.accountType || 'student')
            setSuspensionReason(liveUserData.suspendedReason || null)
            if (liveUserData.status === 'suspended' || liveUserData.status === 'rejected') {
              setShowStatusModal(true)
            } else {
              setShowStatusModal(false)
            }
          })
          
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
          setUserAccountType('student')
        }
      }
      if (!user && unsubscribeUserDoc) {
        unsubscribeUserDoc()
        unsubscribeUserDoc = null
      }
      setSession(user)
      setLoading(false)
    })

    return () => {
      unsubscribe()
      if (unsubscribeUserDoc) unsubscribeUserDoc()
    }
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

  const isSchoolWorkspaceUser = userRole === 'school_admin' || userRole === 'coach' || userAccountType === 'school'

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
            <Route path="/register" element={<RegisterTypeChoice />} />
            <Route path="/register/etudiant" element={<Register />} />
            <Route path="/register/ecole" element={<SchoolOffers />} />
            <Route path="/register/ecole/inscription" element={<RegisterSchool />} />
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
            {isSchoolWorkspaceUser ? (
              <Route element={<SchoolLayout />}>
                <Route path="/ecole" element={<SchoolDashboard />} />
                <Route path="/ecole/demandes" element={<SchoolRequests />} />
                <Route path="/ecole/etudiants" element={<SchoolStudents />} />
                <Route path="/ecole/classes" element={<SchoolClasses />} />
                <Route path="/ecole/etudiants/:studentId" element={<SchoolStudentDetail />} />
                <Route path="*" element={<Navigate to="/ecole" replace />} />
              </Route>
            ) : (
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/candidatures" element={<ListeCandidatures />} />
                <Route path="/candidatures/:id" element={<CandidatureDetail />} />
                <Route path="/calendrier" element={<Calendrier />} />
                <Route path="/calendrier/integration" element={<CalendarIntegration />} />
                <Route path="/cv" element={<CVGenerator />} />
                <Route path="/assistant" element={<AssistantIA />} />
                <Route path="/simulateur" element={<InterviewSimulator />} />
                <Route path="/profil" element={<StudentProfile />} />
                <Route path="/rattachement-ecole" element={<SchoolLinkRequest />} />
                <Route path="/import-email" element={<EmailImport />} />
                <Route path="/import-excel" element={<ExcelImport />} />
                <Route path="/scan-offres" element={<JobScanner />} />
                <Route path="/ajouter" element={<AjouterCandidature />} />
                <Route path="/modifier/:id" element={<ModifierCandidature />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/linkedin" element={<LinkedInIntegration />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            )}
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App

