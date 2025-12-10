import { AlertTriangle, X } from 'lucide-react'

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', type = 'danger' }) {
  if (!isOpen) return null

  const bgColor = type === 'danger' ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'
  const buttonColor = type === 'danger' 
    ? 'bg-red-500 hover:bg-red-600' 
    : 'bg-blue-500 hover:bg-blue-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border ${bgColor} shadow-xl animate-slide-up`}>
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            type === 'danger' ? 'bg-red-500/20' : 'bg-blue-500/20'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              type === 'danger' ? 'text-red-500' : 'text-blue-500'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {message}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 ${buttonColor} text-white rounded-xl font-medium transition-all duration-300 hover:scale-105`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-all duration-300"
              >
                {cancelText}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

