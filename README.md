# ✨ Lumière Cenografia & Decoração de Eventos

Sistema web moderno, profissional e responsivo para empresa de **Decoração de Eventos**, com catálogo interativo, agendamento de data e horário de instalação em tempo real sem conflito de agenda, integração com WhatsApp e Painel Administrativo completo protegido por login.

---

## 🎯 Funcionalidades Principais

### 1. Experiência do Cliente
- **Página Inicial de Alto Impacto**:
  - Hero com título, subtítulo e botão CTA *"ESCOLHER MINHA DECORAÇÃO"*.
  - Grade de categorias com fotos: *Aniversários*, *Casamentos*, *Chá revelação*, *Noivados*, *Eventos corporativos*, *Festas infantis* e *Outras comemorações*.
  - Seção *Como Funciona* e *Avaliações 5 estrelas*.
- **Catálogo de Decorações & Filtros**:
  - Pesquisa por texto em tempo real (*"Pesquisar decoração..."*).
  - Filtro dinâmico por categoria e faixa de preço.
  - Cards elegantes com foto em alta resolução, preço, itens inclusos resumidos e botão *"ESCOLHER"*.
- **Página de Detalhes da Decoração**:
  - Galeria de fotos navegável com miniaturas.
  - Descrição completa, requisitos de espaço e voltagem.
  - Checklist completo de itens inclusos.
  - Botão *"AGENDAR ESTA DECORAÇÃO"*.
- **Fluxo de Agendamento em Etapas (Multi-step Wizard)**:
  - **Etapa 1 — Dados do Cliente**: Nome completo, WhatsApp com máscara e validação de e-mail.
  - **Etapa 2 — Dados do Evento**: Tipo de evento, data, endereço completo, bairro, cidade e pontos de referência.
  - **Etapa 3 — Agendamento da Instalação**: Calendário inteligente bloqueando datas passadas e dias fechados. Horários dinâmicos identificados como **"DISPONÍVEL"** ou **"INDISPONÍVEL"** (evitando conflito entre clientes).
  - **Etapa 4 — Confirmação e Resumo**: Resumo tipo recibo com todos os dados do pedido.
  - **Etapa 5 — Conclusão com Sucesso**: Confetes, número único do pedido (ex: `#DEC-2026-9812`), botão *"FALAR NO WHATSAPP"* com a mensagem pré-formatada pronta e botão *"VOLTAR PARA O SITE"*.

### 2. Painel Administrativo (`/admin`)
- **Login Seguro**:
  - Acesso protegido por autenticação segura e controle de acesso baseado em funções (role: admin).

- **Dashboard em Tempo Real**:
  - Total de agendamentos, agendamentos de hoje, faturamento estimado e contadores de status.
- **Gerenciamento de Agendamentos**:
  - Tabela completa com pesquisa e filtros.
  - Alteração de status: *Pendente*, *Confirmado*, *Em preparação*, *Instalação realizada*, *Cancelado*.
  - Link de contato direto com o WhatsApp do cliente.
- **Gerenciamento de Decorações (CRUD)**:
  - Cadastro de nova decoração com galeria de fotos e itens inclusos dinâmicos.
  - Edição de preço, fotos, descrição e categoria.
  - Ativação ou pausa no catálogo público.
  - Exclusão com confirmação de segurança.
- **Gerenciamento de Agenda & Horários**:
  - Calendário interativo (visualização mensal, semanal e diária).
  - Ferramenta de **Bloquear / Liberar Datas**.
  - Ferramenta de **Bloquear / Liberar Horários** individualmente.
  - Configuração de horário inicial, horário final, duração de instalação e dias da semana de funcionamento.

---

## 🚀 Como Executar o Projeto Localmente

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse no navegador: `http://localhost:3000`

3. **Gerar Versão de Produção**:
   ```bash
   npm run build
   ```

---

## 🗄️ Estrutura do Banco de Dados (Supabase / PostgreSQL)

O arquivo `supabase_schema.sql` na raiz do projeto contém a estrutura SQL pronta para ser executada no Supabase, contemplando as tabelas:
- `usuarios`
- `decoracoes`
- `agendamentos`
- `disponibilidade`
- `configuracoes`
