import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { LANDING_CONTENT } from '~/constants/landing';

export function Landing() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const { theme } = useTheme();

  const MobileLayout = () => (
    <View style={styles.mobileContainer}>
      <ScrollView style={styles.mobileScroll}>
        <View style={styles.mobileContent}>
          <Text style={styles.mobileTagline}>{LANDING_CONTENT.tagline}</Text>
          <Text style={styles.mobileHeadline}>{LANDING_CONTENT.headline}</Text>
          <Text style={styles.mobileSubheadline}>{LANDING_CONTENT.subheadline}</Text>

          <View style={styles.mobileFeatureList}>
            {LANDING_CONTENT.features.map((feature, index) => (
              <View key={index} style={styles.mobileFeatureItem}>
                <Text style={styles.mobileFeatureTitle}>✓ {feature.title}:</Text>
                <Text style={styles.mobileFeatureText}>{feature.description}</Text>
              </View>
            ))}
          </View>

          <View style={styles.mobileImageContainer}>
            <Image
              source={{ uri: LANDING_CONTENT.heroImage }}
              style={styles.mobileHeroImage}
              resizeMode="cover"
            />
            <View style={styles.mobileStatsOverlay}>
              {LANDING_CONTENT.stats.map((stat, index) => (
                <View key={index} style={styles.mobileStatBadge}>
                  <Text style={styles.mobileStatText}>{stat.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.mobileCta}>
            {LANDING_CONTENT.ctas.map((cta, index) => (
              <Link key={index} href={cta.href} asChild>
                <Button variant={cta.variant} style={styles.mobileCtaButton}>
                  <Text style={[
                    styles.mobileCtaButtonText,
                    cta.variant === 'default' ? { color: 'white' } : { color: theme.colorScheme.colors.text }
                  ]}>
                    {cta.text}
                  </Text>
                  <ChevronRight 
                    size={18} 
                    color={cta.variant === 'default' ? 'white' : theme.colorScheme.colors.text} 
                  />
                </Button>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const DesktopLayout = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.mainSection}>
          <View style={styles.leftSection}>
            <Text style={styles.tagline}>{LANDING_CONTENT.tagline}</Text>
            <Text style={styles.headline}>{LANDING_CONTENT.headline}</Text>
            <Text style={styles.subheadline}>{LANDING_CONTENT.subheadline}</Text>

            <View style={styles.featureList}>
              {LANDING_CONTENT.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureTitle}>✓ {feature.title}:</Text>
                  <Text style={styles.featureText}>{feature.description}</Text>
                </View>
              ))}
            </View>

            <View style={styles.ctaSection}>
              {LANDING_CONTENT.ctas.map((cta, index) => (
                <Link key={index} href={cta.href} asChild>
                  <Button variant={cta.variant} style={styles.ctaButton}>
                    <Text style={[
                      styles.ctaButtonText,
                      cta.variant === 'default' ? { color: 'white' } : { color: theme.colorScheme.colors.text }
                    ]}>
                      {cta.text}
                    </Text>
                    <ChevronRight 
                      size={18} 
                      color={cta.variant === 'default' ? 'white' : theme.colorScheme.colors.text} 
                    />
                  </Button>
                </Link>
              ))}
            </View>
          </View>

          <View style={styles.rightSection}>
            <Image
              source={{ uri: LANDING_CONTENT.heroImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.statsOverlay}>
              {LANDING_CONTENT.stats.map((stat, index) => (
                <View key={index} style={styles.statBadge}>
                  <Text style={styles.statText}>{stat.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F5FAFA' }]}>
      {isSmallScreen ? <MobileLayout /> : <DesktopLayout />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  // Desktop Styles
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  mainSection: {
    padding: 16,
    flexDirection: 'row',
    gap: 32,
    width: '100%',
    maxWidth: 1000,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    maxWidth: 520,
    paddingRight: 16,
  },
  tagline: {
    color: '#4CD6C1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 56,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 18,
    color: '#4A4A4A',
    marginBottom: 32,
    lineHeight: 28,
  },
  featureList: {
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  featureText: {
    fontSize: 15,
    color: '#4A4A4A',
    flex: 1,
    lineHeight: 22,
  },
  ctaSection: {
    gap: 16,
    maxWidth: 440,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaButton: {
    backgroundColor: '#FF9B4A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#FF9B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rightSection: {
    flex: 1,
    position: 'relative',
    paddingLeft: 16,
  },
  heroImage: {
    width: '100%',
    height: 480,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    flexDirection: 'row',
    gap: 16,
  },
  statBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },

  // Mobile Styles
  mobileContainer: {
    flex: 1,
  },
  mobileScroll: {
    flex: 1,
  },
  mobileLogo: {
    height: 40,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  mobileContent: {
    padding: 16,
  },
  mobileTagline: {
    color: '#4CD6C1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  mobileHeadline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  mobileSubheadline: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 24,
    lineHeight: 24,
  },
  mobileFeatureList: {
    gap: 12,
    marginBottom: 24,
  },
  mobileFeatureItem: {
    gap: 6,
  },
  mobileFeatureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  mobileFeatureText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  mobileImageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  mobileHeroImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mobileStatsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 12,
  },
  mobileStatBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileStatText: {
    color: '#1A1A1A',
    fontSize: 13,
    fontWeight: '600',
  },
  mobileCta: {
    gap: 12,
  },
  mobileEmailInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileCtaButton: {
    backgroundColor: '#FF9B4A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#FF9B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mobileCtaButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
}); 