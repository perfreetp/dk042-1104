import type { Zone, MoodType } from '@/types';

export const zones: Zone[] = [
  { id: 'study', name: '学习', emoji: '📚', color: '#6C5CE7', postCount: 128 },
  { id: 'work', name: '工作', emoji: '💼', color: '#0984E3', postCount: 96 },
  { id: 'social', name: '人际', emoji: '👥', color: '#E17055', postCount: 156 },
  { id: 'family', name: '家庭', emoji: '🏠', color: '#FDCB6E', postCount: 73 },
  { id: 'emotion', name: '情感', emoji: '💕', color: '#FF6B6B', postCount: 201 },
  { id: 'self', name: '自我', emoji: '🌱', color: '#00B894', postCount: 89 },
];

export const moods: MoodType[] = [
  { id: 'happy', name: '开心', emoji: '😊', color: '#FFEAA7' },
  { id: 'sad', name: '难过', emoji: '😢', color: '#74B9FF' },
  { id: 'angry', name: '愤怒', emoji: '😡', color: '#FF7675' },
  { id: 'anxious', name: '焦虑', emoji: '😰', color: '#FDCB6E' },
  { id: 'calm', name: '平静', emoji: '😌', color: '#55EFC4' },
  { id: 'grateful', name: '感恩', emoji: '🙏', color: '#E17055' },
];

export const circleCodes: Record<string, string> = {
  'CAMPUS2024': '校园圈',
  'OFFICE2024': '职场圈',
  'FRIEND2024': '朋友圈',
};
