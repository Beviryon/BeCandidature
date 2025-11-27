import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Linkedin, Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { addCandidature } from '../services/candidaturesService'
import { DEMO_MODE, getDemoCandidatures, saveDemoCandidatures, generateId, DEMO_USER } from '../demoData'

function LinkedInIntegration() {
  const navigate = useNavigate()
  const [importMode, setImportMode] = useState('manual')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [importing, setImporting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Parse LinkedIn URL to extract company info
  const parseLinkedInUrl = () => {
    if (!linkedinUrl) return

    try {
      const url = new URL(linkedinUrl)
      
      // Extract company name from URL patterns
      let company = ''
      if (url.hostname.includes('linkedin.com')) {
        // Pattern: /jobs/view/123456789 or /company/company-name
        const pathParts = url.pathname.split('/')
        if (pathParts.includes('company')) {
          const companyIndex = pathParts.indexOf('company')
          company = pathParts[companyIndex + 1] || ''
          company = company.replace(/-/g, ' ')
          company = company.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }
      }

      setParsedData({
        lien: linkedinUrl,
        entreprise: company || 'Entreprise LinkedIn',
        poste: '',
        statut: 'En attente',
        date_candidature: new Date().toISOString().split('T')[0],
        contact: '',
        notes: `Candidature depuis LinkedIn\nLien: ${linkedinUrl}`
      })
    } catch (error) {
      alert('URL LinkedIn invalide')
    }
  }

  const importFromLinkedIn = async () => {
    if (!parsedData) return

    setImporting(true)
    try {
      const dateRelance = new Date(parsedData.date_candidature)
      dateRelance.setDate(dateRelance.getDate() + 7)

      if (DEMO_MODE) {
        const candidatures = getDemoCandidatures()
        const nouvelleCandidature = {
          id: generateId(),
          user_id: DEMO_USER.id,
          ...parsedData,
          date_relance: dateRelance.toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        candidatures.unshift(nouvelleCandidature)
        saveDemoCandidatures(candidatures)
        setSuccess(true)
        setTimeout(() => navigate('/candidatures'), 2000)
        return
      }

      // Firebase
      await addCandidature({
        ...parsedData,
        date_relance: dateRelance.toISOString().split('T')[0],
      })
      
      setSuccess(true)
      setTimeout(() => navigate('/candidatures'), 2000)
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold gradient-text mb-2">
          Intégration LinkedIn
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Importez facilement vos candidatures depuis LinkedIn</p>
      </div>

      {/* Mode selection */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Comment voulez-vous importer ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setImportMode('manual')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              importMode === 'manual'
                ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <Linkedin className="w-12 h-12 text-blue-500 dark:text-blue-400 mb-3" />
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Import Manuel</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Copiez le lien d'une offre LinkedIn pour l'importer automatiquement
            </p>
          </button>

          <button
            onClick={() => setImportMode('guide')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              importMode === 'guide'
                ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                : 'border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20'
            }`}
          >
            <FileText className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-3" />
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Guide d'utilisation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suivez le guide pour optimiser vos candidatures LinkedIn
            </p>
          </button>
        </div>
      </div>

      {/* Import manuel */}
      {importMode === 'manual' && (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-lg space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Importer depuis LinkedIn</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Copiez le lien d'une offre d'emploi LinkedIn et collez-le ci-dessous
            </p>
          </div>

          {!parsedData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lien LinkedIn de l'offre
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                />
              </div>

              <button
                onClick={parseLinkedInUrl}
                disabled={!linkedinUrl}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Linkedin className="w-5 h-5" />
                <span>Analyser le lien</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-700 dark:text-green-300">Lien analysé avec succès !</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Complétez les informations ci-dessous avant d'importer
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    value={parsedData.entreprise}
                    onChange={(e) => setParsedData({...parsedData, entreprise: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Poste *
                  </label>
                  <input
                    type="text"
                    value={parsedData.poste}
                    onChange={(e) => setParsedData({...parsedData, poste: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de candidature
                  </label>
                  <input
                    type="date"
                    value={parsedData.date_candidature}
                    onChange={(e) => setParsedData({...parsedData, date_candidature: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact (optionnel)
                  </label>
                  <input
                    type="text"
                    value={parsedData.contact}
                    onChange={(e) => setParsedData({...parsedData, contact: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nom du recruteur"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setParsedData(null)
                    setLinkedinUrl('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
                >
                  Recommencer
                </button>
                <button
                  onClick={importFromLinkedIn}
                  disabled={importing || !parsedData.entreprise || !parsedData.poste}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Import...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Importé !</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Importer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide */}
      {importMode === 'guide' && (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-lg space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Guide LinkedIn</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Maximisez vos chances avec ces conseils
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Optimisez votre profil</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Photo professionnelle</li>
                    <li>• Titre accrocheur avec mots-clés</li>
                    <li>• Résumé détaillé avec vos compétences</li>
                    <li>• Expériences détaillées</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Personnalisez vos candidatures</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Mentionnez l'entreprise et le poste précis</li>
                    <li>• Adaptez votre message au recruteur</li>
                    <li>• Mettez en avant les compétences pertinentes</li>
                    <li>• Soyez concis mais impactant</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Réseau et engagement</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Connectez-vous avec les RH</li>
                    <li>• Commentez les posts des entreprises cibles</li>
                    <li>• Partagez du contenu pertinent</li>
                    <li>• Participez aux discussions de votre domaine</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Suivez vos candidatures</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Relancez après 7 jours</li>
                    <li>• Utilisez les templates de messages</li>
                    <li>• Trackez tout dans BeCandidature</li>
                    <li>• Analysez vos statistiques pour vous améliorer</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105"
            >
              <span>Voir les templates</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkedInIntegration

