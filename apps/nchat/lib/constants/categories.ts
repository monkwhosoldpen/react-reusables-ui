export interface Category {
  slug: string;
  label: string;
  description: string;
  image_url: string;
  color: string;
  icon?: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'technology',
    label: 'Technology',
    description: 'Latest in tech, software, and innovation',
    image_url: 'https://picsum.photos/400/300?tech',
    color: '#007AFF',
    icon: '💻'
  },
  {
    slug: 'business',
    label: 'Business',
    description: 'Business news, entrepreneurship, and markets',
    image_url: 'https://picsum.photos/400/300?business',
    color: '#34C759',
    icon: '💼'
  },
  {
    slug: 'science',
    label: 'Science',
    description: 'Scientific discoveries and research',
    image_url: 'https://picsum.photos/400/300?science',
    color: '#5856D6',
    icon: '🔬'
  },
  {
    slug: 'health',
    label: 'Health',
    description: 'Health, wellness, and medical news',
    image_url: 'https://picsum.photos/400/300?health',
    color: '#FF2D55',
    icon: '🏥'
  },
  {
    slug: 'entertainment',
    label: 'Entertainment',
    description: 'Movies, TV, music, and pop culture',
    image_url: 'https://picsum.photos/400/300?entertainment',
    color: '#AF52DE',
    icon: '🎬'
  },
  {
    slug: 'sports',
    label: 'Sports',
    description: 'Sports news and updates',
    image_url: 'https://picsum.photos/400/300?sports',
    color: '#FF9500',
    icon: '⚽'
  },
  {
    slug: 'gaming',
    label: 'Gaming',
    description: 'Video games and gaming culture',
    image_url: 'https://picsum.photos/400/300?gaming',
    color: '#FF3B30',
    icon: '🎮'
  },
  {
    slug: 'education',
    label: 'Education',
    description: 'Learning resources and educational content',
    image_url: 'https://picsum.photos/400/300?education',
    color: '#5AC8FA',
    icon: '📚'
  },
  {
    slug: 'lifestyle',
    label: 'Lifestyle',
    description: 'Fashion, food, travel, and daily life',
    image_url: 'https://picsum.photos/400/300?lifestyle',
    color: '#FFCC00',
    icon: '🌟'
  },
  {
    slug: 'music',
    label: 'Music',
    description: 'Music news, releases, and artists',
    image_url: 'https://picsum.photos/400/300?music',
    color: '#FF2D55',
    icon: '🎵'
  },
  {
    slug: 'politics',
    label: 'Politics',
    description: 'Political news and current events',
    image_url: 'https://picsum.photos/400/300?politics',
    color: '#8E8E93',
    icon: '🏛️'
  },
  {
    slug: 'travel',
    label: 'Travel',
    description: 'Travel destinations and experiences',
    image_url: 'https://picsum.photos/400/300?travel',
    color: '#4CD964',
    icon: '✈️'
  },
  {
    slug: 'food',
    label: 'Food',
    description: 'Recipes, restaurants, and culinary arts',
    image_url: 'https://picsum.photos/400/300?food',
    color: '#FF9500',
    icon: '🍳'
  },
  {
    slug: 'fashion',
    label: 'Fashion',
    description: 'Fashion trends and style',
    image_url: 'https://picsum.photos/400/300?fashion',
    color: '#FF2D55',
    icon: '👗'
  },
  {
    slug: 'news',
    label: 'News',
    description: 'Breaking news and current events',
    image_url: 'https://picsum.photos/400/300?news',
    color: '#007AFF',
    icon: '📰'
  }
]; 