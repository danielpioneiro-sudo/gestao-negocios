import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getPedido, updatePedidoStatus, deletePedido, getEmpresa } from '@/database';
import { formatCurrency, formatDateTime, getPedidoStatusLabel, getPedidoStatusColor } from '@/utils/formatters';
import { gerarPDFOrcamentoPedido, compartilharPDF } from '@/utils/pdf';
import type { Pedido, Empresa } from '@/types';
import Badge from '@/components/ui/Badge';
import { SelectInput } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const STATUS_OPTIONS = [
  { label: 'Orçamento', value: 'orcamento' },
  { label: 'Aprovado', value: 'aprovado' },
  { label: 'Em Produção', value: 'em_producao' },
  { label: 'Concluído', value: 'concluido' },
  { label: 'Cancelado', value: 'cancelado' },
];

export default function PedidoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDB();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [status, setStatus] = useState('');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const load = useCallback(async () => {
    const p = await getPedido(db, Number(id));
    if (p) { setPedido(p); setStatus(p.status); }
    const e = await getEmpresa(db);
    setEmpresa(e);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function salvarStatus() {
    await updatePedidoStatus(db, Number(id), status);
    Alert.alert('Status atualizado!');
    load();
  }

  async function gerarPDF() {
    if (!pedido || !empresa) return;
    setPdfLoading(true);
    try {
      const uri = await gerarPDFOrcamentoPedido(empresa, pedido);
      await compartilharPDF(uri);
    } catch { Alert.alert('Erro', 'Não foi possível gerar o PDF'); }
    finally { setPdfLoading(false); }
  }

  function confirmarExcluir() {
    Alert.alert('Excluir Pedido', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await deletePedido(db, Number(id)); router.back(); }},
    ]);
  }

  if (!pedido) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-gray-900">Pedido #{String(pedido.id).padStart(5, '0')}</Text>
            <Badge label={getPedidoStatusLabel(pedido.status)} color={getPedidoStatusColor(pedido.status)} />
          </View>
          {pedido.cliente_nome && <Text className="text-gray-600 mb-1">Cliente: {pedido.cliente_nome}</Text>}
          <Text className="text-gray-400 text-sm">{formatDateTime(pedido.criado_em)}</Text>
        </View>

        <SelectInput label="Alterar Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        <Button title="Salvar Status" onPress={salvarStatus} variant="secondary" style={{ marginBottom: 16 }} />

        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="font-semibold text-gray-700 mb-3">Itens</Text>
          {pedido.itens?.map(item => (
            <View key={item.id} className="flex-row justify-between py-2 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-gray-900 text-sm">{item.descricao}</Text>
                <Text className="text-gray-400 text-xs">{formatCurrency(item.preco_unitario)} × {item.quantidade}</Text>
              </View>
              <Text className="text-gray-900 font-semibold text-sm">{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-3">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold text-primary-600 text-lg">{formatCurrency(pedido.total)}</Text>
          </View>
        </View>

        {pedido.observacoes && (
          <View className="bg-yellow-50 rounded-2xl p-4 mb-4 border border-yellow-200">
            <Text className="text-gray-500 text-xs mb-1">Observações</Text>
            <Text className="text-gray-800">{pedido.observacoes}</Text>
          </View>
        )}

        <Button title="Gerar PDF" onPress={gerarPDF} loading={pdfLoading} variant="secondary" style={{ marginBottom: 12 }} />
        <Button title="Excluir Pedido" onPress={confirmarExcluir} variant="danger" />
      </ScrollView>
    </SafeAreaView>
  );
}
