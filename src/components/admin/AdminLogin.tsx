import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { authService, cleanMobileEmail, cleanMobileInput } from '../../services/authService';
import { StorageImage } from '../common/StorageImage';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [empresa] = useState(() => storageService.getEmpresaConfig());

  // Estado de configuração: se é Primeiro Acesso ou Login Normal
  const [isSetupMode, setIsSetupMode] = useState<boolean>(() => !authService.isAdminConfigured());
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Campos de Login Normal
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos de Primeiro Acesso (Setup)
  const [setupNome, setSetupNome] = useState('Tamara Produções (Administrador)');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupSenha, setSetupSenha] = useState('');
  const [setupConfirmaSenha, setSetupConfirmaSenha] = useState('');
  const [showSetupSenha, setShowSetupSenha] = useState(false);

  // Etapa 2FA (se habilitada)
  const [step2FA, setStep2FA] = useState(false);
  const [codigo2FA, setCodigo2FA] = useState('');
  const [twoFactorDestination, setTwoFactorDestination] = useState('');
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);

  // Sincroniza status na nuvem ao carregar a tela
  useEffect(() => {
    let mounted = true;
    authService
      .syncAdminProfileFromCloud()
      .then((profile) => {
        if (mounted) {
          const configured = Boolean(profile.isConfigured && profile.senhaHash && profile.email);
          setIsSetupMode(!configured);
          setCheckingStatus(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsSetupMode(!authService.isAdminConfigured());
          setCheckingStatus(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Requisitos de senha em tempo real no Setup
  const reqs = authService.validarRequisitosSenha(setupSenha);

  // Submissão do Setup de Primeiro Acesso
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanNomeVal = cleanMobileInput(setupNome);
    const cleanEmailVal = cleanMobileEmail(setupEmail);
    const cleanSenhaVal = cleanMobileInput(setupSenha);
    const cleanConfirmaVal = cleanMobileInput(setupConfirmaSenha);

    if (!cleanEmailVal || !cleanSenhaVal) {
      setErrorMsg('Por favor, preencha o e-mail e a senha do administrador.');
      return;
    }

    if (cleanSenhaVal !== cleanConfirmaVal) {
      setErrorMsg('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    if (!reqs.todosValidos) {
      setErrorMsg('A senha precisa atender a todos os requisitos de segurança abaixo.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.setupFirstAdmin({
        nome: cleanNomeVal,
        email: cleanEmailVal,
        senha: cleanSenhaVal,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setLoading(false);
        return;
      }

      setSuccessMsg('Credenciais configuradas e sincronizadas com sucesso! Entrando...');
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess();
      }, 700);
    } catch {
      setErrorMsg('Erro ao salvar as credenciais. Tente novamente.');
      setLoading(false);
    }
  };

  // Submissão do Login Normal
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const cleanEmailVal = cleanMobileEmail(email);
    const cleanSenhaVal = cleanMobileInput(senha);

    if (!cleanEmailVal || !cleanSenhaVal) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.loginAdmin(cleanEmailVal, cleanSenhaVal);

      if (res.requiresSetup) {
        setIsSetupMode(true);
        setErrorMsg(res.message || 'Administrador ainda não configurado.');
        setLoading(false);
        return;
      }

      if (!res.success) {
        setErrorMsg(res.message || 'E-mail ou senha incorretos.');
        setLoading(false);
        return;
      }

      if (res.requires2FA) {
        const state = authService.get2FAState();
        const dest = state ? state.destination : 'seu canal cadastrado';
        setTwoFactorDestination(dest);
        setStep2FA(true);
        setLoading(false);
        if (state && state.code) {
          setSimulatedAlert(`[Simulação 2FA]: Código de verificação: ${state.code}`);
        }
      } else {
        setLoading(false);
        onLoginSuccess();
      }
    } catch {
      setErrorMsg('Erro de conexão ao verificar credenciais. Tente novamente.');
      setLoading(false);
    }
  };

  // Validação do 2FA
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = cleanMobileInput(codigo2FA).replace(/\D/g, '');

    if (cleanCode.length !== 6) {
      setErrorMsg('Por favor, informe os 6 dígitos do código.');
      return;
    }

    setLoading(true);
    const res = authService.verify2FACode(cleanCode);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResend2FACode = () => {
    const { code, destination } = authService.generate2FACode();
    setTwoFactorDestination(destination);
    setCodigo2FA('');
    setErrorMsg(null);
    setSimulatedAlert(`[Novo Código 2FA]: ${code}`);
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand */}
        <div className="text-center space-y-2">
          {empresa.logoUrl ? (
            <div className="h-16 flex items-center justify-center mx-auto mb-2">
              <StorageImage src={empresa.logoUrl} alt={empresa.nome} className="max-h-16 w-auto object-contain" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-300 flex items-center justify-center shadow-luxury mx-auto">
              <Sparkles className="w-7 h-7 text-noir-950" />
            </div>
          )}

          <h1 className="font-serif text-2xl font-bold text-white uppercase tracking-tight">
            {empresa.nome}
          </h1>
          <p className="text-xs text-gold-400 font-semibold tracking-wider uppercase">
            {isSetupMode ? 'Configuração Inicial do Administrador' : 'Painel Administrativo Restrito'}
          </p>
        </div>

        {/* Card Principal */}
        <div className="mt-8 bg-noir-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-gold-400/20 shadow-2xl space-y-6">
          {/* Estado de Carregamento Inicial */}
          {checkingStatus ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gold-300">Sincronizando status na nuvem...</p>
            </div>
          ) : (
            <>
              {/* Mensagem de Erro */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Mensagem de Sucesso */}
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Alerta de Simulação 2FA */}
              {simulatedAlert && (
                <div className="p-3.5 rounded-xl bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs flex items-start gap-2.5 animate-fade-in">
                  <KeyRound className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span>{simulatedAlert}</span>
                </div>
              )}

          {/* FLUXO 1: PRIMEIRO ACESSO (CRIAR ADMINISTRADOR) */}
          {isSetupMode ? (
            <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-gold-400/10 border border-gold-400/20 text-gold-300 text-[11px] leading-relaxed">
                👋 <strong>Primeiro Acesso:</strong> Defina o e-mail e a senha mestra do administrador. Esta credencial será o padrão oficial para acesso em computadores e celulares.
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Nome do Administrador
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={setupNome}
                    placeholder="Ex: Tamara Produções"
                    onChange={(e) => setSetupNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  E-mail de Acesso do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    name="username"
                    autoComplete="username email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={setupEmail}
                    placeholder="seuemail@exemplo.com"
                    onChange={(e) => setSetupEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Criar Senha Segura
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSetupSenha ? 'text' : 'password'}
                    name="new-password"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={setupSenha}
                    placeholder="Defina sua senha"
                    onChange={(e) => setSetupSenha(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupSenha(!showSetupSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    aria-label={showSetupSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showSetupSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSetupSenha ? 'text' : 'password'}
                    name="confirm-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={setupConfirmaSenha}
                    placeholder="Repita a senha"
                    onChange={(e) => setSetupConfirmaSenha(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Requisitos de Senha */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-[10px]">
                <div className="font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Requisitos de segurança da senha:
                </div>
                <div className="grid grid-cols-2 gap-1 text-gray-400">
                  <span className={reqs.minimo8 ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                    {reqs.minimo8 ? '✓' : '•'} Mínimo 8 caracteres
                  </span>
                  <span className={reqs.maiuscula ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                    {reqs.maiuscula ? '✓' : '•'} Letra maiúscula (A-Z)
                  </span>
                  <span className={reqs.minuscula ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                    {reqs.minuscula ? '✓' : '•'} Letra minúscula (a-z)
                  </span>
                  <span className={reqs.numero ? 'text-emerald-400 flex items-center gap-1' : 'flex items-center gap-1'}>
                    {reqs.numero ? '✓' : '•'} Número (0-9)
                  </span>
                </div>
                <div className={reqs.especial ? 'text-emerald-400' : 'text-gray-400'}>
                  {reqs.especial ? '✓' : '•'} Caractere especial (!@#$%^&*...)
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !reqs.todosValidos || setupSenha !== setupConfirmaSenha}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:to-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
                >
                  {loading ? (
                    <span>Salvando na Nuvem...</span>
                  ) : (
                    <>
                      <span>CRIAR ADMINISTRADOR & ACESSAR</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {authService.isAdminConfigured() && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSetupMode(false)}
                    className="text-[11px] text-gray-400 hover:text-gold-400"
                  >
                    Já possui administrador configurado? <strong>Fazer Login</strong>
                  </button>
                </div>
              )}
            </form>
          ) : !step2FA ? (
            /* FLUXO 2: LOGIN NORMAL */
            <form onSubmit={handleStep1Submit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    name="username"
                    autoComplete="username email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={email}
                    placeholder="seuemail@exemplo.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={senha}
                    placeholder="••••••••••••"
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    aria-label={showSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:to-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
                >
                  {loading ? (
                    <span>Verificando...</span>
                  ) : (
                    <>
                      <span>ACESSAR PAINEL</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSetupMode(true)}
                  className="text-[11px] text-gray-400 hover:text-gold-400"
                >
                  Precisa reconfigurar ou cadastrar novo acesso? <strong>Clique aqui</strong>
                </button>
              </div>
            </form>
          ) : (
            /* FLUXO 3: CONFIRMAÇÃO 2FA */
            <form onSubmit={handleStep2Submit} className="space-y-5 text-xs animate-fade-in">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400 mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Autenticação em Duas Etapas
                </h3>
                <p className="text-[11px] text-gray-400">
                  Código enviado para: <strong className="text-gold-300">{twoFactorDestination}</strong>
                </p>
              </div>

              <div>
                <label className="block text-center font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Código de Verificação:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                  value={codigo2FA}
                  onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl bg-white/5 border border-white/20 text-gold-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={loading || codigo2FA.length !== 6}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>CONFIRMAR CÓDIGO</span>
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep2FA(false)}
                    className="text-[11px] text-gray-400 hover:text-white"
                  >
                    Voltar
                  </button>

                  <button
                    type="button"
                    onClick={handleResend2FACode}
                    className="text-[11px] text-gold-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reenviar código</span>
                  </button>
                </div>
              </div>
            </form>
          )}
            </>
          )}
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <button
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o site público</span>
          </button>
        </div>
      </div>
    </div>
  );
};

