import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db, auth } from '../firebaseConfig'

const COLLECTION_NAME = 'candidatures'

// Get all candidatures for current user
export const getCandidatures = async () => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', user.uid),
      orderBy('date_candidature', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const candidatures = []
    querySnapshot.forEach((doc) => {
      candidatures.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return candidatures
  } catch (error) {
    console.error('Error getting candidatures:', error)
    throw error
  }
}

// Add a new candidature
export const addCandidature = async (candidatureData) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...candidatureData,
      userId: user.uid,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    })

    return { id: docRef.id, ...candidatureData }
  } catch (error) {
    console.error('Error adding candidature:', error)
    throw error
  }
}

// Update a candidature
export const updateCandidature = async (id, candidatureData) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    const candidatureRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(candidatureRef, {
      ...candidatureData,
      updated_at: serverTimestamp()
    })

    return { id, ...candidatureData }
  } catch (error) {
    console.error('Error updating candidature:', error)
    throw error
  }
}

// Delete a candidature
export const deleteCandidature = async (id) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    await deleteDoc(doc(db, COLLECTION_NAME, id))
    return id
  } catch (error) {
    console.error('Error deleting candidature:', error)
    throw error
  }
}

// Get a single candidature
export const getCandidature = async (id) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    const candidatures = await getCandidatures()
    const candidature = candidatures.find(c => c.id === id)
    
    if (!candidature) throw new Error('Candidature not found')
    
    return candidature
  } catch (error) {
    console.error('Error getting candidature:', error)
    throw error
  }
}

