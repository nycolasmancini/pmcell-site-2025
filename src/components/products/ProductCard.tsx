'use client'

import { useState, useEffect, useRef, lazy, Suspense, memo } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/stores/useCartStore'
import { useSession } from '@/contexts/SessionContext'
import { formatPrice, sanitizeImageUrl } from '@/lib/utils'
import { generateOptimizedUrl, isCloudinaryUrl } from '@/lib/cloudinary'

// Lazy load do modal para otimização
const ProductDetailsModal = lazy(() => import('./ProductDetailsModal'))


interface ProductCardProps {
  product: {
    id: string
    name: string
    subname?: string
    description?: string
    brand?: string
    category?: string | { name: string }
    image?: string
    images?: Array<{ id: string; url: string; isMain: boolean; thumbnailUrl?: string; normalUrl?: string }>
    price: number
    superWholesalePrice?: number
    superWholesaleQuantity?: number
    specialPrice?: number
    specialQuantity?: number
    boxQuantity?: number
    hasModels?: boolean
    isModalProduct?: boolean
    quickAddIncrement?: number
    priceRange?: {
      min: number
      max: number
      superWholesaleMin?: number
      superWholesaleMax?: number
    }
  }
  onSelectModels?: () => void
  onUnlockPrices?: () => void
}

const ProductCard = memo(function ProductCard({ product, onSelectModels, onUnlockPrices }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const { unlocked } = useSession()
  const [quantity, setQuantity] = useState<number | string>(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Função para obter quantidade no carrinho para este produto
  const getCartQuantity = (): number => {
    const cartItem = cartItems.find(item => item.productId === product.id && !item.modelId)
    return cartItem ? cartItem.quantity : 0
  }

  const createRippleEffect = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const ripple = document.createElement('div')
    ripple.className = 'ripple-effect'
    ripple.style.width = '10px'
    ripple.style.height = '10px'
    ripple.style.left = `${x - 5}px`
    ripple.style.top = `${y - 5}px`

    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (product.hasModels || product.isModalProduct) {
      onSelectModels?.()
      return
    }

    if (isAnimating) return

    // Create ripple effect
    createRippleEffect(event)

    // Start animation sequence
    setIsAnimating(true)
    
    // Add haptic feedback simulation (button pulse)
    if (buttonRef.current) {
      buttonRef.current.classList.add('btn-add-to-cart-animate')
    }

    const unitPrice = product.price
    const finalQuantity = typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity
    
    // Add to cart after short delay to show button animation
    setTimeout(() => {
      addItem({
        productId: product.id,
        name: product.name,
        subname: product.subname,
        image: imageUrl || undefined,
        quantity: finalQuantity,
        unitPrice,
        specialPrice: product.specialPrice,
        specialQuantity: product.specialQuantity,
        superWholesalePrice: product.superWholesalePrice,
        superWholesaleQuantity: product.superWholesaleQuantity
      })

      // Show success state
      setShowSuccess(true)
      if (buttonRef.current) {
        buttonRef.current.classList.remove('btn-add-to-cart-animate')
        buttonRef.current.classList.add('btn-add-to-cart-success', 'btn-success-state')
      }

      // Reset after success animation
      setTimeout(() => {
        setShowSuccess(false)
        setIsAnimating(false)
        setQuantity(1)
        if (buttonRef.current) {
          buttonRef.current.classList.remove('btn-add-to-cart-success', 'btn-success-state')
        }
      }, 1200)
    }, 300)
  }

  const numericQuantity = typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity
  const cartQuantity = getCartQuantity()
  
  // Calcular preço que será aplicado considerando quantidade atual + nova quantidade
  const totalQuantityAfterAdd = cartQuantity + numericQuantity
  const willReachWholesaleQuantity = product.superWholesaleQuantity && totalQuantityAfterAdd >= product.superWholesaleQuantity
  const hasReachedWholesaleQuantity = product.superWholesaleQuantity && cartQuantity >= product.superWholesaleQuantity
  
  const currentPrice = hasReachedWholesaleQuantity && product.superWholesalePrice
    ? product.superWholesalePrice
    : product.price
    
  const priceAfterAdd = willReachWholesaleQuantity && product.superWholesalePrice
    ? product.superWholesalePrice
    : product.price

  // Obter a URL da imagem principal com otimização para Cloudinary
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0]
  const rawImageUrl = mainImage
    ? (mainImage.normalUrl || mainImage.thumbnailUrl || mainImage.url)
    : product.image
  
  // Otimizar URL se for do Cloudinary, senão sanitizar
  let imageUrl: string | null = null
  if (rawImageUrl) {
    if (isCloudinaryUrl(rawImageUrl)) {
      // Extrair public_id e gerar URL otimizada
      const publicIdMatch = rawImageUrl.match(/\/image\/upload\/(?:v\d+\/)?([^.]+)/)
      if (publicIdMatch) {
        imageUrl = generateOptimizedUrl(publicIdMatch[1], 400, 400, 'auto:good')
      } else {
        imageUrl = rawImageUrl
      }
    } else {
      imageUrl = sanitizeImageUrl(rawImageUrl)
    }
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fade-in w-full flex flex-col h-full">
      <div 
        className="aspect-square relative cursor-pointer group/image" 
        style={{ background: 'var(--muted)' }}
        onClick={() => setShowDetailsModal(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setShowDetailsModal(true)
          }
        }}
        aria-label="Ver detalhes do produto"
      >
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-300 group-hover/image:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
              quality={85}
            />
            {!imageLoading && (
              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                <div className="bg-white/90 rounded-full p-2 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {product.boxQuantity && (
          <div 
            className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
            style={{ 
              background: 'var(--orange)', 
              color: 'var(--surface)' 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            {product.boxQuantity}x
          </div>
        )}
        
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="font-semibold line-clamp-2 mb-1 text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>
          {product.name}
        </h3>
        {product.subname && (
          <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {product.subname}
          </p>
        )}
        

        {unlocked ? (
          <div className="mt-3 flex flex-col flex-grow">
            <div className="flex-grow"></div>
            <div className="mt-auto">
            <div className="mb-4">
              {product.isModalProduct && product.priceRange ? (
                <div>
                  {/* Range de preços atacado */}
                  <div className={`mb-2 ${product.priceRange.min !== product.priceRange.max ? 'flex justify-center' : 'flex items-baseline gap-2'}`}>
                    <span 
                      className={`font-bold ${product.priceRange.min !== product.priceRange.max ? 'product-card-price-range' : 'text-lg sm:text-xl'}`}
                      style={{ 
                        color: 'var(--foreground)',
                        ...(product.priceRange.min !== product.priceRange.max ? {} : {})
                      }}
                    >
                      {product.priceRange.min === product.priceRange.max 
                        ? formatPrice(product.priceRange.min)
                        : `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                      }
                    </span>
                  </div>
                  
                  {/* Range de preços super atacado */}
                  {product.priceRange.superWholesaleMin && product.priceRange.superWholesaleMax && (
                    <div className="py-1 px-2 rounded-lg mb-2" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                      <div className="flex flex-col items-center">
                        <p className="text-xs font-medium text-center" style={{ color: 'var(--green)' }}>
                          Pacote ({product.quickAddIncrement || 25} un.)
                        </p>
                        <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                          {product.priceRange.superWholesaleMin === product.priceRange.superWholesaleMax
                            ? formatPrice(product.priceRange.superWholesaleMin)
                            : `${formatPrice(product.priceRange.superWholesaleMin)} - ${formatPrice(product.priceRange.superWholesaleMax)}`
                          } / un
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Preço principal */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span 
                      key={`${product.id}-${currentPrice}`}
                      className="text-lg sm:text-xl font-bold transition-all duration-500 ease-in-out animate-price-change"
                      style={{
                        color: hasReachedWholesaleQuantity && product.superWholesalePrice ? 'var(--green)' : 'var(--foreground)',
                        animation: 'fadeInPrice 0.5s ease-in-out'
                      }}
                    >
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      unidade
                    </span>
                  </div>
                  
                  {/* Preço de super atacado e preview */}
                  {product.superWholesalePrice && product.superWholesaleQuantity && (
                    <div>
                      {(
                        <div className="py-1 px-2 rounded-lg mb-2" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                          <div className="flex flex-col items-center">
                            <p className="text-xs font-medium text-center" style={{ color: 'var(--green)' }}>
                              <span className="sm:hidden">+{product.superWholesaleQuantity} unidades</span>
                              <span className="hidden sm:inline">A partir de {product.superWholesaleQuantity} unidades</span>
                            </p>
                            <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                              {formatPrice(product.superWholesalePrice)} / un 
                              <span style={{ color: 'var(--green)' }} className="ml-1 font-medium">
                                ({Math.round((1 - product.superWholesalePrice / product.price) * 100)}%)
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      
                    </div>
                  )}
                </div>
              )}
            </div>

            {product.isModalProduct ? (
              <div className="space-y-2 sm:space-y-3">
                {/* Espaçamento invisível equivalente aos controles de quantidade */}
                <div className="flex items-center justify-center">
                  <div className="invisible flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid transparent' }}>
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 text-base font-bold">-</div>
                    <div className="w-12 sm:w-14 text-center py-2 sm:py-2.5 text-base font-medium">1</div>
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 text-base font-bold">+</div>
                  </div>
                </div>
                
                <button
                  ref={buttonRef}
                  onClick={handleAddToCart}
                  className="btn-primary w-full interactive flex items-center justify-center gap-2"
                  style={{ 
                    background: 'var(--primary)', 
                    color: 'var(--primary-foreground)'
                  }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    strokeWidth="1.5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 21H20.4C20.7314 21 21 20.7314 21 20.4V3.6C21 3.26863 20.7314 3 20.4 3H3.6C3.26863 3 3 3.26863 3 3.6V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.5 20.5L12 12M12 12V16M12 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium">Escolher</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {/* Quantidade */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => {
                        const currentNum = typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity
                        setQuantity(Math.max(1, currentNum - 1))
                      }}
                      className="interactive px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-accent text-base font-bold"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const value = e.target.value
                        // Permite campo vazio temporariamente para digitar
                        if (value === '') {
                          setQuantity('')
                          return
                        }
                        // Converte para número e valida
                        const numValue = parseInt(value)
                        if (!isNaN(numValue) && numValue > 0) {
                          setQuantity(numValue)
                        }
                      }}
                      onBlur={(e) => {
                        // Garante que nunca fica vazio ou zero quando perde o foco
                        const value = e.target.value
                        if (value === '' || parseInt(value) <= 0) {
                          setQuantity(1)
                        }
                      }}
                      min="1"
                      className="w-12 sm:w-14 text-center py-2 sm:py-2.5 text-base font-medium border-x"
                      style={{ 
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <button
                      onClick={() => {
                        const currentNum = typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity
                        setQuantity(currentNum + 1)
                      }}
                      className="interactive px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-accent text-base font-bold"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button
                  ref={buttonRef}
                  onClick={handleAddToCart}
                  disabled={isAnimating}
                  className={`btn-primary w-full interactive flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-300 ${
                    isAnimating ? 'cursor-not-allowed' : ''
                  }`}
                  style={{ 
                    background: showSuccess ? 'var(--green)' : 'var(--primary)', 
                    color: 'var(--primary-foreground)',
                    opacity: isAnimating ? 0.9 : 1
                  }}
                >
                  {showSuccess ? (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                        className="checkmark-animate"
                      >
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span className="font-medium">Adicionado!</span>
                    </>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5"
                        className={isAnimating ? 'cart-icon-bounce' : ''}
                      >
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <span className="font-medium text-sm sm:text-base">
                        {product.hasModels || product.isModalProduct ? 'Escolher' : (isAnimating ? 'Adicionando...' : 'Adicionar')}
                      </span>
                      {typeof quantity === 'number' && quantity > 1 && !isAnimating && (
                        <span 
                          className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold quantity-pop"
                          style={{ background: 'rgba(255,255,255,0.2)' }}
                        >
                          {quantity}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            )}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-col flex-grow">
            <div className="flex-grow"></div>
            <div className="mt-auto">
            <div className="text-center p-4" style={{ background: 'var(--muted)', borderRadius: '8px' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Preços para lojistas
              </p>
              <button
                onClick={onUnlockPrices}
                className="btn-primary w-full interactive"
                style={{ background: 'var(--orange)', color: 'var(--surface)' }}
              >
                Acessar
              </button>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhes - renderizado condicionalmente */}
      {showDetailsModal && (
        <Suspense fallback={null}>
          <ProductDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            product={product}
          />
        </Suspense>
      )}
    </div>
  )
})

export default ProductCard

