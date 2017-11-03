var util = require('../../utils/util.js');
var app = getApp(),
  userid = wx.getStorageSync('userId'),
  url = app.globalData.requestUrl,
  sid = app.globalData.sid,
  newversion = app.globalData.newversion,
  version = app.globalData.version,
  source = app.globalData.source,

  _serviceCode = '',
  _getAccess = '',
  flag = false,
  _couponId = '',
  _price = '',
  _roleCode = '001';
  //orderId
var getServiceCode = wx.getStorageSync('serviceCode');
if (getServiceCode) {
  _serviceCode = getServiceCode;
} else {
  _serviceCode = '';
}
Page({
  data: {
    orderId:'',
    copitem: '',
    price: ''
  },
  //选择代金卷
  choice: function (e) {
    var _this = this;
    flag = true;
    console.log(e)
    var _id = e.currentTarget.dataset.voucherid, _price;
    if(_id==_this.data.couponId){
      _price='';
      _id = '';
    }else{
      _price = e.currentTarget.dataset.price;
      console.log('id=' +_id)
    }
    _this.setData({
        couponId: _id,
        price: _price
      })
    
  },
  //点击确定按钮
  sure: function () {
    var _this = this;
    //存储代金卷id和价格
    //如果为真表示已经选择了代金卷
    if (flag == true) {
      _couponId = _this.data.couponId;
      _price = _this.data.price
    } else {
      _couponId = "",
        _price = ""
    }
    wx.redirectTo({
      url: '/pages/pay/pay?orderId='+_this.data.orderId
    })
    console.log('_couponId'+_couponId+'_price='+_price);
    wx.setStorageSync('voucherid', _couponId);
    wx.setStorageSync('voucherprice', _price);
  },
  //进来加载代金卷
  conpon: function () {
    var that = this;
    var userid = this.data.userid;
    var swx_session=wx.getStorageSync("wx_session")
    var dt = {
      'function': 'myVoucher',
      'userId': userid,
      'login_userId_base':userid,
      'minRow': '1',
      'maxRow': '100',
      'getAccess': _getAccess,
      'isEnable': '0',
      'serviceCode':_serviceCode,
      // 'roleCode':_roleCode,
      'serviceType': '',
      "sid": sid,
      "version": version,
      "newversion": newversion,
      "source": source,
      "swx_session":swx_session
    }
    wx.request({
      url: url,
      data: { "encryption": false, "data": JSON.stringify(dt) },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function (res) {
        console.log(res);
        console.log('res.data' + res.data);
        if (res.data.code == "0000") {
          that.setData({
            copitem: res.data.data.list
          });
        }else if(res.data.code=="0502"){
            //util.wxshowModal(res.data.message,false)
            wx.redirectTo({
              url: '/pages/login/login',
            })
        }else{
            util.wxshowModal(res.data.message,false)
        }
      }
    })
  },
  onLoad: function (options) {
    var _this = this;
    //更新数据
    _this.setData({
      orderId: options.orderId,
      userid : wx.getStorageSync('userId')
    })
    _this.conpon();
  }
})