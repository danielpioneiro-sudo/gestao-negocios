import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getPedidos } from '@/database';
import { formatCurrency, formatDateTime, getPedidoStatusLabel, getPedidoStatusColor } from '@/utils/formatters';
import type { Pedido } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

export default function PedidosScreen() {
  const router = useRouter();
  const db = useDB();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => { setPedidos(await getPedidos(db)); }, [db]);
  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-4 pt-2 pb-3 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">Pedidos</Text>
        <TouchableOpacity className="bg-primary-600 px-4 py-2 rounded-xl flex-row items-center" onPress={() => router.push('/pedido/novo')}>
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-semibold ml-1">Novo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={pedidos}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={<EmptyState title="Nenhum pedido" description="Toque em + Novo para criar" icon="📋" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            onPress={() => router.push(`/pedido/${item.id}`)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-gray-900 font-bold text-base">Pedido #{String(item.id).padStart(5, '0')}</Text>
              <Badge label={getPedidoStatusLabel(item.status)} color={getPedidoStatusColor(item.status)} />
            </View>
            {item.cliente_nome && <Text className="text-gray-600 text-sm mb-1">{item.cliente_nome}</Text>}
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-gray-400 text-xs">{formatDateTime(item.criado_em)}</Text>
              <Text className="text-primary-700 font-bold text-base">{formatCurrency(item.total)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
