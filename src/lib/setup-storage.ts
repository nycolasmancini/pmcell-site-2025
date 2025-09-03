import { supabase } from './supabase'

export async function setupStorage() {
  try {
    // Criar bucket para imagens de produtos
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Erro ao criar bucket:', bucketError)
      return { success: false, error: bucketError }
    }

    // Definir política de acesso público para leitura
    const { error: policyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'product-images',
      policy_name: 'Public read access',
      definition: 'true'
    })

    if (policyError && !policyError.message.includes('already exists')) {
      console.log('Aviso: Não foi possível criar política automaticamente:', policyError.message)
      console.log('Configure manualmente no painel do Supabase:')
      console.log('1. Vá para Storage > Policies')
      console.log('2. Crie uma nova política para o bucket product-images')
      console.log('3. Operação: SELECT (read)')
      console.log('4. Target roles: public')
      console.log('5. Policy definition: true')
    }

    console.log('Bucket product-images configurado com sucesso!')
    return { success: true }
  } catch (error) {
    console.error('Erro no setup do storage:', error)
    return { success: false, error }
  }
}