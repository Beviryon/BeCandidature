import { useEffect, useMemo, useState } from 'react'
import { Building2, Link2, Clock3, CheckCircle2, XCircle, Ban } from 'lucide-react'
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { useToast } from '../contexts/ToastContext'

const deriveStudentNameFromEmail = (email = '') => {
  const localPart = email.split('@')[0] || ''
  if (!localPart) return ''
  return localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

const mapProfileSnapshot = (profile = {}) => ({
  firstName: profile.firstName || '',
  lastName: profile.lastName || '',
  phone: profile.phone || '',
  addressLine1: profile.addressLine1 || '',
  addressLine2: profile.addressLine2 || '',
  postalCode: profile.postalCode || '',
  city: profile.city || '',
  country: profile.country || '',
  program: profile.program || '',
  schoolName: profile.schoolName || '',
  linkedinUrl: profile.linkedinUrl || ''
})

function SchoolLinkRequest() {
  const { success, error: showError, info } = useToast()
  const [schoolIdInput, setSchoolIdInput] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])

  useEffect(() => {
    if (!auth.currentUser) return undefined

    const q = query(
      collection(db, 'schoolLinkRequests'),
      where('studentUid', '==', auth.currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((requestDoc) => ({
        id: requestDoc.id,
        ...requestDoc.data()
      }))
      rows.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })
      setRequests(rows)
    })

    return () => unsubscribe()
  }, [])

  const pendingRequest = useMemo(
    () => requests.find((item) => item.status === 'pending'),
    [requests]
  )

  const handleCreateRequest = async (event) => {
    event.preventDefault()
    if (!auth.currentUser) {
      showError('Utilisateur non authentifié.')
      return
    }

    const schoolId = schoolIdInput.trim().toUpperCase()
    if (!schoolId) {
      showError('Saisissez un code école.')
      return
    }

    if (pendingRequest) {
      info('Vous avez déjà une demande en attente.')
      return
    }

    try {
      setLoading(true)
      const schoolCodeSnap = await getDoc(doc(db, 'schoolCodes', schoolId))
      if (!schoolCodeSnap.exists() || schoolCodeSnap.data()?.isActive === false) {
        showError("Ce code école n'existe pas. Vérifiez le code puis réessayez.")
        return
      }

      const studentSnap = await getDoc(doc(db, 'users', auth.currentUser.uid))
      const studentProfile = studentSnap.exists() ? mapProfileSnapshot(studentSnap.data()?.profile || {}) : mapProfileSnapshot()

      await addDoc(collection(db, 'schoolLinkRequests'), {
        studentUid: auth.currentUser.uid,
        studentEmail: auth.currentUser.email || '',
        studentName: auth.currentUser.displayName || deriveStudentNameFromEmail(auth.currentUser.email || ''),
        studentProfile,
        schoolId,
        note: note.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      setSchoolIdInput('')
      setNote('')
      success('Demande de rattachement envoyée.')
    } catch (err) {
      console.error('Erreur création demande:', err)
      if (err?.code === 'permission-denied') {
        showError('Code école invalide ou non autorisé. Vérifiez le code transmis par votre école.')
      } else {
        showError('Impossible d’envoyer la demande. Réessayez.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    try {
      setLoading(true)
      await updateDoc(doc(db, 'schoolLinkRequests', requestId), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      })
      success('Demande annulée.')
    } catch (err) {
      console.error('Erreur annulation demande:', err)
      showError('Impossible d’annuler la demande.')
    } finally {
      setLoading(false)
    }
  }

  const statusUi = {
    pending: {
      label: 'En attente',
      icon: Clock3,
      className: 'text-orange-700 dark:text-orange-300 bg-orange-500/10 border-orange-500/30'
    },
    approved: {
      label: 'Acceptée',
      icon: CheckCircle2,
      className: 'text-green-700 dark:text-green-300 bg-green-500/10 border-green-500/30'
    },
    rejected: {
      label: 'Refusée',
      icon: XCircle,
      className: 'text-red-700 dark:text-red-300 bg-red-500/10 border-red-500/30'
    },
    cancelled: {
      label: 'Annulée',
      icon: Ban,
      className: 'text-gray-700 dark:text-gray-300 bg-white/5 border-white/10'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
          <Building2 className="w-6 h-6 text-purple-500" />
          Demander un rattachement à une école
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Vous pouvez utiliser BeCandidature en mode indépendant, puis demander un suivi école à tout moment.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-500" />
          Nouvelle demande
        </h2>
        <form className="space-y-3" onSubmit={handleCreateRequest}>
          <input
            type="text"
            value={schoolIdInput}
            onChange={(event) => setSchoolIdInput(event.target.value)}
            placeholder="Code école (ex: SCH-ABC123)"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Saisissez le code communiqué par votre école. Format attendu: <strong>SCH-XXXXXX</strong>.
          </p>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Message optionnel pour l’école (promo, filière, besoin de suivi...)"
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 transition-all"
          >
            Envoyer la demande
          </button>
        </form>
      </div>

      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Mes demandes</h2>

        {requests.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Aucune demande pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((item) => {
              const status = statusUi[item.status] || statusUi.pending
              const StatusIcon = status.icon
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      École: {item.schoolId}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${status.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>

                  {item.note ? (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{item.note}</p>
                  ) : null}

                  {item.status === 'pending' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleCancelRequest(item.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-700 dark:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-all"
                    >
                      Annuler la demande
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SchoolLinkRequest
