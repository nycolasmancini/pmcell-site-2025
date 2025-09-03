# Plano de Desenvolvimento - Site de Vendas PMCELL São Paulo

## 📋 Visão Geral do Projeto
Plataforma B2B para lojistas comprarem acessórios para celular no atacado. Sistema de catálogo online com carrinho de compras, onde o fechamento do pedido é finalizado via WhatsApp.

## 🎯 Objetivos Principais
1. Catálogo online de produtos com preços diferenciados por quantidade
2. Sistema de carrinho de compras intuitivo
3. Integração com WhatsApp para fechamento de vendas
4. Painel administrativo completo para gestão
5. Sistema de kits com descontos especiais
6. Rastreamento de fornecedores e custos (interno)

## 🏗️ Arquitetura Técnica

### Frontend
- **Framework**: React com Vite
- **Estilização**: Tailwind CSS
- **State Management**: Context API ou Zustand
- **Roteamento**: React Router
- **UI Components**: Shadcn/ui ou Material-UI

### Backend
- **Framework**: Node.js com Express ou Next.js API Routes
- **Banco de Dados**: PostgreSQL ou MySQL
- **ORM**: Prisma ou TypeORM
- **Autenticação Admin**: JWT
- **Upload de Imagens**: Cloudinary ou S3

### Integrações
- **WhatsApp**: Z-API
- **Webhooks**: N8N para automação
- **Analytics**: Google Analytics ou Mixpanel

## 📦 Estrutura de Funcionalidades

### 1. Catálogo de Produtos
- [ ] Cards de produtos com foto, nome, preços diferenciados
- [ ] Sistema de busca inteligente
- [ ] Filtros por categoria
- [ ] Modal para seleção de modelos (capas e películas)
- [ ] Sistema de caixas fechadas
- [ ] Controle de quantidade inline

### 2. Sistema de Categorias
- [ ] Menu lateral fixo (desktop)
- [ ] Menu hambúrguer (mobile)
- [ ] Categorias dinâmicas via admin
- [ ] Categorias padrão:
  - Capas
  - Películas
  - Fones
  - Fones Bluetooth
  - Caixas de som
  - Cabos
  - Carregadores
  - Suportes
  - Carregadores Veicular
  - Smartwatch

### 3. Página de Kits
- [ ] Página separada com mini landing
- [ ] 3 kits fixos: Marketplace, Giro Rápido, Loja Completa
- [ ] Conteúdo dinâmico baseado em produtos cadastrados
- [ ] Desconto fixo em R$ com destaque visual

### 4. Carrinho de Compras
- [ ] Resumo de produtos e valores
- [ ] Edição de quantidades
- [ ] Remoção de itens
- [ ] Modal de sugestão de upgrade de quantidade
- [ ] Cálculo automático de descontos

### 5. Sistema de Liberação de Preços
- [ ] Produtos visíveis sem preços
- [ ] Modal para captura de WhatsApp
- [ ] Cookie/localStorage com validade de 7 dias
- [ ] Design amigável e persuasivo

### 6. Finalização de Pedido
- [ ] Confirmação de dados (nome e WhatsApp)
- [ ] Registro como pedido pendente
- [ ] Integração com webhook N8N
- [ ] Atribuição automática de vendedor

## 🔧 Painel Administrativo

### Gestão de Produtos
- [ ] CRUD completo de produtos
- [ ] Importação em massa via planilha
- [ ] Campos internos:
  - Fornecedor (nome, endereço, telefone)
  - Preço de custo
  - Histórico de fornecedores
- [ ] Upload de imagens
- [ ] Preços por modelo (capas/películas)

### Gestão de Pedidos
- [ ] Lista de pedidos (pendentes/concluídos)
- [ ] Detalhes do pedido
- [ ] Atribuição de vendedor
- [ ] Exportação de relatórios

### Dashboard Analítico
- [ ] Vendas por período
- [ ] Produtos mais vendidos
- [ ] Taxa de abandono de carrinho
- [ ] Gráficos interativos
- [ ] Métricas de conversão

### Configurações da Empresa
- [ ] Dados da empresa (logo, nome, CNPJ)
- [ ] Informações de contato
- [ ] Links de redes sociais
- [ ] Textos legais (termos, políticas)

## 🔌 Webhooks e Eventos

### Eventos Rastreados
1. **Liberação de preços**: Cliente informa WhatsApp
2. **Pedido finalizado**: Dados completos do pedido
3. **Carrinho abandonado**: 20min de inatividade
4. **Pesquisa de produto**: Termos buscados
5. **Visualização de produto**: Analytics
6. **Navegação em categoria**: Comportamento do usuário

### Integração N8N
- [ ] Endpoint para receber pedidos
- [ ] Retorno com vendedor atribuído
- [ ] Timeout de 1 minuto
- [ ] Log de todas as transações

## 🎨 Design e UX

### Identidade Visual
- **Cor principal**: #FC6D36
- **Estilo**: Moderno, minimalista, clean
- **Tipografia**: Sans-serif, legível
- **Animações**: Suaves e elegantes

### Responsividade
- **Desktop**: Categorias fixas na lateral
- **Mobile**: 
  - Menu hambúrguer
  - Grid 2 produtos/linha
  - Barra de busca inteligente
  - Informações no rodapé

## 📊 Modelo de Dados

### Principais Entidades
1. **Produtos**
   - Informações básicas
   - Preços diferenciados
   - Dados de fornecedor (interno)
   - Categoria
   - Estoque

2. **Categorias**
   - Nome
   - Slug
   - Ordem de exibição
   - Ativa/Inativa

3. **Modelos** (para capas/películas)
   - Marca
   - Modelo
   - Produtos relacionados

4. **Kits**
   - Nome
   - Produtos incluídos
   - Desconto fixo
   - Descrição

5. **Pedidos**
   - Cliente
   - Produtos
   - Status
   - Vendedor atribuído
   - Timestamps

6. **Clientes**
   - Nome
   - WhatsApp
   - Histórico de compras
   - Data de cadastro

## 🚀 Fases de Desenvolvimento

### Fase 1: Estrutura Base (Semana 1)
- [ ] Setup do projeto (React + Backend)
- [ ] Configuração do banco de dados
- [ ] Estrutura de pastas e componentes
- [ ] Configuração de rotas

### Fase 2: Catálogo e Produtos (Semana 2)
- [ ] Listagem de produtos
- [ ] Sistema de busca
- [ ] Filtros por categoria
- [ ] Detalhes do produto

### Fase 3: Carrinho e Checkout (Semana 3)
- [ ] Sistema de carrinho
- [ ] Modal de liberação de preços
- [ ] Finalização de pedido
- [ ] Integração com webhooks

### Fase 4: Painel Admin - Parte 1 (Semana 4)
- [ ] Autenticação admin
- [ ] CRUD de produtos
- [ ] Gestão de categorias
- [ ] Upload de imagens

### Fase 5: Painel Admin - Parte 2 (Semana 5)
- [ ] Gestão de pedidos
- [ ] Dashboard analítico
- [ ] Configurações da empresa
- [ ] Importação em massa

### Fase 6: Kits e Features Especiais (Semana 6)
- [ ] Sistema de kits
- [ ] Modal de modelos (capas/películas)
- [ ] Sistema de caixas fechadas
- [ ] Sugestão de upgrade

### Fase 7: Integrações e Webhooks (Semana 7)
- [ ] Integração Z-API
- [ ] Configuração N8N
- [ ] Eventos de tracking
- [ ] Analytics

### Fase 8: Testes e Deploy (Semana 8)
- [ ] Testes de integração
- [ ] Otimização de performance
- [ ] Deploy em produção
- [ ] Documentação

## ✅ Decisões Tomadas
1. **Acesso**: Livre, sem necessidade de login
2. **Validação**: WhatsApp brasileiro (com ou sem 9º dígito)
3. **Fornecedor e custo**: Campos internos, não visíveis aos clientes
4. **Pagamento**: Via WhatsApp após finalizar pedido
5. **Estoque**: Sem controle automático
6. **Idiomas**: Apenas português
7. **Cupons**: Não terá sistema de cupons

## 🔧 Stack Tecnológica Definida
- **Framework**: Next.js 14+ com App Router
- **Banco de Dados**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Upload de Imagens**: Cloudinary
- **Deploy**: Vercel
- **Autenticação Admin**: NextAuth.js

## 📝 Notas Importantes
- Fornecedor e preço de custo são campos INTERNOS (não visíveis para clientes)
- WhatsApp é o canal principal de fechamento de vendas
- Foco em experiência mobile-first
- Sistema deve ser escalável para futuras features

## 🔄 Status Atual
**Data de Início**: [A definir]
**Fase Atual**: Planejamento
**Próximos Passos**: Definir questões pendentes e iniciar Fase 1

---

*Este documento será atualizado conforme o progresso do desenvolvimento*