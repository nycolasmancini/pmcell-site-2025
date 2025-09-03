import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Função para testar conexão
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Banco de dados conectado com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error)
    return false
  }
}

// Função para verificar se as tabelas existem
export async function checkDatabaseTables() {
  try {
    await prisma.user.findFirst()
    console.log('✅ Tabela User encontrada')
    return true
  } catch (error) {
    console.log('⚠️ Tabela User não encontrada, usando fallback')
    return false
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma