import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, CheckCircle2, Clock3, RefreshCw, UserRound, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'

const toDate = (value) => {
  if (!value) return null
  if (value?.toDate) return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDate = (value) => {
  const d = toDate(value)
  if (!d) return 'N/A'
  return d.toLocaleDateString('fr-FR')
}

const getStudentIdFromCandidature = (candidature) => candidature.userId || candidature.user_id || ''

function SchoolStudentDetail() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [schoolId, setSchoolId] = useState('')
  const [student, setStudent] = useState(null)
  const [candidatures, setCandidatures] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedCandidatureId, setExpandedCandidatureId] = useState(null)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    let unsub1 = null
    let unsub2 = null

    const init = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setLoading(false)
          return
        }

        const currentUserSnap = await getDoc(doc(db, 'users', currentUser.uid))
        const currentSchoolId = currentUserSnap.exists() ? (currentUserSnap.data().schoolId || '') : ''
        setSchoolId(currentSchoolId)
        if (!currentSchoolId || !studentId) {
          setLoading(false)
          return
        }

        const studentSnap = await getDoc(doc(db, 'schools', currentSchoolId, 'students', studentId))
        if (!studentSnap.exists()) {
          setLoading(false)
          return
        }
        setStudent({ id: studentSnap.id, ...studentSnap.data() })

        const q1 = query(collection(db, 'candidatures'), where('userId', '==', studentId))
        const q2 = query(collection(db, 'candidatures'), where('user_id', '==', studentId))

        let list1 = []
        let list2 = []

        const sync = () => {
          const all = [...list1, ...list2].filter((item) => getStudentIdFromCandidature(item) === studentId)
          const unique = new Map(all.map((item) => [item.id, item]))
          const rows = Array.from(unique.values()).sort((a, b) => {
            const aTime = toDate(a.date_candidature)?.getTime() || 0
            const bTime = toDate(b.date_candidature)?.getTime() || 0
            return bTime - aTime
          })
          setCandidatures(rows)
        }

        unsub1 = onSnapshot(q1, (snapshot) => {
          list1 = snapshot.docs.map((cDoc) => ({ id: cDoc.id, ...cDoc.data() }))
          sync()
        })

        unsub2 = onSnapshot(q2, (snapshot) => {
          list2 = snapshot.docs.map((cDoc) => ({ id: cDoc.id, ...cDoc.data() }))
          sync()
        })
      } catch (error) {
        console.error('Erreur chargement fiche étudiant école:', error)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (unsub1) unsub1()
      if (unsub2) unsub2()
    }
  }, [studentId])

  const metrics = useMemo(() => {
    const offers = candidatures.length
    const interviews = candidatures.filter((item) => item.statut === 'Entretien').length
    const pending = candidatures.filter((item) => item.statut === 'En attente').length
    const refus = candidatures.filter((item) => item.statut === 'Refus').length
    const relances = candidatures.filter((item) => (item.relances?.length || 0) > 0 || Boolean(item.date_relance)).length
    return { offers, interviews, pending, refus, relances }
  }, [candidatures])

  const totalPages = Math.max(1, Math.ceil(candidatures.length / ITEMS_PER_PAGE))

  const paginatedCandidatures = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return candidatures.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [candidatures, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [candidatures.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-300">Chargement de la fiche étudiant...</div>
  }

  if (!schoolId || !student) {
    return (
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Fiche non disponible</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Cet étudiant n&apos;est pas accessible depuis votre espace école.
        </p>
        <button
          onClick={() => navigate('/ecole/etudiants')}
          className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
        >
          Retour à la liste étudiants
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/ecole/etudiants"
          className="p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-white/10 text-gray-700 dark:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Fiche étudiant</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Vue détaillée des candidatures et du suivi</p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-5">
        <div className="flex items-center gap-2 mb-2">
          <UserRound className="w-4 h-4 text-indigo-500" />
          <p className="font-semibold text-gray-800 dark:text-white">
            {student.fullName || student.email || student.id}
          </p>
        </div>
        {student.email && <p className="text-sm text-gray-600 dark:text-gray-300">Email: {student.email}</p>}
        {student.phone && <p className="text-sm text-gray-600 dark:text-gray-300">Téléphone: {student.phone}</p>}
        {student.program && <p className="text-sm text-gray-600 dark:text-gray-300">Formation: {student.program}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="rounded-xl p-4 bg-white/80 dark:bg-black/40 border border-indigo-500/20">
          <p className="text-xs text-gray-500">Offres</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{metrics.offers}</p>
          <Briefcase className="w-4 h-4 text-indigo-500 mt-1" />
        </div>
        <div className="rounded-xl p-4 bg-white/80 dark:bg-black/40 border border-green-500/30">
          <p className="text-xs text-gray-500">Entretiens</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{metrics.interviews}</p>
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
        </div>
        <div className="rounded-xl p-4 bg-white/80 dark:bg-black/40 border border-orange-500/30">
          <p className="text-xs text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{metrics.pending}</p>
          <Clock3 className="w-4 h-4 text-orange-500 mt-1" />
        </div>
        <div className="rounded-xl p-4 bg-white/80 dark:bg-black/40 border border-red-500/30">
          <p className="text-xs text-gray-500">Refus</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{metrics.refus}</p>
          <XCircle className="w-4 h-4 text-red-500 mt-1" />
        </div>
        <div className="rounded-xl p-4 bg-white/80 dark:bg-black/40 border border-purple-500/30">
          <p className="text-xs text-gray-500">Relancées</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{metrics.relances}</p>
          <RefreshCw className="w-4 h-4 text-purple-500 mt-1" />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={() => setIsTimelineOpen((prev) => !prev)}
            className="flex-1 flex items-center justify-between gap-2 text-left"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Timeline candidatures</h3>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                {candidatures.length} candidature(s)
              </span>
              {isTimelineOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </div>
          </button>
        </div>
        {!isTimelineOpen ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Section repliée. Cliquez pour afficher les candidatures.
          </p>
        ) : candidatures.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Aucune candidature trouvée pour cet étudiant.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {paginatedCandidatures.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setExpandedCandidatureId((prev) => (prev === item.id ? null : item.id))}
                  className="text-left p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                      {item.statut || 'N/A'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300">
                      Relances: {item.relances?.length || 0}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-xs rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2 py-2 text-indigo-700 dark:text-indigo-300">
                      <p className="opacity-80 mb-0.5">Entreprise</p>
                      <p className="font-semibold text-sm leading-tight">{item.entreprise || 'Non renseignée'}</p>
                    </div>
                    <div className="text-xs rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-2 text-sky-700 dark:text-sky-300">
                      <p className="opacity-80 mb-0.5">Poste</p>
                      <p className="font-semibold text-sm leading-tight">{item.poste || 'Non renseigné'}</p>
                    </div>
                    <div className="text-xs rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-emerald-700 dark:text-emerald-300">
                      <p className="opacity-80 mb-0.5">Date de candidature</p>
                      <p className="font-semibold text-sm">{formatDate(item.date_candidature)}</p>
                    </div>
                  </div>

                  {expandedCandidatureId === item.id && (
                    <div className="mt-2 rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 p-2.5">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        Dernière relance: <strong>{item.date_relance ? formatDate(item.date_relance) : 'Aucune'}</strong>
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        Notes: <strong>{item.notes || 'Aucune note'}</strong>
                      </p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 font-medium">
                        Cliquez à nouveau pour refermer
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {candidatures.length > ITEMS_PER_PAGE && (
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Page {currentPage} sur {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SchoolStudentDetail
