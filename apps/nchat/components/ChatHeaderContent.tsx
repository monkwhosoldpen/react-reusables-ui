import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { Button } from '~/components/ui/button';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, MoreVertical, ChevronLeft, Video, Phone } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface ChatHeaderContentProps {
    title?: string;
    isPremium?: boolean;
    avatarUrl?: string;
    isOnline?: boolean;
}

export function ChatHeaderContent({ title, isPremium, avatarUrl, isOnline }: ChatHeaderContentProps) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const pathname = usePathname();

    // Check if we're in a chat screen

    const handleBack = () => {
        router.push('/chats');
    };

    if (true) {
        return (
            <View className="flex-row items-center w-full">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 p-0"
                    onPress={handleBack}
                >
                    <ChevronLeft className="h-6 w-6 text-card-foreground" />
                </Button>

                {/* Avatar and Info */}
                <Pressable
                    className="flex-row items-center flex-1 ml-1"
                    onPress={() => console.log('View profile')}
                >
                    <View className="relative w-9 h-9 mr-3">
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                className="w-full h-full rounded-full"
                                defaultSource={require('~/assets/images/goat-placeholder.png')}
                            />
                        ) : (
                            <View className="w-full h-full rounded-full bg-muted items-center justify-center">
                                <Text className="text-base text-muted-foreground">
                                    {title?.[0]?.toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {isOnline && (
                            <View className="absolute right-0 bottom-0 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                        )}
                    </View>

                    <View className="flex-1">
                        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
                            {title}
                        </Text>
                        {isOnline && (
                            <Text className="text-xs text-muted-foreground">
                                online
                            </Text>
                        )}
                    </View>
                </Pressable>

                {/* Actions */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 p-0"
                    onPress={() => console.log('More')}
                >
                    <MoreVertical className="h-5 w-5 text-card-foreground" />
                </Button>
            </View>
        );
    }

    // Default header content for main screens
    return (
        <View className="flex-row items-center gap-2">
            {/* Camera Icon */}
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 p-0"
                onPress={() => console.log('Camera')}
            >
                <Camera className="h-6 w-6 text-card-foreground" />
            </Button>

            {/* More Options */}
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 p-0"
                onPress={() => console.log('More')}
            >
                <MoreVertical className="h-6 w-6 text-card-foreground" />
            </Button>
        </View>
    );
} 