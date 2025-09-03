/**
 * Script para executar migração das tabelas Analytics em produção
 * Este script deve ser executado apenas uma vez para criar as tabelas necessárias
 */

const { Pool } = require('pg')

async function migrateAnalyticsTables() {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não configurada')
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : undefined
  })

  try {
    console.log('🔄 Verificando se tabelas Analytics existem...')
    
    // Verificar se AnalyticsSession existe
    const checkTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'AnalyticsSession'
    `)
    
    if (checkTable.rows.length > 0) {
      console.log('✅ Tabelas Analytics já existem!')
      return { success: true, message: 'Tabelas já existem' }
    }

    console.log('🔧 Criando tabelas Analytics...')
    
    // Executar migração completa
    await pool.query(`
      -- CreateEnum
      DO $$ BEGIN
        CREATE TYPE "public"."CartEventType" AS ENUM ('ADD', 'REMOVE', 'UPDATE', 'CLEAR', 'COMPLETE', 'ABANDON');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- CreateTable AnalyticsSession
      CREATE TABLE IF NOT EXISTS "public"."AnalyticsSession" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "whatsapp" TEXT,
          "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "timeOnSite" INTEGER NOT NULL DEFAULT 0,
          "whatsappCollectedAt" TIMESTAMP(3),
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable PageView
      CREATE TABLE IF NOT EXISTS "public"."PageView" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "path" TEXT NOT NULL,
          "title" TEXT,
          "duration" INTEGER,
          "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable CategoryVisit
      CREATE TABLE IF NOT EXISTS "public"."CategoryVisit" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "categoryId" TEXT NOT NULL,
          "categoryName" TEXT NOT NULL,
          "visits" INTEGER NOT NULL DEFAULT 1,
          "lastVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "hasCartItems" BOOLEAN NOT NULL DEFAULT false,
          "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "CategoryVisit_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable ProductView
      CREATE TABLE IF NOT EXISTS "public"."ProductView" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "productName" TEXT NOT NULL,
          "categoryName" TEXT,
          "visits" INTEGER NOT NULL DEFAULT 1,
          "lastView" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "addedToCart" BOOLEAN NOT NULL DEFAULT false,
          "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable SearchHistory
      CREATE TABLE IF NOT EXISTS "public"."SearchHistory" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "term" TEXT NOT NULL,
          "count" INTEGER NOT NULL DEFAULT 1,
          "lastSearch" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable CartEvent
      CREATE TABLE IF NOT EXISTS "public"."CartEvent" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "type" "public"."CartEventType" NOT NULL,
          "productId" TEXT NOT NULL,
          "productName" TEXT,
          "quantity" INTEGER NOT NULL,
          "unitPrice" DOUBLE PRECISION,
          "totalPrice" DOUBLE PRECISION,
          "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "CartEvent_pkey" PRIMARY KEY ("id")
      );

      -- CreateIndex
      CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsSession_sessionId_key" ON "public"."AnalyticsSession"("sessionId");
      CREATE INDEX IF NOT EXISTS "AnalyticsSession_whatsapp_idx" ON "public"."AnalyticsSession"("whatsapp");
      CREATE INDEX IF NOT EXISTS "AnalyticsSession_lastActivity_idx" ON "public"."AnalyticsSession"("lastActivity");
      CREATE INDEX IF NOT EXISTS "AnalyticsSession_createdAt_idx" ON "public"."AnalyticsSession"("createdAt");

      CREATE INDEX IF NOT EXISTS "PageView_sessionId_idx" ON "public"."PageView"("sessionId");
      CREATE INDEX IF NOT EXISTS "PageView_timestamp_idx" ON "public"."PageView"("timestamp");

      CREATE UNIQUE INDEX IF NOT EXISTS "CategoryVisit_sessionId_categoryId_key" ON "public"."CategoryVisit"("sessionId", "categoryId");
      CREATE INDEX IF NOT EXISTS "CategoryVisit_sessionId_idx" ON "public"."CategoryVisit"("sessionId");
      CREATE INDEX IF NOT EXISTS "CategoryVisit_timestamp_idx" ON "public"."CategoryVisit"("timestamp");

      CREATE UNIQUE INDEX IF NOT EXISTS "ProductView_sessionId_productId_key" ON "public"."ProductView"("sessionId", "productId");
      CREATE INDEX IF NOT EXISTS "ProductView_sessionId_idx" ON "public"."ProductView"("sessionId");
      CREATE INDEX IF NOT EXISTS "ProductView_productId_idx" ON "public"."ProductView"("productId");
      CREATE INDEX IF NOT EXISTS "ProductView_timestamp_idx" ON "public"."ProductView"("timestamp");

      CREATE UNIQUE INDEX IF NOT EXISTS "SearchHistory_sessionId_term_key" ON "public"."SearchHistory"("sessionId", "term");
      CREATE INDEX IF NOT EXISTS "SearchHistory_sessionId_idx" ON "public"."SearchHistory"("sessionId");
      CREATE INDEX IF NOT EXISTS "SearchHistory_timestamp_idx" ON "public"."SearchHistory"("timestamp");

      CREATE INDEX IF NOT EXISTS "CartEvent_sessionId_idx" ON "public"."CartEvent"("sessionId");
      CREATE INDEX IF NOT EXISTS "CartEvent_type_idx" ON "public"."CartEvent"("type");
      CREATE INDEX IF NOT EXISTS "CartEvent_timestamp_idx" ON "public"."CartEvent"("timestamp");

      -- AddForeignKey
      ALTER TABLE "public"."PageView" ADD CONSTRAINT IF NOT EXISTS "PageView_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AnalyticsSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "public"."CategoryVisit" ADD CONSTRAINT IF NOT EXISTS "CategoryVisit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AnalyticsSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "public"."ProductView" ADD CONSTRAINT IF NOT EXISTS "ProductView_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AnalyticsSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "public"."SearchHistory" ADD CONSTRAINT IF NOT EXISTS "SearchHistory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AnalyticsSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "public"."CartEvent" ADD CONSTRAINT IF NOT EXISTS "CartEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."AnalyticsSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
    `)

    console.log('✅ Tabelas Analytics criadas com sucesso!')
    return { success: true, message: 'Migração executada com sucesso' }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateAnalyticsTables()
    .then(result => {
      console.log('✅ Migração concluída:', result.message)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Falha na migração:', error.message)
      process.exit(1)
    })
}

module.exports = { migrateAnalyticsTables }