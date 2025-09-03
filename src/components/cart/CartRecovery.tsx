'use client'

import { useState, useEffect } from 'react'
import { useCartStore, CartItem } from '@/stores/useCartStore'
import { useAnalytics } from '@/lib/analytics'
import { X, ShoppingCart, RefreshCw } from 'lucide-react'

interface CartRecoveryProps {
  onClose?: () => void
}

export function CartRecovery({ onClose }: CartRecoveryProps) {
  const [serverCart, setServerCart] = useState<CartItem[] | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { items: currentItems, clearCart } = useCartStore()

  useEffect(() => {
    checkForServerCart()
  }, [])

  const checkForServerCart = async () => {
    try {
      setIsLoading(true)
      const analytics = useAnalytics()
      const sessionId = analytics.getSessionId()

      const response = await fetch(
        `/api/cart/simple-update?sessionId=${sessionId}`
      )

      if (!response.ok) return

      const data = await response.json()
      
      if (data.found && data.cart?.cartData?.items) {
        const serverItems = data.cart.cartData.items
        
        // Mostrar só se servidor tem mais itens que local
        if (serverItems.length > 0 && serverItems.length > currentItems.length) {
          setServerCart(serverItems)
          setIsVisible(true)
        }
      }
    } catch (error) {
      console.warn('CartRecovery: Erro ao verificar carrinho no servidor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecover = () => {
    if (!serverCart) return

    // Limpar carrinho atual e adicionar itens do servidor
    clearCart()
    
    // Como não podemos chamar addItem diretamente aqui devido ao Zustand,
    // vamos atualizar o estado diretamente
    useCartStore.setState({ items: serverCart })
    
    console.log('✅ CartRecovery: Carrinho recuperado do servidor')
    handleClose()
  }

  const handleKeepCurrent = () => {
    console.log('📝 CartRecovery: Usuário optou por manter carrinho local')
    handleClose()
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible || !serverCart || isLoading) {
    return null
  }

  const serverTotal = serverCart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  )

  const currentTotal = currentItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Carrinho Encontrado!</h3>
            <p className="text-sm text-gray-600">
              Encontramos um carrinho anterior seu
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-blue-900">Carrinho Anterior</span>
              <span className="text-sm text-blue-700">
                R$ {serverTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {serverCart.length} {serverCart.length === 1 ? 'item' : 'itens'}
            </p>
          </div>

          {currentItems.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Carrinho Atual</span>
                <span className="text-sm text-gray-700">
                  R$ {currentTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {currentItems.length} {currentItems.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRecover}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recuperar Carrinho Anterior
          </button>

          <button
            onClick={handleKeepCurrent}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50"
          >
            {currentItems.length > 0 ? 'Manter Carrinho Atual' : 'Continuar Vazio'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Você pode recuperar seu carrinho a qualquer momento
        </p>
      </div>
    </div>
  )
}