import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { getServico, updateServico, deleteServico } from '@/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ServicoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDB();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getServico(db, Number(id)).then(s => {
      if (s) { setNome(s.nome); setDescricao(s.descricao ?? ''); setPreco(String(s.preco)); }
    });
  }, [id]);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome'); return; }
    setLoading(true);
    try {
      await updateServico(db, Number(id), { nome: nome.trim(), descricao: descricao || undefined, preco: parseFloat(preco.replace(',', '.')) || 0 });
      Alert.alert('Salvo!');
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  function confirmarExcluir() {
    Alert.alert('Excluir Serviço', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await deleteServico(db, Number(id)); router.back(); }},
    ]);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <Input label="Nome *" value={nome} onChangeText={setNome} />
        <Input label="Descrição" value={descricao} onChangeText={setDescricao} multiline numberOfLines={3} />
        <Input label="Preço (R$)" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" />
        <Button title="Salvar Alterações" onPress={salvar} loading={loading} />
        <Button title="Excluir Serviço" onPress={confirmarExcluir} variant="danger" style={{ marginTop: 12 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
