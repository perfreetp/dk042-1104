import { create } from 'zustand';
import type { UserProfile, Post } from '@/types';

interface AppState {
  user: UserProfile;
  currentZoneId: string;
  posts: Post[];
  isVerified: boolean;

  setVerified: (verified: boolean) => void;
  setCircleCode: (code: string) => void;
  setCurrentZone: (zoneId: string) => void;
  addPost: (post: Post) => void;
  addKindness: (amount: number) => void;
  incrementStreak: () => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  banPost: (postId: string) => void;
  pinPost: (postId: string) => void;
  reportPost: (postId: string) => void;
}

const defaultUser: UserProfile = {
  id: 'user_001',
  nickname: '匿名旅人',
  circleCode: '',
  kindness: 42,
  streakDays: 5,
  blockedUsers: [],
  isAdmin: true,
  isVerified: false,
  totalPosts: 12,
  totalResponses: 28,
};

export const useAppStore = create<AppState>((set) => ({
  user: defaultUser,
  currentZoneId: 'all',
  posts: [],
  isVerified: false,

  setVerified: (verified) =>
    set((state) => ({
      isVerified: verified,
      user: { ...state.user, isVerified: verified },
    })),

  setCircleCode: (code) =>
    set((state) => ({
      user: { ...state.user, circleCode: code },
    })),

  setCurrentZone: (zoneId) => set({ currentZoneId: zoneId }),

  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts],
      user: {
        ...state.user,
        totalPosts: state.user.totalPosts + 1,
      },
    })),

  addKindness: (amount) =>
    set((state) => ({
      user: { ...state.user, kindness: state.user.kindness + amount },
    })),

  incrementStreak: () =>
    set((state) => ({
      user: { ...state.user, streakDays: state.user.streakDays + 1 },
    })),

  blockUser: (userId) =>
    set((state) => ({
      user: {
        ...state.user,
        blockedUsers: [...state.user.blockedUsers, userId],
      },
    })),

  unblockUser: (userId) =>
    set((state) => ({
      user: {
        ...state.user,
        blockedUsers: state.user.blockedUsers.filter((id) => id !== userId),
      },
    })),

  banPost: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, isBanned: true } : p
      ),
    })),

  pinPost: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, isPinned: !p.isPinned } : p
      ),
    })),

  reportPost: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, isReported: true } : p
      ),
    })),
}));
