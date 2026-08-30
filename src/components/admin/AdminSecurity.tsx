import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Info,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { AdminUser } from '../../types';

interface AdminSecurityProps {
  onRefresh: () => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({ onRefresh }) => {
  const [profile, setProfile] = useState<AdminUser>(() => storageService.getAdminProfile());
  const [is2FA, setIs2FA] = useState(profile.twoFactorEnabled);
  const [channel, setChannel] = useState<'email' | 'sms'>(profile.twoFactorChannel || 'email');
  const [testCodeSent, setTestCodeSent] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggle2FA = (enabled: boolean) => {
    setIs2FA(enabled);
    storageService.set2FAEnabled(enabled, channel);
    setProfile(storageService.getAdminProfile());
    setSuccessMsg(
      enabled
        ? `Autenticação em Duas Etapas (2FA) ATIVADA com sucesso via ${channel === 'sms' ? 'SMS' : 'E-mail'}!`
        : 'Autenticação em Duas Etapas (2FA) desativada.'
    );
    setTimeout(() => setSuccessMsg(null), 4000);
    onRefresh();
  };

  const handleChangeChannel = (newChannel: 'email' | 'sms') => {
    setChannel(newChannel);
    storageService.set2FAEnabled(is2FA, newChannel);
    setProfile(storageService.getAdminProfile());
    setSuccessMsg(`Canal de envio do 2FA alterado para ${newChannel === 'sms' ? 'SMS' : 'E-mail'}.`);
    setTimeout(() => setSuccessMsg(null), 3000);
    onRefresh();
  };

  // Testar envio de código
  const handleTest2FACode = () => {
    const { code, destination } = storageService.generate2FACode();
    setTestCodeSent(`Código de teste gerado: [ ${code} ] enviado para ${destination} (expira em 5 min)`);
    setTimeout(() => setTestCodeSent(null), 10000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
          <span>Proteção da Conta</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
          Segurança do Administrador
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure a Autenticação em Duas Etapas (2FA) para proteger o acesso ao painel de gerenciamento.
        </p>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {testCodeSent && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <span>{testCodeSent}</span>
        </div>
      )}

      {/* Card 2FA */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-noir-950 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-gold-600" />
              <span>Autenticação em Duas Etapas (2FA)</span>
            </h3>
            <p className="text-xs text-gray-500">
              Exige um código temporário de 6 dígitos ao fazer login, além da senha.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle2FA(!is2FA)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ${
              is2FA
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gold-400 hover:bg-gold-500 text-noir-950'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{is2FA ? 'ATIVADO' : 'ATIVAR'}</span>
          </button>
        </div>

        {/* Escolha do Canal de Envio */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-noir-800">
            Canal de Envio do Código de Confirmação:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opção E-mail */}
            <div
              onClick={() => handleChangeChannel('email')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                channel === 'email'
                  ? 'border-gold-500 bg-gold-50/60 ring-2 ring-gold-300'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  channel === 'email' ? 'bg-gold-500 text-noir-950 font-bold' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold text-sm text-noir-950 block">E-mail</span>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Envia o código temporário para: <strong className="text-noir-800">{profile.email}</strong>
                </p>
              </div>
            </div>

            {/* Opção SMS */}
            <div
              onClick={() => handleChangeChannel('sms')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                channel === 'sms'
                  ? 'border-gold-500 bg-gold-50/60 ring-2 ring-gold-300'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  channel === 'sms' ? 'bg-gold-500 text-noir-950 font-bold' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold text-sm text-noir-950 block">SMS no Celular</span>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Envia o código via SMS para: <strong className="text-noir-800">{profile.telefone || '(85) 99867-2404'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Políticas de Segurança Implementadas */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs text-gray-600">
          <span className="font-bold text-noir-900 block text-[11px] uppercase tracking-wider">
            Mecanismos de Segurança Ativos no 2FA:
          </span>
          <ul className="space-y-1.5 list-disc list-inside text-[11px]">
            <li>Códigos numéricos únicos de 6 dígitos gerados criptograficamente.</li>
            <li>Expiração automática em 5 minutos após a emissão.</li>
            <li>Bloqueio de segurança automático caso excedidas 3 tentativas incorretas.</li>
            <li>Invalidação imediata do código após confirmação com sucesso.</li>
          </ul>
        </div>

        {/* Botão para testar geração e envio */}
        {is2FA && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleTest2FACode}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:border-gold-400 bg-white text-noir-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gold-600" />
              <span>Simular Envio de Código 2FA Agora</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
