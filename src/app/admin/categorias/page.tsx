'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  icon?: string
  _count?: {
    products: number
  }
}

export default function AdminCategorias() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [draggedItem, setDraggedItem] = useState<Category | null>(null)
  const [dragOverItem, setDragOverItem] = useState<Category | null>(null)

  const [newCategory, setNewCategory] = useState({
    name: '',
    order: ''
  })


  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = new FormData()
      formData.append('name', newCategory.name)
      formData.append('order', newCategory.order || '0')

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (response.ok) {
        alert(editingCategory ? 'Categoria atualizada com sucesso!' : 'Categoria adicionada com sucesso!')
        setShowAddForm(false)
        setEditingCategory(null)
        resetForm()
        loadCategories()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar categoria')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria')
    }
  }

  const resetForm = () => {
    setNewCategory({
      name: '',
      order: ''
    })
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      order: category.order.toString()
    })
    setShowAddForm(true)
  }

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
      try {
        const response = await fetch(`/api/categories?id=${categoryId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          alert('Categoria excluída com sucesso!')
          loadCategories()
        } else {
          const error = await response.json()
          alert(error.error || 'Erro ao excluir categoria')
        }
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
        alert('Erro ao excluir categoria')
      }
    }
  }

  const moveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(cat => cat.id === categoryId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    const newCategories = [...categories]
    const [movedItem] = newCategories.splice(currentIndex, 1)
    newCategories.splice(newIndex, 0, movedItem)

    // Update order values
    const categoryOrders = newCategories.map((cat, index) => ({
      id: cat.id,
      order: index
    }))

    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryOrders }),
      })

      if (response.ok) {
        setCategories(newCategories.map((cat, index) => ({ ...cat, order: index })))
      } else {
        alert('Erro ao reordenar categorias')
      }
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error)
      alert('Erro ao reordenar categorias')
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, category: Category) => {
    setDraggedItem(category)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, category: Category) => {
    e.preventDefault()
    setDragOverItem(category)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, targetCategory: Category) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetCategory.id) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedIndex = categories.findIndex(cat => cat.id === draggedItem.id)
    const targetIndex = categories.findIndex(cat => cat.id === targetCategory.id)

    const newCategories = [...categories]
    const [movedItem] = newCategories.splice(draggedIndex, 1)
    newCategories.splice(targetIndex, 0, movedItem)

    // Update order values
    const categoryOrders = newCategories.map((cat, index) => ({
      id: cat.id,
      order: index
    }))

    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryOrders }),
      })

      if (response.ok) {
        setCategories(newCategories.map((cat, index) => ({ ...cat, order: index })))
      } else {
        alert('Erro ao reordenar categorias')
        loadCategories() // Reload on error
      }
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error)
      alert('Erro ao reordenar categorias')
      loadCategories() // Reload on error
    }

    setDraggedItem(null)
    setDragOverItem(null)
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
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h1>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null)
                resetForm()
                setShowAddForm(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Adicionar Categoria
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: Eletrônicos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCategory.order}
                    onChange={(e) => setNewCategory({...newCategory, order: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>


                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingCategory ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingCategory(null)
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

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Categorias ({categories.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Arraste as linhas para reordenar as categorias
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando categorias...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma categoria encontrada. 
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                Adicione a primeira!
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordem
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produtos
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category, index) => (
                    <tr 
                      key={category.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, category)}
                      onDragOver={(e) => handleDragOver(e, category)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, category)}
                      className={`cursor-move hover:bg-gray-50 transition-colors ${
                        dragOverItem?.id === category.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.order}</span>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveCategory(category.id, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              title="Mover para cima"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveCategory(category.id, 'down')}
                              disabled={index === categories.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              title="Mover para baixo"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                          {category._count?.products || 0} produto(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id, category.name)}
                          className="text-red-600 hover:text-red-900"
                          disabled={(category._count?.products || 0) > 0}
                          title={
                            (category._count?.products || 0) > 0
                              ? 'Não é possível excluir categoria com produtos'
                              : 'Excluir categoria'
                          }
                        >
                          {(category._count?.products || 0) > 0 ? '🔒 Excluir' : 'Excluir'}
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