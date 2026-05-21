export interface Empresa {
  id: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logo_uri?: string;
  criado_em: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  criado_em: string;
}

export interface Produto {
  id: number;
  nome: string;
  codigo?: string;
  descricao?: string;
  preco: number;
  estoque: number;
  estoque_minimo: number;
  criado_em: string;
}

export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  criado_em: string;
}

export interface Pedido {
  id: number;
  cliente_id?: number;
  cliente_nome?: string;
  status: 'orcamento' | 'aprovado' | 'em_producao' | 'concluido' | 'cancelado';
  total: number;
  observacoes?: string;
  criado_em: string;
  itens?: PedidoItem[];
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  produto_id?: number;
  servico_id?: number;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface OrdemServico {
  id: number;
  cliente_id?: number;
  cliente_nome?: string;
  equipamento?: string;
  defeito?: string;
  diagnostico?: string;
  status: 'aberta' | 'em_andamento' | 'aguardando_peca' | 'concluida' | 'entregue' | 'cancelada';
  total: number;
  observacoes?: string;
  data_prevista?: string;
  criado_em: string;
  pecas?: OSPeca[];
}

export interface OSPeca {
  id: number;
  os_id: number;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  cliente_id?: number;
  cliente_nome?: string;
  total: number;
  desconto: number;
  forma_pagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
  criado_em: string;
  itens?: VendaItem[];
}

export interface VendaItem {
  id: number;
  venda_id: number;
  produto_id?: number;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Financeiro {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria?: string;
  pago: number;
  criado_em: string;
}

export interface Agenda {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;
  hora?: string;
  cliente_id?: number;
  cliente_nome?: string;
  tipo: 'reuniao' | 'entrega' | 'servico' | 'outros';
  criado_em: string;
}

export interface CarrinhoItem {
  produto_id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface DashboardStats {
  vendasHoje: number;
  totalHoje: number;
  pedidosPendentes: number;
  osPendentes: number;
  produtosBaixoEstoque: number;
  contasVencer: number;
}
