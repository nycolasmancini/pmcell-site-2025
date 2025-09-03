#!/usr/bin/env node

const https = require('https')
const http = require('http')

// Configuração dos testes
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Testes de performance
const performanceTests = [
  {
    name: 'API Products Original',
    path: '/api/products?limit=12',
    expectedMaxSize: 50 * 1024 * 1024, // 50MB
    description: 'Teste da API original de produtos'
  },
  {
    name: 'API Products Otimizada (sem imagens)',
    path: '/api/products/optimized?limit=12&includeImages=false',
    expectedMaxSize: 1 * 1024 * 1024, // 1MB
    description: 'Teste da API otimizada sem imagens'
  },
  {
    name: 'API Cart Original',
    path: '/api/cart/simple-update',
    method: 'POST',
    body: {
      sessionId: 'test-session-' + Date.now(),
      cartData: {
        items: [{
          id: '1',
          productId: 'prod-1',
          name: 'Produto Teste',
          quantity: 2,
          unitPrice: 99.90
        }],
        total: 199.80
      }
    },
    expectedMaxResponseTime: 2000, // 2s
    description: 'Teste da API original do carrinho'
  },
  {
    name: 'API Cart Otimizada',
    path: '/api/cart/simple-update/optimized',
    method: 'POST',
    body: {
      sessionId: 'test-session-opt-' + Date.now(),
      cartData: {
        items: [{
          id: '1',
          productId: 'prod-1',
          name: 'Produto Teste',
          quantity: 2,
          unitPrice: 99.90
        }],
        total: 199.80
      }
    },
    expectedMaxResponseTime: 500, // 500ms
    description: 'Teste da API otimizada do carrinho'
  }
]

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const protocol = url.startsWith('https:') ? https : http
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        ...options.headers
      }
    }

    const req = protocol.request(url, requestOptions, (res) => {
      let data = ''
      let totalBytes = 0

      res.on('data', (chunk) => {
        data += chunk
        totalBytes += chunk.length
      })

      res.on('end', () => {
        const endTime = Date.now()
        const responseTime = endTime - startTime

        resolve({
          statusCode: res.statusCode,
          responseTime,
          size: totalBytes,
          data,
          headers: res.headers
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

// Função para executar teste simples
async function simpleTest(test) {
  console.log(`\n🧪 Testando: ${test.name}`)
  console.log(`   ${test.description}`)
  
  try {
    const result = await makeRequest(BASE_URL + test.path, {
      method: test.method,
      body: test.body
    })
    
    const hasCache = result.headers['cache-control'] && result.headers['cache-control'] !== 'no-cache'
    const hasCompression = result.headers['content-encoding']
    
    console.log(`   📊 Resultados:`)
    console.log(`      Status: ${result.statusCode}`)
    console.log(`      ⏱️  Tempo: ${result.responseTime}ms`)
    console.log(`      📦 Tamanho: ${formatBytes(result.size)}`)
    console.log(`      🗜️  Compressão: ${hasCompression ? '✅ ' + hasCompression : '❌ Não'}`)
    console.log(`      💾 Cache: ${hasCache ? '✅ Sim' : '❌ Não'}`)
    
    let passed = true
    if (test.expectedMaxResponseTime && result.responseTime > test.expectedMaxResponseTime) {
      console.log(`      ⚠️  Tempo acima do esperado (${result.responseTime}ms > ${test.expectedMaxResponseTime}ms)`)
      passed = false
    }
    if (test.expectedMaxSize && result.size > test.expectedMaxSize) {
      console.log(`      ⚠️  Tamanho acima do esperado (${formatBytes(result.size)} > ${formatBytes(test.expectedMaxSize)})`)
      passed = false
    }
    
    return { success: passed && result.statusCode === 200, ...result }
    
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Função para formatar bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de performance das APIs...')
  console.log(`   Base URL: ${BASE_URL}`)
  
  const results = []
  
  for (const test of performanceTests) {
    const result = await simpleTest(test)
    results.push(result)
  }
  
  // Relatório final
  console.log('\n📋 RELATÓRIO FINAL')
  console.log('=' .repeat(50))
  
  const passedTests = results.filter(r => r.success)
  const failedTests = results.filter(r => !r.success)
  
  console.log(`✅ Testes aprovados: ${passedTests.length}/${results.length}`)
  console.log(`❌ Testes falharam: ${failedTests.length}/${results.length}`)
  
  const overallSuccess = passedTests.length >= results.length * 0.5 // 50% de aprovação
  console.log(`\n${overallSuccess ? '✅' : '❌'} Resultado geral: ${overallSuccess ? 'APROVADO' : 'REPROVADO'}`)
  
  return overallSuccess
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
}

module.exports = { runAllTests, performanceTests }