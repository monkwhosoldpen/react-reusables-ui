import * as React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Info } from '~/lib/icons/Info';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

const GITHUB_AVATAR_URI =
  'https://i.pinimg.com/originals/ef/a2/8d/efa28d18a04e7fa40ed49eeb0ab660db.jpg';

export default function Screen() {
  const { theme } = useTheme();
  const [progress, setProgress] = React.useState(13);

  const updateProgressValue = () => {
    setProgress(Math.min(100, progress + 10));
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: theme.colorScheme.colors.background,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 380,
          backgroundColor: theme.colorScheme.colors.card,
          borderColor: theme.colorScheme.colors.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Avatar 
              style={{ marginRight: 12 }}
              alt="Project Avatar"
            >
              <AvatarImage source={{ uri: GITHUB_AVATAR_URI }} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <View>
              <CardTitle>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold',
                  color: theme.colorScheme.colors.text,
                }}>
                  Create Project
                </Text>
              </CardTitle>
              <CardDescription>
                <Text style={{ 
                  fontSize: 14,
                  color: theme.colorScheme.colors.text,
                }}>
                  Deploy your new project in one-click.
                </Text>
              </CardDescription>
            </View>
          </View>
        </CardHeader>
        <CardContent>
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ 
                fontSize: 14,
                fontWeight: '500',
                color: theme.colorScheme.colors.text,
                marginRight: 8,
              }}>
                Project Progress
              </Text>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={14} color={theme.colorScheme.colors.text} />
                </TooltipTrigger>
                <TooltipContent>
                  <Text style={{ color: theme.colorScheme.colors.text }}>
                    This is your project creation progress.
                  </Text>
                </TooltipContent>
              </Tooltip>
            </View>
            <Progress value={progress} />
          </View>
        </CardContent>
        <CardFooter>
          <Button
            style={{
              backgroundColor: theme.colorScheme.colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
                shadowColor: theme.colorScheme.colors.text,
              shadowOpacity: 0.05,
              shadowRadius: 1,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2
            }}
            onPress={updateProgressValue}
          >
            <Text style={{ color: theme.colorScheme.colors.text }}>Update</Text>
          </Button>
        </CardFooter>
      </Card>
      
      <Button 
        style={{ 
          width: '100%',
          maxWidth: 380,
          backgroundColor: theme.colorScheme.colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          shadowColor: theme.colorScheme.colors.text,
          shadowOpacity: 0.05,
          shadowRadius: 1,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2
        }}
        onPress={() => router.push('/settings')}
      >
        <Text style={{ color: theme.colorScheme.colors.text }}>
          Go to Settings
        </Text>
      </Button>

      <Button 
        style={{ 
          width: '100%',
          maxWidth: 380,
          backgroundColor: theme.colorScheme.colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          shadowColor: theme.colorScheme.colors.text,
          shadowOpacity: 0.05,
          shadowRadius: 1,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2
        }}
        onPress={() => router.push('/feed')}
      >
        <Text style={{ color: theme.colorScheme.colors.text }}>
          Go to Feed
        </Text>
      </Button>
    </View>
  );
}
