import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()
    
    if (!sql) {
      return NextResponse.json({
        success: false,
        error: 'SQL query is required'
      }, { status: 400 })
    }

    // Use native postgres connection
    const { Pool } = require('pg')
    
    // Extract connection details from DATABASE_URL or DIRECT_URL
    const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'No database URL configured'
      }, { status: 500 })
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    try {
      const result = await pool.query(sql)
      await pool.end()
      
      return NextResponse.json({
        success: true,
        rowCount: result.rowCount,
        rows: result.rows?.slice(0, 10) // Limit output
      })
    } catch (dbError) {
      await pool.end()
      throw dbError
    }

  } catch (error) {
    console.error('SQL execution error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}