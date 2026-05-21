import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  title, variant = 'primary', size = 'md', loading, disabled, style, ...props
}: ButtonProps) {
  const base = 'rounded-xl items-center justify-center flex-row';
  const variants = {
    primary: 'bg-primary-600',
    secondary: 'bg-gray-100 border border-gray-300',
    danger: 'bg-red-500',
    ghost: 'bg-transparent',
  };
  const sizes = {
    sm: 'px-3 py-2',
    md: 'px-5 py-3',
    lg: 'px-6 py-4',
  };
  const textColors = {
    primary: 'text-white',
    secondary: 'text-gray-700',
    danger: 'text-white',
    ghost: 'text-primary-600',
  };
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'secondary' ? '#374151' : '#ffffff'} style={{ marginRight: 8 }} />}
      <Text className={`font-semibold ${textColors[variant]} ${textSizes[size]}`}>{title}</Text>
    </TouchableOpacity>
  );
}
