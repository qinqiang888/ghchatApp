// disease.js
var app = getApp();
var globalData = app.globalData;
var sid = globalData.sid;
var ajaxUrls = globalData.ajaxUrls;
var version = globalData.version;
var newversion = globalData.newversion;
var title = globalData.title;
var desc = globalData.desc;
var path = globalData.path;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hospitalImg: wx.getStorageSync('hospitalImg'),//医院图片
    dialogBlen:true,
    diseaseListArray:'',
    currentId:'',
    firstDepartment: wx.getStorageSync('firDepartmentName'),
    secondDepartment: wx.getStorageSync('secondDepartmentName')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.diseaseList();
    this.setData({
      currentId: wx.getStorageSync('diseaseId'),
      hospitalImg: wx.getStorageSync('hospitalImg'),//医院图片
      dialogBlen: true,
      diseaseListArray: '',
      firstDepartment: wx.getStorageSync('firDepartmentName'),
      secondDepartment: wx.getStorageSync('secondDepartmentName')
    });
  },

  diseaseList: function () {
    var that = this;
    var hospitalId = wx.getStorageSync('hospitalId');
    var departId = wx.getStorageSync('firDepartmentId');
    var subDepartId = wx.getStorageSync('subDepartmentId');
    //var hospitalId = '1076';
    //var departId = '103';
    //var subDepartId = '10186';
    var dt = { 
      'function': 'getDiseaseList',
      'hospitalId': hospitalId.toString(),
      'departId': departId,
      "subDepartId": subDepartId,
      "_from": "h5",
      "version": version,
      "newversion": newversion,
      'sid': sid
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
          that.setData({
            diseaseListArray:res.data
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

  tapEvent:function(e){
    var dataSet = e.target.dataset;
    var id = dataSet.id;
    var name = dataSet.name;
    wx.setStorageSync('diseaseId', id);
    wx.setStorageSync('diseaseName', name);
    wx.redirectTo({
      url: '/pages/order/order',
    })
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