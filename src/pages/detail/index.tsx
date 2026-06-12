import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockPosts } from '@/data/posts';
import { mockResponses } from '@/data/responses';
import { zones, moods } from '@/data/zones';
import { formatTime, getMoodColor, getZoneColor } from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import ResponseItem from '@/components/ResponseItem';
import type { Post, VoteOption } from '@/types';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const params = Taro.getCurrentInstance().router?.params;
  const postId = params?.id || 'p001';
  const { addKindness } = useAppStore();

  const post: Post | undefined = useMemo(
    () => mockPosts.find((p) => p.id === postId),
    [postId]
  );

  const responses = useMemo(
    () => mockResponses.filter((r) => r.postId === postId),
    [postId]
  );

  if (!post) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyResponses}>
          <Text className={styles.emptyEmoji}>🌫️</Text>
          <Text className={styles.emptyText}>树洞不存在或已消失</Text>
        </View>
      </View>
    );
  }

  const zone = zones.find((z) => z.id === post.zoneId);
  const mood = moods.find((m) => m.id === post.moodId);
  const moodColor = getMoodColor(post.moodId);
  const zoneColor = getZoneColor(post.zoneId);

  const totalVotes = post.votes.reduce((sum, v) => sum + v.count, 0);

  const handleVote = (vote: VoteOption) => {
    Taro.showToast({ title: '投票成功', icon: 'success' });
  };

  const handleRespond = (type: string) => {
    const typeLabels: Record<string, string> = {
      hug: '给了一个抱抱 🤗',
      empathy: '表示同感 💛',
      suggestion: '发送了建议 💡',
      private: '申请私密回复 🔒',
    };
    addKindness(2);
    Taro.showToast({ title: typeLabels[type] || '回应成功', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.postDetail}>
        <View className={styles.detailHeader}>
          <View
            className={styles.detailZone}
            style={{ backgroundColor: `${zoneColor}18`, borderColor: `${zoneColor}40`, border: '1rpx solid' }}
          >
            <Text className={styles.detailZoneEmoji}>{zone?.emoji}</Text>
            <Text className={styles.detailZoneName} style={{ color: zoneColor }}>{zone?.name}</Text>
          </View>
          <View className={styles.detailMood} style={{ backgroundColor: `${moodColor}30` }}>
            <Text className={styles.detailMoodEmoji}>{mood?.emoji}</Text>
          </View>
        </View>

        <Text className={styles.detailContent}>{post.content}</Text>

        {post.countdownEnd && (
          <View className={styles.countdownTag}>
            <Text className={styles.countdownText}>⏳ 定时删除中</Text>
          </View>
        )}

        {post.votes.length > 0 && (
          <View className={styles.detailVotes}>
            {post.votes.map((vote) => {
              const percent = totalVotes > 0 ? (vote.count / totalVotes) * 100 : 0;
              return (
                <View key={vote.id} className={styles.voteItem} onClick={() => handleVote(vote)}>
                  <View style={{ flex: 1 }}>
                    <Text className={styles.voteText}>{vote.text}</Text>
                    <View className={styles.voteBar}>
                      <View className={styles.voteBarFill} style={{ width: `${percent}%` }} />
                    </View>
                  </View>
                  <Text className={styles.voteCount}>{vote.count}票</Text>
                </View>
              );
            })}
          </View>
        )}

        <View className={styles.detailMeta}>
          <Text className={styles.metaTime}>{formatTime(post.createdAt)}</Text>
          <View className={styles.metaStats}>
            <Text className={styles.metaStat}>🤗 {post.kindnessReceived}</Text>
            <Text className={styles.metaStat}>💬 {post.responseCount}</Text>
          </View>
        </View>
      </View>

      <View className={styles.responseSection}>
        <Text className={styles.responseTitle}>
          回应 <Text className={styles.responseCount}>{responses.length}</Text>
        </Text>

        {responses.length > 0 ? (
          responses.map((r) => <ResponseItem key={r.id} response={r} />)
        ) : (
          <View className={styles.emptyResponses}>
            <Text className={styles.emptyEmoji}>🤗</Text>
            <Text className={styles.emptyText}>还没有回应，来做第一个温暖的人吧</Text>
          </View>
        )}
      </View>

      <View className={styles.respondBar}>
        <View className={styles.respondActions}>
          <View
            className={`${styles.respondBtn} ${styles.respondHug}`}
            onClick={() => handleRespond('hug')}
          >
            <Text className={styles.respondBtnEmoji}>🤗</Text>
            <Text className={`${styles.respondBtnText} ${styles.respondHugText}`}>抱抱</Text>
          </View>
          <View
            className={`${styles.respondBtn} ${styles.respondEmpathy}`}
            onClick={() => handleRespond('empathy')}
          >
            <Text className={styles.respondBtnEmoji}>💛</Text>
            <Text className={`${styles.respondBtnText} ${styles.respondEmpathyText}`}>同感</Text>
          </View>
          <View
            className={`${styles.respondBtn} ${styles.respondAdvice}`}
            onClick={() => handleRespond('suggestion')}
          >
            <Text className={styles.respondBtnEmoji}>💡</Text>
            <Text className={`${styles.respondBtnText} ${styles.respondAdviceText}`}>建议</Text>
          </View>
          <View
            className={`${styles.respondBtn} ${styles.respondPrivate}`}
            onClick={() => handleRespond('private')}
          >
            <Text className={styles.respondBtnEmoji}>🔒</Text>
            <Text className={`${styles.respondBtnText} ${styles.respondPrivateText}`}>私密</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
