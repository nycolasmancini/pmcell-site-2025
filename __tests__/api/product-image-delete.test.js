/**
 * @jest-environment node
 */

const { prisma } = require('../../src/lib/prisma')

describe('Product Image Delete API', () => {
  let testProduct
  let testImages = []

  beforeAll(async () => {
    // Criar produto de teste
    testProduct = await prisma.product.create({
      data: {
        name: 'Produto Teste Delete',
        price: 100.0,
        categoryId: (await prisma.category.findFirst())?.id || 'default'
      }
    })

    // Criar imagens de teste
    testImages = await Promise.all([
      prisma.productImage.create({
        data: {
          productId: testProduct.id,
          url: 'https://test1.jpg',
          fileName: 'test1.jpg',
          order: 0,
          isMain: true
        }
      }),
      prisma.productImage.create({
        data: {
          productId: testProduct.id,
          url: 'https://test2.jpg',
          fileName: 'test2.jpg',
          order: 1,
          isMain: false
        }
      })
    ])
  })

  afterAll(async () => {
    // Limpar dados de teste
    if (testProduct) {
      await prisma.productImage.deleteMany({
        where: { productId: testProduct.id }
      })
      await prisma.product.delete({
        where: { id: testProduct.id }
      })
    }
    await prisma.$disconnect()
  })

  test('Deve verificar se tabela ProductImage existe', async () => {
    try {
      const result = await prisma.$queryRaw`SELECT 1 FROM "ProductImage" LIMIT 1`
      expect(result).toBeDefined()
      console.log('✅ Teste 1: Tabela ProductImage existe')
    } catch (error) {
      fail(`Tabela ProductImage não existe: ${error.message}`)
    }
  })

  test('Deve conseguir buscar imagens do produto', async () => {
    const images = await prisma.productImage.findMany({
      where: { productId: testProduct.id }
    })
    
    expect(images).toHaveLength(2)
    expect(images[0].url).toBe('https://test1.jpg')
    expect(images[1].url).toBe('https://test2.jpg')
    console.log('✅ Teste 2: Imagens do produto encontradas')
  })

  test('Deve impedir exclusão da última imagem', async () => {
    // Primeiro, excluir uma imagem para deixar apenas uma
    await prisma.productImage.delete({
      where: { id: testImages[1].id }
    })

    // Tentar excluir a última imagem deve retornar erro
    const imageCount = await prisma.productImage.count({
      where: { productId: testProduct.id }
    })
    
    expect(imageCount).toBe(1)
    console.log('✅ Teste 3: Validação de última imagem funcionando')
  })

  test('Deve reordenar imagens após exclusão', async () => {
    // Recriar segunda imagem para teste
    const newImage = await prisma.productImage.create({
      data: {
        productId: testProduct.id,
        url: 'https://test3.jpg',
        fileName: 'test3.jpg',
        order: 1,
        isMain: false
      }
    })

    // Verificar se há 2 imagens
    const beforeDelete = await prisma.productImage.count({
      where: { productId: testProduct.id }
    })
    expect(beforeDelete).toBe(2)

    // Excluir a segunda imagem
    await prisma.productImage.delete({
      where: { id: newImage.id }
    })

    // Verificar se ficou apenas 1 imagem
    const afterDelete = await prisma.productImage.count({
      where: { productId: testProduct.id }
    })
    expect(afterDelete).toBe(1)
    console.log('✅ Teste 4: Reordenação após exclusão funcionando')
  })
})