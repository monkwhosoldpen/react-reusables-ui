import { Stack } from 'expo-router';
import { DashboardHeader } from '~/components/dashboard/DashboardHeader';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { StyleSheet, View } from 'react-native';

export default function DashboardLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <DashboardHeader title="nchat" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme.colors.background,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
