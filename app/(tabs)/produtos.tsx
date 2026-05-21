import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/contexts/AppContext';
import { getProdutos } from '@/database';
import { formatCurrency } from '@/utils/formatters';
import type { Produto } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

export default function ProdutosScreen() {
  const router = useRouter();
  const { db, isReady } = useAppContext();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!db) return;
    const data = await getProdutos(db);
    setProdutos(data);
  }, [db]);

  useEffect(() => { if (isReady) load(); }, [isReady, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.codigo ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-gray-900">Produtos</Text>
          <TouchableOpacity
            className="bg-primary-600 px-4 py-2 rounded-xl flex-row items-center"
            onPress={() => router.push('/produto/novo')}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-semibold ml-1">Novo</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-gray-100 rounded-xl flex-row items-center px-3 py-2">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-900 text-base"
            placeholder="Buscar por nome ou código..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <EmptyState
            title={search ? 'Nenhum resultado' : 'Nenhum produto'}
            description={search ? 'Tente outro termo' : 'Toque em + Novo para adicionar'}
            icon="📦"
          />
        }
        renderItem={({ item }) => {
          const baixoEstoque = item.estoque <= item.estoque_minimo;
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center"
              onPress={() => router.push(`/produto/${item.id}`)}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${baixoEstoque ? 'bg-red-100' : 'bg-green-100'}`}>
                <Ionicons name="cube" size={22} color={baixoEstoque ? '#ef4444' : '#10b981'} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">{item.nome}</Text>
                <View className="flex-row items-center gap-3 mt-0.5">
                  <Text className="text-primary-600 font-semibold text-sm">{formatCurrency(item.preco)}</Text>
                  <Text className={`text-xs font-medium ${baixoEstoque ? 'text-red-500' : 'text-gray-400'}`}>
                    Estoque: {item.estoque}
                    {baixoEstoque && ' ⚠️'}
                  </Text>
                </View>
                {item.codigo && <Text className="text-gray-400 text-xs">Cód: {item.codigo}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
