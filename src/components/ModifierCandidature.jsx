import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Building2, Briefcase, Calendar, User, Link as LinkIcon, 
  FileText, Save, X, AlertCircle, Info 
} from 'lucide-react'
import { useCandidatures } from '../hooks/useCandidatures'
import { DEMO_MODE, getDemoCandidatures } from '../demoData'
import Loading from './Loading'

function ModifierCandidature() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCandidature, updateCandidature, candidatures } = useCandidatures()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    entreprise: '',
    poste: '',
    date_candidature: '',
    statut: 'En attente',
    contact: '',
    lien: '',
    notes: '',
  })

  useEffect(() => {
    fetchCandidature()
  }, [id])

  const fetchCandidature = async () => {
    try {
      setLoadingData(true)
      
      let data
      if (DEMO_MODE) {
        const demoCandidatures = getDemoCandidatures()
        data = demoCandidatures.find(c => c.id === id)
      } else {
        data = await getCandidature(id)
      }

      if (!data) {
        throw new Error('Candidature non trouvée')
      }

      setFormData({
        entreprise: data.entreprise,
        poste: data.poste,
        date_candidature: data.date_candidature,
        statut: data.statut,
        contact: data.contact || '',
        lien: data.lien || '',
        notes: data.notes || '',
      })
    } catch (error) {
      // L'erreur sera gérée par le hook
      console.error('Error fetching candidature:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {}

    if (!formData.entreprise.trim()) {
      newErrors.entreprise = 'Le nom de l\'entreprise est requis'
    }

    if (!formData.poste.trim()) {
      newErrors.poste = 'Le poste est requis'
    }

    if (!formData.date_candidature) {
      newErrors.date_candidature = 'La date de candidature est requise'
    } else {
      const date = new Date(formData.date_candidature)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date > today) {
        newErrors.date_candidature = 'La date ne peut pas être dans le futur'
      }
    }

    if (formData.lien && !isValidUrl(formData.lien)) {
      newErrors.lien = 'Veuillez entrer une URL valide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      // Calculer la date de relance uniquement pour "En attente" et "Entretien", pas pour "Refus"
      let dateRelance = ''
      if (formData.statut === 'En attente' || formData.statut === 'Entretien') {
        const relanceDate = new Date(formData.date_candidature)
        relanceDate.setDate(relanceDate.getDate() + 7)
        dateRelance = relanceDate.toISOString().split('T')[0]
      }

      await updateCandidature(id, {
        ...formData,
        date_relance: dateRelance,
      })
      
      navigate('/candidatures')
    } catch (error) {
      // L'erreur est déjà gérée par le hook (toast)
      console.error('Error updating candidature:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return <Loading message="Chargement de la candidature..." />
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold gradient-text mb-2">
          Modifier la Candidature
        </h2>
        <p className="text-gray-400">Mettez à jour les informations de votre candidature</p>
      </div>

      {/* Error messages */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300 mb-2">Veuillez corriger les erreurs suivantes :</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-200">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-8 border border-purple-500/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid layout for form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entreprise */}
            <div className="space-y-2">
              <label htmlFor="entreprise" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Entreprise *</span>
              </label>
              <input
                type="text"
                id="entreprise"
                name="entreprise"
                value={formData.entreprise}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.entreprise ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                }`}
                placeholder="Ex: Google, Airbus..."
                required
              />
              {errors.entreprise && (
                <p className="text-xs text-red-400 mt-1">{errors.entreprise}</p>
              )}
            </div>

            {/* Poste */}
            <div className="space-y-2">
              <label htmlFor="poste" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>Poste *</span>
              </label>
              <input
                type="text"
                id="poste"
                name="poste"
                value={formData.poste}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.poste ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                }`}
                placeholder="Ex: Développeur Full Stack"
                required
              />
              {errors.poste && (
                <p className="text-xs text-red-400 mt-1">{errors.poste}</p>
              )}
            </div>

            {/* Date de candidature */}
            <div className="space-y-2">
              <label htmlFor="date_candidature" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Date de candidature *</span>
              </label>
              <input
                type="date"
                id="date_candidature"
                name="date_candidature"
                value={formData.date_candidature}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.date_candidature ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                }`}
                required
              />
              {errors.date_candidature && (
                <p className="text-xs text-red-400 mt-1">{errors.date_candidature}</p>
              )}
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <label htmlFor="statut" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Statut *</span>
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              >
                <option value="En attente" className="bg-slate-800">En attente</option>
                <option value="Entretien" className="bg-slate-800">Entretien</option>
                <option value="Refus" className="bg-slate-800">Refus</option>
              </select>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label htmlFor="contact" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <User className="w-4 h-4 text-purple-400" />
                <span>Contact</span>
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Nom, email, téléphone..."
              />
            </div>

            {/* Lien */}
            <div className="space-y-2">
              <label htmlFor="lien" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <LinkIcon className="w-4 h-4 text-purple-400" />
                <span>Lien de l'offre</span>
              </label>
              <input
                type="url"
                id="lien"
                name="lien"
                value={formData.lien}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.lien ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                }`}
                placeholder="https://..."
              />
              {errors.lien && (
                <p className="text-xs text-red-400 mt-1">{errors.lien}</p>
              )}
            </div>
          </div>

          {/* Notes - full width */}
          <div className="space-y-2">
            <label htmlFor="notes" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Notes</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Informations complémentaires, impressions, détails de l'entretien..."
            ></textarea>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">
                La date de relance sera automatiquement recalculée (+7 jours après la date de candidature)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/candidatures')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <X className="w-5 h-5" />
              <span className="font-medium">Annuler</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModifierCandidature
