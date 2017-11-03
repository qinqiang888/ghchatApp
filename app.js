//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力      
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    if (this.globalData.detailTime){
      clearInterval(this.globalData.detailTime);
      clearInterval(this.globalData.detailTime1);
      clearInterval(this.globalData.secondTime);
    }
  },
  globalData: {
    userInfo: null,
    code: null,
    userId: null,//用户id
    sid: '85000000000',//渠道
    source: 'swxapp_users_002',
    version: '1.56',
    newversion: '56',
    title: '医院挂号预约',//分享标题
    desc: '医院预约挂号，提供全国超千家三甲医院挂号陪诊，就医周边服务。',//分享描述
    // path: 'http://ua.yihu365.com/yihu365/huanzhe/download/80001100201.jsp',// 分享路径
    path: '/pages/index/index',// 分享路径 
    requestUrl: 'https://h5.yihu365.com/NurseHomeControl.action',//业务接口地址
    loginUrl: 'https://h5.yihu365.com/swxLogin.action',//登录接口地址
    loginOutUrl: 'https://h5.yihu365.com/loginOut.action',//退出登录接口地址
    imgUploadUrl: 'https://h5.yihu365.com/upload/imgUpload.action',//上传头像地址
    addressUrl: 'https://h5.yihu365.com/remoteAccess/remote',

    //cityCode请求地址
    userInfo: null,
    ajaxUrls: 'https://h5.yihu365.com/NurseHomeControl.action?encryption=false',

    detailTime:'',//3s后台校验时间执行倒计时 obj
    detailTime1: '',
    secondTime: ''
  
  }
})