import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default function StoreTab() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colorScheme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colorScheme.colors.text }]}>
        Store Tab
      </Text>
    </View>
  );
} 