import React, { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { authService, cleanMobileEmail, cleanMobileInput } from '../../services/authService';
import { AdminUser } from '../../types';

interface AdminMyAccountProps {
  onRefresh: () => void;
}

export const AdminMyAccount: React.FC<AdminMyAccountProps> = ({ onRefresh }) => {
  const [profile, setProfile] = useState<AdminUser>(() => storageService.getAdminProfile());

  // Dados Cadastrais
  const [nome, setNome] = useState(profile.nome);
  const [email, setEmail] = useState(profile.email);
  const [telefone, setTelefone] = useState(profile.telefone || '(85) 99867-2404');
  const [savingProfile, setSavingProfile] = useState(false);

  // Alteração de Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [senhaAlteradaSucesso, setSenhaAlteradaSucesso] = useState(false);

  // Feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Requisitos dinâmicos da nova senha
  const requisitos = useMemo(() => {
    return authService.validarRequisitosSenha(novaSenha);
  }, [novaSenha]);

  // Salvar Dados Cadastrais
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNomeVal = cleanMobileInput(nome);
    const cleanEmailVal = cleanMobileEmail(email);
    const cleanTelVal = cleanMobileInput(telefone);

    if (!cleanNomeVal) {
      setErrorMsg('O nome do administrador é obrigatório.');
      return;
    }
    if (!cleanEmailVal) {
      setErrorMsg('O e-mail é obrigatório.');
      return;
    }

    setSavingProfile(true);
    setErrorMsg(null);

    try {
      const updated = storageService.saveAdminProfile({
        nome: cleanNomeVal,
        email: cleanEmailVal,
        telefone: cleanTelVal,
      });

      setProfile(updated);
      setNome(updated.nome);
      setEmail(updated.email);
      setTelefone(updated.telefone);
      setSuccessMsg('Dados cadastrais atualizados com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3500);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar dados.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Salvar Nova Senha com Validação e Hash Criptográfico
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);

    const cleanSenhaAtual = cleanMobileInput(senhaAtual);
    const cleanNova = cleanMobileInput(novaSenha);
    const cleanConf = cleanMobileInput(confirmarNovaSenha);

    if (!cleanSenhaAtual) {
      setPasswordErrorMsg('Por favor, informe a senha atual.');
      return;
    }

    if (!requisitos.todosValidos) {
      setPasswordErrorMsg('A nova senha precisa atender a todos os requisitos de segurança abaixo.');
      return;
    }

    if (cleanNova !== cleanConf) {
      setPasswordErrorMsg('A confirmação de senha não coincide com a nova senha digitada.');
      return;
    }

    setSavingPassword(true);

    try {
      const result = await authService.updateAdminPassword(senhaAtual, novaSenha);

      if (result.success) {
        // Sucesso real confirmado pelo backend/serviço
        setSenhaAlteradaSucesso(true);
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
      } else {
        setPasswordErrorMsg(
          result.message || '❌ Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.'
        );
      }
    } catch (err: any) {
      setPasswordErrorMsg(
        err.message || '❌ Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleFazerLoginNovamente = () => {
    authService.logout();
    window.location.hash = 'admin';
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5 text-gold-700" />
          <span>MINHA CONTA → SEGURANÇA</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
          Gerenciamento da Conta
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Atualize suas informações de contato e mantenha sua senha de administrador segura e atualizada.
        </p>
      </div>

      {/* Alertas Globais */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card 1: Dados Cadastrais */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-serif font-bold text-lg text-noir-950 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-600" />
            <span>Dados do Administrador</span>
          </h3>
          <p className="text-xs text-gray-500">
            Informações cadastrais e canais utilizados para suporte e 2FA.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase text-noir-800 mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-noir-800 mb-1">
                E-mail de Acesso *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase text-noir-800 mb-1">
                Telefone Celular (para notificações/2FA) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full sm:w-auto min-h-[44px] justify-center px-6 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Alteração de Senha Segura (Itens 5, 6, 7 e 8) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-serif font-bold text-lg text-noir-950 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gold-600" />
            <span>Alterar Senha do Administrador</span>
          </h3>
          <p className="text-xs text-gray-500">
            A alteração é confirmada e validada diretamente no servidor. Senhas não são simuladas.
          </p>
        </div>

        {/* Modal/Aviso de Sucesso com Solicitação de Novo Login (Item 8) */}
        {senhaAlteradaSucesso ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-emerald-950">
                ✅ Senha alterada com sucesso!
              </h4>
              <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto leading-relaxed">
                Senha alterada com sucesso. Por segurança, sua sessão anterior foi invalidada. Faça login novamente com sua nova senha para acessar o painel.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFazerLoginNovamente}
                className="px-6 py-3 rounded-xl bg-noir-950 hover:bg-noir-900 text-white font-bold text-xs uppercase tracking-wider shadow-md inline-flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4 text-gold-400" />
                <span>FAZER LOGIN NOVAMENTE</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSavePassword} className="space-y-5 text-xs">
            {/* Erro de Senha */}
            {passwordErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            {/* 1. Senha Atual */}
            <div>
              <label className="block font-bold uppercase text-noir-800 mb-1">
                Senha Atual *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSenhaAtual ? 'text' : 'password'}
                  required
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Informe sua senha atual"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-noir-800 p-1"
                  aria-label={showSenhaAtual ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showSenhaAtual ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Nova Senha & Confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite a nova senha"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-noir-800 p-1"
                    aria-label={showNovaSenha ? 'Ocultar nova senha' : 'Exibir nova senha'}
                  >
                    {showNovaSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmarSenha ? 'text' : 'password'}
                    required
                    value={confirmarNovaSenha}
                    onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-noir-800 p-1"
                    aria-label={showConfirmarSenha ? 'Ocultar confirmação' : 'Exibir confirmação'}
                  >
                    {showConfirmarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist Visual de Requisitos de Segurança (Item 6) */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="block font-bold uppercase text-[11px] text-gray-700 tracking-wider">
                Requisitos da Nova Senha:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    requisitos.minimo8 ? 'text-emerald-700 font-semibold' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      requisitos.minimo8 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Mínimo de 8 caracteres</span>
                </div>

                <div
                  className={`flex items-center gap-2 transition-colors ${
                    requisitos.maiuscula ? 'text-emerald-700 font-semibold' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      requisitos.maiuscula ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Uma letra maiúscula</span>
                </div>

                <div
                  className={`flex items-center gap-2 transition-colors ${
                    requisitos.minuscula ? 'text-emerald-700 font-semibold' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      requisitos.minuscula ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Uma letra minúscula</span>
                </div>

                <div
                  className={`flex items-center gap-2 transition-colors ${
                    requisitos.numero ? 'text-emerald-700 font-semibold' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      requisitos.numero ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Um número</span>
                </div>

                <div
                  className={`flex items-center gap-2 transition-colors sm:col-span-2 ${
                    requisitos.especial ? 'text-emerald-700 font-semibold' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      requisitos.especial ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Um caractere especial (!@#$%^&*...)</span>
                </div>
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto min-h-[46px] justify-center px-8 py-3 rounded-xl bg-noir-900 hover:bg-noir-950 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Alterando senha...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-gold-400" />
                    <span>ALTERAR SENHA</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
