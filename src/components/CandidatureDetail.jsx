import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Building2,
  Briefcase,
  Calendar,
  User,
  Link as LinkIcon,
  FileText,
  ArrowLeft,
  RefreshCw,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Mail,
  FileCheck,
  Send,
  Plus
} from 'lucide-react'
import { useCandidatures } from '../hooks/useCandidatures'
import Loading from './Loading'
import { useToast } from '../contexts/ToastContext'

const STATUS_OPTIONS = [
  { value: 'En attente', label: 'En attente', color: 'text-orange-400' },
  { value: 'Entretien', label: 'Entretien', color: 'text-green-400' },
  { value: 'Refus', label: 'Refus', color: 'text-red-400' }
]

const statusIcon = {
  'En attente': Clock,
  'Entretien': CheckCircle,
  'Refus': XCircle
}

function CandidatureDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCandidature, updateCandidature } = useCandidatures()
  const { success, error: showError, info } = useToast()

  const [candidature, setCandidature] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [showRelanceForm, setShowRelanceForm] = useState(false)
  const [relanceDate, setRelanceDate] = useState(new Date().toISOString().split('T')[0])
  const [relanceNote, setRelanceNote] = useState('')
  const [relanceType, setRelanceType] = useState('Email')
  const [savingRelance, setSavingRelance] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getCandidature(id)
        setCandidature(data)
        setStatus(data?.statut || '')
      } catch (err) {
        showError(err.message || 'Erreur lors du chargement de la candidature')
        navigate('/candidatures')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getCandidature, id, navigate, showError])

  const timeline = useMemo(() => {
    if (!candidature) return []

    const base = [{
      status: candidature.statut,
      note: 'Statut actuel',
      date: candidature.updated_at || candidature.date_candidature
    }]

    const history = candidature.history || []
    return [...history].reverse().concat(base)
  }, [candidature])

  const formatDate = (date) => {
    if (!date) return '-'
    const parsed = date?.toDate ? date.toDate() : new Date(date)
    return parsed.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusUpdate = async () => {
    if (!status || !candidature) return
    if (status === candidature.statut && !note.trim()) {
      info('Aucune modification détectée')
      return
    }

    try {
      setSaving(true)
      const newEntry = {
        status,
        note: note.trim(),
        date: new Date().toISOString()
      }

      const updatedHistory = [...(candidature.history || []), newEntry]
      const payload = {
        ...candidature,
        statut: status,
        history: updatedHistory
      }

      await updateCandidature(id, payload)
      setCandidature(payload)
      setNote('')
      success('Statut mis à jour')
    } catch (err) {
      showError(err.message || 'Erreur lors de la mise à jour du statut')
    } finally {
      setSaving(false)
    }
  }

  const handleAddRelance = async () => {
    if (!relanceDate || !candidature) return

    try {
      setSavingRelance(true)
      const newRelance = {
        date: relanceDate,
        type: relanceType,
        note: relanceNote.trim(),
        created_at: new Date().toISOString()
      }

      const updatedRelances = [...(candidature.relances || []), newRelance]
      
      // Mettre à jour aussi la date_relance avec la dernière relance
      const lastRelanceDate = updatedRelances
        .map(r => r.date)
        .sort()
        .reverse()[0]

      const payload = {
        ...candidature,
        relances: updatedRelances,
        date_relance: lastRelanceDate
      }

      await updateCandidature(id, payload)
      setCandidature(payload)
      setRelanceDate(new Date().toISOString().split('T')[0])
      setRelanceNote('')
      setRelanceType('Email')
      setShowRelanceForm(false)
      success('Relance ajoutée à l\'historique')
    } catch (err) {
      showError(err.message || 'Erreur lors de l\'ajout de la relance')
    } finally {
      setSavingRelance(false)
    }
  }

  const relances = candidature?.relances || []
  const sortedRelances = [...relances].sort((a, b) => {
    const dateA = new Date(a.date || a.created_at)
    const dateB = new Date(b.date || b.created_at)
    return dateB - dateA // Plus récent en premier
  })

  if (loading || !candidature) {
    return <Loading message="Chargement de la candidature..." />
  }

  const StatusIcon = statusIcon[candidature.statut] || Target
  const statusColor = STATUS_OPTIONS.find(s => s.value === candidature.statut)?.color || 'text-gray-300'

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-1">Détail de la candidature</h2>
          <p className="text-gray-400">Suivez l'historique et mettez à jour le statut</p>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">{candidature.entreprise}</h3>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Briefcase className="w-4 h-4" />
              <span>{candidature.poste}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Envoyée le {formatDate(candidature.date_candidature)}</span>
            </div>
            {candidature.type_contrat && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <span>Type de contrat : {candidature.type_contrat}</span>
              </div>
            )}
            {candidature.email && (
              <a
                href={`mailto:${candidature.email}`}
                className="inline-flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{candidature.email}</span>
              </a>
            )}
            {candidature.contact && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <User className="w-4 h-4 text-purple-400" />
                <span className="truncate">{candidature.contact}</span>
              </div>
            )}
            {candidature.lien && (
              <a
                href={candidature.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Voir l'offre</span>
              </a>
            )}
          </div>

          <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
            <span className={`font-semibold ${statusColor}`}>{candidature.statut}</span>
          </div>
        </div>

        {candidature.notes && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-2 mb-2 text-gray-200">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">Notes</span>
            </div>
            <p className="text-sm text-gray-300 whitespace-pre-line">{candidature.notes}</p>
          </div>
        )}
      </div>

      {/* Mise à jour du statut */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 text-gray-200">
          <RefreshCw className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-semibold">Mettre à jour le statut</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Nouveau statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Note (optionnelle)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Relance envoyée, entretien planifié..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleStatusUpdate}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Mise à jour...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
          <Link
            to={`/modifier/${id}`}
            className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-200 rounded-xl border border-white/10 transition-colors"
          >
            Modifier la fiche
          </Link>
        </div>
      </div>

      {/* Historique des relances */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-200">
            <Send className="w-5 h-5 text-purple-400" />
            <h4 className="text-lg font-semibold">Historique des relances</h4>
            {sortedRelances.length > 0 && (
              <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                {sortedRelances.length} relance{sortedRelances.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowRelanceForm(!showRelanceForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl border border-purple-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une relance</span>
          </button>
        </div>

        {/* Formulaire d'ajout de relance */}
        {showRelanceForm && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-purple-500/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Date de la relance</label>
                <input
                  type="date"
                  value={relanceDate}
                  onChange={(e) => setRelanceDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Type de relance</label>
                <select
                  value={relanceType}
                  onChange={(e) => setRelanceType(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="Email" className="bg-slate-800">Email</option>
                  <option value="Appel téléphonique" className="bg-slate-800">Appel téléphonique</option>
                  <option value="LinkedIn" className="bg-slate-800">LinkedIn</option>
                  <option value="Autre" className="bg-slate-800">Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Note (optionnelle)</label>
                <input
                  type="text"
                  value={relanceNote}
                  onChange={(e) => setRelanceNote(e.target.value)}
                  placeholder="Ex: Relance envoyée, réponse positive..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddRelance}
                disabled={savingRelance || !relanceDate}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingRelance ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Ajout...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer la relance</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowRelanceForm(false)
                  setRelanceNote('')
                }}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-gray-200 rounded-xl border border-white/10 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des relances */}
        {sortedRelances.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-gray-400">Aucune relance enregistrée pour le moment.</p>
            <p className="text-xs text-gray-500 mt-2">Cliquez sur "Ajouter une relance" pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRelances.map((relance, idx) => {
              const relanceDate = relance.date || relance.created_at
              const dateObj = relanceDate?.toDate ? relanceDate.toDate() : new Date(relanceDate)
              const isRecent = (new Date() - dateObj) < 7 * 24 * 60 * 60 * 1000 // Moins de 7 jours
              
              return (
                <div
                  key={`${relance.date || relance.created_at}-${idx}`}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className={`mt-1 w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center ${isRecent ? 'ring-2 ring-purple-500/50' : ''}`}>
                    <Send className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-white">{relance.type || 'Email'}</span>
                        {isRecent && (
                          <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                            Récente
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(relanceDate)}
                      </div>
                    </div>
                    {relance.note && (
                      <p className="text-sm text-gray-300 mt-2">{relance.note}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Historique / Timeline */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4 text-gray-200">
          <AlertCircle className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-semibold">Historique des statuts</h4>
        </div>

        {timeline.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun historique pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {timeline.map((entry, idx) => {
              const Icon = statusIcon[entry.status] || Target
              const color = STATUS_OPTIONS.find(s => s.value === entry.status)?.color || 'text-gray-300'
              return (
                <div key={`${entry.date}-${idx}`} className="flex items-start space-x-3">
                  <div className={`mt-1 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${color.replace('text', 'bg').replace('-400', '-500/20')}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">{entry.status}</div>
                      <div className="text-xs text-gray-400">{formatDate(entry.date)}</div>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-gray-300 mt-1">{entry.note}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidatureDetail


