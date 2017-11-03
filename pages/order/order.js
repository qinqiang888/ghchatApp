// order.js
var app = getApp();
var globalData = app.globalData;
var sid = globalData.sid;
var ajaxUrls = globalData.ajaxUrls;
var version = globalData.version;
var newversion = globalData.newversion;
var title = globalData.title;
var desc = globalData.desc;
var path = globalData.path;
var submitBlen = true;
Page({
  /**
   * 页面的初始数据
   */
  data: {

    dialogBlen: true,//是否错误弹框，true为隐藏弹框

    dialogMsg: '',//错误弹框msg

    hospitalName: '',//医院名称

    hospitalImg: '',//医院图片

    secondDepartment: '',//二级科室名称

    roleType: '002',//服务类型

    serviceStart: '',//开始时间列表{{array}}

    serviceStartIndex: '',//开始时间 下标

    serviceEnd: '',//结束时间列表{{array}}

    serviceEndIndex: '',//结束时间 下标

    doctor: '',//医生名字

    patientObj: '',//患者信息

    diseaseName: '',//疾病名称

    details: '',//病情描述

    addPrice: '22'//初高级挂号陪诊费
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //默认服务类型
    if (!wx.getStorageSync('roleType')) {
      wx.setStorageSync('roleType', '002');
    }

    //初高级陪诊
    if (!wx.getStorageSync('addPrice')) {
      wx.setStorageSync('addPrice', '22');
    }

    //描述
    var detailMes = wx.getStorageSync('details');
    var valBlen = that.detailsMach(detailMes);

    this.setData({
      hospitalName: wx.getStorageSync('hospitalName'),//医院名称

      hospitalImg: wx.getStorageSync('hospitalImg'),//医院图片

      secondDepartment: wx.getStorageSync('secondDepartmentName'),//二级科室名称

      roleType: wx.getStorageSync('roleType'),

      //开始时间列表{{array}}
      serviceStart: that.getStartDate(),
      serviceStartIndex: wx.getStorageSync('startTimeIndex') ? wx.getStorageSync('startTimeIndex') : '',

      //结束时间列表{{array}}
      serviceEnd: wx.getStorageSync('endDateArray'),
      serviceEndIndex: wx.getStorageSync('endTimeIndex') ? wx.getStorageSync('endTimeIndex') : '',

      doctor: wx.getStorageSync('doctorName'),

      patientObj: wx.getStorageSync('objUserInfo'),//患者信息

      diseaseName: wx.getStorageSync('diseaseName'),//疾病名称
      hasDisease: false,//该科室是否有疾病

      details: wx.getStorageSync('details'),//病情描述
      detailsBlen: valBlen,

      addPrice: wx.getStorageSync('addPrice'),//初高级陪诊
    });

    //科室是否有疾病
    that.diseaseList();
    //服务费
    if (!wx.getStorageSync('servicePrice')){
      that.getServicePrice();
    }

  },


  /**
   * 服务类型tap
   */
  roleTypeEvent: function (e) {
    var typeName = e.target.dataset.type;
    wx.setStorageSync('roleType', typeName);
    this.getServicePrice();
    this.setData({
      roleType: typeName
    });
  },

  //判断闰年
  isLeapYear: function (Year) {
    if (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0)) {
      return true;
    } else {
      return false;
    }
  },

  //服务时间--开始时间
  getStartDate: function () {
    var that = this;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate() - 1;
    var week = date.getDay() - 1;
    var days, weeks, data = [], data1 = [];
    switch (month) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        days = 31;
        break;
      case 4:
      case 6:
      case 9:
      case 11:
        days = 30;
        break;
      default:
        days = that.isLeapYear(year) ? 29 : 28;
        break;
    }

    for (var i = 0; i < 30; i++) {
      day++;
      week++;
      if (day > days) {
        month++;
        if (month > 12) {
          year++;
          month = 1;
        }
        day = 1;
      }
      if (week >= 7) {
        week = 0;
      }
      switch (week) {
        case 0:
          weeks = "周日";
          break;
        case 1:
          weeks = "周一";
          break;
        case 2:
          weeks = "周二";
          break;
        case 3:
          weeks = "周三";
          break;
        case 4:
          weeks = "周四";
          break;
        case 5:
          weeks = "周五";
          break;
        case 6:
          weeks = "周六";
          break;
      }
      var stringArray = year + '-' + (month < 10 ? ('0' + month) : month) + '-' + (day < 10 ? ('0' + day) : day);
      var stringArray1 = month + '月' + day + '日' + '(' + weeks + ')';
      data.push(stringArray);
      data1.push(stringArray1);
    }
    wx.setStorageSync('startDateArrayUp', data);
    wx.setStorageSync('startDateArray', data1);
    return data1;
  },
  //滑动开始时间
  bindPickerChangeStart: function (e) {
    var that = this;
    if (e.detail.value == that.data.serviceStartIndex) {
      return;
    }
    var array = wx.getStorageSync('startDateArrayUp');
    var etimes = array[e.detail.value] + ' ' + '08:00:00';
    wx.setStorageSync('startTimeIndex', e.detail.value);//开始时间存储
    wx.setStorageSync('stime', etimes);
    this.setData({
      serviceStartIndex: e.detail.value,
      serviceEndIndex: ''
    });
    //判读开始时间大于选择的结束时间
    /*var endTime = this.data.endTimeIndex;
    if (endTime && e.detail.value>endTime){
      that.setData({
        serviceEndIndex: 0
      });
    }*/
    //结束时间
    that.getEndDate();
  },

  //服务时间--结束时间
  getEndDate: function () {
    var start = this.data.serviceStartIndex;
    var array = wx.getStorageSync('startDateArrayUp');
    var array1 = wx.getStorageSync('startDateArray');
    var endArray = array.slice(start);
    var endArray1 = array1.slice(start);
    wx.setStorageSync('endDateArrayUp', endArray);
    wx.setStorageSync('endDateArray', endArray1);
    this.setData({
      serviceEnd: endArray1
    });
  },

  //结束时间slide
  bindPickerChangeEnd: function (e) {
    var that = this;
    if (e.detail.value == that.data.serviceEndIndex) {
      return;
    }
    var array = wx.getStorageSync('endDateArrayUp');
    var etimes = array[e.detail.value] + ' ' + '18:00:00';
    wx.setStorageSync('endTimeIndex', e.detail.value);//开始时间存储
    wx.setStorageSync('etime', etimes);
    this.setData({
      serviceEndIndex: e.detail.value
    });
  },

  //未选择开始时间
  startTimeNo: function () {
    this.setData({
      dialogBlen: false,
      dialogMsg: '请选择开始时间'
    });
  },

  //初高级陪诊
  radioEvent: function (e) {
    var val = e.detail.value;
    wx.setStorageSync('addPrice', val);
  },

  //病情描述
  detailChange: function (e) {
    var that = this;
    var val = e.detail.value;

    wx.setStorageSync('details', val);
    var valBlen = that.detailsMach(val);
    that.setData({
      detailsBlen: valBlen
    });
  },

  //病情描述判断
  detailsMach: function (val) {
    /*if (val && (val.length >= 5)) {
      return true;
    } else {
      return false;
    }*/
    if (val) {
      return true;
    } else {
      return false;
    }
  },

  //判断是否当前科室有 疾病
  diseaseList: function () {
    var that = this, hasDisease = false;
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
          if (res.data.length != 0) {
            hasDisease = true;
          } else {
            hasDisease = false;
          }
        } else {
          hasDisease = false;
        }
        that.setData({
          hasDisease: hasDisease
        });
      }
    });
  },

  /**
   * 获取服务费
   */
  getServicePrice:function(){
    var dt = {
      'function': 'getGhServiceFee',
      "hospitalId": wx.getStorageSync("hospitalId").toString(),
      "departId": wx.getStorageSync("firDepartmentId"),
      "subDepartId": wx.getStorageSync("subDepartmentId"),
      "doctorId": wx.getStorageSync("doctorId"),
      "doctorName": wx.getStorageSync("doctorName"),
      "regType": wx.getStorageSync("roleType"),
      'version': version,
      'newversion': newversion,
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
        } else {
          
        }
      }
    });
  },

  /**
   * 立即预约
   */
  orderSubmit: function () {
    var that = this;

    if (!submitBlen){
      return;
    }

    submitBlen = false;

    var val = wx.getStorageSync('details');
    if (val.length<5){
      that.setData({
        dialogBlen: false,
        dialogMsg: '描述不能少于5个字',
      });
      submitBlen = true;
      return;
    }

    var userid = wx.getStorageSync('userId');
    //var userid = '13172';
    var roleCode = '003';

    var serviceCode = '001';

    var longitude = wx.getStorageSync("longitude");
    var latitude = wx.getStorageSync("latitude");
    var select_cityCode = wx.getStorageSync("select_cityCode");

    var hospitalId = wx.getStorageSync("hospitalId").toString();
    //var hospitalLongitude = wx.getStorageSync("hospitallng");
    //var hospitalLatitude = wx.getStorageSync("hospitallat");
    var depart1 = wx.getStorageSync("firDepartmentId");
    var depart2 = wx.getStorageSync("subDepartmentId");

    var professionCode = wx.getStorageSync("roleType");

    var stime = wx.getStorageSync('stime');
    var etime = wx.getStorageSync('etime');

    var doctorId = wx.getStorageSync("doctorId");
    var doctorName = wx.getStorageSync("doctorName");

    var patentID = wx.getStorageSync("patientId").toString();

    var price = wx.getStorageSync("servicePrice");
    var offerPrice;
    if (price.indexOf('-') > -1) {
      offerPrice = '0';
    }

    var diseaseId = wx.getStorageSync("diseaseId");//疾病名称
    
    var isChangeDate = '1';

    var phoneNumber = wx.getStorageSync("userMobile");


    var addservice = wx.getStorageSync('addPrice') + '_0';//初级&&高级陪诊

    var message = wx.getStorageSync('details');
    var registerName = wx.getStorageSync('objUserInfo').name;
    var registerCard = wx.getStorageSync('objUserInfo').card;


    var dt = {
      'function': 'subscribe',
      'userid': userid,//用户ID
      'targetUserId': '',//目标用户ID
      'roleType': roleCode,//订单角色类型
      'service': serviceCode,//服务编号
      'orderType': '1',//预约类型
      'price': price,//价格
      'offerPrice': offerPrice,
      'hospitalFlag': 1,
      'times': '0',
      'longitude': longitude,//经度
      'latitude': latitude,//纬度
      'serviceTimeStart': stime,//预约服务开始时间
      'serviceTimeEnd': etime,//预约服务结束时间
      'payStatus': '-1',//付款状态
      'checkStatus': '0',//是否在医院就诊过
      'patientArchivesId': patentID,//患者档案ID
      'cityCode': select_cityCode,//城市代码
      'professionCode': professionCode,//职称代码
      'doctorId': doctorId,//医生Id
      'disease': diseaseId,//疾病Id
      'hospitalId': hospitalId,//医院ID
      //'hospitalLongitude': hospitalLongitude,//医院所在经度
      //'hospitalLatitude': hospitalLatitude,//医院所在维度
      'depart1': depart1,
      'depart2': depart2,
      'doctorName': doctorName,//挂号医生姓名
      "isChangeDate": isChangeDate,

      'registrationMobile': phoneNumber,//挂号人手机号
      'registrationName': registerName,
      'registrationIdCard': registerCard,
      'targetCityCode': '',//预约问诊城市代码
      'addedService': addservice,
      'description': message,
      
      '_from': 'h5',
      'version': version,
      'newversion': newversion,
      'login_userId_base': userid,
      'sid': sid
    };

    wx.request({
      url: ajaxUrls,
      data: { "data": JSON.stringify(dt) },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function (result) {
        var res = result.data;
        if (res.code == "0000") {
          submitBlen = true;
          //清除缓存
          wx.removeStorageSync("hospitalId");
          
          wx.removeStorageSync("firDepartmentId");
          wx.removeStorageSync("subDepartmentId");
          wx.removeStorageSync('subdepartindex'); 
          wx.removeStorageSync("hospitalImg");
          wx.removeStorageSync("hospitalName");
          

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

          wx.redirectTo({
            url: '/pages/orderDetail/orderDetail?orderId='+res.data.orderId
          });
        } else if (res.code == '0502') {
          wx.redirectTo({
            url: '/pages/login/login'
          });
          submitBlen = true;
        } else {
          submitBlen = true;
          that.setData({
            dialogBlen: false,
            dialogMsg: res.message,
            submitBlen: false,
            contentTextBlen: false
          });
        }
      }
    });
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