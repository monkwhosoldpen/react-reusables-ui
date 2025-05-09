import { DashboardScreen } from '~/components/dashboard/dashboard-screen';
import { useLocalSearchParams } from 'expo-router';

export default function DashboardRoute() {
  const { username } = useLocalSearchParams();
  return <DashboardScreen username={username as string} />;
}


