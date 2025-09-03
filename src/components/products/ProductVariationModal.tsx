'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { useCartStore } from '@/stores/useCartStore'
import { formatPrice } from '@/lib/utils'
import { StableQuantityInput } from './StableQuantityInput'

interface ProductModel {
  id: string
  brandName: string
  modelName: string
  price: number
  superWholesalePrice?: number
  specialQuantity?: number
}

interface SelectedModel {
  modelId: string
  brandName: string
  modelName: string
  price: number
  superWholesalePrice?: number
  quantity: number
}

interface ProductVariationModalProps {
  product: {
    id: string
    name: string
    description?: string
    image?: string
    images?: Array<{ id: string; url: string; isMain: boolean }>
    quickAddIncrement?: number
    priceRange?: {
      min: number
      max: number
      superWholesaleMin?: number
      superWholesaleMax?: number
    }
    isModalProduct?: boolean
  }
  isOpen: boolean
  onClose: () => void
}

// Função de comparação otimizada - ignorar currentQuantity durante edição
const areModelItemPropsEqual = (
  prevProps: any,
  nextProps: any
): boolean => {
  // Se estiver editando, ignorar mudanças de quantidade para evitar re-render
  if (prevProps.isEditing || nextProps.isEditing) {
    return (
      prevProps.model.id === nextProps.model.id &&
      prevProps.isEditing === nextProps.isEditing
    )
  }
  
  return (
    prevProps.model.id === nextProps.model.id &&
    prevProps.currentQuantity === nextProps.currentQuantity &&
    prevProps.product.quickAddIncrement === nextProps.product.quickAddIncrement &&
    prevProps.isEditing === nextProps.isEditing
  )
}

// Componente para cada item de modelo - simplificado
const ModelItem = memo(({ 
  model, 
  product,
  currentQuantity,
  isEditing,
  onQuantityChange,
  onEditingChange
}: {
  model: ProductModel
  product: ProductVariationModalProps['product']
  currentQuantity: number
  isEditing: boolean
  onQuantityChange: (modelId: string, quantity: number) => void
  onEditingChange: (isEditing: boolean) => void
}) => {
  
  return (
    <div className="model-item relative z-10">
      {/* Badge verde mobile - canto superior direito */}
      {currentQuantity > 0 && (
        <div 
          className="sm:hidden absolute top-1 right-1 z-20 px-1.5 py-0.5 bg-green-500 text-white rounded-full font-medium text-[10px] flex items-center justify-center shadow-sm"
          style={{
            minWidth: currentQuantity >= 100000 ? '3.5rem' : 
                     currentQuantity >= 10000 ? '3rem' : 
                     currentQuantity >= 1000 ? '2.5rem' : 
                     currentQuantity >= 100 ? '2rem' : 
                     currentQuantity >= 10 ? '1.75rem' : '1.25rem',
            whiteSpace: 'nowrap',
            transition: isEditing ? 'none' : 'all 0.2s ease-in-out',
            minHeight: '18px',
            lineHeight: '1',
            textAlign: 'center'
          }}
          title={`${currentQuantity} unidades no carrinho`}
        >
          {currentQuantity.toLocaleString()}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <h4 className="text-sm sm:text-base font-medium text-gray-900">{model.modelName}</h4>
            {/* Badge verde desktop - ao lado do nome */}
            {currentQuantity > 0 && (
              <div 
                className="hidden sm:flex px-2 py-0.5 bg-green-500 text-white rounded-full font-medium text-xs items-center justify-center shadow-sm"
                style={{
                  minWidth: currentQuantity >= 100000 ? '4rem' : 
                           currentQuantity >= 10000 ? '3.5rem' : 
                           currentQuantity >= 1000 ? '3rem' : 
                           currentQuantity >= 100 ? '2.5rem' : 
                           currentQuantity >= 10 ? '2rem' : '1.5rem',
                  whiteSpace: 'nowrap',
                  transition: isEditing ? 'none' : 'all 0.2s ease-in-out',
                  minHeight: '20px',
                  lineHeight: '1',
                  textAlign: 'center'
                }}
                title={`${currentQuantity} unidades no carrinho`}
              >
                {currentQuantity.toLocaleString()} un.
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-0.5 sm:gap-1">
            {(() => {
              // Sempre usar o preço individual do modelo, independente se é modalProduct
              const increment = product.quickAddIncrement || 1
              const hasReachedSuperWholesale = model.superWholesalePrice && currentQuantity >= increment
              const currentPrice = hasReachedSuperWholesale ? (model.superWholesalePrice || 0) : (model.price || 0)
              
              return (
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span 
                    key={`${model.id}-${hasReachedSuperWholesale}`}
                    className={`text-sm sm:text-lg font-bold text-gray-900 ${
                      isEditing ? '' : 'transition-all duration-500 ease-in-out animate-price-change'
                    }`}
                    style={{
                      animation: isEditing ? 'none' : 'fadeInPrice 0.5s ease-in-out'
                    }}
                  >
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    unidade
                  </span>
                </div>
              )
            })()}
            {/* Super wholesale info para todos os modelos que tenham essa informação */}
            {model.superWholesalePrice && (
              <div className="text-xs sm:text-sm text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap inline-flex items-center gap-1" style={{minHeight: '18px', lineHeight: '1'}}>
                <span className="font-bold">+{product.quickAddIncrement || 1} un.:</span>
                <span className="font-normal">{formatPrice(model.superWholesalePrice || 0)}</span>
              </div>
            )}
            
          </div>
        </div>
        
        {/* Quantity Controls alinhados à direita - COMPONENTE ESTÁVEL */}
        <StableQuantityInput
          modelId={model.id}
          currentQuantity={currentQuantity}
          onQuantityCommit={onQuantityChange}
          onEditingChange={onEditingChange}
          isDisabled={false}
          className="ml-1 sm:ml-4"
        />
      </div>
    </div>
  )
}, areModelItemPropsEqual)

ModelItem.displayName = 'ModelItem'

export default function ProductVariationModal({ product, isOpen, onClose }: ProductVariationModalProps) {
  const [models, setModels] = useState<ProductModel[]>([])
  const [groupedModels, setGroupedModels] = useState<Record<string, ProductModel[]>>({})
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  // Estado para controlar qual modelo está sendo editado
  const [editingModelId, setEditingModelId] = useState<string | null>(null)
  // Estado para animação do total
  const [totalChanged, setTotalChanged] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const cartItems = useCartStore((state) => state.items)
  

  // Função para obter quantidade no carrinho por modelId
  const getCartQuantityByModel = useCallback((modelId: string): number => {
    const cartItem = cartItems.find(item => 
      item.productId === product.id && item.modelId === modelId
    )
    return cartItem ? cartItem.quantity : 0
  }, [cartItems, product.id])

  // Função para obter o item do carrinho por modelId
  const getCartItemByModel = useCallback((modelId: string) => {
    return cartItems.find(item => 
      item.productId === product.id && item.modelId === modelId
    )
  }, [cartItems, product.id])

  // Memoizar dependências estáveis
  const stableProductData = useMemo(() => ({
    id: product.id,
    name: product.name,
    quickAddIncrement: product.quickAddIncrement,
    mainImageUrl: product.images?.find(img => img.isMain)?.url || product.images?.[0]?.url || product.image
  }), [product.id, product.name, product.quickAddIncrement, product.images, product.image])

  // Callback otimizado - sem estados desnecessários
  const handleQuantityCommit = useCallback((modelId: string, newQuantity: number) => {
    const model = models.find(m => m.id === modelId)
    if (!model) return

    const existingItem = getCartItemByModel(modelId)

    if (newQuantity === 0) {
      if (existingItem) {
        updateQuantity(existingItem.id, 0)
      }
    } else if (existingItem) {
      updateQuantity(existingItem.id, newQuantity)
    } else {
      addItem({
        productId: stableProductData.id,
        name: stableProductData.name,
        subname: `${model.brandName} ${model.modelName}`,
        image: stableProductData.mainImageUrl,
        quantity: newQuantity,
        unitPrice: model.price,
        specialPrice: model.superWholesalePrice,
        specialQuantity: stableProductData.quickAddIncrement,
        superWholesalePrice: model.superWholesalePrice,
        superWholesaleQuantity: stableProductData.quickAddIncrement,
        modelId: model.id,
        modelName: `${model.brandName} ${model.modelName}`
      })
    }
  }, [models, stableProductData, getCartItemByModel, updateQuantity, addItem])

  // Função para obter quantidade para exibição - apenas do carrinho
  const getDisplayQuantity = useCallback((modelId: string): number => {
    return getCartQuantityByModel(modelId)
  }, [getCartQuantityByModel])


  // Callback estável para gerenciar estado de edição
  const handleEditingChange = useCallback((modelId: string, isEditing: boolean) => {
    setEditingModelId(isEditing ? modelId : null)
  }, [])

  // Factory function para criar callback estável por modelo
  const createEditingChangeHandler = useCallback((modelId: string) => {
    return (isEditing: boolean) => handleEditingChange(modelId, isEditing)
  }, [handleEditingChange])

  // Cache de callbacks para evitar recriação desnecessária
  const editingChangeHandlers = useRef<Map<string, (isEditing: boolean) => void>>(new Map())
  
  // Função para obter callback estável para um modelo específico
  const getEditingChangeHandler = useCallback((modelId: string) => {
    if (!editingChangeHandlers.current.has(modelId)) {
      editingChangeHandlers.current.set(modelId, createEditingChangeHandler(modelId))
    }
    return editingChangeHandlers.current.get(modelId)!
  }, [createEditingChangeHandler])

  // Handle close with animation
  const handleClose = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    
    setTimeout(() => {
      onClose()
      setIsAnimating(false)
    }, 200)
  }, [onClose, isAnimating])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }, [handleClose])

  // Focus trap for accessibility
  const handleTabKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keydown', handleTabKeyPress)
      document.body.style.overflow = 'hidden'
      
      // Focus first interactive element apenas se não há elemento já focado ou sendo editado
      setTimeout(() => {
        const activeElement = document.activeElement
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.hasAttribute('data-no-auto-focus')
        )
        
        if (!activeElement || activeElement === document.body || !isInputFocused) {
          const firstButton = modalRef.current?.querySelector('button')
          if (firstButton && !document.querySelector('input:focus')) {
            firstButton.focus()
          }
        }
      }, 100)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleTabKeyPress)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown, handleTabKeyPress])


  // Função para calcular total de produtos por marca no carrinho
  const getTotalQuantityByBrand = useCallback((brandName: string): number => {
    const brandModels = groupedModels[brandName] || []
    return brandModels.reduce((total, model) => {
      const cartQty = getDisplayQuantity(model.id)
      return total + cartQty
    }, 0)
  }, [groupedModels, getDisplayQuantity])


  // Effect para buscar modelos quando modal abre
  useEffect(() => {
    if (isOpen) {
      fetchProductModels()
    }
  }, [isOpen, product.id])

  const fetchProductModels = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${product.id}/models`)
      if (response.ok) {
        const data = await response.json()
        setModels(data)
        
        // Agrupar por marca e ordenar
        const grouped = data.reduce((acc: Record<string, ProductModel[]>, model: ProductModel) => {
          if (!acc[model.brandName]) {
            acc[model.brandName] = []
          }
          acc[model.brandName].push(model)
          return acc
        }, {})
        
        // Ordenar modelos dentro de cada marca
        Object.keys(grouped).forEach(brandName => {
          grouped[brandName].sort((a: any, b: any) => a.modelName.localeCompare(b.modelName))
        })
        
        setGroupedModels(grouped)
        
        // Iniciar com todas as marcas fechadas - usuário clica para expandir
        const expandedState: Record<string, boolean> = {}
        Object.keys(grouped).forEach(brandName => {
          expandedState[brandName] = false
        })
        setExpandedBrands(expandedState)
      }
    } catch (error) {
      console.error('Erro ao buscar modelos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBrandExpansion = (brandName: string) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brandName]: !prev[brandName]
    }))
  }

  // Callbacks removidos - agora usando funções inline estáveis através do memo customizado




  const getTotalItems = useCallback(() => {
    return models.reduce((total, model) => {
      const cartQty = getDisplayQuantity(model.id)
      return total + cartQty
    }, 0)
  }, [models, getDisplayQuantity])

  const getTotalValue = useCallback(() => {
    const newTotal = models.reduce((total, model) => {
      const cartQty = getDisplayQuantity(model.id)
      if (cartQty === 0) return total
      
      // Calcular preço baseado na quantidade específica deste modelo
      const increment = product.quickAddIncrement || 1
      const useSuperPrice = model.superWholesalePrice && cartQty >= increment
      const priceToUse = useSuperPrice ? (model.superWholesalePrice || model.price) : model.price
      
      return total + (priceToUse * cartQty)
    }, 0)
    
    return newTotal
  }, [models, product.quickAddIncrement, getDisplayQuantity])

  // Efeito para animação do total quando muda
  const totalValue = getTotalValue()
  const totalItems = getTotalItems()
  
  useEffect(() => {
    if (totalValue > 0) {
      setTotalChanged(true)
      const timer = setTimeout(() => setTotalChanged(false), 500)
      return () => clearTimeout(timer)
    }
  }, [totalValue, totalItems])

  if (!isOpen) return null

  return (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-0' : 'opacity-100 animate-fade-in'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
          isAnimating 
            ? 'scale-95 opacity-0 translate-y-4' 
            : 'scale-100 opacity-100 translate-y-0 animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        
        {/* Scrollable Content with Sticky Headers - Mais espaço sem header */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] sm:max-h-[calc(90vh-80px)] custom-scrollbar modal-content-scroll relative">
            
          {loading ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 opacity-10 animate-pulse"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Carregando modelos...</p>
              <div className="mt-2 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-6 pt-2 space-y-3 sm:space-y-6 animate-slide-up">
              {Object.entries(groupedModels)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([brandName, brandModels], index) => (
                <div 
                  key={brandName} 
                  className="border-b border-gray-200 last:border-b-0 sm:border sm:rounded-xl sm:shadow-sm sm:hover:shadow-md transition-all duration-300 ease-out sm:transform sm:hover:-translate-y-1"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  {/* Brand Header - Sticky */}
                  <button
                    onClick={() => toggleBrandExpansion(brandName)}
                    className={`brand-header w-full px-3 sm:px-6 py-3 sm:py-5 transition-all duration-300 ease-out flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset sticky top-0 z-30 ${
                      expandedBrands[brandName] ? 'expanded' : 'collapsed'
                    }`}
                    style={{
                      backgroundColor: expandedBrands[brandName] 
                        ? 'rgba(219, 234, 254, 0.98)' 
                        : 'rgba(248, 250, 252, 0.98)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      boxShadow: expandedBrands[brandName]
                        ? '0 4px 12px rgba(59, 130, 246, 0.15)'
                        : '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-center">
                      {(() => {
                        const totalQuantity = getTotalQuantityByBrand(brandName)
                        return (
                          <>
                            {totalQuantity > 0 && (
                              <div className="hidden sm:flex mr-3 px-3 py-0.5 bg-blue-500 text-white rounded-full font-medium text-sm items-center justify-center shadow-sm" style={{minHeight: '24px', lineHeight: '1', textAlign: 'center'}}>
                                {totalQuantity} un.
                              </div>
                            )}
                            <span className="text-base sm:text-lg font-semibold text-gray-900">{brandName}</span>
                            <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-500">
                              ({brandModels.length} modelo{brandModels.length !== 1 ? 's' : ''})
                            </span>
                          </>
                        )
                      })()}
                    </div>
                    <svg
                      className={`w-5 h-5 transform transition-all duration-300 ease-out ${
                        expandedBrands[brandName] ? 'rotate-180 text-blue-600' : 'text-gray-400'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Models List */}
                  <div className={`transition-all duration-400 ease-out overflow-hidden ${
                    expandedBrands[brandName] 
                      ? 'max-h-[2000px] opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}>
                    <div className={`transform transition-all duration-300 ease-out ${
                      expandedBrands[brandName] 
                        ? 'translate-y-0 opacity-100' 
                        : '-translate-y-2 opacity-0'
                    }`}>
                      {/* Models container com padding interno para criar recuo */}
                      <div className="models-container models-background relative z-10">
                        {brandModels.map((model) => (
                          <ModelItem
                            key={model.id}
                            model={model}
                            product={product}
                            currentQuantity={getDisplayQuantity(model.id)}
                            isEditing={editingModelId === model.id}
                            onQuantityChange={handleQuantityCommit}
                            onEditingChange={getEditingChangeHandler(model.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer fino e fixo */}
        <div 
          data-testid="modal-footer"
          className="border-t border-gray-200 p-2 sm:p-3 bg-white flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {totalItems > 0 && (
              <div className="text-right">
                <span className="text-xs text-gray-600">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
                <span className="ml-2 text-sm font-bold text-blue-600">{formatPrice(totalValue)}</span>
              </div>
            )}
            
            <button 
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Fechar modal"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}