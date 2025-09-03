require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { v2: cloudinary } = require('cloudinary')

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadImageBase64(base64Data, options = {}) {
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
          reject(error)
        } else if (result) {
          resolve(result)
        } else {
          reject(new Error('Resultado do upload está vazio'))
        }
      }
    )
  })
}

async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    throw error
  }
}

const prisma = new PrismaClient()

async function migrateImagesToCloudinary() {
  console.log('🔄 Iniciando migração de imagens para Cloudinary...')
  
  try {
    // Buscar todas as imagens que ainda são base64
    const images = await prisma.productImage.findMany({
      where: {
        OR: [
          { url: { startsWith: 'data:' } },
          { cloudinaryId: null }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`📊 Encontradas ${images.length} imagens para migrar`)

    let successCount = 0
    let errorCount = 0

    for (const [index, image] of images.entries()) {
      try {
        console.log(`\n🔄 Processando imagem ${index + 1}/${images.length}: ${image.fileName}`)
        
        // Verificar se já é URL do Cloudinary
        if (image.url.includes('cloudinary.com')) {
          console.log(`✅ Imagem já está no Cloudinary: ${image.id}`)
          
          // Extrair public_id da URL para salvar
          const publicIdMatch = image.url.match(/\/image\/upload\/(?:v\d+\/)?([^.]+)/)
          if (publicIdMatch) {
            await prisma.productImage.update({
              where: { id: image.id },
              data: { cloudinaryId: publicIdMatch[1] }
            })
          }
          
          successCount++
          continue
        }

        // Fazer upload da imagem base64 para Cloudinary
        const uploadResult = await uploadImageBase64(image.url, {
          folder: 'pmcell/products/migrated',
          public_id: `migrated_${image.product.id}_${index}_${Date.now()}`,
          quality: 'auto:good',
          fetch_format: 'auto',
          width: 800,
          height: 800,
          crop: 'limit',
        })

        console.log(`📤 Upload realizado: ${uploadResult.secure_url}`)

        // Atualizar imagem no banco com a nova URL
        await prisma.productImage.update({
          where: { id: image.id },
          data: {
            url: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
          }
        })

        console.log(`✅ Imagem migrada: ${image.fileName} -> ${uploadResult.public_id}`)
        successCount++

        // Pausa pequena para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ Erro ao migrar imagem ${image.fileName}:`, error)
        errorCount++
      }
    }

    console.log(`\n✅ Migração concluída:`)
    console.log(`   Sucessos: ${successCount}`)
    console.log(`   Erros: ${errorCount}`)
    console.log(`   Total: ${images.length}`)

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Função para reverter migração (se necessário)
async function rollbackMigration() {
  console.log('⚠️  Iniciando rollback da migração...')
  
  try {
    const images = await prisma.productImage.findMany({
      where: {
        cloudinaryId: { not: null },
        url: { contains: 'cloudinary.com' }
      }
    })

    console.log(`📊 Encontradas ${images.length} imagens no Cloudinary para rollback`)

    for (const image of images) {
      try {
        // Deletar do Cloudinary
        if (image.cloudinaryId) {
          await deleteImage(image.cloudinaryId)
          console.log(`🗑️  Deletada do Cloudinary: ${image.cloudinaryId}`)
        }

        // Remover cloudinaryId do banco (manter URL para referência)
        await prisma.productImage.update({
          where: { id: image.id },
          data: { cloudinaryId: null }
        })

      } catch (error) {
        console.error(`❌ Erro no rollback da imagem ${image.id}:`, error)
      }
    }

    console.log('✅ Rollback concluído')

  } catch (error) {
    console.error('❌ Erro durante rollback:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2)

if (args.includes('--rollback')) {
  rollbackMigration()
} else if (args.includes('--help')) {
  console.log('📚 Script de migração de imagens para Cloudinary')
  console.log('')
  console.log('Uso:')
  console.log('  node scripts/migrate-images-to-cloudinary.js          # Migrar imagens')
  console.log('  node scripts/migrate-images-to-cloudinary.js --rollback # Reverter migração')
  console.log('  node scripts/migrate-images-to-cloudinary.js --help     # Mostrar ajuda')
} else {
  migrateImagesToCloudinary()
}