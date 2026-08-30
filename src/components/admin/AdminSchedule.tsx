import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Settings,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import { Agendamento, ConfiguracoesAgenda } from '../../types';
import { storageService } from '../../services/storageService';

interface AdminScheduleProps {
  agendamentos: Agendamento[];
  onRefresh: () => void;
}

export const AdminSchedule: React.FC<AdminScheduleProps> = ({ agendamentos, onRefresh }) => {
  const [config, setConfig] = useState<ConfiguracoesAgenda>(storageService.getConfiguracoes());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Data selecionada no calendário
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Modo de visualização: mensal, semanal, diária
  const [viewMode, setViewMode] = useState<'mensal' | 'semanal' | 'diaria'>('mensal');

  // Mês e ano do calendário
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  // Horários calculados para a data selecionada
  const slotsData = useMemo(() => {
    return storageService.getHorariosDisponiveis(selectedDate);
  }, [selectedDate, config, agendamentos]);

  // Agendamentos na data selecionada
  const agendamentosNaData = useMemo(() => {
    return agendamentos.filter((a) => a.instalacao.data === selectedDate && a.status !== 'cancelado');
  }, [selectedDate, agendamentos]);

  // Checagem se a data inteira está bloqueada
  const isDataBloqueada = config.datasBloqueadas.includes(selectedDate);

  // Ações de bloqueio/liberação de data
  const handleToggleBloqueioData = () => {
    if (isDataBloqueada) {
      storageService.liberarData(selectedDate);
    } else {
      storageService.bloquearData(selectedDate);
    }
    setConfig(storageService.getConfiguracoes());
    onRefresh();
  };

  // Ações de bloqueio/liberação de horário
  const handleToggleBloqueioHorario = (horario: string, currentlyBlocked: boolean) => {
    if (currentlyBlocked) {
      storageService.liberarHorario(selectedDate, horario);
    } else {
      storageService.bloquearHorario(selectedDate, horario);
    }
    setConfig(storageService.getConfiguracoes());
    onRefresh();
  };

  // Salvar configurações gerais da agenda
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveConfiguracoes(config);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
    onRefresh();
  };

  // Navegação de mês
  const handlePrevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  // Geração da grade de dias do mês
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Dias em branco do início
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Dias do mês
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  }, [currentMonthDate]);

  const monthName = currentMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-noir-950">
            Gerenciador da Agenda & Disponibilidade
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Bloqueie datas comemorativas, pause horários específicos e configure slots de atendimento.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm self-start sm:self-auto">
          {(['mensal', 'semanal', 'diaria'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                viewMode === mode
                  ? 'bg-noir-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-noir-900'
              }`}
            >
              {mode === 'diaria' ? 'Diária' : mode === 'semanal' ? 'Semanal' : 'Mensal'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Calendar */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          {/* Calendar Month Selector */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-noir-950 capitalize">
              {monthName}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-11 xs:h-13 sm:h-16 rounded-xl bg-gray-50/50" />;
              }

              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isSelected = selectedDate === dateStr;
              const isBlocked = config.datasBloqueadas.includes(dateStr);
              const bookingsCount = agendamentos.filter(
                (a) => a.instalacao.data === dateStr && a.status !== 'cancelado'
              ).length;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-11 xs:h-13 sm:h-16 rounded-xl sm:rounded-2xl p-1 sm:p-2 border flex flex-col justify-between items-start transition-all relative ${
                    isSelected
                      ? 'border-gold-500 bg-gold-50/80 ring-2 ring-gold-400 shadow-md'
                      : isBlocked
                      ? 'border-rose-200 bg-rose-50/40 opacity-75'
                      : bookingsCount > 0
                      ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-500'
                      : 'border-gray-200 hover:border-gold-300 hover:bg-gold-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-xs font-bold ${
                        isSelected ? 'text-gold-900' : 'text-noir-900'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isBlocked && (
                      <span title="Data Bloqueada">
                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-600" />
                      </span>
                    )}
                  </div>

                  {bookingsCount > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-bold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 leading-none">
                      <span className="hidden sm:inline">{bookingsCount} inst.</span>
                      <span className="sm:hidden">{bookingsCount}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" />
              <span>Com agendamentos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-rose-100 border border-rose-400" />
              <span>Data bloqueada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gold-100 border border-gold-400" />
              <span>Selecionada</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Date Controls (Bloqueios e Slots) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-gold-700 block">
                  Data Selecionada
                </span>
                <h4 className="text-lg font-serif font-bold text-noir-950 capitalize">
                  {selectedDate.split('-').reverse().join('/')}
                </h4>
              </div>

              {/* Botão de Bloquear / Liberar Data Inteira */}
              <button
                onClick={handleToggleBloqueioData}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm ${
                  isDataBloqueada
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isDataBloqueada ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Liberar Data</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Bloquear Data</span>
                  </>
                )}
              </button>
            </div>

            {/* Agendamentos confirmados neste dia */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Instalações Marcadas ({agendamentosNaData.length})
              </h5>
              {agendamentosNaData.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">
                  Nenhuma instalação marcada para este dia.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agendamentosNaData.map((ag) => (
                    <div
                      key={ag.id}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-gold-800">{ag.instalacao.horario}</span>
                        <span className="mx-1.5 text-gray-300">|</span>
                        <span className="font-semibold text-noir-900">{ag.cliente.nome}</span>
                        <p className="text-[11px] text-gray-500">{ag.decoracaoNome}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        {ag.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slots de Horário: Bloquear / Liberar Individualmente */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-noir-900">
                  Horários do Dia (Controle de Slots)
                </h5>
                <span className="text-[11px] text-gray-500">Clique para bloquear</span>
              </div>

              {isDataBloqueada ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  Esta data está inteiramente bloqueada. Todos os horários estão inacessíveis para os clientes.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {slotsData.map((slot) => {
                    const isManualBlocked = slot.motivo === 'bloqueado_admin';
                    const isBooked = slot.motivo === 'ocupado_agendamento';

                    return (
                      <div
                        key={slot.horario}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isBooked
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : isManualBlocked
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-sm">{slot.horario}</span>
                          <span className="block text-[10px] uppercase font-bold mt-0.5">
                            {isBooked ? 'Ocupado' : isManualBlocked ? 'Bloqueado' : 'Livre'}
                          </span>
                        </div>

                        {!isBooked && (
                          <button
                            onClick={() =>
                              handleToggleBloqueioHorario(slot.horario, isManualBlocked)
                            }
                            className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                              isManualBlocked
                                ? 'bg-white text-rose-600 hover:bg-rose-100'
                                : 'bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300'
                            }`}
                            title={isManualBlocked ? 'Desbloquear Horário' : 'Bloquear Horário'}
                          >
                            {isManualBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Configurações Gerais da Agenda */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Settings className="w-4 h-4 text-gold-600" />
              <h4 className="text-sm font-serif font-bold text-noir-950">
                Parâmetros Globais de Atendimento
              </h4>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configurações da agenda salvas com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Horário Inicial
                  </label>
                  <input
                    type="time"
                    value={config.horarioInicial}
                    onChange={(e) => setConfig({ ...config, horarioInicial: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Horário Final
                  </label>
                  <input
                    type="time"
                    value={config.horarioFinal}
                    onChange={(e) => setConfig({ ...config, horarioFinal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Duração da Instalação (min)
                  </label>
                  <input
                    type="number"
                    value={config.duracaoInstalacaoMinutos}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        duracaoInstalacaoMinutos: parseInt(e.target.value) || 120,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Intervalo Entre Montagens (min)
                  </label>
                  <input
                    type="number"
                    value={config.intervaloMinutos}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        intervaloMinutos: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              {/* Dias de Funcionamento */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1.5">
                  Dias de Funcionamento da Equipe
                </label>
                <div className="flex gap-1.5">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((diaLabel, diaIdx) => {
                    const isChecked = config.diasFuncionamento.includes(diaIdx);
                    return (
                      <button
                        key={diaIdx}
                        type="button"
                        onClick={() => {
                          const novos = isChecked
                            ? config.diasFuncionamento.filter((d) => d !== diaIdx)
                            : [...config.diasFuncionamento, diaIdx];
                          setConfig({ ...config, diasFuncionamento: novos });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          isChecked
                            ? 'bg-gold-500 text-noir-950 shadow-sm'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {diaLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 rounded-xl bg-noir-900 hover:bg-noir-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5 text-gold-400" />
                <span>Salvar Configurações da Agenda</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
