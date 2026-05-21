import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getAgenda, deleteAgendamento } from '@/database';
import { formatDate } from '@/utils/formatters';
import type { Agenda } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

const TIPO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  reuniao: 'people',
  entrega: 'cube',
  servico: 'construct',
  outros: 'calendar',
};

const TIPO_COLORS: Record<string, string> = {
  reuniao: '#3b82f6',
  entrega: '#10b981',
  servico: '#8b5cf6',
  outros: '#f59e0b',
};

export default function AgendaScreen() {
  const router = useRouter();
  const db = useDB();
  const [eventos, setEventos] = useState<Agenda[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => { setEventos(await getAgenda(db)); }, [db]);
  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  function confirmarExcluir(id: number) {
    Alert.alert('Excluir Agendamento', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await deleteAgendamento(db, id); load(); }},
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-4 pt-2 pb-3 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">Agenda</Text>
        <TouchableOpacity className="bg-primary-600 px-4 py-2 rounded-xl flex-row items-center" onPress={() => router.push('/agenda/novo')}>
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-semibold ml-1">Novo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={eventos}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={<EmptyState title="Nenhum agendamento" description="Toque em + Novo para adicionar" icon="📅" />}
        renderItem={({ item }) => {
          const color = TIPO_COLORS[item.tipo] ?? '#6b7280';
          const icon = TIPO_ICONS[item.tipo] ?? 'calendar';
          return (
            <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center">
              <View style={{ backgroundColor: color + '22', width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name={icon} size={22} color={color} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">{item.titulo}</Text>
                {item.cliente_nome && <Text className="text-gray-500 text-sm">{item.cliente_nome}</Text>}
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-gray-400 text-xs">{formatDate(item.data)}</Text>
                  {item.hora && <Text className="text-gray-400 text-xs">• {item.hora}</Text>}
                </View>
                {item.descricao && <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{item.descricao}</Text>}
              </View>
              <TouchableOpacity onPress={() => confirmarExcluir(item.id)} className="p-2">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
