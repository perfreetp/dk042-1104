export interface Zone {
  id: string;
  name: string;
  emoji: string;
  color: string;
  postCount: number;
}

export interface MoodType {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface VoteOption {
  id: string;
  text: string;
  count: number;
}

export interface Post {
  id: string;
  zoneId: string;
  content: string;
  moodId: string;
  isDrift: boolean;
  isSelfOnly: boolean;
  isPinned: boolean;
  deleteAt: string | null;
  votes: VoteOption[];
  kindnessReceived: number;
  responseCount: number;
  createdAt: string;
  authorId: string;
  hasImage: boolean;
  countdownEnd: string | null;
  isReported: boolean;
  isBanned: boolean;
}

export type ResponseType = 'hug' | 'empathy' | 'suggestion' | 'private_request';

export interface PostResponse {
  id: string;
  postId: string;
  type: ResponseType;
  content: string;
  createdAt: string;
  responderId: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  circleCode: string;
  kindness: number;
  streakDays: number;
  blockedUsers: string[];
  isAdmin: boolean;
  isVerified: boolean;
  totalPosts: number;
  totalResponses: number;
}

export interface ReportItem {
  id: string;
  postId: string;
  postContent: string;
  reporterId: string;
  reason: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}
