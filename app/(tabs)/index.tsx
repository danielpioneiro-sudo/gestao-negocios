import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/contexts/AppContext';
import { getDashboardStats } from '@/database';
import { formatCurrency } from '@/utils/formatters';
import type { DashboardStats } from '@/types';

interface StatCard {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  alert?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { db, isReady } = useAppContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!db) return;
    const s = await getDashboardStats(db);
    setStats(s);
  }, [db]);

  useEffect(() => { if (isReady) load(); }, [isReady, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const statCards: StatCard[] = stats ? [
    { label: 'Vendas Hoje', value: String(stats.vendasHoje), icon: 'cart', color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Faturamento Hoje', value: formatCurrency(stats.totalHoje), icon: 'cash', color: '#10b981', bg: '#d1fae5' },
    { label: 'Pedidos Abertos', value: String(stats.pedidosPendentes), icon: 'document-text', color: '#f59e0b', bg: '#fef3c7', alert: stats.pedidosPendentes > 0 },
    { label: 'OS Abertas', value: String(stats.osPendentes), icon: 'construct', color: '#8b5cf6', bg: '#ede9fe', alert: stats.osPendentes > 0 },
    { label: 'Estoque Baixo', value: String(stats.produtosBaixoEstoque), icon: 'warning', color: '#ef4444', bg: '#fee2e2', alert: stats.produtosBaixoEstoque > 0 },
    { label: 'Contas a Vencer', value: String(stats.contasVencer), icon: 'calendar', color: '#f97316', bg: '#ffedd5', alert: stats.contasVencer > 0 },
  ] : [];

  const quickActions = [
    { label: 'Nova Venda', icon: 'cart' as const, route: '/(tabs)/pdv' },
    { label: 'Novo Pedido', icon: 'document-text' as const, route: '/pedido/novo' },
    { label: 'Nova OS', icon: 'construct' as const, route: '/os/novo' },
    { label: 'Novo Cliente', icon: 'person-add' as const, route: '/cliente/novo' },
    { label: 'Financeiro', icon: 'wallet' as const, route: '/financeiro/index' },
    { label: 'Agenda', icon: 'calendar' as const, route: '/agenda/index' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-gray-400 text-sm">Visão geral do seu negócio</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/configuracoes/index')} className="bg-white p-3 rounded-full shadow-sm">
            <Ionicons name="settings-outline" size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap" style={{ gap: 8, marginBottom: 24 }}>
          {statCards.map((card, i) => (
            <View key={i} style={{ width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
              <View style={{ backgroundColor: card.bg, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Ionicons name={card.icon} size={18} color={card.color} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: card.alert ? card.color : '#111827' }}>{card.value}</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{card.label}</Text>
            </View>
          ))}
        </View>

        <Text className="text-base font-semibold text-gray-700 mb-3">Ações Rápidas</Text>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={{ width: '30%', backgroundColor: 'white', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 }}
              onPress={() => router.push(action.route as any)}
            >
              <Ionicons name={action.icon} size={26} color="#2563eb" />
              <Text style={{ fontSize: 11, color: '#374151', marginTop: 6, textAlign: 'center', fontWeight: '500' }}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
