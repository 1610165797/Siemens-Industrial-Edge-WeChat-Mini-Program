const db = wx.cloud.database("siemens-3g29njpzec51b925")
const _=db.command
Page({
  data:
  {
  },
  onLoad:function(options){
    this.getOpenid()
  },
  onPullDownRefresh: function (){
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
      this.initVariables();
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
  initVariables:function(){
    var that=this
      db.collection('subscribers').where({
        openid:this.data.openid
      }).get().then(res=>{
        console.log(res)
        if(res.data.length==1)
        {
          that.setData({
            subscribed:res.data[0].pending
          })
          console.log(res)
        }
        else
        {
          db.collection('subscribers').add({
            data:{
              openid:this.data.openid,
              pending:false
            },
            success:function(res){
              console.log(res)
            }
          })
        }
      })
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
  }
})