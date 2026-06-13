export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/drift/index',
    'pages/mine/index',
    'pages/entry/index',
    'pages/publish/index',
    'pages/publishResult/index',
    'pages/detail/index',
    'pages/admin/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F8F7FF',
    navigationBarTitleText: '匿名树洞',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#B2BEC3',
    selectedColor: '#6C5CE7',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '树洞' },
      { pagePath: 'pages/drift/index', text: '漂流' },
      { pagePath: 'pages/mine/index', text: '我的' },
    ],
  },
})
