import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { cn } from '~/lib/utils';
import { SavedTab, TabType } from '~/lib/types/chat';

type TabBarProps = {
  activeTab: TabType;
  savedTabs: SavedTab[];
  onTabChange: (tab: TabType) => void;
  onAddTab: () => void;
  categories: string[];
};

export const TabBar = React.memo(({ 
  activeTab, 
  savedTabs, 
  onTabChange, 
  onAddTab,
  categories
}: TabBarProps) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="border-b border-border"
    >
      <View className="flex-row p-2 gap-2">
        {/* Default "All" tab */}
        <Pressable
          onPress={() => onTabChange('all')}
          className={cn(
            "px-4 py-2 rounded-lg",
            activeTab === 'all' ? "bg-primary" : "bg-secondary"
          )}
        >
          <Text 
            className={cn(
              "font-medium",
              activeTab === 'all' ? "text-primary-foreground" : "text-foreground"
            )}
          >
            All
          </Text>
        </Pressable>

        {/* Category tabs */}
        {categories.map((category) => (
          <Pressable
            key={category}
            onPress={() => onTabChange(category)}
            className={cn(
              "px-4 py-2 rounded-lg",
              activeTab === category ? "bg-primary" : "bg-secondary"
            )}
          >
            <Text 
              className={cn(
                "font-medium",
                activeTab === category ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </Text>
          </Pressable>
        ))}

        {/* Custom saved tabs */}
        {savedTabs.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg",
              activeTab === tab.id ? "bg-primary" : "bg-secondary"
            )}
          >
            <Text 
              className={cn(
                "font-medium",
                activeTab === tab.id ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {tab.name}
            </Text>
          </Pressable>
        ))}

        {/* Add tab button */}
        <Pressable
          onPress={onAddTab}
          className="px-4 py-2 rounded-lg bg-secondary"
        >
          <Plus className="h-5 w-5 text-foreground" />
        </Pressable>
      </View>
    </ScrollView>
  );
}); 