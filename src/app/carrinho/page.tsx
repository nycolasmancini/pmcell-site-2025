'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import SuperWholesaleUpgrade from '@/components/cart/SuperWholesaleUpgrade'
import MinimumOrderAlert from '@/components/cart/MinimumOrderAlert'
import Toast from '@/components/ui/Toast'
import { OrderCompletionSidebar } from '@/components/cart/OrderCompletionSidebar'
import { useToast } from '@/hooks/useToast'
import { useCartStore } from '@/stores/useCartStore'
import { formatPrice } from '@/lib/utils'

export default function CarrinhoPage() {
  const { toasts, showToast, removeToast } = useToast()
  const alertRef = useRef<HTMLDivElement>(null)
  const [showOrderCompletion, setShowOrderCompletion] = useState(false)
  const [orderNumber, setOrderNumber] = useState(0)
  
  // Usar dados reais do carrinho
  const {
    items: cartItems,
    updateQuantity: updateCartQuantity,
    removeItem,
    getSubtotal,
    getItemsCount,
    getSavings
  } = useCartStore()

  const updateQuantity = (id: string, newQuantity: number) => {
    updateCartQuantity(id, Math.max(1, newQuantity))
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)
  }

  const totalQuantity = getItemsCount()
  const totalValue = getSubtotal()
  const totalSavings = getSavings()
  
  
  const handleFinalizePedido = () => {
    console.log('Clique no botão finalizar - Total:', totalQuantity)
    
    if (totalQuantity < 30) {
      const remaining = 30 - totalQuantity
      console.log('Mostrando toast - faltam:', remaining)
      
      showToast(
        `Adicione mais ${remaining} ${remaining === 1 ? 'item' : 'itens'} para atingir o pedido mínimo de 30 unidades`,
        'warning'
      )
      
      // Destacar visualmente o alerta
      if (alertRef.current) {
        console.log('Fazendo scroll para o alerta')
        alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        alertRef.current.classList.add('animate-pulse')
        setTimeout(() => {
          alertRef.current?.classList.remove('animate-pulse')
        }, 2000)
      }
      return
    }
    
    // Gerar número do pedido temporário (será substituído pela API)
    const tempOrderNumber = Date.now()
    setOrderNumber(tempOrderNumber)
    
    // Abrir modal de finalização
    setShowOrderCompletion(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                PMCELL São Paulo
              </Link>
              <p className="text-xs text-gray-500 font-medium ml-2">Atacado para Lojistas</p>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Carrinho de Compras</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-gray-200 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Seu Carrinho</h1>
              <p className="text-gray-600">{totalQuantity} itens selecionados</p>
              
            </div>

            {/* Minimum Order Alert */}
            <div ref={alertRef}>
              <MinimumOrderAlert />
            </div>

            {/* Super Wholesale Upgrade */}
            <SuperWholesaleUpgrade cartItems={cartItems} />

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const isWholesaleActive = item.specialQuantity && 
                  item.quantity >= item.specialQuantity && 
                  item.specialPrice
                
                const currentPrice = isWholesaleActive ? (item.specialPrice || 0) : (item.unitPrice || 0)

                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">📱</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                        {item.subname && (
                          <p className="text-gray-600 text-sm font-medium">{item.subname}</p>
                        )}
                        {item.modelName && (
                          <p className="text-gray-500 text-xs">{item.modelName}</p>
                        )}
                        
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex items-center bg-gray-50 rounded-lg border">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="min-w-[44px] h-[44px] flex items-center justify-center hover:bg-gray-100 font-bold text-gray-600"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center py-2 bg-white border-x font-semibold"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="min-w-[44px] h-[44px] flex items-center justify-center hover:bg-gray-100 font-bold text-gray-600"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 font-semibold text-sm"
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(currentPrice)}
                        </div>
                        <div className="text-sm text-gray-500">por unidade</div>
                        
                        {isWholesaleActive && (
                          <div className="mt-1">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                              💰 Caixa Fechada Ativa!
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-2 text-lg font-semibold text-orange-600">
                          Total: {formatPrice(currentPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-96">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Resumo do Pedido</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de itens:</span>
                    <span className="font-semibold">{totalQuantity} unidades</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Valor Total:</span>
                    <span className="text-orange-600">{formatPrice(totalValue)}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Economia com Caixa Fechada:</span>
                      <span className="font-semibold">
                        {formatPrice(totalSavings)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleFinalizePedido}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-lg shadow-lg transition-all ${
                      totalQuantity >= 30
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-pointer hover:from-gray-500 hover:to-gray-600'
                    }`}
                  >
                    {totalQuantity >= 30 ? '🎯 Finalizar Pedido' : `⚠️ Faltam ${30 - totalQuantity} itens`}
                  </button>
                  
                  <Link 
                    href="/"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    ← Continuar Comprando
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">🚚 Informações de Entrega</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>📍 Grande São Paulo: Entrega grátis</div>
                    <div>⏰ Prazo: 24-48h úteis</div>
                    <div>📞 Acompanhe pelo WhatsApp</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      {/* Order Completion Sidebar */}
      <OrderCompletionSidebar
        isOpen={showOrderCompletion}
        onClose={() => setShowOrderCompletion(false)}
        onBack={() => setShowOrderCompletion(false)}
        orderNumber={orderNumber}
        subtotal={totalValue}
        itemsCount={totalQuantity}
      />
    </div>
  )
}