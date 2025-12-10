import { useState, useMemo } from 'react'
import { 
  Copy, Check, Mail, MessageSquare, Linkedin, Plus, X, Edit2, 
  Send, RefreshCw, Heart, Users, Briefcase, Sparkles, Filter,
  Star, ArrowRight, Search, FileText, CheckCircle
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
          <h2 className="text-4xl font-bold gradient-text mb-2 flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span>Templates de Messages Professionnels</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Messages pré-rédigés pour toutes vos communications professionnelles
          </p>
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
        {/* Recherche */}
        <div className="mb-4">
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
        </div>

        {/* Catégories */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Catégories :</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white/5 text-gray-600 dark:text-gray-400 border-white/10 hover:border-purple-500/30 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{category.name}</span>
                  {isSelected && selectedCategory !== 'all' && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {filteredTemplates.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
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

      {/* Info box */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/30 shadow-lg">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-blue-700 dark:text-blue-300">Variables disponibles :</strong> [Contact], [Entreprise], [Poste], [Date], [Date Entretien], [Compétences], [Votre Nom], [Domaine], [Expérience], [Nombre], [Raison], [Formation], [École], [Date Début], [Date Fin]
          </div>
        </div>
      </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category)
            const CategoryIcon = categoryInfo.icon
            return (
              <div
                key={template.id}
                className="group bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(template.type)} shadow-lg`}>
                        {getTypeIcon(template.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-400 dark:group-hover:text-purple-300 transition-colors">
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
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans bg-white/5 dark:bg-black/60 p-4 rounded-xl border border-white/10 max-h-64 overflow-y-auto">
                    {template.content}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(template.content, template.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
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

      {/* Statistiques */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.filter(c => c.id !== 'all').map(category => {
            const count = templates.filter(t => t.category === category.id).length
            const Icon = category.icon
            return (
              <div key={category.id} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{count}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{category.name}</div>
              </div>
            )
          })}
        </div>
      </div>

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
