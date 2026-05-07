import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { Layers, Users, ChevronDown, ChevronUp, Mail, GraduationCap, UserRound } from 'lucide-react'
import { auth, db } from '../firebaseConfig'

function SchoolClasses() {
  const [schoolId, setSchoolId] = useState('')
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openClassId, setOpenClassId] = useState(null)

  useEffect(() => {
    let unsubscribeClasses = null
    let unsubscribeStudents = null

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

        const classesRef = collection(db, 'schools', currentSchoolId, 'classes')
        unsubscribeClasses = onSnapshot(classesRef, (snapshot) => {
          const rows = snapshot.docs.map((classDoc) => ({
            id: classDoc.id,
            ...classDoc.data()
          }))
          rows.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'fr'))
          setClasses(rows)
        })

        const studentsRef = collection(db, 'schools', currentSchoolId, 'students')
        unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
          const rows = snapshot.docs.map((studentDoc) => ({
            id: studentDoc.id,
            ...studentDoc.data()
          }))
          setStudents(rows)
        })
      } catch (error) {
        console.error('Erreur chargement classes école:', error)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (unsubscribeClasses) unsubscribeClasses()
      if (unsubscribeStudents) unsubscribeStudents()
    }
  }, [])

  const stats = useMemo(() => {
    const totalClasses = classes.length
    const totalAssigned = students.filter((student) => Boolean(student.classId)).length
    const nonAssigned = students.filter((student) => !student.classId).length
    return { totalClasses, totalAssigned, nonAssigned }
  }, [classes, students])

  const studentsByClassId = useMemo(() => {
    const map = new Map()
    classes.forEach((classItem) => map.set(classItem.id, []))
    students.forEach((student) => {
      if (!student.classId) return
      if (!map.has(student.classId)) map.set(student.classId, [])
      map.get(student.classId).push(student)
    })
    return map
  }, [classes, students])

  useEffect(() => {
    if (classes.length === 0) {
      setOpenClassId(null)
      return
    }
    if (!openClassId || !classes.some((classItem) => classItem.id === openClassId)) {
      setOpenClassId(classes[0].id)
    }
  }, [classes, openClassId])

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-300">Chargement des classes...</div>
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
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Classes créées</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">École: {schoolId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl p-3 border border-indigo-500/20 bg-indigo-500/10">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Total classes</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{stats.totalClasses}</p>
        </div>
        <div className="rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/10">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Étudiants assignés</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{stats.totalAssigned}</p>
        </div>
        <div className="rounded-xl p-3 border border-rose-500/20 bg-rose-500/10">
          <p className="text-[11px] text-rose-700 dark:text-rose-300">Sans classe</p>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{stats.nonAssigned}</p>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Aucune classe créée pour le moment. Utilisez le bouton <strong>Créer une classe</strong> dans la barre latérale.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((classItem) => {
            const classStudents = studentsByClassId.get(classItem.id) || []
            const isOpen = openClassId === classItem.id
            return (
              <div key={classItem.id} className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <button
                  type="button"
                  onClick={() => setOpenClassId(isOpen ? null : classItem.id)}
                  className="w-full flex flex-wrap items-center justify-between gap-2 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{classItem.name || 'Classe'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {classItem.level || 'Niveau non renseigné'} - {classItem.academicYear || 'Année non renseignée'}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {classStudents.length} étudiant(s)
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-3">
                    {classItem.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300">{classItem.description}</p>
                    )}

                    {classStudents.length === 0 ? (
                      <div className="rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Aucun étudiant inscrit dans cette classe pour le moment.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {classStudents.map((student) => (
                          <div
                            key={student.id}
                            className="rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                  {student.fullName || student.name || student.email || student.id}
                                </p>
                                {student.email && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300 inline-flex items-center gap-1 mt-1 truncate">
                                    <Mail className="w-3 h-3" />
                                    {student.email}
                                  </p>
                                )}
                                {student.program && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300 inline-flex items-center gap-1 mt-1 truncate">
                                    <GraduationCap className="w-3 h-3" />
                                    {student.program}
                                  </p>
                                )}
                              </div>
                              <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <UserRound className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />
                              </div>
                            </div>
                            <Link
                              to={`/ecole/etudiants/${student.id}`}
                              className="inline-flex mt-2 text-xs px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 transition-all"
                            >
                              Voir fiche
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SchoolClasses
