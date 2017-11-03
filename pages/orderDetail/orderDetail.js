var app = getApp();
var globalData = app.globalData;
var sid = globalData.sid;
var ajaxUrls = globalData.ajaxUrls;
var version = globalData.version;
var newversion = globalData.newversion;
var title = globalData.title;
var desc = globalData.desc;
var path = globalData.path;
var stopTime,
    detailTime = globalData.detailTime,//3s后台校验时间执行倒计时 obj
    detailTime1 = globalData.detailTime1,
    secondTime = globalData.secondTime;

Page({
  data: {
    dialogBlen: true,//错误弹框

    otherStatus: '',//倒计时为0，或者点击取消按钮。

    dataList: '',//详情obj
    /*detailTime: null,//3s后台校验时间执行倒计时 obj
    detailTime1:null,
    secondTime: null,//每秒一次倒计时 obj*/
    timeTotal: 1800,//30分钟倒计时
    payTimeOut: true,//显示倒计时
    payTime: 1800,//倒计时剩余时间
    creatTime: '',
    serviceTel: '',//医护助理电话
    creatTime: '',//创建时间

    cancleModal: true,//取消预约弹框
    cancelResult: '001',//取消预约原因
    radioBlen: true,

    drawbackModal: true,//退款弹框
    drawbackResult: '001',//退款原因
    drawbackModalFirst: true,//申请退款第一个弹框
    drawbackInfo: false,//退款说明弹框

    otherResultCon: '',//退款&&取消其他原因

    doorSureBlen: true,//确认服务弹框

    telNurseBlen: true,//就医助理弹框

    fixedModal: false,//错误弹框
    serviceTimeModal: false//查看时间弹框
  },
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      dialogBlen: true,//错误弹框

      otherStatus: '',//倒计时为0，或者点击取消按钮。

      dataList: '',//详情obj
      /*detailTime: null,//3s后台校验时间执行倒计时 obj
      detailTime1:null,
      secondTime: null,//每秒一次倒计时 obj*/
      timeTotal: 1800,//30分钟倒计时
      payTimeOut: true,//显示倒计时
      payTime: 1800,//倒计时剩余时间
      creatTime: '',
      serviceTel: '',//医护助理电话
      creatTime: '',//创建时间

      cancleModal: true,//取消预约弹框
      cancelResult: '001',//取消预约原因
      radioBlen: true,

      drawbackModal: true,//退款弹框
      drawbackResult: '001',//退款原因
      drawbackModalFirst: true,//申请退款第一个弹框
      drawbackInfo: false,//退款说明弹框

      otherResultCon: '',//退款&&取消其他原因

      doorSureBlen: true,//确认服务弹框

      telNurseBlen: true,//就医助理弹框

      fixedModal: false,//错误弹框
      serviceTimeModal: false,//查看时间弹框
    });
    if (detailTime) {
      clearInterval(detailTime);
      clearInterval(detailTime1);
      clearInterval(secondTime);
    }
    this.detailList();
  },
  //下拉刷新
  onPullDownRefresh: function () {
    if (stopTime) {
      clearTimeout(stopTime);
    }
    this.detailList();
  },
  //订单详情
  detailList: function () {
    var that = this;
    var orderId = that.data.orderId;
    var userId = wx.getStorageSync('userId');
    //var orderId = '31394';
    var swx_session = wx.getStorageSync("wx_session");
    //var userId = '13172';//修改

    var dt = {
      "function": "selectSubscribeOrder",
      "orderId": orderId,
      'userid': userId,
      "standardFlag": "0",
      'login_userId_base': userId,
      //'_validate':'1',
      '_from': 'h5',
      "sid": sid,
      'version': version,
      'newversion': newversion,
      "swx_session": swx_session
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
          //res.data.orderStatus = '0';//修改
          var tel;
          if (res.data.serverUserMobile) {
            tel = res.data.serverUserMobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
            console.log("tel" + tel)
          }

          if (detailTime) {
            clearInterval(detailTime);
            clearInterval(detailTime1);
            clearInterval(secondTime);
          }
          //调用倒计时
          if (res.data.orderStatus == '0') {
            that.showTime(res.data.CREATE_TIME,0);
            clearInterval(detailTime1);
            detailTime = setInterval(function () {
              clearInterval(secondTime);
              that.showTime(res.data.CREATE_TIME,0);
            }, 30000);
          }
          if (res.data.orderStatus == '4' && res.data.payStatus == '-1') {
            that.setData({
              timeTotal: 2400,//40分钟倒计时
            });
            clearInterval(detailTime);
            that.showTime(res.data.scrambleDate,1);
            detailTime1 = setInterval(function () {
              clearInterval(secondTime);
              
              that.showTime(res.data.scrambleDate,1);
            }, 30000);
          }

          //重要提示
          var tips = res.data.ghHospitalRegFlow.split('\n');
          //订单金额
          var onlyPrice = parseInt(res.data.only_price);

          //修改时间
          var serviceStart,
            serviceEnd,
            serviceStart1,
            serviceEnd1;

          serviceStart = that.dateFormate(res.data.serviceTimeStart, 1);
          serviceEnd = that.dateFormate(res.data.serviceTimeEnd, 1);
          if (res.data.serviceTimeStart1) {
            serviceStart1 = that.dateFormate(res.data.serviceTimeStart1, 1);
            serviceEnd1 = that.dateFormate(res.data.serviceTimeEnd1, 1);
          }

          //待服务状态 过了服务时间0点 不能申请退款
          /*var sureDate,
              currentDate,
              sqtkBlen = true;
          if (res.data.ghDate){
            sureDate = res.data.ghDate.split(' ')[0];
            sureDate = sureDate.replace(/(\d{4})[\u4e00-\u9fa5](\d+)[\u4e00-\u9fa5](\d+)[\u4e00-\u9fa5]/g, '$1-$2-$3');
            currentDate = new Date().getTime();
            sureDate = new Date(sureDate+' 00:00:00').getTime();
            if (currentDate > sureDate){
              sqtkBlen = false;
            }
          }*/

          that.setData({
            dataList: res.data,

            serviceTel: tel,

            tips: tips,

            onlyPrice: onlyPrice,

            serviceStart: serviceStart,
            serviceEnd: serviceEnd,
            serviceStart1: serviceStart1,
            serviceEnd1: serviceEnd1,
            creatTime: res.data.CREATE_TIME.split(' ')[0]

            //sqtkBlen: sqtkBlen
          });

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
    });
  },

  //待付款倒计时
  formateTime: function (time) {
    var minute = parseInt(time / 60);
    var lateSecond = time % 60;
    minute = minute < 10 ? ("0" + minute) : minute;
    lateSecond = lateSecond < 10 ? ("0" + lateSecond) : lateSecond;
    return minute + ':' + lateSecond;
  },
  showTime: function (CREATE_TIME,typeName) {
    var that = this;
    var thisCreatTime = new Date(CREATE_TIME.replace(/-/g, '/')).getTime() / 1000;
    var currentTime = new Date().getTime() / 1000;
    var subTime = Math.floor(currentTime) - Math.floor(thisCreatTime);

    var countTimes = this.data.timeTotal - subTime;
    if (countTimes <= 0) {
      that.setData({
        payTimeOut: false
      });
      that.overdue();
      return;
    }
    that.setData({
      payTime: that.formateTime(countTimes)
    });
    that.countDown(countTimes, typeName);
  },
  /*showTime: function (CREATE_TIME) {
    var that = this;
    if (!that.data.payTimeOut){
      return;
    }
    var userId = wx.getStorageSync("userId");
    var orderId = that.data.orderId;
    //var orderId = '31394';
    //var userId = '13172';
    var dt = {
      'function': 'queryOfferPriceNum',
      orderId: orderId,
      userId: userId,
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
          var thisCreatTime = new Date(CREATE_TIME.replace(/-/g, '/')).getTime() / 1000;
          var currentTime = new Date(res.curTime.replace(/-/g, '/')).getTime() / 1000;
          var subTime = Math.floor(currentTime) - Math.floor(thisCreatTime);

          var countTimes = that.data.timeTotal - subTime;
          if (countTimes <= 0) {
            that.setData({
              payTimeOut: false
            });
            //that.overdue();
            return;
          }
          that.setData({
            payTime: that.formateTime(countTimes)
          });
          that.countDown(countTimes);
        }
      }
    });
  },*/
  overdue: function () {
    var list = this.data.dataList;
    list.orderStatus = '-1';

    this.setData({
      dataList: list
    });
  },
  countDown: function (timeNum, typeName) {
    var that = this;
    var syTime = timeNum;
    secondTime = setInterval(function () {
      syTime--;
      if (syTime <= 0) {
        if (typeName==0){
          clearInterval(detailTime);
        }else{
          clearInterval(detailTime1);
        }
        clearInterval(secondTime);
        that.overdue();
        that.setData({
          payTimeOut: false
        });
      } else {
        that.setData({
          payTime: that.formateTime(syTime)
        });
      }
    }, 1000);
  },

  dateFormate: function (date, typeName) {
    var firstDate = date.split(" ")[0],
      dateNew = date.split(" ")[0];
    var newDate = '', week = '';
    firstDate = firstDate.split("-");
    if (typeName == 0) {
      newDate += firstDate[0] + '年';
    } else {
      dateNew = new Date(dateNew.replace(/-/g, '/'));
      var weeks = dateNew.getDay();
      week += '(';
      switch (weeks) {
        case 0:
          week += '周日';
          break;
        case 1:
          week += '周一';
          break;
        case 2:
          week += '周二';
          break;
        case 3:
          week += '周三';
          break;
        case 4:
          week += '周四';
          break;
        case 5:
          week += '周五';
          break;
        default:
          week += '周六';
          break;
      }
      week += ')';
    }
    newDate += firstDate[1] + '月' + firstDate[2] + '日' + week;
    return newDate;
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


  //取消预约接口
  cancelEvent: function () {
    var that = this;
    var orderId = that.data.orderId;
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

    //var userId ='13172';//修改
    //var orderId= '31394';

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
      //'source': source,
      '_from': 'h5',
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
  cancleOrderPay: function () {
    var that = this;
    this.setData({
      cancleModal: false,
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

  //点击第一次弹框说明退款弹框确定按钮
  detailDrawbackChangeFirst: function () {
    this.setData({
      drawbackModal: false,
      drawbackModalFirst: true
    })
  },

  //点击申请退款按钮
  drawbackEvent: function () {
    var that = this;
    var orderId = that.data.orderId;
    var userId = wx.getStorageSync('userId');
    //var userId = '13172';//修改
    //var orderId = '31394';

    var dt = {
      'function': 'applyRefundPopup',
      'order_id': orderId,
      'user_id': userId,
      'type': '0',
      'version': version,
      'newversion': newversion,
      //'source': source,
      '_from': 'h5',
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
            drawbackModalFirst: false,
            drawbackModalFirstInfo: res.data,
            //fixedModal:true,
            //fiexedCon:'申请退款，操作成功'
          });
          /*var timer = setTimeout(function () {
            that.setData({
              fixedModal: false
            });
            clearTimeout(timer);
          }, 3000);*/
        } else {
          that.setData({
            dialogBlen: false,
            drawbackModalFirst: true,
            dialogMsg: res.message
          });
        }
      }
    });

    /*this.setData({
      //drawbackModal: false
      drawbackModalFirst:false
    })*/
  },

  //查看退款规则
  lookInfo: function () {
    this.setData({
      drawbackInfo: true
    });
    wx.setNavigationBarTitle({
      title: '退款说明'
    })
  },

  //关闭退款说明
  closeDrawbackInfo: function () {
    this.setData({
      drawbackInfo: false
    });
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
  },

  //申请退款确定
  detailDrawbackChange: function () {
    var that = this;
    var orderId = that.data.orderId;
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

    //var userId = '13172';//修改
    //var orderId = '31394';

    var dt = {
      'function': 'applyRefundNew',
      'order_id': orderId,
      'user_id': userId,
      'cancelreasonId': reasonId,
      'cancelReasonContent': otherCon,
      '_from': 'h5',
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
          that.setData({
            drawbackModal: true,
            otherResultCon: '',
            cancelResult: '001',
            fixedModal: true,
            fiexedCon: '申请退款，操作成功'
          });
          var timer = setTimeout(function () {
            that.setData({
              fixedModal: false
            });
            that.detailList();
            clearTimeout(timer);
          }, 3000);
        } else if (res.code == '0502') {
          wx.redirectTo({
            url: '/pages/login/login'
          });
        } else {
          that.setData({
            dialogBlen: false,
            drawbackModal: true,
            otherResultCon: '',
            cancelResult: '001',
            dialogMsg: res.message
          });
        }
      }
    });
  },

  //去支付
  goToPay: function () {
    var price = this.data.dataList.only_price;
    var orderId = this.data.dataList.orderId;
    wx.setStorageSync('price', price);
    wx.redirectTo({
      url: '/pages/pay/pay?orderId=' + orderId
    });
  },

  //客服专线
  telLine: function () {
    wx.makePhoneCall({
      phoneNumber: '4000-122-789',
      success: function (res) {
        // success
      }
    });
  },


  telNurse: function () {
    this.setData({
      telNurseBlen: false
    });
  },

  //拨打护士电话
  telNurseEvent: function () {
    var tel = this.data.dataList.serverUserMobile;
    wx.makePhoneCall({
      phoneNumber: tel,
      success: function (res) {
        // success
      }
    });
  },
  //确认服务
  sureDoor: function () {
    this.setData({
      doorSureBlen: false,
    });
  },

  //确认完成服务弹框
  doorSureEvent: function () {
    var that = this;
    var orderId = that.data.orderId;
    var userId = wx.getStorageSync('userId');


    //var userId ='13172';//修改
    //var orderId= '532197';

    var dt = {
      'function': 'door',
      'order_id': orderId,
      'user_id': userId,
      'version': version,
      'newversion': newversion,
      '_from': 'h5',
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
   * 再次预约
   */
  orderAgain: function () {
    var list = this.data.dataList;
    wx.setStorageSync("hospitalId", list.pzGhHospitalId);
    wx.setStorageSync("hospitalName", list.pzGhHospital);

    wx.setStorageSync("firDepartmentId", list.firDepartId);
    wx.setStorageSync("subDepartmentId", list.subDepartId);

    wx.setStorageSync('secondDepartmentName', list.subDepartName);

    wx.setStorageSync("roleType", list.pzGhType == '专家号' ? '002' : '003');


    wx.setStorageSync("patientId", list.patientId);

    var patientObj = {
      "relationship": list.relationship,
      "card": list.patientIdCardNo,
      "name": list.patientName,
      "age": list.patientAge,
      "patientId": list.patientId,
      "sex": list.patientSex == '0' ? '男' : '女'
    }

    wx.setStorageSync("objUserInfo", patientObj);

    var addPrices = list.addedService[0].addedServiceItem,
      addType = '';
    if (addPrices.indexOf('初级') > -1) {
      addType = '22';
    } else {
      addType = '23';
    }
    wx.setStorageSync('addPrice', addType);
    wx.setStorageSync('details', list.desc);
    wx.redirectTo({
      url: '/pages/order/order'
    });
  },
  /**
   * 查看时间弹框
   */
  lookTime: function () {
    this.setData({
      serviceTimeModal: true
    })
  },
  timeModalClose: function () {
    this.setData({
      serviceTimeModal: false
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