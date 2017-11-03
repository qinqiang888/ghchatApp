const app = getApp();
const ajaxUrls = app.globalData.requestUrl;
const sid = app.globalData.sid;
const source = app.globalData.source;
const version = app.globalData.version;
const newversion = app.globalData.newversion;
const util = require('../../utils/util.js');
var title = app.globalData.title;
var desc = app.globalData.desc;
var path = app.globalData.path;
var stopTime,loadingBox = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    List:[],

    currentPage:1,
    typeStatus:'0',

    orderId:'',
    price:'',
    total: '',//总页数

    pageSize: 10,//每页条数

    loadingBlen: true,//滑动加载父元素

    loadingEnd: true,//true:未加载完成；false：加载完成

    dialogBlen: true,//错误弹框

    cancleModal: true,//取消预约弹框
    cancelResult: '001',//取消预约原因
    radioBlen: true,
    otherResultCon: '',//退款&&取消其他原因

    doorSureBlen: true,//确认服务弹框
    fixedModal: false//错误弹框

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyOrderList(1,'0');
  },

  getMyOrderList: function (currentPage, typeStatus, loadingTime) {
    let that = this;
    let userId=wx.getStorageSync('userId');
    var swx_session = wx.getStorageSync("wx_session");
    //let userId = '11623'
    // let pageType=e.target.dataset.type;
    // let cityCode=e.target.dataset.code;
    let dt = {
      'function': 'getMyOrderList',
      'userid': userId,
      currentPage: currentPage.toString(),
      pageSize: '10',
      queryStatus: typeStatus,
      'login_userId_base': userId,
      "swx_session": swx_session
    }
    wx.request({
      url: ajaxUrls,
      data: { "encryption": false, "data": JSON.stringify(dt) },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function (result) {
        var res = result.data;
        if (res.code == '0000') {
          //if (res.List.length != 0) {
            var list, loading = false,loadingEnd = true;
            if (currentPage == 1) {
              list = res.List;
            } else {
              list = that.data.List.concat(res.List)
            }
            if (res.List.length<10){
              loading = true;
              loadingEnd = false;
            }
            /*if (res.pageNum == currentPage) {
              loading = true;
            }*/

            var totalNum = res.pageNum;
            that.setData({
              List: list,
              total: totalNum,
              dialogBlen: true,
              loadingBlen: loading,
              loadingEnd: loadingEnd
            });
            /*if (currentPage >= totalNum) {
              that.setData({
                loadingEnd: false,
              });
            }*/
            clearTimeout(loadingTime);
          //}
        } else if (res.code == '0502') {
          wx.redirectTo({
            url: '/pages/login/login'
          });
        } else {
          that.setData({
            dialogBlen: false,
            dialogMsg: res.message
          });
        }
        stopTime = setTimeout(function () {
          wx.stopPullDownRefresh({
            complete: function (res) {
              console.log(res, new Date())
            }
          });
        }, 2000);
      }
    })
  },

  /**
   * 点击列表
   */
  listEvent:function(e){
    var code = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?orderId='+code,
    })
  },

  /**
   * 导航tap
   */
  tapEvent:function(e){
    var code = e.target.dataset.code;
    this.setData({
      typeStatus:code,
      currentPage:1,
      Lise:''
    });
    this.getMyOrderList(1,code);
  },

  //取消预约接口
  cancelEvent: function () {
    var that = this;
    var orderId = that.data.orderId.toString();
    var userId = wx.getStorageSync('userId');
    var reasonId = this.data.cancelResult;
    var otherCon = this.data.otherResultCon;
    if (reasonId == '004' && !otherCon) {
      that.setData({
        fixedModal: true,
        fiexedCon: '请输入其他原因'
      });
      var timer = setTimeout(function () {
        that.setData({
          fixedModal: false
        });
        clearTimeout(timer);
      }, 3000);
      return;
    }

    //var orderId = '31394';

    var dt = {
      'function': 'cancel',
      'order_id': orderId,
      'user_id': userId,
      'type': '0',
      'cancelreasonId': reasonId,
      'cancelReasonContent': otherCon,
      //'login_userId_base': userId,
      'version': version,
      'newversion': newversion,
      'source': source,
      "sid": sid
    }
    wx.request({
      url: ajaxUrls,
      data: { 'data': JSON.stringify(dt) },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (result) {
        var res = result.data;
        if (res.code == '0000') {
          that.setData({
            cancleModal: true,
            otherResultCon: '',
            cancelResult: '001',
          });
          that.detailList();
        } else if (res.code == '0502') {
          wx.redirectTo({
            url: '/pages/login/login'
          });
        } else {
          that.setData({
            dialogBlen: false,
            cancleModal: true,
            otherResultCon: '',
            cancelResult: '001',
            dialogMsg: res.message
          });
        }
      }
    });
  },

  //医护抢约取消预约
  cancleOrderPay: function (e) {
    this.setData({
      cancleModal: false,
      orderId: e.target.dataset.id
      //dialogBlen: true
    });
  },

  //取消预约确认弹框
  detailCancleChange: function () {
    this.cancelEvent();
  },

  //取消预约&& 申请退款radio
  cancelRadio: function (e) {
    var val = e.detail.value,
      otherResult = false;
    if (val == '004') {
      otherResult = true;
    }
    this.setData({
      cancelResult: val,
      otherResult: otherResult
    });
  },

  //取消预约&& 申请退款 其他原因
  otherResult: function (e) {
    this.setData({
      otherResultCon: e.detail.value
    })
  },

  /**
   * 错误弹框
   */
  modalChange: function () {
    this.setData({
      dialogBlen: true,
      cancleModal: true,
      drawbackModal: true,
      drawbackModalFirst: true,
      radioBlen: true,
      otherResult: false,
      cancelResult: '001',
      otherResultCon: '',
      doorSureBlen: true,
      telNurseBlen: true
    });
  },

  //去支付
  goToPay: function (e) {
    var price = e.target.dataset.price;
    var orderId = e.target.dataset.id;
    wx.setStorageSync('price', price);
    wx.redirectTo({
      url: '/pages/pay/pay?orderId=' + orderId
    });
  },

  //确认服务
  sureDoor: function (e) {
    this.setData({
      doorSureBlen: false,
      orderId: e.target.dataset.id
    });
  },

  //确认完成服务弹框
  doorSureEvent: function () {
    var that = this;
    var orderId = that.data.orderId.toString();
    var userId = wx.getStorageSync('userId');


    //var orderId = '532197';

    var dt = {
      'function': 'door',
      'order_id': orderId,
      'user_id': userId,
      'version': version,
      'newversion': newversion,
      "sid": sid
    }
    wx.request({
      url: ajaxUrls,
      data: { 'data': JSON.stringify(dt) },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (result) {
        var res = result.data;
        if (res.code == '0000') {
          that.detailList();
          that.setData({
            doorSureBlen: true
          })
        } else if (res.code == '0502') {
          /*that.setData({
              dialogBlen:false,
              dialogMsg:'登录异常，请重新登录',
          });*/
          wx.redirectTo({
            url: '/pages/login/login'
          });
        } else {
          that.setData({
            dialogBlen: false,
            doorSureBlen: true,
            dialogMsg: res.message
          });
        }
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var current = that.data.currentPage + 1;
    var total = that.data.total;
    var typeName = that.data.typeStatus;

    /*if (current > total) {
      return;
    }*/
    that.setData({
      currentPage: current,
    });

    var time = setTimeout(function () {
      that.getMyOrderList(current, typeName, time);
    }, 500);
  },

  //下拉刷新
  onPullDownRefresh: function () {
    if (stopTime) {
      clearTimeout(stopTime);
    }
    var typeName = this.data.typeStatus;
    this.setData({
      currentPage: 1,
      List: '',
      loadingBlen: true,
      loadingEnd: true
    });
    this.getMyOrderList(1, typeName);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    // 用户点击右上角分享
    return {
      title: title, // 分享标题
      desc: desc, // 分享描述
      path: path // 分享路径
    }
  }
})