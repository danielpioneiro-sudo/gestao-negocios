import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getClientes, createOrdemServico } from '@/database';
import type { Cliente, OSPeca } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SelectInput } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/formatters';

const STATUS_OPTIONS = [
  { label: 'Aberta', value: 'aberta' },
  { label: 'Em Andamento', value: 'em_andamento' },
  { label: 'Aguardando Peça', value: 'aguardando_peca' },
];

type PecaTemp = { descricao: string; quantidade: string; preco_unitario: string; };

export default function NovaOSScreen() {
  const router = useRouter();
  const db = useDB();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [defeito, setDefeito] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [status, setStatus] = useState('aberta');
  const [observacoes, setObservacoes] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [pecas, setPecas] = useState<PecaTemp[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getClientes(db).then(setClientes); }, []);

  const clienteOptions = [{ label: 'Sem cliente', value: '' }, ...clientes.map(c => ({ label: c.nome, value: String(c.id) }))];

  function addPeca() {
    setPecas(prev => [...prev, { descricao: '', quantidade: '1', preco_unitario: '0' }]);
  }

  function updatePeca(index: number, field: keyof PecaTemp, value: string) {
    const copy = [...pecas];
    copy[index] = { ...copy[index], [field]: value };
    setPecas(copy);
  }

  const totalPecas = pecas.reduce((acc, p) => acc + (parseFloat(p.quantidade) || 0) * (parseFloat(p.preco_unitario.replace(',', '.')) || 0), 0);

  async function salvar() {
    if (!equipamento.trim() && !defeito.trim()) { Alert.alert('Atenção', 'Informe o equipamento ou defeito'); return; }
    setLoading(true);
    const clienteObj = clienteId ? clientes.find(c => c.id === Number(clienteId)) : null;
    try {
      await createOrdemServico(
        db,
        {
          cliente_id: clienteId ? Number(clienteId) : undefined,
          cliente_nome: clienteObj?.nome,
          equipamento: equipamento || undefined,
          defeito: defeito || undefined,
          diagnostico: diagnostico || undefined,
          status: status as any,
          total: totalPecas,
          observacoes: observacoes || undefined,
          data_prevista: dataPrevista || undefined,
        },
        pecas.filter(p => p.descricao.trim()).map(p => ({
          descricao: p.descricao,
          quantidade: parseFloat(p.quantidade) || 1,
          preco_unitario: parseFloat(p.preco_unitario.replace(',', '.')) || 0,
          subtotal: (parseFloat(p.quantidade) || 1) * (parseFloat(p.preco_unitario.replace(',', '.')) || 0),
        }))
      );
      router.back();
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <SelectInput label="Cliente" value={clienteId} options={clienteOptions} onChange={setClienteId} />
        <Input label="Equipamento" value={equipamento} onChangeText={setEquipamento} placeholder="Ex: iPhone 14, Notebook Dell..." />
        <Input label="Defeito Relatado" value={defeito} onChangeText={setDefeito} placeholder="O que o cliente relatou..." multiline numberOfLines={2} />
        <Input label="Diagnóstico / Serviço" value={diagnostico} onChangeText={setDiagnostico} placeholder="O que foi feito..." multiline numberOfLines={2} />
        <SelectInput label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        <Input label="Data Prevista" value={dataPrevista} onChangeText={setDataPrevista} placeholder="AAAA-MM-DD" />
        <Input label="Observações" value={observacoes} onChangeText={setObservacoes} multiline numberOfLines={2} />

        <View className="flex-row justify-between items-center mb-2 mt-2">
          <Text className="text-sm font-semibold text-gray-700">Peças e Mão de Obra</Text>
          <TouchableOpacity className="bg-primary-100 px-3 py-1.5 rounded-xl flex-row items-center" onPress={addPeca}>
            <Ionicons name="add" size={16} color="#2563eb" />
            <Text className="text-primary-700 text-sm font-semibold ml-1">Adicionar</Text>
          </TouchableOpacity>
        </View>

        {pecas.map((peca, i) => (
          <View key={i} className="bg-white rounded-xl p-3 mb-2 border border-gray-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-gray-600">Item {i + 1}</Text>
              <TouchableOpacity onPress={() => setPecas(prev => prev.filter((_, idx) => idx !== i))}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Input label="Descrição" value={peca.descricao} onChangeText={v => updatePeca(i, 'descricao', v)} placeholder="Nome da peça ou serviço" />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input label="Qtd" value={peca.quantidade} onChangeText={v => updatePeca(i, 'quantidade', v)} keyboardType="decimal-pad" />
              </View>
              <View className="flex-1">
                <Input label="Preço Unit." value={peca.preco_unitario} onChangeText={v => updatePeca(i, 'preco_unitario', v)} keyboardType="decimal-pad" placeholder="0,00" />
              </View>
            </View>
          </View>
        ))}

        {pecas.length > 0 && (
          <View className="bg-primary-50 rounded-xl p-3 mb-4 flex-row justify-between">
            <Text className="text-primary-800 font-semibold">Total</Text>
            <Text className="text-primary-700 font-bold text-lg">{formatCurrency(totalPecas)}</Text>
          </View>
        )}

        <Button title="Salvar OS" onPress={salvar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
