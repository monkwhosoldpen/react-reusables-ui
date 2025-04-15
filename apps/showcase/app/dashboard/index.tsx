import { Link } from 'expo-router';
import { View } from 'react-native';
import FeedScreen from '~/components/dashboard/feed';
import { Text } from '~/components/ui/text';
import { H1, Muted } from '~/components/ui/typography';

export default function BlueScreen() {
  return (
    <View className='flex-1 justify-center items-center gap-5'>
      <FeedScreen />
    </View>
  );
}
