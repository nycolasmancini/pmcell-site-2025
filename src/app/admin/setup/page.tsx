'use client'

import { useState, useEffect } from 'react'

interface SetupStatus {
  dbConnected: boolean
  tablesExist: boolean
  hasAdmin: boolean
  hasLegacyAdmin: boolean
  adminCount: number
  needsSetup: boolean
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkStatus = async () => {
    try {
      setLoading(true)
      addLog('Verificando status do banco de dados...')
      
      const response = await fetch('/api/admin/setup')
      const data = await response.json()
      
      setStatus(data)
      addLog(`Status: ${data.status}`)
      addLog(`Banco conectado: ${data.dbConnected ? 'Sim' : 'Não'}`)
      addLog(`Tabelas existem: ${data.tablesExist ? 'Sim' : 'Não'}`)
      addLog(`Tem admin: ${data.hasAdmin ? 'Sim' : 'Não'}`)
      addLog(`Precisa setup: ${data.needsSetup ? 'Sim' : 'Não'}`)
    } catch (error) {
      addLog(`Erro ao verificar status: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    try {
      setWorking(true)
      addLog('Criando tabelas no banco de dados...')
      
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_tables' })
      })
      
      const data = await response.json()
      addLog(`Resultado: ${data.message}`)
      
      if (data.status === 'success') {
        setTimeout(checkStatus, 1000)
      }
    } catch (error) {
      addLog(`Erro ao criar tabelas: ${error}`)
    } finally {
      setWorking(false)
    }
  }

  const runSeed = async () => {
    try {
      setWorking(true)
      addLog('Executando seed (criando usuários padrão)...')
      
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_seed' })
      })
      
      const data = await response.json()
      addLog(`Resultado: ${data.message}`)
      
      if (data.status === 'success' && data.users) {
        data.users.forEach((user: any) => {
          addLog(`Usuário criado: ${user.email} (${user.role})`)
        })
        addLog('Credenciais criadas:')
        addLog('Admin: admin@pmcell.com.br / admin123')
        addLog('Funcionário: funcionario@pmcell.com.br / func123')
        setTimeout(checkStatus, 1000)
      }
    } catch (error) {
      addLog(`Erro no seed: ${error}`)
    } finally {
      setWorking(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Verificando configuração...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Setup do Sistema de Usuários
          </h1>

          {/* Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Status Atual</h2>
            {status && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded ${status.dbConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>Banco de Dados:</strong> {status.dbConnected ? 'Conectado' : 'Desconectado'}
                </div>
                <div className={`p-3 rounded ${status.tablesExist ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  <strong>Tabelas:</strong> {status.tablesExist ? 'Existem' : 'Não existem'}
                </div>
                <div className={`p-3 rounded ${status.hasAdmin ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  <strong>Admin:</strong> {status.hasAdmin ? `${status.adminCount} admin(s)` : 'Nenhum admin'}
                </div>
                <div className={`p-3 rounded ${status.hasLegacyAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  <strong>Admin Legado:</strong> {status.hasLegacyAdmin ? 'Existe' : 'Não existe'}
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Ações</h2>
            <div className="space-y-4">
              <button
                onClick={checkStatus}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Verificando...' : 'Verificar Status'}
              </button>

              {status && !status.tablesExist && (
                <button
                  onClick={createTables}
                  disabled={working}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400"
                >
                  {working ? 'Criando...' : 'Criar Tabelas'}
                </button>
              )}

              {status && status.tablesExist && !status.hasAdmin && (
                <button
                  onClick={runSeed}
                  disabled={working}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {working ? 'Executando...' : 'Criar Usuários Padrão'}
                </button>
              )}

              {status && status.hasAdmin && (
                <div className="bg-green-100 text-green-800 p-4 rounded">
                  <h3 className="font-semibold">✅ Sistema Configurado!</h3>
                  <p>O sistema está pronto para uso. Você pode fazer login com:</p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Admin:</strong> admin@pmcell.com.br / admin123</li>
                    <li><strong>Funcionário:</strong> funcionario@pmcell.com.br / func123</li>
                  </ul>
                  <div className="mt-4">
                    <a
                      href="/admin/login"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
                    >
                      Ir para Login
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logs */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">Nenhum log ainda...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}