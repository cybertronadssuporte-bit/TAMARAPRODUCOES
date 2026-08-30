import React, { useState, useMemo } from 'react';
import { Users, Search, Send } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Agendamento } from '../../types';

export const AdminClients: React.FC = () => {
  const [agendamentos] = useState<Agendamento[]>(() => storageService.getAgendamentos());
  const [searchTerm, setSearchTerm] = useState('');

  // Agrupar clientes por WhatsApp/Email
  const clientsList = useMemo(() => {
    const map = new Map<
      string,
      {
        nome: string;
        whatsapp: string;
        email: string;
        cidade: string;
        totalPedidos: number;
        totalGasto: number;
        ultimoPedidoData: string;
      }
    >();

    agendamentos.forEach((ag) => {
      const key = ag.cliente.whatsapp || ag.cliente.email || ag.cliente.nome;
      if (!map.has(key)) {
        map.set(key, {
          nome: ag.cliente.nome,
          whatsapp: ag.cliente.whatsapp,
          email: ag.cliente.email,
          cidade: `${ag.evento.bairro}, ${ag.evento.cidade}`,
          totalPedidos: 1,
          totalGasto: ag.valorTotal || 0,
          ultimoPedidoData: ag.instalacao.data,
        });
      } else {
        const item = map.get(key)!;
        item.totalPedidos += 1;
        item.totalGasto += ag.valorTotal || 0;
        if (ag.instalacao.data > item.ultimoPedidoData) {
          item.ultimoPedidoData = ag.instalacao.data;
        }
      }
    });

    const list = Array.from(map.values());

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        c.whatsapp.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.cidade.toLowerCase().includes(term)
    );
  }, [agendamentos, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-gold-700" />
            <span>Base de Clientes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
            Gerenciamento de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Visualize o histórico de clientes que realizaram reservas e entre em contato direto.
          </p>
        </div>

        <span className="text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm self-start sm:self-auto">
          Total de Clientes: <strong className="text-noir-900">{clientsList.length}</strong>
        </span>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, WhatsApp, e-mail ou bairro..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 text-xs outline-none bg-gray-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Clientes Display: Cartões no Celular, Tabela no Desktop */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {clientsList.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <div>
            {/* Visualização em Cartões Mobile (< 768px) */}
            <div className="divide-y divide-gray-100 md:hidden">
              {clientsList.map((c, idx) => (
                <div key={idx} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-noir-950">{c.nome}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-gold-100 text-gold-900 font-bold text-[10px]">
                      {c.totalPedidos} {c.totalPedidos === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">WhatsApp:</span>
                      <strong className="text-noir-800">{c.whatsapp}</strong>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <span className="text-gray-400 font-medium">E-mail:</span>
                      <span className="truncate">{c.email}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <span className="text-gray-400 font-medium">Local:</span>
                      <span className="truncate">{c.cidade}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Gasto:</span>
                      <span className="font-bold text-xs text-gold-800">
                        {c.totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors min-h-[40px]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Conversar</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Visualização em Tabela Completa para Desktop (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">WhatsApp</th>
                    <th className="px-5 py-4">E-mail</th>
                    <th className="px-5 py-4">Localidade</th>
                    <th className="px-5 py-4">Reservas</th>
                    <th className="px-5 py-4">Total Investido</th>
                    <th className="px-5 py-4 text-right">Contato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {clientsList.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-noir-950">{c.nome}</td>
                      <td className="px-5 py-4 text-noir-800">{c.whatsapp}</td>
                      <td className="px-5 py-4 text-gray-600">{c.email}</td>
                      <td className="px-5 py-4 text-gray-600 truncate max-w-[200px]">{c.cidade}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-gold-100 text-gold-900 font-bold text-[11px]">
                          {c.totalPedidos} {c.totalPedidos === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-gold-800">
                        {c.totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                        >
                          <Send className="w-3 h-3" />
                          <span>Conversar</span>
                        </a>
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
