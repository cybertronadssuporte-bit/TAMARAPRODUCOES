import { Agendamento } from '../types';
import { storageService } from './storageService';

export const whatsappService = {
  /**
   * Formata a mensagem padrão enviada após o cliente realizar o agendamento
   */
  gerarMensagemConfirmacaoCliente(agendamento: Agendamento): string {
    const enderecoCompleto = `${agendamento.evento.endereco}, nº ${agendamento.evento.numero || 'S/N'}, ${agendamento.evento.bairro} - ${agendamento.evento.cidade}${
      agendamento.evento.pontoReferencia ? ` (Ref: ${agendamento.evento.pontoReferencia})` : ''
    }`;

    // Formatar data para DD/MM/AAAA
    const [ano, mes, dia] = agendamento.instalacao.data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Formatar valor em BRL
    const valorFormatado = agendamento.valorTotal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const nomeDecoracao = agendamento.produtoNome || agendamento.decoracaoNome || 'Decoração';
    const nomeTema = agendamento.temaNome || agendamento.evento.tipoEvento || 'Geral';

    return (
      `Olá! Meu nome é ${agendamento.cliente.nome}.\n\n` +
      `Acabei de realizar um agendamento pelo site.\n\n` +
      `🎨 Tema: ${nomeTema}\n` +
      `🎉 Decoração: ${nomeDecoracao}\n` +
      `📅 Data: ${dataFormatada}\n` +
      `⏰ Horário: ${agendamento.instalacao.horario}\n` +
      `📍 Local: ${enderecoCompleto}\n` +
      `💰 Valor: ${valorFormatado}\n` +
      `🔢 Pedido: ${agendamento.numeroPedido}\n\n` +
      `Gostaria de confirmar meu agendamento.`
    );
  },

  /**
   * Retorna o link para o cliente enviar a confirmação para a empresa via WhatsApp (+55 85 99867-2404)
   */
  getLinkConfirmacaoParaEmpresa(agendamento: Agendamento): string {
    const empresa = storageService.getEmpresaConfig();
    const mensagem = this.gerarMensagemConfirmacaoCliente(agendamento);
    const numeroLimpo = (empresa.whatsapp || '5585998672404').replace(/\D/g, '');
    return `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
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
