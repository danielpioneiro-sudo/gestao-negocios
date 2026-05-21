import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { createFinanceiro } from '@/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SelectInput } from '@/components/ui/Input';
import { todayISO } from '@/utils/formatters';

const TIPO_OPTIONS = [
  { label: 'Receita', value: 'receita' },
  { label: 'Despesa', value: 'despesa' },
];

const PAGO_OPTIONS = [
  { label: 'Pago / Recebido', value: '1' },
  { label: 'Pendente', value: '0' },
];

const CATEGORIAS = [
  { label: 'Vendas', value: 'Vendas' },
  { label: 'Serviços', value: 'Serviços' },
  { label: 'Fornecedores', value: 'Fornecedores' },
  { label: 'Aluguel', value: 'Aluguel' },
  { label: 'Salários', value: 'Salários' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Outros', value: 'Outros' },
];

export default function NovoFinanceiroScreen() {
  const router = useRouter();
  const db = useDB();
  const [tipo, setTipo] = useState('receita');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(todayISO());
  const [categoria, setCategoria] = useState('Outros');
  const [pago, setPago] = useState('1');
  const [loading, setLoading] = useState(false);

  async function salvar() {
    if (!descricao.trim()) { Alert.alert('Atenção', 'Informe a descrição'); return; }
    const valorNum = parseFloat(valor.replace(',', '.')) || 0;
    if (valorNum <= 0) { Alert.alert('Atenção', 'Informe um valor válido'); return; }
    setLoading(true);
    try {
      await createFinanceiro(db, { tipo: tipo as any, descricao: descricao.trim(), valor: valorNum, data, categoria, pago: Number(pago) });
      router.back();
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <SelectInput label="Tipo" value={tipo} options={TIPO_OPTIONS} onChange={setTipo} />
        <Input label="Descrição *" value={descricao} onChangeText={setDescricao} placeholder="Ex: Venda de produto, Conta de luz..." autoFocus />
        <Input label="Valor (R$) *" value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" />
        <Input label="Data" value={data} onChangeText={setData} placeholder="AAAA-MM-DD" />
        <SelectInput label="Categoria" value={categoria} options={CATEGORIAS} onChange={setCategoria} />
        <SelectInput label="Status" value={pago} options={PAGO_OPTIONS} onChange={setPago} />
        <Button title="Salvar Lançamento" onPress={salvar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
