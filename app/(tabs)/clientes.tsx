import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/contexts/AppContext';
import { getClientes } from '@/database';
import type { Cliente } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

export default function ClientesScreen() {
  const router = useRouter();
  const { db, isReady } = useAppContext();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!db) return;
    const data = await getClientes(db);
    setClientes(data);
  }, [db]);

  useEffect(() => { if (isReady) load(); }, [isReady, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.telefone ?? '').includes(search) ||
    (c.cpf_cnpj ?? '').includes(search)
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-gray-900">Clientes</Text>
          <TouchableOpacity
            className="bg-primary-600 px-4 py-2 rounded-xl flex-row items-center"
            onPress={() => router.push('/cliente/novo')}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-semibold ml-1">Novo</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-gray-100 rounded-xl flex-row items-center px-3 py-2">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-900 text-base"
            placeholder="Buscar por nome, telefone..."
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
            title={search ? 'Nenhum resultado' : 'Nenhum cliente'}
            description={search ? 'Tente outro termo' : 'Toque em + Novo para adicionar'}
            icon="👤"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center"
            onPress={() => router.push(`/cliente/${item.id}`)}
          >
            <View className="bg-primary-100 w-12 h-12 rounded-full items-center justify-center mr-3">
              <Text className="text-primary-700 font-bold text-lg">{item.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">{item.nome}</Text>
              {item.telefone && <Text className="text-gray-500 text-sm mt-0.5">{item.telefone}</Text>}
              {item.cpf_cnpj && <Text className="text-gray-400 text-xs">{item.cpf_cnpj}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
