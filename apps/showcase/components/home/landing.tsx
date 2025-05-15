import { View, Text, ScrollView, Image, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { LANDING_CONTENT } from '~/lib/core/constants/landing';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { MaterialIcons } from "@expo/vector-icons";

export function Landing() {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useColorScheme();
  const isSmallScreen = width < 768;

  const MobileLayout = () => (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <View className="px-6 py-8 space-y-8">
          <Text className="text-emerald-400 dark:text-emerald-500 text-base font-semibold tracking-wide">
            {LANDING_CONTENT.tagline}
          </Text>
          <Text className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
            {LANDING_CONTENT.headline}
          </Text>
          <Text className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {LANDING_CONTENT.subheadline}
          </Text>

          <View className="space-y-4">
            {LANDING_CONTENT.features.map((feature, index) => (
              <View key={index} className="flex flex-row gap-2 flex-wrap items-center">
                <MaterialIcons 
                  name={feature.icon as any} 
                  size={24} 
                  color={isDarkMode ? '#9CA3AF' : '#4B5563'} 
                />
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {feature.title}:
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          <View className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <View className="absolute bottom-4 left-4 flex flex-row gap-2 flex-wrap">
              {LANDING_CONTENT.stats.map((stat, index) => (
                <View key={index} className="flex-row items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full">
                  <MaterialIcons 
                    name={stat.icon as any} 
                    size={16} 
                    color={isDarkMode ? '#E5E7EB' : '#111827'} 
                  />
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stat.value} {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="space-y-4">
            {LANDING_CONTENT.ctas.map((cta, index) => (
              <Link key={index} href={cta.href} asChild>
                <Button>
                  <View className="flex-row items-center gap-2">
                    <Text className={cta.className}>
                      {cta.text}
                    </Text>
                    <ChevronRight 
                      size={18} 
                      color={cta.variant === 'primary' ? 'white' : isDarkMode ? '#E5E7EB' : '#111827'} 
                    />
                  </View>
                </Button>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const DesktopLayout = () => (
    <ScrollView className="flex-1">
      <View className="flex-1 w-full max-w-7xl mx-auto px-8 py-12">
        <View className="flex flex-row gap-16 items-center">
          <View className="flex-1 max-w-2xl space-y-8">
            <Text className="text-emerald-400 dark:text-emerald-500 text-lg font-semibold tracking-wide">
              {LANDING_CONTENT.tagline}
            </Text>
            <Text className="text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
              {LANDING_CONTENT.headline}
            </Text>
            <Text className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {LANDING_CONTENT.subheadline}
            </Text>

            <View className="space-y-4">
              {LANDING_CONTENT.features.map((feature, index) => (
                <View key={index} className="flex flex-row gap-2 flex-wrap items-center">
                  <MaterialIcons 
                    name={feature.icon as any} 
                    size={24} 
                    color={isDarkMode ? '#9CA3AF' : '#4B5563'} 
                  />
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}:
                  </Text>
                  <Text className="text-lg text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>

            <View className="space-x-4 flex flex-row">
              {LANDING_CONTENT.ctas.map((cta, index) => (
                <Link key={index} href={cta.href} asChild>
                  <Button>
                    <View className="flex-row items-center gap-2">
                      <Text className={cta.className}>
                        {cta.text}
                      </Text>
                      <ChevronRight 
                        size={18} 
                        color={cta.variant === 'primary' ? 'white' : isDarkMode ? '#E5E7EB' : '#111827'} 
                      />
                    </View>
                  </Button>
                </Link>
              ))}
            </View>
          </View>

          <View className="flex-1 relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <View className="absolute bottom-6 left-6 flex flex-row gap-3 flex-wrap">
              {LANDING_CONTENT.stats.map((stat, index) => (
                <View key={index} className="flex-row items-center gap-2 px-4 py-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full shadow-sm">
                  <MaterialIcons 
                    name={stat.icon as any} 
                    size={18} 
                    color={isDarkMode ? '#E5E7EB' : '#111827'} 
                  />
                  <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {stat.value} {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAFA] dark:bg-gray-900">
      {isSmallScreen ? <MobileLayout /> : <DesktopLayout />}
    </SafeAreaView>
  );
} 