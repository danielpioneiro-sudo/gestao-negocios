import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { createCliente } from '@/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function NovoClienteScreen() {
  const router = useRouter();
  const db = useDB();
  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome do cliente'); return; }
    setLoading(true);
    try {
      await createCliente(db, { nome: nome.trim(), cpf_cnpj: cpfCnpj || undefined, telefone: telefone || undefined, email: email || undefined, endereco: endereco || undefined });
      router.back();
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <Input label="Nome *" value={nome} onChangeText={setNome} placeholder="Nome completo" autoFocus />
        <Input label="CPF / CNPJ" value={cpfCnpj} onChangeText={setCpfCnpj} placeholder="000.000.000-00" keyboardType="numeric" />
        <Input label="Telefone" value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Endereço" value={endereco} onChangeText={setEndereco} placeholder="Rua, número, bairro..." multiline numberOfLines={2} />
        <Button title="Salvar Cliente" onPress={salvar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
