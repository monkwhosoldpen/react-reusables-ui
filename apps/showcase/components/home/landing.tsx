import { View, Text, ScrollView, Image, useWindowDimensions, useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { MaterialIcons } from '@expo/vector-icons';

export function Landing() {
  const { width } = useWindowDimensions();
  const isDarkMode = useColorScheme() === 'dark';
  const isSmallScreen = width < 768;

  // Responsive font sizes
  const titleSize = isSmallScreen ? 'text-3xl' : 'text-5xl';
  const subtitleSize = isSmallScreen ? 'text-lg' : 'text-xl';
  const featureTextSize = isSmallScreen ? 'text-base' : 'text-lg';

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAFA] dark:bg-gray-900">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          className={`${
            isSmallScreen ? 'px-6 py-8 space-y-8' : 'w-full max-w-7xl mx-auto px-8 py-12 flex-row gap-16 items-center'
          }`}
        >
          {/* Left Content Column */}
          <View
            className={`${isSmallScreen ? '' : 'flex-1 max-w-2xl space-y-8'}`}
          >

            <Text
              className={`font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight ${titleSize}`}
            >
              Connect with Your Fans & Followers!
            </Text>

            <Text
              className={`text-gray-600 dark:text-gray-300 leading-relaxed ${subtitleSize}`}
            >
              Build meaningful relationships with your community in a distraction‑free environment.
            </Text>

            {/* Features */}
            <View className="space-y-6 mt-8">
              {[
                {
                  title: 'Community Groups',
                  description: 'Create and manage public or private groups for your members',
                  icon: 'groups',
                },
                {
                  title: 'Secure Messaging',
                  description: 'End‑to‑end encrypted conversations keep everyone safe',
                  icon: 'lock',
                },
                {
                  title: 'Offline Access',
                  description: 'Stay connected even without the internet',
                  icon: 'offline-pin',
                },
                {
                  title: 'Fully Customisable',
                  description: 'Brand colours, emojis, roles & more — make it yours',
                  icon: 'tune',
                },
              ].map((feature, i) => (
                <View key={i} className="flex-row items-start gap-4">
                  <MaterialIcons
                    name={feature.icon as any}
                    size={24}
                    color={isDarkMode ? '#10B981' : '#047857'}
                  />
                  <View className="flex-1">
                    <Text className={`font-semibold text-gray-900 dark:text-white ${featureTextSize}`}>{feature.title}</Text>
                    <Text className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CTA Buttons */}
            <View
              className={`${
                isSmallScreen ? 'space-y-4' : 'flex-row space-x-4'
              } mt-8`}
            >
              <Link href="/login" asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-600/20">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white font-medium">Get Started</Text>
                    <ChevronRight size={18} color="#fff" />
                  </View>
                </Button>
              </Link>
              <Link href="/explore" asChild>
                <Button variant="outline" className="border-blue-600 dark:border-blue-500">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-blue-600 dark:text-blue-400 font-medium">Explore</Text>
                  </View>
                </Button>
              </Link>
            </View>
          </View>

          {/* Right Media Column */}
          {!isSmallScreen && (
            <View
              className="flex-1 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                source={{ uri: 'https://placehold.co/800x600?text=Community+Dashboard' }}
                resizeMode="cover"
                className="w-full h-full"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
