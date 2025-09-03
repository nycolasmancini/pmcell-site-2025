import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAnalytics } from '@/lib/analytics'
import { debounce } from '@/utils/debounce'

export interface CartItem {
  id: string
  productId: string
  name: string
  subname?: string
  image?: string
  modelId?: string
  modelName?: string
  quantity: number
  unitPrice: number
  specialPrice?: number
  specialQuantity?: number
  superWholesalePrice?: number
  superWholesaleQuantity?: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  lastSyncTimestamp: number | null
  
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  
  getSubtotal: () => number
  getItemsCount: () => number
  getSavings: () => number
  getEligibleUpgrades: () => CartItem[]
  
  // Novos métodos para sincronização
  syncToServer: () => Promise<void>
  loadFromServer: () => Promise<void>
  setLoading: (loading: boolean) => void
}

// Criar função debounced para sincronização (1.5 segundos após última mudança)
const debouncedSyncToServer = debounce(async () => {
  const store = useCartStore.getState()
  await store.syncToServer()
}, 1500)

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      lastSyncTimestamp: null,
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.modelId === item.modelId
          )
          
          // Track cart event
          if (typeof window !== 'undefined') {
            const analytics = useAnalytics()
            console.log(`🛒 Store: Tracking add event - productId: ${item.productId}, quantity: ${item.quantity}`)
            analytics.trackCartEvent('add', item.productId, item.quantity, item.name, item.unitPrice)
            
            // Sincronizar com servidor (debounced)
            debouncedSyncToServer()
          }
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === existingItem.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          
          return {
            items: [
              ...state.items,
              {
                ...item,
                id: `${item.productId}-${item.modelId || 'default'}-${Date.now()}`,
              },
            ],
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => {
          const item = state.items.find(i => i.id === id)
          
          // Track cart event
          if (item && typeof window !== 'undefined') {
            const analytics = useAnalytics()
            console.log(`🛒 Store: Tracking remove event - productId: ${item.productId}, quantity: ${item.quantity}`)
            analytics.trackCartEvent('remove', item.productId, item.quantity, item.name, item.unitPrice)
            
            // Sincronizar com servidor (debounced)
            debouncedSyncToServer()
          }
          
          return {
            items: state.items.filter((item) => item.id !== id),
          }
        })
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set((state) => {
          const item = state.items.find(i => i.id === id)
          
          // Track cart event
          if (item && typeof window !== 'undefined') {
            const analytics = useAnalytics()
            console.log(`🛒 Store: Tracking update event - productId: ${item.productId}, quantity: ${quantity}`)
            analytics.trackCartEvent('update', item.productId, quantity, item.name, item.unitPrice)
            
            // Sincronizar com servidor (debounced)
            debouncedSyncToServer()
          }
          
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          }
        })
      },
      
      clearCart: () => {
        set({ items: [] })
        
        // Sincronizar com servidor quando limpar carrinho
        if (typeof window !== 'undefined') {
          debouncedSyncToServer()
        }
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },
      
      getSubtotal: () => {
        const state = get()
        
        // Função auxiliar para calcular quantidade total por modelo específico
        const getTotalQuantityByModel = (productId: string, modelId: string): number => {
          return state.items
            .filter(item => item.productId === productId && item.modelId === modelId)
            .reduce((sum, item) => sum + item.quantity, 0)
        }
        
        return state.items.reduce((total, item) => {
          let reachedSpecialQuantity = false
          let reachedSuperWholesaleQuantity = false
          
          // Para produtos modais (com modelId), verificar quantidade agregada do MODELO ESPECÍFICO
          if (item.modelId) {
            const totalModelQuantity = getTotalQuantityByModel(item.productId, item.modelId)
            reachedSpecialQuantity = item.specialQuantity ? totalModelQuantity >= item.specialQuantity : false
            reachedSuperWholesaleQuantity = item.superWholesaleQuantity ? totalModelQuantity >= item.superWholesaleQuantity : false
          } else {
            // Para produtos normais, verificar quantidade individual
            reachedSpecialQuantity = item.specialQuantity ? item.quantity >= item.specialQuantity : false
            reachedSuperWholesaleQuantity = item.superWholesaleQuantity ? item.quantity >= item.superWholesaleQuantity : false
          }
          
          let price = item.unitPrice
          
          // Aplicar o melhor desconto disponível (menor preço)
          if (reachedSpecialQuantity && item.specialPrice && reachedSuperWholesaleQuantity && item.superWholesalePrice) {
            // Se ambos os descontos se aplicam, usar o menor preço
            price = Math.min(item.specialPrice, item.superWholesalePrice)
          } else if (reachedSpecialQuantity && item.specialPrice) {
            price = item.specialPrice
          } else if (reachedSuperWholesaleQuantity && item.superWholesalePrice) {
            price = item.superWholesalePrice
          }
          
          return total + price * item.quantity
        }, 0)
      },
      
      getItemsCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getSavings: () => {
        const state = get()
        
        // Função auxiliar para calcular quantidade total por modelo específico
        const getTotalQuantityByModel = (productId: string, modelId: string): number => {
          return state.items
            .filter(item => item.productId === productId && item.modelId === modelId)
            .reduce((sum, item) => sum + item.quantity, 0)
        }
        
        return state.items.reduce((total, item) => {
          let savings = 0
          const regularTotal = item.unitPrice * item.quantity
          
          let reachedSpecialQuantity = false
          let reachedSuperWholesaleQuantity = false
          
          // Para produtos modais (com modelId), verificar quantidade agregada do MODELO ESPECÍFICO
          if (item.modelId) {
            const totalModelQuantity = getTotalQuantityByModel(item.productId, item.modelId)
            reachedSpecialQuantity = item.specialQuantity ? totalModelQuantity >= item.specialQuantity : false
            reachedSuperWholesaleQuantity = item.superWholesaleQuantity ? totalModelQuantity >= item.superWholesaleQuantity : false
          } else {
            // Para produtos normais, verificar quantidade individual
            reachedSpecialQuantity = item.specialQuantity ? item.quantity >= item.specialQuantity : false
            reachedSuperWholesaleQuantity = item.superWholesaleQuantity ? item.quantity >= item.superWholesaleQuantity : false
          }
          
          // Calcular economia com base no melhor desconto aplicado
          if (reachedSpecialQuantity && item.specialPrice && reachedSuperWholesaleQuantity && item.superWholesalePrice) {
            // Se ambos se aplicam, usar o menor preço
            const bestPrice = Math.min(item.specialPrice, item.superWholesalePrice)
            savings = regularTotal - (bestPrice * item.quantity)
          } else if (reachedSpecialQuantity && item.specialPrice) {
            savings = regularTotal - (item.specialPrice * item.quantity)
          } else if (reachedSuperWholesaleQuantity && item.superWholesalePrice) {
            savings = regularTotal - (item.superWholesalePrice * item.quantity)
          }
          
          return total + savings
        }, 0)
      },
      
      getEligibleUpgrades: () => {
        const state = get()
        
        // Função auxiliar para calcular quantidade total por modelo específico
        const getTotalQuantityByModel = (productId: string, modelId: string): number => {
          return state.items
            .filter(item => item.productId === productId && item.modelId === modelId)
            .reduce((sum, item) => sum + item.quantity, 0)
        }
        
        return state.items.filter(item => {
          // Verificar preços especiais ou super atacado
          const hasSpecialPrice = item.specialPrice && item.specialQuantity
          const hasSuperWholesale = item.superWholesalePrice && item.superWholesaleQuantity
          
          if (!hasSpecialPrice && !hasSuperWholesale) return false
          
          // Obter quantidade correta (agregada do modelo específico para modais, individual para normais)
          const currentQuantity = item.modelId 
            ? getTotalQuantityByModel(item.productId, item.modelId)
            : item.quantity
          
          // Para produtos com preço especial
          if (hasSpecialPrice) {
            const neededQuantity = item.specialQuantity!
            const percentageComplete = (currentQuantity / neededQuantity) * 100
            
            // Mostra se está entre 80% e 99% da quantidade necessária
            if (percentageComplete >= 80 && percentageComplete < 100) return true
          }
          
          // Para produtos com super atacado
          if (hasSuperWholesale) {
            const neededQuantity = item.superWholesaleQuantity!
            const percentageComplete = (currentQuantity / neededQuantity) * 100
            
            // Mostra se está entre 80% e 99% da quantidade necessária
            if (percentageComplete >= 80 && percentageComplete < 100) return true
          }
          
          return false
        })
      },

      // Função para sincronizar carrinho com servidor
      syncToServer: async () => {
        if (typeof window === 'undefined') return

        try {
          const state = get()
          if (state.items.length === 0) {
            console.log('🛒 Store: Carrinho vazio, não sincronizando')
            return
          }

          // Buscar sessionId e analytics
          const analytics = typeof window !== 'undefined' ? useAnalytics() : null
          if (!analytics) return

          const analyticsSnapshot = analytics.getSnapshot()

          const payload = {
            sessionId: analyticsSnapshot.sessionId,
            whatsapp: analyticsSnapshot.whatsappCollected,
            cartData: {
              items: state.items,
              total: state.getSubtotal()
            },
            analyticsData: analyticsSnapshot,
            lastActivity: Date.now()
          }

          console.log('🛒 Store: Sincronizando carrinho com servidor...', {
            items: state.items.length,
            total: state.getSubtotal()
          })

          const response = await fetch('/api/cart/simple-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          })

          if (response.ok) {
            set({ lastSyncTimestamp: Date.now() })
            console.log('✅ Store: Carrinho sincronizado com servidor')
          } else {
            console.warn('⚠️ Store: Erro na sincronização:', response.status)
          }
        } catch (error) {
          console.warn('⚠️ Store: Falha na sincronização:', error)
        }
      },

      // Função para carregar carrinho do servidor
      loadFromServer: async () => {
        if (typeof window === 'undefined') return

        try {
          set({ isLoading: true })

          const analytics = useAnalytics()
          const analyticsSnapshot = analytics.getSnapshot()

          const response = await fetch(
            `/api/cart/simple-update?sessionId=${analyticsSnapshot.sessionId}`
          )

          if (!response.ok) {
            console.log('🛒 Store: Nenhum carrinho encontrado no servidor')
            return
          }

          const data = await response.json()
          
          if (data.found && data.cart?.cartData?.items) {
            const serverItems = data.cart.cartData.items
            const currentItems = get().items

            // Se servidor tem itens mais recentes, carregar
            if (serverItems.length > 0 && currentItems.length === 0) {
              set({ items: serverItems, lastSyncTimestamp: Date.now() })
              console.log('✅ Store: Carrinho carregado do servidor:', serverItems.length, 'itens')
            } else if (serverItems.length > currentItems.length) {
              // Perguntar ao usuário se quer mesclar (implementar depois)
              console.log('🔄 Store: Servidor tem mais itens que local')
            }
          }
        } catch (error) {
          console.warn('⚠️ Store: Erro ao carregar do servidor:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Helper para controlar loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)