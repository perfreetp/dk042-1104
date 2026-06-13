import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { zones, moods } from '@/data/zones';
import { formatTime, getMoodColor, getZoneColor } from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import ResponseItem from '@/components/ResponseItem';
import type { Post, VoteOption, DoodlePath } from '@/types';
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

const DetailPage: React.FC = () => {
  const params = Taro.getCurrentInstance().router?.params;
  const postId = params?.id || 'p001';
  const { posts, vote, hasVoted, getResponsesForPost, addKindness, addResponse } = useAppStore();

  const post: Post | undefined = useMemo(
    () => posts.find((p) => p.id === postId),
    [posts, postId]
  );

  const responses = useMemo(
    () => getResponsesForPost(postId),
    [getResponsesForPost, postId]
  );

  const votedOptionId = useMemo(
    () => hasVoted(postId),
    [hasVoted, postId]
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

  if (post.isBanned) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyResponses}>
          <Text className={styles.emptyEmoji}>🚫</Text>
          <Text className={styles.emptyText}>该内容已被管理员屏蔽</Text>
        </View>
      </View>
    );
  }

  const zone = zones.find((z) => z.id === post.zoneId);
  const mood = moods.find((m) => m.id === post.moodId);
  const moodColor = getMoodColor(post.moodId);
  const zoneColor = getZoneColor(post.zoneId);

  const totalVotes = post.votes.reduce((sum, v) => sum + v.count, 0);

  const handleVote = (voteOption: VoteOption) => {
    if (votedOptionId) {
      return;
    }
    const success = vote(postId, voteOption.id);
    if (success) {
      Taro.showToast({ title: '投票成功', icon: 'success' });
    }
  };

  const handleRespond = (type: string) => {
    const typeLabels: Record<string, string> = {
      hug: '给了一个抱抱 🤗',
      empathy: '表示同感 💛',
      suggestion: '发送了建议 💡',
      private: '申请私密回复 🔒',
    };
    const result = addResponse(postId, type as any, typeLabels[type] || '回应');
    if (result.success) {
      addKindness(2);
      Taro.showToast({ title: typeLabels[type] || '回应成功', icon: 'none' });
    } else {
      Taro.showToast({ title: result.reason || '操作过于频繁', icon: 'none' });
    }
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

        {post.images && post.images.length > 0 && (
          <View className={styles.detailImages}>
            {post.images.map((img) => (
              <View key={img.id} className={styles.detailImageWrap}>
                <Image
                  className={styles.detailImage}
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

        {post.countdownEnd && (
          <View className={styles.countdownTag}>
            <Text className={styles.countdownText}>⏳ 定时删除中</Text>
          </View>
        )}

        {post.votes.length > 0 && (
          <View className={styles.detailVotes}>
            {post.votes.map((voteOption) => {
              const percent = totalVotes > 0 ? (voteOption.count / totalVotes) * 100 : 0;
              const isVoted = votedOptionId === voteOption.id;
              return (
                <View
                  key={voteOption.id}
                  className={`${styles.voteItem} ${isVoted ? styles.voteItemVoted : ''}`}
                  onClick={() => handleVote(voteOption)}
                >
                  <View style={{ flex: 1 }}>
                    <Text className={`${styles.voteText} ${isVoted ? styles.voteTextVoted : ''}`}>
                      {isVoted && '✓ '}
                      {voteOption.text}
                    </Text>
                    <View className={styles.voteBar}>
                      <View
                        className={`${styles.voteBarFill} ${isVoted ? styles.voteBarFillVoted : ''}`}
                        style={{ width: `${percent}%` }}
                      />
                    </View>
                  </View>
                  <Text className={styles.voteCount}>{voteOption.count}票</Text>
                </View>
              );
            })}
          </View>
        )}

        <View className={styles.detailMeta}>
          <Text className={styles.metaTime}>{formatTime(post.createdAt)}</Text>
          <View className={styles.metaStats}>
            <Text className={styles.metaStat}>🤗 {post.kindnessReceived}</Text>
            <Text className={styles.metaStat}>💬 {responses.length}</Text>
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
