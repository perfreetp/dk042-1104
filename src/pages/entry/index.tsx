import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { circleCodes } from '@/data/zones';
import styles from './index.module.scss';

const EntryPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const { setVerified, setCircleCode } = useAppStore();

  const handleSubmit = () => {
    const upperCode = code.toUpperCase().trim();
    if (circleCodes[upperCode]) {
      setVerified(true);
      setCircleCode(circleCodes[upperCode]);
      Taro.showToast({ title: `欢迎进入${circleCodes[upperCode]}`, icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1000);
    } else {
      Taro.showToast({ title: '邀请码无效', icon: 'error' });
    }
  };

  const handleSkip = () => {
    setVerified(true);
    Taro.switchTab({ url: '/pages/home/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.logoArea}>
        <Text className={styles.logoEmoji}>🌳</Text>
        <Text className={styles.logoTitle}>匿名树洞</Text>
        <Text className={styles.logoDesc}>在这里，你可以安心倾诉{'\n'}没有人知道你是谁</Text>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.inputLabel}>输入邀请码进入圈子</Text>
        <View className={`${styles.inputWrap} ${focused ? styles.inputWrapFocused : ''}`}>
          <Text className={styles.inputEmoji}>🔑</Text>
          <Input
            className={styles.inputField}
            placeholder="请输入邀请码"
            value={code}
            onInput={(e) => setCode(e.detail.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>进入树洞</Text>
        </View>
      </View>

      <View className={styles.circlesSection}>
        <Text className={styles.circlesTitle}>可加入的圈子</Text>
        <View className={styles.circlesList}>
          {Object.entries(circleCodes).map(([key, name]) => (
            <View key={key} className={styles.circleItem} onClick={() => setCode(key)}>
              <Text className={styles.circleEmoji}>🏘️</Text>
              <Text className={styles.circleName}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.skipBtn} onClick={handleSkip}>
        <Text className={styles.skipText}>跳过，直接浏览 ›</Text>
      </View>
    </View>
  );
};

export default EntryPage;
