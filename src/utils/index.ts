import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatTime = (time: string): string => {
  return dayjs(time).fromNow();
};

export const formatCountdown = (endTime: string): string => {
  const now = dayjs();
  const end = dayjs(endTime);
  const diff = end.diff(now, 'second');
  if (diff <= 0) return '已到期';
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  if (hours > 0) return `${hours}时${minutes}分`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
};

export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const maskContent = (content: string, percent: number = 0.3): string => {
  const chars = content.split('');
  const maskCount = Math.floor(chars.length * percent);
  const indices = new Set<number>();
  while (indices.size < maskCount) {
    indices.add(Math.floor(Math.random() * chars.length));
  }
  return chars.map((c, i) => (indices.has(i) ? '*' : c)).join('');
};

export const getMoodColor = (moodId: string): string => {
  const moodColors: Record<string, string> = {
    happy: '#FFEAA7',
    sad: '#74B9FF',
    angry: '#FF7675',
    anxious: '#FDCB6E',
    calm: '#55EFC4',
    grateful: '#E17055',
  };
  return moodColors[moodId] || '#DFE6E9';
};

export const getZoneColor = (zoneId: string): string => {
  const zoneColors: Record<string, string> = {
    study: '#6C5CE7',
    work: '#0984E3',
    social: '#E17055',
    family: '#FDCB6E',
    emotion: '#FF6B6B',
    self: '#00B894',
  };
  return zoneColors[zoneId] || '#636E72';
};
