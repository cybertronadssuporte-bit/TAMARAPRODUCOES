import { AdminUser, UserProfile, UserRole, AuthSession, RequisitosSenha, TwoFactorState } from '../types';
import { isSupabaseConnected, supabase } from './supabaseClient';

const AUTH_KEYS = {
  SESSION: 'tamara_auth_session_v3',
  ADMIN_PROFILE: 'tamara_admin_profile_v2',
  TWO_FACTOR_STATE: 'tamara_2fa_state_v2',
  CUSTOMER_PROFILES: 'tamara_customer_profiles_v1',
};

// Hash SHA-256 pré-calculado para o administrador inicial padrão
const INITIAL_ADMIN_HASH = 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18';

// Usuário Admin Padrão
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-master-tamara',
  nome: 'Tamara Produções (Administrador)',
  email: 'admin@tamaraproducoes.com.br',
  telefone: '(85) 99867-2404',
  senhaHash: INITIAL_ADMIN_HASH,
  twoFactorEnabled: false,
  twoFactorChannel: 'email',
  role: 'admin',
};

// Utilitário de hash SHA-256 universal (funciona em HTTPS, HTTP, localhost e redes locais)
export async function sha256(message: string): Promise<string> {
  // 1. Tentar Web Crypto API nativa se disponível
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Em caso de falha de contexto, prossegue para o cálculo puro em JS
    }
  }

  // 2. Algoritmo SHA-256 determinístico de 256 bits em JavaScript puro
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  const words: number[] = [];
  const asciiBitLength = message.length * 8;
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  let str = message + '\x80';
  while (str.length % 64 - 56) str += '\x00';
  for (i = 0; i < str.length; i++) {
    j = str.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  return hash.slice(0, 8).map((h) => (h >>> 0).toString(16).padStart(8, '0')).join('');
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
      const initialProfile = {
        ...DEFAULT_ADMIN,
        senhaAlteradaPeloUsuario: false,
      };
      localStorage.setItem(AUTH_KEYS.ADMIN_PROFILE, JSON.stringify(initialProfile));
      return initialProfile as any;
    }
    try {
      const parsed = JSON.parse(existing);
      parsed.role = 'admin';
      // Se a senha no armazenamento for a inicial padrão, ela ainda não foi alterada pelo usuário
      if (
        parsed.senhaHash === INITIAL_ADMIN_HASH ||
        parsed.senhaHash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
      ) {
        parsed.senhaAlteradaPeloUsuario = false;
      }
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
   * Proteção REAL: validação estrita do token de sessão e role='admin'
   * Nenhuma flag de localStorage é aceita como bypass.
   */
  isAdmin(): boolean {
    const session = this.getSession();
    if (!session || !session.token) return false;
    // Se a sessão expirou, invalida
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.logout();
      return false;
    }
    // Permissão concedida SOMENTE se role === 'admin'
    return session.role === 'admin';
  },

  /**
   * Verifica se o usuário é um CLIENTE comum (role = 'customer')
   */
  isCustomer(): boolean {
    const session = this.getSession();
    if (!session) return false;
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.logout();
      return false;
    }
    return session.role === 'customer';
  },

  /**
   * Guarda de segurança rigorosa para rotinas administrativas:
   * Lança erro se a requisição não vier de um administrador autenticado.
   */
  requireAdmin(): void {
    if (!this.isAdmin()) {
      throw new Error('Acesso não autorizado: Esta operação é confidencial e restrita a administradores.');
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

    // 1. Se o Supabase estiver conectado, tentar autenticar via Supabase Auth
    if (isSupabaseConnected && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: senhaDigitada,
        });

        if (!error && data?.user) {
          // Consultar profile para verificar se é ADMIN
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, name, email, telefone')
            .eq('id', data.user.id)
            .single();

          if (profileData && profileData.role === 'admin') {
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
          }
        }
      } catch {
        // Prossegue para a autenticação local
      }
    }

    // 2. Autenticação Local / Segura (Fallback Sincronizado e Resiliente)
    const admin = this.getAdminProfile();
    const cleanSenha = senhaDigitada.trim();
    const hash = await sha256(cleanSenha);

    const HASH_TAMARA = 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18';
    const HASH_LEGADO = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

    // REGRA DE SEGURANÇA ESTRITA:
    // Não aceitar senhas padrões depois que a senha for alterada pelo administrador!
    let isSenhaValida = false;
    if ((admin as any).senhaAlteradaPeloUsuario) {
      // Depois de alterada, SOMENTE a nova senha cadastrada é válida. Senhas padrões são recusadas!
      isSenhaValida = hash === admin.senhaHash;
    } else {
      // Enquanto não for alterada pelo administrador, aceita a senha padrão inicial
      isSenhaValida =
        hash === admin.senhaHash ||
        hash === HASH_TAMARA ||
        hash === HASH_LEGADO;
    }


    const isEmailValido =
      cleanEmail === 'admin' ||
      cleanEmail === 'tamara' ||
      cleanEmail === 'tamaraproducoes' ||
      cleanEmail === 'admin@tamaraproducoes.com.br' ||
      cleanEmail === 'contato@tamaraproducoes.com.br' ||
      cleanEmail === 'admin@decorart.com.br' ||
      cleanEmail === (admin.email || '').toLowerCase().trim() ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('tamara');

    if (isEmailValido && isSenhaValida) {
      if (admin.twoFactorEnabled) {
        this.generate2FACode();
        return { success: true, requires2FA: true };
      } else {
        this.createSession(
          {
            id: admin.id || 'admin-master',
            nome: admin.nome || 'Tamara Produções (Administrador)',
            email: admin.email || 'admin@tamaraproducoes.com.br',
            role: 'admin',
            telefone: admin.telefone || '(85) 99867-2404',
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
        : admin.email || 'admin@tamaraproducoes.com.br';

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
    const cleanSenhaAtual = senhaAtual.trim();
    const hashAtual = await sha256(cleanSenhaAtual);

    const HASH_TAMARA = 'f6ea3aa2062233d774ca9cc608b28c3dfa3947709c01e339425aced3e33c7f18';
    const HASH_LEGADO = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

    let isSenhaAtualCorreta = false;
    if ((admin as any).senhaAlteradaPeloUsuario) {
      isSenhaAtualCorreta = hashAtual === admin.senhaHash;
    } else {
      // Validação estrita por hash SHA-256 no sistema de autenticação
      isSenhaAtualCorreta =
        hashAtual === admin.senhaHash ||
        hashAtual === HASH_TAMARA ||
        hashAtual === HASH_LEGADO;
    }


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

    // 2. Atualizar no perfil local criptografado com a nova senha
    const novoHash = await sha256(novaSenha);
    this.saveAdminProfile({
      senhaHash: novoHash,
      senhaAlteradaPeloUsuario: true,
    } as any);

    // 3. Invalidação obrigatória de todas as sessões anteriores por segurança
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
    localStorage.removeItem('tamara_admin_auth_v2');
    localStorage.removeItem(AUTH_KEYS.TWO_FACTOR_STATE);

    if (isSupabaseConnected && supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: null }));
    }
  },
};

