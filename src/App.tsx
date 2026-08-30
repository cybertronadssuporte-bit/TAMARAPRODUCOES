import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EventCategories } from './components/EventCategories';
import { CatalogSection } from './components/CatalogSection';
import { DecorationModal } from './components/DecorationModal';
import { BookingWizard } from './components/BookingWizard';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

import { Produto, Tema, EmpresaConfig } from './types';
import { storageService } from './services/storageService';

export const App: React.FC = () => {
  // Rota principal ('site' | 'admin')
  const [currentView, setCurrentView] = useState<'site' | 'admin'>(() => {
    return window.location.hash.includes('admin') || window.location.pathname.includes('admin')
      ? 'admin'
      : 'site';
  });

  // Autenticação do Admin
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    return storageService.isAdminAuthenticated();
  });

  // Configuração da Empresa Dinâmica
  const [empresa, setEmpresa] = useState<EmpresaConfig>(() => storageService.getEmpresaConfig());

  // Tema Selecionado (Tema -> Produtos)
  const [selectedTema, setSelectedTema] = useState<Tema | null>(null);

  // Modais
  const [detailModalItem, setDetailModalItem] = useState<Produto | null>(null);
  const [bookingModalItem, setBookingModalItem] = useState<Produto | null>(null);

  useEffect(() => {
    // Sincronizar título da página e SEO com o nome da empresa
    const updateTitle = () => {
      const cfg = storageService.getEmpresaConfig();
      setEmpresa(cfg);
      document.title = `${cfg.nome} | Cenografia & Decorações de Alto Padrão`;
    };
    updateTitle();

    window.addEventListener('empresa_updated', updateTitle);

    // Sincronizar hash da URL
    const handleHashChange = () => {
      if (window.location.hash.includes('admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('site');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('empresa_updated', updateTitle);
    };
  }, []);

  // Navegar para Admin
  const handleOpenAdmin = () => {
    window.location.hash = 'admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Voltar para Site
  const handleBackToSite = () => {
    window.location.hash = '';
    setCurrentView('site');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logout Admin
  const handleLogoutAdmin = () => {
    storageService.logoutAdmin();
    setIsAdminAuth(false);
  };

  // Navegação suave por âncoras
  const handleNavigateToSection = (sectionId: string) => {
    if (currentView !== 'site') {
      setCurrentView('site');
      window.location.hash = '';
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Abrir fluxo de agendamento diretamente
  const handleStartBooking = (produto: Produto) => {
    setBookingModalItem(produto);
  };

  // Abrir catálogo direto
  const handleOpenCatalog = () => {
    handleNavigateToSection('catalogo');
  };

  // --- SE FOR A ÁREA ADMINISTRATIVA ---
  if (currentView === 'admin') {
    if (!isAdminAuth) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminAuth(true)}
          onBackToSite={handleBackToSite}
        />
      );
    }

    return (
      <AdminLayout
        onGoToSite={handleBackToSite}
        onLogout={handleLogoutAdmin}
      />
    );
  }

  // --- SE FOR O SITE PÚBLICO DO CLIENTE ---
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-noir-900 selection:bg-gold-200">
      {/* Barra de Navegação com Logo e Nome Dinâmicos */}
      <Navbar
        onOpenCatalog={handleOpenCatalog}
        onOpenAdmin={handleOpenAdmin}
        onNavigateToSection={handleNavigateToSection}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {/* 1. Hero com título, subtítulo e CTA */}
        <Hero onCtaClick={handleOpenCatalog} />

        {/* 2. ESCOLHA O TEMA DO SEU EVENTO (Cards dos Temas cadastrados) */}
        <EventCategories
          selectedTemaId={selectedTema?.id || ''}
          onSelectTema={(tema) => setSelectedTema(tema)}
        />

        {/* 3. ESCOLHA SUA DECORAÇÃO (Produtos do Tema selecionado, ex: Homem-Aranha, Batman, Robin) */}
        <CatalogSection
          selectedTema={selectedTema}
          onSelectTema={(tema) => setSelectedTema(tema)}
          onViewDetails={(prod) => setDetailModalItem(prod)}
          onSelectProductToBook={handleStartBooking}
        />

        {/* 4. Como Funciona o Agendamento */}
        <HowItWorks />

        {/* 5. Depoimentos e Avaliações de Clientes */}
        <Testimonials />
      </main>

      {/* Rodapé Oficial */}
      <Footer
        onOpenAdmin={handleOpenAdmin}
        onNavigateToSection={handleNavigateToSection}
      />

      {/* 4. BOTÃO FLUTUANTE DO WHATSAPP (com número e mensagem oficial da Tamara Produções) */}
      <FloatingWhatsApp
        numero={empresa.whatsapp || '5585998672404'}
        nomeEmpresa={empresa.nome}
        mensagem="Olá! Vim pelo site da Tamara Produções e gostaria de saber mais sobre as decorações."
      />

      {/* Modal de Detalhes do Produto / Decoração */}
      <DecorationModal
        decoracao={detailModalItem}
        isOpen={!!detailModalItem}
        onClose={() => setDetailModalItem(null)}
        onBookNow={(prod) => {
          setDetailModalItem(null);
          handleStartBooking(prod);
        }}
      />

      {/* Modal / Wizard do Fluxo de Agendamento */}
      {bookingModalItem && (
        <BookingWizard
          decoracao={bookingModalItem}
          isOpen={!!bookingModalItem}
          onClose={() => setBookingModalItem(null)}
          onBookingCompleted={() => {
            // Recarrega contadores
          }}
        />
      )}
    </div>
  );
};
