import { useEffect, useRef, useState } from 'react'
import { Mic, StopCircle, Volume2, Brain, ChevronRight } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

const INTERVIEW_LIBRARY = [
  {
    question: 'Parlez-moi de vous',
    hint: 'Présentez votre profil en 60-90 secondes avec un exemple concret.',
    answer: 'Je suis [Votre Prenom], etudiant(e) en [Formation], avec un fort interet pour [Domaine]. Sur mes projets recents, j ai travaille sur [Projet cle], ce qui m a permis de developper [Competences]. Aujourd hui, je cherche une opportunite ou je peux contribuer concretement tout en continuant a progresser rapidement.'
  },
  {
    question: 'Pourquoi ce poste ?',
    hint: 'Reliez vos motivations, les missions et votre valeur ajoutée.',
    answer: 'Ce poste m interesse pour trois raisons: d abord les missions en [Mission], ensuite l environnement [Entreprise/equipe], et enfin la possibilite d evoluer sur [Competence]. Je vois un vrai alignement entre vos besoins et ce que je peux apporter des maintenant.'
  },
  {
    question: 'Quels sont vos points forts ?',
    hint: 'Donnez 2-3 forces avec un résultat mesurable.',
    answer: 'Mes points forts sont la rigueur, la capacite d apprentissage rapide et la communication. Par exemple, sur [Projet], j ai [action], ce qui a permis [resultat concret].'
  },
  {
    question: 'Quelle est votre principale faiblesse ?',
    hint: 'Mentionnez une faiblesse réelle et votre plan d’amélioration.',
    answer: 'J avais tendance a [faiblesse reelle mais non bloquante]. J ai mis en place [solution], et aujourd hui je constate une nette amelioration, notamment sur [exemple concret].'
  },
  {
    question: 'Avez-vous des questions ?',
    hint: 'Posez des questions sur objectifs, équipe et réussite sur le poste.',
    answer: 'Oui, j en ai trois: 1) Quels seront les objectifs des 3 premiers mois ? 2) Quelle est la maniere de travailler de l equipe au quotidien ? 3) Quels profils reussissent le mieux sur ce poste ?'
  }
]

const FILLER_WORDS = ['euh', 'ben', 'du coup', 'en fait', 'genre']

function InterviewSimulator() {
  const { error: showError } = useToast()
  const recognitionRef = useRef(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // noop
        }
      }
    }
  }, [])

  const currentQuestion = INTERVIEW_LIBRARY[questionIndex]

  const speakQuestion = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question)
    utterance.lang = 'fr-FR'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const startRecording = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      showError('Reconnaissance vocale non supportee sur ce navigateur.')
      return
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'fr-FR'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event) => {
        let nextTranscript = ''
        for (let i = 0; i < event.results.length; i += 1) {
          nextTranscript += event.results[i][0].transcript
        }
        setTranscript(nextTranscript.trim())
      }

      recognition.onerror = () => setIsRecording(false)
      recognition.onend = () => setIsRecording(false)
      recognitionRef.current = recognition
    }

    setTranscript('')
    setFeedback(null)
    recognitionRef.current.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsRecording(false)
  }

  const analyzeResponse = () => {
    const text = transcript.trim()
    if (!text) {
      showError('Enregistrez ou saisissez une reponse avant analyse.')
      return
    }

    const words = text.split(/\s+/).filter(Boolean)
    const wordCount = words.length
    const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const lower = text.toLowerCase()
    const fillerCount = FILLER_WORDS.reduce(
      (acc, filler) => acc + (lower.match(new RegExp(`\\b${filler}\\b`, 'g')) || []).length,
      0
    )
    const fillerRate = wordCount > 0 ? fillerCount / wordCount : 0

    const starMarkers = ['situation', 'tache', 'tâche', 'action', 'resultat', 'résultat']
    const starCount = starMarkers.filter((marker) => lower.includes(marker)).length

    let clarityScore = 50
    if (wordCount >= 60 && wordCount <= 180) clarityScore += 20
    else if (wordCount < 30 || wordCount > 260) clarityScore -= 15
    if (fillerRate < 0.03) clarityScore += 20
    else if (fillerRate > 0.08) clarityScore -= 15
    if (sentenceCount >= 3) clarityScore += 10
    clarityScore = Math.max(0, Math.min(100, clarityScore))

    let structureScore = 40
    if (starCount >= 3) structureScore += 35
    else if (starCount >= 1) structureScore += 15
    if (/(d'abord|ensuite|enfin|premierement|deuxiemement|troisiemement|premièrement|deuxièmement|troisièmement)/i.test(lower)) {
      structureScore += 15
    }
    if (/\b(j'ai|nous avons)\b/i.test(lower) && /\b(resultat|résultat|impact|augmente|augmenté|reduit|réduit|ameliore|amélioré)\b/i.test(lower)) {
      structureScore += 10
    }
    structureScore = Math.max(0, Math.min(100, structureScore))

    const tips = []
    if (wordCount < 50) tips.push('Allongez legerement la reponse avec un exemple concret.')
    if (fillerRate > 0.06) tips.push('Reduisez les hesitations ("euh", "du coup"), faites des pauses courtes.')
    if (starCount < 2) tips.push('Structurez en STAR: Situation, Tache, Action, Resultat.')
    if (tips.length === 0) tips.push('Tres bonne base. Ajoutez un resultat chiffre pour plus d impact.')

    setFeedback({
      wordCount,
      clarityScore,
      structureScore,
      tips
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-rose-500/20 p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Simulateur d&apos;entretien vocal</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Entrainez-vous, enregistrez votre reponse, puis obtenez un feedback clair sur la clarte et la structure.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-lg">
        <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-white/10 mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Question actuelle</p>
          <p className="text-base font-semibold text-gray-800 dark:text-white">{currentQuestion.question}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{currentQuestion.hint}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={speakQuestion}
            className="px-3 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm inline-flex items-center gap-1"
          >
            <Volume2 className="w-4 h-4" />
            Lire la question
          </button>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-sm inline-flex items-center gap-1"
            >
              <Mic className="w-4 h-4" />
              Demarrer
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 text-sm inline-flex items-center gap-1"
            >
              <StopCircle className="w-4 h-4" />
              Stop
            </button>
          )}

          <button
            onClick={analyzeResponse}
            className="px-3 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-sm"
          >
            Analyser la reponse
          </button>

          <button
            onClick={() => {
              setQuestionIndex((prev) => (prev + 1) % INTERVIEW_LIBRARY.length)
              setTranscript('')
              setFeedback(null)
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm inline-flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            Question suivante
          </button>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={6}
          placeholder="Votre reponse (micro ou saisie manuelle)..."
          className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
        />
      </div>

      {feedback && (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-5 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Feedback instantane
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-gray-500">Mots</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{feedback.wordCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-xs text-blue-700 dark:text-blue-300">Clarte</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{feedback.clarityScore}%</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-xs text-purple-700 dark:text-purple-300">Structure</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{feedback.structureScore}%</p>
            </div>
          </div>
          <ul className="space-y-1">
            {feedback.tips.map((tip) => (
              <li key={tip} className="text-sm text-gray-700 dark:text-gray-300">- {tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-5 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Bibliotheque reponses entretien
        </h2>
        <div className="space-y-2">
          {INTERVIEW_LIBRARY.map((item) => (
            <div
              key={item.question}
              className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/10"
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.question}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InterviewSimulator
