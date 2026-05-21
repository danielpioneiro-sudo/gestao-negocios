export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR');
}

export function formatCPFCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
}

export function getPedidoStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    orcamento: 'Orçamento',
    aprovado: 'Aprovado',
    em_producao: 'Em Produção',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return labels[status] ?? status;
}

export function getPedidoStatusColor(status: string): string {
  const colors: Record<string, string> = {
    orcamento: '#f59e0b',
    aprovado: '#3b82f6',
    em_producao: '#8b5cf6',
    concluido: '#10b981',
    cancelado: '#ef4444',
  };
  return colors[status] ?? '#6b7280';
}

export function getOSStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    aberta: 'Aberta',
    em_andamento: 'Em Andamento',
    aguardando_peca: 'Aguardando Peça',
    concluida: 'Concluída',
    entregue: 'Entregue',
    cancelada: 'Cancelada',
  };
  return labels[status] ?? status;
}

export function getOSStatusColor(status: string): string {
  const colors: Record<string, string> = {
    aberta: '#f59e0b',
    em_andamento: '#3b82f6',
    aguardando_peca: '#f97316',
    concluida: '#10b981',
    entregue: '#6b7280',
    cancelada: '#ef4444',
  };
  return colors[status] ?? '#6b7280';
}

export function getFormaPagamentoLabel(forma: string): string {
  const labels: Record<string, string> = {
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    pix: 'PIX',
    boleto: 'Boleto',
  };
  return labels[forma] ?? forma;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function fromISODate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}
