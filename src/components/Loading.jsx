import { Loader2 } from 'lucide-react'

function Loading({ message = 'Chargement...', fullScreen = false }) {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  )
}

// Skeleton pour les cartes de candidatures
export function CandidatureSkeleton() {
  return (
    <div className="bg-white dark:bg-black/40 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/10 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full w-24"></div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="flex space-x-2 pt-4 border-t border-white/10">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl flex-1"></div>
      </div>
    </div>
  )
}

// Skeleton pour le dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 animate-pulse">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-12 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default Loading

