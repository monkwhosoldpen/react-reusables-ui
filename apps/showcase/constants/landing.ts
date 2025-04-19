export const LANDING_CONTENT = {
  title: '✨ Welcome to NConnect',
  subtitle: 'Your personal space to connect with fans, followers, and your community—without any distractions.',
  features: [
    {
      icon: '👥',
      title: 'Premium & Free Groups',
      description: 'Create public groups or exclusive premium communities for your true fans'
    },
    {
      icon: '🔐',
      title: 'Private & Secure',
      description: 'Your data and fanbase are yours. No algorithms. No ads. Just genuine connections'
    },
    {
      icon: '⚡',
      title: 'Offline-First',
      description: 'Works anywhere, even without internet. Everything syncs automatically when you\'re back online'
    },
    {
      icon: '🎯',
      title: 'Built for Scale',
      description: 'Support millions of fans, regional teams, and custom workflows. Grows with your community'
    }
  ],
  ctas: [
    {
      text: 'Get Started',
      href: '/login',
      variant: 'default' as const
    },
    {
      text: 'Explore',
      href: '/explore',
      variant: 'outline' as const
    }
  ]
}; 