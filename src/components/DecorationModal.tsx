import React, { useState } from 'react';
import {
  X,
  Check,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Produto } from '../types';
import { StorageImage } from './common/StorageImage';

interface DecorationModalProps {
  decoracao: Produto | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (decoracao: Produto) => void;
}

export const DecorationModal: React.FC<DecorationModalProps> = ({
  decoracao,
  isOpen,
  onClose,
  onBookNow,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !decoracao) return null;

  const images =
    decoracao.imagens && decoracao.imagens.length > 0
      ? decoracao.imagens
      : ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-noir-950/80 backdrop-blur-md flex items-center justify-center p-2 xs:p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gold-300/40 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/80 shrink-0">
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {decoracao.temaNome || 'Decoração'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-noir-900 hover:bg-gray-100 transition-colors shadow-xs shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Top Section: Photo Gallery + Quick Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-3">
              {/* Main Photo with Nav Arrows */}
              <div className="relative h-60 xs:h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-900 group">
                <StorageImage
                  src={images[activeImageIndex]}
                  alt={`${decoracao.nome} - Foto ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-noir-900/60 hover:bg-noir-900/90 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-noir-900/60 hover:bg-noir-900/90 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                      aria-label="Próxima foto"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Counter */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-gold-500 ring-2 ring-gold-300'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <StorageImage
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title, Price and Booking Summary Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl xs:text-2xl sm:text-3xl font-serif font-bold text-noir-950 leading-tight">
                  {decoracao.nome}
                </h2>

                <div className="mt-3 sm:mt-4 p-4 rounded-2xl bg-gold-50/70 border border-gold-200">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-gold-900 block">
                    Investimento Completo
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
                      {decoracao.preco.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-500 font-medium">/ montagem inclusa</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Montagem, alinhamento cênico e desmontagem pontual após o evento.
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs text-noir-700">
                    <Clock className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Instalação com horário reservado e exclusivo</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-noir-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Equipe experiente com acabamento de alto padrão</span>
                  </div>
                </div>
              </div>

              {/* Botão de Agendamento */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onBookNow(decoracao);
                  }}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:to-gold-400 text-noir-950 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-luxury hover:shadow-luxury-hover flex items-center justify-center gap-2 transform active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>AGENDAR ESTA DECORAÇÃO</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="border-t border-gray-100 pt-5 sm:pt-6">
            <h3 className="text-base sm:text-lg font-serif font-bold text-noir-950 mb-2">
              Descrição Completa da Decoração
            </h3>
            <p className="text-xs sm:text-sm text-noir-700 leading-relaxed">
              {decoracao.descricao}
            </p>
          </div>

          {/* Included Items Section */}
          <div className="border-t border-gray-100 pt-5 sm:pt-6">
            <h3 className="text-base sm:text-lg font-serif font-bold text-noir-950 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Itens Inclusos neste Pacote</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {decoracao.itensInclusos.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-xs text-noir-800"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          {decoracao.observacoes && (
            <div className="border-t border-gray-100 pt-5 sm:pt-6">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-900 mb-0.5">
                    Observações & Requisitos para Instalação
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
                    {decoracao.observacoes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 hover:text-noir-950 py-2"
          >
            Voltar ao Catálogo
          </button>

          <button
            onClick={() => {
              onClose();
              onBookNow(decoracao);
            }}
            className="px-5 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-all min-h-[42px]"
          >
            AGENDAR AGORA
          </button>
        </div>
      </div>
    </div>
  );
};
