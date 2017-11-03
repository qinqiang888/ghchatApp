//index.js
//获取应用实例
var app = getApp();
var globalData = app.globalData;
var sid = globalData.sid;
var ajaxUrls = globalData.ajaxUrls;
var version = globalData.version;
var newversion = globalData.newversion;
var title = globalData.title;
var desc = globalData.desc;
var path = globalData.path;

var saveBlen = true;//防止多次提交
Page({
  data: {
    array: ['自己', '爸爸', '妈妈', '亲戚', '朋友', '孩子', '其他'],
    objectArray: [{ id: 0, name: "自己" }, { id: 1, name: "爸爸" }, { id: 2, name: "妈妈" }, { id: 3, name: "亲戚" }, { id: 4, name: "朋友" }, { id: 5, name: "孩子" }, { id: 6, name: "其他" }],
    index: 8,
    focus: false,
    nameVal: '',
    carVal: '',
    sex_v: '',
    relationship_v: '',
    //是否错误弹框，true为隐藏弹框
    dialogBlen: true,
    //错误弹框msg
    dialogMsg: ''
  },

  onLoad: function () {
    // wx.clearStorage()
    var that = this
    //更新数据
    that.setData({
      userid: wx.getStorageSync('userId')
    })
  },

  bindblur: function (e) {
    this.setData({
      nameVal: e.detail.value
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      carVal: e.detail.value
    })
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      index: e.detail.value,
    });
    const _this = this;
    const len = this.data.objectArray.length;
    for (let i = 0; i < len; ++i) {
      if (e.detail.value == i) {
        _this.data.relationship_v = _this.data.objectArray[i].name;
      }
    }
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.data.sex_v = e.detail.value;
    this.setData({
      sex_v: e.detail.value,
    });
  },
  /*保存档案 */
  tapSave: function (event) {
    var $this = this;
    if (!saveBlen){
      return;
    }
    saveBlen = false;
    if (this.data.nameVal == '') {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入姓名'
      });
      saveBlen = true;
      return;
    }
    // 身份证正则
    var cardreg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/,
    // 中文正则
      regname = /^[\u4e00-\u9fa5]*$/,
      name = this.data.nameVal,
      idCar = this.data.carVal,
      sex = this.data.sex_v,
      relationship = this.data.relationship_v,
      myDate = new Date(),
      month = myDate.getMonth() + 1,
      day = myDate.getDate(),
      age;
      // 验证是否是中文格式
    if (!regname.test(name)) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入中文格式姓名'
      });
      saveBlen = true;
      return;
    }

    if (this.data.carVal == '') {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入身份证'
      });
      saveBlen = true;
      return;
    }

    // 验证身份证格式
    if (!cardreg.test(idCar)) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请输入正确身份证号'
      });
      saveBlen = true;
      return;
    }
    if (idCar) {
      //算出年龄
      age = (myDate.getFullYear() - idCar.substring(6, 10)).toString();
    }
    if (!this.data.sex_v) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请选择性别'
      });
      saveBlen = true;
      return;
    }
    if (!this.data.relationship_v) {
      $this.setData({
        dialogBlen: false,
        dialogMsg: '请选择患者关系'
      });
      saveBlen = true;
      return;
    }
    //发起请求
    //var swx_session=wx.getStorageSync("wx_session");
    var userid = $this.data.userid;
    //var userid = '13172';
    var dt = {
      'function': 'savePatientInfo',
      'userid': userid,
      'login_userId_base':userid,
      'realname': '',
      'sex': '',
      'age': '',
      'relationship': '',
      'idCardNo': '',
      'sid': sid,
      '_from': 'h5',
      //"swx_session": swx_session
    }
    dt.realname = name;
    dt.idCardNo = idCar;
    dt.sex = sex;
    dt.age = age;
    dt.relationship = relationship;
    wx.request({
      url: ajaxUrls,
      data: {"data": JSON.stringify(dt) },
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == "0000") {
          wx.redirectTo({
            url: '/pages/selectPatientList/selectPatientList'
          });
          saveBlen = true;
        }else if(res.data.code == '0502') {
          wx.redirectTo({
            url: '/pages/login/login',
          });
          saveBlen = true;
        }else{
          $this.setData({
              dialogBlen: false,
              dialogMsg: res.data.message
          });
          saveBlen = true;
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
  onShareAppMessage: function () {

    // 用户点击右上角分享
    return {
      title: title, // 分享标题
      desc: desc, // 分享描述
      path: path // 分享路径
    }
  }
})