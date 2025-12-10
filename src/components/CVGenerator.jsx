import { useState, useEffect, useRef } from 'react'
import { 
  Download, Eye, Save, FileText, Zap, Sparkles, QrCode, TrendingUp, 
  ExternalLink, Palette, Layout, Briefcase, GraduationCap, Award,
  Mail, Phone, MapPin, Linkedin, Globe, Plus, X, CheckCircle,
  Star, ArrowRight, Image as ImageIcon
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useToast } from '../contexts/ToastContext'

function CVGenerator() {
  const { success, error: showError } = useToast()
  const previewRef = useRef(null)
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
    certifications: [{ nom: '', organisme: '', date: '' }]
  })

  const [selectedTemplate, setSelectedTemplate] = useState('moderne')
  const [showPreview, setShowPreview] = useState(true)
  const [downloadCount, setDownloadCount] = useState(0)
  const [activeSection, setActiveSection] = useState('personal')

  useEffect(() => {
    const savedCV = localStorage.getItem('cv_data')
    if (savedCV) {
      setFormData(JSON.parse(savedCV))
    }
    const count = localStorage.getItem('cv_download_count')
    if (count) {
      setDownloadCount(parseInt(count))
    }
  }, [])

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

  const generatePDF = async () => {
    try {
      // Utiliser html2canvas si disponible, sinon fallback sur jsPDF basique
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let y = 15

      // Template Moderne
      if (selectedTemplate === 'moderne') {
        // Header avec couleur
        doc.setFillColor(139, 92, 246) // Purple
        doc.rect(0, 0, pageWidth, 40, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(28)
        doc.setFont('helvetica', 'bold')
        doc.text(`${formData.prenom} ${formData.nom}`, 20, 25)
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'normal')
        doc.text(formData.titre || '', 20, 32)
        
        y = 50
        
        // Contact info
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        const contactInfo = []
        if (formData.email) contactInfo.push(`📧 ${formData.email}`)
        if (formData.telephone) contactInfo.push(`📱 ${formData.telephone}`)
        if (formData.adresse) contactInfo.push(`📍 ${formData.adresse}`)
        if (formData.linkedin) contactInfo.push(`💼 ${formData.linkedin}`)
        
        contactInfo.forEach((info, i) => {
          doc.text(info, 20 + (i * 45), y)
        })
        
        y += 15
        
        // Profil
        if (formData.resume) {
          doc.setFillColor(139, 92, 246)
          doc.rect(20, y, pageWidth - 40, 8, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('PROFIL', 22, y + 6)
          
          y += 12
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          const resumeLines = doc.splitTextToSize(formData.resume, pageWidth - 40)
          doc.text(resumeLines, 20, y)
          y += resumeLines.length * 5 + 5
        }
        
        // Expériences
        if (formData.experiences.some(exp => exp.entreprise)) {
          if (y > pageHeight - 40) {
            doc.addPage()
            y = 20
          }
          
          doc.setFillColor(139, 92, 246)
          doc.rect(20, y, pageWidth - 40, 8, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('EXPÉRIENCES PROFESSIONNELLES', 22, y + 6)
          y += 12
          
          formData.experiences.forEach(exp => {
            if (exp.entreprise) {
              if (y > pageHeight - 30) {
                doc.addPage()
                y = 20
              }
              
              doc.setTextColor(0, 0, 0)
              doc.setFontSize(11)
              doc.setFont('helvetica', 'bold')
              doc.text(`${exp.poste}`, 20, y)
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(10)
              doc.text(`${exp.entreprise}`, 20, y + 6)
              doc.setFontSize(9)
              doc.setTextColor(100, 100, 100)
              doc.text(`${exp.debut} - ${exp.fin}`, 20, y + 11)
              
              if (exp.description) {
                y += 16
                doc.setFontSize(9)
                doc.setTextColor(0, 0, 0)
                const descLines = doc.splitTextToSize(exp.description, pageWidth - 40)
                doc.text(descLines, 20, y)
                y += descLines.length * 4
              }
              y += 8
            }
          })
        }
        
        // Formations
        if (formData.formations.some(form => form.ecole)) {
          if (y > pageHeight - 40) {
            doc.addPage()
            y = 20
          }
          
          doc.setFillColor(139, 92, 246)
          doc.rect(20, y, pageWidth - 40, 8, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('FORMATION', 22, y + 6)
          y += 12
          
          formData.formations.forEach(form => {
            if (form.ecole) {
              if (y > pageHeight - 30) {
                doc.addPage()
                y = 20
              }
              
              doc.setTextColor(0, 0, 0)
              doc.setFontSize(11)
              doc.setFont('helvetica', 'bold')
              doc.text(`${form.diplome}`, 20, y)
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(10)
              doc.text(`${form.ecole}`, 20, y + 6)
              doc.setFontSize(9)
              doc.setTextColor(100, 100, 100)
              doc.text(`${form.annee}`, 20, y + 11)
              y += 18
            }
          })
        }
        
        // Compétences
        if (formData.competences) {
          if (y > pageHeight - 40) {
            doc.addPage()
            y = 20
          }
          
          doc.setFillColor(139, 92, 246)
          doc.rect(20, y, pageWidth - 40, 8, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('COMPÉTENCES', 22, y + 6)
          y += 12
          
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          const compLines = doc.splitTextToSize(formData.competences, pageWidth - 40)
          doc.text(compLines, 20, y)
        }
      }

      doc.save(`CV_${formData.prenom}_${formData.nom || 'Candidat'}.pdf`)
      
      const newCount = downloadCount + 1
      setDownloadCount(newCount)
      localStorage.setItem('cv_download_count', newCount.toString())
      success('CV téléchargé avec succès !')
    } catch (err) {
      console.error('Erreur génération PDF:', err)
      showError('Erreur lors de la génération du PDF')
    }
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

  const renderCVPreview = () => {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            📄 Générateur de CV Professionnel
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un CV professionnel en quelques minutes avec nos templates modernes
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/30">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {downloadCount} téléchargement{downloadCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Templates avec aperçu */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <Layout className="w-5 h-5 text-purple-400" />
          <span>Choisissez un template</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map(template => {
            const Icon = template.icon
            const isSelected = selectedTemplate === template.id
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Informations</h3>
            </div>
            
            {/* Navigation sections */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['personal', 'experience', 'education', 'skills'].map(section => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeSection === section
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {section === 'personal' && 'Personnel'}
                  {section === 'experience' && 'Expériences'}
                  {section === 'education' && 'Formation'}
                  {section === 'skills' && 'Compétences'}
                </button>
              ))}
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
                        <h4 className="font-semibold text-white">Expérience {idx + 1}</h4>
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
                        <h4 className="font-semibold text-white">Formation {idx + 1}</h4>
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={saveCV} className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 transition-colors">
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </button>
            <button onClick={generatePDF} disabled={!formData.nom || !formData.prenom} className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-4 h-4" />
              <span>Télécharger PDF</span>
            </button>
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
