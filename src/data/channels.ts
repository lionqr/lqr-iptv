
// Types for our channel data
export interface Program {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  thumbnail?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  thumbnail: string;
  currentProgram: Program;
  upcomingPrograms: Program[];
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

// Categories data
export const categories: Category[] = [
  { id: 'news', name: 'News', icon: '📰' },
  { id: 'sports', name: 'Sports', icon: '🏆' },
  { id: 'movies', name: 'Movies', icon: '🎬' },
  { id: 'kids', name: 'Kids', icon: '🧸' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'documentaries', name: 'Documentaries', icon: '🌍' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🏡' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
];

// Mock channel data with current and upcoming programs
export const channels: Channel[] = [
  {
    id: 'cnn',
    name: 'CNN',
    logo: '📺',
    thumbnail: 'https://picsum.photos/id/237/300/200',
    currentProgram: {
      id: 'cnn-1',
      title: 'Breaking News',
      description: 'Latest updates from around the world',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
    },
    upcomingPrograms: [
      {
        id: 'cnn-2',
        title: 'World Report',
        description: 'In-depth analysis of global events',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
      },
      {
        id: 'cnn-3',
        title: 'Business Hour',
        description: 'Financial news and market updates',
        startTime: '12:00 PM',
        endTime: '1:00 PM',
      },
    ],
    categoryId: 'news',
  },
  {
    id: 'bbc',
    name: 'BBC',
    logo: '📺',
    thumbnail: 'https://picsum.photos/id/238/300/200',
    currentProgram: {
      id: 'bbc-1',
      title: 'World News',
      description: 'International news coverage',
      startTime: '10:30 AM',
      endTime: '11:30 AM',
    },
    upcomingPrograms: [
      {
        id: 'bbc-2',
        title: 'Documentary',
        description: 'Special documentary series',
        startTime: '11:30 AM',
        endTime: '12:30 PM',
      },
    ],
    categoryId: 'news',
  },
  {
    id: 'espn',
    name: 'ESPN',
    logo: '🏀',
    thumbnail: 'https://picsum.photos/id/239/300/200',
    currentProgram: {
      id: 'espn-1',
      title: 'NBA Live',
      description: 'Live basketball game coverage',
      startTime: '10:00 AM',
      endTime: '12:30 PM',
    },
    upcomingPrograms: [
      {
        id: 'espn-2',
        title: 'Sports Center',
        description: 'Daily sports news and highlights',
        startTime: '12:30 PM',
        endTime: '1:30 PM',
      },
    ],
    categoryId: 'sports',
  },
  {
    id: 'fox-sports',
    name: 'FOX Sports',
    logo: '⚽',
    thumbnail: 'https://picsum.photos/id/240/300/200',
    currentProgram: {
      id: 'fox-1',
      title: 'Soccer Championship',
      description: 'Live soccer match coverage',
      startTime: '10:30 AM',
      endTime: '12:30 PM',
    },
    upcomingPrograms: [
      {
        id: 'fox-2',
        title: 'Sports Talk',
        description: 'Sports analysis and discussion',
        startTime: '12:30 PM',
        endTime: '1:30 PM',
      },
    ],
    categoryId: 'sports',
  },
  {
    id: 'hbo',
    name: 'HBO',
    logo: '🎭',
    thumbnail: 'https://picsum.photos/id/241/300/200',
    currentProgram: {
      id: 'hbo-1',
      title: 'Game of Thrones',
      description: 'Fantasy drama series',
      startTime: '9:00 AM',
      endTime: '10:00 AM',
    },
    upcomingPrograms: [
      {
        id: 'hbo-2',
        title: 'Westworld',
        description: 'Science fiction series',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
      },
    ],
    categoryId: 'entertainment',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🎬',
    thumbnail: 'https://picsum.photos/id/242/300/200',
    currentProgram: {
      id: 'netflix-1',
      title: 'Stranger Things',
      description: 'Science fiction horror series',
      startTime: '9:30 AM',
      endTime: '10:30 AM',
    },
    upcomingPrograms: [
      {
        id: 'netflix-2',
        title: 'The Crown',
        description: 'Historical drama series',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
      },
    ],
    categoryId: 'entertainment',
  },
  {
    id: 'disney',
    name: 'Disney',
    logo: '🏰',
    thumbnail: 'https://picsum.photos/id/243/300/200',
    currentProgram: {
      id: 'disney-1',
      title: 'Mickey Mouse Clubhouse',
      description: 'Animated series for kids',
      startTime: '9:00 AM',
      endTime: '9:30 AM',
    },
    upcomingPrograms: [
      {
        id: 'disney-2',
        title: 'Frozen',
        description: 'Animated movie',
        startTime: '9:30 AM',
        endTime: '11:00 AM',
      },
    ],
    categoryId: 'kids',
  },
  {
    id: 'cartoon-network',
    name: 'Cartoon Network',
    logo: '🎨',
    thumbnail: 'https://picsum.photos/id/244/300/200',
    currentProgram: {
      id: 'cn-1',
      title: 'Adventure Time',
      description: 'Animated series',
      startTime: '9:00 AM',
      endTime: '9:30 AM',
    },
    upcomingPrograms: [
      {
        id: 'cn-2',
        title: 'Regular Show',
        description: 'Animated comedy series',
        startTime: '9:30 AM',
        endTime: '10:00 AM',
      },
    ],
    categoryId: 'kids',
  },
  {
    id: 'mtv',
    name: 'MTV',
    logo: '🎵',
    thumbnail: 'https://picsum.photos/id/248/300/200',
    currentProgram: {
      id: 'mtv-1',
      title: 'Top 10 Music Videos',
      description: 'Countdown of popular music videos',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
    },
    upcomingPrograms: [
      {
        id: 'mtv-2',
        title: 'MTV Unplugged',
        description: 'Acoustic performances by artists',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
      },
    ],
    categoryId: 'music',
  },
  {
    id: 'vh1',
    name: 'VH1',
    logo: '🎸',
    thumbnail: 'https://picsum.photos/id/249/300/200',
    currentProgram: {
      id: 'vh1-1',
      title: 'Behind the Music',
      description: 'Documentary series about musicians',
      startTime: '10:30 AM',
      endTime: '11:30 AM',
    },
    upcomingPrograms: [
      {
        id: 'vh1-2',
        title: 'Pop Up Video',
        description: 'Music videos with pop-up facts',
        startTime: '11:30 AM',
        endTime: '12:30 PM',
      },
    ],
    categoryId: 'music',
  },
  {
    id: 'discovery',
    name: 'Discovery',
    logo: '🔭',
    thumbnail: 'https://picsum.photos/id/250/300/200',
    currentProgram: {
      id: 'disc-1',
      title: 'Planet Earth',
      description: 'Nature documentary series',
      startTime: '9:00 AM',
      endTime: '10:00 AM',
    },
    upcomingPrograms: [
      {
        id: 'disc-2',
        title: 'MythBusters',
        description: 'Science entertainment program',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
      },
    ],
    categoryId: 'documentaries',
  },
  {
    id: 'national-geographic',
    name: 'National Geographic',
    logo: '🌍',
    thumbnail: 'https://picsum.photos/id/251/300/200',
    currentProgram: {
      id: 'natgeo-1',
      title: 'Explorer',
      description: 'Documentary series about exploration',
      startTime: '9:30 AM',
      endTime: '10:30 AM',
    },
    upcomingPrograms: [
      {
        id: 'natgeo-2',
        title: 'Wild',
        description: 'Wildlife documentary',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
      },
    ],
    categoryId: 'documentaries',
  },
];

// Helper function to get channels by category
export const getChannelsByCategory = (categoryId: string): Channel[] => {
  return channels.filter((channel) => channel.categoryId === categoryId);
};
