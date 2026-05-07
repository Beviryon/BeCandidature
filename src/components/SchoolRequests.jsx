import { useEffect, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
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

function SchoolRequests() {
  const { success, error: showError } = useToast()
  const [schoolId, setSchoolId] = useState('')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = null

    const init = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setLoading(false)
          return
        }

        const userSnap = await getDoc(doc(db, 'users', currentUser.uid))
        const currentSchoolId = userSnap.exists() ? (userSnap.data().schoolId || '') : ''
        setSchoolId(currentSchoolId)
        if (!currentSchoolId) {
          setLoading(false)
          return
        }

        const q = query(
          collection(db, 'schoolLinkRequests'),
          where('schoolId', '==', currentSchoolId)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
          const rows = snapshot.docs.map((requestDoc) => ({
            id: requestDoc.id,
            ...requestDoc.data()
          }))
          rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          setRequests(rows)
        })
      } catch (error) {
        console.error('Erreur chargement demandes école:', error)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const updateRequestStatus = async (requestItem, status) => {
    try {
      await updateDoc(doc(db, 'schoolLinkRequests', requestItem.id), {
        status,
        updatedAt: serverTimestamp(),
        decidedAt: serverTimestamp(),
        decidedBy: auth.currentUser.uid
      })

      if (status === 'approved' && schoolId) {
        await setDoc(
          doc(db, 'schools', schoolId, 'students', requestItem.studentUid),
          {
            uid: requestItem.studentUid,
            email: requestItem.studentEmail || '',
            fullName: requestItem.studentName || deriveStudentNameFromEmail(requestItem.studentEmail || ''),
            firstName: requestItem.studentProfile?.firstName || '',
            lastName: requestItem.studentProfile?.lastName || '',
            phone: requestItem.studentProfile?.phone || '',
            address: {
              line1: requestItem.studentProfile?.addressLine1 || '',
              line2: requestItem.studentProfile?.addressLine2 || '',
              postalCode: requestItem.studentProfile?.postalCode || '',
              city: requestItem.studentProfile?.city || '',
              country: requestItem.studentProfile?.country || ''
            },
            program: requestItem.studentProfile?.program || '',
            schoolName: requestItem.studentProfile?.schoolName || '',
            linkedinUrl: requestItem.studentProfile?.linkedinUrl || '',
            type: 'linked_account',
            linkedUid: requestItem.studentUid,
            status: 'active',
            source: 'link_request',
            linkedAt: serverTimestamp(),
            linkedBy: auth.currentUser.uid,
            requestId: requestItem.id
          },
          { merge: true }
        )

        await updateDoc(doc(db, 'users', requestItem.studentUid), {
          schoolId,
          schoolMembership: {
            status: 'active',
            schoolId,
            linkedAt: serverTimestamp(),
            linkedBy: auth.currentUser.uid,
            requestId: requestItem.id
          },
          updatedAt: serverTimestamp()
        })
      }

      success(`Demande ${status === 'approved' ? 'approuvée' : 'rejetée'}.`)
    } catch (error) {
      console.error('Erreur update demande:', error)
      showError('Impossible de mettre à jour cette demande.')
    }
  }

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-300">Chargement des demandes...</div>
  }

  if (!schoolId) {
    return (
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Aucun code école</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Votre compte doit être rattaché à un code école pour consulter les demandes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Demandes de rattachement</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">École: {schoolId}</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Aucune demande pour le moment.</p>
        </div>
      ) : (
        requests.map((requestItem) => (
          <div key={requestItem.id} className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                Étudiant: {requestItem.studentEmail || requestItem.studentUid}
              </p>
              <span className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-300 inline-flex items-center gap-1">
                <Clock3 className="w-3.5 h-3.5" />
                {requestItem.status}
              </span>
            </div>
            {requestItem.note ? (
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{requestItem.note}</p>
            ) : null}

            {requestItem.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateRequestStatus(requestItem, 'approved')}
                  className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => updateRequestStatus(requestItem, 'rejected')}
                  className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm inline-flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default SchoolRequests
