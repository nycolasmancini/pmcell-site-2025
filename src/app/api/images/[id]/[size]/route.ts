import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { query as dbQuery, testConnection } from '@/lib/db'
import { imageCache, getCacheKey } from '@/lib/cache'
import sharp from 'sharp'

type ImageSize = 'thumbnail' | 'medium' | 'full'

interface CachedImage {
  buffer: Buffer
  contentType: string
}

const SIZES = {
  thumbnail: { width: 150, height: 150, quality: 70 },
  medium: { width: 400, height: 400, quality: 80 },
  full: { width: 1200, height: 1200, quality: 90 }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; size: string }> }
) {
  try {
    const { id, size } = await params
    
    // Validar parâmetros
    if (!id || !size || !['thumbnail', 'medium', 'full'].includes(size)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const imageSize = size as ImageSize
    const cacheKey = getCacheKey('image', id, size)
    
    // Verificar cache primeiro
    const cached = imageCache.get<CachedImage>(cacheKey)
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=604800, immutable', // 7 dias
          'X-Cache': 'HIT'
        }
      })
    }

    // Buscar imagem do banco
    let imageData: any
    
    if (process.env.NODE_ENV === 'production') {
      const isConnected = await testConnection()
      if (!isConnected) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
      }
      
      const result = await dbQuery(
        'SELECT url, "fileName" FROM "ProductImage" WHERE id = $1',
        [id]
      )
      imageData = result?.rows?.[0]
    } else {
      imageData = await prisma.productImage.findUnique({
        where: { id },
        select: { url: true, fileName: true }
      })
    }

    if (!imageData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Extrair dados base64
    const base64Data = imageData.url.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Processar imagem com Sharp para otimizar
    const sizeConfig = SIZES[imageSize]
    const processedBuffer = await sharp(buffer)
      .resize(sizeConfig.width, sizeConfig.height, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: sizeConfig.quality,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer()

    const contentType = 'image/jpeg'
    
    // Cachear imagem processada por 1 hora
    const cachedImageData: CachedImage = { buffer: processedBuffer, contentType }
    imageCache.set(cacheKey, cachedImageData, 1000 * 60 * 60)

    return new NextResponse(new Uint8Array(processedBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable', // 7 dias
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 })
  }
}