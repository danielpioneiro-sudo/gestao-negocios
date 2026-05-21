import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getServicos, deleteServico } from '@/database';
import { formatCurrency } from '@/utils/formatters';
import type { Servico } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

export default function ServicosScreen() {
  const router = useRouter();
  const db = useDB();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setServicos(await getServicos(db));
  }, [db]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  function confirmarExcluir(id: number) {
    Alert.alert('Excluir Serviço', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await deleteServico(db, id); load(); }},
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-4 pt-2 pb-3 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">Serviços ({servicos.length})</Text>
        <TouchableOpacity className="bg-primary-600 px-4 py-2 rounded-xl flex-row items-center" onPress={() => router.push('/servico/novo')}>
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-semibold ml-1">Novo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={servicos}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={<EmptyState title="Nenhum serviço" description="Toque em + Novo para adicionar" icon="🔧" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center"
            onPress={() => router.push(`/servico/${item.id}`)}
          >
            <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mr-3">
              <Ionicons name="briefcase" size={22} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">{item.nome}</Text>
              {item.descricao && <Text className="text-gray-400 text-sm" numberOfLines={1}>{item.descricao}</Text>}
              <Text className="text-primary-600 font-semibold text-sm mt-0.5">{formatCurrency(item.preco)}</Text>
            </View>
            <TouchableOpacity onPress={() => confirmarExcluir(item.id)} className="p-2 mr-1">
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
