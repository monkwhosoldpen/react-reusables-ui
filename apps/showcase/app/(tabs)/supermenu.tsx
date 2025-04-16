import { ScrollView, View, TouchableOpacity, Image, SafeAreaView, StyleSheet } from "react-native"
import { Text } from "~/components/ui/text"
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'
import { cn } from '~/lib/utils'

export default function SuperMenu() {
  const insets = useSafeAreaInsets()
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()

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
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colorScheme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.primary }]}>U</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.background }]}>Hello, User</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.itemSubtitle, { color: colorScheme.colors.background, opacity: 0.8 }]}>Mumbai</Text>
                <MaterialIcons name="keyboard-arrow-down" size={22} color={colorScheme.colors.background} style={{ opacity: 0.8 }} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, backgroundColor: colorScheme.colors.background }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >

        {/* Scan & Pay Button */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <TouchableOpacity style={[styles.item, { backgroundColor: colorScheme.colors.card }]}>
            <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
              <Ionicons name="qr-code-outline" size={24} color={colorScheme.colors.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]}>Scan & Pay</Text>
              <Text style={[styles.itemSubtitle, { color: subtitleColor }]}>Scan any QR code to pay</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </View>

        {/* People Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>PEOPLE</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <TouchableOpacity style={{ alignItems: 'center', marginRight: 32 }}>
              <View style={[styles.avatar, { width: 56, height: 56, backgroundColor: `${colorScheme.colors.primary}1A`, borderColor: colorScheme.colors.primary, borderWidth: 1 }]}>
                <MaterialIcons name="person-add" size={24} color={colorScheme.colors.primary} />
              </View>
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, marginTop: 4 }]}>New</Text>
            </TouchableOpacity>
            {[
              { name: "Rahul", initial: "R" },
              { name: "Priya", initial: "P" },
              { name: "Amit", initial: "A" },
              { name: "Neha", initial: "N" },
              { name: "Vikram", initial: "V" },
            ].map((contact, index) => (
              <TouchableOpacity key={index} style={{ alignItems: 'center', marginRight: 32 }}>
                <View style={[styles.avatar, { width: 56, height: 56, backgroundColor: colorScheme.colors.card }]}>
                  <Text style={[styles.itemTitle, { color: colorScheme.colors.text, opacity: 0.6 }]}>{contact.initial}</Text>
                </View>
                <Text style={[styles.itemSubtitle, { color: colorScheme.colors.text, marginTop: 4 }]}>{contact.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>QUICK ACTIONS</Text>
          </View>
          <View style={{ backgroundColor: colorScheme.colors.card, borderRadius: 12, padding: 16 }}>
            {[
              { icon: "account-balance", title: "To Bank Account", subtitle: "Transfer money securely" },
              { icon: "phone-android", title: "To Mobile Number", subtitle: "Send to any mobile number" },
              { icon: "person", title: "To Self Account", subtitle: "Transfer between your accounts" },
              { icon: "account-balance-wallet", title: "Check Balance", subtitle: "View your account balance" },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  index < 3 && { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                  <MaterialIcons name={action.icon as any} size={24} color={colorScheme.colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]}>{action.title}</Text>
                  <Text style={[styles.itemSubtitle, { color: subtitleColor }]}>{action.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Money Transfers</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[
                  { icon: "account-balance", title: "To Bank\nAccount" },
                  { icon: "phone-android", title: "To Mobile\nNumber" },
                  { icon: "person", title: "To Self\nAccount" },
                  { icon: "bank-outline", title: "Check\nBalance" },
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={{ alignItems: 'center', width: '22%', marginBottom: 32 }}>
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

        {/* Recharge & Pay Bills Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Recharge & Pay Bills</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[
                  { icon: "mobile-friendly", title: "Mobile\nRecharge" },
                  { icon: "live-tv", title: "DTH" },
                  { icon: "bolt", title: "Electricity" },
                  { icon: "credit-card", title: "Credit Card\nBill" },
                  { icon: "gas-cylinder", title: "Gas\nCylinder" },
                  { icon: "water", title: "Water\nBill" },
                  { icon: "wifi", title: "Broadband" },
                  { icon: "more-horiz", title: "See All" },
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={{ alignItems: 'center', width: '22%', marginBottom: 32 }}>
                    <View style={[
                      styles.avatar, 
                      { 
                        width: 64, 
                        height: 64, 
                        backgroundColor: item.icon === 'more-horiz' ? colorScheme.colors.card : `${colorScheme.colors.primary}1A`
                      }
                    ]}>
                      {item.icon === 'water' ? (
                        <FontAwesome5 name={item.icon} size={26} color={colorScheme.colors.primary} />
                      ) : (
                        <MaterialIcons name={item.icon as any} size={30} color={colorScheme.colors.primary} />
                      )}
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

        {/* Offers & Rewards Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Offers & Rewards</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {[
                  { 
                    icon: "gift-outline", 
                    title: "Rewards", 
                    subtitle: "Collect 250 points to get ₹50 cashback",
                    color: colorScheme.colors.primary
                  },
                  { 
                    icon: "local-offer", 
                    title: "Offers", 
                    subtitle: "20% off on your first transaction",
                    color: colorScheme.colors.primary
                  },
                  { 
                    icon: "card-giftcard", 
                    title: "Refer & Earn", 
                    subtitle: "Refer friends and get ₹100 per referral",
                    color: colorScheme.colors.primary
                  },
                ].map((offer, index) => (
                  <TouchableOpacity key={index} style={{ marginRight: 16 }}>
                    <View style={{ 
                      width: 208, 
                      height: 128, 
                      borderRadius: 12, 
                      padding: 20,
                      backgroundColor: offer.color,
                      justifyContent: 'space-between'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name={offer.icon as any} size={26} color={colorScheme.colors.background} />
                        <Text style={{ 
                          fontSize: 18, 
                          fontWeight: '600', 
                          color: colorScheme.colors.background,
                          marginLeft: 12
                        }}>
                          {offer.title}
                        </Text>
                      </View>
                      <Text style={{ 
                        fontSize: 14, 
                        color: colorScheme.colors.background,
                        opacity: 0.8
                      }}>
                        {offer.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Travel & Entertainment Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Travel & Entertainment</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[
                  { icon: "flight", title: "Flights" },
                  { icon: "directions-bus", title: "Bus" },
                  { icon: "train", title: "Trains" },
                  { icon: "movie", title: "Movies" },
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={{ alignItems: 'center', width: '22%', marginBottom: 32 }}>
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

        {/* Insurance Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Insurance</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[
                  { icon: "car-outline", title: "Car" },
                  { icon: "motorbike", title: "Bike" },
                  { icon: "health-and-safety", title: "Health" },
                  { icon: "home", title: "Home" },
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={{ alignItems: 'center', width: '22%', marginBottom: 32 }}>
                    <View style={[styles.avatar, { width: 64, height: 64, backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                      <MaterialCommunityIcons name={item.icon as any} size={30} color={colorScheme.colors.primary} />
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

        {/* UPI-less Payments Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <TouchableOpacity style={[
                styles.item, 
                { 
                  backgroundColor: colorScheme.colors.card,
                  padding: 20,
                  borderRadius: 12
                }
              ]}>
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                  <MaterialIcons name="payment" size={30} color={colorScheme.colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: colorScheme.colors.text }]}>UPI-less Payments</Text>
                  <Text style={[styles.itemSubtitle, { color: subtitleColor }]}>Pay without UPI PIN</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Apps by PhonePe Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Apps by PhonePe</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[
                  { icon: "store", title: "Store" },
                  { icon: "trending-up", title: "Share\nMarket" },
                  { icon: "location-on", title: "Pincode" },
                  { icon: "attach-money", title: "Wealth" },
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={{ alignItems: 'center', width: '22%', marginBottom: 32 }}>
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

        {/* Sponsored Links Section */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ paddingVertical: 24, borderRadius: 16, backgroundColor: colorScheme.colors.card }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { color: colorScheme.colors.text, marginBottom: 24 }]}>Sponsored Links</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[1, 2, 3].map((_, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={{ 
                      width: '30%', 
                      aspectRatio: 1,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: colorScheme.colors.background
                    }}
                  >
                    <Image 
                      source={{ uri: "/placeholder.svg?height=120&width=120" }} 
                      style={{ width: '100%', height: '100%' }} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}