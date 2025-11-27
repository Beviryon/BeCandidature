import { useState } from 'react'
import { Copy, Check, Mail, MessageSquare, Linkedin, Plus, X, Edit2 } from 'lucide-react'

const defaultTemplates = [
  {
    id: '1',
    name: 'Relance Email Classique',
    type: 'email',
    content: `Bonjour [Contact],

Je me permets de revenir vers vous concernant ma candidature pour le poste de [Poste] au sein de [Entreprise], envoyée le [Date].

Je reste très motivé(e) par cette opportunité et serais ravi(e) d'échanger avec vous sur ma candidature.

Restant à votre disposition pour tout complément d'information.

Cordialement,
[Votre Nom]`
  },
  {
    id: '2',
    name: 'Message LinkedIn - Première Relance',
    type: 'linkedin',
    content: `Bonjour [Contact],

J'ai postulé récemment pour le poste de [Poste] chez [Entreprise] et je souhaitais savoir si vous aviez eu l'occasion de consulter mon profil.

Mon expérience en [Compétences] me semble particulièrement adaptée à ce rôle.

Seriez-vous disponible pour un échange ?

Merci,
[Votre Nom]`
  },
  {
    id: '3',
    name: 'Relance Après Entretien',
    type: 'email',
    content: `Bonjour [Contact],

Suite à notre entretien du [Date Entretien], je souhaitais vous remercier pour le temps que vous m'avez accordé.

Cet échange a renforcé mon intérêt pour le poste de [Poste] et je suis convaincu(e) de pouvoir apporter une réelle valeur ajoutée à votre équipe.

N'hésitez pas si vous avez besoin d'informations complémentaires.

Cordialement,
[Votre Nom]`
  },
  {
    id: '4',
    name: 'Message LinkedIn - Connexion RH',
    type: 'linkedin',
    content: `Bonjour [Contact],

Je suis actuellement en recherche d'une alternance en tant que [Poste] et j'ai été particulièrement intéressé(e) par [Entreprise].

Votre parcours et votre expérience chez [Entreprise] m'inspirent beaucoup.

Seriez-vous ouvert(e) à échanger quelques minutes sur les opportunités au sein de votre entreprise ?

Merci par avance,
[Votre Nom]`
  },
  {
    id: '5',
    name: 'Email - Candidature Spontanée',
    type: 'email',
    content: `Madame, Monsieur,

Actuellement en recherche d'une alternance en [Domaine], je me permets de vous adresser ma candidature spontanée pour un poste de [Poste] au sein de [Entreprise].

Passionné(e) par [Domaine], j'ai développé des compétences en [Compétences] que je serais ravi(e) de mettre au service de vos projets.

Vous trouverez ci-joint mon CV. Je reste à votre disposition pour un entretien.

Cordialement,
[Votre Nom]`
  }
]

function Templates() {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('message_templates')
    return saved ? JSON.parse(saved) : defaultTemplates
  })
  const [copiedId, setCopiedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', type: 'email', content: '' })

  const saveTemplates = (updatedTemplates) => {
    setTemplates(updatedTemplates)
    localStorage.setItem('message_templates', JSON.stringify(updatedTemplates))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deleteTemplate = (id) => {
    if (window.confirm('Supprimer ce template ?')) {
      const updated = templates.filter(t => t.id !== id)
      saveTemplates(updated)
    }
  }

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert('Veuillez remplir tous les champs')
      return
    }
    const template = {
      ...newTemplate,
      id: Date.now().toString()
    }
    saveTemplates([...templates, template])
    setNewTemplate({ name: '', type: 'email', content: '' })
    setShowAddForm(false)
  }

  const updateTemplate = (id, updates) => {
    const updated = templates.map(t => t.id === id ? { ...t, ...updates } : t)
    saveTemplates(updated)
    setEditingId(null)
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
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400'
      case 'linkedin':
        return 'from-blue-600/20 to-blue-800/20 border-blue-600/30 text-blue-300'
      default:
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            Templates de Messages
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Gagnez du temps avec des messages pré-rédigés</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showAddForm ? 'Annuler' : 'Nouveau Template'}</span>
        </button>
      </div>

      {/* Add template form */}
      {showAddForm && (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-lg animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Créer un nouveau template</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du template
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Relance après 10 jours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="email" className="bg-white dark:bg-slate-800">Email</option>
                <option value="linkedin" className="bg-white dark:bg-slate-800">LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contenu du message
              </label>
              <textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                rows="10"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Utilisez [Contact], [Entreprise], [Poste], [Date] comme variables..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={addTemplate}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30 shadow-lg">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-blue-700 dark:text-blue-300">Variables disponibles :</strong> [Contact], [Entreprise], [Poste], [Date], [Date Entretien], [Compétences], [Votre Nom], [Domaine]
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-300 dark:border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-2 bg-gradient-to-r ${getTypeColor(template.type)} rounded-lg`}>
                    {getTypeIcon(template.type)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{template.name}</h3>
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(template.type)}`}>
                  {template.type === 'email' ? 'Email' : 'LinkedIn'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-300 dark:border-white/10 max-h-48 overflow-y-auto">
                {template.content}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(template.content, template.id)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
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
                onClick={() => deleteTemplate(template.id)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-12 text-center border border-purple-500/30 shadow-lg">
          <MessageSquare className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Aucun template
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Créez votre premier template de message
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un template</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Templates

