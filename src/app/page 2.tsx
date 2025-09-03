'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/products/ProductCard'
import ProductVariationModal from '@/components/products/ProductVariationModal'
import UnlockPricesModal from '@/components/ui/UnlockPricesModal'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useSession } from '@/contexts/SessionContext'
import { useCartStore } from '@/stores/useCartStore'
import { formatPrice } from '@/lib/utils'
import { 
  PhoneIcon, 
  TodosProdutosIcon, 
  BoxIcon, 
  ShoppingCartIcon,
  CapasIcon,
  PeliculaIcon,
  FonesIcon,
  FonesBluetoothIcon,
  CaixasSomIcon,
  CabosIcon,
  CarregadoresIcon,
  SuportesIcon,
  CarregadoresVeicularIcon,
  SmartwatchCustomIcon,
  AdapterIcon,
  CarChargerIcon
} from '@/components/ui/Icons'

// Função para obter o ícone correto para cada categoria
const getCategoryIcon = (categoryName: string, size: number = 30) => {
  const name = categoryName.toLowerCase()
  
  if (name.includes('capa') || name.includes('case') || name.includes('capinha')) {
    return <CapasIcon size={size} />
  }
  if (name.includes('película') || name.includes('protetor') || name.includes('vidro')) {
    return <PeliculaIcon size={size} />
  }
  if (name.includes('fone') && name.includes('bluetooth')) {
    return <FonesBluetoothIcon size={size} />
  }
  if (name.includes('fone')) {
    return <FonesIcon size={size} />
  }
  if (name.includes('caixa') && name.includes('som')) {
    return <CaixasSomIcon size={size} />
  }
  if (name.includes('cabo') || name.includes('usb')) {
    return <CabosIcon size={size} />
  }
  if (name.includes('carregador') && (name.includes('veicular') || name.includes('carro'))) {
    return <CarregadoresVeicularIcon size={size} />
  }
  if (name.includes('carregador')) {
    return <CarregadoresIcon size={size} />
  }
  if (name.includes('suporte') && (name.includes('veicular') || name.includes('carro'))) {
    return <CarChargerIcon size={size} />
  }
  if (name.includes('suporte')) {
    return <SuportesIcon size={size} />
  }
  if (name.includes('smart') || name.includes('watch') || name.includes('relógio')) {
    return <SmartwatchCustomIcon size={size} />
  }
  if (name.includes('adaptador')) {
    return <AdapterIcon size={size} />
  }
  
  // Ícone padrão
  return <BoxIcon size={size} />
}

export default function Home() {
  const { unlocked } = useSession()
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<any>(null)
  const [showVariationModal, setShowVariationModal] = useState(false)
  const [navigationTimer, setNavigationTimer] = useState<NodeJS.Timeout | null>(null)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar categorias
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  // Carregar produtos
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    // Se há um termo de busca, pesquisar em todos os produtos (ignorar categoria selecionada)
    if (searchTerm) {
      params.append('search', searchTerm)
    } else if (selectedCategory) {
      params.append('categoryId', selectedCategory)
    }

    fetch(`/api/products?${params}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(error => {
        console.error(error)
        setLoading(false)
      })
  }, [selectedCategory, searchTerm])

  // Iniciar timer de 30 segundos quando o usuário navegar sem ter preços liberados
  useEffect(() => {
    if (!unlocked && products.length > 0 && mounted) {
      // Limpar timer anterior se existir
      if (navigationTimer) {
        clearTimeout(navigationTimer)
      }
      
      // Criar novo timer de 30 segundos
      const timer = setTimeout(() => {
        setShowUnlockModal(true)
      }, 30000) // 30 segundos
      
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        showMenuButton={true}
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
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`interactive w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                    !selectedCategory
                      ? 'text-white'
                      : 'hover:bg-gray-50'
                  }`}
                  style={!selectedCategory ? {
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  } : {
                    color: 'var(--muted-foreground)'
                  }}
                >
                  <TodosProdutosIcon size={16} />
                  <span>Todos os Produtos</span>
                </button>
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
                      {getCategoryIcon(category.name, 16)}
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

            {/* B2B Benefits */}
            <div className="card mt-6 p-6 animate-fade-in">
              <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--foreground)' }}>
                Por que PMCELL?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--orange)' }}></div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Preços imbatíveis no atacado
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }}></div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Entrega rápida em SP
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }}></div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Produtos originais garantidos
                  </p>
                </div>
              </div>
            </div>
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
                    <button
                      onClick={() => {
                        setSelectedCategory(null)
                        setMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        !selectedCategory
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      Todos os Produtos
                    </button>
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
            <div className="card mb-8 p-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    {selectedCategory ? (
                      <div style={{ color: 'var(--orange)' }}>
                        {getCategoryIcon(categories.find(c => c.id === selectedCategory)?.name || '', 28)}
                      </div>
                    ) : (
                      <TodosProdutosIcon size={28} className="text-[#f97316]" />
                    )}
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                      {selectedCategory
                        ? categories.find(c => c.id === selectedCategory)?.name
                        : 'Catálogo Completo'}
                    </h1>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {products.length} produtos disponíveis
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                    Pedido mínimo
                  </div>
                  <div className="text-xl font-bold" style={{ color: 'var(--orange)' }}>
                    30 peças
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square rounded-t-xl" style={{ background: 'var(--muted)' }} />
                    <div className="p-4">
                      <div className="h-4 rounded mb-3" style={{ background: 'var(--muted)' }} />
                      <div className="h-3 rounded w-2/3 mb-4" style={{ background: 'var(--muted)' }} />
                      <div className="h-10 rounded" style={{ background: 'var(--muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
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
                  <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
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
                    <TodosProdutosIcon size={16} />
                    Ver Todos os Produtos
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

      {/* Footer */}
      <Footer />
    </div>
  )
}