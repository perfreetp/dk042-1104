import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Zone } from '@/types';
import styles from './index.module.scss';

interface ZoneTagProps {
  zone: Zone;
  active?: boolean;
  onClick?: (zone: Zone) => void;
}

const ZoneTag: React.FC<ZoneTagProps> = ({ zone, active = false, onClick }) => {
  const handleTap = () => {
    if (onClick) onClick(zone);
  };

  return (
    <View
      className={classnames(styles.tag, active && styles.tagActive)}
      style={{
        backgroundColor: active ? `${zone.color}20` : $colorBgCard,
        borderColor: active ? zone.color : $colorBorder,
      }}
      onClick={handleTap}
    >
      <Text className={styles.emoji}>{zone.emoji}</Text>
      <Text className={styles.name} style={{ color: active ? zone.color : $colorTextSecondary }}>
        {zone.name}
      </Text>
    </View>
  );
};

const $colorBgCard = '#ffffff';
const $colorBorder = '#E8E5FF';
const $colorTextSecondary = '#636E72';

export default ZoneTag;
