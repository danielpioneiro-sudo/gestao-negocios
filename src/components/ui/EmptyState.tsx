import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function EmptyState({ title, description, icon = '📭' }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <Text style={{ fontSize: 48 }}>{icon}</Text>
      <Text className="text-lg font-semibold text-gray-700 mt-4 text-center">{title}</Text>
      {description && <Text className="text-gray-400 text-center mt-2 text-sm">{description}</Text>}
    </View>
  );
}
