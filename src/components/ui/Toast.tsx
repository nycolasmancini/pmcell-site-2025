'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  type?: 'warning' | 'error' | 'success' | 'info'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'warning', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('Toast montado:', message)
    setMounted(true)
    
    // Pequeno delay para garantir que o componente seja montado antes da animação
    const mountTimer = setTimeout(() => {
      console.log('Toast visible:', message)
      setIsVisible(true)
    }, 50)
    
    const timer = setTimeout(() => {
      console.log('Toast closing:', message)
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(mountTimer)
    }
  }, [duration, onClose, message])

  if (!mounted) return null

  const typeStyles = {
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  }

  const icons = {
    warning: '⚠️',
    error: '❌',
    success: '✅',
    info: 'ℹ️'
  }

  return createPortal(
    <div className={`fixed top-4 right-4 z-[9999] transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
    }`}>
      <div className={`
        ${typeStyles[type]} 
        px-6 py-4 rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-md
        max-w-sm flex items-center gap-3 font-semibold
      `}>
        <span className="text-xl">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="text-white/80 hover:text-white transition-colors ml-2"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  )
}