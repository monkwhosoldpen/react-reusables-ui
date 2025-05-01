import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { Card } from '~/components/ui/card';

export default function AIDashboardScreen() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={{ padding: Number(design.spacing.padding.card) }}
    >
      <Text style={[styles.title, { color: colorScheme.colors.text }]}>
        AI Dashboard
      </Text>

      <Card style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: colorScheme.colors.text }]}>
          Welcome to AI Dashboard
        </Text>
        <Text style={[styles.description, { color: colorScheme.colors.text }]}>
          This is a simple AI dashboard interface. More features coming soon!
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 