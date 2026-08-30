import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Send,
  X,
  MapPin,
  Clock,
  User,
} from 'lucide-react';
import { Agendamento, StatusAgendamento } from '../../types';
import { storageService } from '../../services/storageService';
import { whatsappService } from '../../services/whatsappService';

interface AdminBookingsProps {
  agendamentos: Agendamento[];
  onRefresh: () => void;
  selectedBookingDetail: Agendamento | null;
  onSelectBookingDetail: (agendamento: Agendamento | null) => void;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({
  agendamentos,
  onRefresh,
  selectedBookingDetail,
  onSelectBookingDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Filtragem
  const filteredList = useMemo(() => {
    return agendamentos.filter((a) => {
      // Filtro status
      if (statusFilter !== 'todos' && a.status !== statusFilter) {
        return false;
      }
      // Busca
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesPedido = a.numeroPedido.toLowerCase().includes(term);
        const matchesCliente = a.cliente.nome.toLowerCase().includes(term);
        const matchesWhats = a.cliente.whatsapp.toLowerCase().includes(term);
        const matchesDeco = (a.produtoNome || a.decoracaoNome || '').toLowerCase().includes(term);
        const matchesEnd = a.evento.endereco.toLowerCase().includes(term);
        const matchesBairro = a.evento.bairro.toLowerCase().includes(term);
        if (!matchesPedido && !matchesCliente && !matchesWhats && !matchesDeco && !matchesEnd && !matchesBairro) {
          return false;
        }
      }
      return true;
    });
  }, [agendamentos, statusFilter, searchTerm]);

  // Alteração de status pelo select
  const handleStatusChange = (id: string, newStatus: StatusAgendamento) => {
    storageService.updateAgendamentoStatus(id, newStatus);
    onRefresh();
  };

  const getStatusColor = (status: StatusAgendamento) => {
    switch (status) {
      case 'confirmado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'em_preparacao':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'instalacao_realizada':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cancelado':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-serif font-bold text-noir-950">
            Gerenciamento de Agendamentos
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Acompanhe pedidos, atualize status e comunique-se com os clientes.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-xs">
            Total listado: <strong className="text-noir-900">{filteredList.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cliente, pedido, whatsapp..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-xs outline-none bg-gray-50/50 focus:bg-white min-h-[44px]"
          />
        </div>

        <div className="sm:col-span-4 relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-xs outline-none bg-gray-50/50 focus:bg-white cursor-pointer appearance-none min-h-[44px]"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_preparacao">Em Preparação</option>
            <option value="instalacao_realizada">Instalação Realizada</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Bookings Display: Cartões no Celular, Tabela no Desktop */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-xs text-gray-500">
            Nenhum agendamento encontrado com os filtros aplicados.
          </div>
        ) : (
          <div>
            {/* Visualização em Cartões Mobile (< 768px) */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredList.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-gold-800">
                      {item.numeroPedido}
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as StatusAgendamento)}
                      className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border cursor-pointer outline-none ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="em_preparacao">Em Preparação</option>
                      <option value="instalacao_realizada">Instalação Realizada</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-noir-950">
                      {item.produtoNome || item.decoracaoNome}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Cliente: <strong className="text-noir-900">{item.cliente.nome}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Instalação:</span>
                      <span className="font-semibold text-noir-800">
                        {item.instalacao.data.split('-').reverse().join('/')} às {item.instalacao.horario}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Localidade:</span>
                      <span className="font-semibold text-noir-800 truncate block">
                        {item.evento.bairro} - {item.evento.cidade}
                      </span>
                    </div>
                  </div>

                  {/* Ações Mobile */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={whatsappService.getLinkContatoComCliente(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors min-h-[40px]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => onSelectBookingDetail(item)}
                      className="py-2 px-4 rounded-xl border border-gray-200 hover:border-gold-400 text-gray-700 font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px]"
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
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">Nº Pedido</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">WhatsApp</th>
                    <th className="px-5 py-4">Decoração</th>
                    <th className="px-5 py-4">Data</th>
                    <th className="px-5 py-4">Horário</th>
                    <th className="px-5 py-4">Endereço</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-noir-900 whitespace-nowrap">
                        {item.numeroPedido}
                      </td>
                      <td className="px-5 py-4 font-semibold text-noir-900 whitespace-nowrap">
                        {item.cliente.nome}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <a
                          href={whatsappService.getLinkContatoComCliente(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors"
                          title="Conversar no WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>{item.cliente.whatsapp}</span>
                        </a>
                      </td>
                      <td className="px-5 py-4 text-noir-800 max-w-[180px] truncate" title={item.produtoNome || item.decoracaoNome}>
                        {item.produtoNome || item.decoracaoNome}
                      </td>
                      <td className="px-5 py-4 text-noir-900 font-semibold whitespace-nowrap">
                        {item.instalacao.data.split('-').reverse().join('/')}
                      </td>
                      <td className="px-5 py-4 font-bold text-gold-700 whitespace-nowrap">
                        {item.instalacao.horario}
                      </td>
                      <td className="px-5 py-4 text-gray-600 max-w-[200px] truncate" title={`${item.evento.endereco}, ${item.evento.bairro} - ${item.evento.cidade}`}>
                        {item.evento.bairro}, {item.evento.cidade}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as StatusAgendamento)}
                          className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 border cursor-pointer outline-none ${getStatusColor(
                            item.status
                          )}`}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="em_preparacao">Em Preparação</option>
                          <option value="instalacao_realizada">Instalação Realizada</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectBookingDetail(item)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-gold-400 text-gray-600 hover:text-noir-950 transition-colors mr-1"
                          title="Ver Detalhes do Pedido"
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

      {/* Modal de Detalhes do Agendamento */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-noir-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-gold-300/40 space-y-4 sm:space-y-5 animate-slide-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-gold-700 block">
                  Detalhes do Pedido
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-noir-950">
                  {selectedBookingDetail.numeroPedido}
                </h3>
              </div>
              <button
                onClick={() => onSelectBookingDetail(null)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-noir-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informações detalhadas */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gold-50/60 border border-gold-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold-900">Decoração / Pacote:</span>
                <p className="text-sm font-serif font-bold text-noir-950">
                  {selectedBookingDetail.produtoNome || selectedBookingDetail.decoracaoNome}
                </p>
                <p className="text-xs text-gold-800 font-semibold">
                  Valor Total: {selectedBookingDetail.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-noir-900 font-semibold">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span>{selectedBookingDetail.cliente.nome}</span>
                </div>
                <div className="text-gray-600 pl-5 space-y-0.5">
                  <p>WhatsApp: {selectedBookingDetail.cliente.whatsapp}</p>
                  <p>E-mail: {selectedBookingDetail.cliente.email}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-noir-900 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>Instalação: {selectedBookingDetail.instalacao.data.split('-').reverse().join('/')} às {selectedBookingDetail.instalacao.horario}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600 pl-5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedBookingDetail.evento.endereco}, nº {selectedBookingDetail.evento.numero || 'S/N'} - {selectedBookingDetail.evento.bairro}, {selectedBookingDetail.evento.cidade}
                    {selectedBookingDetail.evento.pontoReferencia && ` (${selectedBookingDetail.evento.pontoReferencia})`}
                  </span>
                </div>
              </div>

              {selectedBookingDetail.evento.observacoes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  <strong>Observações do Cliente:</strong> {selectedBookingDetail.evento.observacoes}
                </div>
              )}
            </div>

            {/* Ações do Modal */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
              <a
                href={whatsappService.getLinkContatoComCliente(selectedBookingDetail)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase shadow-sm min-h-[44px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Conversar no WhatsApp</span>
              </a>

              <button
                onClick={() => onSelectBookingDetail(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 min-h-[40px]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
