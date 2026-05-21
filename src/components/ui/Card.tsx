import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, padding = 'md', className, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };
  return (
    <View
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${paddings[padding]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
