// index.js
// 获取应用实例
const db = wx.cloud.database("siemens-3g29njpzec51b925")
const _=db.command
const app = getApp()
Page({
  data: {
    motto: 'Welcome',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    list:[
      {
        name:"Fire Alarm",
        state:false
      },
      {
       name: "Production Suspension",
       state:false
      },
      {
       name: "Security Breach",
       state:false
      },
      {
       name: "High Friction",
       state:false
      },
      {
       name: "Low Engine Oil",
       state:false
      },
      {
       name: "High Humidity",
       state:false
      },
      {
       name: "Anamolous Vibration",
       state:false
      },
      {
        name: "Low Thrust",
        state:false
      },
      {
       name: "Low Battery",
       state:false
      },
      {
        name: "Temperature High",
        state:false
       }
     ]
  },
  bindViewTap(){
    this.getUserProfile();
  },
  getUserProfile:function(){
    wx.getUserProfile({
      desc:'Get User Info',
      success:res=>{
        wx.showLoading({
          title: 'signing in...',
        })
        var temp=JSON.parse(res.rawData)
        temp["sub"]=this.data.list
        this.setData({
          userInfo:temp
        })
        this.uploadUser()
      }
    });
  },
  getOpenid(){
    var that=this
    wx.cloud.callFunction({
      name:"getopenid"
    }).then(res=>{
      console.log("Yeah",res)
      that.setData({
        openid:res.result.openid
      })
      that.checkExist()
    }).catch(res=>{
      console.log("Oops",res)
    })
  },
  uploadUser:function(){
    db.collection('users').add({
      data:this.data.userInfo
    }).then(res=>{
        console.log(res)
        wx.hideLoading({
          success: (res) => {
            wx.switchTab({
              url: '../line/index',
            })
          },
        })
       
    })
  },
  onLoad(){
    wx.showLoading({
      title: 'loading...',
    })
    this.getOpenid()
  },
  checkExist:function(){
    var that=this
    db.collection('users').where({
      _openid:this.data.openid,
    }).count().then(res=>{
      console.log(res)
      if(res.total==0)
      {
        wx.hideLoading({
          success: (res) => {
          },
        })
      }
      else if(res.total==1)
      {
        wx.showLoading({
          title: "signing in...",
        })
        setTimeout(function(){
          wx.hideLoading({
            success: (res) => {
              wx.switchTab({
                url: '../line/index',
              })
            },
          })
      },2000)
      }
      else
      {
        wx.showLoading({
          title: "signing in...",
        })
        db.collection("users").where({_openid:this.data.openid}).limit(res.total-1).remove().then(res=>{
          setTimeout(function(){
            wx.hideLoading({
              success: (res) => {
                wx.switchTab({
                  url: '../line/index',
                })
              },
            })
          },2000)
        })
    
      }
    })
  }
})
