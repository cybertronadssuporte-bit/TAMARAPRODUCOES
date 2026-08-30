import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Phone,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Produto, Agendamento, HorarioSlot } from '../types';
import { storageService } from '../services/storageService';
import { whatsappService } from '../services/whatsappService';

interface BookingWizardProps {
  decoracao: Produto;
  isOpen: boolean;
  onClose: () => void;
  onBookingCompleted: (novoAgendamento: Agendamento) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  decoracao,
  isOpen,
  onClose,
  onBookingCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Etapa 1: Dados do cliente
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Etapa 2: Dados do evento
  const [tipoEvento, setTipoEvento] = useState<string>(decoracao.temaNome || 'Aniversários');
  const [dataEvento, setDataEvento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState(() => storageService.getEmpresaConfig().cidadePadrao || 'Fortaleza');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Etapa 3: Agendamento da instalação
  const [dataInstalacao, setDataInstalacao] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioSlot[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Erros e submissão
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState<Agendamento | null>(null);

  const config = useMemo(() => storageService.getConfiguracoes(), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTipoEvento(decoracao.temaNome || 'Aniversários');
      setErrorMsg(null);
    }
  }, [isOpen, decoracao]);

  // Máscara WhatsApp
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length > 10) {
      val = val.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (val.length > 6) {
      val = val.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (val.length > 2) {
      val = val.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    setWhatsapp(val);
  };

  // Carregar horários dinamicamente ao mudar a data
  useEffect(() => {
    if (dataInstalacao) {
      setLoadingHorarios(true);
      setHorarioSelecionado('');
      setTimeout(() => {
        const slots = storageService.getHorariosDisponiveis(dataInstalacao);
        setHorariosDisponiveis(slots);
        setLoadingHorarios(false);
      }, 150);
    } else {
      setHorariosDisponiveis([]);
    }
  }, [dataInstalacao]);

  if (!isOpen) return null;

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const validateStep1 = () => {
    if (!nome.trim() || nome.trim().length < 3) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return false;
    }
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Por favor, informe um número de WhatsApp válido com DDD.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Por favor, informe um e-mail válido.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep2 = () => {
    if (!dataEvento) {
      setErrorMsg('Por favor, informe a data em que o evento acontecerá.');
      return false;
    }
    if (!endereco.trim() || endereco.length < 4) {
      setErrorMsg('Por favor, informe o endereço completo da rua/avenida.');
      return false;
    }
    if (!numero.trim()) {
      setErrorMsg('Por favor, informe o número do imóvel (ou "S/N").');
      return false;
    }
    if (!bairro.trim()) {
      setErrorMsg('Por favor, informe o bairro.');
      return false;
    }
    if (!cidade.trim()) {
      setErrorMsg('Por favor, informe a cidade.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep3 = () => {
    if (!dataInstalacao) {
      setErrorMsg('Por favor, selecione a data desejada para a instalação.');
      return false;
    }
    if (!horarioSelecionado) {
      setErrorMsg('Por favor, escolha um dos horários disponíveis para a instalação.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      if (!dataInstalacao && dataEvento) {
        setDataInstalacao(dataEvento);
      }
    } else if (currentStep === 2 && validateStep2()) {
      if (!dataInstalacao) {
        setDataInstalacao(dataEvento);
      }
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  // Submissão do agendamento — Persistência OBRIGATÓRIA no banco ANTES do WhatsApp
  const handleConfirmarAgendamento = () => {
    // Prevenção de cliques concorrentes / duplicados (Item 14)
    if (submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Verificação atômica de disponibilidade de horário no backend (Item 15)
      const disponivel = storageService.isHorarioDisponivel(dataInstalacao, horarioSelecionado);
      if (!disponivel) {
        setErrorMsg('⚠️ Este horário acabou de ser reservado. Escolha outro horário.');
        setSubmitting(false);
        return;
      }

      // 1. SALVAR NO BANCO DE DADOS (Registro Oficial do Pedido - Item 10 e 12)
      const novo = storageService.createAgendamento({
        temaId: decoracao.temaId,
        temaNome: decoracao.temaNome || tipoEvento,
        produtoId: decoracao.id,
        produtoNome: decoracao.nome,
        decoracaoId: decoracao.id,
        decoracaoNome: decoracao.nome,
        decoracaoPreco: decoracao.preco,
        cliente: {
          nome: nome.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
        },
        evento: {
          tipoEvento,
          dataEvento,
          endereco: endereco.trim(),
          numero: numero.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          pontoReferencia: pontoReferencia.trim(),
          observacoes: observacoes.trim(),
        },
        instalacao: {
          data: dataInstalacao,
          horario: horarioSelecionado,
        },
        valorTotal: decoracao.preco,
      });

      // 2. BANCO CONFIRMA: Gerar número do pedido e exibir Página de Confirmação (Item 13)
      setAgendamentoConfirmado(novo);
      setCurrentStep(5);
      onBookingCompleted(novo);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#C59B27', '#101622', '#22c55e', '#ffffff'],
        });
      } catch {
        // Fallback confetti
      }
    } catch (err: any) {
      setErrorMsg(err.message || '⚠️ Este horário acabou de ser reservado. Escolha outro horário.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatarDataExtenso = (dataStr: string) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const stepLabels = [
    'Seus Dados',
    'Local & Evento',
    'Data & Horário',
    'Confirmação',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-noir-950/80 backdrop-blur-md flex items-center justify-center p-2 xs:p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gold-300/50 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[94vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress Steps */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/80 shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="truncate">
                <h2 className="text-base sm:text-lg font-serif font-bold text-noir-950 leading-tight truncate">
                  Agendar Decoração
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                  <span className="font-semibold text-gold-800 uppercase mr-1">
                    {decoracao.temaNome}:
                  </span>
                  {decoracao.nome} —{' '}
                  <span className="font-semibold text-gold-700">
                    {decoracao.preco.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </p>
              </div>
            </div>

            {currentStep < 5 && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-noir-900 transition-colors shadow-xs shrink-0"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stepper Responsivo: Indicador Fluido no Celular, 4 Caixas no Desktop */}
          {currentStep < 5 && (
            <div>
              {/* Celular (< 640px) */}
              <div className="block sm:hidden space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-noir-800">
                  <span className="text-gold-800 font-bold">
                    Etapa {currentStep} de 4: {stepLabels[currentStep - 1]}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {Math.round((currentStep / 4) * 100)}%
                  </span>
                </div>
                {/* Barra de Progresso Suave */}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Desktop (sm+) */}
              <div className="hidden sm:grid sm:grid-cols-4 gap-2 pt-1">
                {[
                  { step: 1, label: '1. Seus Dados' },
                  { step: 2, label: '2. Local & Evento' },
                  { step: 3, label: '3. Data & Horário' },
                  { step: 4, label: '4. Confirmação' },
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  return (
                    <div
                      key={s.step}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                        isActive
                          ? 'border-gold-500 bg-gold-50/80 text-gold-900 shadow-xs'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                          : 'border-gray-200 bg-white text-gray-400 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          isActive
                            ? 'bg-gold-500 text-noir-950 font-bold'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted ? '✓' : s.step}
                      </div>
                      <span className="truncate">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 animate-fade-in shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex-1">
          {/* ETAPA 1 — DADOS DO CLIENTE */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="border-b border-gray-100 pb-2.5">
                <h3 className="text-sm sm:text-base font-serif font-bold text-noir-950">
                  Etapa 1: Dados de Contato
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Precisamos desses dados para validar o pedido e enviar o comprovante de reserva.
                </p>
              </div>

              {/* Nome: 100% largura */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Amanda Albuquerque Silva"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white transition-all min-h-[46px]"
                  />
                </div>
              </div>

              {/* WhatsApp e E-mail: 1 coluna no celular, 2 colunas a partir de sm: */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={handleWhatsappChange}
                      placeholder="(85) 99999-9999"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white transition-all min-h-[46px]"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Você receberá a confirmação por aqui.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    E-mail <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="amanda@exemplo.com.br"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white transition-all min-h-[46px]"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Para envio de contrato e recibo.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2 — DADOS DO EVENTO */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-gray-100 pb-2.5">
                <h3 className="text-sm sm:text-base font-serif font-bold text-noir-950">
                  Etapa 2: Local & Informações do Evento
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Informe o endereço detalhado onde faremos a instalação do cenário.
                </p>
              </div>

              {/* Tema e Data: 1 coluna no celular, 2 colunas no desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    Tema Escolhido
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={decoracao.temaNome || tipoEvento}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 text-sm font-semibold cursor-not-allowed min-h-[46px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    Data da Festa / Evento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={dataEvento}
                    onChange={(e) => setDataEvento(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white min-h-[46px]"
                  />
                </div>
              </div>

              {/* Endereço e Número: 1 coluna no celular, 9/3 no desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4">
                <div className="sm:col-span-8 md:col-span-9">
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    Endereço (Rua, Av.) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Av. Beira Mar, Rua Desembargador Moreira"
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white min-h-[46px]"
                  />
                </div>

                <div className="sm:col-span-4 md:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    Número <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ex: 1500 ou S/N"
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white min-h-[46px]"
                  />
                </div>
              </div>

              {/* Bairro e Cidade: 1 coluna no celular, 2 no desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    Bairro <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Aldeota / Meireles"
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white min-h-[46px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                    Cidade <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Fortaleza"
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white min-h-[46px]"
                  />
                </div>
              </div>

              {/* Ponto de Referência */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                  Ponto de Referência
                </label>
                <input
                  type="text"
                  value={pontoReferencia}
                  onChange={(e) => setPontoReferencia(e.target.value)}
                  placeholder="Ex: Ao lado da Praça Portugal / Condomínio Sol Poente"
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white min-h-[46px]"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-noir-800 mb-1.5">
                  Observações para a Equipe de Montagem
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Salão de festas no subsolo; montagem precisa ser finalizada até as 14h."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm outline-none bg-gray-50/40 focus:bg-white resize-none"
                />
              </div>
            </div>
          )}

          {/* ETAPA 3 — DATA & HORÁRIO DE INSTALAÇÃO */}
          {currentStep === 3 && (
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-2.5">
                <h3 className="text-sm sm:text-base font-serif font-bold text-noir-950">
                  Etapa 3: Quando faremos a montagem do cenário?
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Escolha o dia e selecione um dos horários disponíveis para a chegada da nossa equipe.
                </p>
              </div>

              {/* Seletor de Data */}
              <div className="bg-gray-50/80 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-noir-900 mb-2">
                  Escolha a Data da Instalação <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="w-5 h-5 text-gold-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    min={getMinDate()}
                    value={dataInstalacao}
                    onChange={(e) => setDataInstalacao(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 text-sm font-medium outline-none bg-white shadow-xs min-h-[46px]"
                  />
                </div>
                {dataInstalacao && (
                  <p className="text-xs text-gold-800 font-medium mt-2 capitalize flex items-center gap-1.5">
                    <span>📅</span>
                    <span>{formatarDataExtenso(dataInstalacao)}</span>
                  </p>
                )}
              </div>

              {/* Grid de Horários: 2 colunas no celular, 3 no desktop */}
              {dataInstalacao && (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-noir-900">
                      Horários Disponíveis:
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Duração média: {config.duracaoInstalacaoMinutos} min
                    </span>
                  </div>

                  {loadingHorarios ? (
                    <div className="py-8 text-center text-xs text-gray-500">
                      <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Consultando disponibilidade em tempo real...
                    </div>
                  ) : horariosDisponiveis.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      Não há horários de atendimento abertos para esta data. Por favor, selecione outro dia.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      {horariosDisponiveis.map((slot) => {
                        const isSelected = horarioSelecionado === slot.horario;
                        const isOccupied = !slot.disponivel;

                        return (
                          <button
                            key={slot.horario}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => {
                              if (slot.disponivel) {
                                setHorarioSelecionado(slot.horario);
                                setErrorMsg(null);
                              }
                            }}
                            className={`p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[64px] active:scale-98 ${
                              isSelected
                                ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-400 shadow-md'
                                : slot.disponivel
                                ? 'border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/70 hover:border-emerald-500 cursor-pointer shadow-xs'
                                : 'border-gray-200 bg-gray-100/90 text-gray-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-base sm:text-lg font-bold font-serif ${
                                  isSelected
                                    ? 'text-gold-900'
                                    : slot.disponivel
                                    ? 'text-noir-950'
                                    : 'text-gray-400'
                                }`}
                              >
                                {slot.horario}
                              </span>
                              <Clock
                                className={`w-3.5 h-3.5 ${
                                  isSelected
                                    ? 'text-gold-600'
                                    : slot.disponivel
                                    ? 'text-emerald-600'
                                    : 'text-gray-400'
                                }`}
                              />
                            </div>

                            <div className="mt-2">
                              {slot.disponivel ? (
                                <span
                                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${
                                    isSelected
                                      ? 'bg-gold-500 text-noir-950'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  DISPONÍVEL
                                </span>
                              ) : (
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 inline-block">
                                  INDISPONÍVEL
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ETAPA 4 — CONFIRMAÇÃO & RESUMO DO PEDIDO */}
          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="border-b border-gray-100 pb-2.5">
                <h3 className="text-sm sm:text-base font-serif font-bold text-noir-950">
                  Etapa 4: Revise os dados do seu agendamento
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Confira todas as informações antes de finalizar o pedido de agendamento.
                </p>
              </div>

              {/* Recibo do Pedido adaptável para mobile */}
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-gold-50/60 via-white to-gold-50/30 border border-gold-200/80 shadow-card space-y-3.5">
                <div className="flex items-center justify-between border-b border-gold-200/50 pb-2.5">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gold-900">
                    Resumo do Agendamento
                  </span>
                  <span className="text-[10px] sm:text-xs text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                    Horário Pré-Reservado
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  {/* TEMA */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">TEMA:</span>
                    <span className="font-semibold text-noir-950 xs:text-right uppercase">
                      {decoracao.temaNome || tipoEvento}
                    </span>
                  </div>

                  {/* DECORAÇÃO */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">DECORAÇÃO:</span>
                    <span className="font-semibold text-noir-950 xs:text-right">
                      {decoracao.nome}
                    </span>
                  </div>

                  {/* VALOR */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">VALOR:</span>
                    <span className="font-bold text-gold-800 xs:text-right text-sm sm:text-base">
                      {decoracao.preco.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>

                  {/* DATA */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">DATA:</span>
                    <span className="font-semibold text-noir-950 xs:text-right capitalize">
                      {formatarDataExtenso(dataInstalacao)}
                    </span>
                  </div>

                  {/* HORÁRIO */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">HORÁRIO:</span>
                    <span className="font-bold text-noir-950 xs:text-right">
                      {horarioSelecionado}
                    </span>
                  </div>

                  {/* CLIENTE */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">CLIENTE:</span>
                    <span className="font-semibold text-noir-950 xs:text-right">{nome}</span>
                  </div>

                  {/* WHATSAPP */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">WHATSAPP:</span>
                    <span className="font-semibold text-noir-950 xs:text-right">{whatsapp}</span>
                  </div>

                  {/* LOCAL */}
                  <div className="flex flex-col xs:flex-row xs:justify-between py-1 border-b border-gray-100 gap-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">LOCAL:</span>
                    <span className="font-medium text-noir-800 xs:text-right text-xs max-w-sm break-words">
                      {endereco}, nº {numero} - {bairro}, {cidade}
                      {pontoReferencia ? ` (Ref: ${pontoReferencia})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 text-center leading-relaxed">
                Ao clicar em "Confirmar Agendamento", seu horário será bloqueado no sistema e o pedido registrado com sucesso.
              </p>
            </div>
          )}

          {/* ETAPA 5 — PÁGINA DE CONFIRMAÇÃO OFICIAL & WHATSAPP (Item 13) */}
          {currentStep === 5 && agendamentoConfirmado && (
            <div className="py-2 sm:py-4 text-center space-y-4 sm:space-y-6 animate-fade-in">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>

              <div>
                <h3 className="text-xl xs:text-2xl sm:text-3xl font-serif font-bold text-noir-950 leading-tight uppercase tracking-tight">
                  🎉 PEDIDO REALIZADO COM SUCESSO!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 font-semibold mt-2 max-w-md mx-auto leading-relaxed">
                  Seu pedido já foi registrado em nosso sistema.
                </p>
              </div>

              {/* Recibo Oficial do Pedido */}
              <div className="max-w-md mx-auto p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 text-left space-y-3 text-xs shadow-md">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">Número do pedido:</span>
                  <span className="font-mono font-bold text-gold-800 text-base">
                    {agendamentoConfirmado.numeroPedido}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Tema:</span>
                  <span className="font-bold text-noir-900 uppercase">
                    {agendamentoConfirmado.temaNome}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Decoração:</span>
                  <span className="font-bold text-noir-900">
                    {agendamentoConfirmado.produtoNome}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Data:</span>
                  <span className="font-bold text-noir-900">
                    {(() => {
                      const [ano, mes, dia] = agendamentoConfirmado.instalacao.data.split('-');
                      return `${dia}/${mes}/${ano}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Horário:</span>
                  <span className="font-bold text-noir-900">
                    {agendamentoConfirmado.instalacao.horario}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                  <span className="text-gray-500 font-medium">Valor:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    R$ {(agendamentoConfirmado.valorTotal || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 max-w-md mx-auto space-y-2.5">
                <a
                  href={whatsappService.getLinkConfirmacaoParaEmpresa(agendamentoConfirmado)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[50px] py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>CONFIRMAR PELO WHATSAPP</span>
                </a>


                <button
                  onClick={onClose}
                  className="w-full min-h-[44px] py-3 px-6 rounded-2xl border border-gray-300 hover:border-noir-900 text-noir-800 hover:text-noir-950 font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  VOLTAR PARA O SITE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {currentStep < 5 && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="min-h-[44px] flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-noir-900 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                disabled={submitting}
                className="min-h-[44px] text-xs font-semibold text-gray-500 hover:text-noir-900 px-3 py-2 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="min-h-[44px] flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-xs active:scale-98 transition-all"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirmarAgendamento}
                disabled={submitting}
                className="min-h-[48px] flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider shadow-luxury active:scale-98 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Registrando pedido...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRMAR PEDIDO</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

};
