// Sistema de Analytics para tracking de comportamento do usuário

export interface UserAnalytics {
  sessionId: string
  startTime: number
  lastActivity: number
  timeOnSite: number
  categoriesVisited: Array<{
    name: string
    visits: number
    lastVisit: number
    hasCartItems?: boolean
    categoryId?: string
  }>
  searchTerms: Array<{
    term: string
    count: number
    lastSearch: number
  }>
  productsViewed: Array<{
    id: string
    name: string
    category: string
    visits: number
    lastView: number
    addedToCart?: boolean
  }>
  cartEvents: Array<{
    type: 'add' | 'remove' | 'update' | 'clear' | 'complete' | 'abandon'
    productId: string
    productName?: string
    quantity: number
    unitPrice?: number
    totalPrice?: number
    timestamp: number
  }>
  lastCartActivity: number
  whatsappCollected: string | null
  whatsappCollectedAt: number | null
}

class Analytics {
  private analytics: UserAnalytics
  private storageKey = 'pmcell_analytics'
  private cartAbandonTimer: NodeJS.Timeout | null = null
  private readonly CART_ABANDON_TIME = 1 * 60 * 1000 // 1 minuto para testes (era 30 minutos)

  constructor() {
    this.analytics = this.loadAnalytics()
    this.updateLastActivity()
    
    // Verificar se há carrinho abandonado antes de configurar timer
    this.checkForAbandonedCart()
    this.setupCartAbandonTimer()
    
    // Processar queue local na inicialização e periodicamente
    this.processLocalQueue()
    setInterval(() => {
      this.processLocalQueue()
    }, 120000) // A cada 2 minutos
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private loadAnalytics(): UserAnalytics {
    if (typeof window === 'undefined') {
      return this.createNewSession()
    }

    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Se a sessão é muito antiga (mais de 24h), criar nova
      if (Date.now() - parsed.lastActivity > 24 * 60 * 60 * 1000) {
        return this.createNewSession()
      }
      return parsed
    }
    
    return this.createNewSession()
  }

  private createNewSession(): UserAnalytics {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      timeOnSite: 0,
      categoriesVisited: [],
      searchTerms: [],
      productsViewed: [],
      cartEvents: [],
      lastCartActivity: 0,
      whatsappCollected: null,
      whatsappCollectedAt: null
    }
  }

  private saveAnalytics(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.analytics))
      
      // Salvar também no servidor via nova API /api/analytics/save (com debounce)
      this.debouncedServerSave()
    }
  }

  private saveToServerRetryCount = 0
  private readonly MAX_SERVER_SAVE_RETRIES = 3
  private serverSaveTimeout: NodeJS.Timeout | null = null

  private debouncedServerSave(): void {
    // Limpar timeout anterior
    if (this.serverSaveTimeout) {
      clearTimeout(this.serverSaveTimeout)
    }

    // Debounce de 2 segundos para evitar muitas requisições
    this.serverSaveTimeout = setTimeout(() => {
      this.saveAnalyticsToServer()
    }, 2000)
  }

  private async saveAnalyticsToServer(): Promise<void> {
    if (this.saveToServerRetryCount >= this.MAX_SERVER_SAVE_RETRIES) {
      console.log('📊 Analytics: Limite de tentativas atingido, salvando em queue local para sincronização posterior')
      this.saveToLocalQueue()
      return
    }

    try {
      // Preparar payload completo para nova API
      const payload = {
        sessionId: this.analytics.sessionId,
        whatsapp: this.analytics.whatsappCollected,
        startTime: this.analytics.startTime,
        lastActivity: this.analytics.lastActivity,
        timeOnSite: this.analytics.timeOnSite,
        whatsappCollectedAt: this.analytics.whatsappCollectedAt,
        categoriesVisited: this.analytics.categoriesVisited,
        searchTerms: this.analytics.searchTerms,
        productsViewed: this.analytics.productsViewed,
        cartEvents: this.analytics.cartEvents.map(event => ({
          type: event.type,
          productId: event.productId,
          productName: event.productName || 'Nome não disponível',
          quantity: event.quantity,
          unitPrice: event.unitPrice || 0,
          totalPrice: event.totalPrice || 0,
          timestamp: event.timestamp
        }))
      }

      console.log('📊 Analytics: Tentando salvar no servidor...', payload.sessionId)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch('/api/analytics/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log('✅ Analytics: Dados salvos no servidor com sucesso')
        this.saveToServerRetryCount = 0 // Reset contador em caso de sucesso
        this.processLocalQueue() // Processar queue local se houver
      } else if (response.status === 503) {
        // Serviço indisponível - analytics em modo fallback
        const responseData = await response.json()
        if (responseData.fallback) {
          console.log('📊 Analytics: Banco indisponível, continuando com localStorage')
          this.saveToServerRetryCount = 0 // Não tentar novamente
          return // Não é um erro - apenas fallback
        }
        throw new Error(`Service Unavailable: ${responseData.message || response.statusText}`)
      } else {
        const responseText = await response.text()
        console.error('❌ Analytics: Resposta de erro:', responseText)
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }
    } catch (error) {
      this.saveToServerRetryCount++
      console.warn(`📊 Analytics: Erro ao salvar no servidor (tentativa ${this.saveToServerRetryCount}/${this.MAX_SERVER_SAVE_RETRIES}):`, error)
      
      // Categorizar erro para melhor tratamento
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorName = error instanceof Error ? error.name : ''
      
      const isNetworkError = errorName === 'AbortError' || 
                             errorMessage.includes('fetch') || 
                             errorMessage.includes('network') ||
                             errorMessage.includes('timeout')
      
      const isServerError = errorMessage.includes('5') // HTTP 5xx errors
      
      if (this.saveToServerRetryCount < this.MAX_SERVER_SAVE_RETRIES && (isNetworkError || isServerError)) {
        // Backoff exponencial: 5s, 10s, 20s para erros recuperáveis
        const delay = Math.pow(2, this.saveToServerRetryCount) * 2500
        console.log(`📊 Analytics: Erro ${isNetworkError ? 'de rede' : 'do servidor'}, tentando novamente em ${delay/1000}s...`)
        
        setTimeout(() => {
          this.saveAnalyticsToServer()
        }, delay)
      } else {
        console.log(`📊 Analytics: ${this.saveToServerRetryCount >= this.MAX_SERVER_SAVE_RETRIES ? 'Limite de tentativas atingido' : 'Erro não recuperável'}, salvando em queue local`)
        this.saveToLocalQueue()
      }
    }
  }

  // Salvar dados em queue local para sincronização posterior
  private saveToLocalQueue(): void {
    if (typeof window === 'undefined') return

    try {
      const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]')
      const queueItem = {
        sessionId: this.analytics.sessionId,
        timestamp: Date.now(),
        data: this.analytics,
        retries: 0
      }
      
      queue.push(queueItem)
      
      // Manter apenas os 50 itens mais recentes na queue
      const trimmedQueue = queue.slice(-50)
      localStorage.setItem('analytics_queue', JSON.stringify(trimmedQueue))
      
      console.log('💾 Analytics: Dados salvos na queue local para sincronização posterior')
    } catch (error) {
      console.error('❌ Analytics: Erro ao salvar na queue local:', error)
    }
  }

  // Processar queue local (tentar sincronizar dados pendentes)
  private async processLocalQueue(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]')
      if (queue.length === 0) return

      console.log(`🔄 Analytics: Processando ${queue.length} itens da queue local`)

      for (let i = 0; i < queue.length; i++) {
        const queueItem = queue[i]
        
        try {
          const payload = {
            sessionId: queueItem.data.sessionId,
            whatsapp: queueItem.data.whatsappCollected,
            startTime: queueItem.data.startTime,
            lastActivity: queueItem.data.lastActivity,
            timeOnSite: queueItem.data.timeOnSite,
            whatsappCollectedAt: queueItem.data.whatsappCollectedAt,
            categoriesVisited: queueItem.data.categoriesVisited,
            searchTerms: queueItem.data.searchTerms,
            productsViewed: queueItem.data.productsViewed,
            cartEvents: queueItem.data.cartEvents
          }

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout para queue

          const response = await fetch('/api/analytics/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            console.log(`✅ Analytics Queue: Item ${i + 1} sincronizado com sucesso`)
            // Remover item da queue após sucesso
            queue.splice(i, 1)
            i-- // Ajustar índice após remoção
          } else if (response.status === 503) {
            // Serviço indisponível - analytics em modo fallback
            try {
              const responseData = await response.json()
              if (responseData.fallback) {
                console.log(`📊 Analytics Queue: Item ${i + 1} - banco indisponível, removendo da queue`)
                queue.splice(i, 1)
                i--
                continue
              }
            } catch (jsonError) {
              // Se não conseguir parsear JSON, tratar como erro normal
            }
            
            console.warn(`⚠️ Analytics Queue: Serviço indisponível para item ${i + 1}`)
            queueItem.retries = (queueItem.retries || 0) + 1
            
            if (queueItem.retries > 3) {
              console.log(`🗑️ Analytics Queue: Removendo item ${i + 1} após 3 tentativas (serviço indisponível)`)
              queue.splice(i, 1)
              i--
            }
          } else {
            console.warn(`⚠️ Analytics Queue: Falha ao sincronizar item ${i + 1}`)
            queueItem.retries = (queueItem.retries || 0) + 1
            
            // Remover se passou de 5 tentativas
            if (queueItem.retries > 5) {
              console.log(`🗑️ Analytics Queue: Removendo item ${i + 1} após 5 tentativas`)
              queue.splice(i, 1)
              i--
            }
          }
        } catch (itemError) {
          console.warn(`❌ Analytics Queue: Erro no item ${i + 1}:`, itemError)
          queueItem.retries = (queueItem.retries || 0) + 1
          
          // Se erro é de timeout ou rede, tentar novamente
          const itemErrorName = itemError instanceof Error ? itemError.name : ''
          const itemErrorMessage = itemError instanceof Error ? itemError.message : String(itemError)
          
          if (itemErrorName === 'AbortError' || itemErrorMessage.includes('fetch')) {
            console.log(`🔄 Analytics Queue: Erro de rede no item ${i + 1}, tentando novamente em ${queueItem.retries * 5}s`)
            
            // Remover se passou de 3 tentativas para erros de rede
            if (queueItem.retries > 3) {
              console.log(`🗑️ Analytics Queue: Removendo item ${i + 1} após 3 tentativas de rede`)
              queue.splice(i, 1)
              i--
            }
          } else {
            // Outros erros: remover imediatamente
            console.log(`🗑️ Analytics Queue: Removendo item ${i + 1} por erro não recuperável`)
            queue.splice(i, 1)
            i--
          }
        }
      }

      // Salvar queue atualizada
      localStorage.setItem('analytics_queue', JSON.stringify(queue))
      
      if (queue.length === 0) {
        console.log('✅ Analytics Queue: Todos os itens foram sincronizados')
      } else {
        console.log(`📊 Analytics Queue: ${queue.length} itens ainda pendentes`)
      }

    } catch (error) {
      console.error('❌ Analytics Queue: Erro ao processar queue:', error)
    }
  }

  private updateLastActivity(): void {
    this.analytics.lastActivity = Date.now()
    this.analytics.timeOnSite = Date.now() - this.analytics.startTime
    this.saveAnalytics()
  }

  // Verificar se há carrinho abandonado ao inicializar
  private checkForAbandonedCart(): void {
    if (typeof window === 'undefined') return

    try {
      // Verificar se há carrinho no localStorage
      const cartStore = localStorage.getItem('cart-storage')
      if (!cartStore) return

      const cart = JSON.parse(cartStore)
      if (!cart.state?.items?.length) return

      // Verificar se há atividade de carrinho registrada
      if (this.analytics.lastCartActivity === 0) return

      const timeSinceLastCart = Date.now() - this.analytics.lastCartActivity
      console.log(`🛒 Analytics: Verificando carrinho abandonado - tempo desde última atividade: ${Math.round(timeSinceLastCart / 1000)}s`)

      // Se passou do tempo limite, considerar como abandonado
      if (timeSinceLastCart >= this.CART_ABANDON_TIME) {
        console.log(`🛒 Analytics: Carrinho abandonado detectado! (${Math.round(timeSinceLastCart / 1000)}s > ${Math.round(this.CART_ABANDON_TIME / 1000)}s)`)
        console.log('🛒 Analytics: Enviando webhook de carrinho abandonado imediatamente')
        
        // Enviar webhook imediatamente
        this.sendCartAbandonedWebhook()
        
        // Resetar a atividade para evitar múltiplos envios
        this.analytics.lastCartActivity = 0
        this.saveAnalytics()
      } else {
        console.log(`🛒 Analytics: Carrinho ainda não abandonado (${Math.round(timeSinceLastCart / 1000)}s < ${Math.round(this.CART_ABANDON_TIME / 1000)}s)`)
      }
    } catch (error) {
      console.error('❌ Erro ao verificar carrinho abandonado:', error)
    }
  }

  // Setup timer para carrinho abandonado
  private setupCartAbandonTimer(): void {
    if (this.cartAbandonTimer) {
      clearTimeout(this.cartAbandonTimer)
    }

    if (this.analytics.lastCartActivity > 0) {
      const timeSinceLastCart = Date.now() - this.analytics.lastCartActivity
      const remainingTime = this.CART_ABANDON_TIME - timeSinceLastCart

      console.log(`🛒 Analytics: Configurando timer de abandono - tempo restante: ${Math.round(remainingTime / 1000)}s`)

      if (remainingTime > 0) {
        this.cartAbandonTimer = setTimeout(() => {
          console.log('🛒 Analytics: Timer de carrinho abandonado disparado!')
          this.sendCartAbandonedWebhook()
          
          // Resetar a atividade após enviar
          this.analytics.lastCartActivity = 0
          this.saveAnalytics()
        }, remainingTime)
        
        console.log(`🛒 Analytics: Timer configurado para ${Math.round(remainingTime / 1000)}s`)
      } else {
        console.log('🛒 Analytics: Tempo já expirado, não configurando timer')
      }
    } else {
      console.log('🛒 Analytics: Sem atividade de carrinho, não configurando timer')
    }
  }

  // Tracking de categoria visitada
  trackCategoryVisit(categoryName: string, categoryId?: string): void {
    this.updateLastActivity()
    
    const existing = this.analytics.categoriesVisited.find(c => c.name === categoryName)
    if (existing) {
      existing.visits++
      existing.lastVisit = Date.now()
      if (categoryId) existing.categoryId = categoryId
    } else {
      this.analytics.categoriesVisited.push({
        name: categoryName,
        visits: 1,
        lastVisit: Date.now(),
        hasCartItems: false,
        categoryId: categoryId
      })
    }

    // Ordenar por número de visitas
    this.analytics.categoriesVisited.sort((a, b) => b.visits - a.visits)
    this.saveAnalytics()
  }

  // Tracking de busca
  trackSearch(searchTerm: string): void {
    this.updateLastActivity()
    
    const term = searchTerm.toLowerCase().trim()
    if (!term) return

    const existing = this.analytics.searchTerms.find(s => s.term === term)
    if (existing) {
      existing.count++
      existing.lastSearch = Date.now()
    } else {
      this.analytics.searchTerms.push({
        term,
        count: 1,
        lastSearch: Date.now()
      })
    }

    // Ordenar por frequência
    this.analytics.searchTerms.sort((a, b) => b.count - a.count)
    this.saveAnalytics()
  }

  // Tracking de produto visualizado
  trackProductView(productId: string, productName: string, category: string): void {
    this.updateLastActivity()
    
    const existing = this.analytics.productsViewed.find(p => p.id === productId)
    if (existing) {
      existing.visits++
      existing.lastView = Date.now()
    } else {
      this.analytics.productsViewed.push({
        id: productId,
        name: productName,
        category,
        visits: 1,
        lastView: Date.now(),
        addedToCart: false
      })
    }

    // Manter apenas os 50 produtos mais visualizados
    this.analytics.productsViewed.sort((a, b) => b.visits - a.visits)
    this.analytics.productsViewed = this.analytics.productsViewed.slice(0, 50)
    this.saveAnalytics()
  }

  // Tracking de eventos do carrinho
  trackCartEvent(type: 'add' | 'remove' | 'update', productId: string, quantity: number, productName?: string, unitPrice?: number): void {
    console.log(`🛒 Analytics: trackCartEvent chamado - type: ${type}, productId: ${productId}, quantity: ${quantity}`)
    
    this.updateLastActivity()
    
    const timestamp = Date.now()
    this.analytics.cartEvents.push({
      type,
      productId,
      productName,
      quantity,
      unitPrice,
      totalPrice: unitPrice ? unitPrice * quantity : undefined,
      timestamp
    })

    this.analytics.lastCartActivity = timestamp
    console.log(`🛒 Analytics: lastCartActivity atualizado para: ${timestamp} (${new Date(timestamp).toLocaleTimeString()})`)

    // Atualizar flags de "addedToCart" nos produtos visualizados
    if (type === 'add') {
      const productView = this.analytics.productsViewed.find(p => p.id === productId)
      if (productView) {
        productView.addedToCart = true
      }

      // Atualizar flags de "hasCartItems" nas categorias
      const product = this.analytics.productsViewed.find(p => p.id === productId)
      if (product) {
        const categoryVisit = this.analytics.categoriesVisited.find(c => c.name === product.category)
        if (categoryVisit) {
          categoryVisit.hasCartItems = true
        }
      }
    }

    // Manter apenas os 100 últimos eventos
    this.analytics.cartEvents = this.analytics.cartEvents.slice(-100)
    
    this.saveAnalytics()
    console.log(`🛒 Analytics: Dados salvos no localStorage, configurando timer...`)
    this.setupCartAbandonTimer()
    
    // Salvar também no servidor para rastreamento server-side
    this.saveCartToServer()
  }

  // Método para salvar carrinho no servidor
  private saveCartToServer(): void {
    if (typeof window === 'undefined') return

    try {
      // Buscar dados do carrinho no localStorage
      const cartStore = localStorage.getItem('cart-storage')
      
      if (!cartStore) {
        console.log('🛒 Analytics: Sem dados de carrinho para salvar no servidor')
        return
      }

      const cartData = JSON.parse(cartStore)
      
      const payload = {
        sessionId: this.analytics.sessionId,
        whatsapp: this.analytics.whatsappCollected,
        cartData: cartData.state || cartData, // Zustand persist pode ter .state wrapper
        analyticsData: this.getAnalyticsSnapshot(),
        lastActivity: this.analytics.lastCartActivity
      }

      // Salvar no servidor de forma assíncrona (não bloquear UI)
      fetch('/api/cart/simple-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (response.ok) {
          console.log('🛒 Analytics: Carrinho salvo no servidor com sucesso')
        } else {
          console.warn('🛒 Analytics: Erro ao salvar carrinho no servidor:', response.status)
        }
      })
      .catch(error => {
        console.warn('🛒 Analytics: Falha na requisição para salvar carrinho:', error.message)
      })

    } catch (error) {
      console.warn('🛒 Analytics: Erro ao preparar dados para servidor:', error)
    }
  }

  // Método para marcar carrinho como concluído (pedido finalizado)
  private markCartAsCompleted(): void {
    if (typeof window === 'undefined') return

    try {
      const sessionId = this.analytics.sessionId
      
      console.log('🛒 Analytics: Marcando carrinho como concluído:', sessionId)
      
      // Enviar requisição para marcar como contatado/concluído
      fetch('/api/admin/carts/mark-contacted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sessionId, 
          contacted: true 
        })
      })
      .then(response => {
        if (response.ok) {
          console.log('✅ Analytics: Carrinho marcado como concluído com sucesso')
        } else {
          console.warn('⚠️ Analytics: Erro ao marcar carrinho como concluído:', response.status)
        }
      })
      .catch(error => {
        console.warn('⚠️ Analytics: Falha ao marcar carrinho como concluído:', error.message)
      })

    } catch (error) {
      console.warn('⚠️ Analytics: Erro ao marcar carrinho como concluído:', error)
    }
  }

  // Coleta de WhatsApp
  trackWhatsAppCollection(whatsapp: string): void {
    console.log('📞 Analytics: WhatsApp coletado:', whatsapp)
    console.log('📞 Analytics: Ambiente atual:', {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'servidor',
      port: typeof window !== 'undefined' ? window.location.port : 'N/A',
      sessionId: this.analytics.sessionId
    })
    this.updateLastActivity()
    
    this.analytics.whatsappCollected = whatsapp
    this.analytics.whatsappCollectedAt = Date.now()
    this.saveAnalytics()
    
    console.log('📞 Analytics: Dados salvos, enviando webhook WhatsApp...')
    this.sendWhatsAppCollectedWebhook()
  }

  // Finalização de pedido
  trackOrderCompletion(orderData: any): void {
    console.log('🛒 Analytics: Pedido finalizado recebido:', orderData)
    console.log('🛒 Analytics: Ambiente atual:', {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'servidor',
      port: typeof window !== 'undefined' ? window.location.port : 'N/A',
      sessionId: this.analytics.sessionId,
      whatsappColetado: this.analytics.whatsappCollected
    })
    this.updateLastActivity()
    
    // Limpar timer de carrinho abandonado
    if (this.cartAbandonTimer) {
      clearTimeout(this.cartAbandonTimer)
      this.cartAbandonTimer = null
      console.log('🛒 Analytics: Timer de carrinho abandonado limpo')
    }
    
    console.log('🛒 Analytics: Enviando webhook de pedido finalizado...')
    this.sendOrderCompletedWebhook(orderData)
    
    // Marcar carrinho como concluído no servidor
    this.markCartAsCompleted()
  }

  // Função auxiliar para remover imagens dos itens do carrinho (para webhooks mais leves)
  private removeImagesFromCartItems(cartItems: any[]): any[] {
    if (!Array.isArray(cartItems)) return []
    
    return cartItems.map(item => {
      const { image, ...itemWithoutImage } = item
      return itemWithoutImage
    })
  }

  // Webhooks
  private async sendWebhook(eventType: string, data: any, maxRetries: number = 2): Promise<void> {
    let retryCount = 0
    
    while (retryCount <= maxRetries) {
      try {
        const settings = await this.getWebhookSettings()
        console.log('🔧 Configurações de webhook:', settings)
        
        const webhookConfig = settings[eventType as keyof typeof settings]
        console.log(`🔧 Config do webhook ${eventType}:`, webhookConfig)
        
        if (!webhookConfig?.enabled) {
          console.log(`⚠️ Webhook ${eventType} não está habilitado`)
          return
        }

        const baseUrl = webhookConfig.environment === 'production' 
          ? 'https://n8n.pmcell.shop/webhook/'
          : 'https://n8n.pmcell.shop/webhook-test/'

        const fullUrl = baseUrl + eventType
        console.log(`🚀 Enviando webhook para: ${fullUrl} (tentativa ${retryCount + 1}/${maxRetries + 1})`)

        const payload = {
          event: eventType,
          timestamp: new Date().toISOString(),
          user: {
            whatsapp: this.analytics.whatsappCollected,
            sessionId: this.analytics.sessionId
          },
          analytics: this.getAnalyticsSnapshot(),
          data
        }

        console.log('📦 Payload do webhook:', payload)

        // Criar controller para timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

        try {
          // Enviar webhook para N8N com timeout e configurações para CORS
          const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Origin': window.location.origin
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
            mode: 'cors'
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            console.log(`✅ Webhook enviado com sucesso! Status: ${response.status}`)
            this.logWebhook(eventType, webhookConfig.environment, fullUrl)
            return // Sucesso - sair da função
          } else {
            console.error(`❌ Erro ao enviar webhook! Status: ${response.status}`)
            throw new Error(`HTTP ${response.status}`)
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId)
          
          if (fetchError.name === 'AbortError') {
            throw new Error('Timeout - webhook demorou mais de 10 segundos')
          } else if (fetchError.message.includes('CORS') || fetchError.message.includes('network')) {
            throw new Error(`Erro de rede/CORS: ${fetchError.message}`)
          } else {
            throw fetchError
          }
        }
      } catch (error: any) {
        console.error(`❌ Erro ao enviar webhook (tentativa ${retryCount + 1}):`, error.message)
        
        retryCount++
        
        if (retryCount <= maxRetries) {
          console.log(`🔄 Tentando novamente em 2 segundos... (${retryCount}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 2000)) // Aguardar 2 segundos
        } else {
          console.error(`❌ Webhook ${eventType} falhou após ${maxRetries + 1} tentativas:`, error.message)
          console.log(`⚠️ Continuando sem enviar webhook - isso não afeta o funcionamento da aplicação`)
          return
        }
      }
    }
  }

  private sendWhatsAppCollectedWebhook(): void {
    this.sendWebhook('whatsappCollected', {
      whatsapp: this.analytics.whatsappCollected,
      collectedAt: this.analytics.whatsappCollectedAt
    })
  }

  private sendOrderCompletedWebhook(orderData: any): void {
    // Remover imagens dos itens se existirem
    let filteredOrderData = { ...orderData }
    if (filteredOrderData.items && Array.isArray(filteredOrderData.items)) {
      filteredOrderData.items = this.removeImagesFromCartItems(filteredOrderData.items)
    }
    
    this.sendWebhook('orderCompleted', filteredOrderData)
  }

  private sendCartAbandonedWebhook(): void {
    console.log('🛒 Analytics: sendCartAbandonedWebhook chamado')
    
    // Verificar se há itens no carrinho
    if (typeof window !== 'undefined') {
      const cartStore = localStorage.getItem('cart-storage')
      console.log('🛒 Analytics: Verificando carrinho no localStorage:', cartStore ? 'encontrado' : 'não encontrado')
      
      if (cartStore) {
        try {
          const cart = JSON.parse(cartStore)
          console.log('🛒 Analytics: Dados do carrinho:', {
            hasState: !!cart.state,
            itemsLength: cart.state?.items?.length || 0
          })
          
          if (cart.state?.items?.length > 0) {
            const webhookData = {
              cartItems: this.removeImagesFromCartItems(cart.state.items),
              abandonedAt: Date.now(),
              timeSinceLastActivity: this.analytics.lastCartActivity > 0 ? Date.now() - this.analytics.lastCartActivity : 0,
              sessionId: this.analytics.sessionId,
              whatsappCollected: this.analytics.whatsappCollected
            }
            
            console.log('🛒 Analytics: Enviando webhook de carrinho abandonado com dados:', webhookData)
            this.sendWebhook('cartAbandoned', webhookData)
          } else {
            console.log('🛒 Analytics: Carrinho vazio, não enviando webhook')
          }
        } catch (error) {
          console.error('❌ Erro ao processar dados do carrinho:', error)
        }
      } else {
        console.log('🛒 Analytics: Sem dados de carrinho no localStorage')
      }
    } else {
      console.log('🛒 Analytics: Não está no browser, não pode acessar localStorage')
    }
  }

  private async getWebhookSettings(): Promise<any> {
    try {
      // Detectar ambiente mais robustamente
      const currentHostname = window.location.hostname
      const currentPort = window.location.port
      const currentProtocol = window.location.protocol
      
      // Verificar variável de ambiente NODE_ENV se disponível
      const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : 'production'
      
      const isDevelopment = currentHostname === 'localhost' || 
                           currentHostname === '127.0.0.1' ||
                           currentPort === '3000' ||
                           currentPort === '3001' ||
                           nodeEnv === 'development'
      
      const isProduction = !isDevelopment
      
      console.log(`🔧 Detecção de ambiente: hostname=${currentHostname}, port=${currentPort}, protocol=${currentProtocol}, NODE_ENV=${nodeEnv}`)
      console.log(`🔧 Ambiente detectado: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`)
      
      // Sempre buscar configurações da API primeiro
      try {
        const response = await fetch('/api/webhook-settings')
        if (response.ok) {
          const dbSettings = await response.json()
          console.log('🔧 Configurações recebidas da API:', dbSettings)
          
          // Converter formato do banco para o formato esperado
          const settings: any = {}
          dbSettings.forEach((setting: any) => {
            settings[setting.webhookType] = {
              enabled: setting.enabled,
              environment: setting.environment.toLowerCase()
            }
          })
          
          console.log('🔧 Configurações convertidas:', settings)
          
          // Em desenvolvimento, respeitar configurações do banco
          if (isDevelopment) {
            console.log('🔧 [DESENVOLVIMENTO] Usando configurações do banco/arquivo')
            return settings
          }
          
          // Em produção, usar configurações do banco mas garantir que estão ativas se marcadas como PRODUCTION
          if (isProduction) {
            console.log('🔧 [PRODUÇÃO] Aplicando configurações de produção')
            const productionSettings: any = {}
            Object.keys(settings).forEach(key => {
              const setting = settings[key]
              productionSettings[key] = {
                enabled: setting.enabled && setting.environment === 'production',
                environment: setting.environment
              }
            })
            
            console.log('🔧 [PRODUÇÃO] Configurações finais:', productionSettings)
            return productionSettings
          }
          
          return settings
        }
      } catch (apiError) {
        console.warn('⚠️ Erro ao buscar configurações da API:', apiError)
      }
      
      // Fallback baseado no ambiente
      if (isDevelopment) {
        console.log('🔧 [DESENVOLVIMENTO] Usando fallback - webhooks desabilitados')
        return {
          whatsappCollected: { enabled: false, environment: 'test' },
          orderCompleted: { enabled: false, environment: 'test' },
          cartAbandoned: { enabled: false, environment: 'test' },
          analyticsUpdate: { enabled: false, environment: 'test' }
        }
      } else {
        console.log('🔧 [PRODUÇÃO] Usando fallback - webhooks ativos')
        return {
          whatsappCollected: { enabled: true, environment: 'production' },
          orderCompleted: { enabled: true, environment: 'production' },
          cartAbandoned: { enabled: true, environment: 'production' },
          analyticsUpdate: { enabled: true, environment: 'production' }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro crítico ao buscar configurações de webhook:', error)
      
      // Fallback de emergência baseado no hostname
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1'
      
      if (isLocalhost) {
        console.log('🚨 [EMERGÊNCIA] Ambiente local detectado - webhooks desabilitados')
        return {
          whatsappCollected: { enabled: false, environment: 'test' },
          orderCompleted: { enabled: false, environment: 'test' },
          cartAbandoned: { enabled: false, environment: 'test' },
          analyticsUpdate: { enabled: false, environment: 'test' }
        }
      } else {
        console.log('🚨 [EMERGÊNCIA] Ambiente remoto detectado - webhooks ativos')
        return {
          whatsappCollected: { enabled: true, environment: 'production' },
          orderCompleted: { enabled: true, environment: 'production' },
          cartAbandoned: { enabled: true, environment: 'production' },
          analyticsUpdate: { enabled: true, environment: 'production' }
        }
      }
    }
  }

  private logWebhook(webhook: string, environment: string, url: string): void {
    if (typeof window === 'undefined') return

    const logs = JSON.parse(localStorage.getItem('webhookLogs') || '[]')
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      webhook,
      environment,
      status: 'success',
      url
    }
    
    const updatedLogs = [newLog, ...logs].slice(0, 50)
    localStorage.setItem('webhookLogs', JSON.stringify(updatedLogs))
  }

  private getAnalyticsSnapshot() {
    return {
      sessionId: this.analytics.sessionId,
      timeOnSite: Math.floor((Date.now() - this.analytics.startTime) / 1000), // em segundos
      categoriesVisited: this.analytics.categoriesVisited,
      searchTerms: this.analytics.searchTerms,
      productsViewed: this.analytics.productsViewed.slice(0, 10), // Top 10 mais visualizados
      totalCartEvents: this.analytics.cartEvents.length,
      lastCartActivity: this.analytics.lastCartActivity,
      whatsappCollected: this.analytics.whatsappCollected,
      whatsappCollectedAt: this.analytics.whatsappCollectedAt
    }
  }

  // Getters públicos
  getAnalytics(): UserAnalytics {
    return { ...this.analytics }
  }

  getSessionId(): string {
    return this.analytics.sessionId
  }

  getSnapshot() {
    return this.getAnalyticsSnapshot()
  }

  getTopCategories(limit: number = 5) {
    return this.analytics.categoriesVisited.slice(0, limit)
  }

  getTopSearches(limit: number = 5) {
    return this.analytics.searchTerms.slice(0, limit)
  }

  getTopProducts(limit: number = 5) {
    return this.analytics.productsViewed.slice(0, limit)
  }
}

// Função global para verificar carrinho abandonado (independente do singleton)
export const checkAbandonedCartGlobal = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  try {
    // Verificar se há carrinho no localStorage
    const cartStore = localStorage.getItem('cart-storage')
    if (!cartStore) {
      console.log('🛒 Global Check: Sem dados de carrinho')
      return false
    }

    const cart = JSON.parse(cartStore)
    if (!cart.state?.items?.length) {
      console.log('🛒 Global Check: Carrinho vazio')
      return false
    }

    // Verificar analytics
    const analyticsStore = localStorage.getItem('pmcell_analytics')
    if (!analyticsStore) {
      console.log('🛒 Global Check: Sem dados de analytics')
      return false
    }

    const analytics = JSON.parse(analyticsStore)
    if (analytics.lastCartActivity === 0) {
      console.log('🛒 Global Check: Sem atividade de carrinho registrada')
      return false
    }

    const CART_ABANDON_TIME = 1 * 60 * 1000 // 1 minuto
    const timeSinceLastCart = Date.now() - analytics.lastCartActivity
    
    console.log(`🛒 Global Check: Tempo desde última atividade: ${Math.round(timeSinceLastCart / 1000)}s`)
    
    if (timeSinceLastCart >= CART_ABANDON_TIME) {
      console.log(`🛒 Global Check: CARRINHO ABANDONADO DETECTADO! (${Math.round(timeSinceLastCart / 1000)}s >= ${Math.round(CART_ABANDON_TIME / 1000)}s)`)
      
      // Buscar configurações de webhook
      try {
        const response = await fetch('/api/webhook-settings')
        if (!response.ok) {
          console.error('🛒 Global Check: Erro ao buscar configurações de webhook')
          return false
        }

        const settings = await response.json()
        const cartSetting = settings.find((s: any) => s.webhookType === 'cartAbandoned')
        
        if (!cartSetting?.enabled) {
          console.log('🛒 Global Check: Webhook cartAbandoned não está habilitado')
          return false
        }

        // Função auxiliar para remover imagens dos itens (mesma lógica da classe)
        const removeImagesFromItems = (items: any[]): any[] => {
          if (!Array.isArray(items)) return []
          return items.map(item => {
            const { image, ...itemWithoutImage } = item
            return itemWithoutImage
          })
        }

        // Preparar dados do webhook
        const webhookData = {
          event: 'cartAbandoned',
          timestamp: new Date().toISOString(),
          user: {
            whatsapp: analytics.whatsappCollected,
            sessionId: analytics.sessionId
          },
          analytics: {
            sessionId: analytics.sessionId,
            timeOnSite: Math.floor(timeSinceLastCart / 1000),
            categoriesVisited: analytics.categoriesVisited || [],
            searchTerms: analytics.searchTerms || [],
            productsViewed: analytics.productsViewed || [],
            totalCartEvents: analytics.cartEvents?.length || 0,
            lastCartActivity: analytics.lastCartActivity
          },
          data: {
            cartItems: removeImagesFromItems(cart.state.items),
            abandonedAt: Date.now(),
            timeSinceLastActivity: timeSinceLastCart,
            sessionId: analytics.sessionId,
            whatsappCollected: analytics.whatsappCollected
          }
        }

        // Enviar webhook
        const webhookUrl = cartSetting.environment === 'PRODUCTION' 
          ? 'https://n8n.pmcell.shop/webhook/cartAbandoned'
          : 'https://n8n.pmcell.shop/webhook-test/cartAbandoned'

        console.log(`🛒 Global Check: Enviando webhook para: ${webhookUrl}`)
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(webhookData)
        })

        if (webhookResponse.ok) {
          console.log(`✅ Global Check: Webhook enviado com sucesso! Status: ${webhookResponse.status}`)
          
          // Resetar lastCartActivity para evitar múltiplos envios
          analytics.lastCartActivity = 0
          localStorage.setItem('pmcell_analytics', JSON.stringify(analytics))
          
          return true
        } else {
          console.error(`❌ Global Check: Erro ao enviar webhook! Status: ${webhookResponse.status}`)
          return false
        }
        
      } catch (webhookError) {
        console.error('❌ Global Check: Erro no webhook:', webhookError)
        return false
      }
    } else {
      console.log(`🛒 Global Check: Carrinho ainda não abandonado (${Math.round(timeSinceLastCart / 1000)}s < ${Math.round(CART_ABANDON_TIME / 1000)}s)`)
      return false
    }
  } catch (error) {
    console.error('❌ Global Check: Erro na verificação:', error)
    return false
  }
}

// Função para iniciar verificação periódica
let periodicCheckInterval: NodeJS.Timeout | null = null

export const startPeriodicAbandonmentCheck = (): void => {
  if (typeof window === 'undefined') return
  
  // Limpar intervalo anterior se existir
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval)
  }
  
  console.log('🔄 Iniciando verificação periódica de carrinho abandonado (30s)')
  
  // Verificar imediatamente
  checkAbandonedCartGlobal()
  
  // Verificar a cada 30 segundos
  periodicCheckInterval = setInterval(() => {
    checkAbandonedCartGlobal()
  }, 30000) // 30 segundos
}

// Singleton instance
let analyticsInstance: Analytics | null = null

export const useAnalytics = (): Analytics => {
  // Verificar se estamos no lado do cliente
  if (typeof window === 'undefined') {
    // No servidor, retornar uma instância mock
    return {
      trackCategoryVisit: () => {},
      trackSearch: () => {},
      trackProductView: () => {},
      trackCartEvent: () => {},
      trackWhatsAppCollection: () => {},
      trackOrderCompletion: () => {},
      getAnalytics: () => ({} as any),
      getTopCategories: () => [],
      getTopSearches: () => [],
      getTopProducts: () => []
    } as any
  }

  if (!analyticsInstance) {
    try {
      analyticsInstance = new Analytics()
      
      // Iniciar verificação periódica quando o Analytics for criado
      startPeriodicAbandonmentCheck()
      
    } catch (error) {
      console.error('❌ Erro ao criar instância do Analytics:', error)
      // Retornar instância mock em caso de erro
      return {
        trackCategoryVisit: (name: string) => console.log('Mock trackCategoryVisit:', name),
        trackSearch: (term: string) => console.log('Mock trackSearch:', term),
        trackProductView: (id: string, name: string, category: string) => console.log('Mock trackProductView:', id, name, category),
        trackCartEvent: (type: string, productId: string, quantity: number) => console.log('Mock trackCartEvent:', type, productId, quantity),
        trackWhatsAppCollection: (whatsapp: string) => console.log('Mock trackWhatsAppCollection:', whatsapp),
        trackOrderCompletion: (orderData: any) => console.log('Mock trackOrderCompletion:', orderData),
        getAnalytics: () => ({} as any),
        getTopCategories: () => [],
        getTopSearches: () => [],
        getTopProducts: () => []
      } as any
    }
  } else {
    // Se já existe instância, garantir que a verificação periódica esteja rodando
    if (!periodicCheckInterval) {
      startPeriodicAbandonmentCheck()
    }
  }
  
  return analyticsInstance!
}

export default useAnalytics