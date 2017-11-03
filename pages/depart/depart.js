const app = getApp();
const ajaxUrls = app.globalData.requestUrl;
const sid = app.globalData.sid;
const source = app.globalData.source;
const version = app.globalData.version;
const newversion = app.globalData.newversion;
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    departList: [],//一级科室
    subdepartList: [],//二级科室
    curdepart_index: 0,
    subdepartindex: wx.getStorageSync('subdepartindex') || ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var hospitalName = wx.getStorageSync('hospitalName');
    wx.setNavigationBarTitle({
      title: hospitalName
    })
    var hospitalId = options.hospitalId;
    this.getGhHospitalDepartRef(hospitalId);
    this.clearBoth();
  },
  /**
   *  清除
   */
  clearBoth: function () {
  

    wx.removeStorageSync("firDepartmentId");
    wx.removeStorageSync("subDepartmentId");
    wx.removeStorageSync('subdepartindex');

    wx.removeStorageSync("secondDepartmentName");
    wx.removeStorageSync("firDepartmentName");

    wx.removeStorageSync("roleType");

    wx.removeStorageSync('stime');
    wx.removeStorageSync('etime');
    
    wx.removeStorageSync("doctorId");
    wx.removeStorageSync("doctorName");

    wx.removeStorageSync("patientId");
    wx.removeStorageSync("objUserInfo");

    wx.removeStorageSync("servicePrice");

    wx.removeStorageSync("diseaseId");
    wx.removeStorageSync("diseaseName"); 
    wx.removeStorageSync('addPrice');
    wx.removeStorageSync('details');


    wx.removeStorageSync('startDateArrayUp');
    wx.removeStorageSync('startDateArray');
    wx.removeStorageSync('startTimeIndex');

    wx.removeStorageSync('endDateArrayUp');
    wx.removeStorageSync('endDateArray');
    wx.removeStorageSync('endTimeIndex');
  },
  getLocation: function () {
    var _this = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude.toString();
        var longitude = res.longitude.toString();
        wx.setStorageSync('latitude', latitude);
        wx.setStorageSync('longitude', longitude);
        var location = latitude + ',' + longitude;
        _this.getCityCode(location);
      }
    })
  },
  getCityCode: function (location) {
    var _this = this;
    var url = app.globalData.addressUrl;
    var mapurl = encodeURIComponent('https://api.map.baidu.com/geocoder/v2/?ak=qhtAc3RfIoiFNP37NlQjn398NQ1qMWGi&location=' + location + '&output=json&pois=1')
    wx.request({
      url: url + '?paramUrl=' + mapurl + '',
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        var province = res.data.result.addressComponent.city.split('市')[0];
        var selectCity = _this.data.city.includes(province) > -1 ? province : '北京';
        _this.setData({
          cityCode: res.data.result.cityCode.toString(),
          selectCity: selectCity
        })

        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  order: function (e) {
    var subdepartindex = e.currentTarget.dataset.index;
    var firDepartmentId = e.currentTarget.dataset.departid;
    var subDepartmentId = e.currentTarget.dataset.subdepartid;
    var departName = e.currentTarget.dataset.departname;
    var subDepartName = e.currentTarget.dataset.subdepartname;
    wx.setStorageSync('subdepartindex', subdepartindex);
    wx.setStorageSync('firDepartmentId', firDepartmentId);
    wx.setStorageSync('subDepartmentId', subDepartmentId);
    wx.setStorageSync('firDepartmentName', departName);
    wx.setStorageSync('secondDepartmentName', subDepartName);
    wx.redirectTo({
      url: '/pages/order/order',
    })
  },
  get_index: function (e) {
    var index = e.currentTarget.dataset.index;
    var departList = this.data.departList;
    this.setData({
      curdepart_index: e.currentTarget.dataset.index,
      subdepartList: departList[index].subDeparts
    })
  },
  getGhHospitalDepartRef: function (hospitalId) {
    var that = this;
    var dt = {
      function: 'getGhHospitalDepartRef',
      hospitalId: hospitalId,
      version: version,
      newversion: newversion,
      sid: sid
    }
    wx.request({
      url: ajaxUrls,
      data: { "encryption": false, "data": JSON.stringify(dt) },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function (res) {
        if (res.data.code == "0000") {
          var index = that.data.curdepart_index;
          that.setData({
            departList: res.data.data.length > 0 ? res.data.data : '',
            subdepartList: res.data.data[index].subDeparts
          })
          console.log(that.data.departList)
          console.log(that.data.subdepartList)
        } else {
          util.wxshowModal(res.data.message, false);
        }
      },
      error: function () {
        util.wxshowModal('发生异常', false);
      }

    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})