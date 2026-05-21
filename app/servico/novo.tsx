import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { createServico } from '@/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function NovoServicoScreen() {
  const router = useRouter();
  const db = useDB();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [loading, setLoading] = useState(false);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome do serviço'); return; }
    setLoading(true);
    try {
      await createServico(db, { nome: nome.trim(), descricao: descricao || undefined, preco: parseFloat(preco.replace(',', '.')) || 0 });
      router.back();
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <Input label="Nome *" value={nome} onChangeText={setNome} placeholder="Ex: Instalação, Manutenção..." autoFocus />
        <Input label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Descrição opcional" multiline numberOfLines={3} />
        <Input label="Preço (R$)" value={preco} onChangeText={setPreco} placeholder="0,00" keyboardType="decimal-pad" />
        <Button title="Salvar Serviço" onPress={salvar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
