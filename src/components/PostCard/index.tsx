import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Post } from '@/types';
import { formatTime, getMoodColor, getZoneColor } from '@/utils';
import { zones, moods } from '@/data/zones';
import styles from './index.module.scss';

interface PostCardProps {
  post: Post;
  onClick?: (post: Post) => void;
  hideHeat?: boolean;
  compact?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick, hideHeat = false, compact = false }) => {
  const zone = zones.find((z) => z.id === post.zoneId);
  const mood = moods.find((m) => m.id === post.moodId);
  const moodColor = getMoodColor(post.moodId);
  const zoneColor = getZoneColor(post.zoneId);

  const handleTap = () => {
    if (onClick) onClick(post);
  };

  return (
    <View
      className={classnames(styles.card, compact && styles.cardCompact)}
      onClick={handleTap}
      style={{ borderLeftColor: moodColor }}
    >
      {post.isPinned && (
        <View className={styles.pinnedBadge}>
          <Text className={styles.pinnedText}>置顶</Text>
        </View>
      )}
      <View className={styles.cardHeader}>
        <View className={styles.zoneTag} style={{ backgroundColor: `${zoneColor}18`, borderColor: `${zoneColor}40` }}>
          <Text className={styles.zoneEmoji}>{zone?.emoji}</Text>
          <Text className={styles.zoneName} style={{ color: zoneColor }}>{zone?.name}</Text>
        </View>
        <View className={styles.moodDot} style={{ backgroundColor: moodColor }}>
          <Text className={styles.moodEmoji}>{mood?.emoji}</Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <Text className={styles.content}>
          {post.isSelfOnly ? '🔒 ' : ''}
          {post.content}
        </Text>
      </View>

      {post.votes.length > 0 && (
        <View className={styles.voteSection}>
          {post.votes.map((vote) => (
            <View key={vote.id} className={styles.voteItem}>
              <Text className={styles.voteText}>{vote.text}</Text>
              {!hideHeat && <Text className={styles.voteCount}>{vote.count}</Text>}
            </View>
          ))}
        </View>
      )}

      {post.countdownEnd && (
        <View className={styles.countdownBadge}>
          <Text className={styles.countdownText}>⏳ 倒计时留言</Text>
        </View>
      )}

      <View className={styles.cardFooter}>
        <Text className={styles.timeText}>{formatTime(post.createdAt)}</Text>
        <View className={styles.stats}>
          {post.isDrift && <Text className={styles.driftTag}>🌊 漂流</Text>}
          {!hideHeat && (
            <>
              <Text className={styles.statItem}>🤗 {post.kindnessReceived}</Text>
              <Text className={styles.statItem}>💬 {post.responseCount}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostCard;
