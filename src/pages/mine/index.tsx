import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { mockReports } from '@/data/responses';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { user } = useAppStore();
  const pendingReports = mockReports.filter((r) => r.status === 'pending').length;

  const handleMyPosts = () => {
    Taro.navigateTo({ url: '/pages/detail/index?id=p001' });
  };

  const handleBlocked = () => {
    Taro.showToast({ title: `已屏蔽 ${user.blockedUsers.length} 人`, icon: 'none' });
  };

  const handleAdmin = () => {
    if (user.isAdmin) {
      Taro.navigateTo({ url: '/pages/admin/index' });
    } else {
      Taro.showToast({ title: '暂无管理员权限', icon: 'none' });
    }
  };

  const handleSettings = () => {
    Taro.showToast({ title: '功能开发中...', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileHeader}>
        <View className={styles.avatarRow}>
          <View className={styles.avatar}>
            <Text className={styles.avatarEmoji}>🎭</Text>
          </View>
          <View>
            <Text className={styles.nickname}>{user.nickname}</Text>
            {user.circleCode && (
              <View className={styles.circleTag}>
                <Text className={styles.circleText}>🔑 {user.circleCode}</Text>
              </View>
            )}
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.kindness}</Text>
            <Text className={styles.statLabel}>善意值</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.streakDays}</Text>
            <Text className={styles.statLabel}>连续倾诉</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.totalPosts}</Text>
            <Text className={styles.statLabel}>倾诉数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{user.totalResponses}</Text>
            <Text className={styles.statLabel}>回应数</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的心声</Text>
        <View className={styles.kindnessCard}>
          <View className={styles.kindnessIcon}>
            <Text className={styles.kindnessEmoji}>💗</Text>
          </View>
          <View className={styles.kindnessInfo}>
            <Text className={styles.kindnessLabel}>收到的善意</Text>
            <Text className={styles.kindnessValue}>{user.kindness} 分</Text>
          </View>
        </View>
        <View className={styles.streakCard}>
          <View className={styles.streakIcon}>
            <Text className={styles.streakEmoji}>🔥</Text>
          </View>
          <View className={styles.streakInfo}>
            <Text className={styles.streakLabel}>连续倾诉记录</Text>
            <Text className={styles.streakValue}>{user.streakDays} 天</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuList}>
        <View className={styles.menuItem} onClick={handleMyPosts}>
          <View className={styles.menuLeft}>
            <Text className={styles.menuEmoji}>📝</Text>
            <Text className={styles.menuLabel}>我的倾诉</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        <View className={styles.menuItem} onClick={handleBlocked}>
          <View className={styles.menuLeft}>
            <Text className={styles.menuEmoji}>🚫</Text>
            <Text className={styles.menuLabel}>已屏蔽用户</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        {user.isAdmin && (
          <View className={styles.menuItem} onClick={handleAdmin}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuEmoji}>🛡️</Text>
              <Text className={styles.menuLabel}>管理审核</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
              {pendingReports > 0 && (
                <View className={styles.menuBadge}>
                  <Text className={styles.menuBadgeText}>{pendingReports}</Text>
                </View>
              )}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        )}

        <View className={styles.menuItem} onClick={handleSettings}>
          <View className={styles.menuLeft}>
            <Text className={styles.menuEmoji}>⚙️</Text>
            <Text className={styles.menuLabel}>设置</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
