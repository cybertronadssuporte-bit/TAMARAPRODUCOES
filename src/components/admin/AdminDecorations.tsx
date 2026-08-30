import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Decoracao, CategoriaEvento } from '../../types';
import { storageService } from '../../services/storageService';
import { CATEGORIAS_EVENTOS } from '../../config/siteConfig';

interface AdminDecorationsProps {
  decoracoes: Decoracao[];
  onRefresh: () => void;
}

export const AdminDecorations: React.FC<AdminDecorationsProps> = ({ decoracoes, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaEvento>('Casamentos');
  const [preco, setPreco] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [imagensList, setImagensList] = useState<string[]>([]);
  const [itemInclusoInput, setItemInclusoInput] = useState('');
  const [itensInclusosList, setItensInclusosList] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [ativo, setAtivo] = useState(true);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingId(null);
    setNome('');
    setDescricao('');
    setCategoria('Casamentos');
    setPreco('');
    setImagemUrl('');
    setImagensList([
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    ]);
    setItemInclusoInput('');
    setItensInclusosList([
      'Painel cenográfico temático estruturado',
      'Arco orgânico de balões desconstruídos',
      'Mobiliário e suportes para bolo e doces',
      'Montagem e desmontagem completas inclusas',
    ]);
    setObservacoes('');
    setAtivo(true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dec: Decoracao) => {
    setEditingId(dec.id);
    setNome(dec.nome);
    setDescricao(dec.descricao);
    setCategoria(dec.categoria);
    setPreco(dec.preco.toString());
    setImagemUrl('');
    setImagensList([...dec.imagens]);
    setItemInclusoInput('');
    setItensInclusosList([...dec.itensInclusos]);
    setObservacoes(dec.observacoes || '');
    setAtivo(dec.ativo);
    setFormError(null);
    setModalOpen(true);
  };

  const handleAddImage = () => {
    if (imagemUrl.trim()) {
      setImagensList([...imagensList, imagemUrl.trim()]);
      setImagemUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagensList(imagensList.filter((_, i) => i !== index));
  };

  const handleAddItemIncluso = () => {
    if (itemInclusoInput.trim()) {
      setItensInclusosList([...itensInclusosList, itemInclusoInput.trim()]);
      setItemInclusoInput('');
    }
  };

  const handleRemoveItemIncluso = (index: number) => {
    setItensInclusosList(itensInclusosList.filter((_, i) => i !== index));
  };

  const handleToggleAtivo = (id: string) => {
    storageService.toggleDecoracaoAtiva(id);
    onRefresh();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setFormError('Por favor, informe o nome da decoração.');
      return;
    }
    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) {
      setFormError('Por favor, informe um preço válido.');
      return;
    }
    if (imagensList.length === 0) {
      setFormError('Adicione pelo menos uma foto para a decoração.');
      return;
    }
    if (itensInclusosList.length === 0) {
      setFormError('Adicione pelo menos um item incluso.');
      return;
    }

    storageService.saveDecoracao({
      id: editingId || undefined,
      nome: nome.trim(),
      descricao: descricao.trim(),
      categoria,
      preco: precoNum,
      imagens: imagensList,
      itensInclusos: itensInclusosList,
      observacoes: observacoes.trim(),
      ativo,
    });

    setModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    storageService.deleteDecoracao(id);
    setDeleteConfirmId(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
            Gerenciamento de Decorações
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Cadastre novos cenários, altere preços, fotos e ative ou pause decorações no catálogo.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Decoração</span>
        </button>
      </div>

      {/* Grid of Decorations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decoracoes.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl bg-white border transition-all duration-300 shadow-sm overflow-hidden flex flex-col justify-between ${
              item.ativo ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60 bg-gray-50/50'
            }`}
          >
            <div>
              {/* Photo & Badge */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={item.imagens[0]}
                  alt={item.nome}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-noir-900 uppercase">
                    {item.categoria}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleAtivo(item.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors ${
                      item.ativo
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-gray-700 text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.ativo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.ativo ? 'Ativa' : 'Pausada'}</span>
                  </button>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-gold-300 px-3 py-1 rounded-xl text-xs font-bold">
                  {item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-2">
                <h3 className="font-serif font-bold text-base text-noir-950 line-clamp-1">
                  {item.nome}
                </h3>
                <p className="text-xs text-noir-600 line-clamp-2 leading-relaxed">
                  {item.descricao}
                </p>
                <div className="pt-2 text-[11px] text-gray-500">
                  <span className="font-semibold text-noir-800">{item.itensInclusos.length}</span> itens inclusos no pacote
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEdit(item)}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-200 hover:border-gold-400 bg-white text-xs font-semibold text-noir-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Editar</span>
              </button>

              <button
                onClick={() => setDeleteConfirmId(item.id)}
                className="py-2 px-3 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center justify-center transition-colors"
                title="Excluir Decoração"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-noir-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-lg font-serif font-bold text-noir-950">Excluir Decoração?</h3>
            <p className="text-xs text-gray-600">
              Esta ação removerá a decoração do catálogo permanentemente. Agendamentos existentes não serão afetados.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-noir-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gold-200 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-xl font-serif font-bold text-noir-950">
                {editingId ? 'Editar Decoração' : 'Cadastrar Nova Decoração'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-noir-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Nome */}
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Nome da Decoração *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Cenário Luxo Dourado & Flores Nobres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs"
                />
              </div>

              {/* Categoria e Preço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-noir-800 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaEvento)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs"
                  >
                    {CATEGORIAS_EVENTOS.map((c) => (
                      <option key={c.nome} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                    <option value="Outras comemorações">Outras comemorações</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-noir-800 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="Ex: 899.90"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Descrição Completa *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Detalhes sobre a proposta estética, materiais e atmosfera do cenário..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs resize-none"
                />
              </div>

              {/* Fotos (URLs) */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <label className="block font-bold uppercase text-noir-800">
                  Fotos da Decoração (Galeria) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imagemUrl}
                    onChange={(e) => setImagemUrl(e.target.value)}
                    placeholder="Cole a URL da imagem (https://...)"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-gold-400 hover:bg-gold-500 font-bold rounded-xl text-noir-950"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Previews */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imagensList.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-300 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itens Inclusos */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <label className="block font-bold uppercase text-noir-800">
                  O que está incluso no pacote *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={itemInclusoInput}
                    onChange={(e) => setItemInclusoInput(e.target.value)}
                    placeholder="Ex: Trio de cilindros forrados"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddItemIncluso}
                    className="px-4 py-2 bg-gold-400 hover:bg-gold-500 font-bold rounded-xl text-noir-950"
                  >
                    Inserir Item
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {itensInclusosList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                      <span className="text-[11px] text-noir-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemIncluso(idx)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Observações Técnicas / Requisitos de Instalação
                </label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Necessário tomada 110v/220v próxima. Tempo de montagem: 2 horas."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs"
                />
              </div>

              {/* Switch Ativo */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="decAtivo"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <label htmlFor="decAtivo" className="text-xs font-semibold text-noir-900 cursor-pointer">
                  Publicar esta decoração no catálogo (Visível aos clientes)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold uppercase tracking-wider shadow-sm"
                >
                  Salvar Decoração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
