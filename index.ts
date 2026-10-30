export type VideoCategory =
  | 'all'
  | 'music'
  | 'gaming'
  | 'tech'
  | 'news'
  | 'comedy'
  | 'education'
  | 'myanmar'
  | 'sports'
  | 'entertainment';

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  banner?: string;
  bio?: string;
  subscribersCount: number;
  subscribedChannelIds: string[];
  likedVideoIds: string[];
  dislikedVideoIds: string[];
  savedVideoIds: string[];
  historyVideoIds: string[];
  isAdmin?: boolean;
  isMonetized?: boolean;
  earningsUSD?: number;
  joinedDate: string;
  isGoogleConnected?: boolean;
  googleEmail?: string;
  googleAvatar?: string;
}

export interface AppSettings {
  videoQuality: 'auto' | '1080p' | '720p' | '480p';
  autoplay: boolean;
  loopVideo: boolean;
  doubleTapSeek: 5 | 10 | 15;
  backgroundAudio: boolean;
  dataSaver: boolean;
  downloadWifiOnly: boolean;
  notifySubscribers: boolean;
  notifyComments: boolean;
  amoledDark: boolean;
  language: 'my' | 'en';
  privateSubscriptions: boolean;
  privateLikes: boolean;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByUserIds?: string[];
  replies?: VideoComment[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string; // Blob URL or remote MP4 URL
  thumbnailUrl: string;
  duration: number; // in seconds
  durationFormatted: string;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  category: VideoCategory;
  tags: string[];
  isShort: boolean;
  isMonetized?: boolean;
  blobKey?: string; // Key in IndexedDB for permanently stored videos
  hasLocalBlob?: boolean;
  commentsCount: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  sizeBytes?: number;
  flagged?: boolean;
  flagReason?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  actorName: string;
  actorAvatar: string;
  type: 'like' | 'comment' | 'subscribe' | 'video_upload';
  message: string;
  videoId?: string;
  videoTitle?: string;
  videoThumbnail?: string;
  timestamp: string;
  read: boolean;
}

export interface MonetizationMetrics {
  totalViews: number;
  totalWatchHours: number;
  monetizedPlaybacks: number;
  cpmRateUSD: number; // e.g. 1.80 per 1000 views
  estimatedRevenueUSD: number;
  estimatedRevenueMMK: number;
  eligibleForMonetization: boolean;
  subscribersGoal: number; // 1000
  watchHoursGoal: number; // 4000
}

export interface AdData {
  id: string;
  title: string;
  brand: string;
  videoUrl: string;
  clickUrl: string;
  skipAfterSeconds: number;
  duration: number;
  bannerImageUrl?: string;
}
