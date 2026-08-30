import { AdminUser, UserProfile, UserRole, AuthSession, RequisitosSenha, TwoFactorState } from '../types';
import { isSupabaseConnected, supabase } from './supabaseClient';

const AUTH_KEYS = {
  SESSION: 'tamara_auth_session_v3',
  ADMIN_PROFILE: 'tamara_admin_profile_v2',
  TWO_FACTOR_STATE: 'tamara_2fa_state_v2',
  CUSTOMER_PROFILES: 'tamara_customer_profiles_v1',
};

// SHA-256 pré-calculado para o administrador inicial padrão
// Senha padrão inicial: "Admin@Tamara2026!"
const INITIAL_ADMIN_HASH = 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18';

// Usuário Admin Padrão
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-master-tamara',
  nome: 'Tamara Produções (Administrador)',
  email: 'admin@decorart.com.br',
  telefone: '(85) 99867-2404',
  senhaHash: INITIAL_ADMIN_HASH,
  twoFactorEnabled: false,
  twoFactorChannel: 'email',
  role: 'admin',
};

// Utilitário de hash SHA-256
export async function sha256(message: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  /**
   * Validação detalhada dos requisitos de segurança da senha
   */
  validarRequisitosSenha(senha: string): RequisitosSenha {
    const minimo8 = senha.length >= 8;
    const maiuscula = /[A-Z]/.test(senha);
    const minuscula = /[a-z]/.test(senha);
    const numero = /[0-9]/.test(senha);
    const especial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(senha);

    return {
      minimo8,
      maiuscula,
      minuscula,
      numero,
      especial,
      todosValidos: minimo8 && maiuscula && minuscula && numero && especial,
    };
  },

  /**
   * Inicializa o perfil do administrador seguro caso não exista
   */
  initAdminProfile(): AdminUser {
    const existing = localStorage.getItem(AUTH_KEYS.ADMIN_PROFILE);
    if (!existing) {
      localStorage.setItem(AUTH_KEYS.ADMIN_PROFILE, JSON.stringify(DEFAULT_ADMIN));
      return DEFAULT_ADMIN;
    }
    try {
      const parsed = JSON.parse(existing);
      // Garantir role='admin'
      parsed.role = 'admin';
      return parsed;
    } catch {
      localStorage.setItem(AUTH_KEYS.ADMIN_PROFILE, JSON.stringify(DEFAULT_ADMIN));
      return DEFAULT_ADMIN;
    }
  },

  getAdminProfile(): AdminUser {
    return this.initAdminProfile();
  },

  saveAdminProfile(data: Partial<AdminUser>): AdminUser {
    const current = this.getAdminProfile();
    const updated: AdminUser = {
      ...current,
      ...data,
      role: 'admin', // Impede qualquer alteração de role
    };
    localStorage.setItem(AUTH_KEYS.ADMIN_PROFILE, JSON.stringify(updated));
    return updated;
  },

  /**
   * Retorna a sessão ativa
   */
  getSession(): AuthSession | null {
    const data = localStorage.getItem(AUTH_KEYS.SESSION);
    if (!data) return null;
    try {
      const session: AuthSession = JSON.parse(data);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      this.logout();
      return null;
    }
  },

  /**
   * Retorna o usuário autenticado atualmente
   */
  getCurrentUser(): UserProfile | null {
    const session = this.getSession();
    return session ? session.user : null;
  },

  /**
   * Retorna a role do usuário autenticado: 'admin' | 'customer' | null
   */
  getCurrentRole(): UserRole | null {
    const session = this.getSession();
    return session ? session.role : null;
  },

  /**
   * Verifica se o usuário autenticado atual possui privilégios de ADMINISTRADOR
   */
  isAdmin(): boolean {
    const session = this.getSession();
    return Boolean(session && session.role === 'admin');
  },

  /**
   * Verifica se o usuário é um CLIENTE comum
   */
  isCustomer(): boolean {
    const session = this.getSession();
    return Boolean(session && session.role === 'customer');
  },

  /**
   * Guarda de segurança para rotinas administrativas: lança erro se não for admin
   */
  requireAdmin(): void {
    if (!this.isAdmin()) {
      throw new Error('Acesso não autorizado: Esta operação exige privilégios de administrador.');
    }
  },

  /**
   * Cria uma sessão segura
   */
  createSession(user: UserProfile, role: UserRole): AuthSession {
    // Validação rígida: se a role for diferente de 'admin' e 'customer', barra
    if (role !== 'admin' && role !== 'customer') {
      throw new Error('Função de usuário inválida.');
    }

    const session: AuthSession = {
      user,
      role,
      token: `token_${role}_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas de validade
    };

    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: session }));
    }
    return session;
  },

  /**
   * Login do Administrador (Etapa 1: Credenciais + verificação de Role)
   */
  async loginAdmin(
    email: string,
    senhaDigitada: string
  ): Promise<{ success: boolean; requires2FA: boolean; message?: string }> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Se o Supabase estiver conectado, autenticar via Supabase Auth
    if (isSupabaseConnected && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: senhaDigitada,
        });

        if (error || !data.user) {
          return { success: false, requires2FA: false, message: 'E-mail ou senha incorretos.' };
        }

        // Consultar profile para verificar se é ADMIN
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('role, name, email, telefone')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profileData || profileData.role !== 'admin') {
          // Bloquear imediatamente clientes tentando logar no admin
          await supabase.auth.signOut();
          return {
            success: false,
            requires2FA: false,
            message: 'Acesso negado. Esta conta não possui permissão de administrador.',
          };
        }

        // Se tem 2FA
        const admin = this.getAdminProfile();
        if (admin.twoFactorEnabled) {
          this.generate2FACode();
          return { success: true, requires2FA: true };
        }

        this.createSession(
          {
            id: data.user.id,
            nome: profileData.name || 'Administrador',
            email: cleanEmail,
            role: 'admin',
            telefone: profileData.telefone,
          },
          'admin'
        );

        return { success: true, requires2FA: false };
      } catch (err: any) {
        return {
          success: false,
          requires2FA: false,
          message: err.message || 'Erro ao conectar ao servidor de autenticação.',
        };
      }
    }

    // 2. Autenticação Local / Segura (Fallback Sincronizado)
    const admin = this.getAdminProfile();
    const hash = await sha256(senhaDigitada);

    // Suporte também à senha legada "admin123" caso ainda não tenha sido alterada pelo usuário
    const isHashValido =
      hash === admin.senhaHash ||
      (admin.senhaHash === INITIAL_ADMIN_HASH && hash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');

    if (cleanEmail === admin.email.toLowerCase().trim() && isHashValido) {
      if (admin.twoFactorEnabled) {
        this.generate2FACode();
        return { success: true, requires2FA: true };
      } else {
        this.createSession(
          {
            id: admin.id,
            nome: admin.nome,
            email: admin.email,
            role: 'admin',
            telefone: admin.telefone,
          },
          'admin'
        );
        return { success: true, requires2FA: false };
      }
    }

    return { success: false, requires2FA: false, message: 'E-mail ou senha incorretos.' };
  },

  /**
   * Login ou Criação de Cliente Comum (Role: 'customer')
   * Clientes comuns NUNCA recebem role='admin'
   */
  loginCustomer(nome: string, email: string, whatsapp: string): AuthSession {
    const customerUser: UserProfile = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      telefone: whatsapp.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    return this.createSession(customerUser, 'customer');
  },

  /**
   * Geração de código 2FA de 6 dígitos com expiração de 5 minutos
   */
  generate2FACode(): { code: string; destination: string } {
    const admin = this.getAdminProfile();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos de validade

    const destination =
      admin.twoFactorChannel === 'sms'
        ? admin.telefone || '(85) 99867-2404'
        : admin.email || 'admin@decorart.com.br';

    const state: TwoFactorState = {
      code,
      expiresAt,
      attempts: 0,
      destination,
    };

    localStorage.setItem(AUTH_KEYS.TWO_FACTOR_STATE, JSON.stringify(state));
    return { code, destination };
  },

  get2FAState(): TwoFactorState | null {
    const data = localStorage.getItem(AUTH_KEYS.TWO_FACTOR_STATE);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Validação do código 2FA
   */
  verify2FACode(inputCode: string): { success: boolean; message: string } {
    const state = this.get2FAState();
    if (!state || !state.code || !state.expiresAt) {
      return { success: false, message: 'Nenhum código 2FA ativo. Solicite um novo código.' };
    }

    if (Date.now() > state.expiresAt) {
      localStorage.removeItem(AUTH_KEYS.TWO_FACTOR_STATE);
      return { success: false, message: 'Código expirado (validade de 5 minutos). Solicite um novo código.' };
    }

    if (state.attempts >= 3) {
      localStorage.removeItem(AUTH_KEYS.TWO_FACTOR_STATE);
      return {
        success: false,
        message: 'Limite de 3 tentativas excedido. O código foi bloqueado por segurança. Solicite um novo.',
      };
    }

    if (inputCode.trim() !== state.code) {
      state.attempts += 1;
      localStorage.setItem(AUTH_KEYS.TWO_FACTOR_STATE, JSON.stringify(state));
      const restantes = 3 - state.attempts;
      return {
        success: false,
        message: `Código incorreto. Você tem mais ${restantes} ${restantes === 1 ? 'tentativa' : 'tentativas'}.`,
      };
    }

    // Código correto: concede a sessão de administrador
    localStorage.removeItem(AUTH_KEYS.TWO_FACTOR_STATE);
    const admin = this.getAdminProfile();
    this.createSession(
      {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        role: 'admin',
        telefone: admin.telefone,
      },
      'admin'
    );

    return { success: true, message: 'Autenticação em duas etapas realizada com sucesso!' };
  },

  /**
   * Alteração Real de Senha do Administrador
   * - Verifica senha atual
   * - Valida requisitos da nova senha
   * - Atualiza autenticação real
   * - Invalida sessões anteriores
   */
  async updateAdminPassword(
    senhaAtual: string,
    novaSenha: string
  ): Promise<{ success: boolean; message: string }> {
    this.requireAdmin();

    const admin = this.getAdminProfile();
    const hashAtual = await sha256(senhaAtual);

    const isSenhaAtualCorreta =
      hashAtual === admin.senhaHash ||
      (admin.senhaHash === INITIAL_ADMIN_HASH && hashAtual === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');

    if (!isSenhaAtualCorreta) {
      return {
        success: false,
        message: '❌ Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.',
      };
    }

    // Validação rígida de requisitos
    const reqs = this.validarRequisitosSenha(novaSenha);
    if (!reqs.todosValidos) {
      const erros: string[] = [];
      if (!reqs.minimo8) erros.push('mínimo de 8 caracteres');
      if (!reqs.maiuscula) erros.push('uma letra maiúscula');
      if (!reqs.minuscula) erros.push('uma letra minúscula');
      if (!reqs.numero) erros.push('um número');
      if (!reqs.especial) erros.push('um caractere especial (!@#$%^&*...)');

      return {
        success: false,
        message: `A nova senha deve atender aos requisitos: ${erros.join(', ')}.`,
      };
    }

    // 1. Se estiver conectado ao Supabase, atualizar no Supabase Auth
    if (isSupabaseConnected && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: novaSenha });
        if (error) {
          return {
            success: false,
            message: `❌ Não foi possível alterar a senha no servidor: ${error.message}`,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          message: '❌ Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.',
        };
      }
    }

    // 2. Atualizar no perfil local criptografado
    const novoHash = await sha256(novaSenha);
    this.saveAdminProfile({ senhaHash: novoHash });

    // 3. Invalidação de sessões anteriores por segurança
    this.logout();

    return {
      success: true,
      message: '✅ Senha alterada com sucesso!',
    };
  },

  /**
   * Encerra a sessão e limpa credenciais temporárias
   */
  logout(): void {
    localStorage.removeItem(AUTH_KEYS.SESSION);
    localStorage.removeItem(AUTH_KEYS.TWO_FACTOR_STATE);
    // Limpar chaves legadas se houver
    localStorage.removeItem('tamara_admin_auth_v2');

    if (isSupabaseConnected && supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: null }));
    }
  },
};
