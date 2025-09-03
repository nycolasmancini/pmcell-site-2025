import { NextRequest, NextResponse } from 'next/server'
import { prisma, testDatabaseConnection, checkDatabaseTables } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Testar conexão com banco
    const dbConnected = await testDatabaseConnection()
    
    if (!dbConnected) {
      return NextResponse.json({
        status: 'error',
        message: 'Não foi possível conectar ao banco de dados',
        dbConnected: false
      }, { status: 500 })
    }

    // Verificar se tabelas existem
    const tablesExist = await checkDatabaseTables()
    
    // Verificar se existe algum admin
    let hasAdmin = false
    let adminCount = 0
    
    try {
      if (tablesExist) {
        adminCount = await prisma.user.count({
          where: { role: UserRole.ADMIN }
        })
        hasAdmin = adminCount > 0
      }
    } catch (error) {
      console.log('Erro ao verificar admins:', error)
    }

    // Verificar admin legado
    let hasLegacyAdmin = false
    try {
      const legacyCount = await prisma.admin.count()
      hasLegacyAdmin = legacyCount > 0
    } catch (error) {
      console.log('Tabela Admin legada não encontrada')
    }

    return NextResponse.json({
      status: 'success',
      dbConnected,
      tablesExist,
      hasAdmin,
      hasLegacyAdmin,
      adminCount,
      needsSetup: !hasAdmin && !hasLegacyAdmin
    })
  } catch (error) {
    console.error('Erro no setup:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      dbConnected: false
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create_tables') {
      // Tentar criar as tabelas via raw SQL
      try {
        // Criar enum UserRole
        await prisma.$executeRaw`
          DO $$ BEGIN
            CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `

        // Criar tabela User
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "User" (
            id TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "User_pkey" PRIMARY KEY (id),
            CONSTRAINT "User_email_key" UNIQUE (email)
          );
        `

        return NextResponse.json({
          status: 'success',
          message: 'Tabelas criadas com sucesso'
        })
      } catch (error) {
        console.error('Erro ao criar tabelas:', error)
        return NextResponse.json({
          status: 'error',
          message: 'Erro ao criar tabelas: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
        }, { status: 500 })
      }
    }

    if (action === 'create_admin') {
      const { email, password, name } = body

      if (!email || !password || !name) {
        return NextResponse.json({
          status: 'error',
          message: 'Email, senha e nome são obrigatórios'
        }, { status: 400 })
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const admin = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: UserRole.ADMIN,
            isActive: true
          }
        })

        return NextResponse.json({
          status: 'success',
          message: 'Admin criado com sucesso',
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
          }
        })
      } catch (error) {
        console.error('Erro ao criar admin:', error)
        return NextResponse.json({
          status: 'error',
          message: 'Erro ao criar admin: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
        }, { status: 500 })
      }
    }

    if (action === 'run_seed') {
      // Executar partes do seed
      try {
        const adminPassword = await bcrypt.hash('admin123', 10)
        const employeePassword = await bcrypt.hash('func123', 10)

        // Criar admin
        const admin = await prisma.user.upsert({
          where: { email: 'admin@pmcell.com.br' },
          update: {},
          create: {
            email: 'admin@pmcell.com.br',
            password: adminPassword,
            name: 'Administrador PMCELL',
            role: UserRole.ADMIN,
            isActive: true
          }
        })

        // Criar funcionário exemplo
        const employee = await prisma.user.upsert({
          where: { email: 'funcionario@pmcell.com.br' },
          update: {},
          create: {
            email: 'funcionario@pmcell.com.br',
            password: employeePassword,
            name: 'Funcionário Exemplo',
            role: UserRole.EMPLOYEE,
            isActive: true
          }
        })

        return NextResponse.json({
          status: 'success',
          message: 'Usuários criados com sucesso',
          users: [
            { email: admin.email, role: admin.role },
            { email: employee.email, role: employee.role }
          ]
        })
      } catch (error) {
        console.error('Erro no seed:', error)
        return NextResponse.json({
          status: 'error',
          message: 'Erro no seed: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      status: 'error',
      message: 'Ação não reconhecida'
    }, { status: 400 })

  } catch (error) {
    console.error('Erro no POST setup:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}