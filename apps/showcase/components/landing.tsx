import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { LANDING_CONTENT } from '~/constants/landing';

export function Landing() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colorScheme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colorScheme.colors.text }]}>
              {LANDING_CONTENT.title}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colorScheme.colors.text, opacity: 0.7 }]}>
              {LANDING_CONTENT.subtitle}
            </Text>
          </View>

          <View style={styles.features}>
            {LANDING_CONTENT.features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: theme.colorScheme.colors.card }]}>
                <Text style={[styles.featureTitle, { color: theme.colorScheme.colors.text }]}>
                  {feature.icon} {feature.title}
                </Text>
                <Text style={[styles.featureText, { color: theme.colorScheme.colors.text, opacity: 0.7 }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.ctaContainer}>
            <View style={styles.ctaButtons}>
              {LANDING_CONTENT.ctas.map((cta, index) => (
                <Link key={index} href={cta.href} asChild>
                  <Button variant={cta.variant} style={styles.button}>
                    <Text style={[
                      styles.ctaText,
                      cta.variant === 'default' ? { color: theme.colorScheme.colors.background } : { color: theme.colorScheme.colors.text }
                    ]}>
                      {cta.text}
                    </Text>
                    <ChevronRight 
                      size={18} 
                      color={cta.variant === 'default' ? theme.colorScheme.colors.background : theme.colorScheme.colors.text} 
                    />
                  </Button>
                </Link>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 24,
  },
  features: {
    gap: 16,
    marginTop: 48,
  },
  featureCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ctaContainer: {
    marginTop: 48,
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 