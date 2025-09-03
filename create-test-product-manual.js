// Script para criar produto de teste manualmente via API

const FormData = require('form-data');
const fetch = require('node-fetch');

async function createTestProduct() {
  console.log('🧪 Criando produto de teste via API...\n');

  // Criar FormData simulando o formulário do admin
  const formData = new FormData();
  
  // Dados do produto
  formData.append('name', 'Cabo USB-C Premium TESTE');
  formData.append('subname', 'Carregamento ultra rápido');
  formData.append('description', 'Cabo USB-C premium com tecnologia de carregamento rápido e certificação de qualidade. Compatível com todos os dispositivos USB-C.');
  formData.append('brand', 'TechMax Pro');
  formData.append('price', '15.90');
  formData.append('superWholesalePrice', '12.50');
  formData.append('superWholesaleQuantity', '50');
  formData.append('cost', '8.00');
  
  // Precisamos pegar um categoryId válido primeiro
  try {
    console.log('📋 Buscando categorias disponíveis...');
    const categoriesResponse = await fetch('https://pmcellvendas.vercel.app/api/categories');
    const categories = await categoriesResponse.json();
    
    if (categories && categories.length > 0) {
      const category = categories.find(c => c.name.toLowerCase().includes('cabo')) || categories[0];
      formData.append('categoryId', category.id);
      console.log(`✅ Categoria selecionada: ${category.name} (${category.id})`);
    } else {
      console.error('❌ Nenhuma categoria encontrada');
      return;
    }
    
    // Dados opcionais de fornecedor
    formData.append('supplierName', 'Fornecedor Teste');
    formData.append('supplierPhone', '11999999999');
    
    console.log('\n📤 Enviando produto para API...');
    
    // Enviar para API
    const response = await fetch('https://pmcellvendas.vercel.app/api/products', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ PRODUTO CRIADO COM SUCESSO!');
      console.log('\n📊 Dados do produto criado:');
      console.log(`ID: ${result.id}`);
      console.log(`Nome: ${result.name}`);
      console.log(`Subname: ${result.subname}`);
      console.log(`Marca: ${result.brand}`);
      console.log(`Preço: R$ ${result.price}`);
      console.log(`Super Atacado: R$ ${result.superWholesalePrice} (${result.superWholesaleQuantity}+ un)`);
      console.log(`Custo: R$ ${result.cost}`);
      
      console.log('\n🎯 TESTE DE VERIFICAÇÃO:');
      console.log('1. Acesse: pmcellvendas.vercel.app');
      console.log('2. Libere os preços');
      console.log('3. Procure pelo produto "Cabo USB-C Premium TESTE"');
      console.log('4. Deve mostrar: "+50 un: R$ 12,50"');
      console.log('5. Adicione 40 unidades ao carrinho');
      console.log('6. Modal "Economize levando mais" deve aparecer');
      console.log('7. Adicione mais 10 unidades');
      console.log('8. Preço deve mudar para R$ 12,50 por unidade');
      
    } else {
      console.error('❌ ERRO ao criar produto:');
      console.error(result);
    }
    
  } catch (error) {
    console.error('❌ ERRO na requisição:', error.message);
  }
}

// Executar o teste
createTestProduct();