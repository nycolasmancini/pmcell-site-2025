import { supabase } from './supabase'

export async function uploadProductImage(file: File, index: number): Promise<string | null> {
  try {
    // Usar cliente regular - assumir que bucket já existe ou será criado manualmente
    const storageClient = supabase

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${index}_${randomString}_${cleanFileName}`

    // Fazer upload do arquivo
    const { data, error: uploadError } = await storageClient.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return null
    }

    // Obter URL pública
    const { data: { publicUrl } } = storageClient.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Erro geral no upload:', error)
    return null
  }
}

export async function ensureStorageBucket(): Promise<boolean> {
  try {
    // Tentar fazer um teste de upload para verificar se o bucket existe e está acessível
    const testFileName = `test_${Date.now()}.txt`
    const testFile = new Blob(['test'], { type: 'text/plain' })
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFileName, testFile)
    
    if (uploadError) {
      console.error('Erro ao testar bucket:', uploadError)
      return false
    }
    
    // Remove o arquivo de teste
    await supabase.storage
      .from('product-images')
      .remove([testFileName])
    
    return true
  } catch (error) {
    console.error('Erro ao garantir bucket:', error)
    return false
  }
}