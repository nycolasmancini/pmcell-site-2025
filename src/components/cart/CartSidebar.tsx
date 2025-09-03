'use client'

import { useCartStore, type CartItem } from '@/stores/useCartStore'
import { formatPrice } from '@/lib/utils'
import { X, Plus, Minus, Trash2, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { EconomizerModal } from './EconomizerModal'
import { OrderCompletionSidebar } from './OrderCompletionSidebar'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { debounce } from '@/utils/debounce'

// Isolated quantity input component to prevent re-renders
const QuantityInput = ({ 
  itemId, 
  isEditing, 
  tempValue, 
  onChange, 
  onSubmit, 
  onCancel 
}: {
  itemId: string
  isEditing: boolean
  tempValue: string
  onChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}) => {
  if (!isEditing) return null
  
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min="1"
      max="999"
      value={tempValue || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSubmit()
        } else if (e.key === 'Escape') {
          onCancel()
        }
      }}
      className="w-8 text-center text-sm font-medium bg-white border rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      autoFocus
      maxLength={3}
    />
  )
}

export function CartSidebar() {
  const [mounted, setMounted] = useState(false)
  const [showEconomizerModal, setShowEconomizerModal] = useState(false)
  const [showOrderCompletion, setShowOrderCompletion] = useState(false)
  const [currentOrderNumber, setCurrentOrderNumber] = useState(28793)
  const [orderData, setOrderData] = useState({
    subtotal: 0,
    itemsCount: 0
  })
  const [previousUpgradesLength, setPreviousUpgradesLength] = useState(-1) // Start with -1 to detect initial state
  const [buttonState, setButtonState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden')
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [tempQuantityValues, setTempQuantityValues] = useState<Record<string, string>>({})
  const [optimisticQuantities, setOptimisticQuantities] = useState<Record<string, number>>({})
  const { toasts, showToast, removeToast } = useToast()
  const minimumOrderRef = useRef<HTMLParagraphElement>(null)
  const scrollPositionRef = useRef<number>(0)
  
  const { 
    items, 
    isOpen, 
    toggleCart, 
    updateQuantity, 
    removeItem, 
    getSubtotal, 
    getItemsCount,
    getSavings,
    getEligibleUpgrades
  } = useCartStore()

  // Stable refs to prevent recreation of debounced functions
  const updateQuantityRef = useRef(updateQuantity)
  const optimisticQuantitiesRef = useRef(optimisticQuantities)
  
  // Update refs on each render
  updateQuantityRef.current = updateQuantity
  optimisticQuantitiesRef.current = optimisticQuantities

  useEffect(() => {
    setMounted(true)
  }, [])

  // Control body scroll when cart is open (mobile-friendly)
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position in ref for reliable restoration
      scrollPositionRef.current = window.scrollY
      
      // Apply styles to prevent scrolling (works on mobile too)
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      // For iOS - also apply to html element
      document.documentElement.style.overflow = 'hidden'
    } else {
      // Remove all scroll-blocking styles
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      
      // Restore scroll position using saved ref value
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current)
      })
    }
    
    return () => {
      // Cleanup on unmount
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  const subtotal = getSubtotal()
  const savings = getSavings()
  const eligibleUpgrades = getEligibleUpgrades()
  const totalQuantity = getItemsCount()
  
  // Função para finalizar pedido com validação
  const handleFinalizePedido = () => {
    console.log('Clique no botão finalizar - Total:', totalQuantity)
    
    if (totalQuantity < 30) {
      const remaining = 30 - totalQuantity
      console.log('Mostrando toast - faltam:', remaining)
      
      showToast(
        `Adicione mais ${remaining} ${remaining === 1 ? 'item' : 'itens'} para atingir o pedido mínimo de 30 unidades`,
        'warning'
      )
      
      // Destacar visualmente o texto de pedido mínimo
      if (minimumOrderRef.current) {
        console.log('Fazendo destaque no texto de pedido mínimo')
        minimumOrderRef.current.classList.add('animate-pulse', 'text-orange-600', 'font-bold')
        setTimeout(() => {
          minimumOrderRef.current?.classList.remove('animate-pulse', 'text-orange-600', 'font-bold')
        }, 2000)
      }
      return
    }
    
    // Capturar dados do pedido antes de mostrar tela de finalização
    setOrderData({
      subtotal: subtotal,
      itemsCount: totalQuantity
    })
    
    // Gerar próximo número de pedido e mostrar tela de finalização
    setCurrentOrderNumber(prev => prev + 1)
    setShowOrderCompletion(true)
  }

  // Função para voltar do completion para o carrinho
  const handleBackToCart = () => {
    setShowOrderCompletion(false)
  }

  // Função para fechar completamente o carrinho
  const handleCloseCompletion = () => {
    setShowOrderCompletion(false)
    toggleCart() // Fecha o carrinho principal
  }

  // Simple calculation without complex memoization
  const upgradesLength = eligibleUpgrades.length

  // Group items: modal products (those with modelId) are grouped by productId
  const groupedItems = useMemo(() => {
    const groups: Array<{
      id: string
      type: 'single' | 'grouped'
      productId: string
      name: string
      subname?: string
      image?: string
      items: typeof items
      totalQuantity: number
      totalPrice: number
    }> = []

    const processedProductIds = new Set<string>()

    items.forEach(item => {
      if (processedProductIds.has(item.productId)) return

      // Check if this product has multiple models (modal product)
      const productItems = items.filter(i => i.productId === item.productId)
      
      if (productItems.length > 1 || (productItems.length === 1 && productItems[0].modelId)) {
        // This is a modal product - group all variations
        const totalQuantity = productItems.reduce((sum, i) => sum + i.quantity, 0)
        const totalPrice = productItems.reduce((sum, i) => {
          const price = i.specialQuantity && i.quantity >= i.specialQuantity && i.specialPrice
            ? i.specialPrice
            : i.unitPrice
          return sum + (price * i.quantity)
        }, 0)

        groups.push({
          id: item.productId,
          type: 'grouped',
          productId: item.productId,
          name: item.name,
          subname: item.subname,
          image: item.image,
          items: productItems,
          totalQuantity,
          totalPrice
        })
      } else {
        // Single item (not modal)
        const price = item.specialQuantity && item.quantity >= item.specialQuantity && item.specialPrice
          ? item.specialPrice
          : item.unitPrice

        groups.push({
          id: item.id,
          type: 'single',
          productId: item.productId,
          name: item.name,
          subname: item.subname,
          image: item.image,
          items: [item],
          totalQuantity: item.quantity,
          totalPrice: price * item.quantity
        })
      }

      processedProductIds.add(item.productId)
    })

    return groups
  }, [items])

  // Smooth button state management with animations
  useEffect(() => {
    if (!mounted) return

    if (upgradesLength > 0 && buttonState === 'hidden') {
      setButtonState('entering')
      setTimeout(() => setButtonState('visible'), 800)
    } else if (upgradesLength === 0 && (buttonState === 'visible' || buttonState === 'entering')) {
      setButtonState('exiting')
      setTimeout(() => setButtonState('hidden'), 600)
    }
  }, [upgradesLength, mounted, buttonState])

  // Handle animated item removal
  const handleRemoveItem = useCallback((itemId: string) => {
    // Add item to removing set
    setRemovingItems(prev => new Set([...prev, itemId]))
    
    // After animation completes, actually remove the item
    setTimeout(() => {
      removeItem(itemId)
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }, 500) // Match animation duration
  }, [removeItem])

  // Handle quantity editing with isolated state
  const handleQuantityClick = useCallback((itemId: string, currentQuantity: number) => {
    setEditingQuantity(itemId)
    setTempQuantityValues(prev => ({
      ...prev,
      [itemId]: currentQuantity.toString()
    }))
  }, [])

  const handleQuantityChange = useCallback((itemId: string, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '')
    
    // Immediately update temp value without triggering re-renders
    setTempQuantityValues(prev => {
      if (prev[itemId] === numericValue) return prev // Prevent unnecessary updates
      return {
        ...prev,
        [itemId]: numericValue
      }
    })
  }, [])

  const handleQuantitySubmit = useCallback((itemId: string) => {
    const value = tempQuantityValues[itemId]
    const quantity = parseInt(value, 10)
    
    if (!isNaN(quantity) && quantity > 0 && quantity <= 999) {
      updateQuantity(itemId, quantity)
    }
    
    // Clear editing state
    setEditingQuantity(null)
    setTempQuantityValues(prev => {
      const newValues = { ...prev }
      delete newValues[itemId]
      return newValues
    })
  }, [tempQuantityValues, updateQuantity])

  const handleQuantityCancel = useCallback((itemId: string) => {
    setEditingQuantity(null)
    setTempQuantityValues(prev => {
      const newValues = { ...prev }
      delete newValues[itemId]
      return newValues
    })
  }, [])

  // Stable debounced quantity update for +/- buttons  
  const debouncedUpdateQuantity = useMemo(
    () => debounce((itemId: string, newQuantity: number) => {
      updateQuantityRef.current(itemId, newQuantity)
      // Clear optimistic state after real update
      setOptimisticQuantities(prev => {
        const newState = { ...prev }
        delete newState[itemId]
        return newState
      })
    }, 300),
    [] // No dependencies - stable function
  )

  // Stable handle increment with optimistic update
  const handleIncrement = useCallback((item: CartItem) => {
    const currentOptimistic = optimisticQuantitiesRef.current[item.id] ?? item.quantity
    const newQuantity = currentOptimistic + 1
    
    // Immediate optimistic update
    setOptimisticQuantities(prev => ({
      ...prev,
      [item.id]: newQuantity
    }))
    
    // Debounced real update
    debouncedUpdateQuantity(item.id, newQuantity)
  }, [debouncedUpdateQuantity])

  // Stable handle decrement with optimistic update
  const handleDecrement = useCallback((item: CartItem) => {
    const currentOptimistic = optimisticQuantitiesRef.current[item.id] ?? item.quantity
    const newQuantity = Math.max(1, currentOptimistic - 1)
    
    // Immediate optimistic update
    setOptimisticQuantities(prev => ({
      ...prev,
      [item.id]: newQuantity
    }))
    
    // Debounced real update  
    debouncedUpdateQuantity(item.id, newQuantity)
  }, [debouncedUpdateQuantity])

  // Simple button styling
  const getButtonClasses = () => {
    const baseClasses = "w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] mb-2 relative overflow-hidden"
    
    if (buttonState === 'entering') return `${baseClasses} economize-button-enter economize-button-shimmer`
    if (buttonState === 'visible') return `${baseClasses} economize-button-glow economize-button-shimmer`
    if (buttonState === 'exiting') return `${baseClasses} economize-button-exit`
    
    return baseClasses
  }

  if (!mounted) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          isOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col
          transition-all duration-300 ease-out transform ${
            isOpen 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
          }`}
        style={{
          boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1), -10px 0 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b backdrop-blur-sm">
          <h2 className="text-lg font-semibold transition-all duration-200">
            Carrinho ({getItemsCount()})
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-8 animate-in fade-in duration-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
              <p className="text-gray-500 text-sm">Adicione produtos para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedItems.map((group, index) => {
                if (group.type === 'single') {
                  const item = group.items[0]
                  
                  // Aplicar o melhor desconto disponível (menor preço)
                  const reachedSpecialQuantity = item.specialQuantity && item.quantity >= item.specialQuantity
                  const reachedSuperWholesaleQuantity = item.superWholesaleQuantity && item.quantity >= item.superWholesaleQuantity
                  
                  let currentPrice = item.unitPrice
                  if (reachedSpecialQuantity && item.specialPrice && reachedSuperWholesaleQuantity && item.superWholesalePrice) {
                    currentPrice = Math.min(item.specialPrice, item.superWholesalePrice)
                  } else if (reachedSpecialQuantity && item.specialPrice) {
                    currentPrice = item.specialPrice
                  } else if (reachedSuperWholesaleQuantity && item.superWholesalePrice) {
                    currentPrice = item.superWholesalePrice
                  }

                  const isRemoving = removingItems.has(item.id)
                
                  return (
                    <div 
                      key={item.id} 
                      className={`flex gap-4 bg-gray-50 rounded-lg transition-all duration-300 ${
                        isRemoving 
                          ? 'cart-item-removing px-3' 
                          : 'p-3 hover:bg-gray-100 hover:shadow-md transform hover:scale-[1.02] animate-in slide-in-from-right duration-300'
                      }`}
                      style={{
                        animationDelay: isRemoving ? '0ms' : `${index * 50}ms`
                      }}
                    >
                    {/* Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                      {item.subname && (
                        <p className="text-xs text-gray-500 mt-1">{item.subname}</p>
                      )}
                      {item.modelName && (
                        <p className="text-xs text-blue-600 mt-1">{item.modelName}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleDecrement(item)}
                            disabled={isRemoving}
                            className={`w-7 h-7 rounded flex items-center justify-center border transition-all duration-200 ${
                              isRemoving 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-gray-100 hover:scale-110 active:scale-95'
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          {editingQuantity === item.id ? (
                            <QuantityInput
                              itemId={item.id}
                              isEditing={editingQuantity === item.id}
                              tempValue={tempQuantityValues[item.id] || ''}
                              onChange={(value) => handleQuantityChange(item.id, value)}
                              onSubmit={() => handleQuantitySubmit(item.id)}
                              onCancel={() => handleQuantityCancel(item.id)}
                            />
                          ) : (
                            <span 
                              className={`w-8 text-center text-sm font-medium transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded px-1 ${
                                isRemoving ? 'opacity-50' : ''
                              }`}
                              onClick={() => !isRemoving && handleQuantityClick(item.id, optimisticQuantities[item.id] ?? item.quantity)}
                              title="Clique para editar a quantidade"
                            >
                              {optimisticQuantities[item.id] ?? item.quantity}
                            </span>
                          )}
                          
                          <button
                            onClick={() => handleIncrement(item)}
                            disabled={isRemoving}
                            className={`w-7 h-7 rounded flex items-center justify-center border transition-all duration-200 ${
                              isRemoving 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-gray-100 hover:scale-110 active:scale-95'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemoving}
                          className={`p-1 rounded transition-all duration-200 ${
                            isRemoving 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-500 hover:bg-red-50 hover:scale-110 active:scale-95'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm">
                          {(() => {
                            const displayQuantity = optimisticQuantities[item.id] ?? item.quantity
                            const isSpecialActive = item.specialQuantity && displayQuantity >= item.specialQuantity && item.specialPrice
                            const isSuperWholesaleActive = item.superWholesaleQuantity && displayQuantity >= item.superWholesaleQuantity && item.superWholesalePrice
                            const isAnyDiscountActive = isSpecialActive || isSuperWholesaleActive
                            
                            return (
                              <div className="flex items-center gap-2">
                                <span 
                                  key={`unit-${item.id}-${isAnyDiscountActive}`}
                                  className={`font-semibold transition-all duration-500 ease-in-out ${
                                    isAnyDiscountActive ? 'text-green-600' : 'text-gray-900'
                                  }`}
                                  style={{
                                    animation: isAnyDiscountActive ? 'priceChangeColor 0.6s ease-in-out, microBounce 0.4s ease-out 0.2s' : 'fadeInPrice 0.5s ease-in-out'
                                  }}
                                >
                                  {formatPrice(currentPrice)}
                                </span>
                                <span className="text-gray-500">cada</span>
                                {isSuperWholesaleActive && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                    Caixa
                                  </span>
                                )}
                                {isSpecialActive && !isSuperWholesaleActive && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Atacado
                                  </span>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                        <div className="text-sm font-semibold text-right">
                          {(() => {
                            const displayQuantity = optimisticQuantities[item.id] ?? item.quantity
                            const isSpecialActive = item.specialQuantity && displayQuantity >= item.specialQuantity && item.specialPrice
                            const isSuperWholesaleActive = item.superWholesaleQuantity && displayQuantity >= item.superWholesaleQuantity && item.superWholesalePrice
                            const isAnyDiscountActive = isSpecialActive || isSuperWholesaleActive
                            
                            return (
                              <span 
                                key={`total-${item.id}-${isAnyDiscountActive}`}
                                className={`transition-all duration-500 ease-in-out ${
                                  isAnyDiscountActive ? 'text-green-600' : 'text-gray-900'
                                }`}
                                style={{
                                  animation: isAnyDiscountActive ? 'priceChangeColor 0.6s ease-in-out, microBounce 0.4s ease-out 0.3s' : 'fadeInPrice 0.5s ease-in-out'
                                }}
                              >
                                {formatPrice(currentPrice * displayQuantity)}
                              </span>
                            )
                          })()}
                        </div>
                      </div>

                    </div>
                  </div>
                )
                } else {
                  // Grouped modal product
                  return (
                    <div 
                      key={group.id} 
                      className="flex gap-4 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 hover:shadow-md transform hover:scale-[1.02] animate-in slide-in-from-right duration-300"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {/* Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {group.image ? (
                          <Image
                            src={group.image}
                            alt={group.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{group.name}</h3>
                        {group.subname && (
                          <p className="text-xs text-gray-500 mt-1">{group.subname}</p>
                        )}
                        
                        {/* Variações em azul */}
                        <div className="mt-2 space-y-1">
                          {group.items.map((item) => (
                            <div key={item.id} className="flex items-start gap-2">
                              <p className="text-xs text-blue-600 font-medium">
                                {item.modelName} ({item.quantity} un.)
                              </p>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-0.5 rounded transition-all duration-200 text-red-500 hover:bg-red-50 hover:scale-110 active:scale-95 opacity-70 hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>


                        {/* Total */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900">{group.totalQuantity} unidades</span>
                          </div>
                          <div className="text-sm font-semibold text-right">
                            {(() => {
                              // Check if any item in the group has wholesale active
                              const hasWholesaleActive = group.items.some(item => 
                                item.specialQuantity && item.quantity >= item.specialQuantity && item.specialPrice
                              )
                              return (
                                <span 
                                  key={`group-total-${group.id}-${hasWholesaleActive}`}
                                  className={`transition-all duration-500 ease-in-out ${
                                    hasWholesaleActive ? 'text-green-600' : 'text-gray-900'
                                  }`}
                                  style={{
                                    animation: hasWholesaleActive ? 'priceChangeColor 0.6s ease-in-out, microBounce 0.4s ease-out 0.2s' : 'fadeInPrice 0.5s ease-in-out'
                                  }}
                                >
                                  {formatPrice(group.totalPrice)}
                                </span>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom duration-300">
            {savings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">Economia:</span>
                <span className="text-green-600 font-semibold">{formatPrice(savings)}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between font-semibold">
              <span>Total:</span>
              <span className="text-lg">{formatPrice(subtotal)}</span>
            </div>
            

            {/* Botão Economize levando mais com animação suave */}
            {(buttonState === 'entering' || buttonState === 'visible' || buttonState === 'exiting') && (
              <button
                onClick={() => setShowEconomizerModal(true)}
                className={getButtonClasses()}
                disabled={buttonState === 'exiting'}
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <TrendingUp className={`w-5 h-5 transition-all duration-300 ${
                    buttonState === 'entering' ? 'animate-bounce' : 
                    buttonState === 'visible' ? 'animate-pulse' : ''
                  }`} />
                  <span className="font-bold">Economize levando mais!</span>
                  <span className="bg-green-700 bg-opacity-80 px-2 py-1 rounded-full text-xs text-green-50">
                    {upgradesLength} {upgradesLength === 1 ? 'produto' : 'produtos'}
                  </span>
                </div>

                {/* Particle effects para entrada */}
                {buttonState === 'entering' && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                        style={{
                          left: `${20 + (i * 12)}%`,
                          top: '50%',
                          animation: `sparkleEffect 0.8s ease-out ${i * 0.1}s forwards`
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            )}
            
            <button
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                totalQuantity >= 30
                  ? 'bg-[#FC6D36] text-white hover:bg-[#e55a2b]'
                  : 'bg-gray-400 text-white cursor-pointer hover:bg-gray-500'
              }`}
              onClick={handleFinalizePedido}
            >
              {totalQuantity >= 30 ? 'Finalizar Pedido' : `⚠️ Faltam ${30 - totalQuantity} itens`}
            </button>
            
            {totalQuantity < 30 && (
              <p 
                ref={minimumOrderRef}
                className="text-xs text-gray-500 text-center transition-all duration-300"
              >
                Pedido mínimo: 30 peças
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      <EconomizerModal
        isOpen={showEconomizerModal}
        onClose={() => setShowEconomizerModal(false)}
        eligibleItems={eligibleUpgrades}
      />

      {/* Order Completion Sidebar */}
      <OrderCompletionSidebar
        isOpen={showOrderCompletion}
        onClose={handleCloseCompletion}
        onBack={handleBackToCart}
        orderNumber={currentOrderNumber}
        subtotal={orderData.subtotal}
        itemsCount={orderData.itemsCount}
      />
      
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}