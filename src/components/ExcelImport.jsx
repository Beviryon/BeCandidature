import { useState, useRef } from 'react'
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, Download, X, Eye, EyeOff, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useCandidatures } from '../hooks/useCandidatures'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'

// Mapping des colonnes possibles
const COLUMN_MAPPINGS = {
  entreprise: ['entreprise', 'company', 'société', 'employeur', 'employer', 'nom entreprise'],
  poste: ['poste', 'job', 'position', 'titre', 'title', 'intitulé', 'fonction'],
  date_candidature: ['date', 'date candidature', 'date_candidature', 'date de candidature', 'candidature date', 'applied date', 'date application'],
  statut: ['statut', 'status', 'état', 'state', 'situation'],
  type_contrat: ['type contrat', 'type_contrat', 'contrat', 'contract', 'type', 'cdi', 'cdd', 'stage', 'alternance', 'intérim'],
  email: ['email', 'e-mail', 'mail', 'courriel', 'email recruteur', 'recruiter email'],
  contact: ['contact', 'recruteur', 'recruiter', 'nom', 'téléphone', 'phone', 'tel', 'téléphone contact'],
  lien: ['lien', 'link', 'url', 'lien offre', 'job link', 'offre', 'lien offre emploi'],
  notes: ['notes', 'note', 'commentaire', 'comment', 'remarque', 'description']
}

function ExcelImport() {
  const navigate = useNavigate()
  const { addCandidature } = useCandidatures()
  const { success, error: showError, info } = useToast()
  const fileInputRef = useRef(null)
  
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [previewData, setPreviewData] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [googleSheetUrl, setGoogleSheetUrl] = useState('')
  const [importMode, setImportMode] = useState('file') // 'file' or 'google'

  // Trouver le mapping automatique des colonnes
  const findColumnMapping = (headers) => {
    const mapping = {}
    headers.forEach((header, index) => {
      if (!header) return
      const headerLower = header.toLowerCase().trim()
      
      // Chercher dans les mappings
      for (const [field, possibleNames] of Object.entries(COLUMN_MAPPINGS)) {
        if (possibleNames.some(name => headerLower.includes(name))) {
          mapping[field] = index
          break
        }
      }
    })
    return mapping
  }

  // Parser le fichier Excel
  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return

    setLoading(true)
    setFile(uploadedFile)
    
    try {
      const data = await uploadedFile.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })

      if (jsonData.length === 0) {
        showError('Le fichier Excel est vide')
        setLoading(false)
        return
      }

      // Première ligne = headers
      const headers = jsonData[0]
      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''))

      if (rows.length === 0) {
        showError('Aucune donnée trouvée dans le fichier')
        setLoading(false)
        return
      }

      // Mapping automatique
      const autoMapping = findColumnMapping(headers)
      setColumnMapping(autoMapping)

      // Préparer les données avec le mapping
      const mappedData = rows.map((row, rowIndex) => {
        // Récupérer les valeurs brutes
        const rawDate = autoMapping.date_candidature !== undefined ? row[autoMapping.date_candidature] : null
        const rawStatus = autoMapping.statut !== undefined ? row[autoMapping.statut] : null
        
        // Parser la date
        let date_candidature = null
        let dateError = false
        if (rawDate !== null && rawDate !== undefined && rawDate !== '') {
          const parsedDate = parseDate(rawDate)
          if (parsedDate) {
            date_candidature = parsedDate.toISOString().split('T')[0]
          } else {
            date_candidature = new Date().toISOString().split('T')[0]
            dateError = true
          }
        } else {
          date_candidature = new Date().toISOString().split('T')[0]
          dateError = true
        }
        
        // Normaliser le statut
        let statut = 'En attente'
        let statusError = false
        if (rawStatus !== null && rawStatus !== undefined && rawStatus !== '') {
          const normalizedStatus = normalizeStatus(rawStatus)
          if (normalizedStatus) {
            statut = normalizedStatus
          } else {
            statusError = true
          }
        } else {
          statusError = true
        }
        
        const candidature = {
          _rowIndex: rowIndex + 2, // +2 car on commence à la ligne 2 (après header)
          entreprise: (autoMapping.entreprise !== undefined ? row[autoMapping.entreprise] : '') || '',
          poste: (autoMapping.poste !== undefined ? row[autoMapping.poste] : '') || '',
          date_candidature: date_candidature,
          statut: statut,
          type_contrat: (autoMapping.type_contrat !== undefined ? row[autoMapping.type_contrat] : '') || '',
          email: (autoMapping.email !== undefined ? row[autoMapping.email] : '') || '',
          contact: (autoMapping.contact !== undefined ? row[autoMapping.contact] : '') || '',
          lien: (autoMapping.lien !== undefined ? row[autoMapping.lien] : '') || '',
          notes: (autoMapping.notes !== undefined ? row[autoMapping.notes] : '') || '',
          _dateError: dateError,
          _statusError: statusError
        }

        return candidature
      })

      setParsedData(mappedData)
      setPreviewData(mappedData.slice(0, 5)) // Afficher les 5 premières lignes
      setShowPreview(true)
      success(`${mappedData.length} candidature(s) détectée(s) dans le fichier`)
    } catch (err) {
      console.error('Erreur parsing Excel:', err)
      showError('Erreur lors de la lecture du fichier Excel. Vérifiez le format du fichier.')
    } finally {
      setLoading(false)
    }
  }

  // Normaliser le statut
  const normalizeStatus = (status) => {
    if (!status || typeof status !== 'string') return null
    
    const statusLower = status.trim().toLowerCase()
    
    // Mapping des variations possibles
    const statusMap = {
      'en attente': 'En attente',
      'en_attente': 'En attente',
      'pending': 'En attente',
      'waiting': 'En attente',
      'entretien': 'Entretien',
      'interview': 'Entretien',
      'meeting': 'Entretien',
      'refus': 'Refus',
      'refused': 'Refus',
      'rejected': 'Refus',
      'rejeté': 'Refus',
      'rejetee': 'Refus'
    }
    
    // Vérifier d'abord dans le mapping
    if (statusMap[statusLower]) {
      return statusMap[statusLower]
    }
    
    // Vérifier si c'est déjà un statut valide (avec casse correcte)
    const validStatuses = ['En attente', 'Entretien', 'Refus']
    if (validStatuses.includes(status.trim())) {
      return status.trim()
    }
    
    return null
  }

  // Parser une date depuis Excel (peut être un nombre Excel ou une string)
  const parseDate = (value) => {
    if (value === null || value === undefined || value === '') return null
    
    // Si c'est un nombre Excel (date serial)
    if (typeof value === 'number') {
      // Excel date serial starts from 1900-01-01
      const excelEpoch = new Date(1899, 11, 30)
      const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000)
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        return date
      }
      return null
    }
    
    // Si c'est une string, essayer plusieurs formats
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (!trimmed) return null
      
      // Format ISO (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const date = new Date(trimmed)
        if (!isNaN(date.getTime())) return date
      }
      
      // Format français (DD/MM/YYYY ou DD-MM-YYYY)
      if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(trimmed)) {
        const parts = trimmed.split(/[\/\-]/)
        const date = new Date(parts[2], parts[1] - 1, parts[0])
        if (!isNaN(date.getTime())) return date
      }
      
      // Format avec Date() natif
      const date = new Date(trimmed)
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        return date
      }
    }
    
    return null
  }

  // Importer depuis Google Sheets (via export CSV)
  const handleGoogleSheetImport = async () => {
    if (!googleSheetUrl) {
      showError('Veuillez entrer une URL Google Sheets')
      return
    }

    try {
      // Convertir l'URL Google Sheets en URL d'export CSV
      const sheetId = extractGoogleSheetId(googleSheetUrl)
      if (!sheetId) {
        showError('URL Google Sheets invalide')
        return
      }

      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`
      
      setLoading(true)
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error('Impossible d\'accéder au Google Sheet. Assurez-vous que le document est public ou partagé.')
      }

      const csvText = await response.text()
      const workbook = XLSX.read(csvText, { type: 'string' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })

      if (jsonData.length === 0) {
        showError('Le Google Sheet est vide')
        setLoading(false)
        return
      }

      const headers = jsonData[0]
      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''))

      const autoMapping = findColumnMapping(headers)
      setColumnMapping(autoMapping)

      const mappedData = rows.map((row, rowIndex) => {
        // Récupérer les valeurs brutes
        const rawDate = autoMapping.date_candidature !== undefined ? row[autoMapping.date_candidature] : null
        const rawStatus = autoMapping.statut !== undefined ? row[autoMapping.statut] : null
        
        // Parser la date
        let date_candidature = null
        let dateError = false
        if (rawDate !== null && rawDate !== undefined && rawDate !== '') {
          const parsedDate = parseDate(rawDate)
          if (parsedDate) {
            date_candidature = parsedDate.toISOString().split('T')[0]
          } else {
            date_candidature = new Date().toISOString().split('T')[0]
            dateError = true
          }
        } else {
          date_candidature = new Date().toISOString().split('T')[0]
          dateError = true
        }
        
        // Normaliser le statut
        let statut = 'En attente'
        let statusError = false
        if (rawStatus !== null && rawStatus !== undefined && rawStatus !== '') {
          const normalizedStatus = normalizeStatus(rawStatus)
          if (normalizedStatus) {
            statut = normalizedStatus
          } else {
            statusError = true
          }
        } else {
          statusError = true
        }
        
        const candidature = {
          _rowIndex: rowIndex + 2,
          entreprise: (autoMapping.entreprise !== undefined ? row[autoMapping.entreprise] : '') || '',
          poste: (autoMapping.poste !== undefined ? row[autoMapping.poste] : '') || '',
          date_candidature: date_candidature,
          statut: statut,
          type_contrat: (autoMapping.type_contrat !== undefined ? row[autoMapping.type_contrat] : '') || '',
          email: (autoMapping.email !== undefined ? row[autoMapping.email] : '') || '',
          contact: (autoMapping.contact !== undefined ? row[autoMapping.contact] : '') || '',
          lien: (autoMapping.lien !== undefined ? row[autoMapping.lien] : '') || '',
          notes: (autoMapping.notes !== undefined ? row[autoMapping.notes] : '') || '',
          _dateError: dateError,
          _statusError: statusError
        }

        return candidature
      })

      setParsedData(mappedData)
      setPreviewData(mappedData.slice(0, 5))
      setShowPreview(true)
      success(`${mappedData.length} candidature(s) détectée(s) dans le Google Sheet`)
    } catch (err) {
      console.error('Erreur import Google Sheets:', err)
      showError(err.message || 'Erreur lors de l\'import depuis Google Sheets')
    } finally {
      setLoading(false)
    }
  }

  // Extraire l'ID du Google Sheet depuis l'URL
  const extractGoogleSheetId = (url) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const dIndex = pathParts.indexOf('d')
      if (dIndex !== -1 && pathParts[dIndex + 1]) {
        return pathParts[dIndex + 1]
      }
      return null
    } catch {
      return null
    }
  }

  // Importer les candidatures
  const handleImport = async () => {
    if (parsedData.length === 0) {
      showError('Aucune donnée à importer')
      return
    }

    setImporting(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const candidature of parsedData) {
        try {
          // Calculer la date de relance si nécessaire
          let dateRelance = ''
          if (candidature.statut === 'En attente' || candidature.statut === 'Entretien') {
            const relanceDate = new Date(candidature.date_candidature)
            relanceDate.setDate(relanceDate.getDate() + 7)
            dateRelance = relanceDate.toISOString().split('T')[0]
          }

          await addCandidature({
            entreprise: candidature.entreprise.trim(),
            poste: candidature.poste.trim(),
            date_candidature: candidature.date_candidature,
            statut: candidature.statut,
            type_contrat: candidature.type_contrat.trim(),
            email: candidature.email.trim(),
            contact: candidature.contact.trim(),
            lien: candidature.lien.trim(),
            notes: candidature.notes.trim(),
            date_relance: dateRelance
          })
          successCount++
        } catch (err) {
          console.error(`Erreur import ligne ${candidature._rowIndex}:`, err)
          errorCount++
        }
      }

      if (successCount > 0) {
        success(`${successCount} candidature(s) importée(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`)
        setTimeout(() => {
          navigate('/candidatures')
        }, 1500)
      } else {
        showError('Aucune candidature n\'a pu être importée')
      }
    } catch (err) {
      showError('Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  // Télécharger un template Excel
  const downloadTemplate = () => {
    const templateData = [
      ['Entreprise', 'Poste', 'Date candidature', 'Statut', 'Type contrat', 'Email', 'Contact', 'Lien', 'Notes'],
      ['Google', 'Développeur Full Stack', '2024-01-15', 'En attente', 'CDI', 'recruteur@google.com', 'Jean Dupont', 'https://careers.google.com/jobs/123', 'Candidature spontanée'],
      ['Microsoft', 'Data Scientist', '2024-01-20', 'Entretien', 'CDI', 'hr@microsoft.com', 'Marie Martin', 'https://careers.microsoft.com/jobs/456', 'Entretien prévu le 25/01'],
      ['Apple', 'Product Manager', '15/01/2024', 'Refus', 'CDD', 'jobs@apple.com', 'Sophie Laurent', 'https://jobs.apple.com/123', 'Refus après entretien'],
      ['', '', '', '', '', '', '', '', ''],
      ['FORMATS ACCEPTÉS:', '', '', '', '', '', '', '', ''],
      ['Date:', 'YYYY-MM-DD ou DD/MM/YYYY', '', '', '', '', '', '', ''],
      ['Statut:', 'En attente, Entretien, Refus', '(insensible à la casse)', '', '', '', '', '', '']
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Candidatures')
    XLSX.writeFile(wb, 'template_candidatures.xlsx')
    info('Template téléchargé !')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold gradient-text mb-2">
          📊 Import Excel / Google Sheets
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Importez vos candidatures depuis un fichier Excel ou Google Sheets
        </p>
      </div>

      {/* Mode selection */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setImportMode('file')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              importMode === 'file'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 inline mr-2" />
            Fichier Excel
          </button>
          <button
            onClick={() => setImportMode('google')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              importMode === 'google'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 inline mr-2" />
            Google Sheets
          </button>
        </div>

        {/* Import depuis fichier */}
        {importMode === 'file' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <FileSpreadsheet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">
                Glissez-déposez votre fichier Excel ici ou
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 inline mr-2" />
                    Choisir un fichier
                  </>
                )}
              </button>
              {file && (
                <p className="text-sm text-gray-400 mt-2">
                  Fichier sélectionné : {file.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Import depuis Google Sheets */}
        {importMode === 'google' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <strong>Important :</strong> Le Google Sheet doit être public ou partagé avec "Toute personne disposant du lien". 
                  Copiez l'URL complète du Google Sheet.
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">URL du Google Sheet</label>
              <input
                type="url"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
              <button
                onClick={handleGoogleSheetImport}
                disabled={loading || !googleSheetUrl}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 inline mr-2" />
                    Importer depuis Google Sheets
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Template download */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger un template Excel</span>
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && parsedData.length > 0 && (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Aperçu des données ({parsedData.length} candidature(s))
              </h3>
              <p className="text-sm text-gray-400">
                Vérifiez les données avant l'import
              </p>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            >
              {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {showPreview && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-gray-300">Entreprise</th>
                    <th className="text-left p-3 text-gray-300">Poste</th>
                    <th className="text-left p-3 text-gray-300">Date</th>
                    <th className="text-left p-3 text-gray-300">Statut</th>
                    <th className="text-left p-3 text-gray-300">Type contrat</th>
                    <th className="text-left p-3 text-gray-300">Email</th>
                    <th className="text-left p-3 text-gray-300">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-gray-300">{row.entreprise || '-'}</td>
                      <td className="p-3 text-gray-300">{row.poste || '-'}</td>
                      <td className="p-3 text-gray-300">
                        {row.date_candidature}
                        {row._dateError && (
                          <span className="ml-2 text-xs text-orange-400" title="Date invalide, date du jour utilisée">
                            ⚠️
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-300">
                        {row.statut}
                        {row._statusError && (
                          <span className="ml-2 text-xs text-orange-400" title="Statut invalide, 'En attente' utilisé">
                            ⚠️
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-300">{row.type_contrat || '-'}</td>
                      <td className="p-3 text-gray-300">{row.email || '-'}</td>
                      <td className="p-3 text-gray-300">{row.contact || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  ... et {parsedData.length - 5} autre(s) candidature(s)
                </p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Import en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Importer {parsedData.length} candidature(s)</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setFile(null)
                setParsedData([])
                setPreviewData([])
                setShowPreview(false)
                setGoogleSheetUrl('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-colors"
            >
              <X className="w-5 h-5 inline mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExcelImport

