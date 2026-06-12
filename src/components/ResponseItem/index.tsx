import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { PostResponse, ResponseType } from '@/types';
import { formatTime } from '@/utils';
import styles from './index.module.scss';

interface ResponseItemProps {
  response: PostResponse;
}

const responseTypeMap: Record<ResponseType, { emoji: string; label: string; color: string }> = {
  hug: { emoji: '🤗', label: '抱抱', color: '#FF6B6B' },
  empathy: { emoji: '💛', label: '同感', color: '#FDCB6E' },
  suggestion: { emoji: '💡', label: '建议', color: '#74B9FF' },
  private_request: { emoji: '🔒', label: '私密回复', color: '#A29BFE' },
};

const ResponseItem: React.FC<ResponseItemProps> = ({ response }) => {
  const typeInfo = responseTypeMap[response.type];

  return (
    <View className={styles.item}>
      <View className={styles.typeBadge} style={{ backgroundColor: `${typeInfo.color}18` }}>
        <Text className={styles.typeEmoji}>{typeInfo.emoji}</Text>
        <Text className={styles.typeLabel} style={{ color: typeInfo.color }}>{typeInfo.label}</Text>
      </View>
      <View className={styles.contentWrap}>
        <Text className={styles.content}>{response.content}</Text>
        <Text className={styles.time}>{formatTime(response.createdAt)}</Text>
      </View>
    </View>
  );
};

export default ResponseItem;
