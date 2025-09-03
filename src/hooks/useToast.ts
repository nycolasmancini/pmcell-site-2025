import { useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'warning' | 'error' | 'success' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'warning' | 'error' | 'success' | 'info' = 'info') => {
    const id = Date.now().toString()
    const toast = { id, message, type }
    
    console.log('showToast chamado:', toast)
    setToasts(prev => {
      console.log('Toasts anteriores:', prev)
      const newToasts = [...prev, toast]
      console.log('Novos toasts:', newToasts)
      return newToasts
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    removeToast
  }
}