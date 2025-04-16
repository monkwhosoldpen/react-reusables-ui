import { ScrollView, View, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { Text } from "~/components/ui/text"
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider'
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider'

export default function SuperMenu() {
  const insets = useSafeAreaInsets()
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colorScheme.colors.background }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row items-center justify-between" style={{ backgroundColor: colorScheme.colors.primary }}>
        <View className="flex-row items-center">
          <Image source={{ uri: "/placeholder.svg?height=40&width=40" }} className="w-12 h-12 rounded-full" style={{ backgroundColor: colorScheme.colors.card }} />
          <View className="ml-4">
            <Text className="font-semibold text-lg" style={{ color: colorScheme.colors.background }}>Hello, User</Text>
            <View className="flex-row items-center">
              <Text className="text-sm" style={{ color: colorScheme.colors.background, opacity: 0.8 }}>Mumbai</Text>
              <MaterialIcons name="keyboard-arrow-down" size={22} color={colorScheme.colors.background} style={{ opacity: 0.8 }} />
            </View>
          </View>
        </View>
        <View className="flex-row items-center space-x-5">
          <TouchableOpacity>
            <Ionicons name="scan-outline" size={26} color={colorScheme.colors.background} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="notifications-none" size={26} color={colorScheme.colors.background} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="help-outline" size={26} color={colorScheme.colors.background} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }} style={{ backgroundColor: colorScheme.colors.background }}>
        {/* Balance Card */}
        <View className="px-6 pb-6" style={{ backgroundColor: colorScheme.colors.primary }}>
          <View className="rounded-xl p-5 flex-row justify-between items-center" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.9 }}>
            <View>
              <Text className="text-sm" style={{ color: colorScheme.colors.background, opacity: 0.8 }}>PhonePe Balance</Text>
              <Text className="font-bold text-2xl" style={{ color: colorScheme.colors.background }}>₹10,245.50</Text>
            </View>
            <TouchableOpacity className="px-5 py-2.5 rounded-full" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.8 }}>
              <Text className="font-medium text-sm" style={{ color: colorScheme.colors.background }}>ADD MONEY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan & Pay Button */}
        <View className="px-6 -mt-5">
          <TouchableOpacity className="rounded-xl p-5 flex-row items-center justify-between" style={{ backgroundColor: colorScheme.colors.card }}>
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <Ionicons name="qr-code-outline" size={28} color={colorScheme.colors.primary} />
              </View>
              <View className="ml-5">
                <Text className="font-semibold text-lg" style={{ color: colorScheme.colors.text }}>Scan & Pay</Text>
                <Text className="text-sm" style={{ color: colorScheme.colors.text, opacity: 0.6 }}>Scan any QR code to pay</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={26} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </View>

        {/* People Section */}
        <View className="mt-6 px-6">
          <Text className="font-semibold mb-4 text-lg" style={{ color: colorScheme.colors.text }}>People</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <TouchableOpacity className="items-center mr-8">
              <View className="w-20 h-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1, borderColor: colorScheme.colors.primary, borderWidth: 1 }}>
                <MaterialIcons name="person-add" size={32} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>New</Text>
            </TouchableOpacity>
            {[
              { name: "Rahul", initial: "R" },
              { name: "Priya", initial: "P" },
              { name: "Amit", initial: "A" },
              { name: "Neha", initial: "N" },
              { name: "Vikram", initial: "V" },
            ].map((contact, index) => (
              <TouchableOpacity key={index} className="items-center mr-8">
                <View className="w-20 h-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.card }}>
                  <Text className="font-bold text-xl" style={{ color: colorScheme.colors.text, opacity: 0.6 }}>{contact.initial}</Text>
                </View>
                <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>{contact.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions Grid */}
        <View className="mt-4 px-6 py-6 rounded-t-2xl" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="font-semibold mb-6 text-lg" style={{ color: colorScheme.colors.text }}>Money Transfers</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="account-balance" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>To Bank{"\n"}Account</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="phone-android" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>To Mobile{"\n"}Number</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="person" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>To Self{"\n"}Account</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialCommunityIcons name="bank-outline" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Check{"\n"}Balance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recharge & Pay Bills Section */}
        <View className="px-6 py-6" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="font-semibold mb-6 text-lg" style={{ color: colorScheme.colors.text }}>Recharge & Pay Bills</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="mobile-friendly" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Mobile{"\n"}Recharge</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="live-tv" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>DTH</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="bolt" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Electricity</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="credit-card" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Credit Card{"\n"}Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialCommunityIcons name="gas-cylinder" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Gas{"\n"}Cylinder</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <FontAwesome5 name="water" size={26} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Water{"\n"}Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="wifi" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Broadband</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.card }}>
                <MaterialIcons name="more-horiz" size={30} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offers & Rewards */}
        <View className="mt-2 px-6 py-6" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="font-semibold mb-5 text-lg" style={{ color: colorScheme.colors.text }}>Offers & Rewards</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <TouchableOpacity className="mr-4">
              <View className="w-52 h-32 rounded-xl p-5 justify-between" style={{ backgroundColor: colorScheme.colors.primary }}>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="gift-outline" size={26} color={colorScheme.colors.background} />
                  <Text className="ml-3 font-medium text-lg" style={{ color: colorScheme.colors.background }}>Rewards</Text>
                </View>
                <Text className="text-sm" style={{ color: colorScheme.colors.background, opacity: 0.8 }}>Collect 250 points to get ₹50 cashback</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="mr-4">
              <View className="w-52 h-32 rounded-xl p-5 justify-between" style={{ backgroundColor: colorScheme.colors.primary }}>
                <View className="flex-row items-center">
                  <MaterialIcons name="local-offer" size={26} color={colorScheme.colors.background} />
                  <Text className="ml-3 font-medium text-lg" style={{ color: colorScheme.colors.background }}>Offers</Text>
                </View>
                <Text className="text-sm" style={{ color: colorScheme.colors.background, opacity: 0.8 }}>20% off on your first transaction</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="mr-4">
              <View className="w-52 h-32 rounded-xl p-5 justify-between" style={{ backgroundColor: colorScheme.colors.primary }}>
                <View className="flex-row items-center">
                  <MaterialIcons name="card-giftcard" size={26} color={colorScheme.colors.background} />
                  <Text className="ml-3 font-medium text-lg" style={{ color: colorScheme.colors.background }}>Refer & Earn</Text>
                </View>
                <Text className="text-sm" style={{ color: colorScheme.colors.background, opacity: 0.8 }}>Refer friends and get ₹100 per referral</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Travel & Entertainment */}
        <View className="mt-2 px-6 py-6" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="font-semibold mb-6 text-lg" style={{ color: colorScheme.colors.text }}>Travel & Entertainment</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="flight" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Flights</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="directions-bus" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Bus</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="train" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Trains</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="movie" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Movies</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Insurance Section */}
        <View className="mt-2 px-6 py-6" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="font-semibold mb-6 text-lg" style={{ color: colorScheme.colors.text }}>Insurance</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialCommunityIcons name="car-outline" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Car</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialCommunityIcons name="motorbike" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Bike</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="health-and-safety" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Health</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="home" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* UPI Payments Section */}
        <View className="px-6 py-5 mt-2" style={{ backgroundColor: colorScheme.colors.card }}>
          <View className="flex-row items-center justify-between p-5 rounded-xl" style={{ backgroundColor: colorScheme.colors.background }}>
            <View className="flex-row items-center">
              <MaterialIcons name="payment" size={30} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
              <View className="ml-4">
                <Text className="font-medium text-lg" style={{ color: colorScheme.colors.text }}>UPI-less Payments</Text>
                <Text className="text-sm" style={{ color: colorScheme.colors.text, opacity: 0.6 }}>Pay without UPI PIN</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={26} color={colorScheme.colors.text} style={{ opacity: 0.6 }} />
          </View>
        </View>

        {/* Apps by PhonePe Section */}
        <View className="mt-2 px-6 py-6" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="font-semibold mb-6 text-lg" style={{ color: colorScheme.colors.text }}>Apps by PhonePe</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialCommunityIcons name="store" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Store</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="trending-up" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Share{"\n"}Market</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="location-on" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Pincode</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center w-[22%] mb-8">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colorScheme.colors.primary, opacity: 0.1 }}>
                <MaterialIcons name="attach-money" size={30} color={colorScheme.colors.primary} />
              </View>
              <Text className="text-sm text-center" style={{ color: colorScheme.colors.text }}>Wealth</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sponsored Links */}
        <View className="px-6 py-6 mt-2 mb-6" style={{ backgroundColor: colorScheme.colors.card }}>
          <Text className="mb-4 text-base" style={{ color: colorScheme.colors.text, opacity: 0.6 }}>Sponsored Links</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="w-[30%] aspect-square rounded-xl items-center justify-center overflow-hidden" style={{ backgroundColor: colorScheme.colors.background }}>
              <Image source={{ uri: "/placeholder.svg?height=120&width=120" }} className="w-full h-full" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[30%] aspect-square rounded-xl items-center justify-center overflow-hidden" style={{ backgroundColor: colorScheme.colors.background }}>
              <Image source={{ uri: "/placeholder.svg?height=120&width=120" }} className="w-full h-full" />
            </TouchableOpacity>
            <TouchableOpacity className="w-[30%] aspect-square rounded-xl items-center justify-center overflow-hidden" style={{ backgroundColor: colorScheme.colors.background }}>
              <Image source={{ uri: "/placeholder.svg?height=120&width=120" }} className="w-full h-full" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}