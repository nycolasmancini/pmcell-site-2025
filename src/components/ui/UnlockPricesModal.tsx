'use client'

import { useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { validateBrazilianWhatsApp, formatWhatsApp } from '@/lib/utils'
import { useAnalytics } from '@/lib/analytics'

interface UnlockPricesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UnlockPricesModal({ isOpen, onClose }: UnlockPricesModalProps) {
  const { unlockPrices } = useSession()
  const [whatsapp, setWhatsapp] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  // Aplicar máscara brasileira para telefone
  const applyPhoneMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      // Format para 10 dígitos: (XX) XXXX-XXXX
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
    } else {
      // Format para 11 dígitos: (XX) XXXXX-XXXX
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value);
    setWhatsapp(maskedValue);
  };
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300) // Duração da animação
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Formatar WhatsApp
    const formattedWhatsApp = formatWhatsApp(whatsapp)

    // Validar
    if (!validateBrazilianWhatsApp(formattedWhatsApp)) {
      setError('Por favor, insira um WhatsApp válido com DDD')
      return
    }

    setLoading(true)

    try {
      console.log('📞 Iniciando desbloqueio para:', formattedWhatsApp)
      
      await unlockPrices(formattedWhatsApp)
      
      console.log('✅ Preços desbloqueados com sucesso')
      
      // Track WhatsApp collection
      console.log('📞 Modal: WhatsApp coletado, iniciando tracking...')
      if (typeof window !== 'undefined') {
        try {
          const analytics = useAnalytics()
          console.log('📞 Modal: Analytics instance obtida:', analytics)
          analytics.trackWhatsAppCollection(formattedWhatsApp)
          console.log('📞 Modal: trackWhatsAppCollection chamado com sucesso')
        } catch (analyticsError) {
          console.error('❌ Erro no tracking de WhatsApp:', analyticsError)
        }
      }
      
      handleClose()
    } catch (error) {
      console.error('❌ Erro ao liberar preços:', error)
      setError('Erro ao liberar preços. Tente novamente.')
    } finally {
      console.log('🔄 Finalizando processo de desbloqueio')
      setLoading(false)
    }
  }

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
        isClosing ? '' : 'animate-fade-in'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all duration-300" 
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isClosing ? 'modalSlideOut 0.3s ease-out' : 'modalSlideIn 0.3s ease-out'
        }}
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🤝 Vamos fazer negócio juntos?
          </h2>
          <p className="text-gray-600">
            Deixe seu WhatsApp para ver preços personalizados e ter um atendimento direto quando precisar. Somos parceiros do seu sucesso!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              id="whatsapp"
              value={whatsapp}
              onChange={handlePhoneChange}
              placeholder="(11) 9999-9999 ou (11) 99999-9999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FC6D36' }}
            >
              {loading ? 'Liberando...' : 'Ver Preços Especiais'}
            </button>
            
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Agora não, obrigado
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Utilizamos seu WhatsApp apenas para enviar lançamentos exclusivos e ofertas especiais.
            Seus dados estão protegidos e nunca serão compartilhados com terceiros.
          </p>
        </div>
      </div>
    </div>
  )
}