import {
  uploadImageBuffer,
  uploadImageBase64,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  generateOptimizedUrl,
  extractPublicIdFromUrl,
  isCloudinaryUrl,
  PRODUCT_UPLOAD_OPTIONS,
} from '../src/lib/cloudinary'

// Mock do Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      upload: jest.fn(),
      destroy: jest.fn(),
    },
    api: {
      delete_resources: jest.fn(),
    },
    url: jest.fn(),
  },
}))

const mockCloudinary = require('cloudinary').v2

describe('Cloudinary Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadImageBuffer', () => {
    it('deve fazer upload de buffer com sucesso', async () => {
      const mockResult = {
        public_id: 'pmcell/products/test_image',
        url: 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image.jpg',
        width: 800,
        height: 800,
        format: 'jpg',
      }

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        const stream = {
          end: jest.fn((buffer) => {
            callback(null, mockResult)
          }),
        }
        return stream
      })

      const buffer = Buffer.from('fake image data')
      const result = await uploadImageBuffer(buffer)

      expect(result).toEqual(mockResult)
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'pmcell/products',
          quality: 'auto:good',
          fetch_format: 'auto',
        }),
        expect.any(Function)
      )
    })

    it('deve rejeitar em caso de erro', async () => {
      const mockError = new Error('Upload failed')

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        const stream = {
          end: jest.fn((buffer) => {
            callback(mockError, null)
          }),
        }
        return stream
      })

      const buffer = Buffer.from('fake image data')

      await expect(uploadImageBuffer(buffer)).rejects.toThrow('Upload failed')
    })
  })

  describe('uploadImageBase64', () => {
    it('deve fazer upload de base64 com sucesso', async () => {
      const mockResult = {
        public_id: 'pmcell/products/test_image',
        url: 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image.jpg',
      }

      mockCloudinary.uploader.upload.mockImplementation((base64, options, callback) => {
        callback(null, mockResult)
      })

      const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'
      const result = await uploadImageBase64(base64)

      expect(result).toEqual(mockResult)
      expect(mockCloudinary.uploader.upload).toHaveBeenCalledWith(
        base64,
        expect.objectContaining({
          folder: 'pmcell/products',
          quality: 'auto:good',
          fetch_format: 'auto',
        }),
        expect.any(Function)
      )
    })
  })

  describe('uploadMultipleImages', () => {
    it('deve fazer upload de múltiplas imagens', async () => {
      const mockResult = {
        public_id: 'pmcell/products/test_image',
        url: 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image.jpg',
      }

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        const stream = {
          end: jest.fn((buffer) => {
            callback(null, { ...mockResult, public_id: `${mockResult.public_id}_${Math.random()}` })
          }),
        }
        return stream
      })

      const buffers = [Buffer.from('image1'), Buffer.from('image2')]
      const results = await uploadMultipleImages(buffers)

      expect(results).toHaveLength(2)
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledTimes(2)
    })
  })

  describe('deleteImage', () => {
    it('deve deletar imagem com sucesso', async () => {
      const mockResult = { result: 'ok' }
      mockCloudinary.uploader.destroy.mockResolvedValue(mockResult)

      const result = await deleteImage('pmcell/products/test_image')

      expect(result).toEqual(mockResult)
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith('pmcell/products/test_image')
    })
  })

  describe('deleteMultipleImages', () => {
    it('deve deletar múltiplas imagens', async () => {
      const mockResult = { deleted: { 'test1': 'deleted', 'test2': 'deleted' } }
      mockCloudinary.api.delete_resources.mockResolvedValue(mockResult)

      const publicIds = ['test1', 'test2']
      const result = await deleteMultipleImages(publicIds)

      expect(result).toEqual(mockResult)
      expect(mockCloudinary.api.delete_resources).toHaveBeenCalledWith(publicIds)
    })
  })

  describe('generateOptimizedUrl', () => {
    it('deve gerar URL otimizada', () => {
      const mockUrl = 'https://res.cloudinary.com/test/image/upload/c_fill,q_auto:good,w_400,h_400/test_image.jpg'
      mockCloudinary.url.mockReturnValue(mockUrl)

      const result = generateOptimizedUrl('test_image', 400, 400)

      expect(result).toBe(mockUrl)
      expect(mockCloudinary.url).toHaveBeenCalledWith('test_image', {
        quality: 'auto:good',
        width: 400,
        height: 400,
        crop: 'fill',
        fetch_format: 'auto',
      })
    })
  })

  describe('extractPublicIdFromUrl', () => {
    it('deve extrair public_id de URL válida', () => {
      const url = 'https://res.cloudinary.com/test/image/upload/v123/pmcell/products/test_image.jpg'
      const result = extractPublicIdFromUrl(url)

      expect(result).toBe('pmcell/products/test_image')
    })

    it('deve extrair public_id de URL sem versão', () => {
      const url = 'https://res.cloudinary.com/test/image/upload/pmcell/products/test_image.jpg'
      const result = extractPublicIdFromUrl(url)

      expect(result).toBe('pmcell/products/test_image')
    })

    it('deve retornar null para URL inválida', () => {
      const url = 'https://example.com/image.jpg'
      const result = extractPublicIdFromUrl(url)

      expect(result).toBeNull()
    })
  })

  describe('isCloudinaryUrl', () => {
    it('deve identificar URL do Cloudinary', () => {
      const url = 'https://res.cloudinary.com/test/image/upload/v123/test.jpg'
      const result = isCloudinaryUrl(url)

      expect(result).toBe(true)
    })

    it('deve rejeitar URL que não é do Cloudinary', () => {
      const url = 'https://example.com/image.jpg'
      const result = isCloudinaryUrl(url)

      expect(result).toBe(false)
    })

    it('deve rejeitar URL de base64', () => {
      const url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'
      const result = isCloudinaryUrl(url)

      expect(result).toBe(false)
    })
  })

  describe('PRODUCT_UPLOAD_OPTIONS', () => {
    it('deve ter configurações padrão corretas', () => {
      expect(PRODUCT_UPLOAD_OPTIONS).toEqual({
        folder: 'pmcell/products',
        quality: 'auto:good',
        fetch_format: 'auto',
        width: 800,
        height: 800,
        crop: 'limit',
      })
    })
  })
})