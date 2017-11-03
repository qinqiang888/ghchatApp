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
    List:[],
    type:'',
    offset:0,
    keyWord:'',
    load:'加载中',
    loading:false,
    hospitalPic:'http://m.yihu365.com/images/xiaocxu/hospimg.jpg',
    doctorPic:'http://m.yihu365.com/58/images/undef.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var keyWord = options.keyWord;
    var type = options.type;
    this.setData({
      keyWord:keyWord,
      type: type
    })
    this.setTitle(type)
    this.searchGhHospitaByKeyWord();
  },
  setTitle:function(types){
    var title='全部医院';
    if(types=='hospital'){
      title='全部医院';
    }else{
      title='全部医生';
    }
    wx.setNavigationBarTitle({
      title: title
    })
  },

  depart: function (e) {
    var hospitalId = e.currentTarget.dataset.hospitalid;
    var cityCode = e.currentTarget.dataset.code;
    var hospitalPic = e.currentTarget.dataset.pic;
    var hospitalName = e.currentTarget.dataset.hospitalname;
    wx.setStorageSync('select_cityCode', cityCode);
    wx.setStorageSync('hospitalId', hospitalId);
    wx.setStorageSync('hospitalPic', hospitalPic);
    wx.setStorageSync('hospitalName', hospitalName);
    wx.navigateTo({
      url: '/pages/depart/depart?hospitalId=' + hospitalId + '',
    })
  },
  order: function (e) {
    var hospitalId = e.currentTarget.dataset.hospitalid;
    var cityCode = e.currentTarget.dataset.code;
    var hospitalPic = e.currentTarget.dataset.pic;
    var hospitalName = e.currentTarget.dataset.hospitalname;
    wx.setStorageSync('select_cityCode', cityCode);
    wx.setStorageSync('hospitalId', hospitalId);
    wx.setStorageSync('hospitalPic', hospitalPic);
    wx.setStorageSync('hospitalName', hospitalName);
    wx.navigateTo({
      url: '/pages/depart/depart?hospitalId=' + hospitalId + '',
    })
  },
  order: function (e) {
    console.log(e)
    var hospitalId = e.currentTarget.dataset.hospitalid;
    var cityCode = e.currentTarget.dataset.code;
    var hospitalPic = e.currentTarget.dataset.pic;
    var doctor = e.currentTarget.dataset.doctor;
    var doctorid = e.currentTarget.dataset.doctorid;
    var hospitalName = e.currentTarget.dataset.hospitalname;
    var firDepartmentId = e.currentTarget.dataset.departid;
    var subDepartmentId = e.currentTarget.dataset.subdepartid;

    wx.setStorageSync('select_cityCode', cityCode);
    wx.setStorageSync('hospitalId', hospitalId);
    wx.setStorageSync('doctor', doctor);
    wx.setStorageSync('doctorid', doctorid);
    wx.setStorageSync('hospitalPic', hospitalPic);
    wx.setStorageSync('hospitalName', hospitalName);
    wx.setStorageSync('firDepartmentId', firDepartmentId);
    wx.setStorageSync('subDepartmentId', subDepartmentId);
    wx.navigateTo({
      url: '/pages/order/order?hospitalId=' + hospitalId + '',
    })
  },

  //关键字搜索医院
  searchGhHospitaByKeyWord: function () {
    let that = this;
    let keyWord = this.data.keyWord;
    let userId=wx.getStorageSync('userId');
    var func=this.data.type == 'hospital' ? 'searchGhHospitaByKeyWord' : 'searchGhdoctorByKeyWord';
    let dt = {
      function: func,
      keyWord: keyWord,
      offset: that.data.offset,
      limit: '10',
      userId: userId
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
          var List=that.data.List
          that.setData({
            List: that.data.offset == 0 ? res.data.data : List.concat(res.data.data),
            load:res.data.data.length>0?'加载中':'没有更多数据',
            loading:true
          })
          wx.stopPullDownRefresh();
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
    var that=this;
    setTimeout(function(){
          that.setData({
            offset: '0'
          })
        that.searchGhHospitaByKeyWord()

    },2000)
 
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var  offset = Math.ceil(this.data.offset)/10;
    var pageNewNo = (offset + 1)*10;
    this.setData({
      offset: pageNewNo,
      loading:false
    })
    this.searchGhHospitaByKeyWord();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})