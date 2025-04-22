import { ViewStyle, TextStyle } from 'react-native'

export interface Service {
  icon: string
  title: string
  subtitle?: string
}

export interface QuickLink {
  icon: string
  title: string
}

export interface SuperMenuProps {
  essentialServices: readonly Service[]
  citizenServices: readonly Service[]
  patrioticStore: readonly Service[]
  quickLinks: readonly QuickLink[]
  onServicePress?: (service: Service) => void
  onQuickLinkPress?: (link: QuickLink) => void
  style?: ViewStyle
  textStyle?: TextStyle
} 