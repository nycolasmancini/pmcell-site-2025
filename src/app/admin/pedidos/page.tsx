'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Customer {
  id: string
  name: string
  whatsapp: string
  email?: string
  company?: string
  cnpj?: string
}

interface OrderItem {
  id: string
  productName: string
  modelName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    name: string
    isActive: boolean
  }
}

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  subtotal: number
  discount: number
  total: number
  notes?: string
  internalNotes?: string
  assignedSeller?: string
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  completedAt?: string
  customer: Customer
  items: OrderItem[]
}

const statusLabels = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Em Atendimento', color: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Finalizado', color: 'bg-gray-100 text-gray-800' }
}

export default function AdminPedidos() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalOrders(data.pagination?.total || 0)
      } else {
        console.error('Erro ao buscar pedidos:', response.status)
        setOrders([])
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchOrders()
        alert('Status do pedido atualizado com sucesso!')
      } else {
        alert('Erro ao atualizar status do pedido')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do pedido')
    }
  }

  const updateInternalNotes = async (orderId: string, notes: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ internalNotes: notes }),
      })

      if (response.ok) {
        await fetchOrders()
        alert('Observações internas atualizadas!')
      } else {
        alert('Erro ao atualizar observações')
      }
    } catch (error) {
      console.error('Erro ao atualizar observações:', error)
      alert('Erro ao atualizar observações')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatWhatsApp = (whatsapp: string) => {
    const clean = whatsapp.replace(/\D/g, '')
    return clean.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '+$1 ($2) $3-$4')
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(search) ||
      order.customer.name.toLowerCase().includes(search) ||
      order.customer.whatsapp.includes(search) ||
      order.customer.company?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Pedidos
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filtros e Busca */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status do Pedido
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Todos os status</option>
                  <option value="PENDING">Pendente</option>
                  <option value="PROCESSING">Em Atendimento</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="COMPLETED">Finalizado</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Buscar (Número, Cliente, WhatsApp, Empresa)
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {filteredOrders.length} de {totalOrders} pedidos
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum pedido encontrado.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <li key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Pedido #{order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer.name} • {formatWhatsApp(order.customer.whatsapp)}
                            {order.customer.company && <span> • {order.customer.company}</span>}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Total: R$ {order.total.toFixed(2)}
                            <span className="ml-2">• {formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusLabels[order.status].color}`}>
                        {statusLabels[order.status].label}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowOrderModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Modal de Detalhes do Pedido */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Pedido #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => {
                  setShowOrderModal(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações do Cliente */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dados do Cliente</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                  <p><strong>WhatsApp:</strong> {formatWhatsApp(selectedOrder.customer.whatsapp)}</p>
                  {selectedOrder.customer.email && (
                    <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  )}
                  {selectedOrder.customer.company && (
                    <p><strong>Empresa:</strong> {selectedOrder.customer.company}</p>
                  )}
                  {selectedOrder.customer.cnpj && (
                    <p><strong>CNPJ:</strong> {selectedOrder.customer.cnpj}</p>
                  )}
                </div>
              </div>

              {/* Informações do Pedido */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dados do Pedido</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusLabels[selectedOrder.status].color}`}>
                      {statusLabels[selectedOrder.status].label}
                    </span>
                  </p>
                  <p><strong>Data:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Subtotal:</strong> R$ {selectedOrder.subtotal.toFixed(2)}</p>
                  {selectedOrder.discount > 0 && (
                    <p><strong>Desconto:</strong> R$ {selectedOrder.discount.toFixed(2)}</p>
                  )}
                  <p><strong>Total:</strong> R$ {selectedOrder.total.toFixed(2)}</p>
                  {selectedOrder.assignedSeller && (
                    <p><strong>Vendedor:</strong> {selectedOrder.assignedSeller}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Itens do Pedido</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Preço Unit.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.productName}
                          {item.modelName && (
                            <div className="text-xs text-gray-500">
                              Modelo: {item.modelName}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Observações */}
            {selectedOrder.notes && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Observações do Cliente</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {selectedOrder.notes}
                </div>
              </div>
            )}

            {/* Observações Internas */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Observações Internas</h4>
              <textarea
                key={selectedOrder.id} 
                defaultValue={selectedOrder.internalNotes || ''}
                onBlur={(e) => {
                  if (e.target.value !== (selectedOrder.internalNotes || '')) {
                    updateInternalNotes(selectedOrder.id, e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Adicione observações internas..."
              />
            </div>

            {/* Ações */}
            <div className="mt-6 flex justify-between">
              <div className="flex space-x-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="PENDING">Pendente</option>
                  <option value="PROCESSING">Em Atendimento</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="COMPLETED">Finalizado</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setShowOrderModal(false)
                  setSelectedOrder(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}