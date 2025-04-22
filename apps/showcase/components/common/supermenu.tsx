import { ScrollView, View, TouchableOpacity, Image, SafeAreaView, StyleSheet, useWindowDimensions } from "react-native"
import { Text } from "~/components/ui/text"
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { cn } from '~/lib/utils'
import {
  essentialServices,
  citizenServices,
  patrioticStore,
  newsAndUpdates,
  civicEngagement,
  educationAndAwareness,
  governmentServices,
  quickLinks
} from '../../lib/constants/supermenu'
import { SuperMenuProps } from './supermenu.types'

export default function SuperMenu({
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
  const { width } = useWindowDimensions()

  const isDesktop = width >= 768 // Assuming 768px as the breakpoint for desktop

  // Helper function to determine if dark mode
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000'
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2'
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B'
  const timestampColor = isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748B'

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.primary,
    },
    headerContent: {
      width: '100%',
      maxWidth: 1200,
      alignSelf: 'center',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: 'transparent',
      borderRadius: 12,
      marginVertical: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    itemSelected: {
      backgroundColor: 'rgba(128,128,128,0.05)',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: '#E8EEF2',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    itemContent: {
      flex: 1,
      marginRight: 12,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: '#1E293B',
    },
    itemSubtitle: {
      fontSize: 14,
      color: '#64748B',
      lineHeight: 20,
    },
    timeStamp: {
      fontSize: 12,
      color: '#94A3B8',
      marginBottom: 4,
    },
    messageCount: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
      backgroundColor: colorScheme.colors.primary,
    },
    messageCountText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    sectionHeader: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 8,
      backgroundColor: 'transparent',
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#94A3B8',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    card: {
      padding: 20,
      borderRadius: 16,
      marginTop: 24,
      backgroundColor: colorScheme.colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
      color: '#1E293B',
    },
    settingDescription: {
      fontSize: 16,
      color: '#64748B',
      marginBottom: 16,
      lineHeight: 24,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 12,
      backgroundColor: colorScheme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={[styles.container, style]}>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colorScheme.colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={[isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 1200, alignSelf: 'center', width: '100%' } : {}]}>
          {/* Document Vault */}
          <View style={[isDesktop ? { width: '50%', paddingRight: 16 } : { marginTop: 24, paddingHorizontal: 16 }]}>
            <TouchableOpacity style={[styles.item, { backgroundColor: colorScheme.colors.card }]}>
              <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                <Ionicons name="document-text-outline" size={24} color={colorScheme.colors.primary} />
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]}>Document Vault</Text>
                <Text style={[styles.itemSubtitle, { color: subtitleColor }]}>Access your important documents</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
            </TouchableOpacity>
          </View>

          {/* Essential Services */}
          <View style={[isDesktop ? { width: '50%', paddingLeft: 16 } : { marginTop: 24, paddingHorizontal: 16 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>ESSENTIAL SERVICES</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {essentialServices.map((service, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={{ alignItems: 'center', marginRight: 32 }}
                  onPress={() => onServicePress?.(service)}
                >
                  <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                    <MaterialIcons name={service.icon as any} size={24} color={colorScheme.colors.primary} />
                  </View>
                  <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, marginTop: 4 }]}>{service.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Citizen Services */}
          <View style={[isDesktop ? { width: '50%', paddingRight: 16 } : { marginTop: 24, paddingHorizontal: 16 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>CITIZEN SERVICES</Text>
            </View>
            <View style={{ backgroundColor: colorScheme.colors.card, borderRadius: 12, padding: 16 }}>
              {citizenServices.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.item,
                    index < citizenServices.length - 1 && { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }
                  ]}
                  onPress={() => onServicePress?.(service)}
                >
                  <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                    <MaterialIcons name={service.icon as any} size={24} color={colorScheme.colors.primary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]}>{service.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: subtitleColor }]}>{service.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Patriotic Store */}
          <View style={[isDesktop ? { width: '50%', paddingLeft: 16 } : { marginTop: 24, paddingHorizontal: 16 }]}>
            <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
              <View style={{ paddingHorizontal: 16 }}>
                <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Patriotic Store</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {patrioticStore.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={{ alignItems: 'center', width: '22%', marginBottom: 32 }}
                      onPress={() => onServicePress?.(item)}
                    >
                      <View style={[styles.avatar, { width: 64, height: 64, backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                        <MaterialIcons name={item.icon as any} size={30} color={colorScheme.colors.primary} />
                      </View>
                      <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, textAlign: 'center', marginTop: 8 }]}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}