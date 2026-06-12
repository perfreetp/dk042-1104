import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { mockPosts } from '@/data/posts';
import { zones } from '@/data/zones';
import PostCard from '@/components/PostCard';
import ZoneTag from '@/components/ZoneTag';
import type { Post, Zone } from '@/types';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [currentZone, setCurrentZone] = useState<string>('all');
  const { isVerified } = useAppStore();

  const filteredPosts = useMemo(() => {
    let posts = mockPosts.filter((p) => !p.isBanned);
    if (currentZone !== 'all') {
      posts = posts.filter((p) => p.zoneId === currentZone);
    }
    const pinned = posts.filter((p) => p.isPinned);
    const normal = posts.filter((p) => !p.isPinned);
    return [...pinned, ...normal];
  }, [currentZone]);

  const handleZoneClick = (zone: Zone) => {
    setCurrentZone(zone.id);
  };

  const handleAllClick = () => {
    setCurrentZone('all');
  };

  const handlePostClick = (post: Post) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${post.id}` });
  };

  const handlePublish = () => {
    Taro.navigateTo({ url: '/pages/publish/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>🌙 深夜树洞</Text>
        <Text className={styles.subGreeting}>在这里，你不必假装坚强</Text>
      </View>

      <View className={styles.statsBar}>
        <View className={styles.statsLeft}>
          <View className={styles.statBadge}>
            <View className={styles.onlineDot} />
            <Text className={styles.statBadgeText}>128 人在线</Text>
          </View>
          <View className={styles.statBadge}>
            <Text className={styles.statBadgeText}>💬 {mockPosts.length} 条倾诉</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.zoneScroll}>
        <View className={styles.zoneList}>
          <View
            className={classnames(styles.zoneAll, currentZone === 'all' && styles.zoneAllActive)}
            onClick={handleAllClick}
          >
            <Text
              className={classnames(styles.zoneAllText, currentZone === 'all' && styles.zoneAllTextActive)}
            >
              全部
            </Text>
          </View>
          {zones.map((zone) => (
            <ZoneTag
              key={zone.id}
              zone={zone}
              active={currentZone === zone.id}
              onClick={handleZoneClick}
            />
          ))}
        </View>
      </ScrollView>

      <View className={styles.postList}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onClick={handlePostClick} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyEmoji}>🌫️</Text>
            <Text className={styles.emptyText}>这里还没有树洞，来做第一个倾诉者吧</Text>
          </View>
        )}
      </View>

      <View className={styles.fabButton} onClick={handlePublish}>
        <Text className={styles.fabText}>+</Text>
      </View>
    </View>
  );
};

export default HomePage;
