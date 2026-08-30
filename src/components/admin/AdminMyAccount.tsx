import React, { useState } from 'react';
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
} from 'lucide-react';
import { storageService } from '../../services/storageService';
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
  const [savingPassword, setSavingPassword] = useState(false);

  // Feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Salvar Dados Cadastrais
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg('O nome do administrador é obrigatório.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('O e-mail é obrigatório.');
      return;
    }

    setSavingProfile(true);
    setErrorMsg(null);

    const updated = storageService.saveAdminProfile({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
    });

    setProfile(updated);
    setSavingProfile(false);
    setSuccessMsg('Dados cadastrais da sua conta atualizados com sucesso!');
    setTimeout(() => setSuccessMsg(null), 3500);
    onRefresh();
  };

  // Salvar Nova Senha com Hash Criptográfico
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!senhaAtual) {
      setErrorMsg('Por favor, informe a senha atual.');
      return;
    }

    if (novaSenha.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErrorMsg('A confirmação de senha não coincide com a nova senha.');
      return;
    }

    setSavingPassword(true);

    try {
      const result = await storageService.updateAdminPassword(senhaAtual, novaSenha);
      if (result.success) {
        setSuccessMsg(result.message);
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setErrorMsg(result.message);
      }
    } catch {
      setErrorMsg('Erro inesperado ao alterar senha. Tente novamente.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5 text-gold-700" />
          <span>Configurações do Usuário</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
          Minha Conta
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Gerencie suas informações de acesso e altere sua senha de segurança.
        </p>
      </div>

      {/* Alertas */}
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

      {/* Card 1: Dados Pessoais */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-serif font-bold text-lg text-noir-950 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-600" />
            <span>Dados do Administrador</span>
          </h3>
          <p className="text-xs text-gray-500">
            Nome e canais de contato usados para notificações e suporte.
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
                Telefone Celular (para 2FA/SMS) *
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

      {/* Card 2: Alteração de Senha com Hash */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-serif font-bold text-lg text-noir-950 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gold-600" />
            <span>Alterar Senha</span>
          </h3>
          <p className="text-xs text-gray-500">
            Sua senha é protegida por criptografia SHA-256 e nunca armazenada em texto simples.
          </p>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
          {/* Senha Atual */}
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
              >
                {showSenhaAtual ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Nova Senha & Confirmação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-noir-800 mb-1">
                Nova Senha (mínimo 6 dígitos) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNovaSenha ? 'text' : 'password'}
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha segura"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-noir-800 p-1"
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
                  type="password"
                  required
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full sm:w-auto min-h-[44px] justify-center px-6 py-2.5 rounded-xl bg-noir-900 hover:bg-noir-950 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-gold-400" />
              <span>{savingPassword ? 'Alterando...' : 'ALTERAR SENHA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
