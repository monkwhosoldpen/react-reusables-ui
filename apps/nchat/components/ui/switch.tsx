import React from 'react';
import { Switch as RNSwitch, StyleSheet } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Switch({ value, onValueChange, disabled }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#e0e0e0', true: '#25D366' }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
      ios_backgroundColor="#e0e0e0"
      style={styles.switch}
    />
  );
}

const styles = StyleSheet.create({
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
}); 