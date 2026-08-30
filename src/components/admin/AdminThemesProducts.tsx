import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  X,
  ChevronRight,
  ArrowLeft,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Tema, Produto } from '../../types';
import { storageService } from '../../services/storageService';
import { imageStorageService } from '../../services/imageStorageService';
import { StorageImage } from '../common/StorageImage';

interface AdminThemesProductsProps {
  onRefresh: () => void;
}

export const AdminThemesProducts: React.FC<AdminThemesProductsProps> = ({ onRefresh }) => {
  const [temas, setTemas] = useState<Tema[]>(() => storageService.getTemas());
  const [produtos, setProdutos] = useState<Produto[]>(() => storageService.getProdutos());
  const [selectedTema, setSelectedTema] = useState<Tema | null>(null);

  // Estados de Tema Modal (Criar / Editar)
  const [temaModalOpen, setTemaModalOpen] = useState(false);
  const [editingTemaId, setEditingTemaId] = useState<string | null>(null);
  const [temaNome, setTemaNome] = useState('');
  const [temaDescricao, setTemaDescricao] = useState('');
  const [temaImagemUrl, setTemaImagemUrl] = useState('');
  const [temaPreviewImg, setTemaPreviewImg] = useState<string | null>(null);
  const [temaTempFile, setTemaTempFile] = useState<File | null>(null);
  const [temaAtivo, setTemaAtivo] = useState(true);
  const [temaOrdem, setTemaOrdem] = useState(1);

  // Estados de Produto Modal (Criar / Editar)
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [editingProdutoId, setEditingProdutoId] = useState<string | null>(null);
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoPreco, setProdutoPreco] = useState('');
  const [produtoDescricao, setProdutoDescricao] = useState('');
  const [produtoItens, setProdutoItens] = useState<string[]>([]);
  const [novoItemInput, setNovoItemInput] = useState('');
  const [produtoImagens, setProdutoImagens] = useState<string[]>([]);
  const [produtoAtivo, setProdutoAtivo] = useState(true);

  // Erros e avisos
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Refs de arquivo
  const temaFileInputRef = useRef<HTMLInputElement>(null);
  const produtoFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    const t = storageService.getTemas();
    setTemas(t);
    setProdutos(storageService.getProdutos());
    if (selectedTema) {
      const atual = t.find((item) => item.id === selectedTema.id);
      setSelectedTema(atual || null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -----------------------------------------------------------
  // GESTÃO DE TEMAS
  // -----------------------------------------------------------
  const handleOpenNewTema = () => {
    setEditingTemaId(null);
    setTemaNome('');
    setTemaDescricao('');
    setTemaImagemUrl('');
    setTemaPreviewImg(null);
    setTemaTempFile(null);
    setTemaAtivo(true);
    setTemaOrdem(temas.length + 1);
    setErrorMsg(null);
    setTemaModalOpen(true);
  };

  const handleOpenEditTema = (t: Tema, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemaId(t.id);
    setTemaNome(t.nome);
    setTemaDescricao(t.descricao);
    setTemaImagemUrl(t.imagemUrl);
    setTemaPreviewImg(null);
    setTemaTempFile(null);
    setTemaAtivo(t.ativo);
    setTemaOrdem(t.ordem);
    setErrorMsg(null);
    setTemaModalOpen(true);
  };

  const handleTemaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setTemaTempFile(file);
      setTemaPreviewImg(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleSaveTema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temaNome.trim()) {
      setErrorMsg('Por favor, informe o nome do tema.');
      return;
    }

    try {
      let finalImgUrl = temaImagemUrl;
      if (temaTempFile) {
        finalImgUrl = await imageStorageService.saveFile(temaTempFile);
      }

      if (!finalImgUrl) {
        finalImgUrl =
          'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80';
      }

      storageService.saveTema({
        id: editingTemaId || undefined,
        nome: temaNome.trim(),
        descricao: temaDescricao.trim(),
        imagemUrl: finalImgUrl,
        ativo: temaAtivo,
        ordem: Number(temaOrdem) || 1,
      });

      setTemaModalOpen(false);
      setSuccessMsg(`Tema "${temaNome}" salvo com sucesso!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar tema.');
    }
  };

  const handleDeleteTema = (id: string, nome: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Deseja realmente excluir o tema "${nome}"?`)) {
      storageService.deleteTema(id);
      if (selectedTema?.id === id) {
        setSelectedTema(null);
      }
      loadData();
      onRefresh();
    }
  };

  const handleToggleTemaAtivo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.toggleTemaAtivo(id);
    loadData();
    onRefresh();
  };

  // -----------------------------------------------------------
  // GESTÃO DE PRODUTOS DENTRO DO TEMA
  // -----------------------------------------------------------
  const handleOpenNewProduto = () => {
    if (!selectedTema) return;
    setEditingProdutoId(null);
    setProdutoNome('');
    setProdutoPreco('');
    setProdutoDescricao('');
    setProdutoItens([
      'Painel temático estruturado de alta definição',
      'Arco orgânico de balões premium',
      'Trio de cilindros forrados personalizados',
      'Montagem e desmontagem inclusas',
    ]);
    setNovoItemInput('');
    setProdutoImagens([
      'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=1000&q=80',
    ]);
    setProdutoAtivo(true);
    setErrorMsg(null);
    setProdutoModalOpen(true);
  };

  const handleOpenEditProduto = (p: Produto) => {
    setEditingProdutoId(p.id);
    setProdutoNome(p.nome);
    setProdutoPreco(p.preco.toString());
    setProdutoDescricao(p.descricao);
    setProdutoItens([...p.itensInclusos]);
    setNovoItemInput('');
    setProdutoImagens([...p.imagens]);
    setProdutoAtivo(p.ativo);
    setErrorMsg(null);
    setProdutoModalOpen(true);
  };

  // Seleção de múltiplas fotos nativas do dispositivo para o produto
  const handleProdutoFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const novasUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const storageKey = await imageStorageService.saveFile(file);
          novasUrls.push(storageKey);
        }
        setProdutoImagens([...produtoImagens, ...novasUrls]);
      } catch {
        setErrorMsg('Erro ao carregar fotos selecionadas.');
      }
    }
  };

  const handleRemoveProdutoImagem = (index: number) => {
    setProdutoImagens(produtoImagens.filter((_, i) => i !== index));
  };

  const handleAddProdutoItem = () => {
    if (novoItemInput.trim()) {
      setProdutoItens([...produtoItens, novoItemInput.trim()]);
      setNovoItemInput('');
    }
  };

  const handleRemoveProdutoItem = (index: number) => {
    setProdutoItens(produtoItens.filter((_, i) => i !== index));
  };

  const handleSaveProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTema) return;
    if (!produtoNome.trim()) {
      setErrorMsg('Por favor, informe o nome do produto.');
      return;
    }
    const precoNum = parseFloat(produtoPreco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) {
      setErrorMsg('Por favor, informe um preço válido.');
      return;
    }
    if (produtoImagens.length === 0) {
      setErrorMsg('Adicione pelo menos uma foto para o produto.');
      return;
    }

    storageService.saveProduto({
      id: editingProdutoId || undefined,
      temaId: selectedTema.id,
      temaNome: selectedTema.nome,
      nome: produtoNome.trim(),
      preco: precoNum,
      descricao: produtoDescricao.trim(),
      itensInclusos: produtoItens,
      imagens: produtoImagens,
      ativo: produtoAtivo,
    });

    setProdutoModalOpen(false);
    setSuccessMsg(`Produto "${produtoNome}" salvo com sucesso!`);
    setTimeout(() => setSuccessMsg(null), 3000);
    loadData();
    onRefresh();
  };

  const handleDeleteProduto = (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente excluir o produto "${nome}"?`)) {
      storageService.deleteProduto(id);
      loadData();
      onRefresh();
    }
  };

  const produtosDoTemaSelecionado = selectedTema
    ? produtos.filter((p) => p.temaId === selectedTema.id)
    : [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Alertas */}
      {successMsg && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Visão de Produtos de um Tema Selecionado */}
      {selectedTema ? (
        <div className="space-y-6">
          {/* Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                onClick={() => setSelectedTema(null)}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-gold-400 bg-white text-noir-800 transition-colors shrink-0 min-h-[42px] min-w-[42px] flex items-center justify-center"
                title="Voltar aos Temas"
                aria-label="Voltar aos Temas"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 block">
                  Tema Selecionado
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-noir-950 truncate">
                  {selectedTema.nome}{' '}
                  <span className="text-xs font-normal text-gray-500 font-sans">
                    ({produtosDoTemaSelecionado.length} decorações)
                  </span>
                </h2>
              </div>
            </div>

            <button
              onClick={handleOpenNewProduto}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-all min-h-[44px] self-stretch sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADICIONAR PRODUTO</span>
            </button>
          </div>

          {/* Lista de Produtos do Tema: 1 coluna no celular, 2 no tablet, 3 no desktop */}
          {produtosDoTemaSelecionado.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300" />
              <h3 className="text-sm sm:text-base font-serif font-bold text-noir-900">
                Nenhum produto cadastrado neste tema ainda.
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Clique em "+ ADICIONAR PRODUTO" para cadastrar o primeiro cenário temático (ex: Homem-Aranha, Batman, Robin).
              </p>
              <button
                onClick={handleOpenNewProduto}
                className="px-4 py-2.5 rounded-xl bg-gold-400 text-noir-950 font-bold text-xs uppercase min-h-[44px]"
              >
                Cadastrar Primeiro Produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {produtosDoTemaSelecionado.map((prod) => (
                <div
                  key={prod.id}
                  className={`rounded-3xl bg-white border transition-all duration-300 shadow-xs overflow-hidden flex flex-col justify-between ${
                    prod.ativo ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'
                  }`}
                >
                  <div>
                    {/* Imagem do Produto */}
                    <div className="relative h-48 sm:h-52 bg-gray-100">
                      <StorageImage
                        src={prod.imagens[0]}
                        alt={prod.nome}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-gold-300 px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                        {prod.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>

                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{prod.imagens.length} fotos</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2">
                      <h3 className="font-serif font-bold text-base text-noir-950 truncate">
                        {prod.nome}
                      </h3>
                      <p className="text-xs text-noir-600 line-clamp-2 leading-relaxed">
                        {prod.descricao}
                      </p>
                      <div className="pt-1.5 text-[11px] text-gray-500">
                        <strong className="text-noir-800">{prod.itensInclusos.length}</strong> itens inclusos
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduto(prod)}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-gold-400 bg-white text-xs font-semibold text-noir-800 flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduto(prod.id, prod.nome)}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Visão Geral: Lista de Temas */
        <div className="space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <Palette className="w-3.5 h-3.5 text-gold-700" />
                <span>Estrutura de Temas & Produtos</span>
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-serif font-bold text-noir-950">
                Gerenciar Temas
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Crie e edite os temas de eventos. Toque em qualquer tema para abrir seus produtos.
              </p>
            </div>

            <button
              onClick={handleOpenNewTema}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-all min-h-[44px] self-stretch sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ NOVO TEMA</span>
            </button>
          </div>

          {/* Grid de Temas: 1 coluna no celular, 2 no tablet, 3 no desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {temas.map((t) => {
              const countProdutos = produtos.filter((p) => p.temaId === t.id).length;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTema(t)}
                  className={`group rounded-3xl bg-white border transition-all duration-300 shadow-xs overflow-hidden flex flex-col justify-between cursor-pointer active:scale-98 sm:hover:shadow-md ${
                    t.ativo ? 'border-gray-200 hover:border-gold-400' : 'border-dashed border-gray-300 opacity-60'
                  }`}
                >
                  <div>
                    {/* Capa do Tema */}
                    <div className="relative h-44 sm:h-48 bg-gray-100">
                      <StorageImage
                        src={t.imagemUrl}
                        alt={t.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-noir-950/75 via-transparent to-transparent" />

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleTemaAtivo(t.id, e)}
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase shadow-xs min-h-[26px] flex items-center ${
                            t.ativo ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-white'
                          }`}
                        >
                          {t.ativo ? 'Ativo' : 'Pausado'}
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-base sm:text-lg font-serif font-bold text-white uppercase truncate">
                          {t.nome}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2">
                      <p className="text-xs text-noir-600 line-clamp-2 leading-relaxed">
                        {t.descricao}
                      </p>
                      <div className="pt-1.5 flex items-center justify-between text-xs text-gold-800 font-semibold">
                        <span>{countProdutos} produtos</span>
                        <span className="flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform">
                          Ver produtos <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Ações do Tema */}
                  <div className="p-3 sm:p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditTema(t, e)}
                      className="py-1.5 px-3 rounded-lg border border-gray-200 hover:border-gold-400 bg-white text-xs font-semibold text-noir-800 flex items-center gap-1 transition-colors min-h-[38px]"
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteTema(t.id, t.nome, e)}
                      className="p-2 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Excluir Tema"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL CRIAR / EDITAR TEMA */}
      {/* ======================================================= */}
      {temaModalOpen && (
        <div className="fixed inset-0 z-50 bg-noir-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl space-y-4 animate-slide-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-noir-950">
                {editingTemaId ? 'Editar Tema' : 'Novo Tema de Evento'}
              </h3>
              <button
                onClick={() => setTemaModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-noir-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveTema} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Nome do Tema *
                </label>
                <input
                  type="text"
                  required
                  value={temaNome}
                  onChange={(e) => setTemaNome(e.target.value)}
                  placeholder="Ex: Aniversários, Casamentos, Festas Infantis..."
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs min-h-[46px]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Descrição do Tema
                </label>
                <textarea
                  rows={2}
                  value={temaDescricao}
                  onChange={(e) => setTemaDescricao(e.target.value)}
                  placeholder="Breve descrição da proposta dos cenários deste tema..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs resize-none"
                />
              </div>

              {/* Upload de Imagem do Tema via Dispositivo Nativo */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold uppercase text-noir-800 text-[11px]">
                    Capa do Tema (Foto)
                  </label>
                  <input
                    type="file"
                    ref={temaFileInputRef}
                    onChange={handleTemaFileChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => temaFileInputRef.current?.click()}
                    className="px-3 py-2 bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold rounded-xl text-[11px] uppercase flex items-center gap-1.5 min-h-[38px]"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>ADICIONAR FOTO</span>
                  </button>
                </div>

                <div className="h-32 sm:h-36 rounded-xl overflow-hidden bg-white border border-dashed border-gray-300 flex items-center justify-center">
                  {temaPreviewImg ? (
                    <img src={temaPreviewImg} alt="Preview" className="w-full h-full object-cover" />
                  ) : temaImagemUrl ? (
                    <StorageImage src={temaImagemUrl} alt="Capa" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">Nenhuma foto selecionada</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="temaAtivoCheck"
                  checked={temaAtivo}
                  onChange={(e) => setTemaAtivo(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <label htmlFor="temaAtivoCheck" className="font-semibold text-noir-900 cursor-pointer">
                  Tema Ativo (Visível no site)
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-col xs:flex-row justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTemaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold uppercase tracking-wider shadow-xs min-h-[44px]"
                >
                  Salvar Tema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL ADICIONAR / EDITAR PRODUTO DENTRO DO TEMA */}
      {/* ======================================================= */}
      {produtoModalOpen && selectedTema && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-noir-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl space-y-4 animate-slide-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="truncate pr-2">
                <span className="text-[10px] font-bold uppercase text-gold-700 block">
                  Tema: {selectedTema.nome}
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-noir-950 truncate">
                  {editingProdutoId ? 'Editar Produto' : 'Adicionar Produto ao Tema'}
                </h3>
              </div>
              <button
                onClick={() => setProdutoModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-noir-900 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduto} className="space-y-4 text-xs">
              {/* Nome do Produto */}
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={produtoNome}
                  onChange={(e) => setProdutoNome(e.target.value)}
                  placeholder="Ex: 🕷️ Homem-Aranha, 🦇 Batman, 🦸 Robin..."
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs font-semibold min-h-[46px]"
                />
              </div>

              {/* Preço */}
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="text"
                  required
                  value={produtoPreco}
                  onChange={(e) => setProdutoPreco(e.target.value)}
                  placeholder="Ex: 350.00"
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs min-h-[46px]"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-bold uppercase text-noir-800 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={produtoDescricao}
                  onChange={(e) => setProdutoDescricao(e.target.value)}
                  placeholder="Detalhes sobre a proposta visual do cenário..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 outline-none text-xs resize-none"
                />
              </div>

              {/* Várias Fotos por Produto com Seletor Nativo */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold uppercase text-noir-800 text-[11px]">
                    Fotos do Produto (Galeria) *
                  </label>
                  <input
                    type="file"
                    multiple
                    ref={produtoFileInputRef}
                    onChange={handleProdutoFilesChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => produtoFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold rounded-xl text-[11px] uppercase flex items-center gap-1.5 shadow-xs min-h-[38px]"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>+ ADICIONAR FOTOS</span>
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {produtoImagens.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-gray-300 group bg-white"
                    >
                      <StorageImage src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveProdutoImagem(idx)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover esta foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {produtoImagens.length === 0 && (
                    <div className="w-full py-6 text-center text-gray-400 text-xs border border-dashed border-gray-300 rounded-xl">
                      Clique em "+ ADICIONAR FOTOS" para selecionar do seu aparelho.
                    </div>
                  )}
                </div>
              </div>

              {/* Itens Inclusos */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <label className="block font-bold uppercase text-noir-800 text-[11px]">
                  Itens Inclusos no Pacote
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoItemInput}
                    onChange={(e) => setNovoItemInput(e.target.value)}
                    placeholder="Ex: Escultura de chão em MDF"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-xs outline-none bg-white min-h-[42px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddProdutoItem}
                    className="px-3.5 py-2 bg-gold-400 hover:bg-gold-500 font-bold rounded-xl text-noir-950 min-h-[42px]"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {produtoItens.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200"
                    >
                      <span className="text-[11px] text-noir-800 truncate pr-2">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProdutoItem(idx)}
                        className="text-gray-400 hover:text-rose-600 p-1 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="prodAtivoCheck"
                  checked={produtoAtivo}
                  onChange={(e) => setProdutoAtivo(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
                <label htmlFor="prodAtivoCheck" className="font-semibold text-noir-900 cursor-pointer">
                  Produto Ativo no Catálogo
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-col xs:flex-row justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setProdutoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold uppercase tracking-wider shadow-xs min-h-[44px]"
                >
                  SALVAR PRODUTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
