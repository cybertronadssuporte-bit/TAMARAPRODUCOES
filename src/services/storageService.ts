import {
  Tema,
  Produto,
  Decoracao,
  Agendamento,
  ConfiguracoesAgenda,
  HorarioSlot,
  StatusAgendamento,
  EmpresaConfig,
  AdminUser,
  TwoFactorState,
} from '../types';
import { CONFIGURACOES_AGENDA_PADRAO, SITE_CONFIG } from '../config/siteConfig';
import { authService } from './authService';

const STORAGE_KEYS = {
  EMPRESA: 'tamara_empresa_v2',
  TEMAS: 'tamara_temas_v2',
  PRODUTOS: 'tamara_produtos_v2',
  DECORACOES: 'lumiere_decoracoes_v1',
  AGENDAMENTOS: 'tamara_agendamentos_v2',
  CONFIGURACOES: 'tamara_configuracoes_v2',
  ADMIN_PROFILE: 'tamara_admin_profile_v2',
  ADMIN_AUTH: 'tamara_admin_auth_v2',
  TWO_FACTOR_STATE: 'tamara_2fa_state_v2',
};

// Hash criptográfico SHA-256 inicial do administrador
const DEFAULT_SENHA_HASH = 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18';

// Reutiliza a função canônica de SHA-256 resiliente e determinística de authService
export { sha256 } from './authService';

// -------------------------------------------------------------
// SEED DATA: TEMAS INICIAIS
// -------------------------------------------------------------
const INITIAL_TEMAS: Tema[] = [
  {
    id: 'tema-aniversarios',
    nome: 'Aniversários',
    descricao: 'Celebrações memoráveis com temas contemporâneos, personagens heroicos e arranjos exclusivos.',
    imagemUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    ativo: true,
    ordem: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tema-casamentos',
    nome: 'Casamentos',
    descricao: 'Cenografia romântica e refinada com arcos florais nobres, iluminação intimista e toques dourados.',
    imagemUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    ativo: true,
    ordem: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tema-festas-infantis',
    nome: 'Festas Infantis',
    descricao: 'Universos lúdicos e interativos que encantam os pequenos com pura criatividade e segurança.',
    imagemUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
    ativo: true,
    ordem: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tema-cha-revelacao',
    nome: 'Chá Revelação',
    descricao: 'Cenários mágicos e delicados em tons pastéis e nuvens de balões para revelar seu maior amor.',
    imagemUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    ativo: true,
    ordem: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tema-noivados',
    nome: 'Noivados',
    descricao: 'Elegância minimalista e aconchegante para celebrar o primeiro passo para o grande dia.',
    imagemUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    ativo: true,
    ordem: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tema-corporativos',
    nome: 'Eventos Corporativos',
    descricao: 'Estruturas impactantes para palestras, lançamentos de marcas, confraternizações e congressos.',
    imagemUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    ativo: true,
    ordem: 6,
    createdAt: new Date().toISOString(),
  },
];

// -------------------------------------------------------------
// SEED DATA: PRODUTOS INICIAIS (Incluindo os de Aniversários pedidos)
// -------------------------------------------------------------
const INITIAL_PRODUTOS: Produto[] = [
  // 1. Homem-Aranha
  {
    id: 'prod-homem-aranha',
    temaId: 'tema-aniversarios',
    temaNome: 'Aniversários',
    nome: '🕷️ Homem-Aranha',
    descricao: 'Cenário eletrizante com painel gigante do Homem-Aranha, teias cenográficas iluminadas, trio de cilindros texturizados e arco desconstruído de balões orgânicos em vermelho, azul e preto.',
    preco: 350.0,
    ativo: true,
    ordem: 1,
    imagens: [
      'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    ],
    itensInclusos: [
      'Painel circular 3D sublimado temático do Homem-Aranha 2m',
      'Trio de cilindros forrados com estampas de teia e arranha-céus',
      'Arco orgânico volumoso de balões premium (vermelho, azul e preto)',
      'Escultura do herói em MDF e display de mesa',
      'Kit completo com 8 bandejas de doces em louça e acrílico',
      'Tapete vinílico de alta densidade',
      'Montagem profissional e desmontagem completas inclusas',
    ],
    observacoes: 'Ideal para espaços a partir de 3 metros livres. Montagem estimada em 1h30.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  // 2. Batman
  {
    id: 'prod-batman',
    temaId: 'tema-aniversarios',
    temaNome: 'Aniversários',
    nome: '🦇 Batman',
    descricao: 'A imponência e o mistério de Gotham City para uma festa inesquecível. Painel moderno com silhueta da cidade, morcegos em LED amarelo neon e mesas pretas com detalhes em dourado fosco.',
    preco: 380.0,
    ativo: true,
    ordem: 2,
    imagens: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=1000&q=80',
    ],
    itensInclusos: [
      'Painel duplo ripado preto com silhueta luminosa de Gotham City',
      'Letreiro Morcego luminoso em LED Neon Amarelo',
      'Batmóvel cenográfico decorativo de apoio para fotos',
      'Arco orgânico de balões preto fosco, grafite e amarelo cintilante',
      'Conjunto de 10 bandejas nobres para doces e bolo',
      'Tapete preto aveludado',
      'Montagem técnica e desmontagem completas',
    ],
    observacoes: 'Acompanha fiação e extensão de 15m para alimentação da iluminação LED.',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  // 3. Robin
  {
    id: 'prod-robin',
    temaId: 'tema-aniversarios',
    temaNome: 'Aniversários',
    nome: '🦸 Robin',
    descricao: 'Cenário colorido, vibrante e cheio de energia inspirado no jovem herói Robin. Painel em quadrinhos vintage, arco de balões vermelho, verde e dourado, com cilindros estilizados.',
    preco: 320.0,
    ativo: true,
    ordem: 3,
    imagens: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1000&q=80',
    ],
    itensInclusos: [
      'Painel temático estilo quadrinhos retrô 2m',
      'Trio de mesas cilindro em degradê vermelho e verde',
      'Arco desconstruído de balões com mais de 250 unidades',
      'Displays personalizados do Robin e insígnias do herói',
      'Boleiras e suportes coloridos para docinhos',
      'Montagem e desmontagem pontuais pela nossa equipe',
    ],
    observacoes: 'Espaço recomendado de 2,8m livres de largura. Instalação leva cerca de 1h20.',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  // 4. Casamento Boho Chic
  {
    id: 'prod-casamento-boho',
    temaId: 'tema-casamentos',
    temaNome: 'Casamentos',
    nome: '💍 Cenário Casamento Boho Chic & Flores Nobres',
    descricao: 'Estrutura refinada com arco floral desconstruído, flores nobres importadas e elementos em madeira natural que trazem aconchego e muito luxo para a cerimônia ou recepção.',
    preco: 1290.0,
    ativo: true,
    ordem: 1,
    imagens: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    ],
    itensInclusos: [
      'Arco floral desconstruído com flores naturais e desidratadas nobres',
      'Painel ripado em madeira nobre clara com 3 metros de largura',
      'Conjunto de 3 mesas centrais orgânicas em diferentes alturas',
      'Kit completo de 10 boleiras e suportes em cerâmica artesanal e cristal',
      'Iluminação cênica com 4 pendentes de filamento quente de carbono',
      'Tapete geométrico aveludado 3x2m',
      'Montagem completa e desmontagem pós-evento inclusas',
    ],
    observacoes: 'Necessário ponto de energia a até 10m de distância.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  // 5. Chá Revelação Sonho de Algodão
  {
    id: 'prod-cha-revelacao',
    temaId: 'tema-cha-revelacao',
    temaNome: 'Chá Revelação',
    nome: '👶 Chá Revelação Sonho de Algodão',
    descricao: 'Delicadeza e magia para um dos dias mais emocionantes da família. Painel duplo com letreiro luminoso em LED Neon e arco de balões nuvem em rosa candy e azul bebê.',
    preco: 749.9,
    ativo: true,
    ordem: 1,
    imagens: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
    ],
    itensInclusos: [
      'Painel duplo em arco romano texturizado nas cores off-white',
      'Letreiro luminoso em LED Neon escrito "Boy or Girl"',
      'Duplo arco de balões desconstruídos em degradê candy colors',
      'Mesa envelope central com iluminação interna indireta',
      'Ursinhos de pelúcia com laçarotes acetinados',
      'Suportes elevados para bolo cenográfico e docinhos',
      'Caixa misteriosa cenográfica para momento da revelação',
    ],
    observacoes: 'Acompanha extensão elétrica de 15m para conexão do letreiro de Neon.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  // 6. Safari Real Infantil
  {
    id: 'prod-safari-real',
    temaId: 'tema-festas-infantis',
    temaNome: 'Festas Infantis',
    nome: '🎈 Safari Real Deluxe — Safari dos Sonhos',
    descricao: 'Uma viagem encantadora pela selva com pelúcias realistas em tamanho real, arco orgânico de balões verde floresta, areia e dourado cintilante.',
    preco: 899.9,
    ativo: true,
    ordem: 1,
    imagens: [
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
    ],
    itensInclusos: [
      'Painel redondo sublimado 3D Safari 2m com estrutura de ferro',
      'Trio de cilindros forrados com capas temáticas texturizadas',
      'Arco orgânico volumoso com mais de 300 balões anti-estouro',
      'Quarteto de pelúcias gigantes (Girafa, Leão, Zebra e Elefante)',
      'Display de folhagens costela-de-adão naturais',
      'Conjunto de 8 bandejas em louça verde esmeralda',
      'Tapete de grama sintética premium',
    ],
    observacoes: 'Ideal para espaços cobertos ou salões de condomínio.',
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
];

// Helper para calcular datas futuras
const getFutureDate = (daysAhead: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

// Agendamentos de demonstração iniciais
const INITIAL_AGENDAMENTOS: Agendamento[] = [
  {
    id: 'ag-201',
    numeroPedido: '#TP-2026-1044',
    temaId: 'tema-aniversarios',
    temaNome: 'Aniversários',
    produtoId: 'prod-homem-aranha',
    produtoNome: '🕷️ Homem-Aranha',
    decoracaoId: 'prod-homem-aranha',
    decoracaoNome: '🕷️ Homem-Aranha',
    decoracaoPreco: 350.0,
    cliente: {
      nome: 'Mariana Silveira Ramos',
      whatsapp: '(85) 98765-4321',
      email: 'mariana.ramos@gmail.com',
    },
    evento: {
      tipoEvento: 'Aniversários',
      dataEvento: getFutureDate(3),
      endereco: 'Av. Beira Mar',
      numero: '1500 - Bloco B',
      bairro: 'Meireles',
      cidade: 'Fortaleza',
      pontoReferencia: 'Próximo à Feirinha da Beira Mar',
      observacoes: 'Aniversário de 5 anos do meu filho Lucas.',
    },
    instalacao: {
      data: getFutureDate(3),
      horario: '10:00',
    },
    valorTotal: 350.0,
    status: 'confirmado',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'ag-202',
    numeroPedido: '#TP-2026-1049',
    temaId: 'tema-aniversarios',
    temaNome: 'Aniversários',
    produtoId: 'prod-batman',
    produtoNome: '🦇 Batman',
    decoracaoId: 'prod-batman',
    decoracaoNome: '🦇 Batman',
    decoracaoPreco: 380.0,
    cliente: {
      nome: 'Carlos Eduardo Nogueira',
      whatsapp: '(85) 99123-9876',
      email: 'carlos.e.nogueira@outlook.com',
    },
    evento: {
      tipoEvento: 'Aniversários',
      dataEvento: getFutureDate(4),
      endereco: 'Rua Desembargador Moreira',
      numero: '800',
      bairro: 'Aldeota',
      cidade: 'Fortaleza',
      pontoReferencia: 'Ao lado da Praça Portugal',
      observacoes: 'Salão de festas com elevador.',
    },
    instalacao: {
      data: getFutureDate(4),
      horario: '08:00',
    },
    valorTotal: 380.0,
    status: 'em_preparacao',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_ADMIN_USER: AdminUser = {
  id: 'admin-master-tamara',
  nome: 'Tamara Produções (Administrador)',
  email: 'admin@tamaraproducoes.com.br',
  telefone: '(85) 99867-2404',
  senhaHash: DEFAULT_SENHA_HASH,
  twoFactorEnabled: false,
  twoFactorChannel: 'email',
  role: 'admin',
};

class StorageService {
  private initStorage(): void {
    if (typeof window === 'undefined') return;

    // Empresa
    if (!localStorage.getItem(STORAGE_KEYS.EMPRESA)) {
      localStorage.setItem(STORAGE_KEYS.EMPRESA, JSON.stringify(SITE_CONFIG));
    }

    // Temas
    if (!localStorage.getItem(STORAGE_KEYS.TEMAS)) {
      localStorage.setItem(STORAGE_KEYS.TEMAS, JSON.stringify(INITIAL_TEMAS));
    }

    // Produtos
    if (!localStorage.getItem(STORAGE_KEYS.PRODUTOS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(INITIAL_PRODUTOS));
    }

    // Agendamentos
    if (!localStorage.getItem(STORAGE_KEYS.AGENDAMENTOS)) {
      localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(INITIAL_AGENDAMENTOS));
    }

    // Configurações da Agenda
    if (!localStorage.getItem(STORAGE_KEYS.CONFIGURACOES)) {
      localStorage.setItem(
        STORAGE_KEYS.CONFIGURACOES,
        JSON.stringify(CONFIGURACOES_AGENDA_PADRAO)
      );
    }

    // Inicialização sincronizada do perfil de administrador seguro
    authService.initAdminProfile();
  }

  constructor() {
    this.initStorage();
  }

  // =============================================================
  // 1. IDENTIDADE DA EMPRESA (Nome & Logo)
  // =============================================================
  getEmpresaConfig(): EmpresaConfig {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.EMPRESA);
    if (!data) return SITE_CONFIG;
    try {
      return JSON.parse(data);
    } catch {
      return SITE_CONFIG;
    }
  }

  saveEmpresaConfig(config: Partial<EmpresaConfig>): EmpresaConfig {
    authService.requireAdmin();
    const atual = this.getEmpresaConfig();
    const updated: EmpresaConfig = {
      ...atual,
      ...config,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.EMPRESA, JSON.stringify(updated));
    // Dispara evento para reatividade em componentes abertos
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('empresa_updated'));
    }
    return updated;
  }

  updateLogo(logoUrl: string): EmpresaConfig {
    return this.saveEmpresaConfig({ logoUrl });
  }

  deleteLogo(): EmpresaConfig {
    return this.saveEmpresaConfig({ logoUrl: null });
  }

  // =============================================================
  // 2. TEMAS (CRUD COMPLETO)
  // =============================================================
  getTemas(): Tema[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.TEMAS);
    if (!data) return INITIAL_TEMAS;
    try {
      const list: Tema[] = JSON.parse(data);
      return list.sort((a, b) => a.ordem - b.ordem);
    } catch {
      return INITIAL_TEMAS;
    }
  }

  getTemasAtivos(): Tema[] {
    return this.getTemas().filter((t) => t.ativo);
  }

  getTemaById(id: string): Tema | undefined {
    return this.getTemas().find((t) => t.id === id);
  }

  saveTema(tema: Omit<Tema, 'id' | 'createdAt'> & { id?: string }): Tema {
    authService.requireAdmin();
    const list = this.getTemas();
    let saved: Tema;

    if (tema.id) {
      const index = list.findIndex((t) => t.id === tema.id);
      if (index >= 0) {
        saved = {
          ...list[index],
          ...tema,
          id: tema.id,
        };
        list[index] = saved;
      } else {
        saved = {
          ...tema,
          id: tema.id,
          createdAt: new Date().toISOString(),
        } as Tema;
        list.push(saved);
      }
    } else {
      const newId = `tema-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      saved = {
        ...tema,
        id: newId,
        ordem: tema.ordem || list.length + 1,
        createdAt: new Date().toISOString(),
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.TEMAS, JSON.stringify(list));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('temas_updated'));
    return saved;
  }

  deleteTema(id: string): boolean {
    authService.requireAdmin();
    const list = this.getTemas();
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.TEMAS, JSON.stringify(filtered));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('temas_updated'));
      return true;
    }
    return false;
  }

  toggleTemaAtivo(id: string): boolean {
    authService.requireAdmin();
    const list = this.getTemas();
    const item = list.find((t) => t.id === id);
    if (item) {
      item.ativo = !item.ativo;
      localStorage.setItem(STORAGE_KEYS.TEMAS, JSON.stringify(list));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('temas_updated'));
      return item.ativo;
    }
    return false;
  }

  // =============================================================
  // 3. PRODUTOS (CRUD COMPLETO VINCULADO A TEMAS)
  // =============================================================
  getProdutos(): Produto[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    if (!data) return INITIAL_PRODUTOS;
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUTOS;
    }
  }

  getProdutosByTema(temaId: string): Produto[] {
    return this.getProdutos().filter((p) => p.temaId === temaId && p.ativo);
  }

  getAllProdutosByTema(temaId: string): Produto[] {
    return this.getProdutos().filter((p) => p.temaId === temaId);
  }

  getProdutoById(id: string): Produto | undefined {
    return this.getProdutos().find((p) => p.id === id);
  }

  saveProduto(produto: Omit<Produto, 'id' | 'createdAt'> & { id?: string }): Produto {
    authService.requireAdmin();
    const list = this.getProdutos();
    let saved: Produto;

    // Obter nome do tema
    const tema = this.getTemaById(produto.temaId);
    const temaNome = tema ? tema.nome : produto.temaNome || '';

    if (produto.id) {
      const index = list.findIndex((p) => p.id === produto.id);
      if (index >= 0) {
        saved = {
          ...list[index],
          ...produto,
          temaNome,
          id: produto.id,
        };
        list[index] = saved;
      } else {
        saved = {
          ...produto,
          temaNome,
          id: produto.id,
          createdAt: new Date().toISOString(),
        } as Produto;
        list.push(saved);
      }
    } else {
      const newId = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      saved = {
        ...produto,
        temaNome,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      list.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(list));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('produtos_updated'));
    return saved;
  }

  deleteProduto(id: string): boolean {
    authService.requireAdmin();
    const list = this.getProdutos();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(filtered));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('produtos_updated'));
      return true;
    }
    return false;
  }

  toggleProdutoAtivo(id: string): boolean {
    authService.requireAdmin();
    const list = this.getProdutos();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.ativo = !item.ativo;
      localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(list));
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('produtos_updated'));
      return item.ativo;
    }
    return false;
  }

  // Compatibilidade com decorações legadas
  getDecoracoes(): Decoracao[] {
    const produtos = this.getProdutos();
    return produtos.map((p) => ({
      ...p,
      categoria: (p.temaNome || 'Aniversários') as any,
    }));
  }

  getDecoracaoById(id: string): Decoracao | undefined {
    const p = this.getProdutoById(id);
    if (!p) return undefined;
    return {
      ...p,
      categoria: (p.temaNome || 'Aniversários') as any,
    };
  }

  saveDecoracao(decoracao: any): Decoracao {
    const saved = this.saveProduto({
      ...decoracao,
      temaId: decoracao.temaId || 'tema-aniversarios',
      temaNome: decoracao.categoria || decoracao.temaNome || 'Aniversários',
    });
    return {
      ...saved,
      categoria: (saved.temaNome || 'Aniversários') as any,
    };
  }

  deleteDecoracao(id: string): boolean {
    return this.deleteProduto(id);
  }

  toggleDecoracaoAtiva(id: string): boolean {
    return this.toggleProdutoAtivo(id);
  }

  // =============================================================
  // 4. AGENDAMENTOS (Criação, Status, Conflitos de Agenda)
  // =============================================================

  /**
   * Método interno estrito para checagem interna de disponibilidade de horários
   * Não expõe dados de agendamentos ou clientes para fora do serviço.
   */
  private getAgendamentosInterno(): Agendamento[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.AGENDAMENTOS);
    if (!data) return INITIAL_AGENDAMENTOS;
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_AGENDAMENTOS;
    }
  }

  /**
   * API administrativa confidencial: EXCLUSIVA para role='admin'.
   * Clientes comuns e visitantes têm o acesso negado com exceção imediata.
   */
  getAgendamentos(): Agendamento[] {
    authService.requireAdmin();
    return this.getAgendamentosInterno();
  }

  getAgendamentoById(id: string): Agendamento | undefined {
    authService.requireAdmin();
    return this.getAgendamentosInterno().find((a) => a.id === id || a.numeroPedido === id);
  }


  isHorarioDisponivel(dataStr: string, horarioStr: string): boolean {
    const disponiveis = this.getHorariosDisponiveis(dataStr);
    const slot = disponiveis.find((s) => s.horario === horarioStr);
    return Boolean(slot && slot.disponivel);
  }

  createAgendamento(data: Omit<Agendamento, 'id' | 'numeroPedido' | 'createdAt' | 'status'>): Agendamento {
    // 1. Verificação atômica estrita de disponibilidade de horário
    if (!this.isHorarioDisponivel(data.instalacao.data, data.instalacao.horario)) {
      throw new Error('⚠️ Este horário acabou de ser reservado. Escolha outro horário.');
    }

    const list = this.getAgendamentosInterno();

    // Dupla checagem contra conflito de horário no mesmo dia
    const conflito = list.some(
      (a) =>
        a.instalacao.data === data.instalacao.data &&
        a.instalacao.horario === data.instalacao.horario &&
        a.status !== 'cancelado'
    );

    if (conflito) {
      throw new Error('⚠️ Este horário acabou de ser reservado. Escolha outro horário.');
    }

    // Gerar número de pedido padronizado (Ex: #000123)
    const numeroSeq = (123 + list.length).toString().padStart(6, '0');
    const numeroPedido = `#${numeroSeq}`;
    const newId = `ag-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAgendamento: Agendamento = {
      ...data,
      id: newId,
      numeroPedido,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    list.unshift(newAgendamento);
    localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agendamentos_updated'));
    }
    return newAgendamento;
  }

  updateAgendamentoStatus(id: string, status: StatusAgendamento): boolean {
    authService.requireAdmin();
    const list = this.getAgendamentos();
    const item = list.find((a) => a.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('agendamentos_updated'));
      }
      return true;
    }
    return false;
  }

  // =============================================================
  // 5. CONFIGURAÇÕES DA AGENDA & DISPONIBILIDADE
  // =============================================================
  getConfiguracoes(): ConfiguracoesAgenda {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.CONFIGURACOES);
    return data ? JSON.parse(data) : CONFIGURACOES_AGENDA_PADRAO;
  }

  saveConfiguracoes(config: ConfiguracoesAgenda): void {
    authService.requireAdmin();
    localStorage.setItem(STORAGE_KEYS.CONFIGURACOES, JSON.stringify(config));
  }

  bloquearData(dataStr: string): void {
    authService.requireAdmin();
    const config = this.getConfiguracoes();
    if (!config.datasBloqueadas.includes(dataStr)) {
      config.datasBloqueadas.push(dataStr);
      this.saveConfiguracoes(config);
    }
  }

  liberarData(dataStr: string): void {
    authService.requireAdmin();
    const config = this.getConfiguracoes();
    config.datasBloqueadas = config.datasBloqueadas.filter((d) => d !== dataStr);
    this.saveConfiguracoes(config);
  }

  bloquearHorario(dataStr: string, horario: string): void {
    authService.requireAdmin();
    const config = this.getConfiguracoes();
    if (!config.horariosBloqueados) config.horariosBloqueados = {};
    if (!config.horariosBloqueados[dataStr]) config.horariosBloqueados[dataStr] = [];
    if (!config.horariosBloqueados[dataStr].includes(horario)) {
      config.horariosBloqueados[dataStr].push(horario);
      this.saveConfiguracoes(config);
    }
  }

  liberarHorario(dataStr: string, horario: string): void {
    authService.requireAdmin();
    const config = this.getConfiguracoes();
    if (config.horariosBloqueados && config.horariosBloqueados[dataStr]) {
      config.horariosBloqueados[dataStr] = config.horariosBloqueados[dataStr].filter(
        (h) => h !== horario
      );
      this.saveConfiguracoes(config);
    }
  }

  getHorariosDisponiveis(dataStr: string): HorarioSlot[] {
    const config = this.getConfiguracoes();
    const agendamentos = this.getAgendamentosInterno();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAlvo = new Date(dataStr + 'T00:00:00');
    if (dataAlvo < hoje) {
      return [];
    }

    const diaSemana = dataAlvo.getDay();
    if (!config.diasFuncionamento.includes(diaSemana)) {
      return [];
    }

    if (config.datasBloqueadas.includes(dataStr)) {
      return [];
    }

    const [hInicio, mInicio] = config.horarioInicial.split(':').map(Number);
    const [hFim, mFim] = config.horarioFinal.split(':').map(Number);

    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFim = hFim * 60 + mFim;
    const duracaoTotalSlot = config.duracaoInstalacaoMinutos + config.intervaloMinutos;

    const slotsGerados: string[] = [];
    for (let m = minutosInicio; m + config.duracaoInstalacaoMinutos <= minutosFim; m += duracaoTotalSlot) {
      const hora = Math.floor(m / 60);
      const minuto = m % 60;
      slotsGerados.push(
        `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
      );
    }

    const listaSlots =
      slotsGerados.length > 0 ? slotsGerados : ['08:00', '10:00', '13:00', '15:00', '17:00'];

    const agendamentosNoDia = agendamentos.filter(
      (a) => a.instalacao.data === dataStr && a.status !== 'cancelado'
    );
    const ocupados = new Set(agendamentosNoDia.map((a) => a.instalacao.horario));

    const bloqueadosAdmin = new Set(
      config.horariosBloqueados && config.horariosBloqueados[dataStr]
        ? config.horariosBloqueados[dataStr]
        : []
    );

    return listaSlots.map((horario) => {
      if (ocupados.has(horario)) {
        return { horario, disponivel: false, motivo: 'ocupado_agendamento' };
      }
      if (bloqueadosAdmin.has(horario)) {
        return { horario, disponivel: false, motivo: 'bloqueado_admin' };
      }
      return { horario, disponivel: true };
    });
  }

  // =============================================================
  // 6. PERFIL DO ADMIN & SEGURANÇA (MINHA CONTA, HASH, 2FA)
  // Delegado de forma estrita para authService
  // =============================================================
  getAdminProfile(): AdminUser {
    return authService.getAdminProfile();
  }

  saveAdminProfile(profile: Partial<AdminUser>): AdminUser {
    authService.requireAdmin();
    return authService.saveAdminProfile(profile);
  }

  async updateAdminPassword(senhaAtual: string, novaSenha: string): Promise<{ success: boolean; message: string }> {
    return authService.updateAdminPassword(senhaAtual, novaSenha);
  }

  // -------------------------------------------------------------
  // 2FA - AUTENTICAÇÃO EM DUAS ETAPAS
  // -------------------------------------------------------------
  is2FAEnabled(): boolean {
    return authService.getAdminProfile().twoFactorEnabled;
  }

  set2FAEnabled(enabled: boolean, channel: 'email' | 'sms' = 'email'): void {
    authService.requireAdmin();
    authService.saveAdminProfile({ twoFactorEnabled: enabled, twoFactorChannel: channel });
  }

  generate2FACode(): { code: string; destination: string } {
    return authService.generate2FACode();
  }

  get2FAState(): TwoFactorState | null {
    return authService.get2FAState();
  }

  verify2FACode(inputCode: string): { success: boolean; message: string } {
    return authService.verify2FACode(inputCode);
  }

  // -------------------------------------------------------------
  // AUTENTICAÇÃO GERAL
  // -------------------------------------------------------------
  isAdminAuthenticated(): boolean {
    return authService.isAdmin();
  }

  async loginStep1(email: string, pass: string): Promise<{ success: boolean; requires2FA: boolean; message?: string }> {
    return authService.loginAdmin(email, pass);
  }

  logoutAdmin(): void {
    authService.logout();
  }

  resetToDemo(): void {
    authService.requireAdmin();
    localStorage.setItem(STORAGE_KEYS.EMPRESA, JSON.stringify(SITE_CONFIG));
    localStorage.setItem(STORAGE_KEYS.TEMAS, JSON.stringify(INITIAL_TEMAS));
    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(INITIAL_PRODUTOS));
    localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(INITIAL_AGENDAMENTOS));
    localStorage.setItem(STORAGE_KEYS.CONFIGURACOES, JSON.stringify(CONFIGURACOES_AGENDA_PADRAO));
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(INITIAL_ADMIN_USER));
    localStorage.removeItem(STORAGE_KEYS.TWO_FACTOR_STATE);
  }
}

export const storageService = new StorageService();
