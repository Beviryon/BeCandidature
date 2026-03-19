import { httpsCallable } from 'firebase/functions'
import { functionsClient } from '../firebaseConfig'

const adminSetUserStatusCallable = httpsCallable(functionsClient, 'adminSetUserStatus')

export async function adminSetUserStatus(userId, status, reason = '') {
  const response = await adminSetUserStatusCallable({
    userId,
    status,
    reason
  })

  return response.data
}

