import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Users, UserRound, Search, Mail, Phone, GraduationCap, ChevronRight } from 'lucide-react'
import { auth, db } from '../firebaseConfig'

function SchoolStudents() {
  const [schoolId, setSchoolId] = useState('')
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingStudentId, setUpdatingStudentId] = useState('')

  useEffect(() => {
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

        const studentsCollectionRef = collection(db, 'schools', currentSchoolId, 'students')
        unsubscribeStudents = onSnapshot(studentsCollectionRef, (snapshot) => {
          const rows = snapshot.docs.map((studentDoc) => ({
            id: studentDoc.id,
            ...studentDoc.data()
          }))
          setStudents(rows)
        })

        const classesCollectionRef = collection(db, 'schools', currentSchoolId, 'classes')
        unsubscribeClasses = onSnapshot(classesCollectionRef, (snapshot) => {
          const rows = snapshot.docs.map((classDoc) => ({
            id: classDoc.id,
            ...classDoc.data()
          }))
          rows.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'fr'))
          setClasses(rows)
        })
      } catch (error) {
        console.error('Erreur chargement étudiants:', error)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (unsubscribeStudents) unsubscribeStudents()
      if (unsubscribeClasses) unsubscribeClasses()
    }
  }, [])

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const q = searchQuery.trim().toLowerCase()
    return students.filter((student) =>
      [student.fullName, student.name, student.email, student.program, student.schoolName, student.className, student.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    )
  }, [students, searchQuery])

  const studentsByClass = useMemo(() => {
    const groups = new Map()
    filteredStudents.forEach((student) => {
      const classId = student.classId || 'none'
      const className = student.className || 'Non assignée'
      if (!groups.has(classId)) {
        groups.set(classId, { classId, className, students: [] })
      }
      groups.get(classId).students.push(student)
    })
    return Array.from(groups.values()).sort((a, b) => a.className.localeCompare(b.className, 'fr'))
  }, [filteredStudents])

  const stats = useMemo(() => ({
    total: students.length,
    linked: students.filter((s) => s.type === 'linked_account').length,
    withPhone: students.filter((s) => Boolean(s.phone)).length,
    withProgram: students.filter((s) => Boolean(s.program)).length,
    noClass: students.filter((s) => !s.classId).length
  }), [students])

  const handleAssignClass = async (student, classId) => {
    if (!schoolId) return
    try {
      setUpdatingStudentId(student.id)
      const selectedClass = classes.find((item) => item.id === classId)
      await updateDoc(doc(db, 'schools', schoolId, 'students', student.id), {
        classId: classId || null,
        className: selectedClass?.name || null,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur attribution classe étudiant:', error)
    } finally {
      setUpdatingStudentId('')
    }
  }

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-300">Chargement des étudiants...</div>
  }

  if (!schoolId) {
    return (
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Aucun code école</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Votre compte doit être rattaché à une école pour accéder à cette section.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Étudiants suivis</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">École: {schoolId}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
            {filteredStudents.length} affiché(s)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl p-3 border border-indigo-500/20 bg-indigo-500/10">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Total</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{stats.total}</p>
        </div>
        <div className="rounded-xl p-3 border border-blue-500/20 bg-blue-500/10">
          <p className="text-[11px] text-blue-700 dark:text-blue-300">Comptes liés</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.linked}</p>
        </div>
        <div className="rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/10">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Avec téléphone</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{stats.withPhone}</p>
        </div>
        <div className="rounded-xl p-3 border border-purple-500/20 bg-purple-500/10">
          <p className="text-[11px] text-purple-700 dark:text-purple-300">Avec formation</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{stats.withProgram}</p>
        </div>
        <div className="rounded-xl p-3 border border-rose-500/20 bg-rose-500/10">
          <p className="text-[11px] text-rose-700 dark:text-rose-300">Sans classe</p>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{stats.noClass}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Rechercher un étudiant (nom, email, formation...)"
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/70 dark:bg-white/5 text-gray-900 dark:text-white"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {students.length === 0
              ? 'Aucun étudiant enregistré dans `schools/{schoolId}/students` pour le moment.'
              : 'Aucun étudiant ne correspond à votre recherche.'}
          </p>
        </div>
      ) : (
        studentsByClass.map((group) => (
          <div key={group.classId} className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              Classe: {group.className} ({group.students.length})
            </div>
            {group.students.map((student) => (
              <div
                key={student.id}
                className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-indigo-500/40 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                      {(student.fullName || student.email || student.id || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {student.fullName || student.name || student.email || student.linkedUid || student.id}
                      </p>
                      {student.email && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 inline-flex items-center gap-1 mt-1">
                          <Mail className="w-3.5 h-3.5" />
                          {student.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-lg border border-white/10 bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                    Type: {student.type || 'N/A'}
                  </span>
                  <span className="text-[11px] px-2 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    Classe: {student.className || 'Non assignée'}
                  </span>
                  {student.phone && (
                    <span className="text-[11px] px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Téléphone
                    </span>
                  )}
                  {student.program && (
                    <span className="text-[11px] px-2 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 inline-flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Formation
                    </span>
                  )}
                </div>

                {student.phone && <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">Téléphone: {student.phone}</p>}
                {(student.address?.line1 || student.address?.postalCode || student.address?.city) && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Adresse: {[student.address?.line1, student.address?.postalCode, student.address?.city, student.address?.country].filter(Boolean).join(', ')}
                  </p>
                )}
                {student.program && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Formation: {student.program}</p>}
                {student.schoolName && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Établissement: {student.schoolName}</p>}

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <select
                    value={student.classId || ''}
                    disabled={updatingStudentId === student.id}
                    onChange={(event) => handleAssignClass(student, event.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg border border-white/10 bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Non assignée</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>

                  <Link
                    to={`/ecole/etudiants/${student.id}`}
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-300 font-medium"
                  >
                    Voir la fiche détaillée
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

export default SchoolStudents
