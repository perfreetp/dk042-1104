import React, { useMemo, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { formatTime } from '@/utils';
import { zones } from '@/data/zones';
import styles from './index.module.scss';

const typeEmoji: Record<string, string> = {
  hug: '🤗',
  empathy: '💛',
  suggestion: '💡',
  private: '🔒',
};

const MinePage: React.FC = () => {
  const { user, myResponses, posts, reports } = useAppStore();
  const [showResponses, setShowResponses] = useState(false);
  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === 'pending').length,
    [reports]
  );

  const myResponsesWithPosts = useMemo(() => {
    return myResponses.map((resp) => {
      const post = posts.find((p) => p.id === resp.postId);
      const zone = zones.find((z) => z.id === post?.zoneId);
      return { response: resp, post, zone };
    });
  }, [myResponses, posts]);

  const handleMyPosts = () => {
    if (posts.length > 0) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${posts[0].id}` });
    } else {
      Taro.showToast({ title: '还没有发布过倾诉', icon: 'none' });
    }
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

  const handleResponseTap = (resp: any) => {
    if (resp.post && !resp.post.isBanned) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${resp.post.id}` });
    } else {
      Taro.showToast({ title: '该倾诉已不存在', icon: 'none' });
    }
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

        <View className={styles.menuItem} onClick={() => setShowResponses(!showResponses)}>
          <View className={styles.menuLeft}>
            <Text className={styles.menuEmoji}>💬</Text>
            <Text className={styles.menuLabel}>我的回应</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
            {myResponsesWithPosts.length > 0 && (
              <View className={styles.menuBadge}>
                <Text className={styles.menuBadgeText}>{myResponsesWithPosts.length}</Text>
              </View>
            )}
            <Text className={styles.menuArrow}>{showResponses ? 'ˇ' : '›'}</Text>
          </View>
        </View>

        {showResponses && (
          <View className={styles.responseList}>
            {myResponsesWithPosts.length > 0 ? (
              myResponsesWithPosts.map((item) => (
                <View
                  key={item.response.id}
                  className={styles.responseRecord}
                  onClick={() => handleResponseTap(item)}
                >
                  <View className={styles.responseRecordLeft}>
                    <View className={styles.responseTypeIcon}>
                      <Text className={styles.responseTypeEmoji}>
                        {typeEmoji[item.response.type] || '💬'}
                      </Text>
                    </View>
                    <View className={styles.responseRecordContent}>
                      <Text className={styles.responseRecordText} numberOfLines={1}>
                        {item.response.content}
                      </Text>
                      <View className={styles.responseRecordMeta}>
                        {item.zone && (
                          <Text className={styles.responseRecordZone}>
                            {item.zone.emoji} {item.zone.name}
                          </Text>
                        )}
                        <Text className={styles.responseRecordTime}>
                          {formatTime(item.response.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className={styles.responseRecordArrow}>›</Text>
                </View>
              ))
            ) : (
              <View className={styles.emptyResponses}>
                <Text className={styles.emptyResponsesText}>还没有发出过回应，去温暖他人吧 💗</Text>
              </View>
            )}
          </View>
        )}

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
