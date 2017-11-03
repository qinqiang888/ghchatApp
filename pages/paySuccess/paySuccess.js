var app = getApp();
var globalData = app.globalData;
var title = globalData.title;
var desc = globalData.desc;
var path = globalData.path;
Page({
  data:{
   userMobile:''
  },
  onLoad:function(options){
    this.setData({
      userMobile:wx.getStorageSync('userMobile'),
      orderId: wx.getStorageSync('orderId')
    })
    // 生命周期函数--监听页面加载
   
  },
  orderDetail:function(){
    var that = this;
    wx.redirectTo({
      url: '/pages/orderDetail/orderDetail?orderId='+that.data.orderId
    })
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