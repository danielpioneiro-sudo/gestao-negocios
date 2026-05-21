import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { getClientes, createAgendamento } from '@/database';
import type { Cliente } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SelectInput } from '@/components/ui/Input';
import { todayISO } from '@/utils/formatters';

const TIPO_OPTIONS = [
  { label: 'Reunião', value: 'reuniao' },
  { label: 'Entrega', value: 'entrega' },
  { label: 'Serviço', value: 'servico' },
  { label: 'Outros', value: 'outros' },
];

export default function NovoAgendamentoScreen() {
  const router = useRouter();
  const db = useDB();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(todayISO());
  const [hora, setHora] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [tipo, setTipo] = useState('outros');
  const [loading, setLoading] = useState(false);

  useEffect(() => { getClientes(db).then(setClientes); }, []);

  const clienteOptions = [{ label: 'Sem cliente', value: '' }, ...clientes.map(c => ({ label: c.nome, value: String(c.id) }))];

  async function salvar() {
    if (!titulo.trim()) { Alert.alert('Atenção', 'Informe o título'); return; }
    setLoading(true);
    const clienteObj = clienteId ? clientes.find(c => c.id === Number(clienteId)) : null;
    try {
      await createAgendamento(db, {
        titulo: titulo.trim(),
        descricao: descricao || undefined,
        data,
        hora: hora || undefined,
        cliente_id: clienteId ? Number(clienteId) : undefined,
        cliente_nome: clienteObj?.nome,
        tipo: tipo as any,
      });
      router.back();
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <Input label="Título *" value={titulo} onChangeText={setTitulo} placeholder="Ex: Reunião com cliente, Entrega..." autoFocus />
        <Input label="Descrição" value={descricao} onChangeText={setDescricao} multiline numberOfLines={2} placeholder="Detalhes..." />
        <Input label="Data" value={data} onChangeText={setData} placeholder="AAAA-MM-DD" />
        <Input label="Hora" value={hora} onChangeText={setHora} placeholder="HH:MM" />
        <SelectInput label="Tipo" value={tipo} options={TIPO_OPTIONS} onChange={setTipo} />
        <SelectInput label="Cliente" value={clienteId} options={clienteOptions} onChange={setClienteId} />
        <Button title="Salvar Agendamento" onPress={salvar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
