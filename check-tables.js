#!/usr/bin/env node

const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:Hexenwith556023@db.cjlylhgovnausyrzauuw.supabase.co:5432/postgres'
})

async function checkTables() {
  try {
    console.log('🔗 Conectando ao Supabase...')
    await client.connect()
    console.log('✅ Conectado com sucesso!')

    // Verificar tabelas de analytics
    const result = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE t.table_schema = 'public' 
      AND t.table_name IN ('AnalyticsSession', 'PageView', 'CategoryVisit', 'ProductView', 'SearchHistory', 'CartEvent')
      ORDER BY t.table_name;
    `)

    console.log('\n📊 TABELAS DE ANALYTICS:')
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma tabela de analytics encontrada!')
    } else {
      result.rows.forEach(row => {
        console.log(`✅ ${row.table_name} (${row.column_count} colunas)`)
      })
    }

    // Verificar tipos enum
    const enumResult = await client.query(`
      SELECT typname FROM pg_type WHERE typname = 'CartEventType';
    `)

    console.log(`\n🏷️ ENUM CartEventType: ${enumResult.rows.length > 0 ? '✅ EXISTE' : '❌ NÃO EXISTE'}`)

    // Se tabelas existem, testar inserção
    if (result.rows.length > 0) {
      console.log('\n🧪 TESTANDO INSERÇÃO...')
      
      const testSessionId = `test_${Date.now()}`
      
      await client.query(`
        INSERT INTO "AnalyticsSession" (id, "sessionId", whatsapp, "timeOnSite", "isActive")
        VALUES ($1, $2, $3, $4, $5)
      `, [`test_${Date.now()}`, testSessionId, '5511999999999', 60, true])
      
      console.log('✅ Inserção bem-sucedida!')

      // Verificar se foi inserido
      const checkResult = await client.query(`
        SELECT COUNT(*) as count FROM "AnalyticsSession" WHERE "sessionId" = $1
      `, [testSessionId])
      
      console.log(`✅ Registro encontrado: ${checkResult.rows[0].count}`)

      // Limpar teste
      await client.query(`
        DELETE FROM "AnalyticsSession" WHERE "sessionId" = $1
      `, [testSessionId])
      
      console.log('✅ Limpeza realizada')
    }

    console.log('\n🎉 BANCO DE DADOS ESTÁ FUNCIONANDO PERFEITAMENTE!')
    console.log('💡 O problema deve ser na conexão do Vercel ou cache do Prisma')

  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    console.error('Código:', error.code)
    
    if (error.code === '28P01') {
      console.log('💡 DIAGNÓSTICO: Senha incorreta')
    } else if (error.code === '3D000') {
      console.log('💡 DIAGNÓSTICO: Database não existe')
    } else if (error.code === '42P01') {
      console.log('💡 DIAGNÓSTICO: Tabela não existe')
    }
  } finally {
    await client.end()
  }
}

checkTables()