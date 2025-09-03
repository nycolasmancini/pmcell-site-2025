'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/useCartStore'

interface SuperWholesaleUpgradeProps {
  cartItems: Array<{
    productId: string
    name: string
    quantity: number
    unitPrice: number
    superWholesalePrice?: number
    superWholesaleQuantity?: number
  }>
}

export default function SuperWholesaleUpgrade({ cartItems }: SuperWholesaleUpgradeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const updateQuantity = useCartStore((state) => state.updateQuantity)

  // Encontrar itens que estão próximos do super atacado (faltam até 20%)
  const upgradeOpportunities = cartItems.filter(item => {
    if (!item.superWholesalePrice || !item.superWholesaleQuantity) return false
    
    const neededQuantity = item.superWholesaleQuantity
    const currentQuantity = item.quantity
    const percentageComplete = (currentQuantity / neededQuantity) * 100
    
    return percentageComplete >= 80 && percentageComplete < 100
  })

  if (upgradeOpportunities.length === 0) return null

  const toggleExpanded = (productId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedItems(newExpanded)
  }

  const quickAddQuantity = (productId: string, additionalQuantity: number) => {
    const item = cartItems.find(i => i.productId === productId)
    if (item) {
      updateQuantity(productId, item.quantity + additionalQuantity)
    }
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">🎯</div>
        <div>
          <h3 className="font-bold text-green-800 text-lg">Você está quase lá!</h3>
          <p className="text-green-700 text-sm">Complete alguns itens e ganhe desconto na Caixa fechada</p>
        </div>
      </div>

      <div className="space-y-4">
        {upgradeOpportunities.map(item => {
          const neededQuantity = item.superWholesaleQuantity!
          const currentQuantity = item.quantity
          const missingQuantity = neededQuantity - currentQuantity
          const currentTotal = currentQuantity * item.unitPrice
          const upgradeTotal = neededQuantity * item.superWholesalePrice!
          const savings = currentTotal - upgradeTotal

          const isExpanded = expandedItems.has(item.productId)

          return (
            <div key={item.productId} className="bg-white rounded-lg border border-green-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Você tem {currentQuantity}, faltam apenas <span className="font-bold text-green-600">{missingQuantity}</span> para a Caixa fechada
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-300"
                        style={{ width: `${(currentQuantity / neededQuantity) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-green-600">
                      {Math.round((currentQuantity / neededQuantity) * 100)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpanded(item.productId)}
                  className="ml-4 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                >
                  {isExpanded ? 'Ocultar' : 'Ver Economia'}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800">Preço Atual</p>
                      <p className="text-lg font-bold text-red-600">{formatPrice(item.unitPrice)}</p>
                      <p className="text-xs text-red-600">por unidade</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">Caixa Fechada</p>
                      <p className="text-lg font-bold text-green-600">{formatPrice(item.superWholesalePrice!)}</p>
                      <p className="text-xs text-green-600">por unidade</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                    <p className="text-sm font-semibold text-yellow-800">💰 Sua economia seria:</p>
                    <p className="text-xl font-bold text-yellow-600">{formatPrice(savings)}</p>
                    <p className="text-xs text-yellow-600">no pedido completo de {neededQuantity} unidades</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {[1, 5, missingQuantity].filter((qty, index, arr) => 
                      qty <= missingQuantity && arr.indexOf(qty) === index
                    ).map(qty => (
                      <button
                        key={qty}
                        onClick={() => quickAddQuantity(item.productId, qty)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          qty === missingQuantity 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        + {qty} {qty === missingQuantity ? '🎯 Ativar Desconto!' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-green-700">
          ⚡ Ação rápida: Complete agora e economize ainda mais no seu pedido!
        </p>
      </div>
    </div>
  )
}