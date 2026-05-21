import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
}

export default function Badge({ label, color = '#e5e7eb', textColor = '#374151' }: BadgeProps) {
  return (
    <View style={{ backgroundColor: color + '33', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
