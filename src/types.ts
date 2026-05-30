export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  link: string;
  date: string;
  source: string;
  category: 'actu' | 'circulation' | 'meteo' | 'alerte' | 'social';
}

export interface WeatherInfo {
  temperature: string;
  forecast: string;
  humidity: string;
  windSpeed: string;
  uvIndex: string;
  seaConditions: string;
  vigilanceLevel: 'Vert' | 'Jaune' | 'Orange' | 'Rouge' | 'Violet';
  vigilanceType: string;
  vigilanceDescription: string;
  waterOutages: string[];
  sargassumAlert: 'Faible' | 'Moyen' | 'Elevé';
  sargassumDescription: string;
}

export interface TrafficAlert {
  id: string;
  title: string;
  road: string;
  status: 'critical' | 'warning' | 'normal';
  description: string;
  timestamp: string;
  source: string;
}

export interface SocialTrend {
  id: string;
  hashtag: string;
  platform: 'Facebook' | 'X' | 'TikTok' | 'Instagram';
  topic: string;
  summary: string;
  engagement: string;
}

export interface LocalVideo {
  id: string;
  title: string;
  platform: 'YouTube' | 'TikTok';
  videoUrl: string;
  creator: string;
  thumbnail: string;
  duration: string;
  date: string;
  views: string;
  likes?: string;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: 'circulation' | 'meteo' | 'alerte' | 'actu';
  timestamp: string;
  read: boolean;
  important: boolean;
}

export interface NotificationSettings {
  circulation: boolean;
  meteo: boolean;
  alerte: boolean;
  actu: boolean;
  sound: boolean;
  browserPush: boolean;
}
