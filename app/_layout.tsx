import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/contexts/AppContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cliente/novo" options={{ headerShown: true, title: 'Novo Cliente', presentation: 'modal' }} />
          <Stack.Screen name="cliente/[id]" options={{ headerShown: true, title: 'Cliente' }} />
          <Stack.Screen name="produto/novo" options={{ headerShown: true, title: 'Novo Produto', presentation: 'modal' }} />
          <Stack.Screen name="produto/[id]" options={{ headerShown: true, title: 'Produto' }} />
          <Stack.Screen name="servico/index" options={{ headerShown: true, title: 'Serviços' }} />
          <Stack.Screen name="servico/novo" options={{ headerShown: true, title: 'Novo Serviço', presentation: 'modal' }} />
          <Stack.Screen name="servico/[id]" options={{ headerShown: true, title: 'Serviço' }} />
          <Stack.Screen name="pedido/index" options={{ headerShown: true, title: 'Pedidos' }} />
          <Stack.Screen name="pedido/novo" options={{ headerShown: true, title: 'Novo Pedido', presentation: 'modal' }} />
          <Stack.Screen name="pedido/[id]" options={{ headerShown: true, title: 'Pedido' }} />
          <Stack.Screen name="os/index" options={{ headerShown: true, title: 'Ordens de Serviço' }} />
          <Stack.Screen name="os/novo" options={{ headerShown: true, title: 'Nova OS', presentation: 'modal' }} />
          <Stack.Screen name="os/[id]" options={{ headerShown: true, title: 'Ordem de Serviço' }} />
          <Stack.Screen name="financeiro/index" options={{ headerShown: true, title: 'Financeiro' }} />
          <Stack.Screen name="financeiro/novo" options={{ headerShown: true, title: 'Novo Lançamento', presentation: 'modal' }} />
          <Stack.Screen name="agenda/index" options={{ headerShown: true, title: 'Agenda' }} />
          <Stack.Screen name="agenda/novo" options={{ headerShown: true, title: 'Novo Agendamento', presentation: 'modal' }} />
          <Stack.Screen name="relatorios/index" options={{ headerShown: true, title: 'Relatórios' }} />
          <Stack.Screen name="configuracoes/index" options={{ headerShown: true, title: 'Configurações' }} />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
