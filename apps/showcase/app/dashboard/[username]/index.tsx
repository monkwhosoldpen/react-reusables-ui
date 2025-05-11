import { DashboardScreen } from '~/components/dashboard/dashboard-screen';

export default function DashboardRoute() {
  const username = 'janedoe_pro';
  const tabname = 'chat';
  return <DashboardScreen username={username as string} tabname={tabname as string} />;
}


