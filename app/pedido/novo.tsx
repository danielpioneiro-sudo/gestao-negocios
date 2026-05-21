import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getClientes, getProdutos, getServicos, createPedido } from '@/database';
import type { Cliente, Produto, Servico, PedidoItem } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SelectInput } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/formatters';

type ItemTemp = { descricao: string; quantidade: number; preco_unitario: number; produto_id?: number; servico_id?: number; };

const STATUS_OPTIONS = [
  { label: 'Orçamento', value: 'orcamento' },
  { label: 'Aprovado', value: 'aprovado' },
  { label: 'Em Produção', value: 'em_producao' },
  { label: 'Concluído', value: 'concluido' },
  { label: 'Cancelado', value: 'cancelado' },
];

export default function NovoPedidoScreen() {
  const router = useRouter();
  const db = useDB();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [status, setStatus] = useState('orcamento');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemTemp[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClientes(db).then(setClientes);
    getProdutos(db).then(setProdutos);
    getServicos(db).then(setServicos);
  }, []);

  const clienteOptions = [{ label: 'Sem cliente', value: '' }, ...clientes.map(c => ({ label: c.nome, value: String(c.id) }))];
  const totalItens = itens.reduce((a, i) => a + i.quantidade * i.preco_unitario, 0);

  function addProduto(produto: Produto) {
    const existing = itens.findIndex(i => i.produto_id === produto.id);
    if (existing >= 0) {
      const copy = [...itens];
      copy[existing].quantidade += 1;
      setItens(copy);
    } else {
      setItens(prev => [...prev, { descricao: produto.nome, quantidade: 1, preco_unitario: produto.preco, produto_id: produto.id }]);
    }
  }

  function addServico(servico: Servico) {
    const existing = itens.findIndex(i => i.servico_id === servico.id);
    if (existing >= 0) {
      const copy = [...itens];
      copy[existing].quantidade += 1;
      setItens(copy);
    } else {
      setItens(prev => [...prev, { descricao: servico.nome, quantidade: 1, preco_unitario: servico.preco, servico_id: servico.id }]);
    }
  }

  async function salvar() {
    if (itens.length === 0) { Alert.alert('Atenção', 'Adicione pelo menos um item'); return; }
    setLoading(true);
    const clienteObj = clienteId ? clientes.find(c => c.id === Number(clienteId)) : null;
    try {
      await createPedido(
        db,
        {
          cliente_id: clienteId ? Number(clienteId) : undefined,
          cliente_nome: clienteObj?.nome,
          status: status as any,
          total: totalItens,
          observacoes: observacoes || undefined,
        },
        itens.map(i => ({ ...i, subtotal: i.quantidade * i.preco_unitario }))
      );
      router.back();
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <SelectInput label="Cliente" value={clienteId} options={clienteOptions} onChange={setClienteId} placeholder="Selecionar cliente..." />
        <SelectInput label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        <Input label="Observações" value={observacoes} onChangeText={setObservacoes} multiline numberOfLines={2} placeholder="Anotações do pedido..." />

        <Text className="text-sm font-semibold text-gray-700 mb-2">Produtos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {produtos.map(p => (
            <TouchableOpacity key={p.id} className="bg-white border border-gray-200 rounded-xl p-3 mr-2 min-w-[120px]" onPress={() => addProduto(p)}>
              <Text className="text-gray-900 text-sm font-medium" numberOfLines={2}>{p.nome}</Text>
              <Text className="text-primary-600 text-sm font-bold mt-1">{formatCurrency(p.preco)}</Text>
              <View className="bg-primary-100 rounded-full items-center mt-2 py-1">
                <Text className="text-primary-700 text-xs font-semibold">+ Adicionar</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="text-sm font-semibold text-gray-700 mb-2">Serviços</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {servicos.map(s => (
            <TouchableOpacity key={s.id} className="bg-white border border-gray-200 rounded-xl p-3 mr-2 min-w-[120px]" onPress={() => addServico(s)}>
              <Text className="text-gray-900 text-sm font-medium" numberOfLines={2}>{s.nome}</Text>
              <Text className="text-primary-600 text-sm font-bold mt-1">{formatCurrency(s.preco)}</Text>
              <View className="bg-purple-100 rounded-full items-center mt-2 py-1">
                <Text className="text-purple-700 text-xs font-semibold">+ Adicionar</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {itens.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Itens do Pedido</Text>
            {itens.map((item, i) => (
              <View key={i} className="flex-row items-center py-2 border-b border-gray-100">
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm">{item.descricao}</Text>
                  <Text className="text-gray-400 text-xs">{formatCurrency(item.preco_unitario)} × {item.quantidade}</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-sm mr-3">{formatCurrency(item.preco_unitario * item.quantidade)}</Text>
                <TouchableOpacity onPress={() => setItens(prev => prev.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            <View className="flex-row justify-between mt-3">
              <Text className="font-bold text-gray-900">Total</Text>
              <Text className="font-bold text-primary-600 text-lg">{formatCurrency(totalItens)}</Text>
            </View>
          </View>
        )}

        <Button title="Salvar Pedido" onPress={salvar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
