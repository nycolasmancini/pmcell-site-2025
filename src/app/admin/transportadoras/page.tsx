'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ShippingCompany {
  id: string
  name: string
  logo?: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function TransportadorasAdmin() {
  const [companies, setCompanies] = useState<ShippingCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<ShippingCompany | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    isActive: true,
    order: 0
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/shipping-companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({ ...prev, logo: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCompany 
        ? `/api/shipping-companies/${editingCompany.id}`
        : '/api/shipping-companies'
      
      const response = await fetch(url, {
        method: editingCompany ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCompanies()
        setShowForm(false)
        setEditingCompany(null)
        setFormData({ name: '', logo: '', isActive: true, order: 0 })
      }
    } catch (error) {
      console.error('Erro ao salvar transportadora:', error)
    }
  }

  const handleEdit = (company: ShippingCompany) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      logo: company.logo || '',
      isActive: company.isActive,
      order: company.order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transportadora?')) {
      try {
        const response = await fetch(`/api/shipping-companies/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await fetchCompanies()
        }
      } catch (error) {
        console.error('Erro ao excluir transportadora:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Gerenciar Transportadoras
            </h1>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Gerencie as logos e informações das transportadoras parceiras
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            + Nova Transportadora
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingCompany ? 'Editar' : 'Nova'} Transportadora
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {formData.logo && (
                    <div className="mt-2">
                      <img 
                        src={formData.logo} 
                        alt="Preview" 
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ordem</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm">Ativa</label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCompany(null)
                      setFormData({ name: '', logo: '', isActive: true, order: 0 })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                  >
                    {editingCompany ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de transportadoras */}
        <div className="grid gap-4">
          {companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transportadora cadastrada
            </div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {company.logo ? (
                        <img 
                          src={company.logo} 
                          alt={company.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Sem logo</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Ordem: {company.order}</span>
                        <span>•</span>
                        <span className={company.isActive ? 'text-green-600' : 'text-red-600'}>
                          {company.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(company)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}