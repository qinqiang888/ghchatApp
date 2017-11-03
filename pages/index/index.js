const app = getApp();
const ajaxUrls = app.globalData.requestUrl;
const sid = app.globalData.sid;
const source = app.globalData.source;
const version = app.globalData.version;
const newversion = app.globalData.newversion;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city_hospital: '',
    clickCity: false,
    clickHospital: false,
    hidden: true,
    selectCity: '北京 ',
    provinceCode: '',
    selectHospital: '全部医院',
    click: 'city',
    hospitalList: [],
    pageNo: '1',
    pageTypeId: '0',
    pageType:'1',
    cityCode: '131',
    userId: '',
    scrollTop:'0',
    position:'relative',
    top:'',
    city: '北京,上海,浙江,江苏,四川,湖南,陕西,湖北,天津,山东',
    jumpUrl: {
      home: "../../pages/home/home",  //个人中心
      index: "../../pages/index/index", //预约挂号
      search: "../../pages/search/search"//搜索页面
    },
    morenpic: 'http://m.yihu365.com/images/xiaocxu/hospimg.jpg',
    loading: false,
    load: '加载中'
  },

  getScrollOffset: function () {
    var that=this;
    wx.createSelectorQuery().select('#body').boundingClientRect(function (res) {
      that.setData({
        scrollTop: res.top,
        top :res.top<-137?0:'',// 节点的竖直滚动位置
        position: res.top<-137?'fixed':'relative'
      })
    }).exec()
  },
  click_zhezhao:function(){
    this.setData({
      hidden:true
    })
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
  bindscroll:function(e){
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.clearBoth();
    // this.getScrollOffset();
    this.getGhHospitalRankList('0');
    this.getLocation();
    this.setData({
      loading: true,
      userId: wx.getStorageSync('userId'),
    });
    // this.getGhHospitalType();
  },
  

  clickCity: function (e) {
    let pageType = e.target.dataset.type;
    console.log(pageType)
    let cityCode = e.target.dataset.code;
    this.setData({
      hidden: true,
      selectCity: e.target.dataset.val,
      pageNo: '1',
      cityCode: cityCode,
      pageTypeId: '0',
      pageType:pageType
    })
    this.getGhHospitalRankList(pageType);
  },
  clickHospital: function (e) {
    let pageType = e.target.dataset.type;
    let pageTypeId = e.target.dataset.code;
    this.setData({
      hidden: true,
      pageNo: '1',
      selectHospital: e.target.dataset.val,
      pageTypeId: pageTypeId
    })
    this.getGhHospitalRankList('2');
  },
  getGhHospitalType: function (e) {
    let that = this;
    let userId = wx.getStorageSync('userId');
    let cityCode = this.data.cityCode;
    // let pageType=e.target.dataset.type;
    // let cityCode=e.target.dataset.code;
    let dt = {
      function: 'getGhHospitalType',
      role_code: '003',
      pageType: '0',
      userId: userId,
      cityCode: cityCode

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
            city_hospital: res.data.data,
            hidden: false,
            click: e.currentTarget.id == 1 ? 'city' : 'hospital'
          })
        }
      }

    })
  },
  getGhHospitalRankList: function (pageType) {
    let userId = wx.getStorageSync('userId');
    let that = this;
    let dt = {
      function: 'getGhHospitalRankList',
      provinceCode: that.data.cityCode,
      cityCode: that.data.pageType == '0' ? '' : that.data.cityCode,
      pageNo: that.data.pageNo,
      pageSize: '10',
      pageType: pageType,
      userId: userId,
      pageTypeId: that.data.pageTypeId,
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
          let oldHospitalList = that.data.hospitalList;
          that.setData({
            hospitalList: that.data.pageNo == 1 ? res.data.data : oldHospitalList.concat(res.data.data),
            loading: true,
            load: res.data.data.length > 0 ? '加载中' : '没有更多数据',
          })
        }
      }

    })
  },
  depart: function (e) {
    var hospitalId = e.currentTarget.dataset.hospitalid;
    var cityCode = e.currentTarget.dataset.code;
    var hospitalPic = e.currentTarget.dataset.pic;
    var userId = wx.getStorageSync('userId');
    var hospitalName = e.currentTarget.dataset.hospitalname;
    wx.setStorageSync('select_cityCode', cityCode);
    wx.setStorageSync('hospitalId', hospitalId);
    wx.setStorageSync('hospitalImg', hospitalPic);
    wx.setStorageSync('hospitalName', hospitalName);
    var jumpurl = userId ? '/pages/depart/depart?hospitalId=' + hospitalId + '' : '/pages/login/login'
    wx.navigateTo({
      url: jumpurl,
    })
  },
  search: function () {
    var userId = wx.getStorageSync('userId')
    var jumpurl = userId ? '/pages/search/search' : '/pages/login/login'
    wx.navigateTo({
      url: jumpurl,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onPageScroll:function(){
    this.getScrollOffset();
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
    let pageNo = this.data.pageNo;
    let pageNewNo = parseInt(pageNo) + 1;
    this.setData({
      pageNo: pageNewNo.toString(),
      loading: false
    })
    this.getGhHospitalRankList('0');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})