import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { zones, moods } from '@/data/zones';
import { formatTime, getMoodColor, getZoneColor } from '@/utils';
import type { Post, DoodlePath } from '@/types';
import styles from './index.module.scss';

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

const PublishResultPage: React.FC = () => {
  const params = Taro.getCurrentInstance().router?.params;
  const postId = params?.postId || '';
  const { posts, currentZoneId, setCurrentZone } = useAppStore();

  const post: Post | undefined = useMemo(
    () => posts.find((p) => p.id === postId),
    [posts, postId]
  );

  if (!post) {
    return (
      <View className={styles.container}>
        <View className={styles.successHeader}>
          <Text className={styles.successEmoji}>🌫️</Text>
          <Text className={styles.successTitle}>帖子未找到</Text>
        </View>
        <View className={styles.secondaryActions}>
          <View className={styles.backZoneBtn} onClick={() => Taro.navigateBack()}>
            <Text className={styles.backZoneBtnText}>返回</Text>
          </View>
        </View>
      </View>
    );
  }

  const zone = zones.find((z) => z.id === post.zoneId);
  const mood = moods.find((m) => m.id === post.moodId);
  const moodColor = getMoodColor(post.moodId);
  const zoneColor = getZoneColor(post.zoneId);

  const handleViewDetail = () => {
    Taro.redirectTo({ url: `/pages/detail/index?id=${post.id}` });
  };

  const handleBackToZone = () => {
    setCurrentZone(post.zoneId);
    Taro.switchTab({ url: '/pages/home/index' });
  };

  const handlePublishAgain = () => {
    Taro.redirectTo({ url: '/pages/publish/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.successHeader}>
        <View className={styles.successIcon}>
          <Text className={styles.successEmoji}>🌙</Text>
        </View>
        <Text className={styles.successTitle}>倾诉成功</Text>
        <Text className={styles.successSubtitle}>你的心事已被温柔收藏</Text>
      </View>

      <View className={styles.postPreview}>
        <View className={styles.previewLabel}>
          <Text className={styles.previewLabelText}>✨ 刚刚发布</Text>
        </View>

        <View className={styles.previewMeta}>
          <View
            className={styles.previewZone}
            style={{ backgroundColor: `${zoneColor}18`, borderColor: `${zoneColor}40` }}
          >
            <Text className={styles.previewZoneEmoji}>{zone?.emoji}</Text>
            <Text className={styles.previewZoneName} style={{ color: zoneColor }}>
              {zone?.name}
            </Text>
          </View>
          <View className={styles.previewMood} style={{ backgroundColor: `${moodColor}30` }}>
            <Text className={styles.previewMoodEmoji}>{mood?.emoji}</Text>
          </View>
        </View>

        <Text className={styles.previewContent}>
          {post.isSelfOnly ? '🔒 ' : ''}
          {post.content}
        </Text>

        {post.images && post.images.length > 0 && (
          <View className={styles.previewImages}>
            {post.images.map((img) => (
              <View key={img.id} className={styles.previewImageWrap}>
                <Image
                  className={styles.previewImage}
                  src={img.url}
                  mode="widthFix"
                  style={{ width: '100%' }}
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

        {post.votes && post.votes.length > 0 && (
          <View className={styles.previewVotes}>
            <Text className={styles.previewVoteTitle}>📊 匿名投票</Text>
            <View className={styles.previewVoteList}>
              {post.votes.map((vote) => (
                <View key={vote.id} className={styles.previewVoteItem}>
                  <Text className={styles.previewVoteText}>{vote.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {post.countdownEnd && (
          <View className={styles.previewCountdown}>
            <Text className={styles.previewCountdownText}>⏳ 24小时后自动删除</Text>
          </View>
        )}

        <View className={styles.previewFooter}>
          <Text className={styles.previewTime}>{formatTime(post.createdAt)}</Text>
          <View className={styles.previewTags}>
            {post.isDrift && <Text className={styles.previewDriftTag}>🌊 漂流</Text>}
            {post.isSelfOnly && <Text className={styles.previewSelfTag}>🔒 仅自己</Text>}
          </View>
        </View>
      </View>

      <View className={styles.actionsRow}>
        <View className={styles.viewDetailBtn} onClick={handleViewDetail}>
          <Text className={styles.viewDetailBtnText}>🔍 查看详情页</Text>
        </View>

        <View className={styles.secondaryActions}>
          <View className={styles.backZoneBtn} onClick={handleBackToZone}>
            <Text className={styles.backZoneBtnText}>← 返回{zone?.name || '树洞'}</Text>
          </View>
          <View className={styles.publishAgainBtn} onClick={handlePublishAgain}>
            <Text className={styles.publishAgainBtnText}>+ 继续发布</Text>
          </View>
        </View>
      </View>

      <View className={styles.kindnessTip}>
        <Text className={styles.kindnessTipText}>💝 倾诉获得 +1 善意值，继续倾诉可获得连续记录奖励</Text>
      </View>
    </View>
  );
};

export default PublishResultPage;
