import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { Users, CheckCircle, XCircle, Pause, Play, Clock, Shield, Building2, UserCog } from 'lucide-react'
import { adminSetUserStatus, adminAssignSchoolRole, adminGenerateSchoolCode, adminSyncSchoolCodes } from '../services/adminService'
import { useToast } from '../contexts/ToastContext'
import ConfirmDialog from './ConfirmDialog'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, active, suspended, school_leads, school_leads_pending
  const [actionLoading, setActionLoading] = useState(false)
  const [assignDialog, setAssignDialog] = useState({
    isOpen: false,
    user: null,
    role: 'school_admin',
    schoolId: '',
    approveFirst: false
  })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    type: 'danger',
    action: null
  })
  const [suspendDialog, setSuspendDialog] = useState({
    isOpen: false,
    userId: null,
    reason: ''
  })
  const { success, error: showError } = useToast()

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

      const schoolCodeRecords = usersData
        .filter((user) => ['school_admin', 'coach'].includes(user.role) && user.schoolId)
        .map((user) => ({ schoolId: user.schoolId, ownerUid: user.id }))
      if (schoolCodeRecords.length > 0) {
        await adminSyncSchoolCodes(schoolCodeRecords)
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      showError(error?.message || 'Erreur lors du chargement admin')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncSchoolCodes = async () => {
    try {
      setActionLoading(true)
      const schoolCodeRecords = users
        .filter((user) => ['school_admin', 'coach'].includes(user.role) && user.schoolId)
        .map((user) => ({ schoolId: user.schoolId, ownerUid: user.id }))
      const result = await adminSyncSchoolCodes(schoolCodeRecords)
      success(`Codes école synchronisés: ${result.synced}`)
    } catch (error) {
      console.error('Erreur synchronisation codes école:', error)
      showError(error?.message || 'Impossible de synchroniser les codes école')
    } finally {
      setActionLoading(false)
    }
  }

  const updateUserStatus = async (userId, newStatus, reason = '') => {
    try {
      setActionLoading(true)
      await adminSetUserStatus(userId, newStatus, reason)
      await loadUsers()
      success(`Statut mis à jour : ${newStatus}`)
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      showError(error?.message || 'Erreur lors de la mise à jour du statut')
    } finally {
      setActionLoading(false)
      setConfirmDialog(prev => ({ ...prev, isOpen: false, action: null }))
    }
  }

  const openConfirm = ({ title, message, confirmText, type = 'danger', action }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      type,
      action
    })
  }

  const approveUser = (userId) => {
    openConfirm({
      title: 'Approuver cet utilisateur',
      message: 'Cet utilisateur pourra accéder à l’application.',
      confirmText: 'Approuver',
      type: 'info',
      action: () => updateUserStatus(userId, 'active')
    })
  }

  const approveAndActivateSchool = (user) => {
    setAssignDialog({
      isOpen: true,
      user,
      role: 'school_admin',
      schoolId: user.schoolId || '',
      approveFirst: true
    })
  }

  const rejectUser = (userId) => {
    openConfirm({
      title: 'Rejeter cet utilisateur',
      message: 'Il ne pourra plus se connecter tant que son statut reste rejeté.',
      confirmText: 'Rejeter',
      type: 'danger',
      action: () => updateUserStatus(userId, 'rejected')
    })
  }

  const suspendUser = (userId) => {
    setSuspendDialog({ isOpen: true, userId, reason: '' })
  }

  const reactivateUser = (userId) => {
    openConfirm({
      title: 'Réactiver cet utilisateur',
      message: 'Son accès à l’application sera rétabli.',
      confirmText: 'Réactiver',
      type: 'info',
      action: () => updateUserStatus(userId, 'active')
    })
  }

  const submitSuspend = async () => {
    if (!suspendDialog.userId) return
    await updateUserStatus(suspendDialog.userId, 'suspended', suspendDialog.reason || 'Non spécifiée')
    setSuspendDialog({ isOpen: false, userId: null, reason: '' })
  }

  const assignSchoolRole = async (userId, role, schoolId = '') => {
    try {
      setActionLoading(true)
      await adminAssignSchoolRole(userId, role, schoolId)
      await loadUsers()
      if (role === 'user') {
        success('Compte remis en mode étudiant indépendant.')
      } else {
        success(`Rôle ${role} attribué avec succès.`)
      }
    } catch (error) {
      console.error('Erreur attribution rôle école:', error)
      showError(error?.message || 'Erreur lors de l’attribution du rôle école')
    } finally {
      setActionLoading(false)
    }
  }

  const openAssignDialog = (user, role) => {
    setAssignDialog({
      isOpen: true,
      user,
      role,
      schoolId: user.schoolId || '',
      approveFirst: false
    })
  }

  const confirmAssignSchoolRole = () => {
    const selectedSchoolId = assignDialog.schoolId?.trim()
    if (!assignDialog.user || !selectedSchoolId) {
      showError('Sélectionnez une école.')
      return
    }
    const run = async () => {
      try {
        setActionLoading(true)
        if (assignDialog.approveFirst) {
          await adminSetUserStatus(assignDialog.user.id, 'active')
        }
        await adminAssignSchoolRole(assignDialog.user.id, assignDialog.role, selectedSchoolId)
        await loadUsers()
        setAssignDialog({ isOpen: false, user: null, role: 'school_admin', schoolId: '', approveFirst: false })
        success(
          assignDialog.approveFirst
            ? 'Compte approuvé et activé en espace école.'
            : `Rôle ${assignDialog.role} attribué avec succès.`
        )
      } catch (error) {
        console.error('Erreur attribution rôle école:', error)
        showError(error?.message || 'Erreur lors de l’attribution du rôle école')
      } finally {
        setActionLoading(false)
      }
    }
    run()
  }

  const handleGenerateSchoolCode = async () => {
    try {
      setActionLoading(true)
      const result = await adminGenerateSchoolCode()
      setAssignDialog((prev) => ({ ...prev, schoolId: result.code }))
      success(`Code généré: ${result.code}`)
    } catch (error) {
      console.error('Erreur génération code école:', error)
      showError(error?.message || 'Impossible de générer un code école')
    } finally {
      setActionLoading(false)
    }
  }

  const resetToStudent = (user) => {
    openConfirm({
      title: 'Retirer le rôle école',
      message: `${user.email} repassera en compte étudiant indépendant.`,
      confirmText: 'Confirmer',
      type: 'danger',
      action: () => assignSchoolRole(user.id, 'user')
    })
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

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-700 dark:text-red-400', label: '🔐 Admin' },
      school_admin: { bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-700 dark:text-indigo-300', label: '🏫 École admin' },
      coach: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-700 dark:text-blue-300', label: '🧭 Coach' },
      user: { bg: 'bg-gray-500/10 border-gray-500/30', text: 'text-gray-700 dark:text-gray-300', label: '👤 Étudiant' }
    }
    return badges[role] || badges.user
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true
    if (filter === 'school_leads') return user.accountType === 'school'
    if (filter === 'school_leads_pending') return user.accountType === 'school' && user.status === 'pending'
    return user.status === filter
  })

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    schoolLeads: users.filter(u => u.accountType === 'school').length,
    schoolLeadsPending: users.filter(u => u.accountType === 'school' && u.status === 'pending').length
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-gray-600 dark:text-gray-400">Gestion des utilisateurs et approbations</p>
          <button
            onClick={handleSyncSchoolCodes}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-all disabled:opacity-60"
          >
            Synchroniser les codes école
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Leads École</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">{stats.schoolLeads}</p>
            </div>
            <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
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
        <button
          onClick={() => setFilter('school_leads')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'school_leads'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Leads École ({stats.schoolLeads})
        </button>
        <button
          onClick={() => setFilter('school_leads_pending')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'school_leads_pending'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Leads École en attente ({stats.schoolLeadsPending})
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
            const roleBadge = getRoleBadge(user.role || 'user')
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleBadge.bg} ${roleBadge.text}`}>
                        {roleBadge.label}
                      </span>
                      {user.schoolId && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                          <Building2 className="w-3 h-3 mr-1" />
                          {user.schoolId}
                        </span>
                      )}
                      {user.suspendedReason && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Raison: {user.suspendedReason}
                        </span>
                      )}
                    </div>
                    {user.accountType === 'school' && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Lead commercial école</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <strong>École:</strong> {user.schoolLead?.schoolName || 'N/A'} | <strong>Contact:</strong> {user.schoolLead?.contactName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <strong>Fonction:</strong> {user.schoolLead?.roleTitle || 'N/A'} | <strong>Téléphone:</strong> {user.schoolLead?.phone || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <strong>Volume:</strong> {user.schoolLead?.studentVolume || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveUser(user.id)}
                          disabled={actionLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-md"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approuver</span>
                        </button>
                        <button
                          onClick={() => rejectUser(user.id)}
                          disabled={actionLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-md"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rejeter</span>
                        </button>
                        {user.accountType === 'school' && (
                          <button
                            onClick={() => approveAndActivateSchool(user)}
                            disabled={actionLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-md"
                          >
                            <Building2 className="w-4 h-4" />
                            <span>Approuver + activer école</span>
                          </button>
                        )}
                      </>
                    )}
                    {user.status === 'active' && (
                      <button
                        onClick={() => suspendUser(user.id)}
                        disabled={actionLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-red-500/30"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Suspendre</span>
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        onClick={() => reactivateUser(user.id)}
                        disabled={actionLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl transition-all border border-green-500/30"
                      >
                        <Play className="w-4 h-4" />
                        <span>Réactiver</span>
                      </button>
                    )}

                    {user.role !== 'admin' && (
                      <>
                        {user.role !== 'school_admin' && (
                          <button
                            onClick={() => openAssignDialog(user, 'school_admin')}
                            disabled={actionLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl transition-all border border-indigo-500/30"
                          >
                            <Building2 className="w-4 h-4" />
                            <span>Compte école</span>
                          </button>
                        )}
                        {user.role !== 'coach' && (
                          <button
                            onClick={() => openAssignDialog(user, 'coach')}
                            disabled={actionLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl transition-all border border-blue-500/30"
                          >
                            <UserCog className="w-4 h-4" />
                            <span>Coach école</span>
                          </button>
                        )}
                        {user.role !== 'user' && (
                          <button
                            onClick={() => resetToStudent(user)}
                            disabled={actionLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-400/30"
                          >
                            <Users className="w-4 h-4" />
                            <span>Compte étudiant</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false, action: null }))}
        onConfirm={() => confirmDialog.action?.()}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />

      {assignDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-indigo-500/30 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Attribuer {assignDialog.role === 'coach' ? 'Coach école' : 'Compte école'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Définissez un code école pour {assignDialog.user?.email}.
            </p>
            <input
              type="text"
              value={assignDialog.schoolId}
              onChange={(e) => setAssignDialog(prev => ({ ...prev, schoolId: e.target.value }))}
              placeholder="Code école (ex: SCH-ABC123)"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              type="button"
              onClick={handleGenerateSchoolCode}
              disabled={actionLoading}
              className="w-full mb-4 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-500/30 transition-all disabled:opacity-60"
            >
              Générer un code école automatiquement
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={confirmAssignSchoolRole}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Confirmer
              </button>
              <button
                onClick={() => setAssignDialog({ isOpen: false, user: null, role: 'school_admin', schoolId: '', approveFirst: false })}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {suspendDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-red-500/30 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Suspendre cet utilisateur
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Indiquez une raison (optionnel) qui sera enregistrée dans son profil.
            </p>
            <textarea
              value={suspendDialog.reason}
              onChange={(e) => setSuspendDialog(prev => ({ ...prev, reason: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-red-500/40"
              placeholder="Raison de la suspension..."
            />
            <div className="flex items-center gap-3">
              <button
                onClick={submitSuspend}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Confirmer la suspension
              </button>
              <button
                onClick={() => setSuspendDialog({ isOpen: false, userId: null, reason: '' })}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

