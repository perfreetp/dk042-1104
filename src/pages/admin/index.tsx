import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { formatTime } from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import type { ReportItem } from '@/types';
import styles from './index.module.scss';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('reports');
  const { reports, resolveReport, pinPost } = useAppStore();

  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === 'pending'),
    [reports]
  );

  const handleBan = (report: ReportItem) => {
    resolveReport(report.id, 'ban');
    Taro.showToast({ title: '已禁言处理', icon: 'success' });
  };

  const handleDismiss = (report: ReportItem) => {
    resolveReport(report.id, 'dismiss');
    Taro.showToast({ title: '已驳回举报', icon: 'none' });
  };

  const handlePin = (report: ReportItem) => {
    pinPost(report.postId);
    resolveReport(report.id, 'dismiss');
    Taro.showToast({ title: '已置顶', icon: 'success' });
  };

  const handlePinRules = () => {
    Taro.showToast({ title: '守则已置顶', icon: 'success' });
  };

  const rules = [
    '尊重他人隐私，不泄露他人身份信息',
    '禁止人身攻击、歧视和仇恨言论',
    '禁止发布广告、钓鱼链接等垃圾内容',
    '鼓励善意回应，传播温暖和正能量',
    '违规内容将被删除，严重者将被禁言',
  ];

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🛡️ 管理审核</Text>
        <Text className={styles.subtitle}>维护树洞的温暖与安全</Text>
      </View>

      <View className={styles.tabRow}>
        <View
          className={classnames(styles.tab, activeTab === 'reports' && styles.tabActive)}
          onClick={() => setActiveTab('reports')}
        >
          <Text
            className={classnames(styles.tabText, activeTab === 'reports' && styles.tabTextActive)}
          >
            举报处理 {pendingReports.length > 0 ? `(${pendingReports.length})` : ''}
          </Text>
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'rules' && styles.tabActive)}
          onClick={() => setActiveTab('rules')}
        >
          <Text
            className={classnames(styles.tabText, activeTab === 'rules' && styles.tabTextActive)}
          >
            社区守则
          </Text>
        </View>
      </View>

      {activeTab === 'reports' && (
        <>
          {pendingReports.length > 0 ? (
            pendingReports.map((report) => (
              <View key={report.id} className={styles.reportCard}>
                <View className={styles.reportHeader}>
                  <View className={styles.reportReason}>
                    <Text className={styles.reportReasonText}>{report.reason}</Text>
                  </View>
                  <Text className={styles.reportTime}>{formatTime(report.createdAt)}</Text>
                </View>
                <Text className={styles.reportContent}>{report.postContent}</Text>
                <View className={styles.reportActions}>
                  <View className={`${styles.actionButton} ${styles.banBtn}`} onClick={() => handleBan(report)}>
                    <Text className={styles.actionButtonEmoji}>🚫</Text>
                    <Text className={`${styles.actionButtonText} ${styles.banBtnText}`}>禁言</Text>
                  </View>
                  <View className={`${styles.actionButton} ${styles.dismissBtn}`} onClick={() => handleDismiss(report)}>
                    <Text className={styles.actionButtonEmoji}>✓</Text>
                    <Text className={`${styles.actionButtonText} ${styles.dismissBtnText}`}>驳回</Text>
                  </View>
                  <View className={`${styles.actionButton} ${styles.pinBtn}`} onClick={() => handlePin(report)}>
                    <Text className={styles.actionButtonEmoji}>📌</Text>
                    <Text className={`${styles.actionButtonText} ${styles.pinBtnText}`}>置顶</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyEmoji}>✨</Text>
              <Text className={styles.emptyText}>暂无待处理举报</Text>
            </View>
          )}
        </>
      )}

      {activeTab === 'rules' && (
        <View className={styles.rulesCard}>
          <Text className={styles.rulesTitle}>📋 树洞社区守则</Text>
          {rules.map((rule, idx) => (
            <View key={idx} className={styles.ruleItem}>
              <View className={styles.ruleIndex}>
                <Text className={styles.ruleIndexText}>{idx + 1}</Text>
              </View>
              <Text className={styles.ruleText}>{rule}</Text>
            </View>
          ))}
          <View className={styles.pinRuleBtn} onClick={handlePinRules}>
            <Text className={styles.pinRuleBtnText}>📌 置顶守则</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default AdminPage;
