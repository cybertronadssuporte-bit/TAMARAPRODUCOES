import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Star, ShieldCheck, Clock, Award } from 'lucide-react';
import { storageService } from '../services/storageService';

interface HeroProps {
  onCtaClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  const [nomeEmpresa, setNomeEmpresa] = useState(() => storageService.getEmpresaConfig().nome);

  useEffect(() => {
    const update = () => setNomeEmpresa(storageService.getEmpresaConfig().nome);
    window.addEventListener('empresa_updated', update);
    return () => window.removeEventListener('empresa_updated', update);
  }, []);

  return (
    <section id="hero" className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-24">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gold-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-gold-900 text-[11px] sm:text-xs font-semibold uppercase tracking-wider shadow-sm max-w-full truncate">
              <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span className="truncate">{nomeEmpresa} • Cenografia & Decorações</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-noir-950 tracking-tight leading-[1.2] break-words">
              Transforme seu evento em um{' '}
              <span className="gold-gradient-text italic font-normal block sm:inline">
                momento inesquecível
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg lg:text-xl text-noir-700 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Escolha sua decoração, selecione a data e agende sua instalação de forma rápida e fácil.
            </p>

            {/* CTA Button Required by User */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <button
                onClick={onCtaClick}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:to-gold-400 text-noir-950 font-bold text-sm sm:text-base uppercase tracking-wider shadow-luxury hover:shadow-luxury-hover transform active:scale-98 transition-all duration-300 group"
              >
                <span>ESCOLHER MINHA DECORAÇÃO</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-noir-800 hover:text-gold-700 py-3 px-4 rounded-xl hover:bg-gold-50 transition-colors min-h-[44px]"
              >
                <span>Como funciona o agendamento</span>
              </a>
            </div>

            {/* Trust Badges - Adaptados para Mobile: 1 coluna no celular estreito e 3 colunas em telas sm+ */}
            <div className="pt-4 sm:pt-6 border-t border-gold-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/60 sm:bg-transparent border border-gold-100 sm:border-0 shadow-xs sm:shadow-none">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-noir-900 leading-tight">Montagem Impecável</p>
                  <p className="text-[11px] text-gray-500">Pontualidade garantida</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/60 sm:bg-transparent border border-gold-100 sm:border-0 shadow-xs sm:shadow-none">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-noir-900 leading-tight">Agendamento Real</p>
                  <p className="text-[11px] text-gray-500">Sem duplo agendamento</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/60 sm:bg-transparent border border-gold-100 sm:border-0 shadow-xs sm:shadow-none">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-noir-900 leading-tight">+1.200 Eventos</p>
                  <p className="text-[11px] text-gray-500">Satisfação 99.8%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Visual Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white/80 bg-white group">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                  alt="Decoração de Casamento e Eventos Luxo"
                  className="w-full h-64 xs:h-72 sm:h-96 lg:h-[430px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950/85 via-noir-950/20 to-transparent" />
                
                {/* Floating Info on Image */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-gold-300 text-[11px] font-medium mb-1.5">
                    <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                    <span>Cenografia Mais Solicitada</span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-2xl font-bold text-white leading-snug">
                    Coleção Imperial Dourada & Flores Nobres
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-200 mt-1 line-clamp-2">
                    Montagem completa com mobiliário orgânico, iluminação cênica e florais nobres.
                  </p>
                </div>
              </div>

              {/* Floating Review Card (escondido em telas pequenas para evitar overflow) */}
              <div className="absolute -bottom-5 -left-4 sm:-left-8 glass-panel p-3.5 sm:p-4 rounded-2xl shadow-xl max-w-[220px] sm:max-w-[240px] hidden md:block border border-gold-200">
                <div className="flex items-center gap-1 text-gold-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-gold-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-noir-900 leading-snug">
                  "A decoração foi perfeita, todos amaram!"
                </p>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Família Albuquerque
                </span>
              </div>

              {/* Floating Slots Pill */}
              <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 glass-dark p-2.5 px-3.5 sm:p-3 sm:px-4 rounded-2xl shadow-xl text-white flex items-center gap-2 sm:gap-3 border border-gold-300/30">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-gold-400">Datas Abertas</p>
                  <p className="text-[11px] sm:text-xs font-semibold">Agenda 2026 Disponível</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
