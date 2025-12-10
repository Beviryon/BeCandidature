import { useState, useRef, useEffect } from 'react'
import { 
  Send, Bot, User, Copy, Sparkles, Mail, 
  CheckCircle, X, Wand2, Brain, TrendingUp, Lightbulb, ArrowRight,
  Loader2, Stars, Rocket, FileText
} from 'lucide-react'
import { generateAIResponse } from '../services/openaiService'
import { useToast } from '../contexts/ToastContext'

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
  const apiEnabled = !!import.meta.env.VITE_OPENAI_API_KEY

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

  const handleModeSelect = (mode) => {
    setSelectedMode(mode.id)
    setInput(mode.prompt)
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    success('Texte copié dans le presse-papiers !')
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
                    <span>GPT-4</span>
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

      {/* Templates rapides - Design moderne */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <span>Modèles rapides</span>
          </h3>
          <button
            onClick={clearChat}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Nouvelle conversation</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistantModes.map(mode => {
            const Icon = mode.icon
            const isSelected = selectedMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode)}
                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                  isSelected
                    ? `${mode.borderColor} ${mode.bgGradient} bg-gradient-to-br shadow-lg scale-105`
                    : 'border-white/10 bg-white/5 dark:bg-black/40 hover:border-purple-500/30 hover:bg-white/10 dark:hover:bg-white/5'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${mode.gradient} mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-1 group-hover:text-purple-400 dark:group-hover:text-purple-300 transition-colors">
                    {mode.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {mode.description}
                  </p>
                  {isSelected && (
                    <div className="mt-3 flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                      <span>Prêt à utiliser</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Zone de chat moderne */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl overflow-hidden">
        {/* Messages avec scroll automatique */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/50 to-white/30 dark:from-black/20 dark:to-black/40">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Message bubble */}
              <div className={`flex-1 max-w-[75%] ${
                message.role === 'user' ? 'flex flex-col items-end' : ''
              }`}>
                <div
                  className={`p-4 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-white/20'
                  }`}
                >
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                
                {/* Actions pour les messages de l'assistant */}
                {message.role === 'assistant' && index > 0 && (
                  <button
                    onClick={() => copyToClipboard(message.content, index)}
                    className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
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
                )}
              </div>
            </div>
          ))}

          {/* Indicateur de chargement moderne */}
          {loading && (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="bg-white dark:bg-white/10 p-4 rounded-2xl border border-white/20">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">L&apos;assistant réfléchit...</span>
                </div>
                <div className="flex space-x-1 mt-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input moderne */}
        <div className="border-t border-purple-500/20 bg-white/80 dark:bg-black/60 backdrop-blur-xl p-4">
          <div className="flex items-end space-x-3">
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
                placeholder="Écrivez votre message... (Appuyez sur Entrée pour envoyer)"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-500/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all resize-none"
                disabled={loading}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {input.length > 0 && `${input.length} caractères`}
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 flex items-center justify-center min-w-[56px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Suggestions rapides */}
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

      {/* Info box moderne */}
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
                  <span>✅ API OpenAI activée</span>
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  L&apos;assistant utilise GPT-4 pour des réponses ultra-personnalisées et intelligentes. Profitez de toute la puissance de l&apos;IA !
                </p>
              </>
            ) : (
              <>
                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                  💡 Mode démo activé
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  L&apos;assistant utilise des réponses pré-programmées. Pour activer GPT-4 et bénéficier de réponses personnalisées, ajoutez votre clé API OpenAI.
                </p>
                <div className="bg-white/50 dark:bg-black/40 rounded-xl p-3 border border-blue-500/20">
                  <code className="text-xs text-gray-800 dark:text-gray-200">
                    VITE_OPENAI_API_KEY=sk-votre-clé-api
                  </code>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistantIA
