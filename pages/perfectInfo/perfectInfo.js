var app = getApp();
var url = app.globalData.requestUrl,
  userid = wx.getStorageSync('userId'),
  sid = app.globalData.sid,
  newversion = app.globalData.newversion,
  version = app.globalData.version,
  sex_v = '',
  realInfo = wx.getStorageSync('realInfo'),
  source = app.globalData.source;
var nickName, realName, idCard,height, weight;
Page({
  data: {
    sex: ['男', '女'],
    setsex:'',
    array: [
      wx.getStorageSync('nickName'),//昵称
      wx.getStorageSync('userMobile'),//手机
      wx.getStorageSync('userRealName'),//真实姓名
      wx.getStorageSync('userIdCardNo'),//身份证
      wx.getStorageSync('height'),//身高
      wx.getStorageSync('weight')//体重
    ],
    index: 10,
    nickName: '',
    realName: '',
    idCard: '',
    height: '',
    weight: '',
    isChinese:'',//是否是中文
    //是否错误弹框，true为隐藏弹框
    dialogBlen: true,
    //错误弹框msg
    dialogMsg: ''
  },
  // 性别选择
  bindPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
  
    this.setData({
      index: e.detail.value
    });
    wx.setStorageSync('userSex',e.detail.value);
    console.log(e.detail.value);

  },
  // 昵称
  blurnickname: function (e) {
    this.setData({
      nickName: e.detail.value
    })
    wx.setStorageSync('nickName',e.detail.value);
  },
  // 真实姓名
  blurname: function (e) {
    this.setData({
      realName: e.detail.value
    });
    console.log(e.detail.value);
    wx.setStorageSync('userRealName',e.detail.value);
  },
  // 身份证
  blurcard: function (e) {
    this.setData({
      idCard: e.detail.value
    })
  },
  // 身高
  blurheight: function (e) {
    this.setData({
      height: e.detail.value
    });
     wx.setStorageSync('height',e.detail.value);
     console.log('height'+'--'+e.detail.value);
  },
  // 体重
  blurweight: function (e) {
    this.setData({
      weight: e.detail.value
    });
    
    wx.setStorageSync('weight',e.detail.value);
     console.log('weight'+ e.detail.value);
  },
  // 保存信息
  bindsave: function (e) {
    var $this = this,
     
      
      // 中文正则  
      regname = /^[\u4e00-\u9fa5]*$/,
      // 身份证正则
      cardreg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/;
    sex_v = wx.getStorageSync('userSex');
    nickName = wx.getStorageSync('nickName'),//昵称
    height = wx.getStorageSync('height')
    weight = wx.getStorageSync('weight');//体重
    

    // //如果存储了信息
    // if (realInfo == true) {
    //     nickName = wx.getStorageSync('nickName'),//昵称
    //     height = wx.getStorageSync('height')
    //   weight = wx.getStorageSync('weight');//体重
    // } else {
    //   nickName = $this.data.nickName,
    //     sex_v = $this.data.setsex,
    //     height = $this.data.height,
    //     weight = $this.data.weight;
    // }
    //如果不是从小程序填写的信息,而是官网注册的信息,但是信息并不完整,存储了信息,但是之前并没有存储身份证和真实姓名
    if (wx.getStorageSync('userRealName')) {
      realName = wx.getStorageSync('userRealName');
    } else {
      realName = this.data.realName;
    }

    if (wx.getStorageSync('userIdCardNo')) {
      idCard = wx.getStorageSync('userIdCardNo');//身份证
    } else {
      idCard = this.data.idCard;

    }
    if (!nickName) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入昵称'
      });
      return;
    }
    if (!realName) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入您的真实姓名'
      });
      return;
    }
    if (!idCard) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入您的身份证'
      });
      return;
    }

    //验证是否是中文格式
    if (!regname.test(realName)) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入中文格式姓名',
        isChinese:true
      });
      return;
    }
    // 验证身份证格式
    if (!cardreg.test(idCard)) {
      $this.setData({
        chanise: '1',
        dialogBlen: false,
        dialogMsg: '请输入正确身份证号'
      });
      return;
    }
   
    if (height > 300 || height <1) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '身高不能小于0不能大于300'
      });
      return;
    }
    if (weight > 300 || weight < 1) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '体重不能小于0不能大于300'
      });
      return;
    }
     if(height == 0){
      height ='';
    }
    if(weight==0){
weight='';
    }
    
    var userid = $this.data.userid;
    var swx_session=wx.getStorageSync("wx_session");
    var dt = {
      'function': 'updateUserInfo',
      'userid': userid,
      'login_userId_base':userid,
      'nickName': nickName,
      'userSex':sex_v,
      'userRealName1': '',
      'userRealName': realName,
      'userIdCardNo': idCard,
      'height': height + '',
      'weight': weight + '',
      'sid': sid,
      'newversion': newversion,
      "version": version,
      "source": source,
      "swx_session":swx_session
    }
    wx.request({
      url: url,
      data: { "encryption": false, "data": JSON.stringify(dt) },
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == '0000') {  
          wx.showToast({
            title: '保存成功!',
            icon: 'success',
            duration: 3000
          });
          wx.redirectTo({ url: '/pages/home/home' });
        } else if(res.data.code == '0502') {
          /*$this.setData({
            dialogBlen: false,
            dialogMsg: '登录异常，请重新登录'
          });*/
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }else {
          $this.setData({
            dialogBlen: false,
            dialogMsg: res.data.message
          });
        }
      }
    })
  },
  //弹框消失
  modalChange: function () {
    this.setData({
      dialogBlen: true
    });
  },
  onLoad: function () { 
    var localsex = wx.getStorageSync('userSex');
    console.log(localsex);
    console.log('height=' + height + '---weight=' + weight);
    var _sex;
    if (localsex == '0') {
      _sex = '男';
    } else if (localsex == '1') {
      _sex = '女';
    } else {
      _sex = '';
    }
    this.setData({
      setsex: _sex,
      userid : wx.getStorageSync('userId'),
      array: [
      wx.getStorageSync('nickName'),//昵称
      wx.getStorageSync('userMobile'),//手机
      wx.getStorageSync('userRealName'),//真实姓名
      wx.getStorageSync('userIdCardNo'),//身份证
      wx.getStorageSync('height'),//身高
      wx.getStorageSync('weight')//体重
    ],
      height: wx.getStorageSync('height'),
      weight: wx.getStorageSync('weight')
    });
    console.log(sex_v, height, weight);

  },
  /*onShareAppMessage: function () {

    // 用户点击右上角分享
    return {
      title: title, // 分享标题
      desc: desc, // 分享描述
      path: path // 分享路径
    }
  }*/
})
