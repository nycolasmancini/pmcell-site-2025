'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import ProductCard from '@/components/products/ProductCard'
import ProductVariationModal from '@/components/products/ProductVariationModal'
import UnlockPricesModal from '@/components/ui/UnlockPricesModal'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useSession } from '@/contexts/SessionContext'
import { useCartStore } from '@/stores/useCartStore'
import { formatPrice } from '@/lib/utils'
import { useAnalytics } from '@/lib/analytics'
import { useCartSync } from '@/hooks/useCartSync'
import { CartRecovery } from '@/components/cart/CartRecovery'
import { EndOfCategoryCard } from '@/components/ui/EndOfCategoryCard'
import { throttle } from '@/utils/debounce'
import { useProductsWithCache } from '@/hooks/useProductsWithCache'
import { ProductsSkeleton } from '@/components/ui/ProductsSkeleton'
import { 
  PhoneIcon, 
  TodosProdutosIcon, 
  BoxIcon, 
  ShoppingCartIcon
} from '@/components/ui/Icons'

// Função para obter o ícone correto para cada categoria

export default function Home() {
  const { unlocked } = useSession()
  const analytics = useAnalytics()
  const { isLoading: cartSyncLoading } = useCartSync()
  const cartItems = useCartStore((state) => state.items)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Usar hook com cache para produtos (resolve o problema de "piscar")
  const { 
    products, 
    loading, 
    error: productsError, 
    hasCache,
    refresh: refreshProducts 
  } = useProductsWithCache(selectedCategory || undefined, searchTerm || undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<any>(null)
  const [showVariationModal, setShowVariationModal] = useState(false)
  const [navigationTimer, setNavigationTimer] = useState<NodeJS.Timeout | null>(null)
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)

  // Throttled refresh function
  const throttledRefresh = useCallback(() => {
    if (!loading) {
      refreshProducts()
    }
  }, [loading, refreshProducts])

  // Calcular quantidade total no carrinho
  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])


  // Carregar categorias
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        // Ensure data is always an array
        const categoriesData = Array.isArray(data) ? data : []
        setCategories(categoriesData)
        
        // Set initial category to "Fones" if not already selected
        if (!selectedCategory && categoriesData.length > 0) {
          const fonesCategory = categoriesData.find(cat => 
            cat.name.toLowerCase().includes('fone')
          )
          if (fonesCategory) {
            setSelectedCategory(fonesCategory.id)
          }
        }
      })
      .catch(error => {
        console.error('Error loading categories:', error)
        setCategories([]) // Set empty array on error
      })
  }, [])

  // Analytics tracking para mudanças de categoria e busca
  useEffect(() => {
    if (searchTerm) {
      analytics.trackSearch(searchTerm)
    } else if (selectedCategory) {
      const categoryData = categories.find(c => c.id === selectedCategory)
      if (categoryData) {
        analytics.trackCategoryVisit(categoryData.name, categoryData.id)
      }
    }
  }, [searchTerm, selectedCategory, categories, analytics])

  // Iniciar timer de 1 minuto quando o usuário navegar sem ter preços liberados
  useEffect(() => {
    if (!unlocked && products.length > 0 && mounted) {
      // Limpar timer anterior se existir
      if (navigationTimer) {
        clearTimeout(navigationTimer)
      }
      
      // Criar novo timer de 1 minuto
      const timer = setTimeout(() => {
        setShowUnlockModal(true)
      }, 60000) // 1 minuto
      
      setNavigationTimer(timer)
    }
    
    // Cleanup do timer ao desmontar ou quando preços são liberados
    return () => {
      if (navigationTimer) {
        clearTimeout(navigationTimer)
        setNavigationTimer(null)
      }
    }
  }, [unlocked, products, mounted])

  // Limpar timer se preços forem liberados
  useEffect(() => {
    if (unlocked && navigationTimer) {
      clearTimeout(navigationTimer)
      setNavigationTimer(null)
    }
  }, [unlocked, navigationTimer])

  // Sistema de refresh automático para novos produtos (30 segundos) - SILENCIOSO E INTELIGENTE  
  useEffect(() => {
    if (mounted && !searchTerm) {
      const timer = setInterval(() => {
        throttledRefresh()
      }, 30000) // 30 segundos
      
      setRefreshTimer(timer)
      
      return () => {
        if (timer) {
          clearInterval(timer)
        }
      }
    }
  }, [mounted, searchTerm, throttledRefresh])

  // Limpar refresh timer quando pesquisar
  useEffect(() => {
    if (searchTerm && refreshTimer) {
      clearInterval(refreshTimer)
      setRefreshTimer(null)
    }
  }, [searchTerm, refreshTimer])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        showMenuButton={true}
        isMenuOpen={menuOpen}
        onLogoClick={() => {
          setSelectedCategory(null)
          setSearchTerm('')
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Categories - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 animate-slide-up">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-center" style={{ color: 'var(--foreground)' }}>
                  Categorias
                </h2>
              </div>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`interactive w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${
                      selectedCategory === category.id
                        ? 'text-white'
                        : 'hover:bg-gray-50'
                    }`}
                    style={selectedCategory === category.id ? {
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)'
                    } : {
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span>{category.name}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Unlock Prices CTA */}
            {!unlocked && (
              <div className="card mt-6 p-6 text-center animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4" style={{ color: 'var(--orange)' }}>
                  <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                  Preços Exclusivos
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Libere os melhores preços de atacado
                </p>
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="btn-primary w-full interactive"
                  style={{ background: 'var(--orange)', color: 'var(--surface)' }}
                >
                  Liberar Preços
                </button>
                <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
                  Pedido mínimo: 30 peças
                </p>
              </div>
            )}

          </aside>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMenuOpen(false)} />
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <h2 className="text-xl font-bold text-orange-600" style={{ color: '#FC6D36' }}>
                      Categorias
                    </h2>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setMenuOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                          selectedCategory === category.id
                            ? 'bg-orange-100 text-orange-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            <div 
              className="card mb-8 min-h-[100px] flex items-center justify-center py-2 px-4 lg:py-4 lg:px-6 animate-slide-up cursor-pointer hover:shadow-lg transition-shadow"
              onClick={(event) => {
                const heroCard = event.currentTarget
                const header = document.querySelector('header')
                const headerHeight = header ? header.offsetHeight : 64
                const scrollTarget = heroCard.offsetTop + heroCard.offsetHeight - headerHeight
                window.scrollTo({
                  top: scrollTarget,
                  behavior: 'smooth'
                })
              }}
            >
              {/* Mobile Layout */}
              <div className="lg:hidden flex flex-col items-center justify-center text-center w-full">
                <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {selectedCategory
                    ? categories.find(c => c.id === selectedCategory)?.name
                    : 'Produtos'}
                </h1>
                {totalCartQuantity < 30 && (
                  <div className="text-xs font-medium mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    Pedido mínimo: <span className="font-bold" style={{ color: 'var(--orange)' }}>30 peças</span>
                  </div>
                )}
              </div>

              {/* Desktop Layout - Centered Title */}
              <div className="hidden lg:block relative">
                <div className="flex justify-center">
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {selectedCategory
                      ? categories.find(c => c.id === selectedCategory)?.name
                      : 'Produtos'}
                  </h1>
                </div>
                {totalCartQuantity < 30 && (
                  <div className="flex justify-center mt-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Pedido mínimo: <span className="font-bold" style={{ color: 'var(--orange)' }}>30 peças</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading && !hasCache ? (
              <ProductsSkeleton />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectModels={() => {
                        setSelectedProductForVariation(product)
                        setShowVariationModal(true)
                      }}
                      onUnlockPrices={() => setShowUnlockModal(true)}
                    />
                  ))}
                </div>
                {/* Show EndOfCategoryCard only when a category is selected */}
                {selectedCategory && (
                  <EndOfCategoryCard onOpenMenu={() => setMenuOpen(true)} />
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="card p-8 max-w-md mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-sm text-center mb-6" style={{ color: 'var(--muted-foreground)' }}>
                    Tente ajustar os filtros ou buscar por outro termo
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSearchTerm('')
                    }}
                    className="btn-primary interactive flex items-center gap-2 mx-auto"
                    style={{ background: 'var(--orange)', color: 'var(--surface)' }}
                  >
                    Ver Produtos
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Unlock Prices Modal */}
      <UnlockPricesModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
      />

      {/* Product Variation Modal */}
      {selectedProductForVariation && (
        <ProductVariationModal
          product={selectedProductForVariation}
          isOpen={showVariationModal}
          onClose={() => {
            setShowVariationModal(false)
            setSelectedProductForVariation(null)
          }}
        />
      )}

      {/* Cart Recovery Modal */}
      {mounted && <CartRecovery />}

      {/* Footer */}
      <Footer />
    </div>
  )
}