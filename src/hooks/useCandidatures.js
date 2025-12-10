import { useState, useEffect, useCallback } from 'react'
import { getCandidatures, addCandidature, updateCandidature, deleteCandidature as deleteFirebaseCandidature, getCandidature as getFirebaseCandidature } from '../services/candidaturesService'
import { DEMO_MODE, getDemoCandidatures, saveDemoCandidatures } from '../demoData'
import { useToast } from '../contexts/ToastContext'

/**
 * Hook personnalisé pour gérer les candidatures
 * Centralise la logique de récupération, ajout, modification et suppression
 */
export function useCandidatures() {
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { success, error: showError } = useToast()

  // Charger les candidatures
  const fetchCandidatures = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (DEMO_MODE) {
        const demoCandidatures = getDemoCandidatures()
        setCandidatures(demoCandidatures)
        setLoading(false)
        return
      }

      // Firebase
      const data = await getCandidatures()
      // Tri côté client par date décroissante
      const sortedData = (data || []).sort((a, b) => 
        new Date(b.date_candidature) - new Date(a.date_candidature)
      )
      setCandidatures(sortedData)
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors du chargement des candidatures'
      setError(errorMessage)
      showError(errorMessage)
      console.error('Error fetching candidatures:', err)
    } finally {
      setLoading(false)
    }
  }, [showError])

  // Charger au montage
  useEffect(() => {
    fetchCandidatures()
  }, [fetchCandidatures])

  // Ajouter une candidature
  const add = useCallback(async (candidatureData) => {
    try {
      if (DEMO_MODE) {
        const newCandidature = {
          id: Date.now().toString(),
          ...candidatureData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const updatedCandidatures = [newCandidature, ...candidatures]
        setCandidatures(updatedCandidatures)
        saveDemoCandidatures(updatedCandidatures)
        success('Candidature ajoutée avec succès !')
        return newCandidature
      }

      const newCandidature = await addCandidature(candidatureData)
      setCandidatures(prev => [newCandidature, ...prev])
      success('Candidature ajoutée avec succès !')
      return newCandidature
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de l\'ajout de la candidature'
      showError(errorMessage)
      throw err
    }
  }, [candidatures, success, showError])

  // Modifier une candidature
  const update = useCallback(async (id, candidatureData) => {
    try {
      if (DEMO_MODE) {
        const updatedCandidatures = candidatures.map(c => 
          c.id === id 
            ? { ...c, ...candidatureData, updated_at: new Date().toISOString() }
            : c
        )
        setCandidatures(updatedCandidatures)
        saveDemoCandidatures(updatedCandidatures)
        success('Candidature modifiée avec succès !')
        return updatedCandidatures.find(c => c.id === id)
      }

      const updatedCandidature = await updateCandidature(id, candidatureData)
      setCandidatures(prev => prev.map(c => c.id === id ? updatedCandidature : c))
      success('Candidature modifiée avec succès !')
      return updatedCandidature
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la modification de la candidature'
      showError(errorMessage)
      throw err
    }
  }, [candidatures, success, showError])

  // Supprimer une candidature
  const remove = useCallback(async (id) => {
    try {
      if (DEMO_MODE) {
        const updatedCandidatures = candidatures.filter(c => c.id !== id)
        setCandidatures(updatedCandidatures)
        saveDemoCandidatures(updatedCandidatures)
        success('Candidature supprimée avec succès !')
        return
      }

      await deleteFirebaseCandidature(id)
      setCandidatures(prev => prev.filter(c => c.id !== id))
      success('Candidature supprimée avec succès !')
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la suppression de la candidature'
      showError(errorMessage)
      throw err
    }
  }, [candidatures, success, showError])

  // Récupérer une candidature par ID
  const get = useCallback(async (id) => {
    if (DEMO_MODE) {
      const candidature = candidatures.find(c => c.id === id)
      if (!candidature) {
        throw new Error('Candidature non trouvée')
      }
      return candidature
    }
    
    // Pour Firebase, on utilise getCandidature du service
    return await getFirebaseCandidature(id)
  }, [candidatures])

  return {
    candidatures,
    loading,
    error,
    fetchCandidatures,
    getCandidature: get,
    addCandidature: add,
    updateCandidature: update,
    deleteCandidature: remove
  }
}

