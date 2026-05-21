import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, Modal, FlatList } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>}
      <TextInput
        className={`bg-white border rounded-xl px-4 py-3 text-gray-900 text-base ${error ? 'border-red-400' : 'border-gray-300'}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SelectInput({ label, value, options, onChange, placeholder = 'Selecione...' }: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>}
      <TouchableOpacity
        className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center"
        onPress={() => setVisible(true)}
      >
        <Text className={selected ? 'text-gray-900 text-base' : 'text-gray-400 text-base'}>
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center px-8"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="bg-white rounded-2xl overflow-hidden">
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-5 py-4 border-b border-gray-100 ${item.value === value ? 'bg-primary-50' : ''}`}
                  onPress={() => { onChange(item.value); setVisible(false); }}
                >
                  <Text className={`text-base ${item.value === value ? 'text-primary-600 font-semibold' : 'text-gray-800'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
