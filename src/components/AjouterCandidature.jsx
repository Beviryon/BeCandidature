import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, Briefcase, Calendar, User, Link as LinkIcon, 
  FileText, Save, X, AlertCircle, Info, Mail, ExternalLink, Wand2, Sparkles, CheckCircle, FileCheck
} from 'lucide-react'
import { useCandidatures } from '../hooks/useCandidatures'
import { useToast } from '../contexts/ToastContext'

function AjouterCandidature() {
  const navigate = useNavigate()
  const { addCandidature, loading } = useCandidatures()
  const { success: showSuccess, error: showError, info } = useToast()
  const [errors, setErrors] = useState({})
  const [importMode, setImportMode] = useState('manual') // 'manual' or 'quick'
  const [quickImportType, setQuickImportType] = useState('link') // 'link' or 'email'
  const [quickImportValue, setQuickImportValue] = useState('')
  const [pageTitle, setPageTitle] = useState('') // Titre de la page pour aider l'extraction
  const [parsing, setParsing] = useState(false)

  const [formData, setFormData] = useState({
    entreprise: '',
    poste: '',
    date_candidature: new Date().toISOString().split('T')[0],
    statut: 'En attente',
    type_contrat: '',
    contact: '',
    email: '',
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

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Extraction depuis un lien d'offre avec fetch des métadonnées
  const parseJobLink = async (url) => {
    try {
      const urlObj = new URL(url)
      const extracted = {
        lien: url,
        entreprise: '',
        poste: '',
        email: '',
        contact: ''
      }

      // Essayer d'extraire depuis l'URL d'abord
      // LinkedIn
      if (urlObj.hostname.includes('linkedin.com')) {
        const pathParts = urlObj.pathname.split('/')
        
        if (pathParts.includes('jobs')) {
          const companyIndex = pathParts.indexOf('company')
          if (companyIndex !== -1 && pathParts[companyIndex + 1]) {
            let companyName = pathParts[companyIndex + 1]
            companyName = companyName.replace(/-/g, ' ')
            companyName = companyName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            extracted.entreprise = companyName
          }
        }
      }

      // Indeed
      if (urlObj.hostname.includes('indeed.com') || urlObj.hostname.includes('indeed.fr')) {
        const jobTitle = urlObj.searchParams.get('title')
        if (jobTitle) {
          extracted.poste = decodeURIComponent(jobTitle).replace(/\+/g, ' ')
        }
        const company = urlObj.searchParams.get('company')
        if (company) {
          extracted.entreprise = decodeURIComponent(company).replace(/\+/g, ' ')
        }
      }

      // Welcome to the Jungle
      if (urlObj.hostname.includes('welcometothejungle.com')) {
        const pathParts = urlObj.pathname.split('/')
        if (pathParts.includes('companies')) {
          const companyIndex = pathParts.indexOf('companies')
          if (pathParts[companyIndex + 1]) {
            let companyName = pathParts[companyIndex + 1]
            companyName = companyName.replace(/-/g, ' ')
            companyName = companyName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            extracted.entreprise = companyName
          }
        }
        if (pathParts.includes('jobs')) {
          const jobIndex = pathParts.indexOf('jobs')
          if (pathParts[jobIndex + 1]) {
            let jobTitle = pathParts[jobIndex + 1]
            jobTitle = jobTitle.replace(/-/g, ' ')
            jobTitle = jobTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            extracted.poste = jobTitle
          }
        }
      }

      // Essayer de fetch les métadonnées de la page via proxy CORS
      try {
        // Utiliser un proxy CORS public
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const htmlContent = data.contents || ''
          
          // Extraire les métadonnées Open Graph
          const ogTitleMatch = htmlContent.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
          if (ogTitleMatch && ogTitleMatch[1]) {
            const title = ogTitleMatch[1]
            // Format LinkedIn: "Poste | Entreprise"
            if (title.includes('|')) {
              const parts = title.split('|').map(p => p.trim())
              if (parts.length >= 2) {
                extracted.poste = parts[0]
                extracted.entreprise = parts[1]
              } else {
                extracted.poste = title
              }
            } else {
              extracted.poste = title
            }
          }

          // Extraire le titre de la page
          const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i)
          if (titleMatch && titleMatch[1] && !extracted.poste) {
            const title = titleMatch[1].trim()
            // Format LinkedIn: "Poste | Entreprise | LinkedIn"
            if (title.includes('|')) {
              const parts = title.split('|').map(p => p.trim()).filter(p => !p.toLowerCase().includes('linkedin') && !p.toLowerCase().includes('indeed'))
              if (parts.length >= 2) {
                extracted.poste = parts[0]
                extracted.entreprise = parts[1]
              } else if (parts.length === 1) {
                extracted.poste = parts[0]
              }
            } else {
              extracted.poste = title.replace(/\s*-\s*(LinkedIn|Indeed|Welcome to the Jungle|APEC).*$/i, '').trim()
            }
          }

          // Extraire l'entreprise depuis Open Graph
          const ogSiteNameMatch = htmlContent.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)
          if (ogSiteNameMatch && ogSiteNameMatch[1] && !extracted.entreprise) {
            extracted.entreprise = ogSiteNameMatch[1]
          }

          // Extraire depuis JSON-LD (structured data)
          const jsonLdMatches = htmlContent.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
          if (jsonLdMatches) {
            for (const match of jsonLdMatches) {
              try {
                const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '')
                const jsonData = JSON.parse(jsonContent)
                
                if (jsonData['@type'] === 'JobPosting' || jsonData['@type'] === 'JobPosting') {
                  if (jsonData.title && !extracted.poste) {
                    extracted.poste = jsonData.title
                  }
                  if (jsonData.hiringOrganization?.name && !extracted.entreprise) {
                    extracted.entreprise = jsonData.hiringOrganization.name
                  }
                }
                
                // Gérer les arrays
                if (Array.isArray(jsonData)) {
                  const jobPosting = jsonData.find(item => item['@type'] === 'JobPosting')
                  if (jobPosting) {
                    if (jobPosting.title && !extracted.poste) {
                      extracted.poste = jobPosting.title
                    }
                    if (jobPosting.hiringOrganization?.name && !extracted.entreprise) {
                      extracted.entreprise = jobPosting.hiringOrganization.name
                    }
                  }
                }
              } catch (e) {
                // Ignorer les erreurs de parsing JSON
              }
            }
          }
        }
      } catch (fetchError) {
        // Si le fetch échoue (CORS, etc.), on garde ce qu'on a extrait de l'URL
        console.log('Impossible de fetch la page (CORS ou autre erreur), utilisation des données de l\'URL uniquement')
      }

      return extracted
    } catch (err) {
      console.error('Erreur parsing lien:', err)
      return { lien: url, entreprise: '', poste: '', email: '', contact: '' }
    }
  }

  // Extraction depuis un email
  const parseEmailContent = (emailText) => {
    const extracted = {
      entreprise: '',
      poste: '',
      statut: 'En attente',
      email: '',
      contact: '',
      notes: emailText
    }

    // Extraction de l'entreprise
    const entreprisePatterns = [
      /(?:chez|at|pour|from)\s+([A-Z][A-Za-z0-9\s&-]{2,30})/i,
      /(?:société|company|entreprise)\s+([A-Z][A-Za-z0-9\s&-]{2,30})/i,
      /([A-Z][A-Za-z0-9\s&-]{2,30})(?:\s+recrute|\s+recherche)/i,
      /candidature.*?([A-Z][A-Za-z0-9\s&-]{2,30})/i
    ]
    
    for (const pattern of entreprisePatterns) {
      const match = emailText.match(pattern)
      if (match && match[1]) {
        extracted.entreprise = match[1].trim()
        break
      }
    }

    // Extraction du poste
    const postePatterns = [
      /(?:poste|position|role|emploi)\s+(?:de|d'|of)?\s*:?\s*([^\n.]{5,60})/i,
      /(?:développeur|developer|ingénieur|engineer|consultant|analyste|data scientist|designer)\s+([^\n.]{3,40})/i,
      /(?:candidature|application)\s+(?:pour|for)\s+(?:le poste|the position|le rôle)\s+(?:de|of)?\s*:?\s*([^\n.]{5,60})/i,
      /poste\s*:?\s*([^\n]{5,60})/i
    ]
    
    for (const pattern of postePatterns) {
      const match = emailText.match(pattern)
      if (match && match[1]) {
        extracted.poste = match[1].trim().replace(/^de\s+/i, '').trim()
        break
      }
    }

    // Extraction de l'email
    const emailMatch = emailText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
    if (emailMatch) {
      extracted.email = emailMatch[1]
    }

    // Extraction du nom du recruteur
    const nomPatterns = [
      /(?:cordialement|regards|sincerely|bien cordialement),?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /([A-Z][a-z]+\s+[A-Z][a-z]+)\s*(?:recruteur|recruiter|RH|HR|responsable)/i,
      /(?:signé|signature|from):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i
    ]
    
    for (const pattern of nomPatterns) {
      const match = emailText.match(pattern)
      if (match && match[1]) {
        extracted.contact = match[1].trim()
        break
      }
    }

    // Détection du statut
    if (/entretien|interview|rendez-vous|meeting|rencontre/i.test(emailText)) {
      extracted.statut = 'Entretien'
    } else if (/refus|regret|unfortunately|malheureusement|ne pouvons pas donner suite/i.test(emailText)) {
      extracted.statut = 'Refus'
    }

    return extracted
  }

  // Traiter l'import rapide
  const handleQuickImport = async () => {
    if (!quickImportValue.trim()) {
      showError('Veuillez entrer un lien ou coller un email')
      return
    }

    setParsing(true)
    
    try {
      let extracted = {}

      if (quickImportType === 'link') {
        // Vérifier si c'est une URL valide
        if (!isValidUrl(quickImportValue)) {
          showError('Veuillez entrer une URL valide')
          setParsing(false)
          return
        }
        info('Extraction des informations depuis le lien en cours...')
        extracted = await parseJobLink(quickImportValue)
        
        // Si l'utilisateur a fourni un titre de page, l'utiliser pour améliorer l'extraction
        if (pageTitle.trim()) {
          const title = pageTitle.trim()
          // Format LinkedIn: "Poste | Entreprise"
          if (title.includes('|')) {
            const parts = title.split('|').map(p => p.trim())
            if (parts.length >= 2) {
              extracted.poste = parts[0] || extracted.poste
              extracted.entreprise = parts[1] || extracted.entreprise
            } else if (parts.length === 1) {
              extracted.poste = parts[0] || extracted.poste
            }
          } else {
            // Essayer de détecter le format "Poste chez Entreprise"
            const chezMatch = title.match(/(.+?)\s+chez\s+(.+)/i)
            if (chezMatch) {
              extracted.poste = chezMatch[1].trim() || extracted.poste
              extracted.entreprise = chezMatch[2].trim() || extracted.entreprise
            } else {
              extracted.poste = title || extracted.poste
            }
          }
        }
        
        if (extracted.poste || extracted.entreprise) {
          showSuccess(`Informations extraites : ${extracted.poste || 'Poste'} ${extracted.entreprise ? `chez ${extracted.entreprise}` : ''}`)
        } else {
          info('Peu d\'informations extraites. Vous pouvez coller le titre de la page pour améliorer l\'extraction.')
        }
      } else {
        // Parser l'email
        extracted = parseEmailContent(quickImportValue)
        if (extracted.entreprise || extracted.poste) {
          showSuccess('Informations extraites depuis l\'email. Vérifiez et complétez si nécessaire.')
        } else {
          info('Informations extraites depuis l\'email. Vérifiez et complétez si nécessaire.')
        }
      }

      // Pré-remplir le formulaire
      setFormData(prev => ({
        ...prev,
        entreprise: extracted.entreprise || prev.entreprise,
        poste: extracted.poste || prev.poste,
        statut: extracted.statut || prev.statut,
        email: extracted.email || prev.email,
        contact: extracted.contact || prev.contact,
        lien: extracted.lien || prev.lien,
        notes: extracted.notes || prev.notes
      }))

      // Passer en mode formulaire manuel pour compléter
      setImportMode('manual')
      setQuickImportValue('')
      setPageTitle('')
    } catch (err) {
      console.error('Erreur extraction:', err)
      showError('Erreur lors de l\'extraction. Veuillez remplir le formulaire manuellement.')
    } finally {
      setParsing(false)
    }
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
      // Calculer la date de relance uniquement pour "En attente" et "Entretien", pas pour "Refus"
      let dateRelance = ''
      if (formData.statut === 'En attente' || formData.statut === 'Entretien') {
        const relanceDate = new Date(formData.date_candidature)
        relanceDate.setDate(relanceDate.getDate() + 7)
        dateRelance = relanceDate.toISOString().split('T')[0]
      }

      await addCandidature({
        ...formData,
        date_relance: dateRelance,
      })
      
      navigate('/candidatures')
    } catch (error) {
      // L'erreur est déjà gérée par le hook (toast)
      console.error('Error adding candidature:', error)
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

      {/* Mode selection */}
      <div className="mb-6 bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setImportMode('quick')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              importMode === 'quick'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Import Rapide
          </button>
          <button
            onClick={() => setImportMode('manual')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              importMode === 'manual'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Formulaire Manuel
          </button>
        </div>
      </div>

      {/* Import rapide */}
      {importMode === 'quick' && (
        <div className="mb-6 bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Import Rapide</h3>
          </div>

          {/* Type selection */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setQuickImportType('link')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                quickImportType === 'link'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Lien d'offre
            </button>
            <button
              onClick={() => setQuickImportType('email')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                quickImportType === 'email'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
          </div>

          {/* Input */}
          <div className="space-y-3">
            {quickImportType === 'link' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Collez le lien de l'offre d'emploi
                  </label>
                  <input
                    type="url"
                    value={quickImportValue}
                    onChange={(e) => setQuickImportValue(e.target.value)}
                    placeholder="https://www.linkedin.com/jobs/view/... ou https://www.indeed.com/viewjob?..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Titre de la page (optionnel - pour améliorer l'extraction)
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="Ex: Développeur Full Stack | Google ou Développeur Full Stack chez Google"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                  <p className="text-xs text-gray-400">
                    💡 Copiez le titre de l'onglet de votre navigateur pour améliorer l'extraction automatique
                  </p>
                </div>
                
                <p className="text-xs text-gray-400">
                  💡 Supporte LinkedIn, Indeed, Welcome to the Jungle, et autres plateformes
                </p>
              </>
            ) : (
              <>
                <label className="text-sm font-medium text-gray-300">
                  Collez le contenu de l'email
                </label>
                <textarea
                  value={quickImportValue}
                  onChange={(e) => setQuickImportValue(e.target.value)}
                  placeholder="Collez ici le contenu complet de votre email (confirmation de candidature, invitation entretien, etc.)"
                  rows="8"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                />
                <p className="text-xs text-gray-400">
                  💡 L'IA extrait automatiquement l'entreprise, le poste, le statut et les contacts
                </p>
              </>
            )}

            <button
              onClick={handleQuickImport}
              disabled={!quickImportValue.trim() || parsing}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {parsing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Extraction en cours...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Extraire les informations</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

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

      {/* Form - Toujours visible */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-8 border border-purple-500/20">
        {importMode === 'quick' && formData.entreprise && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-300">
                <strong>✅ Données extraites !</strong> Vérifiez et complétez les informations ci-dessous avant de sauvegarder.
              </div>
            </div>
          </div>
        )}
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

            {/* Type de contrat */}
            <div className="space-y-2">
              <label htmlFor="type_contrat" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <span>Type de contrat</span>
              </label>
              <select
                id="type_contrat"
                name="type_contrat"
                value={formData.type_contrat}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              >
                <option value="" className="bg-slate-800">Sélectionner...</option>
                <option value="CDI" className="bg-slate-800">CDI</option>
                <option value="CDD" className="bg-slate-800">CDD</option>
                <option value="Stage" className="bg-slate-800">Stage</option>
                <option value="Alternance" className="bg-slate-800">Alternance</option>
                <option value="Intérim" className="bg-slate-800">Intérim</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Email du recruteur</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                }`}
                placeholder="recruteur@entreprise.com"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contact (Nom, téléphone) */}
            <div className="space-y-2">
              <label htmlFor="contact" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <User className="w-4 h-4 text-purple-400" />
                <span>Contact (Nom, téléphone)</span>
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Ex: Jean Dupont, +33 6 12 34 56 78"
              />
            </div>

            {/* Lien de l'offre */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="lien" className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <LinkIcon className="w-4 h-4 text-purple-400" />
                <span>Lien de l'offre d'emploi</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="lien"
                  name="lien"
                  value={formData.lien}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                    errors.lien ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10'
                  }`}
                  placeholder="https://www.linkedin.com/jobs/view/... ou https://careers.entreprise.com/jobs/..."
                />
                {formData.lien && isValidUrl(formData.lien) && (
                  <a
                    href={formData.lien}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 transition-colors"
                    title="Ouvrir le lien dans un nouvel onglet"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {errors.lien && (
                <p className="text-xs text-red-400 mt-1">{errors.lien}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                💡 Ajoutez le lien de l'offre pour y accéder rapidement depuis votre liste de candidatures
              </p>
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
