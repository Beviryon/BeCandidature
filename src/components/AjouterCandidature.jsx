import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, Briefcase, Calendar, User, Link as LinkIcon, 
  FileText, Save, X, AlertCircle, Info 
} from 'lucide-react'
import { addCandidature } from '../services/candidaturesService'
import { DEMO_MODE, getDemoCandidatures, saveDemoCandidatures, generateId, DEMO_USER } from '../demoData'

function AjouterCandidature() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    entreprise: '',
    poste: '',
    date_candidature: new Date().toISOString().split('T')[0],
    statut: 'En attente',
    contact: '',
    lien: '',
    notes: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Calculer la date de relance uniquement pour "En attente" et "Entretien", pas pour "Refus"
      let dateRelance = ''
      if (formData.statut === 'En attente' || formData.statut === 'Entretien') {
        const relanceDate = new Date(formData.date_candidature)
        relanceDate.setDate(relanceDate.getDate() + 7)
        dateRelance = relanceDate.toISOString().split('T')[0]
      }

      if (DEMO_MODE) {
        const candidatures = getDemoCandidatures()
        const nouvelleCandidature = {
          id: generateId(),
          user_id: DEMO_USER.id,
          ...formData,
          date_relance: dateRelance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        candidatures.unshift(nouvelleCandidature)
        saveDemoCandidatures(candidatures)
        navigate('/candidatures')
        return
      }

      // Firebase
      await addCandidature({
        ...formData,
        date_relance: dateRelance,
      })
      
      navigate('/candidatures')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold gradient-text mb-2">
          Nouvelle Candidature
        </h2>
        <p className="text-gray-400">Ajoutez une nouvelle candidature à votre suivi</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-300">{error}</span>
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Ex: Google, Airbus..."
                required
              />
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Ex: Développeur Full Stack"
                required
              />
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="https://..."
              />
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
                La date de relance sera automatiquement calculée (+7 jours après la date de candidature)
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
                  <span>Ajout en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Ajouter la candidature</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AjouterCandidature
