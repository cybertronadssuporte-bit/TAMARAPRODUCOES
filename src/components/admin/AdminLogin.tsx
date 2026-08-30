import React, { useState } from 'react';
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
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { StorageImage } from '../common/StorageImage';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [empresa] = useState(() => storageService.getEmpresaConfig());

  // Etapa 1: Credenciais
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Etapa 2: 2FA
  const [step2FA, setStep2FA] = useState(false);
  const [codigo2FA, setCodigo2FA] = useState('');
  const [twoFactorDestination, setTwoFactorDestination] = useState('');
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await storageService.loginStep1(email, senha);

      if (!res.success) {
        setErrorMsg(res.message || 'Credenciais inválidas.');
        setLoading(false);
        return;
      }

      if (res.requires2FA) {
        // Obter destino
        const state = storageService.get2FAState();
        const dest = state ? state.destination : 'seu canal cadastrado';
        setTwoFactorDestination(dest);
        setStep2FA(true);
        setLoading(false);
        // Exibir alerta amigável de simulação do código no ambiente de teste
        if (state && state.code) {
          setSimulatedAlert(`[Simulação de Envio 2FA]: Seu código de 6 dígitos é ${state.code} (válido por 5 minutos).`);
        }
      } else {
        // Login direto sem 2FA
        setLoading(false);
        onLoginSuccess();
      }
    } catch {
      setErrorMsg('Erro ao conectar. Tente novamente.');
      setLoading(false);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (codigo2FA.length !== 6) {
      setErrorMsg('Por favor, informe os 6 dígitos do código.');
      return;
    }

    setLoading(true);

    const res = storageService.verify2FACode(codigo2FA);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResend2FACode = () => {
    const { code, destination } = storageService.generate2FACode();
    setTwoFactorDestination(destination);
    setCodigo2FA('');
    setErrorMsg(null);
    setSimulatedAlert(`[Novo Código 2FA Enviado]: Seu código é ${code} (válido por 5 minutos).`);
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
            Painel Administrativo Restrito
          </p>
        </div>

        {/* Card de Login */}
        <div className="mt-8 bg-noir-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-gold-400/20 shadow-2xl space-y-6">
          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alerta de Simulação 2FA */}
          {simulatedAlert && (
            <div className="p-3.5 rounded-xl bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <KeyRound className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>{simulatedAlert}</span>
            </div>
          )}

          {/* ETAPA 1 — CREDENCIAIS */}
          {!step2FA ? (
            <form onSubmit={handleStep1Submit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  >
                    {showSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:to-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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

              {/* Dica de acesso padrão */}
              <div className="pt-3 border-t border-white/10 text-center">
                <p className="text-[11px] text-gray-400">
                  Credenciais padrão: <strong className="text-gray-300">admin@decorart.com.br</strong> / senha: <strong className="text-gray-300">admin123</strong>
                </p>
              </div>
            </form>
          ) : (
            /* ETAPA 2 — CONFIRMAÇÃO 2FA REAL */
            <form onSubmit={handleStep2Submit} className="space-y-5 text-xs animate-fade-in">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400 mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Autenticação em Duas Etapas
                </h3>
                <p className="text-[11px] text-gray-400">
                  Código de 6 dígitos enviado para: <strong className="text-gold-300">{twoFactorDestination}</strong>
                </p>
              </div>

              <div>
                <label className="block text-center font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Código de Verificação:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={codigo2FA}
                  onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl bg-white/5 border border-white/20 text-gold-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                />
                <span className="text-[10px] text-gray-500 text-center block mt-1">
                  Validade do código: 5 minutos (limite de 3 tentativas)
                </span>
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
                    Voltar ao início
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
