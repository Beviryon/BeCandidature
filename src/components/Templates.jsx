import { useState, useMemo } from 'react'
import { 
  Copy, Check, Mail, MessageSquare, Linkedin, Plus, X,
  RefreshCw, Heart, Users, Briefcase, Sparkles, Filter,
  Search, FileText, CheckCircle, ChevronDown, ChevronUp, Wand2, Send
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import ConfirmDialog from './ConfirmDialog'

const defaultTemplates = [
  // CANDIDATURES SPONTANÉES
  {
    id: 'spontanee-1',
    name: 'Candidature Spontanée - Email Professionnel',
    category: 'candidature-spontanee',
    type: 'email',
    description: 'Email formel pour une candidature spontanée',
    content: `Objet : Candidature spontanée - [Poste]

Madame, Monsieur,

Actuellement en recherche d'opportunités dans le domaine de [Domaine], je me permets de vous adresser ma candidature spontanée pour un poste de [Poste] au sein de [Entreprise].

Passionné(e) par [Domaine] depuis [Nombre] années, j'ai développé une solide expertise en [Compétences] que je serais ravi(e) de mettre au service de vos projets. Mon expérience en [Expérience] m'a permis d'acquérir des compétences qui correspondent aux valeurs et aux défis de votre entreprise.

Votre entreprise m'attire particulièrement pour [Raison - ex: sa réputation, ses projets innovants, ses valeurs]. Je suis convaincu(e) que mon profil pourrait contribuer positivement à vos équipes.

Vous trouverez ci-joint mon CV détaillé. Je reste à votre entière disposition pour un échange qui nous permettrait de discuter de mes compétences et de mes motivations.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre Nom]
[Votre Email]
[Votre Téléphone]
[LinkedIn - optionnel]`
  },
  {
    id: 'spontanee-2',
    name: 'Candidature Spontanée - LinkedIn Direct',
    category: 'candidature-spontanee',
    type: 'linkedin',
    description: 'Message LinkedIn court et impactant',
    content: `Bonjour [Contact],

Je suis actuellement en recherche d'opportunités en tant que [Poste] et votre entreprise [Entreprise] m'intéresse particulièrement.

Avec [Nombre] années d'expérience en [Domaine], j'ai développé des compétences en [Compétences] qui pourraient être utiles à vos équipes.

Seriez-vous disponible pour un échange de 15 minutes afin que je puisse vous présenter mon profil et comprendre vos besoins ?

Merci par avance,
[Votre Nom]`
  },
  {
    id: 'spontanee-3',
    name: 'Candidature Spontanée - Alternance/Stage',
    category: 'candidature-spontanee',
    type: 'email',
    description: 'Spécialement conçu pour alternance ou stage',
    content: `Objet : Candidature pour un stage/alternance - [Poste]

Bonjour [Contact],

Étudiant(e) en [Formation] à [École], je recherche activement un stage/alternance en [Domaine] pour la période du [Date Début] au [Date Fin].

Votre entreprise [Entreprise] m'attire particulièrement pour [Raison]. J'ai suivi avec intérêt [Projet/Actualité de l'entreprise] et j'aimerais contribuer à vos missions.

Au cours de ma formation, j'ai acquis des compétences en [Compétences] et j'ai réalisé [Projet/Expérience pertinente]. Je suis motivé(e) à apprendre et à apporter ma contribution à vos équipes.

Je serais ravi(e) de vous rencontrer pour discuter de cette opportunité.

Cordialement,
[Votre Nom]
[Votre Email]
[Votre Téléphone]`
  },
  {
    id: 'spontanee-4',
    name: 'Candidature Spontanée - Senior/Expert',
    category: 'candidature-spontanee',
    type: 'email',
    description: 'Pour profils expérimentés',
    content: `Objet : Candidature spontanée - [Poste] - [Votre Nom]

Bonjour [Contact],

Avec plus de [Nombre] années d'expérience en [Domaine], notamment en tant que [Poste précédent] chez [Entreprise précédente], je souhaite explorer de nouvelles opportunités qui correspondent à mon expertise.

Votre entreprise [Entreprise] m'intéresse particulièrement pour [Raison stratégique]. J'ai suivi vos développements récents, notamment [Projet/Actualité], et je pense que mon expérience en [Compétences clés] pourrait vous être utile.

Au cours de ma carrière, j'ai notamment [Réalisation majeure] et développé une expertise reconnue en [Domaine d'expertise].

Je serais ravi(e) d'échanger avec vous sur les opportunités au sein de votre entreprise et sur la manière dont je pourrais contribuer à vos objectifs.

Vous trouverez ci-joint mon CV. Je reste à votre disposition pour un entretien.

Cordialement,
[Votre Nom]
[Votre Email]
[Votre Téléphone]
[LinkedIn]`
  },

  // RELANCES
  {
    id: 'relance-1',
    name: 'Relance Email - 7 jours après candidature',
    category: 'relance',
    type: 'email',
    description: 'Relance professionnelle après une semaine',
    content: `Objet : Relance - Candidature pour le poste de [Poste]

Bonjour [Contact],

Je me permets de revenir vers vous concernant ma candidature pour le poste de [Poste] au sein de [Entreprise], que j'ai eu le plaisir de vous adresser le [Date].

Je reste très motivé(e) par cette opportunité qui correspond parfaitement à mes compétences en [Compétences] et à mes aspirations professionnelles.

Je serais ravi(e) d'échanger avec vous sur ma candidature et de vous apporter tout complément d'information nécessaire.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Votre Nom]
[Votre Email]
[Votre Téléphone]`
  },
  {
    id: 'relance-2',
    name: 'Relance LinkedIn - Courte et Impactante',
    category: 'relance',
    type: 'linkedin',
    description: 'Message LinkedIn court pour relancer',
    content: `Bonjour [Contact],

J'ai postulé il y a [Nombre] jours pour le poste de [Poste] chez [Entreprise] et je souhaitais savoir où en était le processus de recrutement.

Mon profil en [Compétences] correspond aux exigences du poste. Seriez-vous disponible pour un échange rapide ?

Merci,
[Votre Nom]`
  },
  {
    id: 'relance-3',
    name: 'Relance Email - Après 2 semaines',
    category: 'relance',
    type: 'email',
    description: 'Relance plus insistante mais toujours professionnelle',
    content: `Objet : Relance - Candidature [Poste] - [Votre Nom]

Bonjour [Contact],

Il y a deux semaines, j'ai eu l'honneur de vous adresser ma candidature pour le poste de [Poste] au sein de [Entreprise].

Je souhaite réitérer mon intérêt pour cette opportunité. Mon expérience en [Compétences] et ma motivation restent intactes.

Si ma candidature n'a pas encore été examinée, je serais ravi(e) de vous fournir tout complément d'information qui pourrait vous être utile.

Je reste à votre disposition pour un entretien.

Cordialement,
[Votre Nom]
[Votre Email]
[Votre Téléphone]`
  },

  // REMERCIEMENTS
  {
    id: 'remerciement-1',
    name: 'Remerciement Après Entretien',
    category: 'remerciement',
    type: 'email',
    description: 'Email de remerciement professionnel',
    content: `Objet : Remerciement - Entretien [Poste]

Bonjour [Contact],

Je tenais à vous remercier chaleureusement pour le temps que vous m'avez accordé lors de notre entretien du [Date Entretien] concernant le poste de [Poste] au sein de [Entreprise].

Cet échange m'a permis de mieux comprendre vos enjeux et vos attentes. Il a également renforcé mon intérêt pour cette opportunité, et je suis plus que jamais convaincu(e) que mon profil et mes compétences en [Compétences] correspondent à vos besoins.

J'ai particulièrement apprécié [Point spécifique de l'entretien - ex: la présentation de votre projet, l'ambiance de l'équipe, etc.].

Je reste à votre entière disposition pour tout complément d'information et dans l'attente de votre retour.

Cordialement,
[Votre Nom]
[Votre Email]`
  },
  {
    id: 'remerciement-2',
    name: 'Remerciement Après Refus',
    category: 'remerciement',
    type: 'email',
    description: 'Email professionnel après un refus',
    content: `Objet : Remerciement - Candidature [Poste]

Bonjour [Contact],

Je vous remercie de m'avoir informé(e) de votre décision concernant ma candidature pour le poste de [Poste].

Bien que déçu(e) par cette issue, je tiens à vous remercier pour le temps que vous avez consacré à l'examen de mon dossier et pour la qualité de nos échanges.

Cette expérience m'a permis d'en apprendre davantage sur [Entreprise] et sur vos attentes. Je garde un excellent souvenir de nos interactions.

Je vous souhaite le meilleur pour la suite et reste ouvert(e) à d'éventuelles opportunités futures.

Cordialement,
[Votre Nom]`
  },

  // NETWORKING
  {
    id: 'networking-1',
    name: 'Demande de Connexion LinkedIn',
    category: 'networking',
    type: 'linkedin',
    description: 'Message pour demander une connexion',
    content: `Bonjour [Contact],

Je suis [Votre Nom], [Votre Poste] en [Domaine]. J'ai été impressionné(e) par votre parcours et votre expérience chez [Entreprise].

Je serais ravi(e) de rejoindre votre réseau pour échanger sur nos expériences respectives dans le domaine de [Domaine].

Merci,
[Votre Nom]`
  },
  {
    id: 'networking-2',
    name: 'Demande de Conseil LinkedIn',
    category: 'networking',
    type: 'linkedin',
    description: 'Demander des conseils à un professionnel',
    content: `Bonjour [Contact],

Je suis actuellement en recherche d'opportunités en [Domaine] et votre parcours m'inspire beaucoup.

Auriez-vous 15 minutes pour échanger sur votre expérience et me donner quelques conseils pour ma recherche ?

Je serais très reconnaissant(e) de votre aide.

Merci par avance,
[Votre Nom]`
  },

  // ACCEPTATION/REFUS
  {
    id: 'acceptation-1',
    name: 'Accepter une Offre',
    category: 'acceptation',
    type: 'email',
    description: 'Email pour accepter une proposition',
    content: `Objet : Acceptation de l'offre - [Poste]

Bonjour [Contact],

Je suis ravi(e) de vous confirmer mon acceptation de votre proposition pour le poste de [Poste] au sein de [Entreprise].

Je suis très enthousiaste à l'idée de rejoindre votre équipe et de contribuer aux projets de l'entreprise.

Comme convenu, je serai disponible à partir du [Date de début].

Je reste à votre disposition pour toute information complémentaire concernant mon intégration.

Cordialement,
[Votre Nom]
[Votre Email]
[Votre Téléphone]`
  },
  {
    id: 'refus-1',
    name: 'Refuser une Offre Poliment',
    category: 'acceptation',
    type: 'email',
    description: 'Refuser une offre de manière professionnelle',
    content: `Objet : Réponse à votre proposition - [Poste]

Bonjour [Contact],

Je vous remercie sincèrement pour la confiance que vous m'avez témoignée en me proposant le poste de [Poste] au sein de [Entreprise].

Après mûre réflexion, j'ai pris la décision de ne pas donner suite à votre proposition. Cette décision n'est en rien liée à votre entreprise, que j'estime beaucoup, mais correspond à un choix personnel et professionnel.

Je vous souhaite le meilleur pour la suite et reste ouvert(e) à d'éventuelles collaborations futures.

Cordialement,
[Votre Nom]`
  }
]

const categories = [
  { id: 'all', name: 'Tous', icon: FileText, color: 'from-gray-500 to-gray-600' },
  { id: 'candidature-spontanee', name: 'Candidatures Spontanées', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
  { id: 'relance', name: 'Relances', icon: RefreshCw, color: 'from-purple-500 to-pink-500' },
  { id: 'remerciement', name: 'Remerciements', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'networking', name: 'Networking', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'acceptation', name: 'Acceptation/Refus', icon: CheckCircle, color: 'from-orange-500 to-red-500' }
]

function Templates() {
  const { success, error: showError } = useToast()
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('message_templates')
    return saved ? JSON.parse(saved) : defaultTemplates
  })
  const [copiedId, setCopiedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [personalization, setPersonalization] = useState({
    contact: '',
    entreprise: '',
    poste: '',
    date: new Date().toISOString().split('T')[0],
    votreNom: '',
    competences: '',
    domaine: ''
  })
  const [newTemplate, setNewTemplate] = useState({ 
    name: '', 
    category: 'candidature-spontanee',
    type: 'email', 
    description: '',
    content: '' 
  })

  const saveTemplates = (updatedTemplates) => {
    setTemplates(updatedTemplates)
    localStorage.setItem('message_templates', JSON.stringify(updatedTemplates))
  }

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [templates, selectedCategory, searchQuery])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    success('Template copié dans le presse-papiers !')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const personalizeTemplateContent = (content) => {
    const replacements = {
      '[Contact]': personalization.contact || '[Contact]',
      '[Entreprise]': personalization.entreprise || '[Entreprise]',
      '[Poste]': personalization.poste || '[Poste]',
      '[Date]': personalization.date || '[Date]',
      '[Votre Nom]': personalization.votreNom || '[Votre Nom]',
      '[Compétences]': personalization.competences || '[Compétences]',
      '[Domaine]': personalization.domaine || '[Domaine]'
    }

    return Object.entries(replacements).reduce((acc, [key, value]) => {
      return acc.replaceAll(key, value)
    }, content)
  }

  const parseSubjectAndBody = (content) => {
    const lines = content.split('\n')
    const firstLine = lines[0] || ''
    if (/^objet\s*:/i.test(firstLine)) {
      const subject = firstLine.replace(/^objet\s*:/i, '').trim()
      const body = lines.slice(1).join('\n').trim()
      return { subject, body }
    }
    return { subject: `Message - ${personalization.poste || 'Candidature'}`, body: content }
  }

  const copyAndOpenMail = (content, id) => {
    const personalized = personalizeTemplateContent(content)
    const { subject, body } = parseSubjectAndBody(personalized)

    navigator.clipboard.writeText(personalized)
    setCopiedId(id)
    success('Message personnalisé copié et email ouvert')
    setTimeout(() => setCopiedId(null), 2000)

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const oneClickFollowUp = () => {
    if (!personalization.entreprise || !personalization.poste) {
      showError('Renseignez au moins entreprise et poste pour générer la relance')
      return
    }

    const relanceTemplate = templates.find((t) => t.category === 'relance') || templates.find((t) => t.id === 'relance-1')
    if (!relanceTemplate) {
      showError('Aucun template de relance disponible')
      return
    }

    const personalized = personalizeTemplateContent(relanceTemplate.content)
    const { subject, body } = parseSubjectAndBody(personalized)
    navigator.clipboard.writeText(personalized)
    success('Relance générée en 1 clic')
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const deleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id)
    saveTemplates(updated)
    setShowDeleteConfirm(null)
    success('Template supprimé')
  }

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      showError('Veuillez remplir tous les champs obligatoires')
      return
    }
    const template = {
      ...newTemplate,
      id: `custom-${Date.now()}`
    }
    saveTemplates([...templates, template])
    setNewTemplate({ name: '', category: 'candidature-spontanee', type: 'email', description: '', content: '' })
    setShowAddForm(false)
    success('Template créé avec succès !')
  }

  const updateTemplate = (id, updates) => {
    const updated = templates.map(t => t.id === id ? { ...t, ...updates } : t)
    saveTemplates(updated)
    setEditingId(null)
    success('Template mis à jour !')
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'email':
        return 'from-blue-500 to-cyan-500'
      case 'linkedin':
        return 'from-blue-600 to-blue-800'
      default:
        return 'from-purple-500 to-pink-500'
    }
  }

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span>Templates de Messages Professionnels</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Bibliothèque claire et prête à copier.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              Total: {templates.length}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
              Affichés: {filteredTemplates.length}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showAddForm ? 'Annuler' : 'Nouveau Template'}</span>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
        <button
          type="button"
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recherche & Catégories</span>
          </div>
          {isFiltersOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500 md:hidden" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 md:hidden" />
          )}
        </button>

        <div className={`mt-4 ${isFiltersOpen ? 'block' : 'hidden'} md:block space-y-4`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un template..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(category => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow`
                      : 'bg-white/5 text-gray-600 dark:text-gray-400 border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-xs md:text-sm">{category.name}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{filteredTemplates.length} résultat(s)</span>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personnalisation auto + 1 clic */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-emerald-500" />
            Auto-personnalisation
          </h3>
          <button
            onClick={oneClickFollowUp}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold transition-all"
          >
            <Send className="w-4 h-4" />
            Relance 1 clic + ouvrir mail
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={personalization.contact}
            onChange={(e) => setPersonalization((prev) => ({ ...prev, contact: e.target.value }))}
            placeholder="Contact (ex: Mme Dupont)"
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="text"
            value={personalization.entreprise}
            onChange={(e) => setPersonalization((prev) => ({ ...prev, entreprise: e.target.value }))}
            placeholder="Entreprise"
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="text"
            value={personalization.poste}
            onChange={(e) => setPersonalization((prev) => ({ ...prev, poste: e.target.value }))}
            placeholder="Poste"
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="date"
            value={personalization.date}
            onChange={(e) => setPersonalization((prev) => ({ ...prev, date: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="text"
            value={personalization.votreNom}
            onChange={(e) => setPersonalization((prev) => ({ ...prev, votreNom: e.target.value }))}
            placeholder="Votre nom"
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="text"
            value={personalization.competences}
            onChange={(e) => setPersonalization((prev) => ({ ...prev, competences: e.target.value }))}
            placeholder="Compétences clés"
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-lg animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-purple-400" />
            <span>Créer un nouveau template</span>
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du template *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Relance après 10 jours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="email" className="bg-slate-800">Email</option>
                  <option value="linkedin" className="bg-slate-800">LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brève description du template"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contenu du message *
              </label>
              <textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                rows="12"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                placeholder="Utilisez [Contact], [Entreprise], [Poste], [Date], [Compétences], [Votre Nom], [Domaine] comme variables..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewTemplate({ name: '', category: 'candidature-spontanee', type: 'email', description: '', content: '' })
                }}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl border border-white/10 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={addTemplate}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all"
              >
                Créer le template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-12 text-center border border-purple-500/30 shadow-lg">
          <FileText className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Aucun template trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery ? 'Essayez une autre recherche' : 'Créez votre premier template de message'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Créer un template</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filteredTemplates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category)
            const CategoryIcon = categoryInfo.icon
            return (
              <div
                key={template.id}
                className="group bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(template.type)} shadow`}>
                        {getTypeIcon(template.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-400 dark:group-hover:text-purple-300 transition-colors">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(template.type)} text-white`}>
                        {template.type === 'email' ? <Mail className="w-3 h-3" /> : <Linkedin className="w-3 h-3" />}
                        <span>{template.type === 'email' ? 'Email' : 'LinkedIn'}</span>
                      </div>
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo.color} text-white`}>
                        <CategoryIcon className="w-3 h-3" />
                        <span>{categoryInfo.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans bg-white/5 dark:bg-black/60 p-3 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
                    {personalizeTemplateContent(template.content)}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(personalizeTemplateContent(template.content), template.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 shadow"
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">Copier</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => copyAndOpenMail(template.content, `${template.id}-mail`)}
                    className="px-4 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 rounded-xl transition-all border border-blue-500/30"
                    title="Copier + ouvrir mail"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(template.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/30"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => deleteTemplate(showDeleteConfirm)}
          title="Supprimer le template"
          message="Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible."
        />
      )}
    </div>
  )
}

export default Templates
