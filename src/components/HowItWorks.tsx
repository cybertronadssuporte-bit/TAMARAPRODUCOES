import React, { useState, useEffect } from 'react';
import { Palette, CalendarCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

export const HowItWorks: React.FC = () => {
  const [nomeEmpresa, setNomeEmpresa] = useState(() => storageService.getEmpresaConfig().nome);

  useEffect(() => {
    const update = () => setNomeEmpresa(storageService.getEmpresaConfig().nome);
    window.addEventListener('empresa_updated', update);
    return () => window.removeEventListener('empresa_updated', update);
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Escolha seu Cenário',
      description: 'Navegue pelo nosso catálogo de temas para aniversários, casamentos, formaturas e celebrações corporativas.',
      icon: Palette,
    },
    {
      number: '02',
      title: 'Selecione Data & Horário',
      description: 'Nosso calendário inteligente mostra horários livres em tempo real. Escolha o melhor momento para a montagem.',
      icon: CalendarCheck,
    },
    {
      number: '03',
      title: 'Informe o Local do Evento',
      description: 'Preencha o endereço do seu salão, buffet ou residência com pontos de referência e detalhes logísticos.',
      icon: Truck,
    },
    {
      number: '04',
      title: 'Instalação Impecável',
      description: 'Nossa equipe uniformizada e pontual cuida de tudo: montagem, iluminação, testes e desmontagem ao final.',
      icon: Sparkles,
    },
  ];

  return (
    <section id="como-funciona" className="py-12 sm:py-20 bg-white border-t border-gold-100 scroll-mt-16 sm:scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-gold-700 block mb-1.5 sm:mb-2">
            Simplicidade & Pontualidade
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-serif font-bold text-noir-950 uppercase tracking-tight break-words">
            Como Funciona o Agendamento
          </h2>
          <p className="mt-2 sm:mt-3 text-noir-600 text-xs sm:text-base leading-relaxed">
            Desenvolvemos um processo 100% online, transparente e descomplicado para você garantir a melhor cenografia para a sua festa em poucos minutos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative p-5 sm:p-6 rounded-3xl bg-gray-50/70 border border-gray-100 hover:border-gold-300 hover:bg-gold-50/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gold-100 group-hover:bg-gold-500 group-hover:text-noir-950 transition-colors flex items-center justify-center text-gold-700 shadow-xs">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-gray-300 group-hover:text-gold-400 transition-colors">
                    {s.number}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-serif font-bold text-noir-950 mb-1.5 sm:mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-noir-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Banner de Garantia */}
        <div className="mt-10 sm:mt-14 p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-noir-950 via-noir-900 to-noir-850 text-white flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 border border-gold-500/30 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Garantia {nomeEmpresa} de Qualidade
            </div>
            <h4 className="text-lg sm:text-2xl font-serif font-bold">
              Pontualidade Britânica e Acabamento de Alta Cenografia
            </h4>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              Nossos materiais são higienizados e revisados antes de cada saída. Seu evento decorado exatamente como sonhou.
            </p>
          </div>

          <a
            href="#catalogo"
            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0 min-h-[46px]"
          >
            Ver Decorações Disponíveis
          </a>
        </div>
      </div>
    </section>
  );
};
