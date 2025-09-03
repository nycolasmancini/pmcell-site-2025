'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

function SyncDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  
  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/sync-database', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ ${data.message}`)
      } else {
        setResult(`❌ ${data.error}`)
      }
    } catch (error) {
      setResult('❌ Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <span className="text-red-600 text-xl font-semibold">🗄️</span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">Sincronizar Banco</h3>
          <p className="text-gray-600">Corrigir tabelas faltantes</p>
        </div>
      </div>
      
      <button
        onClick={handleSync}
        disabled={isLoading}
        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? 'Sincronizando...' : 'Sincronizar Agora'}
      </button>
      
      {result && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{result}</p>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()

  console.log('Dashboard - Acesso livre ao painel administrativo')

  const navigateToSection = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir para Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Bem-vindo ao Dashboard!</h2>
          <p className="text-gray-600">Gerencie seu sistema de vendas.</p>
        </div>

        {/* Dashboard Cards */}
        <div className="space-y-8">
          {/* Vendas e Atendimento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Vendas e Atendimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigateToSection('/admin/pedidos')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl font-semibold">📋</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pedidos</h3>
                <p className="text-gray-600">Visualize vendas</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigateToSection('/admin/carrinhos')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl font-semibold">🛒</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Carrinhos</h3>
                <p className="text-gray-600">Carrinhos ativos</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigateToSection('/admin/visitas')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl font-semibold">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">Visitas e comportamento</p>
              </div>
            </div>
          </button>

            </div>
          </div>

          {/* Catálogo e Inventário */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Catálogo e Inventário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <button
            onClick={() => navigateToSection('/admin/produtos')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl font-semibold">📦</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Produtos</h3>
                <p className="text-gray-600">Gerencie seu catálogo</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigateToSection('/admin/categorias')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl font-semibold">🏷️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Categorias</h3>
                <p className="text-gray-600">Organize produtos</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigateToSection('/admin/fornecedores')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl font-semibold">🏭</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Fornecedores</h3>
                <p className="text-gray-600">Gerencie fornecedores</p>
              </div>
            </div>
          </button>

            </div>
          </div>

          {/* Sistema e Configurações */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Sistema e Configurações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => navigateToSection('/admin/configuracoes')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-xl font-semibold">⚙️</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
                    <p className="text-gray-600">Ajustes do sistema</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('/admin/usuarios')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-xl font-semibold">👤</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Usuários</h3>
                    <p className="text-gray-600">Gerenciar acessos</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateToSection('/admin/transportadoras')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <span className="text-cyan-600 text-xl font-semibold">🚛</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Transportadoras</h3>
                    <p className="text-gray-600">Gestão de frete</p>
                  </div>
                </div>
              </button>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xl font-semibold">👥</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Clientes</h3>
                    <p className="text-gray-600">Em desenvolvimento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sistema e Manutenção */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Sistema e Manutenção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SyncDatabaseButton />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-2">✅</span>
            <p className="text-green-800">Dashboard funcionando sem autenticação!</p>
          </div>
        </div>
      </main>
    </div>
  )
}