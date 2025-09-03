'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Supplier {
  id: string
  name: string
  phone?: string
  address?: string
  email?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

interface ProductSupplier {
  id: string
  productId: string
  supplierId: string
  cost: number
  isActive: boolean
  notes?: string
  product: {
    name: string
  }
}

export default function AdminFornecedores() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [selectedSupplierProducts, setSelectedSupplierProducts] = useState<ProductSupplier[]>([])
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
    isActive: true
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers'
      const method = editingSupplier ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSupplier),
      })

      if (response.ok) {
        alert(editingSupplier ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor adicionado com sucesso!')
        setShowAddForm(false)
        setEditingSupplier(null)
        resetForm()
        loadSuppliers()
      } else {
        alert('Erro ao salvar fornecedor')
      }
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error)
    }
  }

  const resetForm = () => {
    setNewSupplier({
      name: '',
      phone: '',
      address: '',
      email: '',
      notes: '',
      isActive: true
    })
  }

  const startEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setNewSupplier({
      name: supplier.name,
      phone: supplier.phone || '',
      address: supplier.address || '',
      email: supplier.email || '',
      notes: supplier.notes || '',
      isActive: supplier.isActive
    })
    setShowAddForm(true)
  }

  const toggleSupplierStatus = async (supplier: Supplier) => {
    try {
      const response = await fetch(`/api/suppliers/${supplier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !supplier.isActive }),
      })

      if (response.ok) {
        loadSuppliers()
      } else {
        alert('Erro ao atualizar status do fornecedor')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const deleteSupplier = async (supplierId: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          alert('Fornecedor excluído com sucesso!')
          loadSuppliers()
        } else {
          const error = await response.json()
          alert(error.message || 'Erro ao excluir fornecedor')
        }
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error)
      }
    }
  }

  const viewSupplierProducts = async (supplier: Supplier) => {
    try {
      const response = await fetch(`/api/suppliers/${supplier.id}/products`)
      if (response.ok) {
        const products = await response.json()
        setSelectedSupplierProducts(products)
        setShowProductsModal(true)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do fornecedor:', error)
    }
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
            </div>
            <button
              onClick={() => {
                setEditingSupplier(null)
                resetForm()
                setShowAddForm(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Adicionar Fornecedor
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newSupplier.isActive}
                    onChange={(e) => setNewSupplier({...newSupplier, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Fornecedor ativo
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingSupplier ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingSupplier(null)
                      resetForm()
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Modal */}
        {showProductsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Produtos do Fornecedor</h2>
              {selectedSupplierProducts.length === 0 ? (
                <p className="text-gray-500">Nenhum produto associado a este fornecedor.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2">Produto</th>
                        <th className="text-left px-4 py-2">Custo</th>
                        <th className="text-left px-4 py-2">Status</th>
                        <th className="text-left px-4 py-2">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSupplierProducts.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-2">{item.product.name}</td>
                          <td className="px-4 py-2">R$ {item.cost.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-4 py-2">{item.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={() => setShowProductsModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Fornecedores ({suppliers.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando fornecedores...</div>
          ) : suppliers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum fornecedor encontrado. 
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                Adicione o primeiro!
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fornecedor
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produtos
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.name}
                          </div>
                          {supplier.address && (
                            <div className="text-sm text-gray-500">
                              {supplier.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {supplier.phone && (
                            <div>{formatPhone(supplier.phone)}</div>
                          )}
                          {supplier.email && (
                            <div className="text-gray-500">{supplier.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => viewSupplierProducts(supplier)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {supplier._count?.products || 0} produto(s)
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {supplier.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEdit(supplier)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleSupplierStatus(supplier)}
                          className={supplier.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {supplier.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => deleteSupplier(supplier.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}