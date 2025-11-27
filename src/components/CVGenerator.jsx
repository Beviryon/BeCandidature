import { useState, useEffect } from 'react'
import { Download, Eye, Save, FileText, Zap, Sparkles, QrCode, TrendingUp } from 'lucide-react'
import { jsPDF } from 'jspdf'

function CVGenerator() {
  const [formData, setFormData] = useState({
    // Informations personnelles
    nom: '',
    prenom: '',
    titre: '',
    email: '',
    telephone: '',
    adresse: '',
    linkedin: '',
    portfolio: '',
    photo: '',
    
    // Profil
    resume: '',
    
    // Expériences
    experiences: [
      { entreprise: '', poste: '', debut: '', fin: '', description: '' }
    ],
    
    // Formation
    formations: [
      { ecole: '', diplome: '', annee: '', description: '' }
    ],
    
    // Compétences
    competences: '',
    
    // Langues
    langues: '',
    
    // Loisirs
    loisirs: ''
  })

  const [selectedTemplate, setSelectedTemplate] = useState('moderne')
  const [showPreview, setShowPreview] = useState(false)
  const [downloadCount, setDownloadCount] = useState(0)

  useEffect(() => {
    // Charger le CV sauvegardé
    const savedCV = localStorage.getItem('cv_data')
    if (savedCV) {
      setFormData(JSON.parse(savedCV))
    }
    
    // Charger le compteur de téléchargements
    const count = localStorage.getItem('cv_download_count')
    if (count) {
      setDownloadCount(parseInt(count))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addItem = (arrayName, newItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem]
    }))
  }

  const removeItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }))
  }

  const saveCV = () => {
    localStorage.setItem('cv_data', JSON.stringify(formData))
    alert('✅ CV sauvegardé avec succès !')
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    let y = 20

    // En-tête
    doc.setFontSize(24)
    doc.setTextColor(139, 92, 246) // Purple
    doc.text(`${formData.prenom} ${formData.nom}`, 20, y)
    
    y += 10
    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.text(formData.titre, 20, y)

    // Informations de contact
    y += 15
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    if (formData.email) doc.text(`📧 ${formData.email}`, 20, y)
    if (formData.telephone) {
      y += 5
      doc.text(`📱 ${formData.telephone}`, 20, y)
    }
    if (formData.adresse) {
      y += 5
      doc.text(`📍 ${formData.adresse}`, 20, y)
    }

    // Résumé
    if (formData.resume) {
      y += 15
      doc.setFontSize(14)
      doc.setTextColor(139, 92, 246)
      doc.text('PROFIL', 20, y)
      
      y += 8
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      const resumeLines = doc.splitTextToSize(formData.resume, 170)
      doc.text(resumeLines, 20, y)
      y += resumeLines.length * 5
    }

    // Expériences
    if (formData.experiences.some(exp => exp.entreprise)) {
      y += 10
      doc.setFontSize(14)
      doc.setTextColor(139, 92, 246)
      doc.text('EXPÉRIENCES PROFESSIONNELLES', 20, y)
      
      formData.experiences.forEach(exp => {
        if (exp.entreprise) {
          y += 8
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
          doc.text(`${exp.poste} - ${exp.entreprise}`, 20, y)
          
          y += 5
          doc.setFontSize(9)
          doc.setTextColor(100, 100, 100)
          doc.text(`${exp.debut} - ${exp.fin}`, 20, y)
          
          if (exp.description) {
            y += 5
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            const descLines = doc.splitTextToSize(exp.description, 170)
            doc.text(descLines, 20, y)
            y += descLines.length * 4
          }
          y += 3
        }
      })
    }

    // Formation
    if (formData.formations.some(form => form.ecole)) {
      y += 10
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      doc.setFontSize(14)
      doc.setTextColor(139, 92, 246)
      doc.text('FORMATION', 20, y)
      
      formData.formations.forEach(form => {
        if (form.ecole) {
          y += 8
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
          doc.text(`${form.diplome} - ${form.ecole}`, 20, y)
          
          y += 5
          doc.setFontSize(9)
          doc.setTextColor(100, 100, 100)
          doc.text(form.annee, 20, y)
          
          if (form.description) {
            y += 5
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            const descLines = doc.splitTextToSize(form.description, 170)
            doc.text(descLines, 20, y)
            y += descLines.length * 4
          }
          y += 3
        }
      })
    }

    // Compétences
    if (formData.competences) {
      y += 10
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      doc.setFontSize(14)
      doc.setTextColor(139, 92, 246)
      doc.text('COMPÉTENCES', 20, y)
      
      y += 8
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      const compLines = doc.splitTextToSize(formData.competences, 170)
      doc.text(compLines, 20, y)
    }

    // Sauvegarder et incrémenter compteur
    doc.save(`CV_${formData.prenom}_${formData.nom}.pdf`)
    
    const newCount = downloadCount + 1
    setDownloadCount(newCount)
    localStorage.setItem('cv_download_count', newCount.toString())
  }

  const templates = [
    { id: 'moderne', name: 'Moderne', icon: Zap, color: 'purple' },
    { id: 'classique', name: 'Classique', icon: FileText, color: 'blue' },
    { id: 'creatif', name: 'Créatif', icon: Sparkles, color: 'pink' }
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            📄 Générateur de CV
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un CV professionnel en quelques minutes
          </p>
        </div>

        {/* Statistiques */}
        <div className="flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/30">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {downloadCount} téléchargement{downloadCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Choisissez un template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(template => {
            const Icon = template.icon
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedTemplate === template.id
                    ? `border-${template.color}-500 bg-${template.color}-500/10`
                    : 'border-gray-300 dark:border-white/10 hover:border-purple-500/50'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 ${
                  selectedTemplate === template.id
                    ? `text-${template.color}-600 dark:text-${template.color}-400`
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
                <div className={`font-bold ${
                  selectedTemplate === template.id
                    ? `text-${template.color}-700 dark:text-${template.color}-300`
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {template.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          Vos informations
        </h3>

        <div className="space-y-6">
          {/* Informations personnelles */}
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Informations personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="prenom"
                placeholder="Prénom *"
                value={formData.prenom}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              <input
                type="text"
                name="nom"
                placeholder="Nom *"
                value={formData.nom}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              <input
                type="text"
                name="titre"
                placeholder="Titre professionnel *"
                value={formData.titre}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all md:col-span-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              <input
                type="tel"
                name="telephone"
                placeholder="Téléphone *"
                value={formData.telephone}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              <input
                type="text"
                name="adresse"
                placeholder="Adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              <input
                type="url"
                name="portfolio"
                placeholder="Portfolio / Site web"
                value={formData.portfolio}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Résumé */}
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Profil / Résumé
            </h4>
            <textarea
              name="resume"
              placeholder="Décrivez-vous en quelques lignes..."
              value={formData.resume}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          {/* Compétences */}
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Compétences
            </h4>
            <textarea
              name="competences"
              placeholder="Ex: React, Node.js, Python, Git, Docker..."
              value={formData.competences}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={saveCV}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl font-medium transition-all duration-300 border border-blue-500/30"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder</span>
        </button>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl font-medium transition-all duration-300 border border-purple-500/30"
        >
          <Eye className="w-5 h-5" />
          <span>{showPreview ? 'Masquer' : 'Prévisualiser'}</span>
        </button>

        <button
          onClick={generatePDF}
          disabled={!formData.nom || !formData.prenom}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
        >
          <Download className="w-5 h-5" />
          <span>Télécharger PDF</span>
        </button>

        {formData.portfolio && (
          <a
            href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formData.portfolio)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl font-medium transition-all duration-300 border border-green-500/30"
          >
            <QrCode className="w-5 h-5" />
            <span>QR Code</span>
          </a>
        )}
      </div>

      {/* Prévisualisation */}
      {showPreview && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-purple-500/20 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 border-b border-gray-300 dark:border-gray-700 pb-6">
              <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {formData.prenom} {formData.nom}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">{formData.titre}</p>
              <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {formData.email && <p>📧 {formData.email}</p>}
                {formData.telephone && <p>📱 {formData.telephone}</p>}
                {formData.adresse && <p>📍 {formData.adresse}</p>}
              </div>
            </div>

            {formData.resume && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">PROFIL</h2>
                <p className="text-gray-700 dark:text-gray-300">{formData.resume}</p>
              </div>
            )}

            {formData.competences && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">COMPÉTENCES</h2>
                <p className="text-gray-700 dark:text-gray-300">{formData.competences}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CVGenerator

