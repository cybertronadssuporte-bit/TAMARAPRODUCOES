import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Check, Eye, Calendar, Sparkles, X } from 'lucide-react';
import { Produto, Tema } from '../types';
import { storageService } from '../services/storageService';
import { StorageImage } from './common/StorageImage';

interface CatalogSectionProps {
  selectedTema: Tema | null;
  onSelectTema: (tema: Tema | null) => void;
  onViewDetails: (produto: Produto) => void;
  onSelectProductToBook: (produto: Produto) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  selectedTema,
  onSelectTema,
  onViewDetails,
  onSelectProductToBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under400' | '400to800' | 'above800'>('all');
  const [temas, setTemas] = useState<Tema[]>(storageService.getTemasAtivos());
  const [produtos, setProdutos] = useState<Produto[]>(storageService.getProdutos());

  useEffect(() => {
    const handleUpdate = () => {
      setTemas(storageService.getTemasAtivos());
      setProdutos(storageService.getProdutos());
    };
    window.addEventListener('temas_updated', handleUpdate);
    window.addEventListener('produtos_updated', handleUpdate);
    return () => {
      window.removeEventListener('temas_updated', handleUpdate);
      window.removeEventListener('produtos_updated', handleUpdate);
    };
  }, []);

  // Filtros combinados
  const filteredProdutos = useMemo(() => {
    return produtos.filter((item) => {
      if (!item.ativo) return false;

      // Filtro por Tema selecionado
      if (selectedTema && item.temaId !== selectedTema.id) {
        return false;
      }

      // Pesquisa por texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = item.nome.toLowerCase().includes(term);
        const matchesDesc = item.descricao.toLowerCase().includes(term);
        const matchesTema = (item.temaNome || '').toLowerCase().includes(term);
        const matchesItems = item.itensInclusos.some((i) => i.toLowerCase().includes(term));
        if (!matchesName && !matchesDesc && !matchesTema && !matchesItems) {
          return false;
        }
      }

      // Faixa de preço
      if (priceFilter === 'under400' && item.preco >= 400) return false;
      if (priceFilter === '400to800' && (item.preco < 400 || item.preco > 800)) return false;
      if (priceFilter === 'above800' && item.preco <= 800) return false;

      return true;
    });
  }, [produtos, selectedTema, searchTerm, priceFilter]);

  return (
    <section id="catalogo" className="py-14 sm:py-20 bg-[#FAF9F5] scroll-mt-16 sm:scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span className="truncate">{selectedTema ? `Tema: ${selectedTema.nome}` : 'Todas as Decorações'}</span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-serif font-bold text-noir-950 uppercase tracking-tight break-words">
              ESCOLHA SUA DECORAÇÃO
            </h2>
            <p className="mt-1.5 sm:mt-2 text-noir-600 text-xs sm:text-base max-w-xl leading-relaxed">
              Cenários completos e personalizáveis com personagens, iluminação cênica e montagem pontual inclusa.
            </p>
          </div>

          <div className="text-[11px] sm:text-xs text-noir-600 font-medium bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-xs self-start md:self-auto">
            Mostrando <strong className="text-noir-900">{filteredProdutos.length}</strong> decorações disponíveis
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gold-200/50 mb-8 sm:mb-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar (ex: Homem-Aranha, Batman, Robin...)"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm transition-all outline-none bg-gray-50/50 focus:bg-white min-h-[46px]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Price Filter Select */}
            <div className="md:col-span-4 relative">
              <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="w-full pl-10 pr-8 py-3 rounded-2xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm transition-all outline-none bg-gray-50/50 focus:bg-white cursor-pointer appearance-none min-h-[46px]"
              >
                <option value="all">Todas as faixas de preço</option>
                <option value="under400">Até R$ 399,00</option>
                <option value="400to800">R$ 400,00 a R$ 800,00</option>
                <option value="above800">Acima de R$ 800,00</option>
              </select>
            </div>
          </div>

          {/* Temas Pill Navigation com Scroll Touch suave */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
            <button
              onClick={() => onSelectTema(null)}
              className={`px-3.5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all uppercase tracking-wider min-h-[40px] flex items-center ${
                selectedTema === null
                  ? 'bg-noir-900 text-white shadow-sm'
                  : 'bg-gray-100 text-noir-700 hover:bg-gold-50 hover:text-gold-800'
              }`}
            >
              Todos os Temas
            </button>
            {temas.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTema(t)}
                className={`px-3.5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all uppercase tracking-wider min-h-[40px] flex items-center ${
                  selectedTema?.id === t.id
                    ? 'bg-gold-500 text-noir-950 font-bold shadow-md shadow-gold-500/20'
                    : 'bg-gray-100 text-noir-700 hover:bg-gold-50 hover:text-gold-800'
                }`}
              >
                {t.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid: 1 coluna no celular, 2 no tablet e 3 no desktop */}
        {filteredProdutos.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-sm max-w-md mx-auto my-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 mx-auto mb-3 sm:mb-4">
              <Search className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-noir-900">Nenhuma decoração encontrada</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              Não encontramos decorações com os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceFilter('all');
                onSelectTema(null);
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider hover:bg-gold-500 transition-colors shadow min-h-[44px]"
            >
              Ver Todas as Decorações
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProdutos.map((item) => {
              const primeiraImagem = item.imagens && item.imagens.length > 0 ? item.imagens[0] : '';
              return (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-white border border-gold-200/60 shadow-card hover:shadow-luxury-hover transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Image Container */}
                  <div
                    className="relative h-56 sm:h-64 overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => onViewDetails(item)}
                  >
                    <StorageImage
                      src={primeiraImagem}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir-950/70 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                    {/* Tema Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-noir-900 tracking-wide uppercase shadow-sm">
                        {item.temaNome || 'Tema Exclusivo'}
                      </span>
                    </div>

                    {/* Preço em destaque */}
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-noir-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gold-400/40 text-gold-300">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 block -mb-0.5 sm:-mb-1">Valor</span>
                      <span className="font-serif text-base sm:text-lg font-bold text-white">
                        {item.preco.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    {/* Hover "Ver Detalhes" para desktop */}
                    <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-noir-950/30 backdrop-blur-[2px]">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 text-noir-900 font-bold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform uppercase tracking-wider">
                        <Eye className="w-4 h-4 text-gold-600" />
                        VER DETALHES
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => onViewDetails(item)}
                        className="font-serif text-lg sm:text-xl font-bold text-noir-950 group-hover:text-gold-700 transition-colors cursor-pointer leading-snug mb-2"
                      >
                        {item.nome}
                      </h3>

                      <p className="text-xs text-noir-600 line-clamp-2 mb-4 leading-relaxed">
                        {item.descricao}
                      </p>

                      {/* Included items */}
                      <div className="space-y-1.5 mb-5 pt-3 border-t border-gray-100">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gold-800 block mb-1">
                          O que está incluso:
                        </span>
                        {item.itensInclusos.slice(0, 3).map((incl, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-noir-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{incl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botões de Ação Adaptados para Celular */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 pt-2">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-gold-300 text-xs font-bold text-noir-800 hover:bg-gold-50/50 transition-colors uppercase tracking-wider"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span>VER DETALHES</span>
                      </button>

                      <button
                        onClick={() => onSelectProductToBook(item)}
                        className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-noir-950 text-xs font-bold uppercase tracking-wider shadow-md active:scale-98 transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>AGENDAR</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
