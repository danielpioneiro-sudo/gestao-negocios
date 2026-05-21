import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { createProduto } from '@/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function NovoProdutoScreen() {
  const router = useRouter();
  const db = useDB();
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('0');
  const [estoqueMinimo, setEstoqueMinimo] = useState('5');
  const [loading, setLoading] = useState(false);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome do produto'); return; }
    const precoNum = parseFloat(preco.replace(',', '.')) || 0;
    setLoading(true);
    try {
      await createProduto(db, {
        nome: nome.trim(),
        codigo: codigo || undefined,
        descricao: descricao || undefined,
        preco: precoNum,
        estoque: parseFloat(estoque) || 0,
        estoque_minimo: parseFloat(estoqueMinimo) || 5,
      });
      router.back();
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <Input label="Nome *" value={nome} onChangeText={setNome} placeholder="Nome do produto" autoFocus />
        <Input label="Código / Código de Barras" value={codigo} onChangeText={setCodigo} placeholder="EAN13, código interno..." />
        <Input label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Descrição opcional" multiline numberOfLines={2} />
        <Input label="Preço (R$)" value={preco} onChangeText={setPreco} placeholder="0,00" keyboardType="decimal-pad" />
        <Input label="Estoque Atual" value={estoque} onChangeText={setEstoque} placeholder="0" keyboardType="decimal-pad" />
        <Input label="Estoque Mínimo" value={estoqueMinimo} onChangeText={setEstoqueMinimo} placeholder="5" keyboardType="decimal-pad" />
        <Button title="Salvar Produto" onPress={salvar} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
