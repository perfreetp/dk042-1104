import React, { useMemo, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatTime } from '@/utils';
import { zones } from '@/data/zones';
import type { ResponseType, Zone } from '@/types';
import styles from './index.module.scss';

const typeFilterList: { id: ResponseType | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: '全部', emoji: '📋' },
  { id: 'hug', label: '抱抱', emoji: '🤗' },
  { id: 'empathy', label: '同感', emoji: '💛' },
  { id: 'suggestion', label: '建议', emoji: '💡' },
  { id: 'private', label: '私密', emoji: '🔒' },
];

const zoneFilterList: { id: string | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: '全部分区', emoji: '🌐' },
  ...zones.map(z => ({ id: z.id, label: z.name, emoji: z.emoji })),
];

const typeColorMap: Record<ResponseType, string> = {
  hug: '#FF6B6B',
  empathy: '#FDCB6E',
  suggestion: '#74B9FF',
  private: '#A29BFE',
};

interface MyRespItem {
  response: any;
  post: any;
  zone: Zone | undefined;
}

const MinePage: React.FC = () => {
  const { user, myResponses, posts, reports, revokeResponse } = useAppStore();
  const [showResponses, setShowResponses] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ResponseType | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === 'pending').length,
    [reports]
  );

  const myResponsesWithPosts = useMemo<MyRespItem[]>(() => {
    let list: MyRespItem[] = myResponses.map((resp) => {
      const post = posts.find((p) => p.id === resp.postId);
      const zone = zones.find((z) => z.id === post?.zoneId);
      return { response: resp, post, zone };
    });

    if (typeFilter !== 'all') {
      list = list.filter(i => i.response.type === typeFilter);
    }
    if (zoneFilter !== 'all') {
      list = list.filter(i => i.post?.zoneId === zoneFilter);
    }

    return list.sort((a, b) =>
      new Date(b.response.createdAt).getTime() - new Date(a.response.createdAt).getTime()
    );
  }, [myResponses, posts, typeFilter, zoneFilter]);

  const receivedCount = useMemo(() => {
    const myPostIds = posts.filter(p => p.authorId === user.id).map(p => p.id);
    return posts[0]?.id  // 保证 posts 被依赖
      ? myPostIds.length : myPostIds.length;
  }, [posts, user.id]);

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

  const handleReceived = () => {
    Taro.navigateTo({ url: '/pages/receivedResponses/index' });
  };

  const handleResponseTap = (item: MyRespItem) => {
    if (item.post && !item.post.isBanned) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${item.post.id}` });
    }
  };

  const handleRevoke = (e: React.MouseEvent, item: MyRespItem) => {
    e.stopPropagation();
    Taro.showModal({
      title: '撤回回应',
      content: `确定撤回这条"${typeFilterList.find(t => t.id === item.response.type)?.label}"吗？撤回后不可恢复。`,
      confirmText: '撤回',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          const ok = revokeResponse(item.response.id);
          if (ok) {
            Taro.showToast({ title: '已撤回', icon: 'success' });
          } else {
            Taro.showToast({ title: '撤回失败', icon: 'none' });
          }
        }
      },
    });
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

        <View className={styles.menuItem} onClick={handleReceived}>
          <View className={styles.menuLeft}>
            <Text className={styles.menuEmoji}>💌</Text>
            <Text className={styles.menuLabel}>收到的回应</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>

        <View className={styles.menuItem} onClick={() => setShowResponses(!showResponses)}>
          <View className={styles.menuLeft}>
            <Text className={styles.menuEmoji}>💬</Text>
            <Text className={styles.menuLabel}>我的回应</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
            {myResponses.length > 0 && (
              <View className={styles.menuBadge}>
                <Text className={styles.menuBadgeText}>{myResponses.length}</Text>
              </View>
            )}
            <Text className={styles.menuArrow}>{showResponses ? 'ˇ' : '›'}</Text>
          </View>
        </View>

        {showResponses && (
          <View className={styles.responseList}>
            <View className={styles.filterWrap}>
              <View className={styles.filterGroup}>
                <Text className={styles.filterLabel}>类型</Text>
                <View className={styles.filterChips}>
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
              </View>
              <View className={styles.filterGroup}>
                <Text className={styles.filterLabel}>分区</Text>
                <View className={styles.filterChips}>
                  {zoneFilterList.map(f => (
                    <View
                      key={f.id}
                      className={classnames(
                        styles.filterChip,
                        zoneFilter === f.id && styles.filterChipActive
                      )}
                      onClick={() => setZoneFilter(f.id)}
                    >
                      <Text className={styles.filterChipEmoji}>{f.emoji}</Text>
                      <Text className={styles.filterChipText}>{f.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {myResponsesWithPosts.length > 0 ? (
              myResponsesWithPosts.map((item) => {
                const typeColor = typeColorMap[item.response.type as ResponseType];
                const postBanned = !item.post || item.post.isBanned;
                return (
                  <View
                    key={item.response.id}
                    className={classnames(
                      styles.responseRecord,
                      postBanned && styles.responseRecordBanned
                    )}
                    onClick={() => handleResponseTap(item)}
                  >
                    <View className={styles.responseRecordLeft}>
                      <View
                        className={styles.responseTypeIcon}
                        style={{ backgroundColor: `${typeColor}18` }}
                      >
                        <Text className={styles.responseTypeEmoji}>
                          {typeFilterList.find(t => t.id === item.response.type)?.emoji}
                        </Text>
                      </View>
                      <View className={styles.responseRecordContent}>
                        <Text
                          className={classnames(
                            styles.responseRecordText,
                            postBanned && styles.responseRecordTextDim
                          )}
                          numberOfLines={1}
                        >
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
                          {postBanned && (
                            <Text className={styles.responseRecordBannedTag}>原帖已不可见</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View
                      className={styles.responseRecordActions}
                      onClick={(e: any) => e.stopPropagation()}
                    >
                      {!postBanned && (
                        <View
                          className={styles.revokeBtn}
                          onClick={(e: any) => handleRevoke(e, item)}
                        >
                          <Text className={styles.revokeBtnText}>撤回</Text>
                        </View>
                      )}
                      {!postBanned && (
                        <Text className={styles.responseRecordArrow}>›</Text>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View className={styles.emptyResponses}>
                <Text className={styles.emptyResponsesText}>
                  {typeFilter !== 'all' || zoneFilter !== 'all'
                    ? '当前筛选条件下没有回应，换个筛选试试 🔍'
                    : '还没有发出过回应，去温暖他人吧 💗'}
                </Text>
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
