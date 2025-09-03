'use client'

import { useState } from 'react'

export default function SetupDB() {
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runSQL = async (sql: string, description: string) => {
    try {
      setStatus(`Executando: ${description}...`)
      const response = await fetch('/api/run-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      })
      
      const result = await response.json()
      if (result.success) {
        setStatus(`✅ ${description} - Sucesso`)
        return true
      } else {
        setStatus(`❌ ${description} - Erro: ${result.error}`)
        return false
      }
    } catch (error) {
      setStatus(`❌ ${description} - Erro: ${error}`)
      return false
    }
  }

  const setupDatabase = async () => {
    setIsLoading(true)
    setResult(null)
    
    const steps = [
      {
        sql: `DO $$ BEGIN
          CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;`,
        description: 'Criar enum UserRole (se não existir)'
      },
      {
        sql: `DO $$ BEGIN
          CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;`,
        description: 'Criar enum OrderStatus (se não existir)'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );`,
        description: 'Criar tabela User'
      },
      {
        sql: `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
        description: 'Criar índice único para email'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS "CompanySettings" (
          "id" TEXT NOT NULL,
          "companyName" TEXT NOT NULL,
          "tradeName" TEXT,
          "primaryColor" TEXT NOT NULL DEFAULT '#FC6D36',
          "whatsapp" TEXT,
          "email" TEXT,
          "minOrderValue" DOUBLE PRECISION,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
        );`,
        description: 'Criar tabela CompanySettings'
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
        );`,
        description: 'Criar tabela Category'
      },
      {
        sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");`,
        description: 'Criar índice único para slug da categoria'
      },
      {
        sql: `INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive") 
              VALUES ('admin_001', 'admin@pmcell.com.br', '$2a$10$K7L1OJ0TfU0vSomRgbJYkuVTXfkVpIx8H8A6ghA0B.qY5wlFWGVWe', 'Administrador PMCELL', 'ADMIN', true)
              ON CONFLICT ("email") DO NOTHING;`,
        description: 'Inserir usuário admin'
      },
      {
        sql: `INSERT INTO "CompanySettings" ("id", "companyName", "tradeName", "primaryColor", "whatsapp", "email", "minOrderValue") 
              VALUES ('default', 'PMCELL São Paulo', 'PMCELL SP', '#FC6D36', '5511999999999', 'contato@pmcell.com.br', 100)
              ON CONFLICT ("id") DO NOTHING;`,
        description: 'Inserir configurações da empresa'
      },
      {
        sql: `INSERT INTO "Category" ("id", "name", "slug", "order", "isActive") VALUES
              ('cat_001', 'Capas', 'capas', 1, true),
              ('cat_002', 'Películas', 'peliculas', 2, true),
              ('cat_003', 'Fones', 'fones', 3, true),
              ('cat_004', 'Carregadores', 'carregadores', 4, true),
              ('cat_005', 'Cabos', 'cabos', 5, true)
              ON CONFLICT ("slug") DO NOTHING;`,
        description: 'Inserir categorias'
      }
    ]

    let success = true
    for (const step of steps) {
      const result = await runSQL(step.sql, step.description)
      if (!result) {
        success = false
        break
      }
      await new Promise(resolve => setTimeout(resolve, 500)) // Pequena pausa
    }

    if (success) {
      setStatus('🎉 Banco de dados configurado com sucesso!')
      setResult({ success: true, message: 'Todas as tabelas foram criadas e dados inseridos' })
    }
    
    setIsLoading(false)
  }

  const checkDatabase = async () => {
    setIsLoading(true)
    try {
      setStatus('Verificando estrutura do banco...')
      const response = await fetch('/api/run-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'` 
        })
      })
      
      const result = await response.json()
      if (result.success) {
        const tables = result.rows.map((row: any) => row.table_name)
        setStatus(`✅ Tabelas encontradas: ${tables.join(', ')}`)
        setResult({ tables, missing: [] })
      } else {
        setStatus(`❌ Erro ao verificar tabelas: ${result.error}`)
        setResult({ error: result.error })
      }
    } catch (error) {
      setStatus(`❌ Erro na verificação: ${error}`)
    }
    setIsLoading(false)
  }

  const fixMissingTables = async () => {
    setIsLoading(true)
    setStatus('Corrigindo tabelas faltantes...')
    
    // Apenas os dados essenciais
    const fixes = [
      {
        sql: `INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive") 
              VALUES ('admin_001', 'admin@pmcell.com.br', '$2a$10$K7L1OJ0TfU0vSomRgbJYkuVTXfkVpIx8H8A6ghA0B.qY5wlFWGVWe', 'Administrador PMCELL', 'ADMIN', true)
              ON CONFLICT ("email") DO NOTHING;`,
        description: 'Garantir usuário admin'
      },
      {
        sql: `INSERT INTO "CompanySettings" ("id", "companyName", "tradeName", "primaryColor", "whatsapp", "email", "minOrderValue") 
              VALUES ('default', 'PMCELL São Paulo', 'PMCELL SP', '#FC6D36', '5511999999999', 'contato@pmcell.com.br', 100)
              ON CONFLICT ("id") DO NOTHING;`,
        description: 'Garantir configurações da empresa'
      },
      {
        sql: `INSERT INTO "Category" ("id", "name", "slug", "order", "isActive") VALUES
              ('cat_001', 'Capas', 'capas', 1, true),
              ('cat_002', 'Películas', 'peliculas', 2, true),
              ('cat_003', 'Fones', 'fones', 3, true),
              ('cat_004', 'Carregadores', 'carregadores', 4, true),
              ('cat_005', 'Cabos', 'cabos', 5, true)
              ON CONFLICT ("slug") DO NOTHING;`,
        description: 'Garantir categorias básicas'
      }
    ]

    let success = true
    for (const fix of fixes) {
      const result = await runSQL(fix.sql, fix.description)
      if (!result) {
        success = false
        break
      }
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    if (success) {
      setStatus('🎉 Correções aplicadas com sucesso!')
    }
    
    setIsLoading(false)
  }

  const testAPIs = async () => {
    setIsLoading(true)
    const tests = [
      '/api/company-settings',
      '/api/categories',
      '/api/products'
    ]

    const results = []
    for (const api of tests) {
      try {
        const response = await fetch(api)
        const data = await response.json()
        results.push({
          api,
          status: response.status,
          success: response.ok,
          data: response.ok ? 'OK' : data.error
        })
      } catch (error) {
        results.push({
          api,
          status: 'ERRO',
          success: false,
          data: error
        })
      }
    }

    setResult(results)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Setup do Banco de Dados</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm">
            {status || 'Pronto para executar...'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={checkDatabase}
              disabled={isLoading}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : '🔍 Verificar Banco'}
            </button>
            
            <button
              onClick={fixMissingTables}
              disabled={isLoading}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Corrigindo...' : '🔧 Corrigir Dados'}
            </button>
            
            <button
              onClick={setupDatabase}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Configurando...' : '🚀 Setup Completo'}
            </button>
            
            <button
              onClick={testAPIs}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testando...' : '🧪 Testar APIs'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}