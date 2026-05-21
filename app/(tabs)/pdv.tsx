import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAppContext } from '@/contexts/AppContext';
import { getProdutos, getProdutoByCodigo, createVenda } from '@/database';
import { formatCurrency } from '@/utils/formatters';
import type { Produto, CarrinhoItem } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SelectInput } from '@/components/ui/Input';

const FORMAS_PAGAMENTO = [
  { label: 'Dinheiro', value: 'dinheiro' },
  { label: 'Cartão de Crédito', value: 'cartao_credito' },
  { label: 'Cartão de Débito', value: 'cartao_debito' },
  { label: 'PIX', value: 'pix' },
  { label: 'Boleto', value: 'boleto' },
];

export default function PDVScreen() {
  const { db, isReady } = useAppContext();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [search, setSearch] = useState('');
  const [desconto, setDesconto] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [clienteNome, setClienteNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const load = useCallback(async () => {
    if (!db) return;
    setProdutos(await getProdutos(db));
  }, [db]);

  useEffect(() => { if (isReady) load(); }, [isReady, load]);

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.codigo ?? '').includes(search)
  );

  function addToCart(produto: Produto) {
    setCarrinho(prev => {
      const existing = prev.find(i => i.produto_id === produto.id);
      if (existing) {
        return prev.map(i => i.produto_id === produto.id
          ? { ...i, quantidade: i.quantidade + 1 }
          : i
        );
      }
      return [...prev, { produto_id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1 }];
    });
  }

  function removeFromCart(produtoId: number) {
    setCarrinho(prev => prev.filter(i => i.produto_id !== produtoId));
  }

  function changeQty(produtoId: number, delta: number) {
    setCarrinho(prev => prev
      .map(i => i.produto_id === produtoId ? { ...i, quantidade: Math.max(0, i.quantidade + delta) } : i)
      .filter(i => i.quantidade > 0)
    );
  }

  const subtotal = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const descontoVal = parseFloat(desconto.replace(',', '.')) || 0;
  const total = Math.max(0, subtotal - descontoVal);

  async function handleBarcodeScanned({ data }: { data: string }) {
    setScannerVisible(false);
    if (!db) return;
    const produto = await getProdutoByCodigo(db, data);
    if (produto) {
      addToCart(produto);
    } else {
      Alert.alert('Produto não encontrado', `Código: ${data}`);
    }
  }

  async function finalizarVenda() {
    if (carrinho.length === 0) return;
    if (!db) return;
    setLoading(true);
    try {
      await createVenda(
        db,
        {
          cliente_nome: clienteNome || undefined,
          total,
          desconto: descontoVal,
          forma_pagamento: formaPagamento as any,
        },
        carrinho.map(item => ({
          produto_id: item.produto_id,
          descricao: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          subtotal: item.preco * item.quantidade,
        }))
      );
      setCarrinho([]);
      setDesconto('');
      setClienteNome('');
      setFormaPagamento('dinheiro');
      setCheckoutVisible(false);
      Alert.alert('Venda realizada!', `Total: ${formatCurrency(total)}`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível finalizar a venda');
    } finally {
      setLoading(false);
    }
  }

  async function openScanner() {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações');
        return;
      }
    }
    setScannerVisible(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 flex-row">
        {/* Left: Products */}
        <View className="flex-1 border-r border-gray-200">
          <View className="bg-white px-3 pt-4 pb-2 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-2">PDV</Text>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-gray-100 rounded-xl flex-row items-center px-3 py-2">
                <Ionicons name="search" size={16} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-2 text-gray-900 text-sm"
                  placeholder="Buscar produto..."
                  placeholderTextColor="#9ca3af"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              <TouchableOpacity className="bg-gray-100 rounded-xl p-2 items-center justify-center" onPress={openScanner}>
                <Ionicons name="barcode" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={filteredProdutos}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 8, gap: 6 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white rounded-xl p-3 border border-gray-100 flex-row items-center"
                onPress={() => addToCart(item)}
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium text-sm" numberOfLines={2}>{item.nome}</Text>
                  <Text className="text-primary-600 font-semibold text-sm mt-0.5">{formatCurrency(item.preco)}</Text>
                  <Text className="text-gray-400 text-xs">Estoque: {item.estoque}</Text>
                </View>
                <View className="bg-primary-600 w-7 h-7 rounded-full items-center justify-center ml-2">
                  <Ionicons name="add" size={18} color="white" />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Right: Cart */}
        <View style={{ width: '42%' }} className="bg-white">
          <View className="px-3 pt-4 pb-2 border-b border-gray-100">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-gray-900">Carrinho</Text>
              {carrinho.length > 0 && (
                <TouchableOpacity onPress={() => setCarrinho([])}>
                  <Text className="text-red-500 text-xs">Limpar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {carrinho.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="cart-outline" size={40} color="#d1d5db" />
              <Text className="text-gray-400 text-xs mt-2 text-center">Toque nos produtos para adicionar</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={carrinho}
                keyExtractor={item => String(item.produto_id)}
                contentContainerStyle={{ padding: 8, gap: 6 }}
                renderItem={({ item }) => (
                  <View className="border border-gray-100 rounded-xl p-2">
                    <Text className="text-gray-900 text-xs font-medium" numberOfLines={2}>{item.nome}</Text>
                    <Text className="text-primary-600 text-xs font-semibold">{formatCurrency(item.preco)}</Text>
                    <View className="flex-row items-center justify-between mt-1.5">
                      <View className="flex-row items-center gap-1">
                        <TouchableOpacity className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center" onPress={() => changeQty(item.produto_id, -1)}>
                          <Ionicons name="remove" size={12} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-gray-900 font-bold text-sm w-6 text-center">{item.quantidade}</Text>
                        <TouchableOpacity className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center" onPress={() => changeQty(item.produto_id, 1)}>
                          <Ionicons name="add" size={12} color="#2563eb" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.produto_id)}>
                        <Ionicons name="trash-outline" size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">= {formatCurrency(item.preco * item.quantidade)}</Text>
                  </View>
                )}
              />
              <View className="p-3 border-t border-gray-100">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-500 text-sm">Subtotal</Text>
                  <Text className="text-gray-900 font-medium text-sm">{formatCurrency(subtotal)}</Text>
                </View>
                {descontoVal > 0 && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-red-500 text-sm">Desconto</Text>
                    <Text className="text-red-500 text-sm">- {formatCurrency(descontoVal)}</Text>
                  </View>
                )}
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-900 font-bold">Total</Text>
                  <Text className="text-primary-600 font-bold text-lg">{formatCurrency(total)}</Text>
                </View>
                <Button title="Finalizar" onPress={() => setCheckoutVisible(true)} size="sm" />
              </View>
            </>
          )}
        </View>
      </View>

      {/* Barcode Scanner Modal */}
      <Modal visible={scannerVisible} animationType="slide">
        <View className="flex-1 bg-black">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
          />
          <View className="absolute inset-x-0 top-16 items-center">
            <Text className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded-xl">Aponte para o código</Text>
          </View>
          <View className="absolute inset-x-0 bottom-12 items-center">
            <TouchableOpacity className="bg-white/20 px-8 py-4 rounded-2xl" onPress={() => setScannerVisible(false)}>
              <Text className="text-white font-semibold text-lg">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal visible={checkoutVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-4 pb-3 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-900">Finalizar Venda</Text>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 px-5 pt-4">
              <Input label="Cliente (opcional)" value={clienteNome} onChangeText={setClienteNome} placeholder="Nome do cliente" />
              <Input
                label="Desconto (R$)"
                value={desconto}
                onChangeText={setDesconto}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />
              <SelectInput label="Forma de Pagamento" value={formaPagamento} options={FORMAS_PAGAMENTO} onChange={setFormaPagamento} />

              <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                <Text className="text-gray-500 text-sm mb-3">Resumo</Text>
                {carrinho.map(item => (
                  <View key={item.produto_id} className="flex-row justify-between py-1">
                    <Text className="text-gray-700 flex-1 text-sm">{item.nome} x{item.quantidade}</Text>
                    <Text className="text-gray-900 text-sm font-medium">{formatCurrency(item.preco * item.quantidade)}</Text>
                  </View>
                ))}
                <View className="border-t border-gray-200 mt-2 pt-2">
                  <View className="flex-row justify-between">
                    <Text className="font-bold text-gray-900">TOTAL</Text>
                    <Text className="font-bold text-primary-600 text-lg">{formatCurrency(total)}</Text>
                  </View>
                </View>
              </View>

              <Button title="Confirmar Venda" onPress={finalizarVenda} loading={loading} size="lg" />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
