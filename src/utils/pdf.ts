import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Empresa, Pedido, OrdemServico, Venda, Cliente } from '@/types';
import { formatCurrency, formatDate, formatDateTime, getFormaPagamentoLabel, getPedidoStatusLabel, getOSStatusLabel } from './formatters';

const baseStyle = `
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size:12px; color:#333; padding:20px; }
    h1 { font-size:20px; color:#1e40af; margin-bottom:4px; }
    h2 { font-size:14px; color:#374151; margin:16px 0 8px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid #1e40af; }
    .empresa-info { }
    .empresa-nome { font-size:18px; font-weight:bold; color:#1e40af; }
    .doc-info { text-align:right; }
    .doc-numero { font-size:16px; font-weight:bold; }
    .doc-data { color:#6b7280; font-size:11px; }
    .section { margin-bottom:16px; padding:12px; background:#f9fafb; border-radius:6px; }
    .section-label { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; }
    .section-value { font-size:13px; font-weight:600; margin-top:2px; }
    table { width:100%; border-collapse:collapse; margin-top:8px; }
    th { background:#1e40af; color:white; padding:8px; text-align:left; font-size:11px; }
    td { padding:7px 8px; border-bottom:1px solid #e5e7eb; font-size:11px; }
    tr:nth-child(even) td { background:#f3f4f6; }
    .total-row td { font-weight:bold; background:#dbeafe !important; font-size:13px; }
    .status-badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; }
    .footer { margin-top:30px; padding-top:12px; border-top:1px solid #e5e7eb; text-align:center; color:#9ca3af; font-size:10px; }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .obs { margin-top:12px; padding:10px; border:1px solid #e5e7eb; border-radius:6px; }
    .obs-label { font-size:10px; color:#6b7280; margin-bottom:4px; }
    .assinatura { display:flex; justify-content:space-around; margin-top:40px; }
    .assinatura-linha { width:200px; border-top:1px solid #374151; text-align:center; padding-top:4px; font-size:10px; color:#6b7280; }
  </style>
`;

function headerEmpresa(empresa: Empresa, titulo: string, numero: string | number, data: string): string {
  return `
    <div class="header">
      <div class="empresa-info">
        <div class="empresa-nome">${empresa.nome}</div>
        ${empresa.cnpj ? `<div>CNPJ: ${empresa.cnpj}</div>` : ''}
        ${empresa.endereco ? `<div>${empresa.endereco}</div>` : ''}
        ${empresa.telefone ? `<div>Tel: ${empresa.telefone}</div>` : ''}
        ${empresa.email ? `<div>${empresa.email}</div>` : ''}
      </div>
      <div class="doc-info">
        <div style="font-size:14px;font-weight:bold;color:#1e40af;">${titulo}</div>
        <div class="doc-numero">#${String(numero).padStart(5, '0')}</div>
        <div class="doc-data">${data}</div>
      </div>
    </div>
  `;
}

export async function gerarPDFOrcamentoPedido(
  empresa: Empresa,
  pedido: Pedido,
  clienteInfo?: Cliente | null
): Promise<string> {
  const itens = pedido.itens ?? [];
  const linhasItens = itens.map(item => `
    <tr>
      <td>${item.descricao}</td>
      <td style="text-align:center">${item.quantidade}</td>
      <td style="text-align:right">${formatCurrency(item.preco_unitario)}</td>
      <td style="text-align:right">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    ${headerEmpresa(empresa, pedido.status === 'orcamento' ? 'ORÇAMENTO' : 'PEDIDO', pedido.id, formatDateTime(pedido.criado_em))}

    <div class="grid-2">
      <div class="section">
        <div class="section-label">Cliente</div>
        <div class="section-value">${pedido.cliente_nome ?? clienteInfo?.nome ?? 'Não informado'}</div>
        ${clienteInfo?.telefone ? `<div>${clienteInfo.telefone}</div>` : ''}
        ${clienteInfo?.cpf_cnpj ? `<div>CPF/CNPJ: ${clienteInfo.cpf_cnpj}</div>` : ''}
      </div>
      <div class="section">
        <div class="section-label">Status</div>
        <div class="section-value">${getPedidoStatusLabel(pedido.status)}</div>
      </div>
    </div>

    <h2>Itens</h2>
    <table>
      <thead><tr><th>Descrição</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>
        ${linhasItens}
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td style="text-align:right">${formatCurrency(pedido.total)}</td>
        </tr>
      </tbody>
    </table>

    ${pedido.observacoes ? `<div class="obs"><div class="obs-label">Observações</div><div>${pedido.observacoes}</div></div>` : ''}

    <div class="assinatura">
      <div class="assinatura-linha">Assinatura do Cliente</div>
      <div class="assinatura-linha">${empresa.nome}</div>
    </div>

    <div class="footer">Documento gerado em ${formatDateTime(new Date().toISOString())} • ${empresa.nome}</div>
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function gerarPDFOrdemServico(
  empresa: Empresa,
  os: OrdemServico,
  clienteInfo?: Cliente | null
): Promise<string> {
  const pecas = os.pecas ?? [];
  const linhasPecas = pecas.map(p => `
    <tr>
      <td>${p.descricao}</td>
      <td style="text-align:center">${p.quantidade}</td>
      <td style="text-align:right">${formatCurrency(p.preco_unitario)}</td>
      <td style="text-align:right">${formatCurrency(p.subtotal)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    ${headerEmpresa(empresa, 'ORDEM DE SERVIÇO', os.id, formatDateTime(os.criado_em))}

    <div class="grid-2">
      <div class="section">
        <div class="section-label">Cliente</div>
        <div class="section-value">${os.cliente_nome ?? clienteInfo?.nome ?? 'Não informado'}</div>
        ${clienteInfo?.telefone ? `<div>${clienteInfo.telefone}</div>` : ''}
      </div>
      <div class="section">
        <div class="section-label">Status</div>
        <div class="section-value">${getOSStatusLabel(os.status)}</div>
        ${os.data_prevista ? `<div>Previsão: ${formatDate(os.data_prevista)}</div>` : ''}
      </div>
    </div>

    <div class="grid-2">
      <div class="section">
        <div class="section-label">Equipamento</div>
        <div class="section-value">${os.equipamento ?? '-'}</div>
      </div>
      <div class="section">
        <div class="section-label">Defeito Relatado</div>
        <div class="section-value">${os.defeito ?? '-'}</div>
      </div>
    </div>

    ${os.diagnostico ? `<div class="section"><div class="section-label">Diagnóstico / Serviço Realizado</div><div style="margin-top:4px">${os.diagnostico}</div></div>` : ''}

    ${pecas.length > 0 ? `
    <h2>Peças e Serviços</h2>
    <table>
      <thead><tr><th>Descrição</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>
        ${linhasPecas}
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td style="text-align:right">${formatCurrency(os.total)}</td>
        </tr>
      </tbody>
    </table>` : `
    <div class="section">
      <div class="section-label">Total</div>
      <div class="section-value">${formatCurrency(os.total)}</div>
    </div>`}

    ${os.observacoes ? `<div class="obs"><div class="obs-label">Observações</div><div>${os.observacoes}</div></div>` : ''}

    <div class="assinatura">
      <div class="assinatura-linha">Assinatura do Cliente</div>
      <div class="assinatura-linha">Técnico Responsável</div>
    </div>

    <div class="footer">Documento gerado em ${formatDateTime(new Date().toISOString())} • ${empresa.nome}</div>
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function gerarPDFNota(empresa: Empresa, venda: Venda): Promise<string> {
  const itens = venda.itens ?? [];
  const linhasItens = itens.map(item => `
    <tr>
      <td>${item.descricao}</td>
      <td style="text-align:center">${item.quantidade}</td>
      <td style="text-align:right">${formatCurrency(item.preco_unitario)}</td>
      <td style="text-align:right">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    ${headerEmpresa(empresa, 'NOTA DE VENDA', venda.id, formatDateTime(venda.criado_em))}

    <div class="grid-2">
      <div class="section">
        <div class="section-label">Cliente</div>
        <div class="section-value">${venda.cliente_nome ?? 'Consumidor Final'}</div>
      </div>
      <div class="section">
        <div class="section-label">Pagamento</div>
        <div class="section-value">${getFormaPagamentoLabel(venda.forma_pagamento)}</div>
      </div>
    </div>

    <table>
      <thead><tr><th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>
        ${linhasItens}
        ${venda.desconto > 0 ? `<tr><td colspan="3">Desconto</td><td style="text-align:right;color:#ef4444">- ${formatCurrency(venda.desconto)}</td></tr>` : ''}
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td style="text-align:right">${formatCurrency(venda.total)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">Obrigado pela preferência! • ${empresa.nome} • ${formatDateTime(new Date().toISOString())}</div>
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function gerarPDFRecibo(empresa: Empresa, venda: Venda): Promise<string> {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    ${headerEmpresa(empresa, 'RECIBO', venda.id, formatDateTime(venda.criado_em))}

    <div style="text-align:center; padding:30px 20px;">
      <p style="font-size:14px; margin-bottom:20px;">
        Recebi de <strong>${venda.cliente_nome ?? 'Consumidor Final'}</strong> a importância de:
      </p>
      <div style="font-size:28px; font-weight:bold; color:#1e40af; padding:16px; border:2px solid #1e40af; border-radius:8px; margin:20px 0;">
        ${formatCurrency(venda.total)}
      </div>
      <p style="margin-bottom:8px;">Referente a: Compra realizada em ${formatDate(venda.criado_em)}</p>
      <p>Forma de pagamento: <strong>${getFormaPagamentoLabel(venda.forma_pagamento)}</strong></p>
    </div>

    <div style="margin-top:60px; text-align:center;">
      <div style="display:inline-block; border-top:1px solid #374151; width:250px; padding-top:8px;">
        ${empresa.nome}<br><small>Assinatura</small>
      </div>
    </div>

    <div class="footer">${empresa.nome} ${empresa.cnpj ? '• CNPJ: ' + empresa.cnpj : ''} ${empresa.telefone ? '• Tel: ' + empresa.telefone : ''}</div>
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function compartilharPDF(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar PDF' });
  }
}
