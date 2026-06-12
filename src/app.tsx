import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import './app.scss';

function App(props) {
  const { isVerified, isGuest } = useAppStore();

  useEffect(() => {
    if (!isVerified && !isGuest) {
      console.log('[App] 未验证，跳转到入口页');
      Taro.navigateTo({ url: '/pages/entry/index' });
    } else {
      console.log('[App] 已验证/游客模式', { isVerified, isGuest });
    }
  }, [isVerified, isGuest]);

  useDidShow(() => {});
  useDidHide(() => {});

  return props.children;
}

export default App;
