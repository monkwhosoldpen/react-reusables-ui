import { View, TouchableOpacity, Image, SafeAreaView, StyleSheet, ScrollView } from "react-native"
import { Text } from "~/components/ui/text"
import { MaterialIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { SuperMenuProps } from './supermenu.types'

export default function SuperMenuDesktop({
  essentialServices,
  citizenServices,
  patrioticStore,
  quickLinks,
  onServicePress,
  onQuickLinkPress,
  style,
  textStyle
}: SuperMenuProps) {
  const insets = useSafeAreaInsets()
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()

  // Helper function to determine if dark mode
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000'
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2'
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B'

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
      paddingTop: insets.top,
    },
    mainContent: {
      flex: 1,
      maxWidth: 1200,
      width: '100%',
      marginHorizontal: 'auto',
      padding: Number(design.spacing.padding.card),
      paddingTop: Number(design.spacing.padding.section),
    },
    header: {
      padding: Number(design.spacing.padding.card),
      paddingTop: Number(design.spacing.padding.section),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.primary,
      borderRadius: Number(design.radius.lg),
      marginBottom: Number(design.spacing.margin.section),
    },
    section: {
      backgroundColor: colorScheme.colors.card,
      borderRadius: Number(design.radius.lg),
      padding: Number(design.spacing.padding.card),
      marginTop: Number(design.spacing.margin.section),
      marginBottom: Number(design.spacing.margin.section),
    },
    sectionTitle: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '700',
      marginBottom: Number(design.spacing.margin.card),
      color: colorScheme.colors.text,
    },
    sectionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Number(design.spacing.gap),
    },
    serviceCard: {
      backgroundColor: colorScheme.colors.background,
      borderRadius: Number(design.radius.md),
      padding: Number(design.spacing.padding.card),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
      flex: 1,
      minWidth: 200,
      maxWidth: '25%',
    },
    serviceIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${colorScheme.colors.primary}1A`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Number(design.spacing.margin.item),
    },
    serviceTitle: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '600',
      color: colorScheme.colors.text,
      textAlign: 'center',
    },
    serviceSubtitle: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: subtitleColor,
      textAlign: 'center',
      marginTop: 4,
    },
    quickLinks: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Number(design.spacing.gap),
    },
    quickLinkItem: {
      backgroundColor: colorScheme.colors.background,
      borderRadius: Number(design.radius.md),
      padding: Number(design.spacing.padding.item),
      flexDirection: 'row',
      alignItems: 'center',
      gap: Number(design.spacing.gap),
      flex: 1,
      minWidth: 150,
    },
    row: {
      flexDirection: 'row',
      gap: Number(design.spacing.gap),
    },
    col: {
      flex: 1,
    },
  });

  const renderServiceCard = (item: { icon: string; title: string; subtitle?: string }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => onServicePress?.(item)}
    >
      <View style={styles.serviceIcon}>
        <MaterialIcons name={item.icon as any} size={24} color={colorScheme.colors.primary} />
      </View>
      <Text style={styles.serviceTitle}>{item.title}</Text>
      {item.subtitle && <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, style]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Number(design.spacing.padding.card),
          paddingTop: Number(design.spacing.padding.card)
        }}
      >
        <View style={styles.mainContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={{ color: colorScheme.colors.background, fontSize: Number(design.spacing.fontSize['2xl']), fontWeight: '700' }}>
              SuperMenu
            </Text>
          </View>

          {/* Main Content Row */}
          <View style={styles.row}>
            {/* Essential Services Section */}
            <View style={[styles.section, styles.col, { flex: 2 }]}>
              <Text style={styles.sectionTitle}>Essential Services</Text>
              <View style={styles.sectionGrid}>
                {essentialServices.map((service, index) => renderServiceCard(service))}
              </View>
            </View>

            {/* Quick Links Section */}
            <View style={[styles.section, styles.col, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Quick Links</Text>
              <View style={styles.quickLinks}>
                {quickLinks.map((link, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.quickLinkItem}
                    onPress={() => onQuickLinkPress?.(link)}
                  >
                    <MaterialIcons name={link.icon as any} size={20} color={colorScheme.colors.primary} />
                    <Text style={styles.serviceTitle}>{link.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Citizen Services Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Citizen Services</Text>
            <View style={styles.sectionGrid}>
              {citizenServices.map((service, index) => renderServiceCard(service))}
            </View>
          </View>

          {/* Patriotic Store Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patriotic Store</Text>
            <View style={styles.sectionGrid}>
              {patrioticStore.map((item, index) => renderServiceCard(item))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
} 