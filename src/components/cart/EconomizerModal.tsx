'use client'

import { useState, useEffect, useRef } from 'react'
import { formatPrice } from '@/lib/utils'
import { useCartStore, type CartItem } from '@/stores/useCartStore'
import { X, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

interface EconomizerModalProps {
  isOpen: boolean
  onClose: () => void
  eligibleItems: CartItem[]
}

export function EconomizerModal({ isOpen, onClose, eligibleItems }: EconomizerModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const updateQuantity = useCartStore((state) => state.updateQuantity)

  useEffect(() => {
    if (isOpen && eligibleItems.length > 0) {
      setShouldRender(true)
      setCurrentIndex(0) // Reset to first item when opened
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
      setTimeout(() => setShouldRender(false), 300)
    }
  }, [isOpen, eligibleItems.length])

  // Close modal automatically if no more eligible items while modal is open
  useEffect(() => {
    if (isOpen && eligibleItems.length === 0) {
      onClose()
    }
  }, [isOpen, eligibleItems.length, onClose])
  
  // Adjust currentIndex if it becomes invalid due to items being removed
  useEffect(() => {
    if (eligibleItems.length > 0 && currentIndex >= eligibleItems.length) {
      setCurrentIndex(eligibleItems.length - 1)
    }
  }, [eligibleItems.length, currentIndex])

  // Navigation functions
  const goToNext = () => {
    if (currentIndex < eligibleItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Drag functions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const diff = e.clientX - dragStart
    setDragOffset(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    // Threshold for slide change (30% of card width)
    const threshold = 150
    
    if (dragOffset > threshold && currentIndex > 0) {
      goToPrev()
    } else if (dragOffset < -threshold && currentIndex < eligibleItems.length - 1) {
      goToNext()
    }
    
    setDragOffset(0)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - dragStart
    setDragOffset(diff)
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  if (!shouldRender) return null

  const quickAddQuantity = (itemId: string, additionalQuantity: number) => {
    const item = eligibleItems.find(i => i.id === itemId)
    if (item) {
      // Set processing state for visual feedback
      setIsProcessing(itemId)
      
      updateQuantity(itemId, item.quantity + additionalQuantity)
      
      // Clear processing state after short delay
      setTimeout(() => {
        setIsProcessing(null)
      }, 1000)
      
      // No automatic navigation - let user control the flow
      // The eligibleItems list will update automatically through the store,
      // and useEffect will handle closing modal if no items remain
    }
  }

  const currentItem = eligibleItems[currentIndex]
  if (!currentItem) return null

  // Calculate current item data
  const hasSpecialPrice = currentItem.specialPrice && currentItem.specialQuantity
  const hasSuperWholesale = currentItem.superWholesalePrice && currentItem.superWholesaleQuantity
  const neededQuantity = hasSpecialPrice ? currentItem.specialQuantity! : currentItem.superWholesaleQuantity!
  const discountPrice = hasSpecialPrice ? currentItem.specialPrice! : currentItem.superWholesalePrice!
  const currentQuantity = currentItem.quantity
  const missingQuantity = neededQuantity - currentQuantity
  const percentageComplete = (currentQuantity / neededQuantity) * 100
  const regularTotalPrice = neededQuantity * currentItem.unitPrice
  const discountTotal = neededQuantity * discountPrice
  const totalSavings = regularTotalPrice - discountTotal
  const savingsPerUnit = currentItem.unitPrice - discountPrice

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[60] transition-all duration-300 ease-out ${
          isVisible 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className={`bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] min-h-[500px] flex flex-col transition-all duration-300 ease-out transform ${
            isVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
            <p className="text-sm font-semibold text-green-700">{currentIndex + 1} de {eligibleItems.length} produtos</p>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Container */}
          <div className="flex-1 relative overflow-hidden overflow-y-auto">
            {/* Navigation Arrows */}
            {eligibleItems.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg transition-all duration-200 ${
                    currentIndex === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-110'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === eligibleItems.length - 1}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg transition-all duration-200 ${
                    currentIndex === eligibleItems.length - 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-110'
                  }`}
                >
                  <ChevronRight className="w-5 h-5 mx-auto" />
                </button>
              </>
            )}

            {/* Carousel Slide */}
            <div 
              ref={carouselRef}
              className={`w-full h-full transition-transform duration-300 ease-out ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex h-full">
                {eligibleItems.map((item, index) => {
                  // Calculate data for each item
                  const itemHasSpecialPrice = item.specialPrice && item.specialQuantity
                  const itemHasSuperWholesale = item.superWholesalePrice && item.superWholesaleQuantity
                  const itemNeededQuantity = itemHasSpecialPrice ? item.specialQuantity! : item.superWholesaleQuantity!
                  const itemDiscountPrice = itemHasSpecialPrice ? item.specialPrice! : item.superWholesalePrice!
                  const itemCurrentQuantity = item.quantity
                  const itemMissingQuantity = itemNeededQuantity - itemCurrentQuantity
                  const itemPercentageComplete = (itemCurrentQuantity / itemNeededQuantity) * 100
                  const itemRegularTotalPrice = itemNeededQuantity * item.unitPrice
                  const itemDiscountTotal = itemNeededQuantity * itemDiscountPrice
                  const itemTotalSavings = itemRegularTotalPrice - itemDiscountTotal
                  const itemSavingsPerUnit = item.unitPrice - itemDiscountPrice

                  return (
                    <div key={item.id} className="w-full flex-shrink-0 p-4 flex flex-col justify-between min-h-full">
                      {/* Product Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{item.name}</h3>
                          {item.subname && <p className="text-sm text-gray-600">{item.subname}</p>}
                          {item.modelName && <p className="text-sm text-blue-600">{item.modelName}</p>}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-green-600">
                            {Math.round(itemPercentageComplete)}%
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            faltam <span className="font-bold text-orange-600">{itemMissingQuantity}</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-[400ms] ease-out"
                            style={{ width: `${itemPercentageComplete}%` }}
                          />
                        </div>
                      </div>

                      {/* Price Comparison */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center shadow-sm">
                          <p className="text-xs font-medium text-gray-600 uppercase">ATUAL</p>
                          <p className="text-base font-bold text-gray-700">
                            {formatPrice(item.unitPrice)} 
                            <span className="text-sm font-normal text-gray-500">/un.</span>
                          </p>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center shadow-sm">
                          <p className="text-xs font-medium text-orange-600 uppercase">ATACADO</p>
                          <p className="text-base font-bold text-orange-600">
                            {formatPrice(itemDiscountPrice)} 
                            <span className="text-sm font-normal text-orange-400">/un.</span>
                          </p>
                        </div>
                      </div>

                      {/* Savings */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3 text-center">
                        <p className="font-bold text-green-800 mb-1">Você vai economizar:</p>
                        <p className="text-2xl font-black text-green-600 mb-2">{formatPrice(itemTotalSavings)}</p>
                        <p className="text-xs text-green-600">
                          {formatPrice(itemSavingsPerUnit)} por unidade × {itemNeededQuantity} unidades
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => quickAddQuantity(item.id, itemMissingQuantity)}
                        disabled={isProcessing === item.id}
                        className={`w-full px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-all transform ${
                          isProcessing === item.id
                            ? 'bg-green-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105'
                        }`}
                      >
                        {isProcessing === item.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>✓ Adicionado!</span>
                          </div>
                        ) : (
                          `Adicionar ${itemMissingQuantity} para ganhar desconto`
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          {eligibleItems.length > 1 && (
            <div className="flex justify-center items-center py-3 gap-2">
              {eligibleItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-orange-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}