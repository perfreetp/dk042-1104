import type { PostResponse, ReportItem } from '@/types';

export const mockResponses: PostResponse[] = [
  { id: 'r001', postId: 'p001', type: 'hug', content: '抱抱你，吵架很正常，好朋友会理解的 🤗', createdAt: '2026-06-13T11:00:00Z', responderId: 'user_010' },
  { id: 'r002', postId: 'p001', type: 'empathy', content: '我也经常这样，话到嘴边就变了味', createdAt: '2026-06-13T11:30:00Z', responderId: 'user_003' },
  { id: 'r003', postId: 'p001', type: 'suggestion', content: '也许可以先发条消息试探一下对方的态度？', createdAt: '2026-06-13T12:00:00Z', responderId: 'user_005' },
  { id: 'r004', postId: 'p001', type: 'private_request', content: '想和你私聊一下，我也经历过类似的情况', createdAt: '2026-06-13T12:30:00Z', responderId: 'user_007' },
  { id: 'r005', postId: 'p002', type: 'hug', content: '考研路上不孤单，加油！💪', createdAt: '2026-06-13T09:00:00Z', responderId: 'user_001' },
  { id: 'r006', postId: 'p002', type: 'empathy', content: '我也是考研党，每天焦虑到睡不着', createdAt: '2026-06-13T09:15:00Z', responderId: 'user_008' },
  { id: 'r007', postId: 'p002', type: 'suggestion', content: '建议调整一下学习计划，效率比时长更重要', createdAt: '2026-06-13T09:30:00Z', responderId: 'user_004' },
  { id: 'r008', postId: 'p003', type: 'hug', content: '抱抱，被当众批评真的很受伤 🤗', createdAt: '2026-06-12T20:00:00Z', responderId: 'user_006' },
  { id: 'r009', postId: 'p004', type: 'empathy', content: '完全理解！我家里也是这样', createdAt: '2026-06-12T15:00:00Z', responderId: 'user_002' },
  { id: 'r010', postId: 'p005', type: 'hug', content: '太棒了！恭喜你完成半马！🎉', createdAt: '2026-06-12T08:00:00Z', responderId: 'user_009' },
  { id: 'r011', postId: 'p006', type: 'empathy', content: '原来不止我一个人这样想', createdAt: '2026-06-11T23:00:00Z', responderId: 'user_011' },
  { id: 'r012', postId: 'p007', type: 'suggestion', content: '勇敢一点，也许下次可以主动找话题呢～', createdAt: '2026-06-11T17:00:00Z', responderId: 'user_003' },
];

export const mockReports: ReportItem[] = [
  { id: 'rp001', postId: 'p004', postContent: '内容涉及人身攻击...', reporterId: 'user_100', reason: '人身攻击', createdAt: '2026-06-13T08:00:00Z', status: 'pending' },
  { id: 'rp002', postId: 'p006', postContent: '发布不实信息...', reporterId: 'user_101', reason: '虚假信息', createdAt: '2026-06-12T20:00:00Z', status: 'pending' },
  { id: 'rp003', postId: 'p008', postContent: '涉嫌广告推广...', reporterId: 'user_102', reason: '广告推广', createdAt: '2026-06-12T14:00:00Z', status: 'pending' },
  { id: 'rp004', postId: 'p010', postContent: '涉及隐私泄露...', reporterId: 'user_103', reason: '隐私泄露', createdAt: '2026-06-11T10:00:00Z', status: 'resolved' },
];
