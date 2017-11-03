var app = getApp();
var globalData = app.globalData;
var sid = globalData.sid;
var ajaxUrls = globalData.ajaxUrls;
var title = globalData.title;
var desc = globalData.desc;
var path = globalData.path;
Page({
    data: {
        patientId:wx.getStorageSync('patientId'),
        AddPatientList: '',
        edit: false,
        //是否错误弹框，true为隐藏弹框
        dialogBlen: true,
        //错误弹框msg
        dialogMsg: ''
    },

    onLoad: function (options) {
      this.setData({
        patientId: wx.getStorageSync('patientId'),
        userid: wx.getStorageSync("userId")
      });

      this.selectPatient();
      //console.log(wx.getStorageSync('patientId'));
    },

    edit: function () {
        this.setData({
            edit: true
        })
    },
    over: function () {
        this.setData({
            edit: false
        })
    },

    /**
     * 患者列表
     */
    selectPatient: function () {
        var _this = this
        var userid = _this.data.userid;
        //var swx_session=wx.getStorageSync("wx_session");
        //var userid = '13172';
        var dt = {
            'function': 'selectPatientInfoById',
            'login_userId_base':userid,
            'userid': userid,
            'sid': sid,
            '_from': 'h5',
            //'newversion': newversion,
            //"version": version,
            //"swx_session":swx_session
        };
        wx.request({
          url: ajaxUrls,
            data: {"data": JSON.stringify(dt) },
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                if(res.data.code=="0000"){
                    _this.setData({ AddPatientList: res.data.data });
                }else if(res.data.code=="0502"){
                    //util.wxshowModal(res.data.message,false)
                    wx.redirectTo({
                        url: '/pages/login/login',
                    })
                }else{
                  _this.setData({
                    dialogBlen: false,
                    dialogMsg: res.data.message
                  });
                }
            },
            fail: function () {
                // fail
            },
            complete: function () {
                // complete
            }
        })
    },

    /**
     * 删除患者列表
     */
    delPatient: function (e) {
        var _this = this;
        var ids = e.target.dataset.id.toString();
        //var swx_session=wx.getStorageSync("wx_session");
        var dt = {
            "function": "deletePatientInfoById",
            "ID": ids,
            'sid': sid,
            '_from': 'h5',
            //'newversion':newversion,
            //"version": version,
            //"swx_session":swx_session
        }
        wx.request({
            url: ajaxUrls,
            data: {"data": JSON.stringify(dt) },
            method: 'POST', 
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 设置请求的 header
            },
            success: function (res) {
                console.log(res);
                if (res.data.code == "0000") {
                    _this.selectPatient();
                }else if(res.data.code=="0502"){
                    wx.redirectTo({
                        url: '/pages/login/login',
                    })
                }else{
                  _this.setData({
                    dialogBlen: false,
                    dialogMsg: res.data.message
                  });
                }
            },
            fail: function () {
                // fail
            },
            complete: function () {
                // complete
            }
        })
    },

    /**
     * 添加患者信息
     */
    addPatient: function () {
      wx.redirectTo({
        url: "/pages/patient/patient",
      })
      //wx.navigateTo({ url: "/pages/patient/patient"});
    },

    /**
     * 选择患者列表
     */
    order: function (e) {
        console.log(e)
        var setsex,objUserInfo;
        if (e.currentTarget.dataset.sex == '0') {
            setsex = '男';
        }else{
            setsex = '女';
        }
        objUserInfo = {
          'ID': e.currentTarget.dataset.ID,
          'relationship': e.currentTarget.dataset.ship,
          'card': e.currentTarget.dataset.card,
          'name': e.currentTarget.dataset.name,
          'age': e.currentTarget.dataset.age,
          'patientId': e.currentTarget.dataset.id,
          'sex': setsex
        }
        wx.setStorageSync('patientId', e.currentTarget.dataset.id);
        wx.setStorageSync('objUserInfo', objUserInfo);
        wx.redirectTo({
            url: "/pages/order/order"
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