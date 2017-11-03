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
    hospitalList: '',
    doctorList: '',
    inputValue: '',
    doctorPic: 'http://m.yihu365.com/58/images/undef.png',
    morenpic: 'http://m.yihu365.com/images/xiaocxu/hospimg.jpg',
    qingkong: wx.getStorageSync('historySearch') ? false : true,
    historySearch: wx.getStorageSync('historySearch') || [],
    confirm: false,//是否已经确认搜索完成
    loading:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      loading:true
    })
  },
  //取消
  cancel: function () {
    wx.redirectTo({
      url: "/pages/index/index"
    })
  },
  //查看更多
  viewMore: function (e) {
    var type = e.currentTarget.dataset.type;
    var keyWord=this.data.inputValue;
    wx.navigateTo({
      url: '/pages/viewMore/viewMore?type=' + type + '&keyWord=' + keyWord +'',
    })
  },
  //输入框回退的时候
  back: function (e) {
    console.log(e.detail.value);
    if (!e.detail.value) {
      this.setData({
        confirm: false,
        qingkong: wx.getStorageSync('historySearch') ? false : true,
        historySearch: wx.getStorageSync('historySearch') || []
      })
    }
  },
  click_search:function(e){
    console.log(e)
    this.setData({
      inputValue: e.currentTarget.dataset.keyword,
      confirm: true,
      loading: false
    })
    this.searchGhHospitaByKeyWord();
    this.searchGhdoctorByKeyWord();
  },
  depart:function(e){
    var hospitalId = e.currentTarget.dataset.hospitalid;
    var cityCode = e.currentTarget.dataset.code;
    var hospitalPic = e.currentTarget.dataset.pic;
    var hospitalName = e.currentTarget.dataset.hospitalname;
    wx.setStorageSync('select_cityCode', cityCode);
    wx.setStorageSync('hospitalId', hospitalId);
    wx.setStorageSync('hospitalPic', hospitalPic);
    wx.setStorageSync('hospitalName', hospitalName);
    wx.navigateTo({
      url: '/pages/depart/depart?hospitalId='+hospitalId+'',
    })
  },
  order: function (e) {
    var hospitalId = e.currentTarget.dataset.hospitalid;
    var cityCode = e.currentTarget.dataset.code;
    var userId=wx.getStorageSync('userId');
    var hospitalPic = e.currentTarget.dataset.pic;
    var doctor = e.currentTarget.dataset.doctor;
    var doctorid = e.currentTarget.dataset.doctorid;
    var hospitalName = e.currentTarget.dataset.hospitalname;
    var firDepartmentId = e.currentTarget.dataset.departid;
    var firDepartmentName = e.currentTarget.dataset.firdepartmentname;
    var subDepartmentId = e.currentTarget.dataset.subdepartid;
    var secondDepartmentName = e.currentTarget.dataset.seconddepartmentname;
    
    wx.setStorageSync('select_cityCode', cityCode);
    wx.setStorageSync('hospitalId', hospitalId);
    wx.setStorageSync('doctorName', doctor);
    wx.setStorageSync('doctorId', doctorid);
    wx.setStorageSync('hospitalPic', hospitalPic);
    wx.setStorageSync('hospitalName', hospitalName);
    wx.setStorageSync('firDepartmentId', firDepartmentId);
    wx.setStorageSync('subDepartmentId', subDepartmentId);
    wx.setStorageSync('firDepartmentName', firDepartmentName);
    wx.setStorageSync('secondDepartmentName', secondDepartmentName);
    wx.navigateTo({
      url: '/pages/order/order?hospitalId=' + hospitalId + '',
    })
  },
  clear: function () {
    wx.removeStorageSync('historySearch');
    this.setData({
      confirm: false,
      qingkong: true,
      historySearch: []
    })
  },
  // 去除重复关键字搜索
  unique: function (arg) {
    // 创建一个新的临时数组，用于保存输出结果
    var n = [];
    // 遍历当前数组
    for (var i = 0; i < arg.length; i++) {
      // 如果当前数组的第i个元素已经保存进了临时数组，那么跳过，否则把当前项push到临时数组里面
      if (n.indexOf(arg[i]) == -1) n.push(arg[i]);
    }
    return n;
  },
  searchHospital_docotr: function (e) {
    var historySearch = wx.getStorageSync('historySearch') || [];
    historySearch.unshift(e.detail.value);
    historySearch = this.unique(historySearch);
    wx.setStorageSync('historySearch', historySearch);
    this.setData({
      inputValue: e.detail.value,
      confirm: true,
    })
    this.searchGhHospitaByKeyWord();
    this.searchGhdoctorByKeyWord();
  },
  searchGhHospitaByKeyWord: function () {
    let that = this;
    let userId=wx.getStorageSync('userId');
    let keyWord = this.data.inputValue
    let dt = {
      function: 'searchGhHospitaByKeyWord',
      keyWord: keyWord,
      offset: '0',
      limit: '3',
      userId: userId,
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
          that.setData({
            hospitalList: res.data.data.length > 0 ? res.data.data : '',
            loading:true
          })
        } else {
          util.wxshowModal(res.data.message, false);
        }
      },
      error: function () {
        util.wxshowModal('发生异常', false);
      }

    })
  },
  searchGhdoctorByKeyWord: function () {
    let that = this;
    let userId = wx.getStorageSync('userId');
    let keyWord = this.data.inputValue
    let dt = {
      function: 'searchGhdoctorByKeyWord',
      keyWord: keyWord,
      offset: '0',
      limit: '3',
      userId: userId,
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
          that.setData({
            doctorList: res.data.data.length > 0 ? res.data.data : '',
            loading: true
          })
        } else {
          util.wxshowModal(res.data.message, false);
        }
      }, error: function () {
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

    // 用户点击右上角分享
    return {
      title: title, // 分享标题
      desc: desc, // 分享描述
      path: path // 分享路径
    }
  }
})