import { useState } from 'react'
import { Send, Bot, User, Copy, Sparkles, Mail, MessageSquare, Target, Zap, CheckCircle } from 'lucide-react'
import { generateAIResponse } from '../services/openaiService'

function AssistantIA() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Bonjour ! Je suis votre assistant IA pour vos candidatures. Comment puis-je vous aider aujourd\'hui ?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const apiEnabled = !!import.meta.env.VITE_OPENAI_API_KEY

  const assistantModes = [
    {
      id: 'lettre',
      name: 'Lettre de motivation',
      icon: MessageSquare,
      color: 'purple',
      prompt: 'Aide-moi à écrire une lettre de motivation pour le poste de [POSTE] chez [ENTREPRISE]. Voici mon profil : [PROFIL]'
    },
    {
      id: 'conseils',
      name: 'Conseils',
      icon: Target,
      color: 'blue',
      prompt: 'Donne-moi des conseils pour améliorer mes candidatures. J\'ai envoyé [NOMBRE] candidatures et obtenu [NOMBRE] entretiens.'
    },
    {
      id: 'relance',
      name: 'Email de relance',
      icon: Mail,
      color: 'green',
      prompt: 'Rédige un email de relance professionnel pour [ENTREPRISE]. J\'ai postulé il y a [JOURS] jours pour le poste de [POSTE].'
    },
    {
      id: 'analyse',
      name: 'Analyse de profil',
      icon: Zap,
      color: 'orange',
      prompt: 'Analyse mon profil et suggère des améliorations. Compétences : [COMPETENCES]. Expérience : [EXPERIENCE].'
    }
  ]

  const callAIService = async (userMessage) => {
    setLoading(true)
    
    try {
      // Préparer l'historique de conversation pour l'API
      const conversationHistory = messages
        .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0) // Exclure le message d'accueil
        .map(m => ({ role: m.role, content: m.content }))

      // Appeler le service OpenAI
      const response = await generateAIResponse(userMessage, conversationHistory)
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error('Erreur:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    
    // Ajouter le message utilisateur
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Générer la réponse IA
    await callAIService(userMessage)
  }

  const fillTemplate = (prompt) => {
    setInput(prompt)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Bonjour ! Je suis votre assistant IA pour vos candidatures. Comment puis-je vous aider aujourd\'hui ?'
      }
    ])
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold gradient-text mb-2">
          🤖 Assistant IA
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Votre coach personnel pour réussir vos candidatures
        </p>
      </div>

      {/* Templates rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {assistantModes.map(mode => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => fillTemplate(mode.prompt)}
              className="p-4 rounded-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 text-left group"
            >
              <Icon className={`w-6 h-6 mb-2 text-${mode.color}-600 dark:text-${mode.color}-400 group-hover:scale-110 transition-transform`} />
              <div className="font-semibold text-gray-800 dark:text-white text-sm">
                {mode.name}
              </div>
            </button>
          )
        })}
      </div>

      {/* Zone de chat */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-purple-500/20 overflow-hidden">
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="whitespace-pre-line text-sm">
                  {message.content}
                </div>
                {message.role === 'assistant' && index > 0 && (
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="mt-3 flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="bg-gray-100 dark:bg-white/10 p-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-white/10 p-4 bg-white/50 dark:bg-black/20">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={clearChat}
              className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            💡 Astuce : Utilisez les templates ci-dessus pour commencer rapidement
          </p>
        </div>
      </div>

      {/* Info */}
      <div className={`${apiEnabled ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'} rounded-xl p-4 border`}>
        <div className="flex items-start space-x-3">
          <Sparkles className={`w-5 h-5 ${apiEnabled ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'} flex-shrink-0 mt-0.5`} />
          <div className={`text-sm ${apiEnabled ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
            {apiEnabled ? (
              <>
                <strong>✅ API OpenAI activée :</strong> L&apos;assistant utilise GPT-4 pour des réponses ultra-personnalisées !
              </>
            ) : (
              <>
                <strong>💡 Mode démo :</strong> L&apos;assistant utilise des réponses pré-programmées. 
                Pour activer GPT-4, ajoutez votre clé API OpenAI dans le fichier .env :
                <code className="block mt-2 p-2 bg-white/10 rounded text-xs">
                  VITE_OPENAI_API_KEY=sk-votre-clé-api
                </code>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistantIA

