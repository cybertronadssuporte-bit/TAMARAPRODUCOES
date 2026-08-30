import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { storageService } from '../services/storageService';

export const Testimonials: React.FC = () => {
  const [nomeEmpresa, setNomeEmpresa] = useState(() => storageService.getEmpresaConfig().nome);

  useEffect(() => {
    const update = () => setNomeEmpresa(storageService.getEmpresaConfig().nome);
    window.addEventListener('empresa_updated', update);
    return () => window.removeEventListener('empresa_updated', update);
  }, []);

  const testimonials = [
    {
      name: 'Camila & Roberto Matos',
      event: 'Casamento e Recepção',
      rating: 5,
      comment:
        'A decoração superou todas as nossas expectativas! O arco floral com luzes quentes gerou fotos maravilhosas. A equipe chegou 15 minutos antes do combinado e deixou tudo impecável.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Renata Albuquerque',
      event: 'Aniversário Infantil',
      rating: 5,
      comment:
        'Agendei tudo direto pelo site em 5 minutos e escolhi o horário da montagem. Os personagens temáticos e o arco de balões desconstruído encantaram todos os nossos convidados!',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Dr. Leonardo Vasconcelos',
      event: 'Celebração Corporativa',
      rating: 5,
      comment:
        'Contratamos o backdrop executivo e a iluminação cênica. Extremamente profissionais, pontuais, e com atendimento impecável pelo WhatsApp. Recomendamos com louvor.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <section id="depoimentos" className="py-12 sm:py-20 bg-[#FAF9F5] border-t border-gold-200/50 scroll-mt-16 sm:scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold-700 block mb-1.5 sm:mb-2">
            Experiências Reais
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-serif font-bold text-noir-950 uppercase tracking-tight break-words">
            O que Nossos Clientes Dizem
          </h2>
          <p className="mt-2 text-noir-600 text-xs sm:text-sm leading-relaxed">
            Mais de 1.200 famílias e celebrações confiaram seus momentos mais especiais à {nomeEmpresa}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-8 rounded-3xl bg-white border border-gold-200/60 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                  <div className="flex items-center gap-1 text-gold-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-gold-400" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-gold-300/60" />
                </div>
                <p className="text-xs sm:text-sm text-noir-700 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-gray-100 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gold-200 shrink-0"
                />
                <div className="truncate">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-noir-950 truncate">
                    {t.name}
                  </h4>
                  <span className="text-[10px] sm:text-[11px] text-gold-800 font-medium block truncate">
                    {t.event}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
