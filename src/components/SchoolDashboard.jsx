import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'
import { BarChart3, Building2, Clock3, CheckCircle2, Users, Activity, XCircle, Briefcase, Search } from 'lucide-react'
import { auth, db } from '../firebaseConfig'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const toDate = (value) => {
  if (!value) return null
  if (value?.toDate) return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const daysSince = (value) => {
  const date = toDate(value)
  if (!date) return null
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / MS_PER_DAY))
}

function SchoolDashboard() {
  const [schoolId, setSchoolId] = useState('')
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('all')
  const [studentCandidaturesMap, setStudentCandidaturesMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    let unsubscribeRequests = null
    let unsubscribeStudents = null
    let unsubscribeClasses = null

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

        const requestsQuery = query(collection(db, 'schoolLinkRequests'), where('schoolId', '==', currentSchoolId))
        unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
          const rows = snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }))
          rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          setRequests(rows)
        })

        const studentsCollectionRef = collection(db, 'schools', currentSchoolId, 'students')
        unsubscribeStudents = onSnapshot(studentsCollectionRef, (snapshot) => {
          const rows = snapshot.docs.map((studentDoc) => ({ id: studentDoc.id, ...studentDoc.data() }))
          setStudents(rows)
        })

        const classesCollectionRef = collection(db, 'schools', currentSchoolId, 'classes')
        unsubscribeClasses = onSnapshot(classesCollectionRef, (snapshot) => {
          const rows = snapshot.docs.map((classDoc) => ({ id: classDoc.id, ...classDoc.data() }))
          rows.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'fr'))
          setClasses(rows)
        })
      } catch (error) {
        console.error('Erreur chargement dashboard école:', error)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (unsubscribeRequests) unsubscribeRequests()
      if (unsubscribeStudents) unsubscribeStudents()
      if (unsubscribeClasses) unsubscribeClasses()
    }
  }, [])

  useEffect(() => {
    if (!schoolId || students.length === 0) {
      setStudentCandidaturesMap({})
      return undefined
    }

    const unsubscribers = []
    const localMap = {}

    const subscribeForStudent = (studentId) => {
      const q1 = query(collection(db, 'candidatures'), where('userId', '==', studentId))
      const q2 = query(collection(db, 'candidatures'), where('user_id', '==', studentId))

      const applyDocs = () => {
        const all = [...(localMap[studentId]?.docs1 || []), ...(localMap[studentId]?.docs2 || [])]
        const uniqueById = new Map(all.map((item) => [item.id, item]))
        setStudentCandidaturesMap((prev) => ({ ...prev, [studentId]: Array.from(uniqueById.values()) }))
      }

      const unsub1 = onSnapshot(q1, (snapshot) => {
        localMap[studentId] = localMap[studentId] || { docs1: [], docs2: [] }
        localMap[studentId].docs1 = snapshot.docs.map((cDoc) => ({ id: cDoc.id, ...cDoc.data() }))
        applyDocs()
      })

      const unsub2 = onSnapshot(q2, (snapshot) => {
        localMap[studentId] = localMap[studentId] || { docs1: [], docs2: [] }
        localMap[studentId].docs2 = snapshot.docs.map((cDoc) => ({ id: cDoc.id, ...cDoc.data() }))
        applyDocs()
      })

      unsubscribers.push(unsub1, unsub2)
    }

    students.forEach((student) => subscribeForStudent(student.id))

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [schoolId, students])

  useEffect(() => {
    if (selectedClassId !== 'all' && !classes.some((classItem) => classItem.id === selectedClassId)) {
      setSelectedClassId('all')
    }
  }, [classes, selectedClassId])

  const studentsScope = useMemo(() => {
    if (selectedClassId === 'all') return students
    return students.filter((student) => student.classId === selectedClassId)
  }, [students, selectedClassId])

  const scopedCandidatures = useMemo(() => {
    const scopedStudentIds = new Set(studentsScope.map((student) => student.id))
    return Object.entries(studentCandidaturesMap)
      .filter(([studentId]) => scopedStudentIds.has(studentId))
      .flatMap(([, rows]) => rows)
  }, [studentsScope, studentCandidaturesMap])

  const metrics = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'pending').length
    const approved = requests.filter((r) => r.status === 'approved').length
    const totalCandidatures = scopedCandidatures.length
    const entretiens = scopedCandidatures.filter((item) => item.statut === 'Entretien').length
    const refus = scopedCandidatures.filter((item) => item.statut === 'Refus').length
    const enAttente = scopedCandidatures.filter((item) => item.statut === 'En attente').length
    const relancees = scopedCandidatures.filter((item) => (item.relances?.length || 0) > 0 || Boolean(item.date_relance)).length
    const activeStudents = studentsScope.filter((student) => (studentCandidaturesMap[student.id] || []).length > 0).length
    const traffic30d = scopedCandidatures.filter((item) => {
      const d = daysSince(item.date_candidature)
      return d !== null && d <= 30
    }).length

    return {
      totalRequests: requests.length,
      pending,
      approved,
      totalStudents: studentsScope.length,
      totalCandidatures,
      entretiens,
      refus,
      enAttente,
      relancees,
      activeStudents,
      traffic30d
    }
  }, [requests, studentsScope, studentCandidaturesMap, scopedCandidatures])

  const studentRows = useMemo(() => {
    const rows = studentsScope.map((student) => {
      const candidatures = studentCandidaturesMap[student.id] || []
      const sortedByDate = [...candidatures].sort((a, b) => (toDate(b.date_candidature)?.getTime() || 0) - (toDate(a.date_candidature)?.getTime() || 0))
      const lastCandidature = sortedByDate[0] || null
      const firstCandidature = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : null

      return {
        ...student,
        metrics: {
          offers: candidatures.length,
          entretiens: candidatures.filter((item) => item.statut === 'Entretien').length,
          refus: candidatures.filter((item) => item.statut === 'Refus').length,
          enAttente: candidatures.filter((item) => item.statut === 'En attente').length,
          relancees: candidatures.filter((item) => (item.relances?.length || 0) > 0 || Boolean(item.date_relance)).length,
          lastCandidature,
          lastApplicationDays: lastCandidature ? daysSince(lastCandidature.date_candidature) : null,
          sinceFirstDays: firstCandidature ? daysSince(firstCandidature.date_candidature) : null,
          traffic30d: candidatures.filter((item) => {
            const d = daysSince(item.date_candidature)
            return d !== null && d <= 30
          }).length,
          conversionRate: candidatures.length > 0
            ? Math.round((candidatures.filter((item) => item.statut === 'Entretien').length / candidatures.length) * 100)
            : 0
        }
      }
    })

    if (!searchQuery.trim()) return rows
    const q = searchQuery.trim().toLowerCase()
    return rows.filter((row) =>
      [row.fullName, row.email, row.program, row.schoolName, row.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    )
  }, [studentsScope, studentCandidaturesMap, searchQuery])

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-300">Chargement de l&apos;espace école...</div>
  }

  if (!schoolId) {
    return (
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Aucun établissement associé</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Votre compte école n&apos;est pas encore activé avec un code école.
          Demandez à l&apos;admin d&apos;utiliser l&apos;action <strong>Approuver + activer école</strong> dans le dashboard admin.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-6 h-6 text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard École</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">Code école: {schoolId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-white/10">
          <p className="text-xs text-gray-500 mb-1">Demandes totales</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{metrics.totalRequests}</p>
          <BarChart3 className="w-5 h-5 text-indigo-500 mt-2" />
        </div>
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-orange-500/30">
          <p className="text-xs text-gray-500 mb-1">Demandes en attente</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-300">{metrics.pending}</p>
          <Clock3 className="w-5 h-5 text-orange-500 mt-2" />
        </div>
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-green-500/30">
          <p className="text-xs text-gray-500 mb-1">Demandes approuvées</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">{metrics.approved}</p>
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />
        </div>
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-blue-500/30">
          <p className="text-xs text-gray-500 mb-1">Étudiants suivis</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{metrics.totalStudents}</p>
          <Users className="w-5 h-5 text-blue-500 mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-blue-500/30">
          <p className="text-xs text-gray-500 mb-1">Offres (total)</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{metrics.totalCandidatures}</p>
          <Briefcase className="w-5 h-5 text-blue-500 mt-2" />
        </div>
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-green-500/30">
          <p className="text-xs text-gray-500 mb-1">Entretiens</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">{metrics.entretiens}</p>
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />
        </div>
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-red-500/30">
          <p className="text-xs text-gray-500 mb-1">Refus</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-300">{metrics.refus}</p>
          <XCircle className="w-5 h-5 text-red-500 mt-2" />
        </div>
        <div className="rounded-2xl p-5 bg-white/80 dark:bg-black/40 border border-purple-500/30">
          <p className="text-xs text-gray-500 mb-1">Trafic (30 jours)</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{metrics.traffic30d}</p>
          <Activity className="w-5 h-5 text-purple-500 mt-2" />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'overview' ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30' : 'bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-white/10'}`}
          >
            Vue globale
          </button>
          <button
            onClick={() => setTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'pipeline' ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30' : 'bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-white/10'}`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setTab('actions')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'actions' ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30' : 'bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-white/10'}`}
          >
            Actions
          </button>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white">Vue globale</h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
              Synthèse école
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl p-3 border border-blue-500/20 bg-blue-500/10">
              <p className="text-xs text-blue-700 dark:text-blue-300">Étudiants suivis</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.totalStudents}</p>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-1">Base suivie par l'école</p>
            </div>
            <div className="rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/10">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Étudiants actifs</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{metrics.activeStudents}</p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">Avec au moins 1 candidature</p>
            </div>
            <div className="rounded-xl p-3 border border-orange-500/20 bg-orange-500/10">
              <p className="text-xs text-orange-700 dark:text-orange-300">Candidatures en attente</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{metrics.enAttente}</p>
              <p className="text-[11px] text-orange-700/80 dark:text-orange-300/80 mt-1">Pipeline à traiter</p>
            </div>
            <div className="rounded-xl p-3 border border-purple-500/20 bg-purple-500/10">
              <p className="text-xs text-purple-700 dark:text-purple-300">Candidatures relancées</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{metrics.relancees}</p>
              <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-1">Suivi proactif effectué</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300">Activation étudiants</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {metrics.totalStudents > 0 ? Math.round((metrics.activeStudents / metrics.totalStudents) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                  style={{ width: `${metrics.totalStudents > 0 ? Math.round((metrics.activeStudents / metrics.totalStudents) * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300">Suivi relances</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {metrics.totalCandidatures > 0 ? Math.round((metrics.relancees / metrics.totalCandidatures) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ width: `${metrics.totalCandidatures > 0 ? Math.round((metrics.relancees / metrics.totalCandidatures) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white">Pilotage étudiants</h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
              {studentRows.length} étudiant(s)
            </span>
          </div>
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un étudiant (nom, email, formation...)"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            {studentRows.map((student) => (
              <div key={student.id} className="p-4 rounded-xl bg-white/70 dark:bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
                    {student.fullName || student.email || student.id}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                      Offres: {student.metrics.offers}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-lg border ${
                      student.metrics.lastApplicationDays !== null && student.metrics.lastApplicationDays > 14
                        ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                        : 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
                    }`}>
                      {student.metrics.lastApplicationDays !== null && student.metrics.lastApplicationDays > 14 ? 'Inactif' : 'Actif'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-1">
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">Entretiens</p>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{student.metrics.entretiens}</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1">
                    <p className="text-[11px] text-red-700 dark:text-red-300">Refus</p>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">{student.metrics.refus}</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-1">
                    <p className="text-[11px] text-orange-700 dark:text-orange-300">En attente</p>
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">{student.metrics.enAttente}</p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-2 py-1">
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">Relancées</p>
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">{student.metrics.relancees}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Conversion</p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{student.metrics.conversionRate}%</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <p>
                    Dernière candidature: <strong>{student.metrics.lastCandidature?.poste || 'N/A'}</strong>
                    {student.metrics.lastApplicationDays !== null ? ` (il y a ${student.metrics.lastApplicationDays} jours)` : ''}
                  </p>
                  <p>
                    Ancienneté postulation: <strong>{student.metrics.sinceFirstDays !== null ? `${student.metrics.sinceFirstDays} jours` : 'N/A'}</strong> - Trafic 30j: <strong>{student.metrics.traffic30d}</strong>
                  </p>
                </div>

                <Link
                  to={`/ecole/etudiants/${student.id}`}
                  className="inline-flex items-center mt-3 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 transition-all"
                >
                  Ouvrir la fiche étudiant
                </Link>
              </div>
            ))}
            {studentRows.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-300">Aucun étudiant correspondant.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'actions' && (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Plan d&apos;actions
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
              Priorités école
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Traiter les demandes en attente</p>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-700 dark:text-orange-300">
                  {metrics.pending} en attente
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                Réduisez le délai de validation pour accélérer le suivi des nouveaux étudiants.
              </p>
              <Link
                to="/ecole/demandes"
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs bg-orange-500/20 border border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/30 transition-all"
              >
                Ouvrir les demandes
              </Link>
            </div>

            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Réactiver les étudiants inactifs</p>
                <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300">
                  {Math.max(0, metrics.totalStudents - metrics.activeStudents)} sans activité
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                Ciblez d&apos;abord les étudiants sans candidature récente pour relancer leur dynamique.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTab('pipeline')
                  setSearchQuery('')
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/30 transition-all"
              >
                Ouvrir le pilotage étudiants
              </button>
            </div>

            <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Améliorer le taux d&apos;entretien</p>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                  {metrics.totalCandidatures > 0 ? Math.round((metrics.entretiens / metrics.totalCandidatures) * 100) : 0}% conversion
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                Analysez les profils avec beaucoup de refus pour ajuster CV, ciblage et stratégie de relance.
              </p>
              <Link
                to="/ecole/etudiants"
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30 transition-all"
              >
                Voir les fiches étudiants
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchoolDashboard
