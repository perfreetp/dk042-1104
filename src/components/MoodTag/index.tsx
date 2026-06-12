import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { MoodType } from '@/types';
import styles from './index.module.scss';

interface MoodTagProps {
  mood: MoodType;
  active?: boolean;
  onClick?: (mood: MoodType) => void;
}

const MoodTag: React.FC<MoodTagProps> = ({ mood, active = false, onClick }) => {
  const handleTap = () => {
    if (onClick) onClick(mood);
  };

  return (
    <View
      className={classnames(styles.tag, active && styles.tagActive)}
      style={{
        backgroundColor: active ? `${mood.color}30` : '#F8F7FF',
        borderColor: active ? mood.color : '#E8E5FF',
      }}
      onClick={handleTap}
    >
      <Text className={styles.emoji}>{mood.emoji}</Text>
      <Text className={styles.name} style={{ color: active ? mood.color : '#636E72' }}>
        {mood.name}
      </Text>
    </View>
  );
};

export default MoodTag;
