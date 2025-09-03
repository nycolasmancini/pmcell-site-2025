'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AnalyticsSession {
  id: string
  sessionId: string
  whatsapp: string | null
  startTime: string
  lastActivity: string
  timeOnSite: number
  whatsappCollectedAt: string | null
  isActive: boolean
  status: 'active' | 'idle' | 'abandoned'
  cartStatus: 'empty' | 'active' | 'abandoned' | 'completed'
  timeSinceLastActivity: number
  stats: {
    categoriesVisited: number
    productsViewed: number
    searchesPerformed: number
    cartEventsCount: number
    pageViewsCount: number
  }
  categoryVisits: Array<{
    id: string
    categoryId: string
    categoryName: string
    visits: number
    lastVisit: string
    hasCartItems: boolean
  }>
  productViews: Array<{
    id: string
    productId: string
    productName: string
    categoryName: string
    visits: number
    lastView: string
    addedToCart: boolean
  }>
  searchHistory: Array<{
    id: string
    term: string
    count: number
    lastSearch: string
  }>
  cartEvents: Array<{
    id: string
    type: string
    productId: string
    productName: string | null
    quantity: number
    unitPrice: number | null
    totalPrice: number | null
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}

export default function VisitasAdmin() {
  const router = useRouter()
  const [sessions, setSessions] = useState<AnalyticsSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<AnalyticsSession | null>(null)
  const [filters, setFilters] = useState({
    whatsapp: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    summary: {
      active: 0,
      idle: 0,
      abandoned: 0,
      withWhatsApp: 0,
      withCartItems: 0
    }
  })

  // Carregar sessões
  const loadSessions = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters
      })

      const response = await fetch(`/api/analytics/sessions?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar sessões')
      
      const data = await response.json()
      setSessions(data.sessions || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar detalhes de uma sessão
  const loadSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/analytics/session/${sessionId}`)
      if (!response.ok) throw new Error('Erro ao carregar detalhes da sessão')
      
      const data = await response.json()
      setSelectedSession(data.session)
    } catch (error) {
      console.error('Erro ao carregar detalhes da sessão:', error)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  // Aplicar filtros
  const applyFilters = () => {
    loadSessions(1)
  }

  // Resetar filtros
  const resetFilters = () => {
    setFilters({
      whatsapp: '',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    })
    setTimeout(() => loadSessions(1), 100)
  }

  // Formatação de tempo
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `há ${seconds}s`
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`
    return `há ${Math.floor(seconds / 86400)}d`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'idle': return 'bg-yellow-100 text-yellow-800'
      case 'abandoned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCartStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'abandoned': return 'bg-red-100 text-red-800'
      case 'empty': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">📊 Analytics - Visitas de Clientes</h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Voltar ao Dashboard
              </button>
              <button 
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir para Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.summary.active}</div>
            <div className="text-sm text-green-600">Sessões Ativas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.summary.idle}</div>
            <div className="text-sm text-yellow-600">Sessões Inativas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.summary.abandoned}</div>
            <div className="text-sm text-red-600">Sessões Abandonadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.summary.withWhatsApp}</div>
            <div className="text-sm text-blue-600">Com WhatsApp</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.summary.withCartItems}</div>
            <div className="text-sm text-purple-600">Com Carrinho</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={filters.whatsapp}
                onChange={(e) => setFilters({...filters, whatsapp: e.target.value})}
                placeholder="Buscar por WhatsApp"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativas</option>
                <option value="abandoned">Abandonadas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => loadSessions(stats.page)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* Lista de Sessões */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Sessões Recentes ({stats.total} total)
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando sessões...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Nenhuma sessão encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carrinho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo no Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atividade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {session.sessionId.substring(0, 12)}...
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.stats.categoriesVisited} categorias, {session.stats.productsViewed} produtos
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.whatsapp ? (
                          <div className="text-sm text-gray-900">{session.whatsapp}</div>
                        ) : (
                          <span className="text-sm text-gray-400">Não fornecido</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status === 'active' ? 'Ativa' : 
                           session.status === 'idle' ? 'Inativa' : 'Abandonada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCartStatusColor(session.cartStatus)}`}>
                          {session.cartStatus === 'active' ? 'Ativo' :
                           session.cartStatus === 'completed' ? 'Concluído' :
                           session.cartStatus === 'abandoned' ? 'Abandonado' : 'Vazio'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(session.timeOnSite)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeAgo(session.timeSinceLastActivity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => loadSessionDetails(session.sessionId)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {stats.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Página {stats.page} de {stats.totalPages} ({stats.total} total)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadSessions(stats.page - 1)}
                  disabled={stats.page === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => loadSessions(stats.page + 1)}
                  disabled={stats.page === stats.totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalhes da Sessão */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Sessão: {selectedSession.sessionId.substring(0, 12)}...
                </h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[80vh]">
                {/* Informações Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">WhatsApp</div>
                    <div className="font-medium">{selectedSession.whatsapp || 'Não fornecido'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Tempo no Site</div>
                    <div className="font-medium">{formatTime(selectedSession.timeOnSite)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                        {selectedSession.status === 'active' ? 'Ativa' : 
                         selectedSession.status === 'idle' ? 'Inativa' : 'Abandonada'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCartStatusColor(selectedSession.cartStatus)}`}>
                        Carrinho: {selectedSession.cartStatus === 'active' ? 'Ativo' :
                                   selectedSession.cartStatus === 'completed' ? 'Concluído' :
                                   selectedSession.cartStatus === 'abandoned' ? 'Abandonado' : 'Vazio'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categorias Visitadas */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Categorias Visitadas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedSession.categoryVisits.map((category) => (
                      <div 
                        key={category.id} 
                        className={`p-3 rounded-lg border-2 ${
                          category.hasCartItems 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-red-300 bg-red-50'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{category.categoryName}</div>
                        <div className="text-sm text-gray-600">{category.visits} visitas</div>
                        <div className={`text-xs font-medium ${
                          category.hasCartItems ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {category.hasCartItems ? '✓ Produtos no carrinho' : '✗ Nenhum produto no carrinho'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Histórico de Pesquisas */}
                {selectedSession.searchHistory.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">🔍 Histórico de Pesquisas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedSession.searchHistory.map((search) => (
                        <div key={search.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="font-medium text-gray-900">"{search.term}"</div>
                          <div className="text-sm text-gray-600">{search.count} buscas</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produtos Visualizados */}
                {selectedSession.productViews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">👁️ Produtos Visualizados</h4>
                    <div className="space-y-2">
                      {selectedSession.productViews.map((product) => (
                        <div 
                          key={product.id} 
                          className={`p-3 rounded-lg border ${
                            product.addedToCart 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{product.productName}</div>
                              <div className="text-sm text-gray-600">{product.categoryName} • {product.visits} visualizações</div>
                            </div>
                            <div className={`text-xs font-medium px-2 py-1 rounded ${
                              product.addedToCart 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {product.addedToCart ? '✓ Adicionado' : '○ Apenas visualizado'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eventos do Carrinho */}
                {selectedSession.cartEvents.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">🛒 Atividade do Carrinho</h4>
                    <div className="space-y-2">
                      {selectedSession.cartEvents.slice(0, 10).map((event) => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">
                                {event.type === 'ADD' ? '➕ Adicionou' :
                                 event.type === 'REMOVE' ? '➖ Removeu' :
                                 event.type === 'UPDATE' ? '✏️ Atualizou' :
                                 event.type === 'CLEAR' ? '🗑️ Limpou carrinho' :
                                 event.type === 'COMPLETE' ? '✅ Concluiu pedido' :
                                 event.type === 'ABANDON' ? '❌ Abandonou' : event.type}
                              </div>
                              <div className="text-sm text-gray-600">
                                {event.productName} • Qtd: {event.quantity}
                                {event.unitPrice && ` • R$ ${event.unitPrice.toFixed(2)}`}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}