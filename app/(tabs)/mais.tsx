import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  route: string;
}

const menuItems: MenuItem[] = [
  { label: 'Serviços', description: 'Catálogo de serviços', icon: 'briefcase', color: '#8b5cf6', bg: '#ede9fe', route: '/servico/index' },
  { label: 'Pedidos', description: 'Orçamentos e pedidos', icon: 'document-text', color: '#f59e0b', bg: '#fef3c7', route: '/pedido/index' },
  { label: 'Ordens de Serviço', description: 'OS e reparos', icon: 'construct', color: '#06b6d4', bg: '#cffafe', route: '/os/index' },
  { label: 'Financeiro', description: 'Receitas e despesas', icon: 'wallet', color: '#10b981', bg: '#d1fae5', route: '/financeiro/index' },
  { label: 'Agenda', description: 'Compromissos', icon: 'calendar', color: '#ec4899', bg: '#fce7f3', route: '/agenda/index' },
  { label: 'Relatórios', description: 'Análises e gráficos', icon: 'bar-chart', color: '#3b82f6', bg: '#dbeafe', route: '/relatorios/index' },
  { label: 'Configurações', description: 'Dados da empresa', icon: 'settings', color: '#6b7280', bg: '#f3f4f6', route: '/configuracoes/index' },
];

export default function MaisScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100 px-4 pt-4 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Menu</Text>
        <Text className="text-gray-400 text-sm">Todos os módulos</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center"
            onPress={() => router.push(item.route as any)}
          >
            <View style={{ backgroundColor: item.bg, width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">{item.label}</Text>
              <Text className="text-gray-400 text-sm">{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
