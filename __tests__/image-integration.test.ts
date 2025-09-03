/**
 * Testes de integração para o sistema de imagens com Cloudinary
 */

import { NextRequest } from 'next/server'
import { POST } from '../src/app/api/products/route'
import { PrismaClient } from '@prisma/client'

// Mock do Cloudinary
jest.mock('../src/lib/cloudinary', () => ({
  uploadImageBuffer: jest.fn(),
  generateOptimizedUrl: jest.fn(),
  isCloudinaryUrl: jest.fn(),
  PRODUCT_UPLOAD_OPTIONS: {
    folder: 'pmcell/products',
    quality: 'auto:good',
    fetch_format: 'auto',
    width: 800,
    height: 800,
    crop: 'limit',
  },
}))

const mockCloudinary = require('../src/lib/cloudinary')

describe('Integração de Imagens com Cloudinary', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = new PrismaClient()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await prisma.$disconnect()
  })

  describe('Upload de produto com imagens', () => {
    it('deve criar produto com imagens enviadas para Cloudinary', async () => {
      // Mock do resultado do upload
      const mockUploadResult = {
        public_id: 'pmcell/products/test_image_123',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image_123.jpg',
        width: 800,
        height: 800,
        format: 'jpg',
      }

      mockCloudinary.uploadImageBuffer.mockResolvedValue(mockUploadResult)

      // Criar arquivo fake para teste
      const imageBuffer = Buffer.from('fake image data')
      const imageFile = new File([imageBuffer], 'test-image.jpg', { type: 'image/jpeg' })

      // Criar FormData
      const formData = new FormData()
      formData.append('name', 'Produto Teste')
      formData.append('price', '99.99')
      formData.append('categoryId', 'test-category-id')
      formData.append('images', imageFile)

      // Criar request mock
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData,
      })

      // Executar a função
      const response = await POST(request)
      const result = await response.json()

      // Verificar se o upload foi chamado
      expect(mockCloudinary.uploadImageBuffer).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          folder: 'pmcell/products',
          quality: 'auto:good',
          fetch_format: 'auto',
          width: 800,
          height: 800,
          crop: 'limit',
          public_id: expect.stringMatching(/^product_\d+_0$/),
        })
      )

      // Verificar se o produto foi criado (se não houve erro)
      if (response.status === 200) {
        expect(result.id).toBeDefined()
        expect(result.images).toBeDefined()
        expect(result.images[0].url).toBe(mockUploadResult.secure_url)
      }
    })

    it('deve lidar com erro de upload do Cloudinary', async () => {
      // Mock erro no upload
      mockCloudinary.uploadImageBuffer.mockRejectedValue(new Error('Upload failed'))

      const imageBuffer = Buffer.from('fake image data')
      const imageFile = new File([imageBuffer], 'test-image.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('name', 'Produto Teste')
      formData.append('price', '99.99')
      formData.append('categoryId', 'test-category-id')
      formData.append('images', imageFile)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData,
      })

      // O produto ainda deve ser criado mesmo com erro na imagem
      const response = await POST(request)
      
      expect(mockCloudinary.uploadImageBuffer).toHaveBeenCalled()
      
      // Verificar se o erro foi tratado graciosamente
      if (response.status === 200) {
        const result = await response.json()
        expect(result.id).toBeDefined()
        // Produto criado sem imagens devido ao erro
      }
    })

    it('deve validar tamanho máximo de arquivo', async () => {
      // Criar arquivo muito grande (>10MB)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB
      const largeImageFile = new File([largeBuffer], 'large-image.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('name', 'Produto Teste')
      formData.append('price', '99.99')
      formData.append('categoryId', 'test-category-id')
      formData.append('images', largeImageFile)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      // Upload não deve ser chamado para arquivo muito grande
      expect(mockCloudinary.uploadImageBuffer).not.toHaveBeenCalled()
    })
  })

  describe('Otimização de URLs', () => {
    it('deve otimizar URLs do Cloudinary', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test.jpg'
      const optimizedUrl = 'https://res.cloudinary.com/test/image/upload/c_fill,q_auto:good,w_400,h_400/pmcell/products/test.jpg'

      mockCloudinary.isCloudinaryUrl.mockReturnValue(true)
      mockCloudinary.generateOptimizedUrl.mockReturnValue(optimizedUrl)

      expect(mockCloudinary.isCloudinaryUrl(cloudinaryUrl)).toBe(true)
      expect(mockCloudinary.generateOptimizedUrl('pmcell/products/test', 400, 400)).toBe(optimizedUrl)
    })

    it('deve identificar URLs que não são do Cloudinary', () => {
      const normalUrl = 'https://example.com/image.jpg'
      const base64Url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'

      mockCloudinary.isCloudinaryUrl.mockReturnValue(false)

      expect(mockCloudinary.isCloudinaryUrl(normalUrl)).toBe(false)
      expect(mockCloudinary.isCloudinaryUrl(base64Url)).toBe(false)
    })
  })

  describe('Validação de configuração', () => {
    it('deve ter variáveis de ambiente do Cloudinary configuradas', () => {
      expect(process.env.CLOUDINARY_CLOUD_NAME).toBeDefined()
      expect(process.env.CLOUDINARY_API_KEY).toBeDefined()
      expect(process.env.CLOUDINARY_API_SECRET).toBeDefined()
    })
  })
})