-- Script SQL para criar tabelas diretamente no Supabase

-- Enum para UserRole
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- Enum para OrderStatus
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- Enum para WebhookEventType
CREATE TYPE "WebhookEventType" AS ENUM ('PRICE_UNLOCK', 'ORDER_CREATED', 'ORDER_UPDATED', 'CART_ABANDONED', 'PRODUCT_SEARCH', 'PRODUCT_VIEW', 'CATEGORY_VIEW');

-- Tabela User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Tabela Admin (legado)
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- Tabela Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Tabela Supplier
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- Tabela Brand
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- Tabela Model
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- Tabela Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subname" TEXT,
    "description" TEXT,
    "brand" TEXT,
    "categoryId" TEXT NOT NULL,
    "isModalProduct" BOOLEAN NOT NULL DEFAULT false,
    "quickAddIncrement" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "specialPrice" DOUBLE PRECISION,
    "specialQuantity" INTEGER,
    "superWholesalePrice" DOUBLE PRECISION,
    "superWholesaleQuantity" INTEGER,
    "cost" DOUBLE PRECISION,
    "boxQuantity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Tabela CompanySettings
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tradeName" TEXT,
    "cnpj" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#FC6D36',
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "privacyPolicy" TEXT,
    "termsOfUse" TEXT,
    "aboutUs" TEXT,
    "minOrderValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- Tabela ShippingCompany
CREATE TABLE "ShippingCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingCompany_pkey" PRIMARY KEY ("id")
);

-- Criar índices únicos
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");
CREATE UNIQUE INDEX "Model_brandId_name_key" ON "Model"("brandId", "name");
CREATE UNIQUE INDEX "ShippingCompany_name_key" ON "ShippingCompany"("name");

-- Adicionar foreign keys
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Inserir dados iniciais
INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt") VALUES
('admin_001', 'admin@pmcell.com.br', '$2a$10$K7L1OJ0TfU0vSomRgbJYkuVTXfkVpIx8H8A6ghA0B.qY5wlFWGVWe', 'Administrador PMCELL', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp_001', 'funcionario@pmcell.com.br', '$2a$10$K7L1OJ0TfU0vSomRgbJYkuVTXfkVpIx8H8A6ghA0B.qY5wlFWGVWe', 'Funcionário Exemplo', 'EMPLOYEE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "CompanySettings" ("id", "companyName", "tradeName", "primaryColor", "whatsapp", "email", "minOrderValue", "createdAt", "updatedAt") VALUES
('default', 'PMCELL São Paulo', 'PMCELL SP', '#FC6D36', '5511999999999', 'contato@pmcell.com.br', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Category" ("id", "name", "slug", "order", "isActive", "createdAt", "updatedAt") VALUES
('cat_001', 'Capas', 'capas', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_002', 'Películas', 'peliculas', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_003', 'Fones', 'fones', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_004', 'Carregadores', 'carregadores', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_005', 'Cabos', 'cabos', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Brand" ("id", "name", "order", "createdAt") VALUES
('brand_001', 'Samsung', 1, CURRENT_TIMESTAMP),
('brand_002', 'Apple', 2, CURRENT_TIMESTAMP),
('brand_003', 'Motorola', 3, CURRENT_TIMESTAMP),
('brand_004', 'Xiaomi', 4, CURRENT_TIMESTAMP);

INSERT INTO "ShippingCompany" ("id", "name", "order", "isActive", "createdAt", "updatedAt") VALUES
('ship_001', 'Correios', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ship_002', 'Jadlog', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ship_003', 'Loggi', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);