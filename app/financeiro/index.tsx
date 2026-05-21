import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getFinanceiro, deleteFinanceiro, updateFinanceiro } from '@/database';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Financeiro } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

export default function FinanceiroScreen() {
  const router = useRouter();
  const db = useDB();
  const [lancamentos, setLancamentos] = useState<Financeiro[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => { setLancamentos(await getFinanceiro(db)); }, [db]);
  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const receitas = lancamentos.filter(l => l.tipo === 'receita' && l.pago).reduce((a, l) => a + l.valor, 0);
  const despesas = lancamentos.filter(l => l.tipo === 'despesa' && l.pago).reduce((a, l) => a + l.valor, 0);
  const saldo = receitas - despesas;

  async function togglePago(item: Financeiro) {
    await updateFinanceiro(db, item.id, { ...item, pago: item.pago ? 0 : 1 });
    load();
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-4 pt-3 pb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-gray-900">Financeiro</Text>
          <TouchableOpacity className="bg-primary-600 px-4 py-2 rounded-xl flex-row items-center" onPress={() => router.push('/financeiro/novo')}>
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-semibold ml-1">Novo</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 bg-green-50 rounded-xl p-3">
            <Text className="text-green-700 text-xs font-medium">Receitas</Text>
            <Text className="text-green-800 font-bold text-base">{formatCurrency(receitas)}</Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-xl p-3">
            <Text className="text-red-700 text-xs font-medium">Despesas</Text>
            <Text className="text-red-800 font-bold text-base">{formatCurrency(despesas)}</Text>
          </View>
          <View className={`flex-1 rounded-xl p-3 ${saldo >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <Text className={`text-xs font-medium ${saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Saldo</Text>
            <Text className={`font-bold text-base ${saldo >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{formatCurrency(saldo)}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={lancamentos}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, gap: 6 }}
        ListEmptyComponent={<EmptyState title="Nenhum lançamento" description="Toque em + Novo para adicionar" icon="💰" />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Ionicons name={item.tipo === 'receita' ? 'arrow-up' : 'arrow-down'} size={18} color={item.tipo === 'receita' ? '#16a34a' : '#dc2626'} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium text-sm">{item.descricao}</Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                <Text className="text-gray-400 text-xs">{formatDate(item.data)}</Text>
                {item.categoria && <Text className="text-gray-400 text-xs">• {item.categoria}</Text>}
              </View>
            </View>
            <View className="items-end">
              <Text className={`font-bold text-base ${item.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                {item.tipo === 'receita' ? '+' : '-'} {formatCurrency(item.valor)}
              </Text>
              <TouchableOpacity onPress={() => togglePago(item)} className="mt-1">
                <View className={`px-2 py-0.5 rounded-full ${item.pago ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-xs font-medium ${item.pago ? 'text-green-700' : 'text-yellow-700'}`}>
                    {item.pago ? 'Pago' : 'Pendente'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
