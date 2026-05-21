import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDB } from '@/contexts/AppContext';
import { getEmpresa, updateEmpresa } from '@/database';
import type { Empresa } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ConfiguracoesScreen() {
  const db = useDB();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUri, setLogoUri] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmpresa(db).then(e => {
      if (e) {
        setEmpresa(e);
        setNome(e.nome);
        setCnpj(e.cnpj ?? '');
        setEndereco(e.endereco ?? '');
        setTelefone(e.telefone ?? '');
        setEmail(e.email ?? '');
        setLogoUri(e.logo_uri ?? '');
      }
    });
  }, []);

  async function selecionarLogo() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Permita o acesso à galeria'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  }

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome da empresa'); return; }
    setLoading(true);
    try {
      await updateEmpresa(db, { nome: nome.trim(), cnpj: cnpj || undefined, endereco: endereco || undefined, telefone: telefone || undefined, email: email || undefined, logo_uri: logoUri || undefined });
      Alert.alert('Salvo!', 'Configurações atualizadas com sucesso');
    } catch { Alert.alert('Erro', 'Não foi possível salvar'); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="items-center mb-6">
            <TouchableOpacity onPress={selecionarLogo} className="relative">
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : (
                <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center">
                  <Text className="text-primary-600 font-bold text-3xl">{nome.charAt(0) || 'E'}</Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-primary-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-lg">📷</Text>
              </View>
            </TouchableOpacity>
            <Text className="text-gray-400 text-xs mt-2">Toque para alterar o logo</Text>
          </View>

          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dados da Empresa</Text>
          <Input label="Nome da Empresa *" value={nome} onChangeText={setNome} placeholder="Minha Empresa" />
          <Input label="CNPJ" value={cnpj} onChangeText={setCnpj} placeholder="00.000.000/0000-00" keyboardType="numeric" />
          <Input label="Endereço" value={endereco} onChangeText={setEndereco} placeholder="Rua, número, cidade - UF" />
          <Input label="Telefone" value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
          <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="empresa@email.com" keyboardType="email-address" autoCapitalize="none" />

          <Button title="Salvar Configurações" onPress={salvar} loading={loading} />

          <View className="mt-8 items-center">
            <Text className="text-gray-300 text-xs">Gestão de Negócios v1.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
