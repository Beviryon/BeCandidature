import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const TOAST_TYPES = {
  success: { icon: CheckCircle, color: 'green' },
  error: { icon: XCircle, color: 'red' },
  warning: { icon: AlertCircle, color: 'orange' },
  info: { icon: Info, color: 'blue' }
}

function Toast({ toast, onClose }) {
  const { type = 'info', message, duration = 5000 } = toast
  const config = TOAST_TYPES[type] || TOAST_TYPES.info
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const colorClasses = {
    green: 'border-green-500',
    red: 'border-red-500',
    orange: 'border-orange-500',
    blue: 'border-blue-500'
  }

  const iconColorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    orange: 'text-orange-500',
    blue: 'text-blue-500'
  }

  return (
    <div className="animate-slide-in-right mb-3">
      <div className={`
        bg-white dark:bg-gray-800 backdrop-blur-xl rounded-xl p-4 
        border-l-4 shadow-lg min-w-[300px] max-w-md
        ${colorClasses[config.color]}
        flex items-start space-x-3
      `}>
        <Icon className={`w-5 h-5 ${iconColorClasses[config.color]} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast

