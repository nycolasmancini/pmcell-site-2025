import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
  type: string
  url: string
  secure_url: string
}

export interface UploadImageOptions {
  folder?: string
  public_id?: string
  quality?: string | number
  fetch_format?: string
  width?: number
  height?: number
  crop?: string
}

/**
 * Upload de imagem para Cloudinary a partir de buffer
 * @param buffer Buffer da imagem
 * @param options Opções de upload
 * @returns Promise com resultado do upload
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  options: UploadImageOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'pmcell/products',
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options,
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Erro no upload para Cloudinary:', error)
          reject(error)
        } else if (result) {
          resolve(result as CloudinaryUploadResult)
        } else {
          reject(new Error('Resultado do upload está vazio'))
        }
      }
    ).end(buffer)
  })
}

/**
 * Upload de imagem para Cloudinary a partir de base64
 * @param base64Data String base64 da imagem (com ou sem prefixo data:)
 * @param options Opções de upload
 * @returns Promise com resultado do upload
 */
export async function uploadImageBase64(
  base64Data: string,
  options: UploadImageOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'pmcell/products',
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options,
    }

    cloudinary.uploader.upload(
      base64Data,
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Erro no upload para Cloudinary:', error)
          reject(error)
        } else if (result) {
          resolve(result as CloudinaryUploadResult)
        } else {
          reject(new Error('Resultado do upload está vazio'))
        }
      }
    )
  })
}

/**
 * Upload de múltiplas imagens para Cloudinary
 * @param images Array de buffers ou base64
 * @param options Opções de upload
 * @returns Promise com array de resultados
 */
export async function uploadMultipleImages(
  images: (Buffer | string)[],
  options: UploadImageOptions = {}
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = images.map((image, index) => {
    const uploadOptions = {
      ...options,
      public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
    }

    if (Buffer.isBuffer(image)) {
      return uploadImageBuffer(image, uploadOptions)
    } else {
      return uploadImageBase64(image, uploadOptions)
    }
  })

  return Promise.all(uploadPromises)
}

/**
 * Deletar imagem do Cloudinary
 * @param publicId ID público da imagem no Cloudinary
 * @returns Promise com resultado da deleção
 */
export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('Imagem deletada do Cloudinary:', publicId)
    return result
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error)
    throw error
  }
}

/**
 * Deletar múltiplas imagens do Cloudinary
 * @param publicIds Array de IDs públicos das imagens
 * @returns Promise com resultado das deleções
 */
export async function deleteMultipleImages(publicIds: string[]): Promise<any> {
  try {
    const result = await cloudinary.api.delete_resources(publicIds)
    console.log('Imagens deletadas do Cloudinary:', publicIds)
    return result
  } catch (error) {
    console.error('Erro ao deletar imagens do Cloudinary:', error)
    throw error
  }
}

/**
 * Gerar URL otimizada para exibição
 * @param publicId ID público da imagem
 * @param width Largura desejada
 * @param height Altura desejada
 * @param quality Qualidade da imagem
 * @returns URL otimizada
 */
export function generateOptimizedUrl(
  publicId: string,
  width?: number,
  height?: number,
  quality: string | number = 'auto:good'
): string {
  return cloudinary.url(publicId, {
    quality,
    width,
    height,
    crop: width && height ? 'fill' : 'limit',
    fetch_format: 'auto',
  })
}

/**
 * Extrair public_id de uma URL do Cloudinary
 * @param url URL do Cloudinary
 * @returns Public ID ou null se não for válida
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Padrão: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const match = url.match(/\/image\/upload\/(?:v\d+\/)?([^.]+)/)
    return match ? match[1] : null
  } catch (error) {
    console.error('Erro ao extrair public_id da URL:', error)
    return null
  }
}

/**
 * Validar se é uma URL válida do Cloudinary
 * @param url URL para validar
 * @returns true se for válida
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') && url.includes('/image/upload/')
}

/**
 * Configuração padrão para upload de produtos
 */
export const PRODUCT_UPLOAD_OPTIONS: UploadImageOptions = {
  folder: 'pmcell/products',
  quality: 'auto:good',
  fetch_format: 'auto',
  width: 800,
  height: 800,
  crop: 'limit',
}