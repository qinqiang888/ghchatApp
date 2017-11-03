var app=getApp()
var util = require('../../utils/util.js')
var timer;
var timeSecond = false, sendBolen = false;
Page({
  data:{
      usermobile:'',
      code:'',
      codeid:'',
      validate:false,//验证手机号
      flag:true,
      yzmvalue:'获取验证码',
      timevalue:60,
      loading:false,
      disabled:false,
      dialogBlen:true,
      dialogMsg:'',
      focus:false
   
  },
  onLoad:function(options){
    this.checklogin()
 // 生命周期函数--监听页面加载
  
  },
  //点击空白弹框消失
  modalChange:function(){
      this.setData({
          dialogBlen:true
      });
  },
  phonevalue:function(e){
      this.setData({
         usermobile: e.detail.value
      })

  },
  //登录页面进行一次获取新的code
  checklogin:function(){
        wx.login({
            success: function (data) {
            app.globalData.code = data.code;
            }
        })

  },

  codevalue:function(e){
      this.setData({
         code: e.detail.value
      })

  },
  settime:function(){
      var timevalue=this.data.timevalue;
      
        if(timevalue==0){
          clearInterval(timer)
          this.setData({
            yzmvalue:'重新获取',
            timevalue:60,
            flag:true
          })
          timeSecond=false;
          sendBolen = false;
          return;
        } 
        timevalue--;
        timeSecond=true;
        sendBolen = true;
        this.setData({
            timevalue:timevalue,
            flag:false
        })  
  },

  getcode:function(){
      this.authcodesend('4','0')
  },
  //验证码
 authcodesend: function(Type, sendtype){
    if(!this.phoneValidate() || timeSecond || sendBolen){
        return;
      }
      var that=this; 
      sendBolen = true;
      var url=app.globalData.requestUrl;
      var sid=app.globalData.sid;
      var source=app.globalData.source;
      var version=app.globalData.version;
      var newversion=app.globalData.newversion;
      var usermobile=this.data.usermobile;
      var codeid=this.data.codeid; 
      var verifyCode=this.data.verifyCode; 
      var dt = {
        'function': 'authcodesend', 
        'usermobile': usermobile,
        'type': Type,
        'sendtype': sendtype,
        'source':source,
        'version':version,
        'newversion':newversion,
        'sid':sid
        }
        wx.request({
            url: url,
            data:{"encryption":false,"data":JSON.stringify(dt)},
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method:"POST",
            success: function(res) {
              if(res.data.code=="0000"){
                  that.setData({
                      codeid:res.data.codeid,
                      focus:true
                  })
                  if(!timeSecond){
                  
                    timer=setInterval(that.settime,1000)
                  }
              
              }else{
                  util. wxshowModal(res.data.message,false);
                  sendBolen = false;
              }
            }    
        })
  }, 
  // 手机号验证
  phoneValidate:function(){
    var phonereg=/^(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/;
    if(this.data.usermobile==""||!phonereg.test(this.data.usermobile)){
        util. wxshowModal('请输入正确的手机号',false)
        return false
      }
        return true
      
  },
  codeValidate:function(){
   var codereg=/^[0-9]{4,6}$/;
    if(this.data.code==""||!codereg.test(this.data.code)){
        util. wxshowModal('请输入正确的验证码',false)
        return false
      }
        return true
  },
  
  //登录
  login:function(){
    if (!this.phoneValidate()){
      return ;
    }
    if(!this.codeValidate()){
      return;
    }
    
      var that=this;
       that.setData({
        loading:true,
        disabled:true
       })
      var url=app.globalData.loginUrl;
      var sid=app.globalData.sid;
      var source=app.globalData.source;
      var version=app.globalData.version;
      var code=app.globalData.code;
      var newversion=app.globalData.newversion;
      var usermobile=this.data.usermobile;
      var codeid=this.data.codeid; 
      var verifyCode=this.data.code;   
      var dt={
            usermobile:usermobile,
            passwordType:'2',
            verifyCode:verifyCode,
            verifyId:codeid,
            userType:'2',
            source:source,
            version:version,
            newversion:newversion,
            sid:sid,
      }
     wx.request({
        url: url,
        data:{data:JSON.stringify(dt),code:code,source:'gh'},
        header: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method:"POST",
        success: function(res) {
          if(res.data.code=="0000"){
            console.log(res.data.code);
            app.globalData.userId=res.data.data.user.userId.toString()
            wx.setStorageSync('userId', res.data.data.user.userId.toString())
            wx.setStorageSync('wx_session', res.data.data.swx_session)
              wx.setStorageSync('userMobile', res.data.data.user.userMobile.toString());
              wx.setStorageSync('token', res.data.data.token);
            wx.redirectTo({
              url: '../../pages/index/index',
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
            // that.setData({
            //     dialogBlen:false,
            //     dialogMsg: res.data.message || res.data.errmsg
            // });
            util.wxshowModal(res.data.message || res.data.errmsg, false)
            wx.clearStorage();
            app.globalData.code = null;
            app.globalData.userInfo = null;
            that.checklogin()
          }
          that.setData({
              loading:false,
              disabled:false,
          })
        }    
    })

  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  }
})