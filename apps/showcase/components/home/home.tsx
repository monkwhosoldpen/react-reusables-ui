'use client';

import { useAuth } from '~/lib/core/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  
  // If still loading, show nothing to prevent flash
  if (loading) {
    return null;
  }

  // Apply design system tokens
  const containerStyle = {
    ...styles.container,
    backgroundColor: colorScheme.colors.background,
    paddingBottom: insets.bottom + Number(design.spacing.padding.card),
    paddingTop: Number(design.spacing.padding.card)
  };

  const contentStyle = {
    ...styles.content,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
    backgroundColor: colorScheme.colors.card,
  };

  const titleStyle = {
    color: colorScheme.colors.primary,
    fontSize: Number(design.spacing.fontSize.xl),
    marginBottom: Number(design.spacing.margin.card),
  };

  const subtitleStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.lg),
    opacity: 0.8,
  };

  const descriptionStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.base),
    opacity: 0.7,
  };

  return (
    <ScrollView style={containerStyle}>
      {user ? (
        <View style={contentStyle}>
          <View style={styles.textContainer}>
            <Text style={titleStyle}>
              nchat
            </Text>
            <Text style={subtitleStyle}>
              Your messaging app for everyday communication
            </Text>
            <Text style={descriptionStyle}>
              Connect with friends, family, and colleagues in a simple, secure environment.
              Share messages, media, and more with our intuitive platform.
            </Text>
            <Button
              size="lg"
              onPress={() => router.push('/feed')}
              style={{
                marginTop: Number(design.spacing.margin.card),
                backgroundColor: colorScheme.colors.primary,
                borderRadius: Number(design.radius.md)
              }}
            >
              <Text style={{ color: 'white', fontSize: Number(design.spacing.fontSize.base) }}>
                Feed
              </Text>
            </Button>
          </View>
        </View>
      ) : (
        <View style={contentStyle}>
          <View style={styles.textContainer}>
            <Text style={titleStyle}>
              nchat
            </Text>
            <Text style={subtitleStyle}>
              Your messaging app for everyday communication
            </Text>
            <Text style={descriptionStyle}>
              Connect with friends, family, and colleagues in a simple, secure environment.
              Share messages, media, and more with our intuitive platform.
            </Text>
            <Button
              size="lg"
              onPress={() => router.push('/login')}
              style={{
                marginTop: Number(design.spacing.margin.card),
                backgroundColor: colorScheme.colors.primary,
                borderRadius: Number(design.radius.md)
              }}
            >
              <Text style={{ color: 'white', fontSize: Number(design.spacing.fontSize.base) }}>
                Get Started
              </Text>
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  textContainer: {
    alignItems: 'center',
    gap: 16,
  },
});

