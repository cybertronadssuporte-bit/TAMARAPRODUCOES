import React, { useState, useEffect, useCallback } from 'react';
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
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';

import { Produto, Tema, EmpresaConfig } from './types';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { ShieldAlert, X } from 'lucide-react';

export const App: React.FC = () => {
  // Configuração da Empresa Dinâmica
  const [empresa, setEmpresa] = useState<EmpresaConfig>(() => storageService.getEmpresaConfig());

  // Rota e aba administrativa ativa
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.includes('admin') || hash.includes('admin');
  });

  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Alerta de Acesso Negado para clientes comuns tentando entrar no /admin
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string | null>(null);

  // Autenticação do Admin (Validada no AuthService com role = 'admin')
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    return authService.isAdmin();
  });

  // Tema Selecionado (Tema -> Produtos)
  const [selectedTema, setSelectedTema] = useState<Tema | null>(null);

  // Modais
  const [detailModalItem, setDetailModalItem] = useState<Produto | null>(null);
  const [bookingModalItem, setBookingModalItem] = useState<Produto | null>(null);

  // Mapeador de sub-rotas administrativas
  const parseAdminRoute = useCallback((): { isAdmin: boolean; tab: AdminTab } => {
    const raw = (window.location.pathname + window.location.hash).toLowerCase();
    if (!raw.includes('admin')) {
      return { isAdmin: false, tab: 'dashboard' };
    }

    let tab: AdminTab = 'dashboard';
    if (raw.includes('agendamentos')) tab = 'agendamentos';
    else if (raw.includes('temas') || raw.includes('produtos')) tab = 'temas';
    else if (raw.includes('calendario') || raw.includes('agenda')) tab = 'calendario';
    else if (raw.includes('clientes')) tab = 'clientes';
    else if (raw.includes('configuracoes') || raw.includes('identidade')) tab = 'identidade';
    else if (raw.includes('seguranca')) tab = 'seguranca';
    else if (raw.includes('minha-conta') || raw.includes('conta')) tab = 'conta';
    else tab = 'dashboard';

    return { isAdmin: true, tab };
  }, []);

  // Sincronização de rotas e segurança
  useEffect(() => {
    const checkAccessAndSyncRoute = () => {
      const { isAdmin, tab } = parseAdminRoute();

      if (isAdmin) {
        // SEGURANÇA: Se o usuário logado for um CLIENTE comum (role = 'customer')
        if (authService.isCustomer()) {
          // Bloqueia acesso imediatamente, não carrega dados administrativos e redireciona
          setIsAdminView(false);
          window.location.hash = '';
          if (window.location.pathname.includes('admin')) {
            window.history.replaceState(null, '', '/');
          }
          setAccessDeniedMsg(
            '⛔ Acesso Negado: A área administrativa é privada e restrita a administradores autorizados. Sua conta de cliente não possui permissão de acesso.'
          );
          return;
        }

        // Se for admin autenticado ou visitante (para tela de login)
        setIsAdminView(true);
        setAdminTab(tab);
        setIsAdminAuth(authService.isAdmin());
      } else {
        setIsAdminView(false);
      }
    };

    checkAccessAndSyncRoute();

    // Sincronizar título e dados da empresa
    const updateTitle = () => {
      const cfg = storageService.getEmpresaConfig();
      setEmpresa(cfg);
      document.title = `${cfg.nome} | Cenografia & Decorações de Alto Padrão`;
    };
    updateTitle();

    const handleAuthChange = () => {
      setIsAdminAuth(authService.isAdmin());
      checkAccessAndSyncRoute();
    };

    window.addEventListener('hashchange', checkAccessAndSyncRoute);
    window.addEventListener('popstate', checkAccessAndSyncRoute);
    window.addEventListener('auth_state_changed', handleAuthChange);
    window.addEventListener('empresa_updated', updateTitle);

    return () => {
      window.removeEventListener('hashchange', checkAccessAndSyncRoute);
      window.removeEventListener('popstate', checkAccessAndSyncRoute);
      window.removeEventListener('auth_state_changed', handleAuthChange);
      window.removeEventListener('empresa_updated', updateTitle);
    };
  }, [parseAdminRoute]);

  // Navegar para Admin
  const handleOpenAdmin = () => {
    if (authService.isCustomer()) {
      setAccessDeniedMsg(
        '⛔ Acesso Negado: A área administrativa é privada e restrita a administradores autorizados.'
      );
      return;
    }
    window.location.hash = 'admin';
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Voltar para Site
  const handleBackToSite = () => {
    window.location.hash = '';
    if (window.location.pathname.includes('admin')) {
      window.history.replaceState(null, '', '/');
    }
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logout Admin
  const handleLogoutAdmin = () => {
    authService.logout();
    setIsAdminAuth(false);
    handleBackToSite();
  };

  // Navegação suave por âncoras
  const handleNavigateToSection = (sectionId: string) => {
    if (isAdminView) {
      handleBackToSite();
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
  if (isAdminView) {
    // 1. Bloqueio estrito: Se não for administrador autenticado com role='admin', exige login
    if (!isAdminAuth || !authService.isAdmin()) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuth(true);
            setIsAdminView(true);
          }}
          onBackToSite={handleBackToSite}
        />
      );
    }


    // 2. Autenticado com role = 'admin' comprovada: carrega o painel administrativo
    return (
      <AdminLayout
        initialTab={adminTab}
        onGoToSite={handleBackToSite}
        onLogout={handleLogoutAdmin}
      />
    );
  }

  // --- SE FOR O SITE PÚBLICO DO CLIENTE ---
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-noir-900 selection:bg-gold-200">
      {/* Alerta de Acesso Negado ao /admin para Clientes */}
      {accessDeniedMsg && (
        <div className="bg-rose-600 text-white px-4 py-3 shadow-lg sticky top-0 z-50 animate-fade-in flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-300" />
            <span>{accessDeniedMsg}</span>
          </div>
          <button
            onClick={() => setAccessDeniedMsg(null)}
            className="p-1 hover:bg-rose-700 rounded-lg transition-colors shrink-0"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* BOTÃO FLUTUANTE DO WHATSAPP (com número oficial da Tamara Produções: +55 85 99867-2404) */}
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
            // Callback opcional de agendamento concluído
          }}
        />
      )}
    </div>
  );
};
