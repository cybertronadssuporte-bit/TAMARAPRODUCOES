import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Tema } from '../types';
import { StorageImage } from './common/StorageImage';

interface EventCategoriesProps {
  selectedTemaId: string;
  onSelectTema: (tema: Tema) => void;
}

export const EventCategories: React.FC<EventCategoriesProps> = ({
  selectedTemaId,
  onSelectTema,
}) => {
  const [temas, setTemas] = useState<Tema[]>(storageService.getTemasAtivos());

  useEffect(() => {
    const handleUpdate = () => {
      setTemas(storageService.getTemasAtivos());
    };
    window.addEventListener('temas_updated', handleUpdate);
    return () => window.removeEventListener('temas_updated', handleUpdate);
  }, []);

  return (
    <section id="temas" className="py-12 sm:py-16 bg-[#F5EFE6]/40 border-y border-gold-200/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold-700 block mb-1.5">
            Catálogo Exclusivo
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-serif font-bold text-noir-950 uppercase tracking-tight break-words">
            ESCOLHA O TEMA DO SEU EVENTO
          </h2>
          <p className="mt-2 sm:mt-3 text-noir-600 text-xs sm:text-sm sm:text-base leading-relaxed">
            Selecione o tema desejado para visualizar todos os cenários e personagens disponíveis para locação.
          </p>
        </div>

        {/* Categories / Themes Grid: 1 coluna no celular, 2 no tablet, 3 no desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {temas.map((tema) => {
            const isSelected = selectedTemaId === tema.id;
            return (
              <div
                key={tema.id}
                onClick={() => {
                  onSelectTema(tema);
                  const el = document.getElementById('catalogo');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group cursor-pointer rounded-3xl overflow-hidden bg-white border transition-all duration-300 transform active:scale-98 sm:hover:-translate-y-1.5 sm:hover:shadow-xl ${
                  isSelected
                    ? 'border-gold-500 ring-2 ring-gold-400 shadow-luxury'
                    : 'border-gray-200 hover:border-gold-300 shadow-sm'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-44 xs:h-48 sm:h-48 overflow-hidden bg-gray-100">
                  <StorageImage
                    src={tema.imagemUrl}
                    alt={`Tema ${tema.nome}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950/80 via-noir-950/20 to-transparent" />

                  {/* Top right indicator */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-noir-900/40 backdrop-blur-md flex items-center justify-center text-white opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-4 right-4 sm:left-5 sm:right-5">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-white drop-shadow-sm uppercase truncate">
                      {tema.nome}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <p className="text-xs text-noir-600 line-clamp-2 leading-relaxed">
                    {tema.descricao}
                  </p>
                  <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-gold-700 group-hover:text-gold-800 min-h-[32px]">
                    <span className="uppercase tracking-wider">Ver decorações deste tema</span>
                    <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
