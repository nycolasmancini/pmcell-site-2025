# Configuração do Supabase Storage

## Problema Resolvido ✅
O sistema agora funciona com uma **solução temporária usando Base64** para armazenar imagens diretamente no banco de dados.

**Status Atual:** ✅ Funcionando com upload de imagens Base64  
**Próximo Passo:** Migrar para Supabase Storage (opcional, para melhor performance)

## Solução Atual - Base64 (Funcionando)
As imagens são convertidas para Base64 e armazenadas no banco PostgreSQL. Isso funciona perfeitamente para o seu uso atual.

## Configuração Opcional - Supabase Storage (Para Performance Otimizada)

### 1. Acesse o Painel do Supabase
1. Vá para https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto pmcell-vendas

### 2. Criar o Bucket
1. No menu lateral, clique em **Storage**
2. Clique no botão **Create bucket**
3. Configure o bucket com os seguintes dados:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Marque como público**
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,image/gif`
   - **File size limit**: `5242880` (5MB)
4. Clique em **Create bucket**

### 3. Configurar Políticas de Acesso (RLS)
1. Após criar o bucket, clique nele
2. Vá para a aba **Policies**
3. Clique em **Add policy**
4. Escolha **Custom policy**
5. Configure a política:
   - **Policy name**: `Public read access`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **USING expression**: `true`
6. Clique em **Save policy**

### 4. (Opcional) Política para Upload
Se você quiser permitir upload público:
1. Adicione outra política
2. Configure:
   - **Policy name**: `Public upload access`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `public`
   - **USING expression**: `true`

### 5. Teste
Após configurar, teste adicionando um produto com imagem no painel administrativo.

## Alternativa - Via SQL
Execute este SQL no Supabase SQL Editor:

```sql
-- Inserir bucket na tabela storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Criar política de leitura pública
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Criar política de upload (opcional)
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'product-images');
```

## Verificação
Para verificar se está funcionando, vá para Storage > product-images e veja se o bucket aparece listado.