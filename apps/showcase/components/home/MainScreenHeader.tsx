import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search, QrCode, Camera, MoreVertical, X } from 'lucide-react-native'; // Using lucide-react-native for icons
import { useColorScheme } from 'react-native'; // Import useColorScheme

interface MainScreenHeaderProps {
  selectionMode?: boolean;
  selectedCount?: number;
  onCancelSelection?: () => void;
}

export function MainScreenHeader({ selectionMode, selectedCount, onCancelSelection }: MainScreenHeaderProps) {
  const colorScheme = useColorScheme(); // Get color scheme
  const isDark = colorScheme === 'dark';

  return (
    <View className="bg-white dark:bg-[#1F2C34] border-b border-gray-200 dark:border-gray-800">
      <View className="px-4 py-3">
        <View className="flex-row items-center justify-between">
          {selectionMode ? (
            <>
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={onCancelSelection} 
                  className="mr-4"
                  activeOpacity={0.7}
                >
                  <X size={24} color={isDark ? '#A0A2A4' : '#54656F'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCount} selected
                </Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity className="p-2">
                  <MoreVertical size={24} color={isDark ? '#A0A2A4' : '#54656F'} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">WhatsApp</Text>
              <View className="flex-row items-center">
                <TouchableOpacity className="p-2">
                  <QrCode size={24} color={isDark ? '#A0A2A4' : '#54656F'} />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 ml-2">
                  <Camera size={24} color={isDark ? '#A0A2A4' : '#54656F'} />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 ml-2">
                  <MoreVertical size={24} color={isDark ? '#A0A2A4' : '#54656F'} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        {!selectionMode && (
          <View className="flex-row items-center bg-gray-100 dark:bg-[#2A3942] rounded-xl px-3 py-2 mt-3">
            <Search size={20} color={isDark ? '#8796A1' : '#54656F'} className="mr-2" />
            <Text className="flex-1 text-gray-500 dark:text-[#8796A1]">Ask Meta AI or Search</Text>
          </View>
        )}
      </View>
    </View>
  );
} 