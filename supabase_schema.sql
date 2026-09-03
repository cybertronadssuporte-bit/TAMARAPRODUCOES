-- ============================================================================
-- SCHEMA SQL COMPLETO E SEGURO: PLATAFORMA TAMARA PRODUÇÕES
-- PostgreSQL / Supabase
-- Sistema de Funções (Roles), Row Level Security (RLS) e Políticas de Acesso
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABELA: PROFILES (Vínculo direto com auth.users e Sistema de Roles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    telefone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Função auxiliar segura para verificar se o usuário autenticado atual é ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Função de Trigger para proteger a coluna 'role' contra auto-elevação por clientes
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o usuário tentar alterar seu próprio role e não for admin prévio, rejeita a alteração do role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Acesso não autorizado: Você não tem permissão para alterar sua função de acesso.';
    END IF;
  END IF;
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_self_escalation();

-- Trigger para criar perfil automaticamente no momento do cadastro no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'nome', 'Cliente'),
    NEW.email,
    -- Padrão é sempre 'customer'
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'telefone'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. TABELA: EMPRESA (Identidade Visual e Contato da Tamara Produções)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL DEFAULT 'TAMARA PRODUÇÕES',
    logo_url TEXT,
    whatsapp VARCHAR(20) NOT NULL DEFAULT '5585998672404',
    whatsapp_formatado VARCHAR(30) NOT NULL DEFAULT '+55 85 99867-2404',
    email VARCHAR(255) NOT NULL DEFAULT 'contato@tamaraproducoes.com.br',
    admin_email VARCHAR(255) NOT NULL DEFAULT 'admin@tamaraproducoes.com.br',
    admin_senha_hash TEXT NOT NULL DEFAULT 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18',
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_channel VARCHAR(20) NOT NULL DEFAULT 'email',
    admin_nome VARCHAR(255) NOT NULL DEFAULT 'Tamara Produções (Administrador)',
    admin_telefone VARCHAR(30) NOT NULL DEFAULT '(85) 99867-2404',
    slogan TEXT DEFAULT 'Transforme seu evento em um momento inesquecível',
    cidade_padrao VARCHAR(100) DEFAULT 'Fortaleza - CE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir empresa padrão se não existir
INSERT INTO public.empresa (nome, whatsapp, whatsapp_formatado, email, admin_email, admin_senha_hash, cidade_padrao)
VALUES ('TAMARA PRODUÇÕES', '5585998672404', '+55 85 99867-2404', 'contato@tamaraproducoes.com.br', 'admin@tamaraproducoes.com.br', 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18', 'Fortaleza - CE')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. TABELA: TEMAS (Categorias de Eventos)
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

-- Inserir temas iniciais se vazios
INSERT INTO public.temas (nome, descricao, imagem_url, ordem, ativo) VALUES
('Aniversários', 'Celebrações memoráveis com temas contemporâneos, personagens heroicos e arranjos exclusivos.', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80', 1, true),
('Casamentos', 'Cenografia romântica e refinada com arcos florais nobres, iluminação intimista e toques dourados.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', 2, true),
('Festas Infantis', 'Universos lúdicos e interativos que encantam os pequenos com pura criatividade e segurança.', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80', 3, true),
('Chá Revelação', 'Cenários mágicos e delicados em tons pastéis e nuvens de balões para revelar seu maior amor.', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80', 4, true),
('Noivados', 'Elegância minimalista e aconchegante para celebrar o primeiro passo para o grande dia.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', 5, true),
('Eventos Corporativos', 'Estruturas impactantes para palestras, lançamentos de marcas, confraternizações e congressos.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', 6, true)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. TABELA: PRODUTOS (Decorações dentro dos Temas)
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
-- 5. TABELA: PRODUTO_IMAGENS (Fotos por Produto)
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
-- 6. TABELA: CLIENTES
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
-- 7. TABELA: AGENDAMENTOS (Registro Oficial de Pedidos)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_agendamento_enum') THEN
    CREATE TYPE status_agendamento_enum AS ENUM (
      'pendente',
      'confirmado',
      'em_preparacao',
      'instalacao_realizada',
      'cancelado'
    );
  END IF;
END $$;

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

-- ÍNDICE ÚNICO CONDICIONAL: Evita concorrência e agendamento duplo no mesmo dia e horário
CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_sem_conflito
ON public.agendamentos (data_instalacao, horario_instalacao)
WHERE status != 'cancelado';

-- ----------------------------------------------------------------------------
-- 8. TABELA: CONFIGURACOES DA AGENDA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes_agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    horario_inicial VARCHAR(5) NOT NULL DEFAULT '08:00',
    horario_final VARCHAR(5) NOT NULL DEFAULT '18:00',
    duracao_minutos INT NOT NULL DEFAULT 120,
    intervalo_minutos INT NOT NULL DEFAULT 30,
    dias_funcionamento INT[] NOT NULL DEFAULT '{1,2,3,4,5,6,0}',
    datas_bloqueadas DATE[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 9. FUNÇÃO ATÔMICA: RESERVA SEGURA DE AGENDAMENTO (PREVENÇÃO DE CONCORRÊNCIA)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.criar_agendamento_seguro(
    p_numero_pedido VARCHAR(50),
    p_tema_id UUID,
    p_tema_nome VARCHAR(100),
    p_produto_id UUID,
    p_produto_nome VARCHAR(255),
    p_cliente_nome VARCHAR(255),
    p_cliente_whatsapp VARCHAR(20),
    p_cliente_email VARCHAR(255),
    p_tipo_evento VARCHAR(100),
    p_data_evento DATE,
    p_data_instalacao DATE,
    p_horario_instalacao VARCHAR(10),
    p_endereco VARCHAR(255),
    p_numero VARCHAR(50),
    p_bairro VARCHAR(100),
    p_cidade VARCHAR(100),
    p_ponto_referencia VARCHAR(255),
    p_observacoes TEXT,
    p_valor_total NUMERIC(10, 2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conflito BOOLEAN;
  v_agendamento_id UUID;
  v_cliente_id UUID;
BEGIN
  -- 1. Checagem atômica de disponibilidade
  SELECT EXISTS (
    SELECT 1 FROM public.agendamentos
    WHERE data_instalacao = p_data_instalacao
      AND horario_instalacao = p_horario_instalacao
      AND status != 'cancelado'
  ) INTO v_conflito;

  IF v_conflito THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'HORARIO_OCUPADO',
      'message', '⚠️ Este horário acabou de ser reservado. Escolha outro horário.'
    );
  END IF;

  -- 2. Localizar ou registrar cliente
  SELECT id INTO v_cliente_id FROM public.clientes WHERE whatsapp = p_cliente_whatsapp LIMIT 1;
  IF v_cliente_id IS NULL THEN
    INSERT INTO public.clientes (nome, whatsapp, email)
    VALUES (p_cliente_nome, p_cliente_whatsapp, p_cliente_email)
    RETURNING id INTO v_cliente_id;
  END IF;

  -- 3. Inserir o agendamento
  INSERT INTO public.agendamentos (
    numero_pedido,
    tema_id,
    tema_nome,
    produto_id,
    produto_nome,
    cliente_id,
    cliente_nome,
    cliente_whatsapp,
    cliente_email,
    tipo_evento,
    data_evento,
    data_instalacao,
    horario_instalacao,
    endereco,
    numero,
    bairro,
    cidade,
    ponto_referencia,
    observacoes,
    valor_total,
    status
  ) VALUES (
    p_numero_pedido,
    p_tema_id,
    p_tema_nome,
    p_produto_id,
    p_produto_nome,
    v_cliente_id,
    p_cliente_nome,
    p_cliente_whatsapp,
    p_cliente_email,
    p_tipo_evento,
    p_data_evento,
    p_data_instalacao,
    p_horario_instalacao,
    p_endereco,
    p_numero,
    p_bairro,
    p_cidade,
    p_ponto_referencia,
    p_observacoes,
    p_valor_total,
    'pendente'
  ) RETURNING id INTO v_agendamento_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_agendamento_id,
    'numero_pedido', p_numero_pedido,
    'message', 'Pedido registrado com sucesso'
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'CONCORRENCIA_HORARIO',
      'message', '⚠️ Este horário acabou de ser reservado. Escolha outro horário.'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ----------------------------------------------------------------------------

-- Ativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_agenda ENABLE ROW LEVEL SECURITY;

-- Limpar policies anteriores se existirem
DROP POLICY IF EXISTS "Perfis: leitura do próprio ou por admin" ON public.profiles;
DROP POLICY IF EXISTS "Perfis: atualização apenas do próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Empresa: leitura pública" ON public.empresa;
DROP POLICY IF EXISTS "Empresa: escrita apenas admin" ON public.empresa;
DROP POLICY IF EXISTS "Temas: leitura pública de ativos ou admin" ON public.temas;
DROP POLICY IF EXISTS "Temas: escrita apenas admin" ON public.temas;
DROP POLICY IF EXISTS "Produtos: leitura pública de ativos ou admin" ON public.produtos;
DROP POLICY IF EXISTS "Produtos: escrita apenas admin" ON public.produtos;
DROP POLICY IF EXISTS "Produto Imagens: leitura pública" ON public.produto_imagens;
DROP POLICY IF EXISTS "Produto Imagens: escrita apenas admin" ON public.produto_imagens;
DROP POLICY IF EXISTS "Clientes: acesso apenas admin" ON public.clientes;
DROP POLICY IF EXISTS "Agendamentos: criação pública" ON public.agendamentos;
DROP POLICY IF EXISTS "Agendamentos: leitura apenas admin ou próprio cliente" ON public.agendamentos;
DROP POLICY IF EXISTS "Agendamentos: atualização apenas admin" ON public.agendamentos;
DROP POLICY IF EXISTS "Agendamentos: exclusão apenas admin" ON public.agendamentos;
DROP POLICY IF EXISTS "Configurações: leitura pública" ON public.configuracoes_agenda;
DROP POLICY IF EXISTS "Configurações: escrita apenas admin" ON public.configuracoes_agenda;

-- POLICIES: PROFILES
CREATE POLICY "Perfis: leitura do próprio ou por admin"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Perfis: atualização apenas do próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- POLICIES: EMPRESA
CREATE POLICY "Empresa: leitura pública"
ON public.empresa FOR SELECT
USING (true);

CREATE POLICY "Empresa: escrita apenas admin"
ON public.empresa FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- POLICIES: TEMAS
CREATE POLICY "Temas: leitura pública de ativos ou admin"
ON public.temas FOR SELECT
USING (ativo = true OR public.is_admin());

CREATE POLICY "Temas: escrita apenas admin"
ON public.temas FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- POLICIES: PRODUTOS
CREATE POLICY "Produtos: leitura pública de ativos ou admin"
ON public.produtos FOR SELECT
USING (ativo = true OR public.is_admin());

CREATE POLICY "Produtos: escrita apenas admin"
ON public.produtos FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- POLICIES: PRODUTO_IMAGENS
CREATE POLICY "Produto Imagens: leitura pública"
ON public.produto_imagens FOR SELECT
USING (true);

CREATE POLICY "Produto Imagens: escrita apenas admin"
ON public.produto_imagens FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- POLICIES: CLIENTES (Dados protegidos de clientes são exclusivos do Admin)
CREATE POLICY "Clientes: acesso apenas admin"
ON public.clientes FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- POLICIES: AGENDAMENTOS (Clientes podem apenas criar; leitura e gestão são restritas a Admin)
CREATE POLICY "Agendamentos: criação pública"
ON public.agendamentos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Agendamentos: leitura apenas admin ou próprio cliente"
ON public.agendamentos FOR SELECT
USING (public.is_admin());

CREATE POLICY "Agendamentos: atualização apenas admin"
ON public.agendamentos FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Agendamentos: exclusão apenas admin"
ON public.agendamentos FOR DELETE
USING (public.is_admin());

-- POLICIES: CONFIGURAÇÕES DA AGENDA
CREATE POLICY "Configurações: leitura pública"
ON public.configuracoes_agenda FOR SELECT
USING (true);

CREATE POLICY "Configurações: escrita apenas admin"
ON public.configuracoes_agenda FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('decoracoes', 'decoracoes', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Imagens públicas de decorações" ON storage.objects;
CREATE POLICY "Imagens públicas de decorações"
ON storage.objects FOR SELECT
USING (bucket_id = 'decoracoes');

DROP POLICY IF EXISTS "Upload permitido apenas para administradores" ON storage.objects;
CREATE POLICY "Upload permitido apenas para administradores"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'decoracoes' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 12. INSTRUÇÃO PARA CRIAR O PRIMEIRO ADMINISTRADOR COM SEGURANÇA
-- ----------------------------------------------------------------------------
-- No console do Supabase (SQL Editor ou Authentication):
-- Para criar o primeiro administrador sem expor senhas no frontend:
--
-- 1. Acesse Authentication -> Users -> "Invite User" ou "Add User".
-- 2. Crie com o e-mail: admin@tamaraproducoes.com.br (ou o e-mail oficial da sua empresa).
-- 3. Defina uma senha forte com segurança.
-- 4. No SQL Editor, promova o usuário criado para 'admin':
--    UPDATE public.profiles
--    SET role = 'admin'
--    WHERE email = 'admin@tamaraproducoes.com.br';
-- ============================================================================
