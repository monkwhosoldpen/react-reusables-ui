import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { Stack } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
          headerStyle: {
            backgroundColor: theme.colorScheme.colors.card,
          },
          headerTintColor: theme.colorScheme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.colorScheme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colorScheme.colors.text }]}>
          Hello Home
        </Text>
      </View>
    </>
  );
} 