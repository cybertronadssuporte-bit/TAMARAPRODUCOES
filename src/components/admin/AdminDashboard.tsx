import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Package,
  Eye,
} from 'lucide-react';
import { Agendamento, Decoracao } from '../../types';

interface AdminDashboardProps {
  agendamentos: Agendamento[];
  decoracoes: Decoracao[];
  onNavigateTab: (tab: 'agendamentos' | 'decoracoes' | 'agenda') => void;
  onViewBooking: (agendamento: Agendamento) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  agendamentos,
  decoracoes,
  onNavigateTab,
  onViewBooking,
}) => {
  const hojeStr = new Date().toISOString().split('T')[0];

  // Métricas
  const totalAgendamentos = agendamentos.length;
  const decoracoesAtivas = decoracoes.filter((d) => d.ativo).length;
  const agendamentosHoje = agendamentos.filter((a) => a.instalacao.data === hojeStr && a.status !== 'cancelado').length;

  const pendentes = agendamentos.filter((a) => a.status === 'pendente').length;
  const confirmados = agendamentos.filter((a) => a.status === 'confirmado' || a.status === 'em_preparacao' || a.status === 'instalacao_realizada').length;
  const cancelados = agendamentos.filter((a) => a.status === 'cancelado').length;

  // Faturamento estimado (considerando não-cancelados)
  const faturamentoEstimado = agendamentos
    .filter((a) => a.status !== 'cancelado')
    .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

  // Próximas instalações ordenadas por data
  const proximasInstalacoes = [...agendamentos]
    .filter((a) => a.status !== 'cancelado')
    .sort((a, b) => a.instalacao.data.localeCompare(b.instalacao.data))
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Confirmado</span>;
      case 'em_preparacao':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Em Preparação</span>;
      case 'instalacao_realizada':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Realizada</span>;
      case 'cancelado':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Cancelado</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pendente</span>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-serif font-bold text-noir-950">
            Visão Geral do Negócio
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Acompanhe o desempenho de locações, faturamento e cronograma.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={() => onNavigateTab('agenda')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-gold-400 bg-white text-xs font-semibold text-noir-800 shadow-xs min-h-[42px]"
          >
            <Calendar className="w-4 h-4 text-gold-600" />
            <span>Ver Agenda</span>
          </button>
          <button
            onClick={() => onNavigateTab('agendamentos')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 text-xs font-bold uppercase tracking-wider shadow-xs min-h-[42px]"
          >
            <span>Gerenciar Pedidos</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total de Agendamentos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Total de Agendamentos
            </span>
            <p className="text-2xl font-serif font-bold text-noir-950 mt-0.5">
              {totalAgendamentos}
            </p>
            <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
              {decoracoesAtivas} decorações ativas no site
            </span>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Agendamentos de Hoje */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Instalações Hoje
            </span>
            <p className="text-2xl font-serif font-bold text-noir-950 mt-0.5">
              {agendamentosHoje}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              {agendamentosHoje > 0 ? 'Equipe em trânsito' : 'Nenhuma para hoje'}
            </span>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Agendamentos Confirmados & Pendentes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Status Operacional
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-serif font-bold text-emerald-600">{confirmados}</span>
              <span className="text-xs text-gray-400 font-medium">confirmados</span>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
              {pendentes} pendentes de aprovação
            </span>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Faturamento Estimado */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-noir-900 to-noir-850 text-white shadow-card flex items-center justify-between border border-gold-500/30">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gold-400 block">
              Faturamento Estimado
            </span>
            <p className="text-xl font-serif font-bold text-white mt-0.5">
              {faturamentoEstimado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {cancelados} cancelados desconsiderados
            </span>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gold-400/20 flex items-center justify-center text-gold-300 shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Próximas Instalações Table Preview */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-noir-950">
              Próximas Instalações Agendadas
            </h3>
            <p className="text-xs text-gray-500">
              Montagens programadas no cronograma
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('agendamentos')}
            className="text-xs font-bold text-gold-700 hover:text-gold-800 flex items-center gap-1 self-start xs:self-auto py-1 min-h-[36px]"
          >
            <span>Ver Todos</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {proximasInstalacoes.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Nenhuma instalação agendada no momento.
          </div>
        ) : (
          <div>
            {/* Visualização em Cartões no Mobile (< 768px) */}
            <div className="divide-y divide-gray-100 md:hidden">
              {proximasInstalacoes.map((ag) => (
                <div key={ag.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-gold-800">
                      {ag.numeroPedido}
                    </span>
                    {getStatusBadge(ag.status)}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-noir-950">
                      {ag.produtoNome || ag.decoracaoNome}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Cliente: <strong className="text-noir-800">{ag.cliente.nome}</strong> ({ag.cliente.whatsapp})
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-50">
                    <div>
                      <span>📅 {ag.instalacao.data.split('-').reverse().join('/')} às </span>
                      <strong className="text-gold-800">{ag.instalacao.horario}</strong>
                    </div>
                    <button
                      onClick={() => onViewBooking(ag)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-noir-800 hover:bg-gray-50 flex items-center gap-1 min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Visualização em Tabela Completa para Desktop (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5">Pedido</th>
                    <th className="px-6 py-3.5">Cliente</th>
                    <th className="px-6 py-3.5">Decoração</th>
                    <th className="px-6 py-3.5">Data & Horário</th>
                    <th className="px-6 py-3.5">Bairro / Cidade</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {proximasInstalacoes.map((ag) => (
                    <tr key={ag.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-noir-900">
                        {ag.numeroPedido}
                      </td>
                      <td className="px-6 py-4 text-noir-800">
                        <div className="font-semibold">{ag.cliente.nome}</div>
                        <div className="text-[11px] text-gray-500">{ag.cliente.whatsapp}</div>
                      </td>
                      <td className="px-6 py-4 text-noir-900 max-w-[200px] truncate">
                        {ag.produtoNome || ag.decoracaoNome}
                      </td>
                      <td className="px-6 py-4 text-noir-800">
                        <div className="font-semibold">
                          {ag.instalacao.data.split('-').reverse().join('/')}
                        </div>
                        <div className="text-[11px] text-gold-700 font-bold">
                          {ag.instalacao.horario}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {ag.evento.bairro} - {ag.evento.cidade}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ag.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onViewBooking(ag)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-gold-400 text-gray-600 hover:text-noir-950 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
