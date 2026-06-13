import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Post, PostResponse, ReportItem, VoteRecord } from '@/types';
import { mockPosts } from '@/data/posts';
import { mockResponses } from '@/data/responses';
import { generateId } from '@/utils';

const RESPONSE_COOLDOWN_MS = 3000;

interface AppState {
  user: UserProfile;
  currentZoneId: string;
  posts: Post[];
  responses: PostResponse[];
  myResponses: PostResponse[];
  reports: ReportItem[];
  voteRecords: VoteRecord[];
  isVerified: boolean;
  isGuest: boolean;
  _lastResponseAt: Record<string, number>;

  setVerified: (verified: boolean, circleCode?: string, circleName?: string) => void;
  setGuestMode: () => void;
  setCircleCode: (code: string, name: string) => void;
  setCurrentZone: (zoneId: string) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  addKindness: (amount: number) => void;
  incrementStreak: () => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  banPost: (postId: string) => void;
  pinPost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;
  resolveReport: (reportId: string, action: 'ban' | 'dismiss') => void;
  vote: (postId: string, optionId: string) => boolean;
  hasVoted: (postId: string) => string | null;
  getVotedOption: (postId: string) => string | null;
  addResponse: (postId: string, type: PostResponse['type'], content: string) => { success: boolean; reason?: string };
  getResponsesForPost: (postId: string) => PostResponse[];
  canRespond: (postId: string, type: PostResponse['type']) => { allowed: boolean; remainingMs?: number };
  canPublish: () => boolean;
  resetAllState: () => void;
}

const defaultUser: UserProfile = {
  id: 'user_001',
  nickname: '匿名旅人',
  circleCode: '',
  circleName: '',
  kindness: 42,
  streakDays: 5,
  blockedUsers: [],
  isAdmin: true,
  isVerified: false,
  isGuest: false,
  totalPosts: 12,
  totalResponses: 28,
};

const defaultReports: ReportItem[] = [
  { id: 'rp001', postId: 'p004', postContent: '爸妈又在催婚了...', reporterId: 'user_100', reason: '人身攻击', createdAt: '2026-06-13T08:00:00Z', status: 'pending' },
  { id: 'rp002', postId: 'p006', postContent: '总觉得自己在社交场合格格不入...', reporterId: 'user_101', reason: '虚假信息', createdAt: '2026-06-12T20:00:00Z', status: 'pending' },
  { id: 'rp003', postId: 'p008', postContent: '终于通过了那个超难的资格考试...', reporterId: 'user_102', reason: '广告推广', createdAt: '2026-06-12T14:00:00Z', status: 'pending' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      currentZoneId: 'all',
      posts: [...mockPosts],
      responses: [...mockResponses],
      myResponses: [],
      reports: [...defaultReports],
      voteRecords: [],
      isVerified: false,
      isGuest: false,
      _lastResponseAt: {},

      setVerified: (verified, circleCode, circleName) =>
        set((state) => ({
          isVerified: verified,
          isGuest: false,
          user: {
            ...state.user,
            isVerified: verified,
            isGuest: false,
            circleCode: circleCode || state.user.circleCode,
            circleName: circleName || state.user.circleName,
          },
        })),

      setGuestMode: () =>
        set((state) => ({
          isVerified: false,
          isGuest: true,
          user: {
            ...state.user,
            isVerified: false,
            isGuest: true,
            circleCode: '',
            circleName: '游客',
          },
        })),

      setCircleCode: (code, name) =>
        set((state) => ({
          user: { ...state.user, circleCode: code, circleName: name },
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

      updatePost: (postId, updates) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, ...updates } : p
          ),
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
        set((state) => {
          const post = state.posts.find((p) => p.id === postId);
          const newPinned = post ? !post.isPinned : false;
          return {
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, isPinned: newPinned } : p
            ),
          };
        }),

      reportPost: (postId, reason) =>
        set((state) => {
          const post = state.posts.find((p) => p.id === postId);
          if (!post) return state;
          const newReport: ReportItem = {
            id: generateId(),
            postId,
            postContent: post.content.substring(0, 30) + '...',
            reporterId: state.user.id,
            reason,
            createdAt: new Date().toISOString(),
            status: 'pending',
          };
          return {
            reports: [newReport, ...state.reports],
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, isReported: true } : p
            ),
          };
        }),

      resolveReport: (reportId, action) =>
        set((state) => {
          const report = state.reports.find((r) => r.id === reportId);
          if (!report) return state;
          let newPosts = state.posts;
          if (action === 'ban') {
            newPosts = state.posts.map((p) =>
              p.id === report.postId ? { ...p, isBanned: true } : p
            );
          }
          return {
            reports: state.reports.map((r) =>
              r.id === reportId
                ? { ...r, status: action === 'ban' ? 'resolved' : 'dismissed' }
                : r
            ),
            posts: newPosts,
          };
        }),

      vote: (postId, optionId) => {
        const state = get();
        const existingVote = state.voteRecords.find((r) => r.postId === postId);
        if (existingVote) {
          return false;
        }

        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  votes: p.votes.map((v) =>
                    v.id === optionId ? { ...v, count: v.count + 1 } : v
                  ),
                }
              : p
          ),
          voteRecords: [
            ...state.voteRecords,
            {
              postId,
              optionId,
              votedAt: new Date().toISOString(),
            },
          ],
        }));
        return true;
      },

      hasVoted: (postId) => {
        const record = get().voteRecords.find((r) => r.postId === postId);
        return record ? record.optionId : null;
      },

      getVotedOption: (postId) => {
        const record = get().voteRecords.find((r) => r.postId === postId);
        return record ? record.optionId : null;
      },

      canRespond: (postId, type) => {
        const key = `${postId}_${type}`;
        const lastTime = get()._lastResponseAt[key] || 0;
        const now = Date.now();
        const elapsed = now - lastTime;
        if (elapsed < RESPONSE_COOLDOWN_MS) {
          return { allowed: false, remainingMs: RESPONSE_COOLDOWN_MS - elapsed };
        }
        return { allowed: true };
      },

      addResponse: (postId, type, content) => {
        const state = get();
        const key = `${postId}_${type}`;
        const lastTime = state._lastResponseAt[key] || 0;
        const now = Date.now();
        const elapsed = now - lastTime;
        if (elapsed < RESPONSE_COOLDOWN_MS) {
          return {
            success: false,
            reason: `操作过于频繁，请${Math.ceil((RESPONSE_COOLDOWN_MS - elapsed) / 1000)}秒后重试`,
          };
        }

        const newResponse: PostResponse = {
          id: generateId(),
          postId,
          type,
          content,
          createdAt: new Date().toISOString(),
          responderId: state.user.id,
        };

        set((state) => ({
          responses: [...state.responses, newResponse],
          myResponses: [newResponse, ...state.myResponses],
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, responseCount: p.responseCount + 1 }
              : p
          ),
          user: {
            ...state.user,
            totalResponses: state.user.totalResponses + 1,
          },
          _lastResponseAt: {
            ...state._lastResponseAt,
            [key]: now,
          },
        }));

        return { success: true };
      },

      getResponsesForPost: (postId) => {
        return get().responses.filter((r) => r.postId === postId);
      },

      canPublish: () => {
        const state = get();
        return state.isVerified && !state.isGuest;
      },

      resetAllState: () =>
        set(() => ({
          user: defaultUser,
          currentZoneId: 'all',
          posts: [...mockPosts],
          responses: [...mockResponses],
          myResponses: [],
          reports: [...defaultReports],
          voteRecords: [],
          isVerified: false,
          isGuest: false,
          _lastResponseAt: {},
        })),
    }),
    {
      name: 'tree-hole-store',
      partialize: (state) => ({
        user: state.user,
        posts: state.posts,
        responses: state.responses,
        myResponses: state.myResponses,
        reports: state.reports,
        voteRecords: state.voteRecords,
        isVerified: state.isVerified,
        isGuest: state.isGuest,
        currentZoneId: state.currentZoneId,
        _lastResponseAt: state._lastResponseAt,
      }),
    }
  )
);
