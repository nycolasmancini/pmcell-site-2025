'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Phone, 
  Clock, 
  Eye, 
  Search, 
  RefreshCw,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Copy,
  ClipboardCopy
} from 'lucide-react'

interface CartItem {
  id: string
  productId: string
  name: string
  quantity: number
  unitPrice: number
  specialQuantity?: number
  specialPrice?: number
  modelName?: string
}

interface Cart {
  id: string
  whatsapp: string
  status: 'active' | 'idle' | 'abandoned'
  statusLabel: string
  statusColor: string
  timeSinceLastActivity: number
  lastActivity: string
  createdAt: string
  webhookSent: boolean
  cartItems: number
  cartTotal: number
  categoriesVisited: string[]
  productsViewed: string[]
  searchQueries: string[]
  timeOnSite: number
  cartData: {
    items: CartItem[]
    total: number
  }
  contacted: boolean
}

interface Stats {
  total: number
  active: number
  idle: number
  abandoned: number
  pending: number
  completed: number
}

interface ApiResponse {
  success: boolean
  carts: Cart[]
  stats: Stats
  timestamp: string
}

export default function CarrinhosAbandonados() {
  const router = useRouter()
  const [carts, setCarts] = useState<Cart[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, idle: 0, abandoned: 0, pending: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeTab, setActiveTab] = useState('todos')
  const [copiedCartId, setCopiedCartId] = useState<string | null>(null)

  const fetchCarts = async () => {
    try {
      const response = await fetch('/api/admin/carts')
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setCarts(data.carts)
        setStats(data.stats)
        setLastUpdate(new Date(data.timestamp).toLocaleTimeString('pt-BR'))
      } else {
        console.error('Erro ao buscar carrinhos:', data)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCarts()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchCarts()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatTime = (seconds: number | undefined) => {
    const sec = seconds || 0
    if (sec < 60) return `${sec}s`
    if (sec < 3600) return `${Math.floor(sec / 60)}min`
    return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}min`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'idle': return <Clock className="w-4 h-4" />
      case 'abandoned': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'idle': return 'secondary'
      case 'abandoned': return 'destructive'
      default: return 'outline'
    }
  }

  const filteredCarts = carts.filter(cart => {
    switch (activeTab) {
      case 'pendentes': return !cart.contacted
      case 'concluidos': return cart.contacted
      case 'ativos': return cart.status === 'active'
      case 'inativos': return cart.status === 'idle'
      case 'abandonados': return cart.status === 'abandoned'
      default: return true
    }
  })

  const handleCopyWhatsApp = (whatsapp: string) => {
    const cleanPhone = whatsapp.replace(/\D/g, '')
    const phoneWithCode = `+55${cleanPhone}`
    navigator.clipboard.writeText(phoneWithCode)
  }

  const handleCopyCart = (cart: Cart) => {
    const items = cart.cartData?.items || []
    
    // Um produto por linha com modelo
    const itemsList = items.map(item => {
      const fullName = (item as any).modelName 
        ? `${item.name || 'Produto'} - ${(item as any).modelName}`
        : item.name || 'Produto'
      
      // Calcular preço correto
      const finalPrice = item.specialQuantity && item.quantity >= item.specialQuantity && item.specialPrice
        ? item.specialPrice
        : item.unitPrice || 0
        
      return `*${fullName}* (${item.quantity || 0}x - R$ ${finalPrice.toFixed(2)})`
    }).join('\n')
    
    // Montar texto final
    let cartText = `Carrinho abandonado:\n\n`
    cartText += `${itemsList}\n\n`
    cartText += `━━━━━━━━━━━━━━━\n`
    cartText += `Total: R$ ${(cart.cartTotal || 0).toFixed(2)}`
    
    navigator.clipboard.writeText(cartText)
    
    // Mostrar feedback de copiado
    setCopiedCartId(cart.id)
    
    // Limpar feedback após 2 segundos
    setTimeout(() => {
      setCopiedCartId(null)
    }, 2000)
  }

  const handleMarkContacted = async (sessionId: string, contacted: boolean) => {
    try {
      const response = await fetch('/api/admin/carts/mark-contacted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, contacted })
      })
      
      if (response.ok) {
        fetchCarts() // Recarregar lista
      } else {
        console.error('Erro ao marcar carrinho:', await response.json())
      }
    } catch (error) {
      console.error('Erro ao marcar carrinho:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carrinho dos Clientes</h1>
              <p className="text-gray-600">Monitore carrinhos em tempo real</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Última atualização: {lastUpdate}
              </div>
              <Button
                onClick={fetchCarts}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="sm"
                variant={autoRefresh ? "default" : "outline"}
              >
                {autoRefresh ? 'Pausar Auto-refresh' : 'Ativar Auto-refresh'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <Phone className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Concluídos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ativos</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inativos</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.idle}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Abandonados</p>
                    <p className="text-2xl font-bold text-red-600">{stats.abandoned}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes ({stats.pending})</TabsTrigger>
            <TabsTrigger value="concluidos">Concluídos ({stats.completed})</TabsTrigger>
            <TabsTrigger value="ativos">Ativos ({stats.active})</TabsTrigger>
            <TabsTrigger value="abandonados">Abandonados ({stats.abandoned})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCarts.map((cart) => (
                  <Card key={cart.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Carrinho
                          {cart.contacted && (
                            <div title="Contatado">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                          )}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant={getStatusBadgeVariant(cart.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(cart.status)}
                              {cart.statusLabel}
                            </div>
                          </Badge>
                          {cart.contacted && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Contatado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* WhatsApp */}
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{cart.whatsapp}</span>
                        </div>
                        <Button
                          onClick={() => handleCopyWhatsApp(cart.whatsapp)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>

                      {/* Informações do Carrinho */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Itens no carrinho:</span>
                          <span className="font-medium">{cart.cartItems || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-medium text-green-600">
                            R$ {(cart.cartTotal || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Última atividade:</span>
                          <span className="font-medium">{formatTime(cart.timeSinceLastActivity || 0)} atrás</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tempo no site:</span>
                          <span className="font-medium">{formatTime(cart.timeOnSite || 0)}</span>
                        </div>
                      </div>

                      {/* Atividades */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {(cart.productsViewed || []).length} produtos visualizados
                          </span>
                        </div>
                        
                        {(cart.categoriesVisited || []).length > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Categorias: </span>
                            <span className="font-medium">
                              {(cart.categoriesVisited || []).join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {(cart.searchQueries || []).length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Search className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              {(cart.searchQueries || []).length} pesquisas realizadas
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Produtos no Carrinho */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Produtos no carrinho:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {(cart.cartData?.items || []).map((item, index) => {
                            // Construir nome completo com modelo
                            const fullName = item.modelName 
                              ? `${item.name || 'Produto'} - ${item.modelName}`
                              : item.name || 'Produto'
                            
                            // Calcular preço correto (com desconto super atacado se aplicável)
                            const finalPrice = item.specialQuantity && item.quantity >= item.specialQuantity && item.specialPrice
                              ? item.specialPrice
                              : item.unitPrice || 0
                              
                            return (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                <div className="font-medium truncate">{fullName}</div>
                                <div className="text-gray-600">
                                  {item.quantity || 0}x R$ {finalPrice.toFixed(2)}
                                  {item.specialQuantity && item.quantity >= item.specialQuantity && item.specialPrice && (
                                    <span className="text-green-600 font-medium"> (Pacote fechado)</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        <Button
                          onClick={() => handleCopyCart(cart)}
                          size="sm"
                          variant={copiedCartId === cart.id ? "default" : "outline"}
                          className={`w-full mt-2 ${copiedCartId === cart.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                          {copiedCartId === cart.id ? (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          ) : (
                            <ClipboardCopy className="w-4 h-4 mr-2" />
                          )}
                          {copiedCartId === cart.id ? 'Copiado!' : 'Copiar Carrinho'}
                        </Button>
                        
                        <Button
                          onClick={() => handleMarkContacted(cart.id, !cart.contacted)}
                          size="sm"
                          variant={cart.contacted ? "secondary" : "default"}
                          className="w-full mt-2"
                        >
                          {cart.contacted ? "✓ Contatado" : "Marcar como Contatado"}
                        </Button>
                      </div>

                      {/* Timestamp */}
                      <div className="pt-2 border-t text-xs text-gray-500">
                        Criado em: {cart.createdAt}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && filteredCarts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum carrinho encontrado nesta categoria</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}