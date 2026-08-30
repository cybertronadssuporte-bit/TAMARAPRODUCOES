export type CategoriaEvento =
  | 'Aniversários'
  | 'Casamentos'
  | 'Chá revelação'
  | 'Noivados'
  | 'Eventos corporativos'
  | 'Festas infantis'
  | 'Outras comemorações';

export type StatusAgendamento =
  | 'pendente'
  | 'confirmado'
  | 'em_preparacao'
  | 'instalacao_realizada'
  | 'cancelado';

export interface EmpresaConfig {
  id: string;
  nome: string;
  logoUrl: string | null;
  whatsapp: string; // ex: "5585998672404"
  whatsappFormatado: string; // ex: "+55 85 99867-2404"
  email: string;
  slogan?: string;
  subtitulo?: string;
  cidadePadrao?: string;
  updatedAt: string;
}

export interface Tema {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl: string;
  ativo: boolean;
  ordem: number;
  createdAt: string;
}

export interface Produto {
  id: string;
  temaId: string;
  temaNome?: string;
  nome: string;
  descricao: string;
  preco: number;
  imagens: string[];
  itensInclusos: string[];
  observacoes?: string;
  ativo: boolean;
  ordem?: number;
  createdAt: string;
}

// Mantido para compatibilidade retroativa
export interface Decoracao extends Produto {
  categoria: CategoriaEvento;
}

export interface ClienteDados {
  nome: string;
  whatsapp: string;
  email: string;
}

export interface EventoDados {
  tipoEvento: string;
  dataEvento: string; // YYYY-MM-DD
  endereco: string;
  numero: string; // Número do imóvel
  bairro: string;
  cidade: string;
  pontoReferencia?: string;
  observacoes?: string;
}

export interface InstalacaoDados {
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm (ex: "08:00")
}

export interface Agendamento {
  id: string;
  numeroPedido: string; // ex: #DEC-2026-8491
  temaId: string;
  temaNome: string;
  produtoId: string;
  produtoNome: string;
  // Campos legados para retrocompatibilidade
  decoracaoId?: string;
  decoracaoNome?: string;
  decoracaoPreco?: number;
  cliente: ClienteDados;
  evento: EventoDados;
  instalacao: InstalacaoDados;
  valorTotal: number;
  status: StatusAgendamento;
  createdAt: string;
}

export interface ConfiguracoesAgenda {
  horarioInicial: string; // ex: "08:00"
  horarioFinal: string; // ex: "18:00"
  duracaoInstalacaoMinutos: number; // ex: 120 (2 horas)
  intervaloMinutos: number; // ex: 30
  diasFuncionamento: number[]; // 0=Domingo, 1=Segunda, ... 6=Sábado
  datasBloqueadas: string[]; // ['2026-12-25', '2026-01-01']
  horariosBloqueados: Record<string, string[]>; // { '2026-09-10': ['10:00', '14:00'] }
}

export interface HorarioSlot {
  horario: string; // HH:mm
  disponivel: boolean;
  motivo?: 'ocupado_agendamento' | 'bloqueado_admin' | 'fora_horario';
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senhaHash: string; // Hash SHA-256
  twoFactorEnabled: boolean;
  twoFactorChannel: 'email' | 'sms';
}

export interface TwoFactorState {
  code: string | null;
  expiresAt: number | null; // Timestamp
  attempts: number;
  destination: string; // Email ou telefone onde foi enviado
}
