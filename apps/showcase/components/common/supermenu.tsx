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

  const isDesktop = width >= 768
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000'
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2'
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B'
  const timestampColor = isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748B'

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: insets.bottom + 20,
    },
    desktopContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 20,
      paddingHorizontal: 20,
    },
    sectionContainer: {
      marginBottom: 32,
      paddingHorizontal: 4,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colorScheme.colors.card,
      borderRadius: 12,
      marginVertical: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      backgroundColor: `${colorScheme.colors.primary}1A`,
    },
    itemContent: {
      flex: 1,
      marginRight: 16,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: colorScheme.colors.text,
    },
    itemSubtitle: {
      fontSize: 14,
      color: subtitleColor,
      lineHeight: 20,
    },
    sectionHeader: {
      paddingVertical: 16,
      paddingHorizontal: 4,
      marginTop: 8,
      backgroundColor: 'transparent',
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: subtitleColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    horizontalScrollContainer: {
      paddingHorizontal: 4,
      marginBottom: 16,
    },
    serviceItem: {
      alignItems: 'center',
      marginRight: 32,
      width: 80,
      paddingHorizontal: 4,
    },
    serviceAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${colorScheme.colors.primary}1A`,
      marginBottom: 8,
    },
    serviceTitle: {
      fontSize: 12,
      fontWeight: '500',
      color: colorScheme.colors.text,
      textAlign: 'center',
    },
    cardContainer: {
      backgroundColor: colorScheme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
    },
  });

  return (
    <SafeAreaView style={[styles.container, style]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop ? styles.desktopContainer : styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Vault */}
        <View style={[isDesktop ? { width: '50%', paddingRight: 16 } : styles.sectionContainer]}>
          <TouchableOpacity style={styles.item}>
            <View style={styles.avatar}>
              <Ionicons name="document-text-outline" size={24} color={colorScheme.colors.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Document Vault</Text>
              <Text style={styles.itemSubtitle}>Access your important documents</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </View>

        {/* Essential Services */}
        <View style={[isDesktop ? { width: '50%', paddingLeft: 16 } : styles.sectionContainer]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>ESSENTIAL SERVICES</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScrollContainer}
          >
            {essentialServices.map((service, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.serviceItem}
                onPress={() => onServicePress?.(service)}
              >
                <View style={styles.serviceAvatar}>
                  <MaterialIcons name={service.icon as any} size={24} color={colorScheme.colors.primary} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Citizen Services */}
        <View style={[isDesktop ? { width: '50%', paddingRight: 16 } : styles.sectionContainer]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>CITIZEN SERVICES</Text>
          </View>
          <View style={styles.cardContainer}>
            {citizenServices.map((service, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  { backgroundColor: 'transparent', marginVertical: 0 },
                  index < citizenServices.length - 1 && { 
                    borderBottomWidth: 1, 
                    borderBottomColor: `${colorScheme.colors.text}1A`,
                    paddingBottom: 16,
                    marginBottom: 16
                  }
                ]}
                onPress={() => onServicePress?.(service)}
              >
                <View style={styles.avatar}>
                  <MaterialIcons name={service.icon as any} size={24} color={colorScheme.colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{service.title}</Text>
                  <Text style={styles.itemSubtitle}>{service.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Patriotic Store */}
        <View style={[isDesktop ? { width: '50%', paddingLeft: 16 } : styles.sectionContainer]}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionHeaderText, { marginBottom: 24 }]}>Patriotic Store</Text>
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

        {/* News & Updates */}
        <View style={[isDesktop ? { width: '50%', paddingRight: 16 } : styles.sectionContainer]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>NEWS & UPDATES</Text>
          </View>
          <View style={{ backgroundColor: colorScheme.colors.card, borderRadius: 12, padding: 16 }}>
            {newsAndUpdates.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  index < newsAndUpdates.length - 1 && { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }
                ]}
                onPress={() => onServicePress?.(item)}
              >
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={colorScheme.colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Civic Engagement */}
        <View style={[isDesktop ? { width: '50%', paddingLeft: 16 } : styles.sectionContainer]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>CIVIC ENGAGEMENT</Text>
          </View>
          <View style={{ backgroundColor: colorScheme.colors.card, borderRadius: 12, padding: 16 }}>
            {civicEngagement.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  index < civicEngagement.length - 1 && { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }
                ]}
                onPress={() => onServicePress?.(item)}
              >
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={colorScheme.colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Education & Awareness */}
        <View style={[isDesktop ? { width: '50%', paddingRight: 16 } : styles.sectionContainer]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>EDUCATION & AWARENESS</Text>
          </View>
          <View style={{ backgroundColor: colorScheme.colors.card, borderRadius: 12, padding: 16 }}>
            {educationAndAwareness.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  index < educationAndAwareness.length - 1 && { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }
                ]}
                onPress={() => onServicePress?.(item)}
              >
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={colorScheme.colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Government Services */}
        <View style={[isDesktop ? { width: '50%', paddingLeft: 16 } : styles.sectionContainer]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>GOVERNMENT SERVICES</Text>
          </View>
          <View style={{ backgroundColor: colorScheme.colors.card, borderRadius: 12, padding: 16 }}>
            {governmentServices.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  index < governmentServices.length - 1 && { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }
                ]}
                onPress={() => onServicePress?.(item)}
              >
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={colorScheme.colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}