import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Check, Sparkles, Plus, Calendar, Bell, BarChart3, FileText } from 'lucide-react'

function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-purple-400" />,
      title: 'Bienvenue sur BeCandidate !',
      description: 'Votre assistant intelligent pour gérer vos candidatures d\'emploi. Découvrez comment l\'utiliser en 5 étapes simples.',
      highlight: 'Prenez 30 secondes pour découvrir les fonctionnalités !'
    },
    {
      icon: <Plus className="w-12 h-12 text-green-400" />,
      title: 'Ajoutez vos candidatures',
      description: 'Cliquez sur "Ajouter" pour enregistrer une nouvelle candidature. Renseignez l\'entreprise, le poste, la date et le statut.',
      highlight: 'Astuce : Ajoutez toutes vos candidatures pour un suivi complet !'
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-blue-400" />,
      title: 'Suivez vos statistiques',
      description: 'Le Dashboard vous montre vos KPIs : taux de réponse, candidatures en cours, entretiens à venir et temps moyen de réponse.',
      highlight: 'Visualisez votre progression en un coup d\'œil !'
    },
    {
      icon: <Bell className="w-12 h-12 text-orange-400" />,
      title: 'Recevez des rappels',
      description: 'Activez les notifications pour être alerté des relances à faire. Vous ne manquerez plus jamais une opportunité !',
      highlight: 'Les relances sont automatiques après 7 jours !'
    },
    {
      icon: <Calendar className="w-12 h-12 text-pink-400" />,
      title: 'Utilisez le calendrier',
      description: 'Visualisez toutes vos candidatures sur un calendrier interactif. Parfait pour planifier vos relances et entretiens.',
      highlight: 'Cliquez sur une date pour voir les détails !'
    },
    {
      icon: <FileText className="w-12 h-12 text-yellow-400" />,
      title: 'Explorez les outils',
      description: 'Générateur de CV, Assistant IA, Scan d\'offres, Templates de lettres... Tout pour booster vos candidatures !',
      highlight: 'Vous êtes prêt ! Commencez dès maintenant ! 🎯'
    }
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black rounded-3xl shadow-2xl border border-gray-200 dark:border-purple-500/30 overflow-hidden animate-scale-in">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-green-500/10 rounded-full blur-3xl"></div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="Passer le tutoriel"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="relative p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/20">
              {currentStepData.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-300 mb-4 text-base md:text-lg">
            {currentStepData.description}
          </p>

          {/* Highlight */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mb-8">
            <p className="text-center text-sm md:text-base font-medium text-purple-600 dark:text-purple-400">
              💡 {currentStepData.highlight}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                    : index < currentStep
                    ? 'bg-purple-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isFirstStep
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Précédent</span>
            </button>

            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {currentStep + 1} / {steps.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {isLastStep ? (
                <>
                  <span>Commencer</span>
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Suivant</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Skip button */}
          {!isLastStep && (
            <div className="text-center mt-6">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline"
              >
                Passer le tutoriel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingTour

