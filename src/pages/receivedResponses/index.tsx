import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { zones } from '@/data/zones';
import { formatTime } from '@/utils';
import type { PostResponse, ResponseType, Zone } from '@/types';
import styles from './index.module.scss';

interface ReceivedRespWithPost extends PostResponse {
  post: any;
  zone: Zone | undefined;
}

const typeFilterList: { id: ResponseType | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: '全部', emoji: '📋' },
  { id: 'hug', label: '抱抱', emoji: '🤗' },
  { id: 'empathy', label: '同感', emoji: '💛' },
  { id: 'suggestion', label: '建议', emoji: '💡' },
  { id: 'private', label: '私密', emoji: '🔒' },
];

const typeColorMap: Record<ResponseType, string> = {
  hug: '#FF6B6B',
  empathy: '#FDCB6E',
  suggestion: '#74B9FF',
  private: '#A29BFE',
};

const typeLabelMap: Record<ResponseType, string> = {
  hug: '抱抱',
  empathy: '同感',
  suggestion: '建议',
  private: '私密回复',
};

const ReceivedResponsesPage: React.FC = () => {
  const { user, posts, responses } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<ResponseType | 'all'>('all');

  const receivedResponses = useMemo<ReceivedRespWithPost[]>(() => {
    const myPostIds = posts.filter(p => p.authorId === user.id).map(p => p.id);
    const list = responses
      .filter(r => myPostIds.includes(r.postId) && r.responderId !== user.id)
      .map(r => {
        const post = posts.find(p => p.id === r.postId);
        const zone = zones.find(z => z.id === post?.zoneId);
        return { ...r, post, zone } as ReceivedRespWithPost;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [posts, responses, user.id]);

  const filteredList = useMemo(() => {
    if (typeFilter === 'all') return receivedResponses;
    return receivedResponses.filter(r => r.type === typeFilter);
  }, [receivedResponses, typeFilter]);

  const handleViewPost = (resp: ReceivedRespWithPost) => {
    if (resp.post && !resp.post.isBanned) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${resp.post.id}` });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>💌 收到的回应</Text>
        <Text className={styles.subtitle}>共收到 {receivedResponses.length} 条温暖回应</Text>
      </View>

      <View className={styles.filterRow}>
        {typeFilterList.map(f => (
          <View
            key={f.id}
            className={classnames(
              styles.filterChip,
              typeFilter === f.id && styles.filterChipActive
            )}
            onClick={() => setTypeFilter(f.id)}
          >
            <Text className={styles.filterChipEmoji}>{f.emoji}</Text>
            <Text className={styles.filterChipText}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.listWrap}>
        {filteredList.length > 0 ? (
          filteredList.map((resp) => {
            const typeColor = typeColorMap[resp.type];
            const postBanned = !resp.post || resp.post.isBanned;
            return (
              <View
                key={resp.id}
                className={classnames(
                  styles.responseItem,
                  resp.type === 'hug' && styles.responseItemHug,
                  resp.type === 'empathy' && styles.responseItemEmpathy,
                  resp.type === 'suggestion' && styles.responseItemSuggestion,
                  resp.type === 'private' && styles.responseItemPrivate,
                )}
              >
                <View className={styles.responseHeader}>
                  <View
                    className={styles.typeBadge}
                    style={{ backgroundColor: `${typeColor}18` }}
                  >
                    <Text className={styles.typeEmoji}>
                      {typeFilterList.find(t => t.id === resp.type)?.emoji}
                    </Text>
                    <Text className={styles.typeLabel} style={{ color: typeColor }}>
                      {typeLabelMap[resp.type]}
                    </Text>
                  </View>
                  <Text className={styles.responseTime}>{formatTime(resp.createdAt)}</Text>
                </View>

                <Text className={styles.responseContent}>{resp.content}</Text>

                {postBanned ? (
                  <View className={styles.postBanned}>
                    <Text className={styles.postBannedEmoji}>🚫</Text>
                    <Text className={styles.postBannedText}>原帖已被删除或屏蔽</Text>
                  </View>
                ) : (
                  <View className={styles.postPreview} onClick={() => handleViewPost(resp)}>
                    <Text className={styles.postPreviewZone}>
                      {resp.zone?.emoji} {resp.zone?.name}
                    </Text>
                    <Text className={styles.postPreviewContent}>{resp.post?.content}</Text>
                  </View>
                )}

                <View
                  className={classnames(
                    styles.viewPostBtn,
                    postBanned && styles.viewPostBtnBanned
                  )}
                  onClick={() => handleViewPost(resp)}
                >
                  <Text className={styles.viewPostBtnText}>
                    {postBanned ? '原帖不可查看' : '→ 查看对应的树洞'}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyEmoji}>
              {typeFilter === 'all' ? '💫' : typeFilterList.find(t => t.id === typeFilter)?.emoji}
            </Text>
            <Text className={styles.emptyText}>
              {typeFilter === 'all'
                ? '还没收到回应，发布更多倾诉吧 🌙'
                : `还没收到${typeFilterList.find(t => t.id === typeFilter)?.label}类回应`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReceivedResponsesPage;
