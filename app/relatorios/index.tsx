import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDB } from '@/contexts/AppContext';
import { getFinanceiro, getVendas, getProdutos } from '@/database';
import { formatCurrency } from '@/utils/formatters';
import type { Financeiro, Venda, Produto } from '@/types';

export default function RelatoriosScreen() {
  const db = useDB();
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setFinanceiro(await getFinanceiro(db));
    setVendas(await getVendas(db));
    setProdutos(await getProdutos(db));
  }, [db]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const hoje = new Date().toISOString().split('T')[0];
  const mes = hoje.substring(0, 7);

  const vendasHoje = vendas.filter(v => v.criado_em.startsWith(hoje));
  const totalHoje = vendasHoje.reduce((a, v) => a + v.total, 0);

  const vendasMes = vendas.filter(v => v.criado_em.startsWith(mes));
  const totalMes = vendasMes.reduce((a, v) => a + v.total, 0);

  const receitasMes = financeiro.filter(f => f.tipo === 'receita' && f.data.startsWith(mes) && f.pago).reduce((a, f) => a + f.valor, 0);
  const despesasMes = financeiro.filter(f => f.tipo === 'despesa' && f.data.startsWith(mes) && f.pago).reduce((a, f) => a + f.valor, 0);

  const produtosBaixoEstoque = produtos.filter(p => p.estoque <= p.estoque_minimo);
  const receitasTotal = financeiro.filter(f => f.tipo === 'receita' && f.pago).reduce((a, f) => a + f.valor, 0);
  const despesasTotal = financeiro.filter(f => f.tipo === 'despesa' && f.pago).reduce((a, f) => a + f.valor, 0);

  const cards = [
    { titulo: 'Vendas Hoje', valor: formatCurrency(totalHoje), sub: `${vendasHoje.length} venda(s)`, icon: 'today' as const, color: '#3b82f6' },
    { titulo: 'Vendas no Mês', valor: formatCurrency(totalMes), sub: `${vendasMes.length} venda(s)`, icon: 'calendar' as const, color: '#10b981' },
    { titulo: 'Receitas no Mês', valor: formatCurrency(receitasMes), sub: 'recebidas', icon: 'arrow-up-circle' as const, color: '#16a34a' },
    { titulo: 'Despesas no Mês', valor: formatCurrency(despesasMes), sub: 'pagas', icon: 'arrow-down-circle' as const, color: '#dc2626' },
    { titulo: 'Lucro Total (geral)', valor: formatCurrency(receitasTotal - despesasTotal), sub: 'receitas - despesas', icon: 'trending-up' as const, color: '#7c3aed' },
    { titulo: 'Produtos c/ Baixo Estoque', valor: String(produtosBaixoEstoque.length), sub: 'precisam de reposição', icon: 'warning' as const, color: '#d97706' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-lg font-bold text-gray-800 mb-4">Resumo Geral</Text>
        <View style={{ gap: 10 }}>
          {cards.map((card, i) => (
            <View key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center">
              <View style={{ backgroundColor: card.color + '18', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name={card.icon} size={22} color={card.color} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs">{card.titulo}</Text>
                <Text style={{ color: card.color }} className="text-xl font-bold">{card.valor}</Text>
                <Text className="text-gray-400 text-xs">{card.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {produtosBaixoEstoque.length > 0 && (
          <View className="mt-6">
            <Text className="text-base font-semibold text-gray-700 mb-3">Estoque Crítico</Text>
            <View style={{ gap: 6 }}>
              {produtosBaixoEstoque.map(p => (
                <View key={p.id} className="bg-red-50 rounded-xl p-3 border border-red-200 flex-row justify-between items-center">
                  <View>
                    <Text className="text-gray-900 font-medium text-sm">{p.nome}</Text>
                    <Text className="text-red-600 text-xs">Mínimo: {p.estoque_minimo}</Text>
                  </View>
                  <View className="bg-red-500 px-2 py-1 rounded-lg">
                    <Text className="text-white font-bold text-sm">{p.estoque}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
