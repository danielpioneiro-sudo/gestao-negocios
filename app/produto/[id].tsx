import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDB } from '@/contexts/AppContext';
import { getProduto, updateProduto, deleteProduto } from '@/database';
import type { Produto } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';

export default function ProdutoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDB();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProduto(db, Number(id)).then(p => {
      if (p) {
        setProduto(p);
        setNome(p.nome);
        setCodigo(p.codigo ?? '');
        setDescricao(p.descricao ?? '');
        setPreco(String(p.preco));
        setEstoque(String(p.estoque));
        setEstoqueMinimo(String(p.estoque_minimo));
      }
    });
  }, [id]);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome'); return; }
    setLoading(true);
    try {
      await updateProduto(db, Number(id), {
        nome: nome.trim(),
        codigo: codigo || undefined,
        descricao: descricao || undefined,
        preco: parseFloat(preco.replace(',', '.')) || 0,
        estoque: parseFloat(estoque) || 0,
        estoque_minimo: parseFloat(estoqueMinimo) || 5,
      });
      Alert.alert('Salvo!');
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  function confirmarExcluir() {
    Alert.alert('Excluir Produto', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await deleteProduto(db, Number(id));
        router.back();
      }},
    ]);
  }

  if (!produto) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <View className="bg-blue-50 rounded-2xl p-4 mb-4 flex-row justify-between">
          <View>
            <Text className="text-gray-500 text-xs">Preço atual</Text>
            <Text className="text-primary-700 font-bold text-xl">{formatCurrency(produto.preco)}</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Estoque</Text>
            <Text className={`font-bold text-xl ${produto.estoque <= produto.estoque_minimo ? 'text-red-500' : 'text-green-600'}`}>{produto.estoque}</Text>
          </View>
        </View>
        <Input label="Nome *" value={nome} onChangeText={setNome} />
        <Input label="Código" value={codigo} onChangeText={setCodigo} />
        <Input label="Descrição" value={descricao} onChangeText={setDescricao} multiline numberOfLines={2} />
        <Input label="Preço (R$)" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" />
        <Input label="Estoque" value={estoque} onChangeText={setEstoque} keyboardType="decimal-pad" />
        <Input label="Estoque Mínimo" value={estoqueMinimo} onChangeText={setEstoqueMinimo} keyboardType="decimal-pad" />
        <Button title="Salvar Alterações" onPress={salvar} loading={loading} />
        <Button title="Excluir Produto" onPress={confirmarExcluir} variant="danger" style={{ marginTop: 12 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
