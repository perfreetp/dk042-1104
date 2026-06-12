import React, { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockPosts } from '@/data/posts';
import { moods } from '@/data/zones';
import { zones } from '@/data/zones';
import { formatTime, getMoodColor } from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import type { Post } from '@/types';
import styles from './index.module.scss';

const DriftPage: React.FC = () => {
  const driftPosts = mockPosts.filter((p) => p.isDrift && !p.isBanned);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const { addKindness } = useAppStore();

  const currentPost: Post | undefined = driftPosts[currentIndex];

  const handleSkip = useCallback(() => {
    if (currentIndex < driftPosts.length - 1) {
      setViewed((prev) => new Set(prev).add(currentPost?.id || ''));
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, driftPosts.length, currentPost]);

  const handleHug = useCallback(() => {
    if (currentPost) {
      addKindness(1);
      setViewed((prev) => new Set(prev).add(currentPost.id));
      if (currentIndex < driftPosts.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  }, [currentPost, currentIndex, driftPosts.length, addKindness]);

  const handlePostTap = (post: Post) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${post.id}` });
  };

  const currentMood = currentPost ? moods.find((m) => m.id === currentPost.moodId) : null;
  const currentZone = currentPost ? zones.find((z) => z.id === currentPost.zoneId) : null;
  const moodColor = currentPost ? getMoodColor(currentPost.moodId) : '#DFE6E9';

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🌊 漂流瓶</Text>
        <Text className={styles.subtitle}>随机拾取陌生人的心事</Text>
      </View>

      <View className={styles.oceanScene}>
        <Text className={styles.oceanEmoji}>🍾</Text>
      </View>

      <Text className={styles.driftHint}>
        已拾取 {viewed.size} / {driftPosts.length} 个漂流瓶
      </Text>

      {currentPost ? (
        <>
          <View className={styles.cardSection}>
            <View className={styles.currentCard} onClick={() => handlePostTap(currentPost)}>
              <View className={styles.cardMood} style={{ backgroundColor: `${moodColor}30` }}>
                <Text className={styles.cardMoodEmoji}>{currentMood?.emoji}</Text>
              </View>
              <Text className={styles.cardContent}>{currentPost.content}</Text>
              <View className={styles.cardMeta}>
                <Text className={styles.cardZone}>{currentZone?.emoji} {currentZone?.name}</Text>
                <Text className={styles.cardTime}>{formatTime(currentPost.createdAt)}</Text>
              </View>
              <View className={styles.cardWave} />
            </View>
          </View>

          <View className={styles.actions}>
            <View className={`${styles.actionBtn} ${styles.actionBtnSkip}`} onClick={handleSkip}>
              <Text className={styles.actionBtnSkipText}>丢回去 🌊</Text>
            </View>
            <View className={`${styles.actionBtn} ${styles.actionBtnHug}`} onClick={handleHug}>
              <Text className={styles.actionBtnHugText}>给个抱抱 🤗</Text>
            </View>
          </View>
        </>
      ) : (
        <View className={styles.noMore}>
          <Text className={styles.noMoreEmoji}>🏖️</Text>
          <Text className={styles.noMoreText}>海面上暂时没有新的漂流瓶了</Text>
        </View>
      )}

      <View className={styles.driftCount}>
        <Text className={styles.driftCountText}>热度已隐藏 · 匿名漂流</Text>
      </View>
    </View>
  );
};

export default DriftPage;
