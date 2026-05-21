import * as SQLite from 'expo-sqlite';
import type {
  Empresa, Cliente, Produto, Servico, Pedido, PedidoItem,
  OrdemServico, OSPeca, Venda, VendaItem, Financeiro, Agenda, DashboardStats
} from '@/types';

let _db: SQLite.SQLiteDatabase | null = null;

export async function openDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('gestao.db');
  await initDB(_db);
  return _db;
}

async function initDB(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS empresa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL DEFAULT 'Minha Empresa',
      cnpj TEXT,
      endereco TEXT,
      telefone TEXT,
      email TEXT,
      logo_uri TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf_cnpj TEXT,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      codigo TEXT,
      descricao TEXT,
      preco REAL NOT NULL DEFAULT 0,
      estoque REAL NOT NULL DEFAULT 0,
      estoque_minimo REAL NOT NULL DEFAULT 5,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL DEFAULT 0,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      cliente_nome TEXT,
      total REAL NOT NULL DEFAULT 0,
      desconto REAL NOT NULL DEFAULT 0,
      forma_pagamento TEXT NOT NULL DEFAULT 'dinheiro',
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS venda_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER NOT NULL,
      produto_id INTEGER,
      descricao TEXT NOT NULL,
      quantidade REAL NOT NULL DEFAULT 1,
      preco_unitario REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (venda_id) REFERENCES vendas(id)
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      cliente_nome TEXT,
      status TEXT NOT NULL DEFAULT 'orcamento',
      total REAL NOT NULL DEFAULT 0,
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS pedido_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      produto_id INTEGER,
      servico_id INTEGER,
      descricao TEXT NOT NULL,
      quantidade REAL NOT NULL DEFAULT 1,
      preco_unitario REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    );

    CREATE TABLE IF NOT EXISTS ordens_servico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      cliente_nome TEXT,
      equipamento TEXT,
      defeito TEXT,
      diagnostico TEXT,
      status TEXT NOT NULL DEFAULT 'aberta',
      total REAL NOT NULL DEFAULT 0,
      observacoes TEXT,
      data_prevista TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS os_pecas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      quantidade REAL NOT NULL DEFAULT 1,
      preco_unitario REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (os_id) REFERENCES ordens_servico(id)
    );

    CREATE TABLE IF NOT EXISTS financeiro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL DEFAULT 'receita',
      descricao TEXT NOT NULL,
      valor REAL NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      categoria TEXT,
      pago INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      hora TEXT,
      cliente_id INTEGER,
      cliente_nome TEXT,
      tipo TEXT NOT NULL DEFAULT 'outros',
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  const emp = await db.getFirstAsync<{ id: number }>('SELECT id FROM empresa LIMIT 1');
  if (!emp) {
    await db.runAsync("INSERT INTO empresa (nome) VALUES ('Minha Empresa')");
  }
}

// ── EMPRESA ──────────────────────────────────────────────────────────────────

export async function getEmpresa(db: SQLite.SQLiteDatabase): Promise<Empresa | null> {
  return db.getFirstAsync<Empresa>('SELECT * FROM empresa LIMIT 1');
}

export async function updateEmpresa(db: SQLite.SQLiteDatabase, data: Partial<Empresa>): Promise<void> {
  const emp = await getEmpresa(db);
  if (!emp) return;
  await db.runAsync(
    'UPDATE empresa SET nome=?, cnpj=?, endereco=?, telefone=?, email=?, logo_uri=? WHERE id=?',
    data.nome ?? emp.nome,
    data.cnpj ?? emp.cnpj ?? null,
    data.endereco ?? emp.endereco ?? null,
    data.telefone ?? emp.telefone ?? null,
    data.email ?? emp.email ?? null,
    data.logo_uri ?? emp.logo_uri ?? null,
    emp.id
  );
}

// ── CLIENTES ─────────────────────────────────────────────────────────────────

export async function getClientes(db: SQLite.SQLiteDatabase): Promise<Cliente[]> {
  return db.getAllAsync<Cliente>('SELECT * FROM clientes ORDER BY nome');
}

export async function getCliente(db: SQLite.SQLiteDatabase, id: number): Promise<Cliente | null> {
  return db.getFirstAsync<Cliente>('SELECT * FROM clientes WHERE id=?', id);
}

export async function createCliente(db: SQLite.SQLiteDatabase, data: Omit<Cliente, 'id' | 'criado_em'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO clientes (nome, cpf_cnpj, telefone, email, endereco) VALUES (?,?,?,?,?)',
    data.nome, data.cpf_cnpj ?? null, data.telefone ?? null, data.email ?? null, data.endereco ?? null
  );
  return result.lastInsertRowId;
}

export async function updateCliente(db: SQLite.SQLiteDatabase, id: number, data: Partial<Cliente>): Promise<void> {
  await db.runAsync(
    'UPDATE clientes SET nome=?, cpf_cnpj=?, telefone=?, email=?, endereco=? WHERE id=?',
    data.nome!, data.cpf_cnpj ?? null, data.telefone ?? null, data.email ?? null, data.endereco ?? null, id
  );
}

export async function deleteCliente(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM clientes WHERE id=?', id);
}

// ── PRODUTOS ─────────────────────────────────────────────────────────────────

export async function getProdutos(db: SQLite.SQLiteDatabase): Promise<Produto[]> {
  return db.getAllAsync<Produto>('SELECT * FROM produtos ORDER BY nome');
}

export async function getProduto(db: SQLite.SQLiteDatabase, id: number): Promise<Produto | null> {
  return db.getFirstAsync<Produto>('SELECT * FROM produtos WHERE id=?', id);
}

export async function getProdutoByCodigo(db: SQLite.SQLiteDatabase, codigo: string): Promise<Produto | null> {
  return db.getFirstAsync<Produto>('SELECT * FROM produtos WHERE codigo=?', codigo);
}

export async function createProduto(db: SQLite.SQLiteDatabase, data: Omit<Produto, 'id' | 'criado_em'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO produtos (nome, codigo, descricao, preco, estoque, estoque_minimo) VALUES (?,?,?,?,?,?)',
    data.nome, data.codigo ?? null, data.descricao ?? null, data.preco, data.estoque, data.estoque_minimo
  );
  return result.lastInsertRowId;
}

export async function updateProduto(db: SQLite.SQLiteDatabase, id: number, data: Partial<Produto>): Promise<void> {
  await db.runAsync(
    'UPDATE produtos SET nome=?, codigo=?, descricao=?, preco=?, estoque=?, estoque_minimo=? WHERE id=?',
    data.nome!, data.codigo ?? null, data.descricao ?? null, data.preco!, data.estoque!, data.estoque_minimo!, id
  );
}

export async function deleteProduto(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM produtos WHERE id=?', id);
}

export async function atualizarEstoque(db: SQLite.SQLiteDatabase, id: number, delta: number): Promise<void> {
  await db.runAsync('UPDATE produtos SET estoque = estoque + ? WHERE id=?', delta, id);
}

// ── SERVIÇOS ─────────────────────────────────────────────────────────────────

export async function getServicos(db: SQLite.SQLiteDatabase): Promise<Servico[]> {
  return db.getAllAsync<Servico>('SELECT * FROM servicos ORDER BY nome');
}

export async function getServico(db: SQLite.SQLiteDatabase, id: number): Promise<Servico | null> {
  return db.getFirstAsync<Servico>('SELECT * FROM servicos WHERE id=?', id);
}

export async function createServico(db: SQLite.SQLiteDatabase, data: Omit<Servico, 'id' | 'criado_em'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO servicos (nome, descricao, preco) VALUES (?,?,?)',
    data.nome, data.descricao ?? null, data.preco
  );
  return result.lastInsertRowId;
}

export async function updateServico(db: SQLite.SQLiteDatabase, id: number, data: Partial<Servico>): Promise<void> {
  await db.runAsync(
    'UPDATE servicos SET nome=?, descricao=?, preco=? WHERE id=?',
    data.nome!, data.descricao ?? null, data.preco!, id
  );
}

export async function deleteServico(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM servicos WHERE id=?', id);
}

// ── VENDAS (PDV) ─────────────────────────────────────────────────────────────

export async function getVendas(db: SQLite.SQLiteDatabase): Promise<Venda[]> {
  return db.getAllAsync<Venda>('SELECT * FROM vendas ORDER BY criado_em DESC');
}

export async function getVenda(db: SQLite.SQLiteDatabase, id: number): Promise<Venda | null> {
  const venda = await db.getFirstAsync<Venda>('SELECT * FROM vendas WHERE id=?', id);
  if (!venda) return null;
  venda.itens = await db.getAllAsync<VendaItem>('SELECT * FROM venda_itens WHERE venda_id=?', id);
  return venda;
}

export async function createVenda(
  db: SQLite.SQLiteDatabase,
  data: Omit<Venda, 'id' | 'criado_em'>,
  itens: Omit<VendaItem, 'id' | 'venda_id'>[]
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO vendas (cliente_id, cliente_nome, total, desconto, forma_pagamento) VALUES (?,?,?,?,?)',
    data.cliente_id ?? null, data.cliente_nome ?? null, data.total, data.desconto, data.forma_pagamento
  );
  const vendaId = result.lastInsertRowId;
  for (const item of itens) {
    await db.runAsync(
      'INSERT INTO venda_itens (venda_id, produto_id, descricao, quantidade, preco_unitario, subtotal) VALUES (?,?,?,?,?,?)',
      vendaId, item.produto_id ?? null, item.descricao, item.quantidade, item.preco_unitario, item.subtotal
    );
    if (item.produto_id) {
      await atualizarEstoque(db, item.produto_id, -item.quantidade);
    }
  }
  await db.runAsync(
    "INSERT INTO financeiro (tipo, descricao, valor, data, categoria, pago) VALUES ('receita', 'Venda PDV #' || ?, ?, date('now'), 'Vendas', 1)",
    vendaId, data.total
  );
  return vendaId;
}

// ── PEDIDOS ───────────────────────────────────────────────────────────────────

export async function getPedidos(db: SQLite.SQLiteDatabase): Promise<Pedido[]> {
  return db.getAllAsync<Pedido>('SELECT * FROM pedidos ORDER BY criado_em DESC');
}

export async function getPedido(db: SQLite.SQLiteDatabase, id: number): Promise<Pedido | null> {
  const pedido = await db.getFirstAsync<Pedido>('SELECT * FROM pedidos WHERE id=?', id);
  if (!pedido) return null;
  pedido.itens = await db.getAllAsync<PedidoItem>('SELECT * FROM pedido_itens WHERE pedido_id=?', id);
  return pedido;
}

export async function createPedido(
  db: SQLite.SQLiteDatabase,
  data: Omit<Pedido, 'id' | 'criado_em'>,
  itens: Omit<PedidoItem, 'id' | 'pedido_id'>[]
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO pedidos (cliente_id, cliente_nome, status, total, observacoes) VALUES (?,?,?,?,?)',
    data.cliente_id ?? null, data.cliente_nome ?? null, data.status, data.total, data.observacoes ?? null
  );
  const pedidoId = result.lastInsertRowId;
  for (const item of itens) {
    await db.runAsync(
      'INSERT INTO pedido_itens (pedido_id, produto_id, servico_id, descricao, quantidade, preco_unitario, subtotal) VALUES (?,?,?,?,?,?,?)',
      pedidoId, item.produto_id ?? null, item.servico_id ?? null, item.descricao, item.quantidade, item.preco_unitario, item.subtotal
    );
  }
  return pedidoId;
}

export async function updatePedidoStatus(db: SQLite.SQLiteDatabase, id: number, status: string): Promise<void> {
  await db.runAsync('UPDATE pedidos SET status=? WHERE id=?', status, id);
}

export async function deletePedido(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM pedido_itens WHERE pedido_id=?', id);
  await db.runAsync('DELETE FROM pedidos WHERE id=?', id);
}

// ── ORDENS DE SERVIÇO ────────────────────────────────────────────────────────

export async function getOrdensServico(db: SQLite.SQLiteDatabase): Promise<OrdemServico[]> {
  return db.getAllAsync<OrdemServico>('SELECT * FROM ordens_servico ORDER BY criado_em DESC');
}

export async function getOrdemServico(db: SQLite.SQLiteDatabase, id: number): Promise<OrdemServico | null> {
  const os = await db.getFirstAsync<OrdemServico>('SELECT * FROM ordens_servico WHERE id=?', id);
  if (!os) return null;
  os.pecas = await db.getAllAsync<OSPeca>('SELECT * FROM os_pecas WHERE os_id=?', id);
  return os;
}

export async function createOrdemServico(
  db: SQLite.SQLiteDatabase,
  data: Omit<OrdemServico, 'id' | 'criado_em'>,
  pecas: Omit<OSPeca, 'id' | 'os_id'>[]
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO ordens_servico (cliente_id, cliente_nome, equipamento, defeito, diagnostico, status, total, observacoes, data_prevista) VALUES (?,?,?,?,?,?,?,?,?)',
    data.cliente_id ?? null, data.cliente_nome ?? null, data.equipamento ?? null, data.defeito ?? null,
    data.diagnostico ?? null, data.status, data.total, data.observacoes ?? null, data.data_prevista ?? null
  );
  const osId = result.lastInsertRowId;
  for (const peca of pecas) {
    await db.runAsync(
      'INSERT INTO os_pecas (os_id, descricao, quantidade, preco_unitario, subtotal) VALUES (?,?,?,?,?)',
      osId, peca.descricao, peca.quantidade, peca.preco_unitario, peca.subtotal
    );
  }
  return osId;
}

export async function updateOrdemServico(
  db: SQLite.SQLiteDatabase,
  id: number,
  data: Partial<OrdemServico>,
  pecas?: Omit<OSPeca, 'id' | 'os_id'>[]
): Promise<void> {
  await db.runAsync(
    'UPDATE ordens_servico SET cliente_id=?, cliente_nome=?, equipamento=?, defeito=?, diagnostico=?, status=?, total=?, observacoes=?, data_prevista=? WHERE id=?',
    data.cliente_id ?? null, data.cliente_nome ?? null, data.equipamento ?? null, data.defeito ?? null,
    data.diagnostico ?? null, data.status!, data.total!, data.observacoes ?? null, data.data_prevista ?? null, id
  );
  if (pecas !== undefined) {
    await db.runAsync('DELETE FROM os_pecas WHERE os_id=?', id);
    for (const peca of pecas) {
      await db.runAsync(
        'INSERT INTO os_pecas (os_id, descricao, quantidade, preco_unitario, subtotal) VALUES (?,?,?,?,?)',
        id, peca.descricao, peca.quantidade, peca.preco_unitario, peca.subtotal
      );
    }
  }
}

export async function deleteOrdemServico(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM os_pecas WHERE os_id=?', id);
  await db.runAsync('DELETE FROM ordens_servico WHERE id=?', id);
}

// ── FINANCEIRO ───────────────────────────────────────────────────────────────

export async function getFinanceiro(db: SQLite.SQLiteDatabase): Promise<Financeiro[]> {
  return db.getAllAsync<Financeiro>('SELECT * FROM financeiro ORDER BY data DESC, criado_em DESC');
}

export async function createFinanceiro(db: SQLite.SQLiteDatabase, data: Omit<Financeiro, 'id' | 'criado_em'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO financeiro (tipo, descricao, valor, data, categoria, pago) VALUES (?,?,?,?,?,?)',
    data.tipo, data.descricao, data.valor, data.data, data.categoria ?? null, data.pago
  );
  return result.lastInsertRowId;
}

export async function updateFinanceiro(db: SQLite.SQLiteDatabase, id: number, data: Partial<Financeiro>): Promise<void> {
  await db.runAsync(
    'UPDATE financeiro SET tipo=?, descricao=?, valor=?, data=?, categoria=?, pago=? WHERE id=?',
    data.tipo!, data.descricao!, data.valor!, data.data!, data.categoria ?? null, data.pago!, id
  );
}

export async function deleteFinanceiro(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM financeiro WHERE id=?', id);
}

// ── AGENDA ────────────────────────────────────────────────────────────────────

export async function getAgenda(db: SQLite.SQLiteDatabase): Promise<Agenda[]> {
  return db.getAllAsync<Agenda>('SELECT * FROM agenda ORDER BY data ASC, hora ASC');
}

export async function createAgendamento(db: SQLite.SQLiteDatabase, data: Omit<Agenda, 'id' | 'criado_em'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO agenda (titulo, descricao, data, hora, cliente_id, cliente_nome, tipo) VALUES (?,?,?,?,?,?,?)',
    data.titulo, data.descricao ?? null, data.data, data.hora ?? null,
    data.cliente_id ?? null, data.cliente_nome ?? null, data.tipo
  );
  return result.lastInsertRowId;
}

export async function deleteAgendamento(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM agenda WHERE id=?', id);
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────

export async function getDashboardStats(db: SQLite.SQLiteDatabase): Promise<DashboardStats> {
  const hoje = new Date().toISOString().split('T')[0];
  const vendasRow = await db.getFirstAsync<{ count: number; total: number }>(
    "SELECT COUNT(*) as count, COALESCE(SUM(total),0) as total FROM vendas WHERE date(criado_em)=?", hoje
  );
  const pedidosRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM pedidos WHERE status NOT IN ('concluido','cancelado')"
  );
  const osRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM ordens_servico WHERE status NOT IN ('entregue','cancelada')"
  );
  const estoqueRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM produtos WHERE estoque <= estoque_minimo'
  );
  const contasRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM financeiro WHERE pago=0 AND data <= date('now','+7 days')"
  );
  return {
    vendasHoje: vendasRow?.count ?? 0,
    totalHoje: vendasRow?.total ?? 0,
    pedidosPendentes: pedidosRow?.count ?? 0,
    osPendentes: osRow?.count ?? 0,
    produtosBaixoEstoque: estoqueRow?.count ?? 0,
    contasVencer: contasRow?.count ?? 0,
  };
}
