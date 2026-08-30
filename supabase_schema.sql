-- ============================================================================
-- SCHEMA SQL COMPLETO: PLATAFORMA DE DECORAÇÃO DE EVENTOS — TAMARA PRODUÇÕES
-- PostgreSQL / Supabase
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABELA: EMPRESA (Identidade da Empresa Dinâmica)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL DEFAULT 'TAMARA PRODUÇÕES',
    logo_url TEXT,
    whatsapp VARCHAR(20) NOT NULL DEFAULT '5585998672404',
    whatsapp_formatado VARCHAR(30) NOT NULL DEFAULT '+55 85 99867-2404',
    email VARCHAR(255) NOT NULL DEFAULT 'contato@tamaraproducoes.com.br',
    slogan TEXT DEFAULT 'Transforme seu evento em um momento inesquecível',
    cidade_padrao VARCHAR(100) DEFAULT 'Fortaleza - CE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir empresa padrão
INSERT INTO public.empresa (nome, whatsapp, whatsapp_formatado, email, cidade_padrao)
VALUES ('TAMARA PRODUÇÕES', '5585998672404', '+55 85 99867-2404', 'contato@tamaraproducoes.com.br', 'Fortaleza - CE')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. TABELA: TEMAS (TEMA)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.temas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    imagem_url TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_temas_ativo_ordem ON public.temas (ativo, ordem);

-- Inserir temas iniciais
INSERT INTO public.temas (nome, descricao, imagem_url, ordem, ativo) VALUES
('Aniversários', 'Celebrações memoráveis com temas contemporâneos, personagens heroicos e arranjos exclusivos.', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80', 1, true),
('Casamentos', 'Cenografia romântica e refinada com arcos florais nobres, iluminação intimista e toques dourados.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', 2, true),
('Festas Infantis', 'Universos lúdicos e interativos que encantam os pequenos com pura criatividade e segurança.', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80', 3, true),
('Chá Revelação', 'Cenários mágicos e delicados em tons pastéis e nuvens de balões para revelar seu maior amor.', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80', 4, true),
('Noivados', 'Elegância minimalista e aconchegante para celebrar o primeiro passo para o grande dia.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', 5, true),
('Eventos Corporativos', 'Estruturas impactantes para palestras, lançamentos de marcas, confraternizações e congressos.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', 6, true)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. TABELA: PRODUTOS (PRODUTO DENTRO DO TEMA)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tema_id UUID REFERENCES public.temas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    descricao TEXT,
    itens_inclusos TEXT[] NOT NULL DEFAULT '{}',
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_produtos_tema ON public.produtos (tema_id, ativo);

-- ----------------------------------------------------------------------------
-- 4. TABELA: PRODUTO_IMAGENS (Várias Fotos por Produto)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.produto_imagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
    imagem_url TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_produto_imagens_produto ON public.produto_imagens (produto_id, ordem);

-- ----------------------------------------------------------------------------
-- 5. TABELA: CLIENTES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp ON public.clientes (whatsapp);

-- ----------------------------------------------------------------------------
-- 6. TABELA: AGENDAMENTOS (Reserva com Tema, Produto, Data e Endereço)
-- ----------------------------------------------------------------------------
CREATE TYPE status_agendamento_enum AS ENUM (
    'pendente',
    'confirmado',
    'em_preparacao',
    'instalacao_realizada',
    'cancelado'
);

CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    tema_id UUID REFERENCES public.temas(id) ON DELETE SET NULL,
    tema_nome VARCHAR(100) NOT NULL,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
    produto_nome VARCHAR(255) NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_whatsapp VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    tipo_evento VARCHAR(100) NOT NULL,
    data_evento DATE NOT NULL,
    data_instalacao DATE NOT NULL,
    horario_instalacao VARCHAR(10) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(50) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    ponto_referencia VARCHAR(255),
    observacoes TEXT,
    valor_total NUMERIC(10, 2) NOT NULL,
    status status_agendamento_enum NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice único parcial para evitar DUPLO AGENDAMENTO no mesmo horário
CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_sem_conflito
ON public.agendamentos (data_instalacao, horario_instalacao)
WHERE status != 'cancelado';

-- ----------------------------------------------------------------------------
-- 7. TABELA: USUARIOS / ADMIN (Segurança, Hash SHA-256 e 2FA)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha_hash VARCHAR(255) NOT NULL,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_channel VARCHAR(10) DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir admin inicial
INSERT INTO public.usuarios (nome, email, telefone, senha_hash, two_factor_enabled, two_factor_channel)
VALUES ('Tamara Produções', 'admin@decorart.com.br', '(85) 99867-2404', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', false, 'email')
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('decoracoes', 'decoracoes', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública para as imagens
CREATE POLICY "Imagens públicas de decorações"
ON storage.objects FOR SELECT
USING (bucket_id = 'decoracoes');

-- Política de upload para usuários autenticados
CREATE POLICY "Upload permitido apenas para administradores"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'decoracoes');
