import { useState } from 'react'
import { Mail, Upload, Wand2, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addCandidature } from '../services/candidaturesService'
import { DEMO_MODE, saveDemoCandidatures, getDemoCandidatures, generateId } from '../demoData'

const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

const STOP_WORDS_COMPANY = new Set([
  'bonjour', 'bonsoir', 'madame', 'monsieur', 'cordialement', 'merci', 'equipe', 'l equipe', 'hr', 'rh'
])

function normalizeText(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanExtractedValue(value = '') {
  return value
    .replace(/^[\s:;,\-–—|«»“"'`]+/, '')
    .replace(/[\s:;,\-–—|«»“"'`]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function scoreCompanyCandidate(value = '') {
  const cleaned = cleanExtractedValue(value)
  if (!cleaned || cleaned.length < 2) return 0

  const lower = normalizeText(cleaned).toLowerCase()
  if (STOP_WORDS_COMPANY.has(lower)) return 0

  let score = 0
  if (/[A-Z]/.test(cleaned)) score += 2
  if (/\b(SAS|SARL|SA|Groupe|Group|Inc|Ltd|Studio|Technologies|Solutions)\b/i.test(cleaned)) score += 2
  if (cleaned.split(' ').length <= 5) score += 1
  if (/^l[ea]\s+/i.test(cleaned)) score -= 1

  return score
}

function extractEntreprise(rawText) {
  const candidates = []
  const patterns = [
    /(?:chez|at|pour|from)\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})/g,
    /(?:entreprise|company|soci[eé]t[eé])\s*:?\s*([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})/g,
    /poste\s+de\s+[^\n.]{2,80}\s+chez\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})/gi,
    /(?:rejoindre|join)\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})/gi,
    /envers\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})\s+en\s+postulant/gi,
    /au\s+sein\s+de\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})/gi,
    /au\s+sein\s+de\s+(?:la|le|l['’])?\s*(commune|mairie|ville|collectivite)\s+de\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})/gi,
    /(?:commune|mairie|ville|collectivite)\s+de\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{2,80})/gi,
    /^([A-Z][A-Za-zÀ-ÖØ-öø-ÿ0-9&.\- ]{1,60})\s*-\s*\d{5}\s+[A-Za-zÀ-ÖØ-öø-ÿ\-\s]{2,60}$/gim
  ]

  patterns.forEach((pattern) => {
    for (const match of rawText.matchAll(pattern)) {
      const rawCandidate = match[2] ? `${match[1]} de ${match[2]}` : (match[1] || '')
      const candidate = cleanExtractedValue(rawCandidate)
      const score = scoreCompanyCandidate(candidate)
      if (score > 0) candidates.push({ value: candidate, score })
    }
  })

  const signatureLines = rawText
    .split('\n')
    .map((line) => cleanExtractedValue(line))
    .filter(Boolean)
    .slice(-8)

  signatureLines.forEach((line) => {
    if (/\b(recruteur|recruiter|rh|hr|talent|hiring)\b/i.test(line)) return
    if (/^[A-Z][A-Za-z0-9&.\- ]{2,40}$/.test(line)) {
      const score = scoreCompanyCandidate(line)
      if (score > 0) candidates.push({ value: line, score: score + 1 })
    }
  })

  if (candidates.length === 0) return { value: '', confidence: 'low' }
  const best = candidates.sort((a, b) => b.score - a.score)[0]
  return { value: best.value, confidence: best.score >= 4 ? 'high' : 'medium' }
}

function extractPoste(rawText) {
  const candidates = []
  const patterns = [
    /(?:poste|position|role|intitule)\s*(?:de|d'|of)?\s*:?\s*([^\n.]{4,120})/gi,
    /candidature\s+(?:pour|for)\s+(?:le poste|the position)?\s*(?:de|of)?\s*:?\s*([^\n.]{4,120})/gi,
    /candidature\s+envoy[éee]\s*\n+\s*([^\n]{6,140})/gi,
    /offre\s*[«"“]?([^»"\n]{6,140})[»"”]?/gi,
    /postul(?:é|e|er|ant)\s+[aà]\s+l['’]offre\s*[«"“]?([^»"\n]{6,140})[»"”]?/gi,
    /(?:developpeur|développeur|developer|ingenieur|ingénieur|consultant|analyste|data scientist|product manager|devops)\s+[^\n.]{0,50}/gi
  ]

  patterns.forEach((pattern) => {
    for (const match of rawText.matchAll(pattern)) {
      const candidate = cleanExtractedValue(match[1] || match[0] || '')
      if (!candidate) continue
      let score = 1
      if (candidate.length >= 8) score += 1
      if (/\b(stage|alternance|cdi|cdd)\b/i.test(candidate)) score += 1
      if (candidate.split(' ').length <= 8) score += 1
      candidates.push({ value: candidate, score })
    }
  })

  if (candidates.length === 0) return { value: '', confidence: 'low' }
  const best = candidates.sort((a, b) => b.score - a.score)[0]
  return { value: best.value, confidence: best.score >= 4 ? 'high' : 'medium' }
}

function extractRecruiterEmail(rawText) {
  const emails = Array.from(rawText.matchAll(EMAIL_REGEX)).map((m) => (m[1] || '').trim())
  if (emails.length === 0) return ''

  const prioritized = emails.filter((e) => !/noreply|no-reply|do-not-reply/i.test(e))
  return prioritized[0] || emails[0]
}

function extractContactName(rawText) {
  const patterns = [
    /(?:cordialement|bien cordialement|regards|sincerely|merci),?\s*([A-Z][A-Za-z' -]{2,40})/i,
    /([A-Z][A-Za-z' -]{2,40})\s*[-–—|]\s*(?:recruteur|recruiter|rh|hr|talent)/i,
    /(?:recruteur|recruiter|rh|hr|talent)\s*[-–—|:]\s*([A-Z][A-Za-z' -]{2,40})/i,
    /^([A-Z][A-Za-z' -]{2,40})\s+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/m
  ]

  for (const pattern of patterns) {
    const match = rawText.match(pattern)
    if (match?.[1]) return cleanExtractedValue(match[1])
  }

  return ''
}

function detectStatus(rawText) {
  const text = normalizeText(rawText).toLowerCase()

  const refusalSignals = /(refus|regret|unfortunately|malheureusement|ne pouvons donner suite|non retenu|not selected|declined|rejected|n['’]a pas ete retenu[e]?)/i
  const interviewSignals = /(entretien|interview|rendez[- ]vous|call|visio|meeting|echange|échange)/i
  const pendingSignals = /(sera examinee|sera examinée|dans les meilleurs delais|dans les meilleurs délais|aucune reponse|aucune réponse|votre candidature sera examinee|votre candidature sera examinée|candidature envoyee|bonne chance|prochaines etapes|peut vous contacter)/i
  const conditionalRefusalSignals = /(si\s+dans\s+un\s+delai|si\s+dans\s+un\s+délai|nous\s+vous\s+invitons\s+a\s+considerer|considere[rz]\s+que)/i

  // Cas typique d'accuse de reception: mention "n'a pas ete retenue" mais au conditionnel/futur
  if (refusalSignals.test(text) && conditionalRefusalSignals.test(text) && pendingSignals.test(text)) {
    return { value: 'En attente', confidence: 'medium' }
  }

  if (refusalSignals.test(text)) return { value: 'Refus', confidence: 'high' }
  if (interviewSignals.test(text)) return { value: 'Entretien', confidence: 'medium' }
  if (pendingSignals.test(text)) return { value: 'En attente', confidence: 'medium' }
  return { value: 'En attente', confidence: 'low' }
}

function evaluateExtractionConfidence(data, rawText, diagnostics = {}) {
  let score = 0
  const strengths = []
  const corrections = []

  if (data.entreprise?.trim()) {
    score += diagnostics.entrepriseConfidence === 'high' ? 30 : 24
    strengths.push('Entreprise détectée')
  } else {
    corrections.push('Entreprise manquante')
  }

  if (data.poste?.trim()) {
    score += diagnostics.posteConfidence === 'high' ? 28 : 22
    strengths.push('Poste détecté')
  } else {
    corrections.push('Poste manquant')
  }

  if (data.email?.trim()) {
    score += 16
    strengths.push('Email recruteur détecté')
  } else {
    corrections.push('Email recruteur non détecté')
  }

  if (data.contact?.trim()) {
    score += 10
    strengths.push('Contact détecté')
  } else {
    corrections.push('Contact à vérifier')
  }

  if (diagnostics.statusConfidence === 'high') score += 12
  else if (diagnostics.statusConfidence === 'medium') score += 8
  else {
    score += 4
    corrections.push('Statut probablement générique')
  }

  const richText = (rawText || '').trim().length >= 200
  score += richText ? 6 : 2
  if (!richText) corrections.push('Email trop court pour une extraction très fiable')

  score = Math.min(100, score)

  let level = 'Faible'
  if (score >= 80) level = 'Élevé'
  else if (score >= 60) level = 'Moyen'

  return { score, level, strengths, corrections }
}

function EmailImport() {
  const [emailContent, setEmailContent] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const parseEmail = () => {
    setLoading(true)
    setError('')
    setParsedData(null)
    setDiagnostics(null)
    
    setTimeout(() => {
      try {
        const raw = emailContent.trim()
        if (raw.length < 25) {
          throw new Error('CONTENU_TROP_COURT')
        }

        const entreprise = extractEntreprise(raw)
        const poste = extractPoste(raw)
        const status = detectStatus(raw)
        const recruiterEmail = extractRecruiterEmail(raw)
        const contactName = extractContactName(raw)

        const data = {
          entreprise: entreprise.value || '',
          poste: poste.value || '',
          statut: status.value,
          email: recruiterEmail,
          contact: contactName,
          notes: raw,
          date_candidature: new Date().toISOString().split('T')[0]
        }

        // Calcul de la date de relance (+7 jours) uniquement si candidature active
        if (data.statut !== 'Refus') {
          const dateRelance = new Date()
          dateRelance.setDate(dateRelance.getDate() + 7)
          data.date_relance = dateRelance.toISOString().split('T')[0]
        } else {
          data.date_relance = ''
        }

        setDiagnostics({
          entrepriseConfidence: entreprise.confidence,
          posteConfidence: poste.confidence,
          statusConfidence: status.confidence
        })
        setParsedData(data)
        setLoading(false)
      } catch (err) {
        if (err?.message === 'CONTENU_TROP_COURT') {
          setError('Email trop court. Collez un contenu plus complet pour une extraction fiable.')
        } else {
          setError('Erreur lors de l\'analyse de l\'email. Essayez de copier plus de contenu.')
        }
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
      setDiagnostics(null)
    setSuccess(false)
    setError('')
  }

  const extractionConfidence = parsedData
    ? evaluateExtractionConfidence(parsedData, emailContent, diagnostics)
    : null

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
              {/* Score de confiance */}
              {extractionConfidence && (
                <div className="p-4 rounded-xl border bg-white/70 dark:bg-white/5 border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Score de confiance</p>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      extractionConfidence.score >= 80
                        ? 'text-green-700 dark:text-green-300 border-green-500/40 bg-green-500/10'
                        : extractionConfidence.score >= 60
                          ? 'text-orange-700 dark:text-orange-300 border-orange-500/40 bg-orange-500/10'
                          : 'text-red-700 dark:text-red-300 border-red-500/40 bg-red-500/10'
                    }`}>
                      {extractionConfidence.level} ({extractionConfidence.score}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all ${
                        extractionConfidence.score >= 80
                          ? 'bg-green-500'
                          : extractionConfidence.score >= 60
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${extractionConfidence.score}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300 mb-1">Détecté correctement</p>
                      <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                        {extractionConfidence.strengths.slice(0, 3).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-orange-700 dark:text-orange-300 mb-1">À vérifier</p>
                      <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                        {extractionConfidence.corrections.slice(0, 3).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

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
                  Email recruteur
                </label>
                <input
                  type="email"
                  value={parsedData.email || ''}
                  onChange={(e) => setParsedData({ ...parsedData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
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

