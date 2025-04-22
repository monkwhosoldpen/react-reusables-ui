import SuperMenu from "@/components/common/supermenu";
import {
  essentialServices,
  citizenServices,
  patrioticStore,
  quickLinks
} from "@/lib/constants/supermenu";

export default function SuperMenuScreen() {
  const handleServicePress = (service: { icon: string; title: string; subtitle?: string }) => {
    // Handle service press
    console.log('Service pressed:', service);
  };

  const handleQuickLinkPress = (link: { icon: string; title: string }) => {
    // Handle quick link press
    console.log('Quick link pressed:', link);
  };

  return (
    <SuperMenu
      essentialServices={essentialServices}
      citizenServices={citizenServices}
      patrioticStore={patrioticStore}
      quickLinks={quickLinks}
      onServicePress={handleServicePress}
      onQuickLinkPress={handleQuickLinkPress}
    />
  );
}