import { useState, useEffect } from 'react'

export function useTheme() {
  // Récupérer le thème depuis localStorage ou utiliser le mode sombre par défaut
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    
    // Mode sombre par défaut
    return 'dark'
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Supprimer l'ancien thème
    root.classList.remove('light', 'dark')
    
    // Ajouter le nouveau thème
    root.classList.add(theme)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme, setTheme }
}

