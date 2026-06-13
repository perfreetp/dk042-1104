import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { Post, DoodlePath } from '@/types';
import { formatTime, getMoodColor, getZoneColor } from '@/utils';
import { zones, moods } from '@/data/zones';
import styles from './index.module.scss';

interface PostCardProps {
  post: Post;
  onClick?: (post: Post) => void;
  hideHeat?: boolean;
  compact?: boolean;
}

const renderDoodlePath = (doodle: DoodlePath, imgWidth: number, imgHeight: number) => {
  if (doodle.points.length < 2) return null;
  const xScale = 100 / imgWidth;
  const yScale = 100 / imgHeight;
  const pathData = doodle.points
    .map((p, i) => {
      const x = p.x * xScale;
      const y = p.y * yScale;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const maxDim = Math.max(imgWidth, imgHeight);
  const strokeWidthPercent = (doodle.size / maxDim) * 100 * 1.2;

  return (
    <path
      key={doodle.id}
      d={pathData}
      stroke={doodle.color}
      strokeWidth={strokeWidthPercent}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
  );
};

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

      {post.images && post.images.length > 0 && (
        <View className={styles.imageSection}>
          {post.images.map((img) => (
            <View key={img.id} className={styles.imageWrap}>
              <Image
                className={styles.image}
                src={img.url}
                mode="aspectFill"
                style={{ width: '100%', height: '400rpx' }}
              />
              {img.doodles && img.doodles.length > 0 && (
                <View className={styles.doodleOverlay}>
                  <svg
                    className={styles.doodleSvg}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {img.doodles.map((d) => renderDoodlePath(d, img.width, img.height))}
                  </svg>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

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
