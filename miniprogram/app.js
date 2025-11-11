// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('青少年羽毛球训练知识库 Mini Program Launched')

    // 检查网络状态
    this.checkNetworkStatus()

    // 初始化全局数据
    this.globalData = {
      userRole: null, // 用户角色: coach, parent, athlete
      selectedAgeGroup: null, // 当前选择的年龄组
      cdnBaseUrl: 'https://cdn.example.com', // CDN 基础 URL (待配置)
    }
  },

  onShow() {
    // 小程序显示时执行
    console.log('App shown')
  },

  onHide() {
    // 小程序隐藏时执行
    console.log('App hidden')
  },

  /**
   * 检查网络状态
   */
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType
        console.log('Network type:', networkType)

        if (networkType === 'none') {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none',
            duration: 2000,
          })
        }
      },
      fail: (err) => {
        console.error('Failed to get network type:', err)
      },
    })
  },

  globalData: {
    userRole: null,
    selectedAgeGroup: null,
    cdnBaseUrl: 'https://cdn.example.com',
  },
})
