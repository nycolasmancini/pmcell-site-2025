import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock do Next.js
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ok: (options?.status || 200) < 400
    }))
  }
}))

// Mock do Prisma
const mockPrisma = {
  product: {
    findUnique: jest.fn()
  },
  productImage: {
    findMany: jest.fn(),
    create: jest.fn()
  }
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

// Mock das funções de imagem
const mockCloudinary = {
  uploadImageToCloudinary: jest.fn(),
  uploadImageWithFallback: jest.fn(),
  validateImage: jest.fn()
}

jest.mock('@/lib/cloudinary', () => mockCloudinary)

const mockImageUtils = {
  fileToBuffer: jest.fn(),
  generateUniqueFileName: jest.fn()
}

jest.mock('@/lib/image-utils', () => mockImageUtils)

describe('Image Upload System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup padrão para mocks
    mockCloudinary.validateImage.mockReturnValue({ valid: true })
    mockImageUtils.fileToBuffer.mockResolvedValue(Buffer.from('fake-image-data'))
    mockImageUtils.generateUniqueFileName.mockReturnValue('unique-filename.webp')
    const mockUploadResult = {
      secure_url: 'https://cloudinary.com/image.webp',
      public_id: 'public-id',
      bytes: 123456,
      width: 500,
      height: 500,
      thumbnailUrl: 'https://cloudinary.com/image_thumbnail.webp',
      normalUrl: 'https://cloudinary.com/image_normal.webp'
    }
    mockCloudinary.uploadImageToCloudinary.mockResolvedValue(mockUploadResult)
    mockCloudinary.uploadImageWithFallback.mockResolvedValue(mockUploadResult)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Upload para Produto Novo (Temporário)', () => {
    test('deve aceitar upload temporário com sucesso', async () => {
      const { POST } = await import('@/app/api/products/upload-temp/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(200)
      expect(mockCloudinary.uploadImageWithFallback).toHaveBeenCalledTimes(1)
    })

    test('deve rejeitar mais de 4 imagens', async () => {
      const { POST } = await import('@/app/api/products/upload-temp/route')
      
      const formData = new FormData()
      for (let i = 0; i < 5; i++) {
        const mockFile = new File(['fake-image'], `test${i}.jpg`, { type: 'image/jpeg' })
        formData.append('images', mockFile)
      }
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })

    test('deve validar formato de imagem', async () => {
      mockCloudinary.validateImage.mockReturnValue({ 
        valid: false, 
        error: 'Formato não suportado' 
      })
      
      const { POST } = await import('@/app/api/products/upload-temp/route')
      
      const mockFile = new File(['fake-image'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })
  })

  describe('Upload para Produto Existente', () => {
    test('deve verificar se produto existe', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null)
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-inexistente' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(404)
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'produto-inexistente' },
        include: { images: true }
      })
    })

    test('deve respeitar limite de 4 imagens', async () => {
      const mockProduct = {
        id: 'produto-123',
        images: [
          { id: 'img1', order: 0 },
          { id: 'img2', order: 1 },
          { id: 'img3', order: 2 },
          { id: 'img4', order: 3 }
        ]
      }
      
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(400)
    })

    test('deve fazer upload com sucesso para produto com espaço', async () => {
      const mockProduct = {
        id: 'produto-123',
        images: []
      }
      
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productImage.create.mockResolvedValue({
        id: 'nova-imagem',
        productId: 'produto-123',
        url: 'https://cloudinary.com/image.webp',
        fileName: 'test.jpg',
        order: 0,
        isMain: true
      })
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(200)
      expect(mockPrisma.productImage.create).toHaveBeenCalledWith({
        data: {
          productId: 'produto-123',
          url: 'https://cloudinary.com/image.webp',
          fileName: 'test.jpg',
          order: 0,
          isMain: true
        }
      })
    })

    test('deve tratar erro de upload do Cloudinary', async () => {
      const mockProduct = {
        id: 'produto-123',
        images: []
      }
      
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockCloudinary.uploadImageWithFallback.mockRejectedValue(new Error('Cloudinary não configurado'))
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(500) // O upload específico falha internamente com 500
    })
  })

  describe('Busca de Imagens', () => {
    test('deve buscar imagens ordenadas corretamente', async () => {
      const mockImages = [
        { id: 'img1', productId: 'produto-123', isMain: false, order: 1 },
        { id: 'img2', productId: 'produto-123', isMain: true, order: 0 }
      ]
      
      mockPrisma.productImage.findMany.mockResolvedValue(mockImages)
      
      const { GET } = await import('@/app/api/products/[id]/images/route')
      
      const mockRequest = {} as any
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await GET(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(200)
      expect(mockPrisma.productImage.findMany).toHaveBeenCalledWith({
        where: { productId: 'produto-123' },
        orderBy: [
          { isMain: 'desc' },
          { order: 'asc' }
        ]
      })
    })

    test('deve tratar erro ao buscar imagens', async () => {
      mockPrisma.productImage.findMany.mockRejectedValue(new Error('Database error'))
      
      const { GET } = await import('@/app/api/products/[id]/images/route')
      
      const mockRequest = {} as any
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await GET(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(500) // GET endpoint usa 500 por padrão
    })
  })

  describe('Validações de Edge Cases', () => {
    test('deve rejeitar arquivo vazio', async () => {
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const formData = new FormData()
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(400)
    })

    test('deve tratar erro de conversão para buffer', async () => {
      const mockProduct = {
        id: 'produto-123',
        images: []
      }
      
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockImageUtils.fileToBuffer.mockRejectedValue(new Error('Buffer conversion failed'))
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(500) // Erro interno de upload retorna 500
    })

    test('deve determinar isMain corretamente', async () => {
      const mockProduct = {
        id: 'produto-123',
        images: [
          { id: 'img1', order: 0, isMain: true }
        ]
      }
      
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productImage.create.mockResolvedValue({
        id: 'nova-imagem',
        productId: 'produto-123',
        url: 'https://cloudinary.com/image.webp',
        fileName: 'test.jpg',
        order: 1,
        isMain: false
      })
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(200)
      expect(mockPrisma.productImage.create).toHaveBeenCalledWith({
        data: {
          productId: 'produto-123',
          url: 'https://cloudinary.com/image.webp',
          fileName: 'test.jpg',
          order: 1,
          isMain: false // Não deve ser principal pois já existe uma
        }
      })
    })
  })

  describe('Configuração Cloudinary', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    test('deve detectar Cloudinary não configurado', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME
      delete process.env.CLOUDINARY_API_KEY
      delete process.env.CLOUDINARY_API_SECRET
      
      const { POST } = await import('@/app/api/products/upload-temp/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      // Deve ainda funcionar com fallback
      const response = await POST(mockRequest)
      expect(response.status).toBe(200)
    })

    test('deve usar Cloudinary quando configurado', async () => {
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
      process.env.CLOUDINARY_API_KEY = 'test-key'
      process.env.CLOUDINARY_API_SECRET = 'test-secret'
      
      const { POST } = await import('@/app/api/products/upload-temp/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(200)
      expect(mockCloudinary.uploadImageWithFallback).toHaveBeenCalled()
    })
  })

  describe('Cenários de Falha', () => {
    test('deve tratar erro de banco de dados', async () => {
      mockPrisma.product.findUnique.mockRejectedValue(new Error('Database connection failed'))
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('images', mockFile)
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(503)
    })

    test('deve tratar erro de FormData malformado', async () => {
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const mockRequest = {
        formData: () => Promise.reject(new Error('Invalid FormData'))
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(503)
    })
  })

  describe('Múltiplas Imagens', () => {
    test('deve processar múltiplas imagens em sequência', async () => {
      const mockProduct = {
        id: 'produto-123',
        images: []
      }
      
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockPrisma.productImage.create
        .mockResolvedValueOnce({
          id: 'img1',
          productId: 'produto-123',
          url: 'https://cloudinary.com/image1.webp',
          fileName: 'test1.jpg',
          order: 0,
          isMain: true
        })
        .mockResolvedValueOnce({
          id: 'img2',
          productId: 'produto-123',
          url: 'https://cloudinary.com/image2.webp',
          fileName: 'test2.jpg',
          order: 1,
          isMain: false
        })
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const formData = new FormData()
      formData.append('images', new File(['fake-image1'], 'test1.jpg', { type: 'image/jpeg' }))
      formData.append('images', new File(['fake-image2'], 'test2.jpg', { type: 'image/jpeg' }))
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(200)
      expect(mockPrisma.productImage.create).toHaveBeenCalledTimes(2)
    })

    test('deve falhar se uma imagem falhar no meio do processo', async () => {
      const mockProduct = {
        id: 'produto-123',
        images: []
      }
      
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct)
      mockCloudinary.uploadImageWithFallback
        .mockResolvedValueOnce({
          secure_url: 'https://cloudinary.com/image1.webp',
          public_id: 'public-id-1',
          bytes: 123456,
          width: 500,
          height: 500,
          thumbnailUrl: 'https://cloudinary.com/image1_thumbnail.webp',
          normalUrl: 'https://cloudinary.com/image1_normal.webp'
        })
        .mockRejectedValueOnce(new Error('Upload failed for second image'))
      
      const { POST } = await import('@/app/api/products/[id]/images/route')
      
      const formData = new FormData()
      formData.append('images', new File(['fake-image1'], 'test1.jpg', { type: 'image/jpeg' }))
      formData.append('images', new File(['fake-image2'], 'test2.jpg', { type: 'image/jpeg' }))
      
      const mockRequest = {
        formData: () => Promise.resolve(formData)
      } as any
      
      const mockParams = Promise.resolve({ id: 'produto-123' })
      
      const response = await POST(mockRequest, { params: mockParams })
      
      expect(response.status).toBe(500)
    })
  })
})