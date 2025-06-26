import { MediaItem, Analytics } from '../types';

export const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    title: 'Mountain Landscape',
    description: 'Breathtaking view of snow-capped mountains at sunrise',
    type: 'image',
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
    thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?w=400',
    category: 'Nature',
    tags: ['mountains', 'landscape', 'sunrise'],
    createdAt: '2024-01-15',
    views: 1250,
    featured: true
  },
  {
    id: '2',
    title: 'Ocean Waves',
    description: 'Powerful waves crashing against rocky shores',
    type: 'video',
    url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
    thumbnail: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?w=400',
    category: 'Nature',
    tags: ['ocean', 'waves', 'water'],
    createdAt: '2024-01-12',
    views: 890,
    featured: false
  },
  {
    id: '3',
    title: 'City Skyline',
    description: 'Modern cityscape with gleaming skyscrapers',
    type: 'image',
    url: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg',
    thumbnail: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?w=400',
    category: 'Architecture',
    tags: ['city', 'buildings', 'urban'],
    createdAt: '2024-01-10',
    views: 675,
    featured: true
  },
  {
    id: '4',
    title: 'Forest Path',
    description: 'Mystical forest path leading into the unknown',
    type: 'image',
    url: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg',
    thumbnail: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?w=400',
    category: 'Nature',
    tags: ['forest', 'path', 'trees'],
    createdAt: '2024-01-08',
    views: 432,
    featured: false
  },
  {
    id: '5',
    title: 'Desert Sunset',
    description: 'Golden hour in the vast desert landscape',
    type: 'image',
    url: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
    thumbnail: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?w=400',
    category: 'Nature',
    tags: ['desert', 'sunset', 'golden hour'],
    createdAt: '2024-01-05',
    views: 789,
    featured: false
  },
  {
    id: '6',
    title: 'Abstract Art',
    description: 'Colorful abstract composition with flowing forms',
    type: 'image',
    url: 'https://images.pexels.com/photos/1109543/pexels-photo-1109543.jpeg',
    thumbnail: 'https://images.pexels.com/photos/1109543/pexels-photo-1109543.jpeg?w=400',
    category: 'Art',
    tags: ['abstract', 'colorful', 'artistic'],
    createdAt: '2024-01-03',
    views: 345,
    featured: true
  }
];

export const mockAnalytics: Analytics = {
  totalViews: 4381,
  totalMedia: 6,
  popularCategories: [
    { name: 'Nature', count: 4 },
    { name: 'Architecture', count: 1 },
    { name: 'Art', count: 1 }
  ],
  recentActivity: [
    { action: 'Media uploaded', item: 'Abstract Art', timestamp: '2 hours ago' },
    { action: 'Media viewed', item: 'Mountain Landscape', timestamp: '3 hours ago' },
    { action: 'Media featured', item: 'City Skyline', timestamp: '1 day ago' },
    { action: 'Media uploaded', item: 'Desert Sunset', timestamp: '2 days ago' }
  ]
};