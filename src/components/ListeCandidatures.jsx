import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Building2, Briefcase, Calendar, Clock, User, ExternalLink, 
  Edit, Trash2, Plus, TrendingUp, AlertCircle, CheckCircle, XCircle,
  Search, Filter, FileDown, FileSpreadsheet, Upload, Mail, FileCheck,
  CheckSquare, Square, Layers
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useCandidatures } from '../hooks/useCandidatures'
import ConfirmDialog from './ConfirmDialog'
import { CandidatureSkeleton } from './Loading'

function ListeCandidatures() {
  const navigate = useNavigate()
  const { candidatures, loading, error, deleteCandidature } = useCandidatures()
  const [filterStatut, setFilterStatut] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null })
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ isOpen: false, count: 0 })

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteCandidature(deleteConfirm.id)
        setDeleteConfirm({ isOpen: false, id: null })
      } catch (error) {
        // L'erreur est déjà gérée par le hook
        setDeleteConfirm({ isOpen: false, id: null })
      }
    }
  }

  // Gestion de la sélection multiple
  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCandidatures.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredCandidatures.map(c => c.id)))
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedIds.size > 0) {
      setBulkDeleteConfirm({ isOpen: true, count: selectedIds.size })
    }
  }

  const handleBulkDeleteConfirm = async () => {
    try {
      const idsToDelete = Array.from(selectedIds)
      // Supprimer les candidatures une par une
      for (const id of idsToDelete) {
        await deleteCandidature(id)
      }
      setSelectedIds(new Set())
      setIsSelectionMode(false)
      setBulkDeleteConfirm({ isOpen: false, count: 0 })
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      setBulkDeleteConfirm({ isOpen: false, count: 0 })
    }
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }

  const getStatusConfig = (statut) => {
    switch (statut) {
      case 'Entretien':
        return {
          bg: 'from-green-500/10 to-emerald-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          icon: CheckCircle,
          glow: 'neon-glow-green'
        }
      case 'En attente':
        return {
          bg: 'from-orange-500/10 to-amber-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          icon: Clock,
          glow: 'neon-glow-orange'
        }
      case 'Refus':
        return {
          bg: 'from-red-500/10 to-rose-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: XCircle,
          glow: 'neon-glow-red'
        }
      default:
        return {
          bg: 'from-gray-500/10 to-slate-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          icon: AlertCircle,
          glow: ''
        }
    }
  }

  const shouldRelancer = (dateCandidature) => {
    const dateCandidat = new Date(dateCandidature)
    const dateActuelle = new Date()
    const diffJours = Math.floor((dateActuelle - dateCandidat) / (1000 * 60 * 60 * 24))
    return diffJours >= 7
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(139, 92, 246) // Purple
    doc.text('BeCandidature - Historique', 14, 20)
    
    // Subtitle with date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28)
    
    // Filter info
    let filterInfo = 'Filtre: '
    if (filterStatut !== 'Tous') filterInfo += `Statut: ${filterStatut} | `
    if (searchQuery) filterInfo += `Recherche: "${searchQuery}" | `
    filterInfo += `${filteredCandidatures.length} candidature(s)`
    
    doc.setFontSize(9)
    doc.text(filterInfo, 14, 35)
    
    // Prepare table data
    const tableData = filteredCandidatures.map(c => [
      c.entreprise,
      c.poste,
      new Date(c.date_candidature).toLocaleDateString('fr-FR'),
      c.statut,
      c.date_relance ? new Date(c.date_relance).toLocaleDateString('fr-FR') : '-',
      c.contact || '-'
    ])
    
    // Add table
    autoTable(doc, {
      startY: 40,
      head: [['Entreprise', 'Poste', 'Date', 'Statut', 'Relance', 'Contact']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [139, 92, 246], // Purple
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      },
      margin: { top: 40 },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    })
    
    // Add statistics at the bottom
    const finalY = (doc.lastAutoTable?.finalY || 40) + 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text('Statistiques:', 14, finalY)
    doc.setFontSize(9)
    doc.text(`Total: ${stats.total} | Entretiens: ${stats.entretien} | En attente: ${stats.attente} | Refus: ${stats.refus}`, 14, finalY + 6)
    
    // Save PDF
    doc.save(`candidatures_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Filtrage des candidatures (memoized pour performance) - DOIT être avant les returns conditionnels
  const filteredCandidatures = useMemo(() => {
    return candidatures.filter(candidature => {
      // Filtre par statut
      const matchStatut = filterStatut === 'Tous' || candidature.statut === filterStatut
      
      // Filtre par recherche (entreprise ou poste)
      const matchSearch = searchQuery === '' || 
        candidature.entreprise.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidature.poste.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchStatut && matchSearch
    })
  }, [candidatures, filterStatut, searchQuery])

  // Statistiques (memoized pour performance) - DOIT être avant les returns conditionnels
  const stats = useMemo(() => ({
    total: candidatures.length,
    entretien: candidatures.filter(c => c.statut === 'Entretien').length,
    attente: candidatures.filter(c => c.statut === 'En attente').length,
    refus: candidatures.filter(c => c.statut === 'Refus').length
  }), [candidatures])

  // Export to Excel
  const exportToExcel = () => {
    // Prepare data
    const excelData = filteredCandidatures.map(c => ({
      'Entreprise': c.entreprise,
      'Poste': c.poste,
      'Date de candidature': new Date(c.date_candidature).toLocaleDateString('fr-FR'),
      'Statut': c.statut,
      'Date de relance': c.date_relance ? new Date(c.date_relance).toLocaleDateString('fr-FR') : '-',
      'Contact': c.contact || '-',
      'Lien': c.lien || '-',
      'Notes': c.notes || '-'
    }))
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Entreprise
      { wch: 25 }, // Poste
      { wch: 15 }, // Date
      { wch: 12 }, // Statut
      { wch: 15 }, // Relance
      { wch: 30 }, // Contact
      { wch: 40 }, // Lien
      { wch: 50 }  // Notes
    ]
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Candidatures')
    
    // Add statistics sheet
    const statsData = [
      { 'Statistique': 'Total', 'Nombre': stats.total },
      { 'Statistique': 'Entretiens', 'Nombre': stats.entretien },
      { 'Statistique': 'En attente', 'Nombre': stats.attente },
      { 'Statistique': 'Refus', 'Nombre': stats.refus },
      { 'Statistique': 'Généré le', 'Nombre': new Date().toLocaleString('fr-FR') }
    ]
    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques')
    
    // Save file
    XLSX.writeFile(wb, `candidatures_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-slide-up">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            Mes Candidatures
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Gérez et suivez toutes vos candidatures</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <CandidatureSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-red-500/30 animate-fade-in">
        <div className="flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <span>Erreur : {error}</span>
        </div>
      </div>
    )
  }

  const filtresStatut = ['Tous', 'En attente', 'Entretien', 'Refus']

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            Mes Candidatures
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Gérez et suivez toutes vos candidatures</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isSelectionMode ? (
            <>
              <button
                onClick={exitSelectionMode}
                className="group flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <XCircle className="w-5 h-5" />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleBulkDeleteClick}
                disabled={selectedIds.size === 0}
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Trash2 className="w-5 h-5" />
                <span>Supprimer ({selectedIds.size})</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/import-excel"
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/50"
              >
                <Upload className="w-5 h-5" />
                <span>Importer Excel</span>
              </Link>
              <Link
                to="/ajouter"
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50"
              >
                <Plus className="w-5 h-5" />
                <span>Nouvelle Candidature</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Barre de sélection */}
      {isSelectionMode && filteredCandidatures.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSelectAll}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
              >
                {selectedIds.size === filteredCandidatures.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {selectedIds.size === filteredCandidatures.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </span>
              </button>
              <div className="text-white font-medium">
                {selectedIds.size} candidature{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-blue-200">
              <Layers className="w-5 h-5" />
              <span className="text-sm">Mode sélection actif</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-white">{stats.total}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entretiens</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.entretien}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En attente</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.attente}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Refus</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.refus}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      {candidatures.length > 0 && (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-purple-500/20 space-y-4">
          <div className="flex items-center space-x-2 text-gray-300 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Filtres</h3>
          </div>

          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par entreprise ou poste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-2">
            {filtresStatut.map((statut) => {
              const isActive = filterStatut === statut
              const count = statut === 'Tous' 
                ? stats.total 
                : candidatures.filter(c => c.statut === statut).length

              return (
                <button
                  key={statut}
                  onClick={() => setFilterStatut(statut)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{statut}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Results count */}
          {(searchQuery || filterStatut !== 'Tous') && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-sm text-gray-400">
                {filteredCandidatures.length} résultat(s) sur {candidatures.length} candidature(s)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Export buttons */}
      {candidatures.length > 0 && (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-purple-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-300 mb-1">Exporter vos données</h3>
              <p className="text-sm text-gray-400">
                Téléchargez votre historique de candidatures
                {(searchQuery || filterStatut !== 'Tous') && ' (filtres appliqués)'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToPDF}
                className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
              >
                <FileDown className="w-5 h-5 group-hover:animate-bounce" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={exportToExcel}
                className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
              >
                <FileSpreadsheet className="w-5 h-5 group-hover:animate-bounce" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton Sélectionner - Avant les cartes */}
      {!isSelectionMode && candidatures.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsSelectionMode(true)}
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-lg transform transition-all duration-300 hover:scale-105 shadow-md hover:shadow-blue-500/50"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Sélectionner</span>
          </button>
        </div>
      )}

      {/* Candidatures list */}
      {candidatures.length === 0 ? (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-12 text-center border border-purple-500/20 animate-fade-in">
          <Briefcase className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-300 mb-2">
            Aucune candidature
          </h3>
          <p className="text-gray-400 mb-6">
            Commencez à suivre vos candidatures d'alternance
          </p>
          <Link
            to="/ajouter"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter votre première candidature</span>
          </Link>
        </div>
      ) : filteredCandidatures.length === 0 ? (
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-12 text-center border border-purple-500/20 animate-fade-in">
          <Search className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-300 mb-2">
            Aucun résultat
          </h3>
          <p className="text-gray-400 mb-6">
            Aucune candidature ne correspond à vos critères de recherche
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterStatut('Tous')
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105"
          >
            <XCircle className="w-5 h-5" />
            <span>Réinitialiser les filtres</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCandidatures.map((candidature, index) => {
            const statusConfig = getStatusConfig(candidature.statut)
            const StatusIcon = statusConfig.icon
            const needsRelance = shouldRelancer(candidature.date_candidature) && candidature.statut === 'En attente'

            const isSelected = selectedIds.has(candidature.id)

            return (
              <div
                key={candidature.id}
                className={`bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl animate-fade-in ${
                  isSelectionMode 
                    ? `cursor-default ${isSelected ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/30'}` 
                    : 'cursor-pointer border-white/10 hover:border-purple-500/30'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(candidature.id)
                  } else {
                    navigate(`/candidatures/${candidature.id}`)
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {isSelectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelection(candidature.id)
                          }}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-400 hover:border-blue-400'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                        </button>
                      )}
                      <Building2 className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">{candidature.entreprise}</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{candidature.poste}</span>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${statusConfig.bg} border ${statusConfig.border} ${statusConfig.glow}`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                    <span className={`text-sm font-medium ${statusConfig.text}`}>
                      {candidature.statut}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Candidature : {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  {candidature.date_relance && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Clock className={`w-4 h-4 ${needsRelance ? 'text-red-400' : 'text-purple-400'}`} />
                      <span className={needsRelance ? 'text-red-400 font-semibold' : 'text-gray-400'}>
                        Relance : {new Date(candidature.date_relance).toLocaleDateString('fr-FR')}
                        {needsRelance && ' - À relancer !'}
                      </span>
                    </div>
                  )}

                  {candidature.type_contrat && (
                    <div className="flex items-center space-x-3 text-sm">
                      <FileCheck className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">{candidature.type_contrat}</span>
                    </div>
                  )}

                  {candidature.email && (
                    <a
                      href={`mailto:${candidature.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{candidature.email}</span>
                    </a>
                  )}

                  {candidature.contact && (
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="truncate">{candidature.contact}</span>
                    </div>
                  )}

                  {candidature.lien && (
                    <a
                      href={candidature.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Voir l'offre</span>
                    </a>
                  )}
                </div>

                {/* Notes */}
                {candidature.notes && (
                  <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-300 line-clamp-2">{candidature.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {!isSelectionMode && (
                  <div 
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 border-t border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={`/candidatures/${candidature.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-500/30"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm font-medium">Détails</span>
                    </Link>
                    <Link
                      to={`/modifier/${candidature.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-500/30"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Modifier</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(candidature.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Supprimer</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la candidature"
        message="Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Dialog de confirmation de suppression multiple */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, count: 0 })}
        onConfirm={handleBulkDeleteConfirm}
        title="Supprimer les candidatures"
        message={`Êtes-vous sûr de vouloir supprimer ${bulkDeleteConfirm.count} candidature${bulkDeleteConfirm.count > 1 ? 's' : ''} ? Cette action est irréversible.`}
        confirmText={`Supprimer ${bulkDeleteConfirm.count}`}
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}

export default ListeCandidatures
