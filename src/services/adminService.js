import { collection, deleteField, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'

const USERS_COLLECTION = 'users'
const SCHOOL_CODES_COLLECTION = 'schoolCodes'

const assertAdmin = async () => {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('Authentification requise.')
  }

  const adminSnap = await getDoc(doc(db, USERS_COLLECTION, currentUser.uid))
  if (!adminSnap.exists() || adminSnap.data()?.role !== 'admin') {
    throw new Error('Accès administrateur requis.')
  }

  return currentUser.uid
}

export async function adminSetUserStatus(userId, status, reason = '') {
  const adminUid = await assertAdmin()
  const userRef = doc(db, USERS_COLLECTION, userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    throw new Error('Utilisateur introuvable.')
  }

  const currentUserData = userSnap.data()
  const updates = {
    status,
    updatedAt: serverTimestamp()
  }

  if (status === 'active' && currentUserData.status === 'pending') {
    updates.approvedAt = serverTimestamp()
    updates.approvedBy = adminUid
  }

  if (status === 'suspended') {
    updates.suspendedReason = reason || 'Non spécifiée'
    updates.suspendedAt = serverTimestamp()
  } else {
    updates.suspendedReason = deleteField()
    updates.suspendedAt = deleteField()
  }

  await updateDoc(userRef, updates)

  return {
    ok: true,
    userId,
    previousStatus: currentUserData.status || null,
    status
  }
}

export async function adminAssignSchoolRole(userId, role, schoolId = '') {
  const adminUid = await assertAdmin()
  const userRef = doc(db, USERS_COLLECTION, userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    throw new Error('Utilisateur introuvable.')
  }

  const currentData = userSnap.data()
  if (currentData.role === 'admin') {
    throw new Error('Le rôle admin ne peut pas être modifié ici.')
  }

  const updates = {
    role,
    updatedAt: serverTimestamp(),
    roleUpdatedAt: serverTimestamp(),
    roleUpdatedBy: adminUid
  }

  if (role === 'school_admin' || role === 'coach') {
    const normalizedSchoolId = schoolId?.trim().toUpperCase()
    if (!normalizedSchoolId) {
      throw new Error('schoolId est requis pour ce rôle.')
    }
    updates.schoolId = normalizedSchoolId
    updates.schoolMembership = {
      status: 'active',
      schoolId: normalizedSchoolId
    }
  } else {
    updates.schoolId = deleteField()
    updates.schoolMembership = {
      status: 'none'
    }
  }

  await updateDoc(userRef, updates)

  if (role === 'school_admin' || role === 'coach') {
    await upsertSchoolCode({
      schoolId: schoolId.trim().toUpperCase(),
      updatedBy: adminUid,
      ownerUid: userId
    })
  }

  return {
    ok: true,
    userId,
    previousRole: currentData.role || 'user',
    role,
    schoolId: role === 'user' ? null : schoolId.trim().toUpperCase()
  }
}

const randomAlphaNumeric = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

const generateUniqueSchoolCode = async () => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = `SCH-${randomAlphaNumeric()}`
    const schoolCodeSnap = await getDoc(doc(db, SCHOOL_CODES_COLLECTION, code))
    if (schoolCodeSnap.exists()) {
      continue
    }
    const q = query(
      collection(db, USERS_COLLECTION),
      where('schoolId', '==', code),
      limit(1)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      return code
    }
  }
  throw new Error('Impossible de générer un code école unique.')
}

export async function adminGenerateSchoolCode() {
  await assertAdmin()
  const code = await generateUniqueSchoolCode()
  return { ok: true, code }
}

const upsertSchoolCode = async ({ schoolId, updatedBy, ownerUid = null }) => {
  await setDoc(
    doc(db, SCHOOL_CODES_COLLECTION, schoolId),
    {
      schoolId,
      isActive: true,
      ownerUid,
      updatedAt: serverTimestamp(),
      updatedBy,
      createdAt: serverTimestamp()
    },
    { merge: true }
  )
}

export async function adminSyncSchoolCodes(records = []) {
  const adminUid = await assertAdmin()
  if (!Array.isArray(records) || records.length === 0) {
    return { ok: true, synced: 0 }
  }

  const uniqueBySchoolId = new Map()
  records.forEach((entry) => {
    const normalizedSchoolId = entry?.schoolId?.trim().toUpperCase()
    if (!normalizedSchoolId) return
    if (!uniqueBySchoolId.has(normalizedSchoolId)) {
      uniqueBySchoolId.set(normalizedSchoolId, {
        schoolId: normalizedSchoolId,
        ownerUid: entry?.ownerUid || null
      })
    }
  })

  const payload = Array.from(uniqueBySchoolId.values())
  await Promise.all(
    payload.map((entry) => upsertSchoolCode({
      schoolId: entry.schoolId,
      ownerUid: entry.ownerUid,
      updatedBy: adminUid
    }))
  )

  return { ok: true, synced: payload.length }
}

