import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { getOrdemServico, updateOrdemServico, deleteOrdemServico, getEmpresa } from '@/database';
import { formatCurrency, formatDateTime, formatDate, getOSStatusLabel, getOSStatusColor } from '@/utils/formatters';
import { gerarPDFOrdemServico, compartilharPDF } from '@/utils/pdf';
import type { OrdemServico, Empresa } from '@/types';
import Badge from '@/components/ui/Badge';
import { SelectInput } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const STATUS_OPTIONS = [
  { label: 'Aberta', value: 'aberta' },
  { label: 'Em Andamento', value: 'em_andamento' },
  { label: 'Aguardando Peça', value: 'aguardando_peca' },
  { label: 'Concluída', value: 'concluida' },
  { label: 'Entregue', value: 'entregue' },
  { label: 'Cancelada', value: 'cancelada' },
];

export default function OSDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDB();
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [status, setStatus] = useState('');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const load = useCallback(async () => {
    const o = await getOrdemServico(db, Number(id));
    if (o) { setOs(o); setStatus(o.status); }
    setEmpresa(await getEmpresa(db));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function salvarStatus() {
    if (!os) return;
    await updateOrdemServico(db, Number(id), { ...os, status: status as any });
    Alert.alert('Status atualizado!');
    load();
  }

  async function gerarPDF() {
    if (!os || !empresa) return;
    setPdfLoading(true);
    try {
      const uri = await gerarPDFOrdemServico(empresa, os);
      await compartilharPDF(uri);
    } catch { Alert.alert('Erro', 'Não foi possível gerar o PDF'); }
    finally { setPdfLoading(false); }
  }

  function confirmarExcluir() {
    Alert.alert('Excluir OS', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await deleteOrdemServico(db, Number(id)); router.back(); }},
    ]);
  }

  if (!os) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold">OS #{String(os.id).padStart(5, '0')}</Text>
            <Badge label={getOSStatusLabel(os.status)} color={getOSStatusColor(os.status)} />
          </View>
          {os.cliente_nome && <Text className="text-gray-600 mb-1">Cliente: {os.cliente_nome}</Text>}
          <Text className="text-gray-400 text-sm">{formatDateTime(os.criado_em)}</Text>
          {os.data_prevista && <Text className="text-orange-600 text-sm mt-1">Previsão: {formatDate(os.data_prevista)}</Text>}
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="font-semibold text-gray-700 mb-3">Detalhes</Text>
          {os.equipamento && <View className="mb-2"><Text className="text-xs text-gray-400">Equipamento</Text><Text className="text-gray-900">{os.equipamento}</Text></View>}
          {os.defeito && <View className="mb-2"><Text className="text-xs text-gray-400">Defeito Relatado</Text><Text className="text-gray-900">{os.defeito}</Text></View>}
          {os.diagnostico && <View className="mb-2"><Text className="text-xs text-gray-400">Diagnóstico</Text><Text className="text-gray-900">{os.diagnostico}</Text></View>}
          {os.observacoes && <View><Text className="text-xs text-gray-400">Observações</Text><Text className="text-gray-900">{os.observacoes}</Text></View>}
        </View>

        {os.pecas && os.pecas.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="font-semibold text-gray-700 mb-3">Peças e Serviços</Text>
            {os.pecas.map(p => (
              <View key={p.id} className="flex-row justify-between py-2 border-b border-gray-100">
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm">{p.descricao}</Text>
                  <Text className="text-gray-400 text-xs">{formatCurrency(p.preco_unitario)} × {p.quantidade}</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-sm">{formatCurrency(p.subtotal)}</Text>
              </View>
            ))}
            <View className="flex-row justify-between mt-3">
              <Text className="font-bold">Total</Text>
              <Text className="font-bold text-primary-600 text-lg">{formatCurrency(os.total)}</Text>
            </View>
          </View>
        )}

        <SelectInput label="Alterar Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        <Button title="Salvar Status" onPress={salvarStatus} variant="secondary" style={{ marginBottom: 12 }} />
        <Button title="Gerar PDF" onPress={gerarPDF} loading={pdfLoading} variant="secondary" style={{ marginBottom: 12 }} />
        <Button title="Excluir OS" onPress={confirmarExcluir} variant="danger" />
      </ScrollView>
    </SafeAreaView>
  );
}
