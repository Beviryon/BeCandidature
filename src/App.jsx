import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseConfig'
import { DEMO_MODE } from './demoData'
import Login from './components/Login'
import Register from './components/Register'
import ListeCandidatures from './components/ListeCandidatures'
import AjouterCandidature from './components/AjouterCandidature'
import ModifierCandidature from './components/ModifierCandidature'
import Dashboard from './components/Dashboard'
import Calendrier from './components/Calendrier'
import CVGenerator from './components/CVGenerator'
import AssistantIA from './components/AssistantIA'
import EmailImport from './components/EmailImport'
import JobScanner from './components/JobScanner'
import Templates from './components/Templates'
import LinkedInIntegration from './components/LinkedInIntegration'
import Layout from './components/Layout'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier d'abord la session DÉMO
    if (DEMO_MODE) {
      const demoSession = localStorage.getItem('demo_session')
      if (demoSession) {
        setSession(JSON.parse(demoSession))
        setLoading(false)
        return
      }
    }

    // Écouter les changements d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {!session ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidatures" element={<ListeCandidatures />} />
            <Route path="/calendrier" element={<Calendrier />} />
            <Route path="/cv" element={<CVGenerator />} />
            <Route path="/assistant" element={<AssistantIA />} />
            <Route path="/import-email" element={<EmailImport />} />
            <Route path="/scan-offres" element={<JobScanner />} />
            <Route path="/ajouter" element={<AjouterCandidature />} />
            <Route path="/modifier/:id" element={<ModifierCandidature />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/linkedin" element={<LinkedInIntegration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  )
}

export default App

