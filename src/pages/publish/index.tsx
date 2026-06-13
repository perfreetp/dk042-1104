import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Textarea, Input, Image, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { zones, moods } from '@/data/zones';
import { generateId } from '@/utils';
import ZoneTag from '@/components/ZoneTag';
import MoodTag from '@/components/MoodTag';
import type { Zone, MoodType, Post, PostImage, DoodlePath } from '@/types';
import styles from './index.module.scss';

const CANVAS_WIDTH = 690;
const CANVAS_HEIGHT = 400;

const renderDoodlePathForPreview = (doodle: DoodlePath) => {
  if (doodle.points.length < 2) return null;
  const xScale = 100 / CANVAS_WIDTH;
  const yScale = 100 / CANVAS_HEIGHT;
  const pathData = doodle.points
    .map((p, i) => {
      const x = p.x * xScale;
      const y = p.y * yScale;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const maxDim = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
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

const PublishPage: React.FC = () => {
  const { addPost, addKindness, incrementStreak, canPublish } = useAppStore();

  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [content, setContent] = useState('');
  const [isDrift, setIsDrift] = useState(false);
  const [isSelfOnly, setIsSelfOnly] = useState(false);
  const [hasCountdown, setHasCountdown] = useState(false);
  const [hasVote, setHasVote] = useState(false);
  const [voteOptions, setVoteOptions] = useState(['', '']);
  const [focused, setFocused] = useState(false);
  const [showDoodle, setShowDoodle] = useState(false);

  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [doodles, setDoodles] = useState<DoodlePath[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [doodleColor, setDoodleColor] = useState('#000000');
  const [doodleSize, setDoodleSize] = useState(8);

  const canvasRef = useRef<any>(null);
  const ctxRef = useRef<any>(null);

  useEffect(() => {
    if (showDoodle && canvasRef.current) {
      const query = Taro.createSelectorQuery();
      query
        .select('#doodleCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = Taro.getSystemInfoSync().pixelRatio;
            canvas.width = res[0].width * dpr;
            canvas.height = res[0].height * dpr;
            ctx.scale(dpr, dpr);
            ctxRef.current = ctx;
            redrawCanvas();
          }
        });
    }
  }, [showDoodle, selectedImage]);

  useEffect(() => {
    if (!canPublish()) {
      Taro.showModal({
        title: '游客无法发布',
        content: '请先输入邀请码进入圈子后再发布内容',
        showCancel: true,
        cancelText: '返回',
        confirmText: '去验证',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/entry/index' });
          } else {
            Taro.navigateBack();
          }
        },
      });
    }
  }, [canPublish]);

  const redrawCanvas = () => {
    const ctx = ctxRef.current;
    if (!ctx || !selectedImage) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const img = ctx.createImage();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawAllDoodles();
    };
    img.src = selectedImage.url;
  };

  const drawAllDoodles = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    doodles.forEach((doodle) => {
      drawPath(ctx, doodle.points, doodle.color, doodle.size);
    });

    if (currentPath.length > 1) {
      drawPath(ctx, currentPath, doodleColor, doodleSize);
    }
  };

  const drawPath = (ctx: any, points: { x: number; y: number }[], color: string, size: number) => {
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        Taro.getImageInfo({
          src: tempFilePaths[0],
          success: (info) => {
            setSelectedImage({
              url: tempFilePaths[0],
              width: info.width,
              height: info.height,
            });
            setDoodles([]);
            setShowDoodle(true);
          },
        });
      },
    });
  };

  const handleCanvasTouchStart = (e: any) => {
    if (!ctxRef.current) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect
      ? e.currentTarget.getBoundingClientRect()
      : { left: 0, top: 0 };
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const handleCanvasTouchMove = (e: any) => {
    if (!isDrawing || !ctxRef.current) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect
      ? e.currentTarget.getBoundingClientRect()
      : { left: 0, top: 0 };
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    setCurrentPath((prev) => [...prev, { x, y }]);
    redrawCanvas();
  };

  const handleCanvasTouchEnd = () => {
    if (isDrawing && currentPath.length > 1) {
      const newDoodle: DoodlePath = {
        id: generateId(),
        points: [...currentPath],
        color: doodleColor,
        size: doodleSize,
      };
      setDoodles((prev) => [...prev, newDoodle]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleClearDoodles = () => {
    setDoodles([]);
    setCurrentPath([]);
    redrawCanvas();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setDoodles([]);
    setShowDoodle(false);
  };

  const handleConfirmDoodle = () => {
    setShowDoodle(false);
  };

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone.id);
  };

  const handleMoodClick = (mood: MoodType) => {
    setSelectedMood(mood.id);
  };

  const handlePublish = () => {
    if (!canPublish()) {
      Taro.showToast({ title: '请先验证邀请码', icon: 'none' });
      return;
    }
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

    const images: PostImage[] = selectedImage
      ? [
          {
            id: generateId(),
            url: selectedImage.url,
            doodles: doodles.map(d => ({
              ...d,
              points: d.points.map(p => ({
                x: (p.x / CANVAS_WIDTH) * selectedImage.width,
                y: (p.y / CANVAS_HEIGHT) * selectedImage.height,
              })),
              size: (d.size / CANVAS_WIDTH) * selectedImage.width,
            })),
            width: selectedImage.width,
            height: selectedImage.height,
          },
        ]
      : [];

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
      hasImage: images.length > 0,
      countdownEnd: hasCountdown ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      isReported: false,
      isBanned: false,
      images,
    };

    addPost(newPost);
    addKindness(1);
    incrementStreak();

    Taro.redirectTo({ url: `/pages/publishResult/index?postId=${newPost.id}` });
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

  const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#96CEB4'];
  const sizes = [4, 8, 12, 20];

  if (showDoodle && selectedImage) {
    return (
      <View className={styles.doodleContainer}>
        <View className={styles.doodleHeader}>
          <Text className={styles.doodleTitle}>🎨 涂抹遮挡</Text>
          <Text className={styles.doodleHint}>在图片上涂抹遮挡敏感内容</Text>
        </View>

        <View className={styles.doodleCanvasWrap}>
          <Canvas
            id="doodleCanvas"
            ref={canvasRef}
            type="2d"
            className={styles.doodleCanvas}
            style={{ width: `${CANVAS_WIDTH * 0.9}rpx`, height: `${CANVAS_HEIGHT * 0.9}rpx` }}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
          />
        </View>

        <View className={styles.doodleTools}>
          <View className={styles.doodleToolSection}>
            <Text className={styles.doodleToolLabel}>颜色</Text>
            <View className={styles.doodleColorRow}>
              {colors.map((color) => (
                <View
                  key={color}
                  className={classnames(
                    styles.doodleColorBtn,
                    doodleColor === color && styles.doodleColorBtnActive
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setDoodleColor(color)}
                />
              ))}
            </View>
          </View>

          <View className={styles.doodleToolSection}>
            <Text className={styles.doodleToolLabel}>粗细</Text>
            <View className={styles.doodleSizeRow}>
              {sizes.map((size) => (
                <View
                  key={size}
                  className={classnames(
                    styles.doodleSizeBtn,
                    doodleSize === size && styles.doodleSizeBtnActive
                  )}
                  onClick={() => setDoodleSize(size)}
                >
                  <View
                    className={styles.doodleSizeDot}
                    style={{ width: `${size}rpx`, height: `${size}rpx` }}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.doodleActions}>
          <View className={styles.doodleClearBtn} onClick={handleClearDoodles}>
            <Text className={styles.doodleClearBtnText}>清除</Text>
          </View>
          <View className={styles.doodleConfirmBtn} onClick={handleConfirmDoodle}>
            <Text className={styles.doodleConfirmBtnText}>✓ 完成</Text>
          </View>
        </View>
      </View>
    );
  }

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

      <View className={styles.imageSection}>
        <Text className={styles.sectionLabel}>图片涂抹</Text>
        {selectedImage ? (
          <View className={styles.selectedImageWrap}>
            <View className={styles.selectedImageInner}>
              <Image
                className={styles.selectedImage}
                src={selectedImage.url}
                mode="aspectFill"
                style={{ width: '100%', height: '300rpx' }}
              />
              {doodles.length > 0 && (
                <View className={styles.doodleOverlay}>
                  <svg
                    className={styles.doodleSvg}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {doodles.map((d) => renderDoodlePathForPreview(d))}
                  </svg>
                </View>
              )}
            </View>
            <View className={styles.imageActions}>
              <View className={styles.editImageBtn} onClick={() => setShowDoodle(true)}>
                <Text className={styles.editImageBtnText}>🎨 编辑涂抹</Text>
              </View>
              <View className={styles.removeImageBtn} onClick={handleRemoveImage}>
                <Text className={styles.removeImageBtnText}>删除</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className={styles.imagePicker} onClick={handleChooseImage}>
            <Text className={styles.imagePickerEmoji}>📷</Text>
            <Text className={styles.imagePickerText}>点击添加图片</Text>
            <Text className={styles.imagePickerHint}>可涂抹遮挡敏感内容后发布</Text>
          </View>
        )}
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
