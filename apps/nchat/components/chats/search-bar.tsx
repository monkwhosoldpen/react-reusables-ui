import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

type SearchBarProps = {
  onSearch?: (text: string) => void;
};

export const SearchBar = React.memo(({ onSearch }: SearchBarProps) => {
  const { theme } = useTheme();
  
  return (
    <View className="px-4 py-2">
      <View 
        className="flex-row items-center bg-card rounded-lg px-4 h-10"
        style={{
          boxShadow: theme.name === 'dark' 
            ? '0 1px 2px rgba(255, 255, 255, 0.05)'
            : '0 1px 2px rgba(0, 0, 0, 0.1)',
          elevation: 3,
        }}
      >
        <Search size={20} className="text-muted-foreground mr-3" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="hsl(0 0% 60%)"
          className="flex-1 text-foreground text-base"
          onChangeText={onSearch}
          style={{ pointerEvents: 'auto' }}
        />
      </View>
    </View>
  );
}); 