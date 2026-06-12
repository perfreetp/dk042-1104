import React, { useState } from 'react';
import { View, Text, Textarea, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { zones, moods } from '@/data/zones';
import { generateId } from '@/utils';
import ZoneTag from '@/components/ZoneTag';
import MoodTag from '@/components/MoodTag';
import type { Zone, MoodType, Post } from '@/types';
import styles from './index.module.scss';

const PublishPage: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [content, setContent] = useState('');
  const [isDrift, setIsDrift] = useState(false);
  const [isSelfOnly, setIsSelfOnly] = useState(false);
  const [hasCountdown, setHasCountdown] = useState(false);
  const [hasVote, setHasVote] = useState(false);
  const [voteOptions, setVoteOptions] = useState(['', '']);
  const [focused, setFocused] = useState(false);
  const { addPost, addKindness, incrementStreak } = useAppStore();

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone.id);
  };

  const handleMoodClick = (mood: MoodType) => {
    setSelectedMood(mood.id);
  };

  const handlePublish = () => {
    if (!selectedZone) {
      Taro.showToast({ title: '请选择分区', icon: 'none' });
      return;
    }
    if (!selectedMood) {
      Taro.showToast({ title: '请选择心情', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    const newPost: Post = {
      id: generateId(),
      zoneId: selectedZone,
      content: content.trim(),
      moodId: selectedMood,
      isDrift,
      isSelfOnly,
      isPinned: false,
      deleteAt: hasCountdown ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      votes: hasVote
        ? voteOptions
            .filter((v) => v.trim())
            .map((v, i) => ({ id: `v_${i}`, text: v.trim(), count: 0 }))
        : [],
      kindnessReceived: 0,
      responseCount: 0,
      createdAt: new Date().toISOString(),
      authorId: 'user_001',
      hasImage: false,
      countdownEnd: hasCountdown ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      isReported: false,
      isBanned: false,
    };

    addPost(newPost);
    addKindness(1);
    incrementStreak();

    Taro.showToast({ title: '倾诉成功 🌙', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleSaveDraft = () => {
    Taro.showToast({ title: '已保存草稿', icon: 'success' });
  };

  const updateVoteOption = (index: number, value: string) => {
    const newOptions = [...voteOptions];
    newOptions[index] = value;
    setVoteOptions(newOptions);
  };

  const addVoteOption = () => {
    if (voteOptions.length < 5) {
      setVoteOptions([...voteOptions, '']);
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.zoneSection}>
        <Text className={styles.sectionLabel}>选择分区</Text>
        <View className={styles.zoneList}>
          {zones.map((zone) => (
            <ZoneTag
              key={zone.id}
              zone={zone}
              active={selectedZone === zone.id}
              onClick={handleZoneClick}
            />
          ))}
        </View>
      </View>

      <View className={styles.moodSection}>
        <Text className={styles.sectionLabel}>此刻心情</Text>
        <View className={styles.moodList}>
          {moods.map((mood) => (
            <MoodTag
              key={mood.id}
              mood={mood}
              active={selectedMood === mood.id}
              onClick={handleMoodClick}
            />
          ))}
        </View>
      </View>

      <View className={styles.contentSection}>
        <Text className={styles.sectionLabel}>倾诉内容</Text>
        <Textarea
          className={classnames(styles.textArea, focused && styles.textAreaFocused)}
          placeholder="在这里，你可以自由倾诉..."
          maxlength={500}
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <View className={styles.charCount}>
          <Text className={styles.charCountText}>{content.length} / 500</Text>
        </View>
      </View>

      <View className={styles.imageHint}>
        <Text className={styles.imageHintEmoji}>🎨</Text>
        <Text className={styles.imageHintText}>图片涂抹功能开发中，敬请期待</Text>
      </View>

      <View className={styles.optionsSection}>
        <Text className={styles.sectionLabel}>更多选项</Text>
        <View className={styles.optionList}>
          <View className={styles.optionItem} onClick={() => setIsDrift(!isDrift)}>
            <View className={styles.optionLeft}>
              <Text className={styles.optionEmoji}>🌊</Text>
              <View>
                <Text className={styles.optionLabel}>随机漂流</Text>
                <Text className={styles.optionDesc}>让更多人看到你的心声</Text>
              </View>
            </View>
            <Text style={{ color: isDrift ? '#6C5CE7' : '#B2BEC3', fontSize: '32rpx' }}>
              {isDrift ? '✓' : '○'}
            </Text>
          </View>

          <View className={styles.optionItem} onClick={() => setIsSelfOnly(!isSelfOnly)}>
            <View className={styles.optionLeft}>
              <Text className={styles.optionEmoji}>🔒</Text>
              <View>
                <Text className={styles.optionLabel}>仅自己可见</Text>
                <Text className={styles.optionDesc}>私密倾诉，只有你能看到</Text>
              </View>
            </View>
            <Text style={{ color: isSelfOnly ? '#6C5CE7' : '#B2BEC3', fontSize: '32rpx' }}>
              {isSelfOnly ? '✓' : '○'}
            </Text>
          </View>

          <View className={styles.optionItem} onClick={() => setHasCountdown(!hasCountdown)}>
            <View className={styles.optionLeft}>
              <Text className={styles.optionEmoji}>⏳</Text>
              <View>
                <Text className={styles.optionLabel}>定时删除</Text>
                <Text className={styles.optionDesc}>24小时后自动消失</Text>
              </View>
            </View>
            <Text style={{ color: hasCountdown ? '#6C5CE7' : '#B2BEC3', fontSize: '32rpx' }}>
              {hasCountdown ? '✓' : '○'}
            </Text>
          </View>

          <View className={styles.optionItem} onClick={() => setHasVote(!hasVote)}>
            <View className={styles.optionLeft}>
              <Text className={styles.optionEmoji}>📊</Text>
              <View>
                <Text className={styles.optionLabel}>匿名投票</Text>
                <Text className={styles.optionDesc}>让大家帮你做选择</Text>
              </View>
            </View>
            <Text style={{ color: hasVote ? '#6C5CE7' : '#B2BEC3', fontSize: '32rpx' }}>
              {hasVote ? '✓' : '○'}
            </Text>
          </View>
        </View>
      </View>

      {hasVote && (
        <View className={styles.voteSection}>
          <Text className={styles.sectionLabel}>投票选项</Text>
          {voteOptions.map((opt, idx) => (
            <View key={idx} className={styles.voteInput}>
              <Text className={styles.voteIndex}>{idx + 1}.</Text>
              <Input
                className={styles.voteField}
                placeholder={`选项 ${idx + 1}`}
                value={opt}
                onInput={(e) => updateVoteOption(idx, e.detail.value)}
              />
            </View>
          ))}
          {voteOptions.length < 5 && (
            <View className={styles.addVoteBtn} onClick={addVoteOption}>
              <Text className={styles.addVoteText}>+ 添加选项</Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.submitBar}>
        <View className={styles.draftBtn} onClick={handleSaveDraft}>
          <Text className={styles.draftBtnText}>存草稿</Text>
        </View>
        <View className={styles.publishBtn} onClick={handlePublish}>
          <Text className={styles.publishBtnText}>🌙 倾诉</Text>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
