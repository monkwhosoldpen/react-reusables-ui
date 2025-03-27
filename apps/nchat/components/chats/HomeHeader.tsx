import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from './search-bar';
import { TabBar } from './tab-bar';
import { useTheme } from '@react-navigation/native';

export function HomeHeader() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Mock data
  const activeTab = 'All';
  const savedTabs = ['All', 'Favorites', 'Recent'];
  const availableCategories = ['Category 1', 'Category 2', 'Category 3'];

  return (
    <View 
      style={[styles.headerContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}
    >
      <SearchBar onSearch={text => console.log('Search:', text)} />
      <TabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          console.log('Tab changed to:', tab);
        } }
        onAddTab={() => {
          console.log('Add tab dialog opened');
        } }
        categories={availableCategories} savedTabs={[]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderRadius: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
}); 