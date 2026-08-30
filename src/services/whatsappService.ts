import { Agendamento } from '../types';
import { storageService } from './storageService';

export const whatsappService = {
  /**
   * Formata a mensagem oficial com base no modelo exigido da Tamara Produções
   * Construída em UTF-8 puro para preservar rigorosamente emojis, acentos e quebras de linha.
   */
  gerarMensagemConfirmacaoCliente(agendamento: Agendamento): string {
    let nomeDecoracao = (agendamento.produtoNome || agendamento.decoracaoNome || 'Decoração').trim();
    if (nomeDecoracao.toLowerCase().includes('homem-aranha') && !nomeDecoracao.includes('🕷️')) {
      nomeDecoracao = `🕷️ ${nomeDecoracao}`;
    }

    const nomeTema = agendamento.temaNome || 'Aniversários';

    // Formatar data do evento (DD/MM/AAAA)
    const rawDataEvento = agendamento.evento.dataEvento || agendamento.instalacao.data;
    const [anoEv, mesEv, diaEv] = rawDataEvento.split('-');
    const dataEventoFormatada = `${diaEv}/${mesEv}/${anoEv}`;

    // Formatar data de instalação (DD/MM/AAAA)
    const [anoInst, mesInst, diaInst] = agendamento.instalacao.data.split('-');
    const dataInstalacaoFormatada = `${diaInst}/${mesInst}/${anoInst}`;

    // Formatar valor em BRL com espaço ASCII padrão (evita non-breaking space do toLocaleString)
    const valorNum = (agendamento.valorTotal || 0).toFixed(2).replace('.', ',');
    const valorFormatado = `R$ ${valorNum}`;

    // Formatar endereço limpo e elegante
    const endRaw = agendamento.evento.endereco.trim();
    const numRaw = (agendamento.evento.numero || '').trim();
    const enderecoLinha = numRaw && !endRaw.includes(numRaw)
      ? `${endRaw}, ${numRaw}`
      : endRaw;

    const bairroRaw = (agendamento.evento.bairro || '').trim();
    const bairroLinha = bairroRaw.toLowerCase().startsWith('bairro')
      ? bairroRaw
      : `Bairro ${bairroRaw}`;

    const cidadeLinha = (agendamento.evento.cidade || '').trim();

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
      `${enderecoLinha}\n` +
      `${bairroLinha}\n` +
      `${cidadeLinha}\n\n` +
      `📝 Observações:\n` +
      `${obs}\n\n` +
      `Gostaria de confirmar meu pedido.`
    );
  },

  /**
   * Retorna o link oficial codificado do WhatsApp da Tamara Produções (+55 85 99867-2404)
   * A mensagem é codificada diretamente em UTF-8 com encodeURIComponent
   */
  getLinkConfirmacaoParaEmpresa(agendamento: Agendamento): string {
    const mensagem = this.gerarMensagemConfirmacaoCliente(agendamento);
    const numeroOficial = '5585998672404';
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
