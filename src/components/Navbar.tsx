import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Lock, Menu, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import { EmpresaConfig } from '../types';
import { StorageImage } from './common/StorageImage';

interface NavbarProps {
  onOpenCatalog: () => void;
  onOpenAdmin: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCatalog,
  onOpenAdmin,
  onNavigateToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [empresa, setEmpresa] = useState<EmpresaConfig>(storageService.getEmpresaConfig());

  useEffect(() => {
    const handleEmpresaUpdate = () => {
      setEmpresa(storageService.getEmpresaConfig());
    };
    window.addEventListener('empresa_updated', handleEmpresaUpdate);
    return () => window.removeEventListener('empresa_updated', handleEmpresaUpdate);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigateToSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gold-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Nome Dinâmico */}
        <div
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
        >
          {empresa.logoUrl ? (
            <div className="h-8 sm:h-12 w-auto max-w-[100px] sm:max-w-[150px] flex items-center justify-center overflow-hidden rounded-lg sm:rounded-xl shrink-0">
              <StorageImage
                src={empresa.logoUrl}
                alt={empresa.nome}
                className="max-h-8 sm:max-h-12 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-300 flex items-center justify-center shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-noir-950" />
            </div>
          )}

          <div className="truncate min-w-0">
            <span className="font-serif text-sm xs:text-base sm:text-xl font-bold tracking-tight text-noir-950 block leading-tight group-hover:text-gold-700 transition-colors uppercase truncate">
              {empresa.nome}
            </span>
            <span className="text-[9px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-gold-700 uppercase font-semibold block truncate">
              Cenografia & Decorações
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-noir-800">
          <button
            onClick={() => handleNavClick('hero')}
            className="hover:text-gold-600 transition-colors py-1"
          >
            Início
          </button>
          <button
            onClick={() => handleNavClick('temas')}
            className="hover:text-gold-600 transition-colors py-1"
          >
            Temas
          </button>
          <button
            onClick={() => handleNavClick('catalogo')}
            className="hover:text-gold-600 transition-colors py-1"
          >
            Decorações
          </button>
          <button
            onClick={() => handleNavClick('como-funciona')}
            className="hover:text-gold-600 transition-colors py-1"
          >
            Como Funciona
          </button>
          <button
            onClick={() => handleNavClick('depoimentos')}
            className="hover:text-gold-600 transition-colors py-1"
          >
            Avaliações
          </button>
        </nav>

        {/* Action Buttons Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 text-xs font-semibold text-noir-700 hover:text-gold-600 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gold-300 transition-all hover:bg-gold-50/50"
            title="Acesso Administrativo"
          >
            <Lock className="w-3.5 h-3.5" />
            Área Restrita
          </button>

          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-noir-950 bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 hover:from-gold-500 hover:to-gold-300 px-5 py-2.5 rounded-full shadow-md shadow-gold-500/25 hover:shadow-lg hover:shadow-gold-500/35 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Calendar className="w-4 h-4" />
            Agendar Decoração
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={onOpenAdmin}
            className="p-2 text-noir-700 hover:text-gold-600 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Painel Admin"
            aria-label="Área restrita"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-noir-800 hover:text-gold-600 rounded-lg focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 md:hidden flex flex-col">
          {/* Backdrop escuro */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative z-10 bg-white border-b border-gold-200 px-5 pt-4 pb-6 space-y-1 shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)] animate-slide-up">
            <button
              onClick={() => handleNavClick('hero')}
              className="w-full text-left py-3 px-2 text-base font-medium text-noir-800 hover:text-gold-700 hover:bg-gold-50/50 rounded-xl transition-colors border-b border-gray-100 flex items-center justify-between"
            >
              <span>Início</span>
              <span className="text-gray-400">›</span>
            </button>
            <button
              onClick={() => handleNavClick('temas')}
              className="w-full text-left py-3 px-2 text-base font-medium text-noir-800 hover:text-gold-700 hover:bg-gold-50/50 rounded-xl transition-colors border-b border-gray-100 flex items-center justify-between"
            >
              <span>Temas de Eventos</span>
              <span className="text-gray-400">›</span>
            </button>
            <button
              onClick={() => handleNavClick('catalogo')}
              className="w-full text-left py-3 px-2 text-base font-medium text-noir-800 hover:text-gold-700 hover:bg-gold-50/50 rounded-xl transition-colors border-b border-gray-100 flex items-center justify-between"
            >
              <span>Decorações & Produtos</span>
              <span className="text-gray-400">›</span>
            </button>
            <button
              onClick={() => handleNavClick('como-funciona')}
              className="w-full text-left py-3 px-2 text-base font-medium text-noir-800 hover:text-gold-700 hover:bg-gold-50/50 rounded-xl transition-colors border-b border-gray-100 flex items-center justify-between"
            >
              <span>Como Funciona o Agendamento</span>
              <span className="text-gray-400">›</span>
            </button>
            <button
              onClick={() => handleNavClick('depoimentos')}
              className="w-full text-left py-3 px-2 text-base font-medium text-noir-800 hover:text-gold-700 hover:bg-gold-50/50 rounded-xl transition-colors border-b border-gray-100 flex items-center justify-between"
            >
              <span>Avaliações de Clientes</span>
              <span className="text-gray-400">›</span>
            </button>

            <div className="pt-4 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCatalog();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-noir-950 font-bold text-sm uppercase tracking-wider shadow-md active:scale-98 transition-all min-h-[48px]"
              >
                <Calendar className="w-4 h-4" />
                <span>Escolher Minha Decoração</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-300 text-xs font-semibold text-noir-700 hover:bg-gray-50 active:scale-98 transition-all min-h-[44px]"
              >
                <Lock className="w-4 h-4 text-gold-600" />
                <span>Painel do Administrador</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
