import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Download, Eye, Save, FileText, Zap, Sparkles, QrCode, TrendingUp, 
  ExternalLink, Palette, Layout, Briefcase, GraduationCap, Award,
  Mail, Phone, MapPin, Linkedin, Globe, Plus, X, CheckCircle,
  Star, ArrowRight, Image as ImageIcon, ChevronDown
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useToast } from '../contexts/ToastContext'

function CVGenerator() {
  const { success, error: showError } = useToast()
  const previewRef = useRef(null)
  const pdfExportRef = useRef(null)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    titre: '',
    email: '',
    telephone: '',
    adresse: '',
    linkedin: '',
    portfolio: '',
    photo: '',
    resume: '',
    experiences: [{ entreprise: '', poste: '', debut: '', fin: '', description: '', ville: '' }],
    formations: [{ ecole: '', diplome: '', annee: '', description: '', ville: '' }],
    competences: '',
    langues: '',
    loisirs: '',
    certifications: [{ nom: '', organisme: '', date: '' }],
    cibleAts: ''
  })

  const [selectedTemplate, setSelectedTemplate] = useState('moderne')
  const [showPreview, setShowPreview] = useState(true)
  const [downloadCount, setDownloadCount] = useState(0)
  const [activeSection, setActiveSection] = useState('personal')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isTemplateAccordionOpen, setIsTemplateAccordionOpen] = useState(false)
  const isAtsTemplate = selectedTemplate.startsWith('ats-')

  useEffect(() => {
    const savedCV = localStorage.getItem('cv_data')
    if (savedCV) {
      setFormData(JSON.parse(savedCV))
    }
    const count = localStorage.getItem('cv_download_count')
    if (count) {
      setDownloadCount(parseInt(count))
    }
    const savedAccordionState = localStorage.getItem('cv_template_accordion_open')
    if (savedAccordionState !== null) {
      setIsTemplateAccordionOpen(savedAccordionState === 'true')
    }
    const savedTemplate = localStorage.getItem('cv_selected_template')
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate)
    }
    const savedSection = localStorage.getItem('cv_active_section')
    if (savedSection) {
      setActiveSection(savedSection)
    }
    const savedPreview = localStorage.getItem('cv_show_preview')
    if (savedPreview !== null) {
      setShowPreview(savedPreview === 'true')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cv_template_accordion_open', String(isTemplateAccordionOpen))
  }, [isTemplateAccordionOpen])

  useEffect(() => {
    localStorage.setItem('cv_selected_template', selectedTemplate)
  }, [selectedTemplate])

  useEffect(() => {
    localStorage.setItem('cv_active_section', activeSection)
  }, [activeSection])

  useEffect(() => {
    localStorage.setItem('cv_show_preview', String(showPreview))
  }, [showPreview])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
    success('CV sauvegardé avec succès !')
  }

  const buildSafeFilename = () => {
    const rawName = `CV_${formData.prenom || ''}_${formData.nom || 'Candidat'}`
    const sanitized = rawName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
    return `${sanitized || 'CV_Candidat'}.pdf`
  }

  const sanitizeAtsText = (value = '') => {
    return String(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .trim()
  }

  const generateAtsTextPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginX = 15
    const maxWidth = pageWidth - (marginX * 2)
    let y = 18

    const ensureSpace = (needed = 8) => {
      if (y + needed > pageHeight - 12) {
        doc.addPage()
        y = 18
      }
    }

    const writeLines = (text, options = {}) => {
      const {
        size = 10,
        style = 'normal',
        indent = marginX,
        lineHeight = 5
      } = options

      const safeText = sanitizeAtsText(text)
      if (!safeText) return

      doc.setFont('helvetica', style)
      doc.setFontSize(size)
      const lines = doc.splitTextToSize(safeText, pageWidth - indent - marginX)
      lines.forEach((line) => {
        ensureSpace(lineHeight)
        doc.text(line, indent, y)
        y += lineHeight
      })
    }

    const writeSectionTitle = (title) => {
      ensureSpace(10)
      y += 2
      doc.setDrawColor(40, 40, 40)
      doc.setLineWidth(0.3)
      doc.line(marginX, y, pageWidth - marginX, y)
      y += 5
      writeLines(title, { size: 11, style: 'bold', lineHeight: 6 })
      y += 1
    }

    const fullName = `${formData.prenom || ''} ${formData.nom || ''}`.trim()
    writeLines(fullName || 'Nom Prenom', { size: 19, style: 'bold', lineHeight: 8 })
    writeLines(formData.titre || 'Titre professionnel', { size: 12, lineHeight: 6 })

    const contactLine = [
      formData.email,
      formData.telephone,
      formData.adresse
    ].filter(Boolean).join(' | ')
    writeLines(contactLine, { size: 10 })
    if (formData.linkedin) writeLines(`LinkedIn: ${formData.linkedin}`, { size: 10 })
    if (formData.portfolio) writeLines(`Portfolio: ${formData.portfolio}`, { size: 10 })

    if (formData.resume) {
      writeSectionTitle('PROFIL')
      writeLines(formData.resume, { size: 10, lineHeight: 5 })
    }

    const experiences = formData.experiences.filter((exp) => exp.entreprise || exp.poste || exp.description)
    if (experiences.length > 0) {
      writeSectionTitle('EXPERIENCE PROFESSIONNELLE')
      experiences.forEach((exp) => {
        writeLines(`${exp.poste || 'Poste'} - ${exp.entreprise || 'Entreprise'}`, { size: 10.5, style: 'bold' })
        writeLines(`${exp.debut || ''} - ${exp.fin || 'Present'}${exp.ville ? ` | ${exp.ville}` : ''}`, { size: 9.5 })
        if (exp.description) writeLines(exp.description, { size: 9.8, indent: marginX + 3 })
        y += 2
      })
    }

    const formations = formData.formations.filter((form) => form.ecole || form.diplome || form.description)
    if (formations.length > 0) {
      writeSectionTitle('FORMATION')
      formations.forEach((form) => {
        writeLines(`${form.diplome || 'Diplome'} - ${form.ecole || 'Etablissement'}`, { size: 10.5, style: 'bold' })
        if (form.annee || form.ville) {
          writeLines(`${form.annee || ''}${form.ville ? ` | ${form.ville}` : ''}`, { size: 9.5 })
        }
        if (form.description) writeLines(form.description, { size: 9.8, indent: marginX + 3 })
        y += 2
      })
    }

    if (formData.competences) {
      writeSectionTitle('COMPETENCES')
      writeLines(formData.competences, { size: 10, lineHeight: 5 })
    }

    if (formData.langues) {
      writeSectionTitle('LANGUES')
      writeLines(formData.langues, { size: 10, lineHeight: 5 })
    }

    if (formData.loisirs) {
      writeSectionTitle('CENTRES D INTERET')
      writeLines(formData.loisirs, { size: 10, lineHeight: 5 })
    }

    const certifications = formData.certifications.filter((cert) => cert.nom || cert.organisme)
    if (certifications.length > 0) {
      writeSectionTitle('CERTIFICATIONS')
      certifications.forEach((cert) => {
        writeLines(`${cert.nom || 'Certification'} - ${cert.organisme || ''} ${cert.date ? `(${cert.date})` : ''}`, { size: 10 })
      })
    }

    return doc
  }

  const generatePDF = async () => {
    if (!formData.nom || !formData.prenom) {
      showError('Veuillez remplir au minimum le prénom et le nom.')
      return
    }

    try {
      setIsGeneratingPdf(true)

      if (isAtsTemplate) {
        const doc = generateAtsTextPdf()
        const fileName = buildSafeFilename()
        doc.save(fileName)

        const newCount = downloadCount + 1
        setDownloadCount(newCount)
        localStorage.setItem('cv_download_count', newCount.toString())
        success('CV ATS exporté en PDF texte avec succès !')
        return
      }

      if (document?.fonts?.ready) {
        await document.fonts.ready
      }

      const targetElement = pdfExportRef.current || previewRef.current
      if (!targetElement) {
        throw new Error('Aperçu introuvable pour l’export PDF')
      }

      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: targetElement.scrollWidth,
        windowHeight: targetElement.scrollHeight
      })

      const imgData = canvas.toDataURL('image/png')
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const imgProps = doc.getImageProperties(imgData)
      const imgWidth = pageWidth
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width

      let heightLeft = imgHeight
      let position = 0

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = buildSafeFilename()
      try {
        doc.save(fileName)
      } catch {
        // Fallback pour navigateurs/environnements où save() est bloqué
        const blob = doc.output('blob')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      }
      
      const newCount = downloadCount + 1
      setDownloadCount(newCount)
      localStorage.setItem('cv_download_count', newCount.toString())
      success('CV téléchargé avec succès !')
    } catch (err) {
      console.error('Erreur génération PDF:', err)
      showError(`Erreur lors de la génération du PDF${err?.message ? ` : ${err.message}` : ''}`)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const extractKeywords = (text) => {
    const stopWords = new Set([
      'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'pour', 'avec',
      'dans', 'sur', 'par', 'au', 'aux', 'en', 'd', 'l', 'a', 'the', 'to', 'of',
      'and', 'or', 'for', 'you', 'your', 'nous', 'vous', 'notre', 'votre'
    ])

    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9+#./-]/g, ' ')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !stopWords.has(token))
  }

  const atsAnalysis = useMemo(() => {
    const hasIdentity = Boolean(formData.prenom && formData.nom)
    const hasTitle = Boolean(formData.titre)
    const hasContact = Boolean(formData.email && formData.telephone)
    const hasExperience = formData.experiences.some((exp) => exp.entreprise || exp.poste || exp.description)
    const hasEducation = formData.formations.some((form) => form.ecole || form.diplome)
    const hasSkills = Boolean(formData.competences?.trim())
    const hasSummary = Boolean(formData.resume?.trim())

    const normalizedCvText = [
      formData.titre,
      formData.resume,
      formData.competences,
      formData.langues,
      ...formData.experiences.map((exp) => `${exp.poste} ${exp.entreprise} ${exp.description}`),
      ...formData.formations.map((form) => `${form.diplome} ${form.ecole} ${form.description}`)
    ]
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const targetKeywords = extractKeywords(formData.cibleAts).slice(0, 30)
    const uniqueKeywords = [...new Set(targetKeywords)]
    const matchedKeywords = uniqueKeywords.filter((kw) => normalizedCvText.includes(kw))
    const missingKeywords = uniqueKeywords.filter((kw) => !normalizedCvText.includes(kw))
    const keywordMatchRate = uniqueKeywords.length === 0
      ? null
      : Math.round((matchedKeywords.length / uniqueKeywords.length) * 100)

    const getSectionMatchRate = (text) => {
      if (uniqueKeywords.length === 0) return null
      const normalizedText = String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      const sectionMatches = uniqueKeywords.filter((kw) => normalizedText.includes(kw)).length
      return Math.round((sectionMatches / uniqueKeywords.length) * 100)
    }

    const sectionScores = {
      titre: hasTitle ? (getSectionMatchRate(formData.titre) ?? 0) : 0,
      resume: hasSummary ? (getSectionMatchRate(formData.resume) ?? 0) : 0,
      experiences: hasExperience
        ? (getSectionMatchRate(formData.experiences.map((exp) => `${exp.poste} ${exp.entreprise} ${exp.description}`).join(' ')) ?? 0)
        : 0,
      competences: hasSkills ? (getSectionMatchRate(formData.competences) ?? 0) : 0
    }

    let score = 0
    if (hasIdentity) score += 10
    if (hasTitle) score += 10
    if (hasContact) score += 10
    if (hasSummary) score += 10
    if (hasExperience) score += 20
    if (hasEducation) score += 10
    if (hasSkills) score += 15
    if (keywordMatchRate !== null) score += Math.round((keywordMatchRate / 100) * 15)

    const recommendations = []
    if (!hasTitle) recommendations.push('Ajoute un titre de poste clair (ex: Développeur React Alternance).')
    if (!hasSummary) recommendations.push('Ajoute un résumé professionnel de 3 à 5 lignes avec mots-clés métier.')
    if (!hasExperience) recommendations.push('Ajoute au moins une expérience avec missions et résultats.')
    if (!hasEducation) recommendations.push('Ajoute ta formation principale (diplôme, école, année).')
    if (!hasSkills) recommendations.push('Ajoute une section compétences avec outils/technos précis.')
    if (keywordMatchRate !== null && keywordMatchRate < 50) {
      recommendations.push('Renforce les mots-clés de l’offre cible dans le titre, résumé et expériences.')
    }
    if (!formData.cibleAts?.trim()) {
      recommendations.push('Colle une offre cible pour mesurer la correspondance ATS en temps réel.')
    }
    if (missingKeywords.length > 0 && hasSkills) {
      recommendations.push('Ajoute les mots-clés manquants dans la section compétences et dans 1 à 2 expériences.')
    }

    const scoreBand = score >= 80 ? 'excellent' : score >= 60 ? 'bon' : score >= 40 ? 'moyen' : 'faible'
    const suggestedAtsSentence = missingKeywords.length > 0
      ? `Environnement et missions en lien avec ${missingKeywords.slice(0, 4).join(', ')}.`
      : ''

    return {
      score: Math.min(score, 100),
      scoreBand,
      keywordMatchRate,
      targetKeywords: uniqueKeywords,
      matchedKeywords,
      missingKeywords,
      sectionScores,
      suggestedAtsSentence,
      recommendations
    }
  }, [formData])

  const completionStats = useMemo(() => {
    const checkpoints = [
      Boolean(formData.prenom?.trim()),
      Boolean(formData.nom?.trim()),
      Boolean(formData.titre?.trim()),
      Boolean(formData.email?.trim()),
      Boolean(formData.telephone?.trim()),
      Boolean(formData.resume?.trim()),
      formData.experiences.some((exp) => exp.entreprise || exp.poste || exp.description),
      formData.formations.some((form) => form.ecole || form.diplome),
      Boolean(formData.competences?.trim())
    ]

    const completed = checkpoints.filter(Boolean).length
    const total = checkpoints.length
    const percentage = Math.round((completed / total) * 100)

    return { completed, total, percentage }
  }, [formData])

  const insertMissingKeywordsInSkills = () => {
    const missing = atsAnalysis.missingKeywords.slice(0, 12)
    if (missing.length === 0) {
      showError('Aucun mot-clé manquant détecté à ajouter.')
      return
    }

    const existing = (formData.competences || '').trim()
    const keywordChunk = missing.join(', ')
    const nextSkills = existing ? `${existing}\n${keywordChunk}` : keywordChunk

    setFormData((prev) => ({ ...prev, competences: nextSkills }))
    success('Mots-clés manquants ajoutés dans Compétences.')
  }

  const addAtsSentenceToResume = () => {
    if (!atsAnalysis.suggestedAtsSentence) {
      showError('Aucune suggestion ATS disponible pour le résumé.')
      return
    }

    const existingResume = (formData.resume || '').trim()
    const nextResume = existingResume
      ? `${existingResume}\n${atsAnalysis.suggestedAtsSentence}`
      : atsAnalysis.suggestedAtsSentence

    setFormData((prev) => ({ ...prev, resume: nextResume }))
    success('Suggestion ATS ajoutée au résumé.')
  }

  const cvServices = [
    {
      name: 'Canva',
      description: 'Créateur de CV avec des milliers de templates',
      url: 'https://www.canva.com/fr_fr/creer/cv/',
      icon: Palette,
      color: 'from-blue-500 to-cyan-500',
      popular: true
    },
    {
      name: 'Zety',
      description: 'Générateur de CV ATS-friendly professionnel',
      url: 'https://www.zety.com/fr/creer-cv',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      popular: true
    },
    {
      name: 'Resume.io',
      description: 'Créateur de CV moderne et élégant',
      url: 'https://resume.io/',
      icon: Sparkles,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'VisualCV',
      description: 'CV interactifs et partageables en ligne',
      url: 'https://www.visualcv.com/',
      icon: Globe,
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Kickresume',
      description: 'Templates de CV professionnels premium',
      url: 'https://www.kickresume.com/',
      icon: Star,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Resume.com',
      description: 'Générateur de CV gratuit et simple',
      url: 'https://www.resume.com/',
      icon: Briefcase,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const templates = [
    { 
      id: 'moderne', 
      name: 'Moderne', 
      description: 'Design épuré et professionnel',
      icon: Zap, 
      gradient: 'from-purple-500 to-pink-500',
      preview: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20'
    },
    { 
      id: 'classique', 
      name: 'Classique', 
      description: 'Style traditionnel et élégant',
      icon: FileText, 
      gradient: 'from-blue-500 to-cyan-500',
      preview: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      id: 'ats-simple',
      name: 'ATS Simple',
      description: 'Monocolonne, lisible ATS, sans fioritures',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-500',
      preview: 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20'
    },
    {
      id: 'ats-chrono',
      name: 'ATS Chrono',
      description: 'Format chronologique optimisé ATS',
      icon: CheckCircle,
      gradient: 'from-lime-500 to-green-500',
      preview: 'bg-gradient-to-br from-lime-100 to-green-100 dark:from-lime-900/20 dark:to-green-900/20'
    },
    { 
      id: 'creatif', 
      name: 'Créatif', 
      description: 'Design original et moderne',
      icon: Sparkles, 
      gradient: 'from-pink-500 to-rose-500',
      preview: 'bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20'
    },
    { 
      id: 'executif', 
      name: 'Exécutif', 
      description: 'Style corporate et professionnel',
      icon: Briefcase, 
      gradient: 'from-gray-700 to-gray-900',
      preview: 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900'
    }
  ]

  const selectedTemplateMeta = templates.find((template) => template.id === selectedTemplate) || templates[0]
  const sectionTabs = [
    { id: 'personal', label: 'Personnel', icon: FileText },
    { id: 'experience', label: 'Expériences', icon: Briefcase },
    { id: 'education', label: 'Formation', icon: GraduationCap },
    { id: 'skills', label: 'Compétences', icon: Star },
    { id: 'ats', label: 'ATS', icon: TrendingUp }
  ]

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId)
    setIsTemplateAccordionOpen(false)
  }

  const renderCVPreview = () => {
    if (selectedTemplate === 'ats-simple' || selectedTemplate === 'ats-chrono') {
      const isChrono = selectedTemplate === 'ats-chrono'
      return (
        <div className="bg-white text-black shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
          <div className="mb-5">
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {formData.prenom || 'Prénom'} {formData.nom || 'Nom'}
            </h1>
            <p className="text-lg">{formData.titre || 'Titre professionnel'}</p>
            <p className="text-sm mt-2">
              {[formData.email, formData.telephone, formData.adresse].filter(Boolean).join(' | ')}
            </p>
            {(formData.linkedin || formData.portfolio) && (
              <p className="text-sm">
                {[formData.linkedin, formData.portfolio].filter(Boolean).join(' | ')}
              </p>
            )}
          </div>

          {formData.resume && (
            <section className="mb-4">
              <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">Profil</h2>
              <p className="text-sm whitespace-pre-line leading-relaxed">{formData.resume}</p>
            </section>
          )}

          {formData.experiences.some(exp => exp.entreprise) && (
            <section className="mb-4">
              <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">Expérience professionnelle</h2>
              {formData.experiences.map((exp, idx) => (
                exp.entreprise && (
                  <div key={idx} className="mb-3">
                    <div className={`flex ${isChrono ? 'justify-between' : 'flex-col'} items-start`}>
                      <div>
                        <h3 className="font-bold text-sm">{exp.poste || 'Poste'} - {exp.entreprise}</h3>
                        {exp.ville && <p className="text-xs">{exp.ville}</p>}
                      </div>
                      <span className="text-xs">{exp.debut || 'Début'} - {exp.fin || 'Aujourd’hui'}</span>
                    </div>
                    {exp.description && <p className="text-sm mt-1 whitespace-pre-line">{exp.description}</p>}
                  </div>
                )
              ))}
            </section>
          )}

          {formData.formations.some(form => form.ecole) && (
            <section className="mb-4">
              <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">Formation</h2>
              {formData.formations.map((form, idx) => (
                form.ecole && (
                  <div key={idx} className="mb-2">
                    <h3 className="font-bold text-sm">{form.diplome || 'Diplôme'} - {form.ecole}</h3>
                    <p className="text-xs">{[form.annee, form.ville].filter(Boolean).join(' | ')}</p>
                    {form.description && <p className="text-sm mt-1 whitespace-pre-line">{form.description}</p>}
                  </div>
                )
              ))}
            </section>
          )}

          {formData.competences && (
            <section className="mb-4">
              <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">Compétences</h2>
              <p className="text-sm whitespace-pre-line">{formData.competences}</p>
            </section>
          )}

          {formData.langues && (
            <section className="mb-4">
              <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">Langues</h2>
              <p className="text-sm whitespace-pre-line">{formData.langues}</p>
            </section>
          )}
        </div>
      )
    }

    // Template Moderne
    if (selectedTemplate === 'moderne') {
      return (
        <div className="bg-white text-gray-900 shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: 0 }}>
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">
              {formData.prenom || 'Prénom'} {formData.nom || 'Nom'}
            </h1>
            <p className="text-xl text-white/90">{formData.titre || 'Titre professionnel'}</p>
          </div>
          
          <div className="p-8">
            {/* Contact */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              {formData.email && <div className="flex items-center space-x-2"><Mail className="w-4 h-4" /><span>{formData.email}</span></div>}
              {formData.telephone && <div className="flex items-center space-x-2"><Phone className="w-4 h-4" /><span>{formData.telephone}</span></div>}
              {formData.adresse && <div className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>{formData.adresse}</span></div>}
              {formData.linkedin && <div className="flex items-center space-x-2"><Linkedin className="w-4 h-4" /><span>{formData.linkedin}</span></div>}
              {formData.portfolio && <div className="flex items-center space-x-2"><Globe className="w-4 h-4" /><span>{formData.portfolio}</span></div>}
            </div>
            
            {/* Profil */}
            {formData.resume ? (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 mb-3 border-b-2 border-purple-600 pb-2">PROFIL</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{formData.resume}</p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-sm italic">Ajoutez votre profil professionnel dans la section &quot;Personnel&quot;</p>
              </div>
            )}
            
            {/* Expériences */}
            {formData.experiences.some(exp => exp.entreprise) ? (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 mb-3 border-b-2 border-purple-600 pb-2">EXPÉRIENCES PROFESSIONNELLES</h2>
                {formData.experiences.map((exp, idx) => (
                  exp.entreprise && (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-bold text-lg">{exp.poste || 'Poste'}</h3>
                          <p className="text-purple-600 font-semibold">{exp.entreprise}</p>
                        </div>
                        <span className="text-gray-500 text-sm">{exp.debut || 'Début'} - {exp.fin || 'Fin'}</span>
                      </div>
                      {exp.description && <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{exp.description}</p>}
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-sm italic">Ajoutez vos expériences professionnelles dans la section &quot;Expériences&quot;</p>
              </div>
            )}
            
            {/* Formations */}
            {formData.formations.some(form => form.ecole) ? (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 mb-3 border-b-2 border-purple-600 pb-2">FORMATION</h2>
                {formData.formations.map((form, idx) => (
                  form.ecole && (
                    <div key={idx} className="mb-3">
                      <h3 className="font-bold">{form.diplome || 'Diplôme'}</h3>
                      <p className="text-purple-600">{form.ecole}</p>
                      {form.annee && <p className="text-gray-500 text-sm">{form.annee}</p>}
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-sm italic">Ajoutez vos formations dans la section &quot;Formation&quot;</p>
              </div>
            )}
            
            {/* Compétences */}
            {formData.competences ? (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 mb-3 border-b-2 border-purple-600 pb-2">COMPÉTENCES</h2>
                <p className="text-gray-700 whitespace-pre-line">{formData.competences}</p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-sm italic">Ajoutez vos compétences dans la section &quot;Compétences&quot;</p>
              </div>
            )}

            {/* Langues */}
            {formData.langues && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-600 mb-3 border-b-2 border-purple-600 pb-2">LANGUES</h2>
                <p className="text-gray-700">{formData.langues}</p>
              </div>
            )}

            {/* Loisirs */}
            {formData.loisirs && (
              <div>
                <h2 className="text-xl font-bold text-purple-600 mb-3 border-b-2 border-purple-600 pb-2">CENTRES D&apos;INTÉRÊT</h2>
                <p className="text-gray-700">{formData.loisirs}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Template Classique
    if (selectedTemplate === 'classique') {
      return (
        <div className="bg-white text-gray-900 shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '40px' }}>
          <div className="border-b-4 border-blue-600 pb-4 mb-6">
            <h1 className="text-5xl font-bold text-blue-600 mb-2">
              {formData.prenom || 'Prénom'} {formData.nom || 'Nom'}
            </h1>
            <p className="text-2xl text-gray-600">{formData.titre || 'Titre professionnel'}</p>
          </div>
          
          <div className="space-y-6">
            {/* Contact */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {formData.email && <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-blue-600" /><span>{formData.email}</span></div>}
              {formData.telephone && <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-blue-600" /><span>{formData.telephone}</span></div>}
              {formData.adresse && <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-blue-600" /><span>{formData.adresse}</span></div>}
              {formData.linkedin && <div className="flex items-center space-x-2"><Linkedin className="w-4 h-4 text-blue-600" /><span>{formData.linkedin}</span></div>}
            </div>
            
            {/* Profil */}
            {formData.resume && (
              <div>
                <h2 className="text-2xl font-bold text-blue-600 mb-3 uppercase">Profil Professionnel</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{formData.resume}</p>
              </div>
            )}
            
            {/* Expériences */}
            {formData.experiences.some(exp => exp.entreprise) && (
              <div>
                <h2 className="text-2xl font-bold text-blue-600 mb-3 uppercase">Expérience Professionnelle</h2>
                {formData.experiences.map((exp, idx) => (
                  exp.entreprise && (
                    <div key={idx} className="mb-4 pl-4 border-l-4 border-blue-600">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-bold text-lg">{exp.poste || 'Poste'}</h3>
                          <p className="text-blue-600 font-semibold">{exp.entreprise}</p>
                        </div>
                        <span className="text-gray-500 text-sm">{exp.debut || 'Début'} - {exp.fin || 'Fin'}</span>
                      </div>
                      {exp.description && <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{exp.description}</p>}
                    </div>
                  )
                ))}
              </div>
            )}
            
            {/* Formations */}
            {formData.formations.some(form => form.ecole) && (
              <div>
                <h2 className="text-2xl font-bold text-blue-600 mb-3 uppercase">Formation</h2>
                {formData.formations.map((form, idx) => (
                  form.ecole && (
                    <div key={idx} className="mb-3 pl-4 border-l-4 border-blue-600">
                      <h3 className="font-bold">{form.diplome || 'Diplôme'}</h3>
                      <p className="text-blue-600">{form.ecole}</p>
                      {form.annee && <p className="text-gray-500 text-sm">{form.annee}</p>}
                    </div>
                  )
                ))}
              </div>
            )}
            
            {/* Compétences */}
            {formData.competences && (
              <div>
                <h2 className="text-2xl font-bold text-blue-600 mb-3 uppercase">Compétences</h2>
                <p className="text-gray-700 whitespace-pre-line">{formData.competences}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Template Créatif
    if (selectedTemplate === 'creatif') {
      return (
        <div className="bg-white text-gray-900 shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: 0 }}>
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">
              {formData.prenom || 'Prénom'} {formData.nom || 'Nom'}
            </h1>
            <p className="text-xl text-white/90">{formData.titre || 'Titre professionnel'}</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                {/* Contact */}
                <div className="space-y-3 mb-6">
                  {formData.email && <div className="flex items-center space-x-2 text-sm"><Mail className="w-4 h-4 text-pink-500" /><span>{formData.email}</span></div>}
                  {formData.telephone && <div className="flex items-center space-x-2 text-sm"><Phone className="w-4 h-4 text-pink-500" /><span>{formData.telephone}</span></div>}
                  {formData.adresse && <div className="flex items-center space-x-2 text-sm"><MapPin className="w-4 h-4 text-pink-500" /><span>{formData.adresse}</span></div>}
                </div>
                
                {/* Compétences */}
                {formData.competences && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-pink-500 mb-2">COMPÉTENCES</h2>
                    <p className="text-gray-700 text-sm whitespace-pre-line">{formData.competences}</p>
                  </div>
                )}
              </div>
              
              <div>
                {/* Profil */}
                {formData.resume && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-pink-500 mb-2">PROFIL</h2>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{formData.resume}</p>
                  </div>
                )}
                
                {/* Expériences */}
                {formData.experiences.some(exp => exp.entreprise) && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-pink-500 mb-2">EXPÉRIENCES</h2>
                    {formData.experiences.map((exp, idx) => (
                      exp.entreprise && (
                        <div key={idx} className="mb-3">
                          <h3 className="font-bold text-sm">{exp.poste || 'Poste'}</h3>
                          <p className="text-pink-500 text-sm">{exp.entreprise}</p>
                          <p className="text-gray-500 text-xs">{exp.debut || 'Début'} - {exp.fin || 'Fin'}</p>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Template Exécutif (par défaut)
    return (
      <div className="bg-white text-gray-900 shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '40px' }}>
        <div className="border-l-8 border-gray-800 pl-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {formData.prenom || 'Prénom'} {formData.nom || 'Nom'}
          </h1>
          <p className="text-xl text-gray-600">{formData.titre || 'Titre professionnel'}</p>
        </div>
        
        <div className="space-y-6">
          {/* Contact */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {formData.email && <span>{formData.email}</span>}
            {formData.telephone && <span>• {formData.telephone}</span>}
            {formData.adresse && <span>• {formData.adresse}</span>}
          </div>
          
          {/* Profil */}
          {formData.resume && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">Profil</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{formData.resume}</p>
            </div>
          )}
          
          {/* Expériences */}
          {formData.experiences.some(exp => exp.entreprise) && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Expérience</h2>
              {formData.experiences.map((exp, idx) => (
                exp.entreprise && (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-lg">{exp.poste || 'Poste'}</h3>
                        <p className="text-gray-600 font-semibold">{exp.entreprise}</p>
                      </div>
                      <span className="text-gray-500 text-sm">{exp.debut || 'Début'} - {exp.fin || 'Fin'}</span>
                    </div>
                    {exp.description && <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{exp.description}</p>}
                  </div>
                )
              ))}
            </div>
          )}
          
          {/* Formations */}
          {formData.formations.some(form => form.ecole) && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Formation</h2>
              {formData.formations.map((form, idx) => (
                form.ecole && (
                  <div key={idx} className="mb-3">
                    <h3 className="font-bold">{form.diplome || 'Diplôme'}</h3>
                    <p className="text-gray-600">{form.ecole}</p>
                    {form.annee && <p className="text-gray-500 text-sm">{form.annee}</p>}
                  </div>
                )
              ))}
            </div>
          )}
          
          {/* Compétences */}
          {formData.competences && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Compétences</h2>
              <p className="text-gray-700 whitespace-pre-line">{formData.competences}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_55%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Generateur de CV Professionnel
            </h2>
            <p className="text-white/90 max-w-2xl">
              Construit un CV clair, moderne et compatible ATS avec un score en temps reel et des suggestions actionnables.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-medium">
              <TrendingUp className="w-4 h-4" />
              {downloadCount} telechargement{downloadCount !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-medium">
              <CheckCircle className="w-4 h-4" />
              {completionStats.percentage}% complete
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-medium">
              <Layout className="w-4 h-4" />
              {selectedTemplateMeta?.name || 'Template'}
            </span>
            {isAtsTemplate && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-200/40 text-xs font-semibold">
                ATS actif
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Templates avec aperçu */}
      <div className="bg-white/90 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-500/20 shadow-lg">
        <button
          type="button"
          onClick={() => setIsTemplateAccordionOpen(prev => !prev)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center space-x-2">
              <Layout className="w-5 h-5 text-purple-400" />
              <span>Choisissez un template</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isTemplateAccordionOpen
                ? 'Selectionne un style visuel. Les templates ATS sont optimises pour le parsing.'
                : `Template actif: ${selectedTemplateMeta?.name || 'Aucun'}${isAtsTemplate ? ' (ATS)' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAtsTemplate && (
              <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30">
                ATS
              </span>
            )}
            <ChevronDown className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${isTemplateAccordionOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {!isTemplateAccordionOpen && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setIsTemplateAccordionOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 transition-colors"
            >
              Changer le template
            </button>
          </div>
        )}

        {isTemplateAccordionOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => {
              const Icon = template.icon
              const isSelected = selectedTemplate === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden group ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-lg scale-105'
                      : 'border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  <div className={`w-full h-24 rounded-lg mb-3 ${template.preview} border-2 ${isSelected ? 'border-purple-500' : 'border-gray-200 dark:border-white/10'}`}></div>
                  <div className="relative">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${template.gradient} mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{template.description}</p>
                    {template.id.startsWith('ats-') && (
                      <span className="inline-flex mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30">
                        ATS
                      </span>
                    )}
                    {isSelected && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>Actif</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/90 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Informations</h3>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 mb-1">
                <span>Progression du CV</span>
                <span>{completionStats.completed}/{completionStats.total}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${completionStats.percentage}%` }}
                />
              </div>
            </div>
            
            {/* Navigation sections */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {sectionTabs.map((section) => {
                const SectionIcon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <SectionIcon className="w-3.5 h-3.5" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Informations personnelles */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <input type="text" name="prenom" placeholder="Prénom *" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <input type="text" name="nom" placeholder="Nom *" value={formData.nom} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <input type="text" name="titre" placeholder="Titre professionnel *" value={formData.titre} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <input type="tel" name="telephone" placeholder="Téléphone *" value={formData.telephone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <input type="text" name="adresse" placeholder="Adresse" value={formData.adresse} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <input type="url" name="linkedin" placeholder="LinkedIn" value={formData.linkedin} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <input type="url" name="portfolio" placeholder="Portfolio / Site web" value={formData.portfolio} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                  <textarea name="resume" placeholder="Profil / Résumé professionnel" value={formData.resume} onChange={handleChange} rows={4} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                </div>
              )}

              {/* Expériences */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  {formData.experiences.map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-800 dark:text-white">Experience {idx + 1}</h4>
                        {formData.experiences.length > 1 && (
                          <button onClick={() => removeItem('experiences', idx)} className="text-red-400 hover:text-red-300">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input type="text" placeholder="Poste *" value={exp.poste} onChange={(e) => handleArrayChange(idx, 'poste', e.target.value, 'experiences')} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm mb-2" />
                      <input type="text" placeholder="Entreprise *" value={exp.entreprise} onChange={(e) => handleArrayChange(idx, 'entreprise', e.target.value, 'experiences')} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm mb-2" />
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="text" placeholder="Début (ex: Jan 2020)" value={exp.debut} onChange={(e) => handleArrayChange(idx, 'debut', e.target.value, 'experiences')} className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm" />
                        <input type="text" placeholder="Fin (ex: Déc 2023)" value={exp.fin} onChange={(e) => handleArrayChange(idx, 'fin', e.target.value, 'experiences')} className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm" />
                      </div>
                      <textarea placeholder="Description des missions" value={exp.description} onChange={(e) => handleArrayChange(idx, 'description', e.target.value, 'experiences')} rows={3} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm resize-none" />
                    </div>
                  ))}
                  <button onClick={() => addItem('experiences', { entreprise: '', poste: '', debut: '', fin: '', description: '', ville: '' })} className="w-full px-4 py-2 rounded-xl border-2 border-dashed border-purple-500/30 text-purple-400 hover:border-purple-500/50 transition-colors flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Ajouter une expérience</span>
                  </button>
                </div>
              )}

              {/* Formations */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  {formData.formations.map((form, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-800 dark:text-white">Formation {idx + 1}</h4>
                        {formData.formations.length > 1 && (
                          <button onClick={() => removeItem('formations', idx)} className="text-red-400 hover:text-red-300">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input type="text" placeholder="Diplôme *" value={form.diplome} onChange={(e) => handleArrayChange(idx, 'diplome', e.target.value, 'formations')} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm mb-2" />
                      <input type="text" placeholder="École / Université *" value={form.ecole} onChange={(e) => handleArrayChange(idx, 'ecole', e.target.value, 'formations')} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm mb-2" />
                      <input type="text" placeholder="Année" value={form.annee} onChange={(e) => handleArrayChange(idx, 'annee', e.target.value, 'formations')} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm" />
                    </div>
                  ))}
                  <button onClick={() => addItem('formations', { ecole: '', diplome: '', annee: '', description: '', ville: '' })} className="w-full px-4 py-2 rounded-xl border-2 border-dashed border-purple-500/30 text-purple-400 hover:border-purple-500/50 transition-colors flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Ajouter une formation</span>
                  </button>
                </div>
              )}

              {/* Compétences */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <textarea name="competences" placeholder="Compétences techniques (ex: React, Node.js, Python...)" value={formData.competences} onChange={handleChange} rows={4} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                  <textarea name="langues" placeholder="Langues (ex: Français (natif), Anglais (courant)...)" value={formData.langues} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                  <textarea name="loisirs" placeholder="Centres d'intérêt / Loisirs" value={formData.loisirs} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                </div>
              )}

              {/* ATS */}
              {activeSection === 'ats' && (
                <div className="space-y-4">
                  <textarea
                    name="cibleAts"
                    placeholder="Collez l'offre d'emploi cible pour analyser les mots-clés ATS..."
                    value={formData.cibleAts}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Astuce: colle la mission + les compétences demandées. Le score ATS se met à jour automatiquement.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={saveCV} className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 transition-colors">
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </button>
            <button onClick={generatePDF} disabled={!formData.nom || !formData.prenom || isGeneratingPdf} className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Génération...' : isAtsTemplate ? 'Télécharger PDF ATS' : 'Télécharger PDF'}</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {isAtsTemplate
              ? 'Mode ATS actif: export en PDF texte lisible par les ATS.'
              : 'Pour les candidatures en ligne, privilégie un template ATS (badge vert).'}
          </p>

          <div className="mt-4 bg-white/80 dark:bg-black/40 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">Score ATS</h4>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                  atsAnalysis.scoreBand === 'excellent'
                    ? 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30'
                    : atsAnalysis.scoreBand === 'bon'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                      : atsAnalysis.scoreBand === 'moyen'
                        ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30'
                        : 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30'
                }`}
              >
                {atsAnalysis.scoreBand.toUpperCase()}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                <span>Compatibilité ATS</span>
                <span>{atsAnalysis.score}/100</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${atsAnalysis.score}%` }}
                />
              </div>
            </div>

            {atsAnalysis.keywordMatchRate !== null && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                Correspondance mots-clés: <strong>{atsAnalysis.keywordMatchRate}%</strong> ({atsAnalysis.matchedKeywords.length}/{atsAnalysis.targetKeywords.length})
              </p>
            )}

            {atsAnalysis.targetKeywords.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mots-clés détectés</p>
                <div className="flex flex-wrap gap-1">
                  {atsAnalysis.matchedKeywords.slice(0, 8).map((kw) => (
                    <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30">
                      {kw}
                    </span>
                  ))}
                  {atsAnalysis.matchedKeywords.length === 0 && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Aucun mot-clé détecté pour l’instant.</span>
                  )}
                </div>
              </div>
            )}

            {atsAnalysis.missingKeywords.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mots-clés manquants</p>
                <div className="flex flex-wrap gap-1">
                  {atsAnalysis.missingKeywords.slice(0, 10).map((kw) => (
                    <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Score par section</p>
              <div className="space-y-2">
                {[
                  ['Titre', atsAnalysis.sectionScores.titre],
                  ['Résumé', atsAnalysis.sectionScores.resume],
                  ['Expériences', atsAnalysis.sectionScores.experiences],
                  ['Compétences', atsAnalysis.sectionScores.competences]
                ].map(([label, value]) => (
                  <div key={label} className="text-xs">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-1">
                      <span>{label}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Actions prioritaires</p>
              <ul className="space-y-1">
                {atsAnalysis.recommendations.slice(0, 3).map((item, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={insertMissingKeywordsInSkills}
                className="text-xs px-3 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 transition-colors"
              >
                Ajouter les mots-clés manquants (1 clic)
              </button>
              <button
                type="button"
                onClick={addAtsSentenceToResume}
                className="text-xs px-3 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition-colors"
              >
                Ajouter une phrase ATS au résumé
              </button>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span>Aperçu du CV</span>
              </h3>
              <button onClick={() => setShowPreview(!showPreview)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                {showPreview ? <Eye className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {showPreview && (
              <div className="overflow-auto max-h-[800px] border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-center">
                  <div ref={previewRef} className="shadow-2xl">
                    {renderCVPreview()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rendu hors écran pour garantir un export PDF identique à l'aperçu */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-100000px',
          top: '0',
          pointerEvents: 'none',
          opacity: 0
        }}
      >
        <div ref={pdfExportRef}>
          {renderCVPreview()}
        </div>
      </div>

      {/* Services externes */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Créez votre CV sur des plateformes professionnelles</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accédez à des templates premium et des outils avancés pour créer le CV parfait
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvServices.map((service, idx) => {
            const Icon = service.icon
            return (
              <a
                key={idx}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-5 rounded-xl border-2 border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300"
              >
                {service.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Populaire</span>
                  </div>
                )}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1 group-hover:text-purple-400 dark:group-hover:text-purple-300 transition-colors">
                  {service.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {service.description}
                </p>
                <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  <span>Visiter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CVGenerator
