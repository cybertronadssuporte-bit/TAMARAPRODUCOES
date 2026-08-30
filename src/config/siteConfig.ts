import { CategoriaEvento, ConfiguracoesAgenda, EmpresaConfig } from '../types';

export const SITE_CONFIG: EmpresaConfig = {
  id: 'empresa-default',
  nome: 'TAMARA PRODUÇÕES',
  logoUrl: null,
  whatsapp: '5585998672404',
  whatsappFormatado: '+55 85 99867-2404',
  email: 'contato@tamaraproducoes.com.br',
  slogan: 'Transforme seu evento em um momento inesquecível',
  subtitulo: 'Escolha seu tema, selecione sua decoração e agende a instalação de forma rápida e fácil.',
  cidadePadrao: 'Fortaleza - CE',
  updatedAt: new Date().toISOString(),
};

export const CATEGORIAS_EVENTOS: { nome: CategoriaEvento; descricao: string; imagem: string; icone: string }[] = [
  {
    nome: 'Aniversários',
    descricao: 'Celebrações memoráveis com temas contemporâneos, personagens épicos e arranjos orgânicos.',
    imagem: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    icone: 'Cake',
  },
  {
    nome: 'Casamentos',
    descricao: 'Cenografia romântica e refinada com arcos florais, iluminação intimista e toques dourados.',
    imagem: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    icone: 'Heart',
  },
  {
    nome: 'Festas infantis',
    descricao: 'Universos lúdicos e interativos dos personagens favoritos das crianças com muita criatividade.',
    imagem: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
    icone: 'Smile',
  },
  {
    nome: 'Chá revelação',
    descricao: 'Cenários mágicos e delicados em tons pastéis e nuvens de balões para revelar seu maior amor.',
    imagem: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    icone: 'Sparkles',
  },
  {
    nome: 'Noivados',
    descricao: 'Elegância minimalista e aconchegante para celebrar o primeiro passo para o grande dia.',
    imagem: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    icone: 'Gem',
  },
  {
    nome: 'Eventos corporativos',
    descricao: 'Estruturas impactantes para palestras, lançamentos de marcas, confraternizações e congressos.',
    imagem: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    icone: 'Briefcase',
  },
  {
    nome: 'Outras comemorações',
    descricao: 'Formaturas, batizados, bodas e jantares exclusivos sob medida.',
    imagem: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    icone: 'PartyPopper',
  },
];

export const CONFIGURACOES_AGENDA_PADRAO: ConfiguracoesAgenda = {
  horarioInicial: '08:00',
  horarioFinal: '18:00',
  duracaoInstalacaoMinutos: 120, // 2 horas
  intervaloMinutos: 30, // 30 min
  diasFuncionamento: [0, 1, 2, 3, 4, 5, 6], // Todos os dias
  datasBloqueadas: ['2026-12-25', '2026-12-31', '2026-01-01'],
  horariosBloqueados: {},
};
