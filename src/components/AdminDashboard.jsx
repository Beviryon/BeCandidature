import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { Users, CheckCircle, XCircle, Pause, Play, Clock, Shield } from 'lucide-react'
import { sendApprovalEmail } from '../services/emailService'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, active, suspended

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId, newStatus, reason = null) => {
    try {
      const updates = {
        status: newStatus,
        updatedAt: serverTimestamp()
      }

      if (newStatus === 'active' && users.find(u => u.id === userId).status === 'pending') {
        updates.approvedAt = serverTimestamp()
      }

      if (newStatus === 'suspended' && reason) {
        updates.suspendedReason = reason
        updates.suspendedAt = serverTimestamp()
      }

      await updateDoc(doc(db, 'users', userId), updates)
      
      // Recharger la liste
      await loadUsers()
      
      alert(`✅ Statut mis à jour : ${newStatus}`)
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      alert('❌ Erreur lors de la mise à jour')
    }
  }

  const approveUser = async (userId) => {
    if (window.confirm('Approuver cet utilisateur ?')) {
      await updateUserStatus(userId, 'active')
      
      // Envoyer l'email d'approbation
      const user = users.find(u => u.id === userId)
      if (user) {
        await sendApprovalEmail({
          name: user.email.split('@')[0],
          email: user.email
        })
      }
    }
  }

  const rejectUser = (userId) => {
    if (window.confirm('Rejeter cet utilisateur ? (Il ne pourra plus se connecter)')) {
      updateUserStatus(userId, 'rejected')
    }
  }

  const suspendUser = (userId) => {
    const reason = prompt('Raison de la suspension (optionnel):')
    if (reason !== null) {
      updateUserStatus(userId, 'suspended', reason || 'Non spécifiée')
    }
  }

  const reactivateUser = (userId) => {
    if (window.confirm('Réactiver cet utilisateur ?')) {
      updateUserStatus(userId, 'active')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-700 dark:text-yellow-400', label: '⏳ En attente' },
      active: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-700 dark:text-green-400', label: '✅ Actif' },
      suspended: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-700 dark:text-red-400', label: '🔒 Suspendu' },
      rejected: { bg: 'bg-gray-500/10 border-gray-500/30', text: 'text-gray-700 dark:text-gray-400', label: '❌ Rejeté' }
    }
    return badges[status] || badges.pending
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true
    return user.status === filter
  })

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h2 className="text-4xl font-bold gradient-text">
            Dashboard Admin
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Gestion des utilisateurs et approbations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-300 dark:border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-white">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En attente</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Actifs</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Suspendus</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.suspended}</p>
            </div>
            <Pause className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Tous ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          En attente ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'active'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Actifs ({stats.active})
        </button>
        <button
          onClick={() => setFilter('suspended')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'suspended'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Suspendus ({stats.suspended})
        </button>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-300 dark:border-purple-500/30 shadow-lg">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun utilisateur dans cette catégorie</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const badge = getStatusBadge(user.status)
            return (
              <div
                key={user.id}
                className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-300 dark:border-white/10 hover:border-purple-500/50 transition-all shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{user.email?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{user.email}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Inscrit le {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {user.suspendedReason && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Raison: {user.suspendedReason}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveUser(user.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-md"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approuver</span>
                        </button>
                        <button
                          onClick={() => rejectUser(user.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-md"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rejeter</span>
                        </button>
                      </>
                    )}
                    {user.status === 'active' && (
                      <button
                        onClick={() => suspendUser(user.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-red-500/30"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Suspendre</span>
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        onClick={() => reactivateUser(user.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl transition-all border border-green-500/30"
                      >
                        <Play className="w-4 h-4" />
                        <span>Réactiver</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

