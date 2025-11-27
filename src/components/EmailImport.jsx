import { useState } from 'react'
import { Mail, Upload, Wand2, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addCandidature } from '../services/candidaturesService'
import { DEMO_MODE, saveDemoCandidatures, getDemoCandidatures, generateId } from '../demoData'
import { auth } from '../firebaseConfig'

function EmailImport() {
  const [emailContent, setEmailContent] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const parseEmail = () => {
    setLoading(true)
    setError('')
    
    setTimeout(() => {
      try {
        const data = {
          entreprise: '',
          poste: '',
          statut: 'En attente',
          contact: '',
          notes: emailContent,
          date_candidature: new Date().toISOString().split('T')[0]
        }

        // Extraction intelligente de l'entreprise
        const entreprisePatterns = [
          /(?:chez|at|pour|from)\s+([A-Z][A-Za-z0-9\s&-]{2,30})/i,
          /(?:société|company|entreprise)\s+([A-Z][A-Za-z0-9\s&-]{2,30})/i,
          /([A-Z][A-Za-z0-9\s&-]{2,30})(?:\s+recrute|\s+recherche)/i
        ]
        
        for (const pattern of entreprisePatterns) {
          const match = emailContent.match(pattern)
          if (match) {
            data.entreprise = match[1].trim()
            break
          }
        }

        // Extraction du poste
        const postePatterns = [
          /(?:poste|position|role)\s+(?:de|d'|of)?\s*:?\s*([^\n.]{5,60})/i,
          /(?:développeur|developer|ingénieur|engineer|consultant|analyste)\s+([^\n.]{3,40})/i,
          /(?:candidature|application)\s+(?:pour|for)\s+(?:le poste|the position)\s+(?:de|of)?\s*:?\s*([^\n.]{5,60})/i
        ]
        
        for (const pattern of postePatterns) {
          const match = emailContent.match(pattern)
          if (match) {
            data.poste = match[1].trim()
            break
          }
        }

        // Extraction du contact (email)
        const emailMatch = emailContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
        if (emailMatch) {
          data.contact = emailMatch[1]
        }

        // Extraction du nom du recruteur
        const nomPatterns = [
          /(?:cordialement|regards|sincerely),?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
          /([A-Z][a-z]+\s+[A-Z][a-z]+)\s*(?:recruteur|recruiter|RH|HR)/i
        ]
        
        for (const pattern of nomPatterns) {
          const match = emailContent.match(pattern)
          if (match) {
            data.contact = match[1].trim() + (data.contact ? ` - ${data.contact}` : '')
            break
          }
        }

        // Détection du statut
        if (/entretien|interview|rendez-vous/i.test(emailContent)) {
          data.statut = 'Entretien'
        } else if (/refus|regret|unfortunately|malheureusement/i.test(emailContent)) {
          data.statut = 'Refus'
        }

        // Calcul de la date de relance (+7 jours)
        const dateRelance = new Date()
        dateRelance.setDate(dateRelance.getDate() + 7)
        data.date_relance = dateRelance.toISOString().split('T')[0]

        setParsedData(data)
        setLoading(false)
      } catch (err) {
        setError('Erreur lors de l\'analyse de l\'email. Essayez de copier plus de contenu.')
        setLoading(false)
      }
    }, 1000)
  }

  const saveCandidature = async () => {
    if (!parsedData) return

    try {
      setLoading(true)

      if (DEMO_MODE) {
        const candidatures = getDemoCandidatures()
        const newCandidature = {
          id: generateId(),
          user_id: 'demo-user-123',
          ...parsedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        saveDemoCandidatures([newCandidature, ...candidatures])
      } else {
        await addCandidature(parsedData)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/candidatures')
      }, 1500)
    } catch (err) {
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const exampleEmails = [
    {
      title: 'Confirmation de candidature',
      content: `Bonjour,

Nous avons bien reçu votre candidature pour le poste de Développeur Full Stack chez Google France.

Votre profil a retenu notre attention et nous reviendrons vers vous prochainement.

Cordialement,
Marie Dupont
Recruteur - marie.dupont@google.com`
    },
    {
      title: 'Invitation à un entretien',
      content: `Bonjour,

Suite à votre candidature pour le poste de Data Engineer chez Airbus, nous souhaiterions vous rencontrer pour un entretien.

Seriez-vous disponible la semaine prochaine ?

Bien cordialement,
Jean Martin - jean.martin@airbus.com
Responsable RH`
    },
    {
      title: 'Réponse négative',
      content: `Bonjour,

Nous vous remercions pour l'intérêt que vous portez à Decathlon et pour votre candidature au poste de Développeur DevOps.

Malheureusement, nous ne pouvons donner suite à votre candidature pour ce poste. Votre profil ne correspond pas exactement aux compétences recherchées.

Nous vous encourageons à consulter régulièrement nos offres.

Cordialement,
L'équipe RH Decathlon`
    }
  ]

  const useExample = (example) => {
    setEmailContent(example.content)
    setParsedData(null)
    setSuccess(false)
    setError('')
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold gradient-text mb-2">
          📧 Import d&apos;Emails
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Collez le contenu d&apos;un email et créez automatiquement une candidature
        </p>
      </div>

      {/* Examples */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3 mb-3">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Essayez avec un exemple :</strong>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {exampleEmails.map((example, index) => (
            <button
              key={index}
              onClick={() => useExample(example)}
              className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-lg text-left text-sm text-gray-700 dark:text-gray-300 border border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-purple-500" />
            Contenu de l&apos;email
          </h3>
          
          <textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Collez ici le contenu complet de votre email (confirmation de candidature, invitation entretien, etc.)"
            rows="15"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
          />

          <button
            onClick={parseEmail}
            disabled={!emailContent.trim() || loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
          >
            <Wand2 className="w-5 h-5" />
            <span>{loading ? 'Analyse en cours...' : 'Analyser l\'email'}</span>
          </button>
        </div>

        {/* Result */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Wand2 className="w-5 h-5 mr-2 text-green-500" />
            Données extraites
          </h3>

          {!parsedData && !error && !success && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Collez un email et cliquez sur &quot;Analyser&quot;
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-300">
                ✅ Candidature créée avec succès ! Redirection...
              </div>
            </div>
          )}

          {parsedData && !success && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={parsedData.entreprise}
                  onChange={(e) => setParsedData({ ...parsedData, entreprise: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Poste
                </label>
                <input
                  type="text"
                  value={parsedData.poste}
                  onChange={(e) => setParsedData({ ...parsedData, poste: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={parsedData.statut}
                  onChange={(e) => setParsedData({ ...parsedData, statut: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                >
                  <option value="En attente">En attente</option>
                  <option value="Entretien">Entretien</option>
                  <option value="Refus">Refus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contact
                </label>
                <input
                  type="text"
                  value={parsedData.contact}
                  onChange={(e) => setParsedData({ ...parsedData, contact: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date de candidature
                </label>
                <input
                  type="date"
                  value={parsedData.date_candidature}
                  onChange={(e) => setParsedData({ ...parsedData, date_candidature: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={saveCandidature}
                disabled={loading || !parsedData.entreprise || !parsedData.poste}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Créer la candidature</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-700 dark:text-purple-300">
            <strong>IA d&apos;extraction :</strong> Notre système détecte automatiquement l&apos;entreprise, 
            le poste, le statut et les contacts depuis n&apos;importe quel email. 
            Vous pouvez modifier les données extraites avant de sauvegarder.
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailImport

