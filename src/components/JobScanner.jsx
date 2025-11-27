import { useState } from 'react'
import { Search, ExternalLink, Briefcase, MapPin, Sparkles, TrendingUp } from 'lucide-react'

function JobScanner() {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    contract: 'all',
    experience: 'all'
  })
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    linkedin: true,
    indeed: true,
    wttj: true,
    apec: true
  })

  const platforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0077B5',
      icon: '',
      getUrl: (keyword, location) => 
        `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location || 'France')}`
    },
    {
      id: 'indeed',
      name: 'Indeed',
      color: '#2164F3',
      icon: '',
      getUrl: (keyword, loc) =>
        `https://fr.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(loc || 'France')}`
    },
    {
      id: 'wttj',
      name: 'Welcome to the Jungle',
      color: '#FF6B6B',
      icon: '',
      getUrl: (keyword) =>
        `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(keyword)}`
    },
    {
      id: 'apec',
      name: 'Apec',
      color: '#00A8E1',
      icon: '',
      getUrl: (keyword) =>
        `https://www.apec.fr/candidat/recherche-emploi.html/emploi?motsCles=${encodeURIComponent(keyword)}`
    }
  ]

  const recommendedSearches = [
    { keyword: 'Développeur Full Stack', location: 'Paris', count: '2,453' },
    { keyword: 'Data Engineer', location: 'Lyon', count: '1,837' },
    { keyword: 'DevOps Engineer', location: 'Toulouse', count: '1,256' },
    { keyword: 'Product Manager', location: 'Nantes', count: '982' },
    { keyword: 'UX/UI Designer', location: 'Bordeaux', count: '743' },
    { keyword: 'Chef de Projet Digital', location: 'Lille', count: '654' }
  ]

  const popularKeywords = [
    'Alternance Développeur',
    'Stage Data Science',
    'Full Stack React',
    'DevOps Cloud',
    'Product Owner',
    'Business Analyst',
    'UI Designer',
    'Marketing Digital'
  ]

  const contractTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Alternance', label: 'Alternance' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Freelance', label: 'Freelance' }
  ]

  const experienceLevels = [
    { value: 'all', label: 'Tous niveaux' },
    { value: 'junior', label: 'Junior (0-2 ans)' },
    { value: 'intermediate', label: 'Intermédiaire (2-5 ans)' },
    { value: 'senior', label: 'Senior (5+ ans)' }
  ]

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }))
  }

  const searchAllPlatforms = () => {
    if (!filters.keyword.trim()) {
      alert('Veuillez entrer un mot-clé de recherche')
      return
    }

    platforms.forEach(platform => {
      if (selectedPlatforms[platform.id]) {
        const url = platform.getUrl(filters.keyword, filters.location)
        window.open(url, '_blank')
      }
    })
  }

  const handleRecommendedSearchClick = (search) => {
    const newFilters = {
      ...filters,
      keyword: search.keyword,
      location: search.location
    }
    setFilters(newFilters)
    
    // Lancer immédiatement la recherche
    setTimeout(() => {
      platforms.forEach(platform => {
        if (selectedPlatforms[platform.id]) {
          const url = platform.getUrl(search.keyword, search.location)
          window.open(url, '_blank')
        }
      })
    }, 100)
  }

  const handleKeywordClick = (keyword) => {
    const newFilters = {
      ...filters,
      keyword
    }
    setFilters(newFilters)
    
    // Lancer immédiatement la recherche
    setTimeout(() => {
      platforms.forEach(platform => {
        if (selectedPlatforms[platform.id]) {
          const url = platform.getUrl(keyword, filters.location)
          window.open(url, '_blank')
        }
      })
    }, 100)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold gradient-text mb-2">
          🔍 Scan d&apos;Offres IA
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Recherchez sur plusieurs plateformes simultanément
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-gray-200 dark:border-purple-500/20">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            50K+
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Offres disponibles
          </div>
        </div>
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-gray-200 dark:border-purple-500/20">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            4
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Plateformes
          </div>
        </div>
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-gray-200 dark:border-purple-500/20">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            Instantané
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Recherche ultra-rapide
          </div>
        </div>
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-gray-200 dark:border-purple-500/20">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            100%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Gratuit
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <Search className="w-5 h-5 mr-2 text-purple-500" />
          Recherche multi-plateformes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mot-clé *
            </label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="Ex: Développeur Full Stack"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Localisation
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Ex: Paris, Lyon, Remote..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Type de contrat
            </label>
            <select
              value={filters.contract}
              onChange={(e) => setFilters({ ...filters, contract: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            >
              {contractTypes.map(type => (
                <option key={type.value} value={type.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Niveau d&apos;expérience
            </label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            >
              {experienceLevels.map(level => (
                <option key={level.value} value={level.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Platforms Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Plateformes à rechercher
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map(platform => (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedPlatforms[platform.id]
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5'
                }`}
              >
                <div className="text-2xl mb-2">{platform.icon}</div>
                <div className={`font-semibold text-sm ${
                  selectedPlatforms[platform.id]
                    ? 'text-purple-700 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-400'
                }`}>
                  {platform.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={searchAllPlatforms}
          disabled={!filters.keyword.trim()}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
        >
          <Search className="w-6 h-6" />
          <span>Lancer la recherche sur {Object.values(selectedPlatforms).filter(Boolean).length} plateformes</span>
        </button>
      </div>

      {/* Popular Keywords */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
          Recherches populaires
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularKeywords.map(keyword => (
            <button
              key={keyword}
              type="button"
                onClick={() => handleKeywordClick(keyword)}
              className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-purple-500/20 dark:hover:bg-purple-500/20 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all duration-300 border border-gray-300 dark:border-white/10 hover:border-purple-500/50 cursor-pointer z-10"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Searches */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-purple-500/20">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
          Offres recommandées pour vous
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedSearches.map((search, index) => (
            <button
              key={index}
              type="button"
                onClick={() => handleRecommendedSearchClick(search)}
              className="p-4 bg-gray-50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all text-left group cursor-pointer z-10"
            >
              <div className="flex items-start justify-between mb-2">
                <Briefcase className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  {search.count} offres
                </span>
              </div>
              <div className="font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {search.keyword}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                {search.location}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Recherche multi-plateformes :</strong> En cliquant sur &quot;Lancer la recherche&quot;, 
            un nouvel onglet s&apos;ouvrira pour chaque plateforme sélectionnée avec votre recherche. 
            Gain de temps énorme ! ⚡
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobScanner

