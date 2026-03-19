import { useState, useRef, useEffect, useMemo } from 'react'
import { 
  Send, Bot, User, Copy, Sparkles, Mail, 
  CheckCircle, Wand2, Brain, TrendingUp, Lightbulb,
  Loader2, Stars, Rocket, FileText, ExternalLink, ChevronDown, ChevronUp, Target
} from 'lucide-react'
import { generateAIResponse } from '../services/openaiService'
import { useToast } from '../contexts/ToastContext'

const JD_TECH_KEYWORDS = [
  'react', 'javascript', 'typescript', 'node.js', 'node', 'python', 'sql', 'nosql',
  'java', 'spring', 'docker', 'kubernetes', 'git', 'ci/cd', 'aws', 'azure', 'gcp',
  'api', 'rest', 'graphql', 'agile', 'scrum', 'jira', 'figma', 'power bi', 'excel',
  'communication', 'autonomie', 'analyse', 'gestion de projet', 'leadership'
]

function AssistantIA() {
  const { success } = useToast()
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Bonjour ! Je suis votre assistant IA personnel pour vos candidatures. Je peux vous aider à rédiger des lettres de motivation, des emails de relance, analyser votre profil et vous donner des conseils personnalisés. Comment puis-je vous aider aujourd\'hui ?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)
  const [isQuickModesOpen, setIsQuickModesOpen] = useState(false)
  const [jdText, setJdText] = useState('')
  const [profileSkills, setProfileSkills] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const apiEnabled = Boolean((import.meta.env.VITE_AI_FUNCTION_URL || '').trim())
  const showTechnicalInfo = import.meta.env.DEV

  const jdAnalysis = useMemo(() => {
    const normalizedJd = (jdText || '').toLowerCase()
    const normalizedSkills = (profileSkills || '').toLowerCase()
    if (!normalizedJd.trim()) {
      return {
        keywords: [],
        matched: [],
        missing: [],
        score: 0,
        actions: []
      }
    }

    const extracted = JD_TECH_KEYWORDS.filter((kw) => normalizedJd.includes(kw))
    const uniqueKeywords = Array.from(new Set(extracted)).slice(0, 20)
    const matched = uniqueKeywords.filter((kw) => normalizedSkills.includes(kw))
    const missing = uniqueKeywords.filter((kw) => !normalizedSkills.includes(kw))
    const score = uniqueKeywords.length > 0 ? Math.round((matched.length / uniqueKeywords.length) * 100) : 0

    const actions = []
    if (missing.length > 0) {
      actions.push(`Ajoutez ces mots-clés dans CV/LM: ${missing.slice(0, 6).join(', ')}`)
    }
    if (targetRole.trim()) {
      actions.push(`Adaptez votre pitch à "${targetRole}" avec 2 réalisations mesurables.`)
    }
    actions.push('Préparez 1 exemple STAR par compétence clé demandée.')

    return {
      keywords: uniqueKeywords,
      matched,
      missing,
      score,
      actions
    }
  }, [jdText, profileSkills, targetRole])

  const assistantModes = [
    {
      id: 'lettre',
      name: 'Lettre de motivation',
      description: 'Rédigez une lettre de motivation percutante',
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      prompt: 'Aide-moi à écrire une lettre de motivation pour le poste de [POSTE] chez [ENTREPRISE]. Voici mon profil : [PROFIL]'
    },
    {
      id: 'conseils',
      name: 'Conseils personnalisés',
      description: 'Obtenez des conseils pour améliorer vos candidatures',
      icon: Lightbulb,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      prompt: 'Donne-moi des conseils pour améliorer mes candidatures. J\'ai envoyé [NOMBRE] candidatures et obtenu [NOMBRE] entretiens.'
    },
    {
      id: 'relance',
      name: 'Email de relance',
      description: 'Rédigez un email de relance professionnel',
      icon: Mail,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      prompt: 'Rédige un email de relance professionnel pour [ENTREPRISE]. J\'ai postulé il y a [JOURS] jours pour le poste de [POSTE].'
    },
    {
      id: 'analyse',
      name: 'Analyse de profil',
      description: 'Analysez votre profil et obtenez des suggestions',
      icon: Brain,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-500/30',
      prompt: 'Analyse mon profil et suggère des améliorations. Compétences : [COMPETENCES]. Expérience : [EXPERIENCE].'
    },
    {
      id: 'cv',
      name: 'Optimisation CV',
      description: 'Optimisez votre CV pour un poste spécifique',
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/30',
      prompt: 'Aide-moi à optimiser mon CV pour le poste de [POSTE] chez [ENTREPRISE]. Voici mes compétences : [COMPETENCES]'
    },
    {
      id: 'entretien',
      name: 'Préparation entretien',
      description: 'Préparez-vous pour vos entretiens d\'embauche',
      icon: Rocket,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-500/10 to-rose-500/10',
      borderColor: 'border-pink-500/30',
      prompt: 'Aide-moi à me préparer pour un entretien chez [ENTREPRISE] pour le poste de [POSTE]. Quelles questions devrais-je poser ?'
    }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const callAIService = async (userMessage) => {
    setLoading(true)
    
    try {
      const conversationHistory = messages
        .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await generateAIResponse(userMessage, conversationHistory)
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error('Erreur:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer dans quelques instants.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input
    setInput('')
    setSelectedMode(null)
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    await callAIService(userMessage)
  }

  const handleModeSelect = async (mode) => {
    if (loading) return
    setSelectedMode(mode.id)
    const userMessage = mode.prompt
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    await callAIService(userMessage)
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    success('Texte copié dans le presse-papiers !')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const openMailDraft = (subject, body) => {
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  const copyAndOpenMail = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    success('Texte copie et client mail ouvert')
    openMailDraft('Message de candidature', text)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Bonjour ! Je suis votre assistant IA personnel pour vos candidatures. Je peux vous aider à rédiger des lettres de motivation, des emails de relance, analyser votre profil et vous donner des conseils personnalisés. Comment puis-je vous aider aujourd\'hui ?'
      }
    ])
    setInput('')
    setSelectedMode(null)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header avec gradient animé */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-white/80 flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <span>Assistant IA</span>
                {apiEnabled && (
                    <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full flex items-center space-x-1">
                    <Stars className="w-4 h-4" />
                      <span>IA sécurisée</span>
                  </span>
                )}
              </h2>
              <p className="text-white/90 text-lg">
                Votre coach personnel pour réussir vos candidatures
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">En ligne</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panneau de prompts rapides */}
        <div className="lg:col-span-4 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setIsQuickModesOpen((prev) => !prev)}
              className="flex items-center space-x-2"
            >
              <Wand2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Modèles rapides</h3>
              {isQuickModesOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={clearChat}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/60 dark:bg-white/5 border border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10"
            >
              Nouvelle conversation
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Clique sur un modèle pour générer une réponse automatiquement.
          </p>
          {isQuickModesOpen && (
            <div className="space-y-2">
              {assistantModes.map(mode => {
                const Icon = mode.icon
                const isSelected = selectedMode === mode.id
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode)}
                    disabled={loading}
                    className={`w-full group p-3 rounded-xl border transition-all duration-300 text-left disabled:opacity-60 disabled:cursor-not-allowed ${
                      isSelected
                        ? `${mode.borderColor} ${mode.bgGradient} bg-gradient-to-br shadow-md`
                        : 'border-white/10 bg-white/60 dark:bg-white/5 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${mode.gradient}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-white">{mode.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{mode.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Zone conversation */}
        <div className="lg:col-span-8 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl overflow-hidden">
          <div className="px-4 md:px-6 py-3 border-b border-purple-500/20 flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Conversation</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{messages.length - 1 > 0 ? `${messages.length - 1} message(s)` : 'Aucun message utilisateur pour le moment'}</p>
            </div>
            {loading && (
              <span className="text-xs text-purple-600 dark:text-purple-300 inline-flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generation...
              </span>
            )}
          </div>

          <div className="h-[360px] md:h-[430px] lg:h-[500px] overflow-y-auto p-4 md:p-6 space-y-5 bg-gradient-to-b from-white/50 to-white/30 dark:from-black/20 dark:to-black/40">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className={`flex-1 max-w-[88%] md:max-w-[78%] ${
                  message.role === 'user' ? 'flex flex-col items-end' : ''
                }`}>
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                        : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-white/20'
                    }`}
                  >
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>

                  {message.role === 'assistant' && index > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                      >
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Copier le texte</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => copyAndOpenMail(message.content, index)}
                        className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Copier + ouvrir mail</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-white dark:bg-white/10 p-3 rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">L&apos;assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-purple-500/20 bg-white/80 dark:bg-black/60 backdrop-blur-xl p-3 md:p-4">
            <div className="flex items-end space-x-2 md:space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ecrivez votre message... (Entree pour envoyer)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-purple-500/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
                  disabled={loading}
                />
                <div className="absolute bottom-2.5 right-3 text-[11px] text-gray-400">
                  {input.length > 0 && `${input.length} caracteres`}
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center min-w-[48px]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {messages.length === 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Suggestions :</span>
                {['Lettre de motivation', 'Email de relance', 'Conseils candidature'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      const mode = assistantModes.find(m =>
                        suggestion.toLowerCase().includes(m.name.toLowerCase())
                      )
                      if (mode) handleModeSelect(mode)
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booster candidature */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-5 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Analyse d&apos;offre + match profil
          </h3>
          <div className="space-y-3">
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={5}
              placeholder="Collez ici la description de poste (JD)..."
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
            <input
              type="text"
              value={profileSkills}
              onChange={(e) => setProfileSkills(e.target.value)}
              placeholder="Vos compétences (séparées par virgule)"
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Poste ciblé (optionnel)"
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Score d&apos;adéquation</span>
              <span className={`text-sm font-bold ${
                jdAnalysis.score >= 70 ? 'text-green-600 dark:text-green-300' :
                  jdAnalysis.score >= 45 ? 'text-orange-600 dark:text-orange-300' :
                    'text-red-600 dark:text-red-300'
              }`}>
                {jdAnalysis.score}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
              <div
                className={`h-full ${
                  jdAnalysis.score >= 70 ? 'bg-green-500' : jdAnalysis.score >= 45 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${jdAnalysis.score}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Mots-clés ATS détectés: {jdAnalysis.keywords.length}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
              <strong>Match:</strong> {jdAnalysis.matched.slice(0, 8).join(', ') || 'Aucun pour le moment'}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <strong>À intégrer:</strong> {jdAnalysis.missing.slice(0, 8).join(', ') || 'RAS'}
            </p>
            {jdAnalysis.actions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {jdAnalysis.actions.slice(0, 3).map((action) => (
                  <li key={action} className="text-xs text-blue-700 dark:text-blue-300">• {action}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Info technique (dev uniquement) */}
      {showTechnicalInfo && (
        <div className={`rounded-2xl p-6 border-2 shadow-lg ${
          apiEnabled
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
            : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${
              apiEnabled
                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            } shadow-lg`}>
              {apiEnabled ? (
                <Stars className="w-6 h-6 text-white" />
              ) : (
                <Sparkles className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              {apiEnabled ? (
                <>
                  <h4 className="font-bold text-green-700 dark:text-green-300 mb-1 flex items-center space-x-2">
                    <span>✅ IA backend activée</span>
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    L&apos;assistant utilise une Cloud Function Firebase pour appeler OpenAI côté serveur.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                    💡 Mode démo activé
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    Ajoutez l&apos;URL de la Cloud Function dans l&apos;environnement.
                  </p>
                  <div className="bg-white/50 dark:bg-black/40 rounded-xl p-3 border border-blue-500/20">
                    <code className="text-xs text-gray-800 dark:text-gray-200">
                      VITE_AI_FUNCTION_URL=https://&lt;region&gt;-&lt;project-id&gt;.cloudfunctions.net/generateAIResponse
                    </code>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssistantIA
