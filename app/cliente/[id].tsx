import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getCliente, updateCliente, deleteCliente } from '@/database';
import type { Cliente } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatDateTime } from '@/utils/formatters';

export default function ClienteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDB();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCliente(db, Number(id)).then(c => {
      if (c) {
        setCliente(c);
        setNome(c.nome);
        setCpfCnpj(c.cpf_cnpj ?? '');
        setTelefone(c.telefone ?? '');
        setEmail(c.email ?? '');
        setEndereco(c.endereco ?? '');
      }
    });
  }, [id]);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome'); return; }
    setLoading(true);
    try {
      await updateCliente(db, Number(id), { nome: nome.trim(), cpf_cnpj: cpfCnpj || undefined, telefone: telefone || undefined, email: email || undefined, endereco: endereco || undefined });
      Alert.alert('Salvo!', 'Cliente atualizado com sucesso');
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  function confirmarExcluir() {
    Alert.alert('Excluir Cliente', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await deleteCliente(db, Number(id));
        router.back();
      }},
    ]);
  }

  if (!cliente) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <View className="bg-primary-50 rounded-2xl p-4 mb-4 flex-row items-center">
          <View className="bg-primary-600 w-14 h-14 rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold text-2xl">{cliente.nome.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text className="text-primary-900 font-bold text-lg">{cliente.nome}</Text>
            <Text className="text-primary-600 text-xs">Cadastrado em {formatDateTime(cliente.criado_em)}</Text>
          </View>
        </View>
        <Input label="Nome *" value={nome} onChangeText={setNome} />
        <Input label="CPF / CNPJ" value={cpfCnpj} onChangeText={setCpfCnpj} keyboardType="numeric" />
        <Input label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
        <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Endereço" value={endereco} onChangeText={setEndereco} multiline numberOfLines={2} />
        <Button title="Salvar Alterações" onPress={salvar} loading={loading} />
        <Button title="Excluir Cliente" onPress={confirmarExcluir} variant="danger" style={{ marginTop: 12 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
