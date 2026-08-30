import { Agendamento } from '../types';
import { storageService } from './storageService';

export const whatsappService = {
  /**
   * Formata a mensagem oficial com base no modelo exigido da Tamara Produções
   */
  gerarMensagemConfirmacaoCliente(agendamento: Agendamento): string {
    const nomeDecoracao = agendamento.produtoNome || agendamento.decoracaoNome || 'Decoração';
    const nomeTema = agendamento.temaNome || 'Geral';

    // Formatar data do evento (DD/MM/AAAA)
    const [anoEv, mesEv, diaEv] = (agendamento.evento.dataEvento || agendamento.instalacao.data).split('-');
    const dataEventoFormatada = `${diaEv}/${mesEv}/${anoEv}`;

    // Formatar data de instalação (DD/MM/AAAA)
    const [anoInst, mesInst, diaInst] = agendamento.instalacao.data.split('-');
    const dataInstalacaoFormatada = `${diaInst}/${mesInst}/${anoInst}`;

    // Formatar valor em BRL
    const valorFormatado = (agendamento.valorTotal || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const obs = agendamento.evento.observacoes?.trim()
      ? agendamento.evento.observacoes.trim()
      : 'Nenhuma observação informada.';

    return (
      `Olá! 👋 Acabei de realizar um pedido pelo site da Tamara Produções.\n\n` +
      `📋 PEDIDO: ${agendamento.numeroPedido}\n\n` +
      `🎨 Tema: ${nomeTema}\n` +
      `🎉 Decoração: ${nomeDecoracao}\n` +
      `💰 Valor: ${valorFormatado}\n\n` +
      `📅 Data do evento: ${dataEventoFormatada}\n` +
      `🗓️ Data da instalação: ${dataInstalacaoFormatada}\n` +
      `⏰ Horário: ${agendamento.instalacao.horario}\n\n` +
      `👤 Cliente: ${agendamento.cliente.nome}\n` +
      `📱 WhatsApp: ${agendamento.cliente.whatsapp}\n\n` +
      `📍 Endereço:\n` +
      `${agendamento.evento.endereco}, ${agendamento.evento.numero || 'S/N'}\n` +
      `Bairro ${agendamento.evento.bairro}\n` +
      `${agendamento.evento.cidade}\n\n` +
      `📝 Observações:\n` +
      `${obs}\n\n` +
      `Gostaria de confirmar meu pedido.`
    );
  },

  /**
   * Retorna o link oficial codificado do WhatsApp da Tamara Produções (+55 85 99867-2404)
   */
  getLinkConfirmacaoParaEmpresa(agendamento: Agendamento): string {
    const empresa = storageService.getEmpresaConfig();
    const mensagem = this.gerarMensagemConfirmacaoCliente(agendamento);
    const numeroLimpo = (empresa.whatsapp || '5585998672404').replace(/\D/g, '');
    const numeroOficial = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    return `https://wa.me/${numeroOficial}?text=${encodeURIComponent(mensagem)}`;
  },

  /**
   * Abre o WhatsApp de maneira inteligente conforme o dispositivo (mobile / desktop)
   */
  abrirWhatsAppConfirmacao(agendamento: Agendamento): void {
    const link = this.getLinkConfirmacaoParaEmpresa(agendamento);
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  },

  /**
   * Link para o administrador enviar mensagem direta ao cliente
   */
  getLinkContatoComCliente(agendamento: Agendamento): string {
    const empresa = storageService.getEmpresaConfig();
    const numeroLimpo = agendamento.cliente.whatsapp.replace(/\D/g, '');
    const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    const texto = `Olá ${agendamento.cliente.nome}, aqui é da equipe ${empresa.nome}. Estamos entrando em contato referente ao seu agendamento ${agendamento.numeroPedido} (${agendamento.produtoNome || agendamento.decoracaoNome}).`;
    return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(texto)}`;
  },
};
