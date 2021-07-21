const db = wx.cloud.database("siemens-3g29njpzec51b925")
const _=db.command
Page({
  data:
  {
    override:false
  },
  onLoad:function(options){
    wx.showLoading({
      title: 'loading...',
      mask:true
    })
    this.getOpenid();
  },
  onShow:function(options){
    this.onLoad();
  },
  checkLogin:function(){
    db.collection
  },
  onPullDownRefresh: function (){
    this.onLoad();
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
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
      this.fetchData();
    }).catch(res=>{
      console.log("Oops",res)
    })
  },
  reqeustSubscribeMessage:function(e){
    wx.showLoading({
      title: 'loading...',
      mask:true
    })
    var that=this
    setTimeout((res) => {
      wx.hideLoading({
        success: (res) => {},
      })
    }, 1000);
    if(e.detail.value==true)
    {
    wx.requestSubscribeMessage({
      tmplIds: ["I_2lT2DRyjtJ1EjeM5SN81bd3DBMV2EHdpHutsrPrps"],
      success(res){
        console.log("success",res)
        that.uploadOpenid(that.data.openid)
      },
      fail(res){
        console.log("fail",res)
      }
    })
  }
  else
  {
    db.collection('subscribers').where({openid:this.data.openid}).update({
      data:
      {
        pending:false
      }
    })
  }
  },
  uploadOpenid:function(openid){
    db.collection('subscribers').where({
      openid:openid
    }).get().then(res=>{
      console.log(res)
      if(res.data.length==1)
      {
        if(res.data[0].pending==false)
        {
          db.collection('subscribers').doc(res.data[0]._id).update({
            data:
            {
              pending:true
            }
          })
        }
        else
        {
          db.collection('subscribers').doc(res.data[0]._id).update({
            data:
            {
              pending:false
            }
          })
        }
      
      }
      else
      {
        db.collection('subscribers').add({
          data:{
            openid:openid,
            pending:true
          },
          success:function(res){
            console.log(res)
          }
        })
      }
    })
  },
  toggle:function(e){
    var that=this
    if(this.data.override)
    {
      this.setData({
        override:false
      })
      wx.openSetting({
        withSubscriptions:true,
      })
      this.fetchData()
    }
    else
    {
    if(e.detail.value.length>this.data.trues)
    {
      wx.requestSubscribeMessage({
      tmplIds: ["I_2lT2DRyjtJ1EjeM5SN81bd3DBMV2EHdpHutsrPrps"],
      mask:true,
      success(res){
        if(res.I_2lT2DRyjtJ1EjeM5SN81bd3DBMV2EHdpHutsrPrps=="accept")
        {
          wx.showLoading({
            title: 'subscribing...',
            mask:true
          })
          that.updateDatabase(e)
        }
        else
        {
          that.setData({
            override:true
          })
          that.fetchData()
        }
      },
      fail(res){
        wx.showLoading({
          title: 'canceled...',
          mask:true
        })
        that.fetchData()
      }
    })
  }
  else
  {
    wx.showLoading({
      title: 'unsubscribing...',
      mask:true
    })
    this.updateDatabase(e);
  }
}
   
  },
  updateDatabase:function(e){
    var temp=this.data.list
    for(var i in temp)
    {
      if(e.detail.value.includes(temp[i].name))
      {
        temp[i].state=true
      }
      else
      {
        temp[i].state=false
      }
    }
    db.collection('users').where({
      _openid:this.data.openid
    }).update({
      data:{
        sub:temp
      }
    }).then(res=>{
      this.fetchData();
      console.log(res);
    })
  },
  fetchData:function(){
    db.collection('users').where({
      _openid:this.data.openid
    }).get().then(res=>{
      console.log(res)
      if(res.data.length==0)
      {
        wx.showLoading({
          title: 'please login...',
          mask:true
        })
        setTimeout((res) => {
          wx.hideLoading({
            success: (res) =>{
              wx.navigateTo({
                url: '../index/index',
              })
            },
          })
        }, 1000);
      }
      console.log(res.data[0].sub)
      this.setData({
        list:res.data[0].sub
      })
      var count=0
      for(var i in this.data.list)
      {
        if(this.data.list[i].state==true)
        {
          count++
        }
      }
      this.setData({
        trues:count
      })
      wx.hideLoading({
        success: (res) => {},
      })
    })
  }
})