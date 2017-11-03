// doctor.js
var app = getApp();
var globalData = app.globalData;
var sid = globalData.sid;
var ajaxUrls = globalData.ajaxUrls;
var version = globalData.version;
var newversion = globalData.newversion;
var title = globalData.title;
var desc = globalData.desc;
var path = globalData.path;
var stopTime = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:'',//列表obj

    currentPage: 1,//当前页数

    total:'',//总页数

    pageSize:10,//每页条数

    loadingBlen:true,//滑动加载父元素

    loadingEnd: true,//true:未加载完成；false：加载完成

    dialogBlen: true,//错误弹框
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderList: '',//列表obj

      currentPage: 1,//当前页数

      total: '',//总页数

      pageSize: 10,//每页条数

      loadingBlen: true,//滑动加载父元素

      loadingEnd: true,//true:未加载完成；false：加载完成

      dialogBlen: true,//错误弹框
    })
    this.getList(1);
  },

  /**
   * 获取医生列表
   */
  getList: function (currentPage, loadingTime){
    var that = this;
    var hospitalId = wx.getStorageSync('hospitalId');
    var departId = wx.getStorageSync('firDepartmentId');
    var subDepartId = wx.getStorageSync('subDepartmentId');
    //var hospitalId = '1076';
    //var departId = '103';
    //var subDepartId = '10186';
    var dt = {
      'pageNo': currentPage.toString(),
      'pageSize': that.data.pageSize,
      'function': 'getGhDoctors',
      'hospitalId': hospitalId.toString(),
      'departId': departId,
      "subDepartId": subDepartId,
      "_from": "h5",
      'sid': sid
    };
    wx.request({
      url: ajaxUrls,
      data: {'data': JSON.stringify(dt) },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (result) {
        var res = result.data;
        if (res.code == '0000') {
          if (res.data.length != 0) {
            var list, loading = false;
            if (currentPage == 1) {
              list = res.data;
            } else {
              list = that.data.orderList.concat(res.data)
            }
            if (res.countNum == that.data.pageSize) {
              loading = true;
            }
            //that.sortTime(list);//设置list数组的时间
            var totalNum = Math.ceil(res.countNum / that.data.pageSize);
            that.setData({
              orderList: list,
              total: totalNum,
              dialogBlen: true,
              loadingBlen: loading,
            });
            if (currentPage >= totalNum){
              that.setData({
                loadingEnd: false,
              });
            }
            clearTimeout(loadingTime);
          } 
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
        }, 2500);
      }
    });
  },

  /**
   * 选择医生
   */
  selectDoctor:function(e){
    var dataSet = e.currentTarget.dataset;
    var id = dataSet.id;
    var name = dataSet.name;
    wx.setStorageSync('doctorId', id);
    wx.setStorageSync('doctorName', name);
    var hospitalId = wx.getStorageSync('hospitalId');
    var departId = wx.getStorageSync('firDepartmentId');
    var subDepartId = wx.getStorageSync('subDepartmentId');
    //var hospitalId = '1076';
    //var departId = '103';
    //var subDepartId = '10186';
    //获取服务费
    var dt = {
      'function': 'getGhServiceFee',
      "hospitalId": hospitalId.toString(),
      "departId": departId,
      "subDepartId": subDepartId,
      "doctorId": id,
      "doctorName": name,
      "regType": wx.setStorageSync("roleType"),
      'version': '1.55',
      'newversion': '55',
      '_from': 'h5'
    };
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
          wx.setStorageSync('servicePrice', res.data);
          wx.redirectTo({
            url: '/pages/order/order',
          });
        }else{
          that.setData({
            dialogBlen: false,
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

    if (current > total) {
      /*that.setData({
        loadingEnd: false
      });*/
      return;
    }
    that.setData({
      currentPage: current,
    });

    var time = setTimeout(function () {
      that.getList(current, time);
    }, 500);
  },

  //下拉刷新
  onPullDownRefresh: function () {
    if (stopTime) {
      clearTimeout(stopTime);
    }
    this.setData({
      currentPage: 1,
      orderList:'',
      loadingBlen:true,
      loadingEnd:true
    });
    this.getList(1);
  },

  //点击弹框消失
  modalChange: function () {
    this.setData({
      dialogBlen: true
    });
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