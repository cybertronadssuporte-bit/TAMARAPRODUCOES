import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, Mail, MapPin, Lock, ArrowUp } from 'lucide-react';
import { storageService } from '../services/storageService';
import { EmpresaConfig } from '../types';
import { StorageImage } from './common/StorageImage';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigateToSection }) => {
  const [empresa, setEmpresa] = useState<EmpresaConfig>(storageService.getEmpresaConfig());

  useEffect(() => {
    const handleEmpresaUpdate = () => {
      setEmpresa(storageService.getEmpresaConfig());
    };
    window.addEventListener('empresa_updated', handleEmpresaUpdate);
    return () => window.removeEventListener('empresa_updated', handleEmpresaUpdate);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-noir-950 text-white border-t border-gold-900/50 pt-12 pb-8 sm:pt-16 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              {empresa.logoUrl ? (
                <div className="h-9 sm:h-10 w-auto max-w-[120px] sm:max-w-[130px] flex items-center">
                  <StorageImage src={empresa.logoUrl} alt={empresa.nome} className="max-h-9 sm:max-h-10 w-auto object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-noir-950" />
                </div>
              )}
              <div className="truncate">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white block uppercase truncate">
                  {empresa.nome}
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-gold-400 uppercase font-semibold block">
                  Cenografia & Decorações
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Criamos memórias inesquecíveis através de cenários autorais, personagens marcantes, iluminação intimista e decorações de alto padrão para casamentos, festas infantis e celebrações corporativas.
            </p>

            <div className="pt-1 flex items-center gap-3">
              <a
                href={`https://wa.me/${empresa.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#25D366] hover:text-white flex items-center justify-center text-gray-300 transition-all min-h-[40px] min-w-[40px]"
                title="WhatsApp Oficial"
                aria-label="Abrir WhatsApp oficial"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
              Navegação Rápida
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onNavigateToSection('hero')}
                  className="hover:text-white transition-colors py-1 min-h-[36px] flex items-center text-left"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('temas')}
                  className="hover:text-white transition-colors py-1 min-h-[36px] flex items-center text-left"
                >
                  Temas de Eventos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('catalogo')}
                  className="hover:text-white transition-colors py-1 min-h-[36px] flex items-center text-left"
                >
                  Decorações & Produtos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('como-funciona')}
                  className="hover:text-white transition-colors py-1 min-h-[36px] flex items-center text-left"
                >
                  Como Funciona o Agendamento
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToSection('depoimentos')}
                  className="hover:text-white transition-colors py-1 min-h-[36px] flex items-center text-left"
                >
                  Depoimentos de Clientes
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
              Atendimento & Instalações
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>WhatsApp: {empresa.whatsappFormatado || '+55 85 99867-2404'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="break-all">E-mail: {empresa.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Atendemos {empresa.cidadePadrao || 'Fortaleza - CE'} e Região</span>
              </li>
              <li className="pt-1 text-[11px] text-gray-500">
                Horário da Central: Segunda a Domingo das 08h às 19h
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {empresa.nome}. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gold-400 transition-colors min-h-[40px] px-2 py-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acesso Administrativo</span>
            </button>

            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors min-h-[36px] min-w-[36px]"
              title="Voltar ao Topo"
              aria-label="Voltar ao topo da página"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
