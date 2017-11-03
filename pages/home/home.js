var app = getApp()
var util = require('../../utils/util.js')
var sid=app.globalData.sid;
var source=app.globalData.source;
var version=app.globalData.version;
var newversion=app.globalData.newversion;
Page({
  data:{
      user:'',//用户信息
      isRealInfo:'',//是否完善信息
      tel:"tel:" + 4000122789,
      loading: false,
      disabled:false,
      jumpUrl:{
        userInfoUrl:"../../pages/perfectInfo/perfectInfo" ,  //是否已完善信息页面
        accountUrl:"../../pages/account/account",     //我的账户页面
        rechargeUrl:"../../pages/recharge/recharge",     //充值页面
        orderListUrl:"../../pages/orderList/orderList"//我的预约页面
      },//个人页面跳转URL
      headPic:'/images/moren.png'//上传更换头像
  },
  onLoad:function(options){
      this.loginvalidate();
      this.getUserInfo();
      wx.removeStorageSync('orderId');
      wx.removeStorageSync('payFee'); 
      wx.removeStorageSync('voucherprice');       
  },
  
  loginvalidate:function(){
    if(!wx.getStorageSync("userId")){
      wx.redirectTo({
        url: '../../pages/login/login',
        success: function(res){
          // success
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    }
  },
  getUserInfo:function(){
    var that=this;
    var url=app.globalData.requestUrl;
    var user=wx.getStorageSync("userId");
    var swx_session=wx.getStorageSync("wx_session")
    var dt={'function':'getUserInfo',
    'userId':user,            
    'login_userId_base': user,
    'sid':sid,
    "version":version,
    "newversion":newversion,
    "source":source,
    "swx_session":swx_session
      };
    // 获取用户信息
       wx.request({
        url: url,
        data:{"encryption":false,"data":JSON.stringify(dt)},
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method:"POST",
        success: function(res) {
          var isRealInfo='';
          var realInfo;
          if(res.data.code=="0000"){
                if(res.data.user.userRealName==''||res.data.user.userIdCardNo==''){
                  isRealInfo='未完善信息 >';
                  realInfo=false;
              }else{
                  isRealInfo='已完善信息 >';
                   realInfo=true;
              }
               wx.setStorageSync('userRealName', res.data.user.userRealName);
               wx.setStorageSync('userIdCardNo', res.data.user.userIdCardNo);
               wx.setStorageSync('nickName', res.data.user.nickName);
               wx.setStorageSync('height', res.data.user.height);
               wx.setStorageSync('weight', res.data.user.weight);
               wx.setStorageSync('userAge', res.data.user.userAge);
               wx.setStorageSync('userSex', res.data.user.userSex);
              wx.setStorageSync('userMobile', res.data.user.userMobile);
               wx.setStorageSync('realInfo', realInfo);
              
              
               
              that.setData({
              user      :res.data.user,
              isRealInfo:isRealInfo,
              headPic   :res.data.user.userHeadPicUrl
            })
          
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
  tell:function(){
      wx.makePhoneCall({
      phoneNumber: '4000122789'

    })
  },
  //上传头像
  uploadImage:function(){
    var that=this;
    var url=app.globalData.imgUploadUrl
      wx.chooseImage({
        count: 1,
        success: function(res) {
          var tempFilePaths = res.tempFilePaths
          console.log(tempFilePaths)
          wx.uploadFile({
            url: url, //
            filePath: tempFilePaths[0],
            name: 'file',
            formData:{},        
            header:{'content-type':'multipart/form-data'},
            success: function(res){
             var mes=JSON.parse(res.data).message
             var headPic=''
             if(mes.indexOf("http")>-1||mes.indexOf("https")>-1){
                headPic=mes
             }else{
                headPic='http://file.zcw.com/'+mes;
             }
             that.setData({
               headPic:headPic
             })
             that.updateUserInfo();
              //do something
            }
          })

        }
      })
  },
  optionImage:function(){
    var that=this;
    wx.showActionSheet({
      itemList: ['预览头像', '更换头像'],
      success: function(res) {
        if(res.tapIndex==0){
          wx.previewImage({
            current: that.data.headPic, // 当前显示图片的http链接
            urls: [that.data.headPic] 
          })
        }else if(res.tapIndex==1){
          that.uploadImage()
        }else{

        }
      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  },
  //更新信息(头像)
  updateUserInfo:function(){
      var url=app.globalData.requestUrl;
      var user=wx.getStorageSync("userId").toString()
      var picurl=this.data.headPic
    	var dt={'function':'updateUserInfo',
					'userid':user,
					'userHeadPicUrl':picurl,
					'userRealName':'',
					'userIdCardNo':'',
					'userIdCardPic':'',
					'height':'',
					'weight':'',
          'sid':sid,
          "version":version,
          "newversion":newversion,
          "source":source
          // 'login_userId_base': user,
          // '_validate':'1'
				};
      wx.request({
        url: url,
        data:{"encryption":false,"data":JSON.stringify(dt)},
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method:"POST",
        success: function(res) {
          console.log(res)
          if(res.data.code=="0000"){
             wx.showToast({
                    title: '头像更新成功',
                    icon: 'success',
                    duration: 2000
                  })
          
          }else if(res.data.code=="0502"){
                wx.redirectTo({
                url: "../../pages/login/login",
                success: function(res){
                  // success
                },
                fail: function() {
                  // fail
                },
                complete: function() {
                  // complete
                }
              })
          }else{
            util.wxshowModal(res.data.message,false)
          }
        }    
    })
  },
  //是否确认退出
  isconfirm:function(){
    var that=this;
    wx.showModal({
      title: '确定要退出登录吗',
      confirmColor:'#1cc6a3',
      success: function(res) {
        if (res.confirm) {
          that.loginOut()
        }
      }
    })
  },
  //退出登录
  loginOut:function(e){
    var that=this;
    var user=wx.getStorageSync("userId").toString()
    that.setData({
            loading:true,
            disabled:true
      })
      var url=app.globalData.loginOutUrl;
      var wx_session = wx.getStorageSync("wx_session");
    	var dt={'login_userId_base': user,"wx_session":wx_session}
		   wx.request({
        url: url,
        data:dt,
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method:"POST",
        success: function(res) {
          console.log(res)
          if(res.data.code=="0000"){
             wx.showToast({
                    title: '退出成功',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.clearStorage()
                  app.globalData.code = null;
                  app.globalData.userInfo = null;
              wx.navigateTo({
                url: "../../pages/login/login",
                success: function(res){
                  // success
                },
                fail: function() {
                  // fail
                },
                complete: function() {
                  // complete
                }
              })
          
          }else{
            util.wxshowModal(res.data.message,false)
             
          }
          that.setData({
                loading:false,
                disabled:false
          })
        }    
    })
  },

  onShareAppMessage: function() {
    var title=app.globalData.title;
    var desc=app.globalData.desc;
    var path=app.globalData.path;
    // 用户点击右上角分享
    return {
      title: title, // 分享标题
      desc: desc, // 分享描述
      path: path // 分享路径
    }
  }
})