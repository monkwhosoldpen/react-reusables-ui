import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import OverviewScreen from '~/components/dashboard/overview';
import { Input } from '~/components/ui/input';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';

export default function DashboardScreen() {
  const [search, setSearch] = React.useState('');
  const ref = React.useRef(null);
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  useScrollToTop(ref);

  // Apply design system tokens
  const containerStyle = {
    padding: Number(design.spacing.padding.card),
  };

  const searchContainerStyle = {
    paddingVertical: Number(design.spacing.padding.card),
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <View style={[styles.searchContainer, searchContainerStyle]}>
        <Input
          placeholder='Search UI...'
          clearButtonMode='always'
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>
      <OverviewScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
  },
});


