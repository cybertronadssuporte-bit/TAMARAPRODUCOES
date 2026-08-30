import React, { useState, useRef } from 'react';
import {
  Building,
  Image as ImageIcon,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  X,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { imageStorageService } from '../../services/imageStorageService';
import { EmpresaConfig } from '../../types';
import { StorageImage } from '../common/StorageImage';

interface AdminCompanyIdentityProps {
  onRefresh: () => void;
}

export const AdminCompanyIdentity: React.FC<AdminCompanyIdentityProps> = ({ onRefresh }) => {
  const [empresa, setEmpresa] = useState<EmpresaConfig>(() => storageService.getEmpresaConfig());
  const [nome, setNome] = useState(empresa.nome);
  const [whatsapp, setWhatsapp] = useState(empresa.whatsappFormatado || '+55 85 99867-2404');
  const [email, setEmail] = useState(empresa.email);
  const [cidade, setCidade] = useState(empresa.cidadePadrao || 'Fortaleza - CE');

  // Controle de upload da logo
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Quando o usuário seleciona uma foto no computador, tablet ou celular
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validação de tipo
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setErrorMsg('Por favor, selecione uma imagem válida nos formatos PNG, JPG, JPEG ou WEBP.');
        return;
      }
      setTempFile(file);
      // Prévia local
      const previewUrl = URL.createObjectURL(file);
      setPreviewLogo(previewUrl);
      setErrorMsg(null);
    }
  };

  // Cancelar prévia
  const handleCancelPreview = () => {
    setPreviewLogo(null);
    setTempFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Salvar logo via imageStorageService
  const handleSaveLogo = async () => {
    if (!tempFile) return;
    try {
      setSavingLogo(true);
      setErrorMsg(null);

      // Salva no storage local do IndexedDB sem base64 gigante no localStorage
      const storageKey = await imageStorageService.saveFile(tempFile);
      const updated = storageService.updateLogo(storageKey);
      setEmpresa(updated);
      setPreviewLogo(null);
      setTempFile(null);
      setSuccessMsg('Logo da empresa atualizada com sucesso em todo o site!');
      setTimeout(() => setSuccessMsg(null), 3500);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar a logo.');
    } finally {
      setSavingLogo(false);
    }
  };

  // Excluir logo
  const handleDeleteLogo = async () => {
    if (window.confirm('Tem certeza que deseja excluir a logo da empresa? O site voltará a exibir o emblema padrão.')) {
      if (empresa.logoUrl) {
        await imageStorageService.deleteFile(empresa.logoUrl);
      }
      const updated = storageService.deleteLogo();
      setEmpresa(updated);
      setPreviewLogo(null);
      setTempFile(null);
      setSuccessMsg('Logo removida com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
      onRefresh();
    }
  };

  // Salvar dados da empresa (nome, etc)
  const handleSaveNomeEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg('O nome da empresa não pode ficar em branco.');
      return;
    }
    setSavingData(true);
    setErrorMsg(null);

    const updated = storageService.saveEmpresaConfig({
      nome: nome.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      whatsappFormatado: whatsapp.trim(),
      email: email.trim(),
      cidadePadrao: cidade.trim(),
    });

    setEmpresa(updated);
    setSavingData(false);
    setSuccessMsg('Nome e dados da empresa atualizados com sucesso em todo o site!');
    setTimeout(() => setSuccessMsg(null), 3500);
    onRefresh();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Building className="w-3.5 h-3.5 text-gold-700" />
          <span>Configurações da Marca</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
          Identidade da Empresa
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Altere o nome oficial, a logo e os canais de contato exibidos publicamente no cabeçalho, rodapé e pedidos.
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

      {/* Card 1: Logo da Empresa */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-noir-950 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold-600" />
              <span>Logo da Empresa</span>
            </h3>
            <p className="text-xs text-gray-500">
              Formatos aceitos: PNG, JPG, JPEG, WEBP.
            </p>
          </div>

          {/* Input invisível que abre o seletor nativo do computador, celular ou tablet */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />

          <button
            type="button"
            onClick={triggerFileInput}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-all min-h-[44px] w-full xs:w-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ ALTERAR LOGO</span>
          </button>
        </div>

        {/* Visualização da Logo Atual ou Prévia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Logo Atual */}
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Logo Atual em Uso
            </span>

            <div className="h-32 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 p-4">
              {empresa.logoUrl ? (
                <StorageImage
                  src={empresa.logoUrl}
                  alt="Logo Atual"
                  className="max-h-28 max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs">Nenhuma logo personalizada cadastrada.</p>
                  <span className="text-[10px] text-gray-400 block">
                    (Exibindo emblema padrão do site)
                  </span>
                </div>
              )}
            </div>

            {empresa.logoUrl && (
              <button
                type="button"
                onClick={handleDeleteLogo}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold pt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Logo Atual</span>
              </button>
            )}
          </div>

          {/* Prévia Antes de Salvar */}
          <div className="p-6 rounded-2xl bg-gold-50/50 border border-gold-200 text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-900 block">
              Prévia da Nova Imagem
            </span>

            <div className="h-32 flex items-center justify-center bg-white rounded-xl border border-dashed border-gold-300 p-4">
              {previewLogo ? (
                <img
                  src={previewLogo}
                  alt="Prévia Nova Logo"
                  className="max-h-28 max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400 space-y-1">
                  <UploadCloud className="w-8 h-8 mx-auto text-gold-400/60" />
                  <p className="text-xs">Nenhum novo arquivo selecionado.</p>
                  <span className="text-[10px] text-gray-400 block">
                    Clique em "+ ALTERAR LOGO" para escolher do seu dispositivo.
                  </span>
                </div>
              )}
            </div>

            {previewLogo && (
              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleSaveLogo}
                  disabled={savingLogo}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingLogo ? 'Salvando...' : 'Salvar Logo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-white"
                >
                  <X className="w-3.5 h-3.5 inline mr-1" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Nome da Empresa Editável */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="font-serif font-bold text-lg text-noir-950 flex items-center gap-2">
            <Building className="w-5 h-5 text-gold-600" />
            <span>Nome e Dados da Empresa</span>
          </h3>
          <p className="text-xs text-gray-500">
            Ao salvar, o nome e contatos atualizarão automaticamente no site, cabeçalho e WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSaveNomeEmpresa} className="space-y-4 text-xs">
          {/* Nome da Empresa */}
          <div>
            <label className="block font-bold uppercase text-noir-800 mb-1.5">
              Nome da Empresa *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: TAMARA PRODUÇÕES"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-semibold text-noir-950 outline-none bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-noir-800 mb-1.5">
                WhatsApp Oficial de Atendimento *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+55 85 99867-2404"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/50 focus:bg-white transition-all"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Número que receberá as mensagens dos clientes e do botão flutuante.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase text-noir-800 mb-1.5">
                E-mail de Contato
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@tamaraproducoes.com.br"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase text-noir-800 mb-1.5">
              Cidade / Região Principal
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Fortaleza - CE"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={savingData}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:to-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingData ? 'Salvando...' : 'SALVAR ALTERAÇÕES'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
