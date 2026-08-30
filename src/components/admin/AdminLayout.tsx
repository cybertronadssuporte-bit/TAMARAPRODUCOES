import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Palette,
  Calendar,
  Users,
  Building,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminBookings } from './AdminBookings';
import { AdminThemesProducts } from './AdminThemesProducts';
import { AdminSchedule } from './AdminSchedule';
import { AdminClients } from './AdminClients';
import { AdminCompanyIdentity } from './AdminCompanyIdentity';
import { AdminMyAccount } from './AdminMyAccount';
import { AdminSecurity } from './AdminSecurity';
import { storageService } from '../../services/storageService';
import { EmpresaConfig, Agendamento, Decoracao } from '../../types';
import { StorageImage } from '../common/StorageImage';

interface AdminLayoutProps {
  onLogout: () => void;
  onGoToSite: () => void;
}

export type AdminTab =
  | 'dashboard'
  | 'agendamentos'
  | 'temas'
  | 'calendario'
  | 'clientes'
  | 'identidade'
  | 'conta'
  | 'seguranca';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout, onGoToSite }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [empresa, setEmpresa] = useState<EmpresaConfig>(() => storageService.getEmpresaConfig());
  const [pendingCount, setPendingCount] = useState(0);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => storageService.getAgendamentos());
  const [decoracoes, setDecoracoes] = useState<Decoracao[]>(() => storageService.getDecoracoes());
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Agendamento | null>(null);

  const refreshCounters = () => {
    setEmpresa(storageService.getEmpresaConfig());
    const ags = storageService.getAgendamentos();
    setAgendamentos(ags);
    setDecoracoes(storageService.getDecoracoes());
    setPendingCount(ags.filter((a) => a.status === 'pendente').length);
  };

  useEffect(() => {
    refreshCounters();
    const handleEmpresa = () => setEmpresa(storageService.getEmpresaConfig());
    window.addEventListener('empresa_updated', handleEmpresa);
    return () => window.removeEventListener('empresa_updated', handleEmpresa);
  }, []);

  // Menu ordenado conforme solicitado
  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'agendamentos' as AdminTab, label: 'Agendamentos', icon: CalendarDays, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'temas' as AdminTab, label: 'Temas & Produtos', icon: Palette, badge: null },
    { id: 'calendario' as AdminTab, label: 'Calendário', icon: Calendar, badge: null },
    { id: 'clientes' as AdminTab, label: 'Clientes', icon: Users, badge: null },
    { id: 'identidade' as AdminTab, label: 'Identidade da Empresa', icon: Building, badge: null },
    { id: 'conta' as AdminTab, label: 'Minha Conta', icon: User, badge: null },
    { id: 'seguranca' as AdminTab, label: 'Segurança', icon: ShieldCheck, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-noir-950 text-white px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {empresa.logoUrl ? (
            <div className="h-8 w-auto max-w-[90px] flex items-center shrink-0">
              <StorageImage src={empresa.logoUrl} alt={empresa.nome} className="max-h-8 w-auto object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center text-noir-950 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <span className="font-serif font-bold text-xs xs:text-sm tracking-tight uppercase truncate">
            {empresa.nome}
          </span>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-gray-300 hover:text-white rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={mobileSidebarOpen ? 'Fechar navegação' : 'Abrir navegação'}
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop escuro no celular quando o menu estiver aberto */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 max-w-[85vw] bg-noir-950 text-white flex flex-col justify-between border-r border-white/10 z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {empresa.logoUrl ? (
                <div className="h-9 sm:h-10 w-auto max-w-[110px] flex items-center shrink-0">
                  <StorageImage src={empresa.logoUrl} alt={empresa.nome} className="max-h-9 sm:max-h-10 w-auto object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-300 flex items-center justify-center text-noir-950 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
              <div className="truncate">
                <span className="font-serif text-sm sm:text-base font-bold text-white block uppercase truncate">
                  {empresa.nome}
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-gold-400 uppercase font-semibold block">
                  Painel Administrativo
                </span>
              </div>
            </div>

            {/* Fechar botão no mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-noir-950 shadow-md font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-noir-950' : 'text-gold-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-noir-950 text-gold-400'
                          : 'bg-gold-500 text-noir-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-2 shrink-0">
          <button
            onClick={onGoToSite}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Ver Site Público</span>
          </button>

          {/* Sair */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>🚪 Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-3.5 xs:p-5 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl w-full min-w-0">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            agendamentos={agendamentos}
            decoracoes={decoracoes}
            onNavigateTab={(tab) => {
              if (tab === 'decoracoes') setActiveTab('temas');
              else if (tab === 'agenda') setActiveTab('calendario');
              else setActiveTab(tab);
            }}
            onViewBooking={(ag) => {
              setSelectedBookingDetail(ag);
              setActiveTab('agendamentos');
            }}
          />
        )}
        {activeTab === 'agendamentos' && (
          <AdminBookings
            agendamentos={agendamentos}
            onRefresh={refreshCounters}
            selectedBookingDetail={selectedBookingDetail}
            onSelectBookingDetail={setSelectedBookingDetail}
          />
        )}
        {activeTab === 'temas' && <AdminThemesProducts onRefresh={refreshCounters} />}
        {activeTab === 'calendario' && (
          <AdminSchedule
            agendamentos={agendamentos}
            onRefresh={refreshCounters}
          />
        )}
        {activeTab === 'clientes' && <AdminClients />}
        {activeTab === 'identidade' && <AdminCompanyIdentity onRefresh={refreshCounters} />}
        {activeTab === 'conta' && <AdminMyAccount onRefresh={refreshCounters} />}
        {activeTab === 'seguranca' && <AdminSecurity onRefresh={refreshCounters} />}
      </main>
    </div>
  );
};
