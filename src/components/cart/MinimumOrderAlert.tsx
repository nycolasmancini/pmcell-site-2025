'use client'

import { useCartStore } from '@/stores/useCartStore'
import { CaseIcon, ChargerIcon, ScreenProtectorIcon, WiredHeadphonesIcon } from '@/components/ui/Icons'

interface MinimumOrderAlertProps {
  minimumQuantity?: number
}

export default function MinimumOrderAlert({ minimumQuantity = 30 }: MinimumOrderAlertProps) {
  const items = useCartStore((state) => state.items)
  
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0)
  const remainingQuantity = Math.max(0, minimumQuantity - totalQuantity)
  const progressPercentage = Math.min(100, (totalQuantity / minimumQuantity) * 100)

  if (totalQuantity >= minimumQuantity) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
          <div>
            <h3 className="font-bold text-green-800 text-lg">Pedido Aprovado!</h3>
            <p className="text-green-700 text-sm">
              Você tem {totalQuantity} itens - pedido mínimo atingido
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-600">
          <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
        </svg>
        <div>
          <h3 className="font-bold text-orange-800 text-lg">Quase lá!</h3>
          <p className="text-orange-700 text-sm">
            Adicione mais <span className="font-bold">{remainingQuantity} {remainingQuantity === 1 ? 'item' : 'itens'}</span> para atingir o pedido mínimo
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm font-semibold text-orange-700 mb-1">
          <span>{totalQuantity} itens</span>
          <span>{minimumQuantity} itens</span>
        </div>
        <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-400 to-orange-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-orange-200">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-600">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
          <h4 className="font-semibold text-orange-800">Sugestões para completar:</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <CaseIcon size={16} className="text-orange-600" />
              <span className="font-medium">Capinhas</span>
            </div>
            <div className="text-orange-600 text-xs">Sempre vendem bem</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <ChargerIcon size={16} className="text-orange-600" />
              <span className="font-medium">Carregadores</span>
            </div>
            <div className="text-orange-600 text-xs">Alta demanda</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <ScreenProtectorIcon size={16} className="text-orange-600" />
              <span className="font-medium">Películas</span>
            </div>
            <div className="text-orange-600 text-xs">Margem excelente</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <WiredHeadphonesIcon size={16} className="text-orange-600" />
              <span className="font-medium">Fones</span>
            </div>
            <div className="text-orange-600 text-xs">Giro rápido</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-600">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <p className="text-sm font-medium text-orange-700">
            Nosso pedido mínimo garante os melhores preços de atacado!
          </p>
        </div>
      </div>
    </div>
  )
}