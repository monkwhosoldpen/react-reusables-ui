import type { FormDataType, MediaItem, MediaType } from '../types/superfeed';

const REALISTIC_USERNAMES = [
  'TechInsider',
  'NewsDaily',
  'SportsCentral',
  'FoodieFinds',
  'TravelExplorer',
  'ScienceToday',
  'ArtisticVibes',
  'MusicMaster',
  'GamingPro',
  'HealthyLiving'
];

const REALISTIC_CONTENT = {
  short: [
    "🎉 Just launched our new feature! Check it out and let us know what you think.",
    "📢 Important update: System maintenance scheduled for tomorrow at 10 AM EST.",
    "💡 Pro tip: Use keyboard shortcuts to boost your productivity!",
    "🎯 Weekly goal achieved! Thanks to everyone who contributed.",
    "🌟 Exciting news coming soon! Stay tuned for our big announcement.",
  ],
  long: [
    "🚀 We're excited to announce the launch of our latest product update! This release includes several highly-requested features and performance improvements. We've completely redesigned the dashboard, added new analytics tools, and improved the overall user experience.\n\nKey highlights:\n• New dashboard layout\n• Advanced analytics\n• Improved performance\n• Better mobile support\n\nTry it out and share your feedback!",
    "📋 Monthly Project Update\n\nWe've made significant progress this month:\n\n1. Completed the main infrastructure upgrade\n2. Launched three new integrations\n3. Reduced loading times by 40%\n4. Fixed 50+ reported issues\n\nNext steps:\n- Rolling out the new UI\n- Implementing user feedback\n- Expanding the API\n\nStay tuned for more updates!",
  ]
};

const REALISTIC_IMAGES = [
  'https://picsum.photos/1200/675', // 16:9 ratio
  'https://picsum.photos/800/800',  // Square
  'https://picsum.photos/900/1200', // Portrait
  'https://source.unsplash.com/random/1200x675/?technology',
  'https://source.unsplash.com/random/800x800/?nature',
  'https://source.unsplash.com/random/900x1200/?architecture',
];

const REALISTIC_VIDEOS = [
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/1200/675',
  },
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/1200/675',
  },
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/1200/675',
  },
];

const generateRandomMedia = (count: number = Math.floor(Math.random() * 4) + 1): MediaItem[] => {
  const media: MediaItem[] = [];
  for (let i = 0; i < count; i++) {
    const isVideo = Math.random() > 0.7; // 30% chance of video
    if (isVideo) {
      const video = REALISTIC_VIDEOS[Math.floor(Math.random() * REALISTIC_VIDEOS.length)];
      media.push({
        type: 'video' as MediaType,
        url: video.url,
        thumbnail: video.thumbnail,
        caption: 'Sample video content',
      });
    } else {
      media.push({
        type: 'image' as MediaType,
        url: REALISTIC_IMAGES[Math.floor(Math.random() * REALISTIC_IMAGES.length)],
        caption: 'Sample image content',
      });
    }
  }
  return media;
};

export const generateMockFeedItem = (): FormDataType => {
  const isLongContent = Math.random() > 0.7; // 30% chance of long content
  const content = isLongContent 
    ? REALISTIC_CONTENT.long[Math.floor(Math.random() * REALISTIC_CONTENT.long.length)]
    : REALISTIC_CONTENT.short[Math.floor(Math.random() * REALISTIC_CONTENT.short.length)];

  const hasMedia = Math.random() > 0.3; // 70% chance of having media
  const mediaCount = hasMedia ? Math.floor(Math.random() * 4) + 1 : 0;

  return {
    id: Date.now().toString(),
    type: 'all',
    content,
    media: hasMedia ? generateRandomMedia(mediaCount) : [],
    channel_username: REALISTIC_USERNAMES[Math.floor(Math.random() * REALISTIC_USERNAMES.length)],
    metadata: {
      maxHeight: 300,
      isCollapsible: true,
      displayMode: 'compact',
      visibility: {
        stats: true,
        shareButtons: true,
        header: true,
        footer: true
      },
      mediaLayout: 'grid',
      requireAuth: false,
      timestamp: new Date().toLocaleString(),
    },
    stats: {
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 500),
      responses: Math.floor(Math.random() * 100),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fill_requirement: 'partial'
  };
}; 