import * as echarts from '../../ec-canvas/echarts'
const db = wx.cloud.database("siemens-3g29njpzec51b925")
const _=db.command
Page({
data:{
  lazyEc:{
    lazyLoad:true
  },
  list:{},
  start:1623723123463012400,
  end:1623723131947318300,
  temp_start:1623723123463012400,
  temp_end:1623723131947318300,
  ideal_frq:10,
  real_frq:0,
  counter:0,
  array:["Sankey Chart","Gantt Chart",],
  index:-1,
  vx:[],
  vy:[]
},
onLoad:function(options)
{
  var d=(Date.now()/1000).toFixed(0)
  this.setData({
    start:d-120,
    end:d-60
  })
  this.fetchData()
  var that=this
},
onReady:function(){
},
onPullDownRefresh:function(){
  var d=Date.now()/1000
  this.setData({
    start:d-120,
    end:d-60
  })
  this.fetchData();
  setTimeout(function(){
      wx.stopPullDownRefresh();
  },2000)
},
getStartTime:function(e)
{
    this.setData({
      temp_start:e.detail.value
    })
}, 
getEndTime:function(e)
{
  this.setData({
    temp_end:e.detail.value
  })
},
confirm:function()
{
  this.setData({
    start:parseInt(this.data.temp_start),
    end:parseInt(this.data.temp_end)
  })
  this.fetchData()
},
next:function()
{
  var temp=this.data.end+(this.data.end-this.data.start)
  this.setData({
    start:this.data.end,
    end:temp,
  })
  this.fetchData()
},
prev:function()
{
  var temp=this.data.start-(this.data.end-this.data.start)
  this.setData({
    start:temp,
    end:this.data.start,
  })
  this.fetchData()
},
increase_ten_minute:function()
{
  this.setData({
    start:this.data.start+60*10,
    end:this.data.end+60*10,
  })
  this.fetchData()
},
decrease_ten_minute:function()
{
  this.setData({
    start:this.data.start-60*10,
    end:this.data.end-60*10,
  })
  this.fetchData()
},
bindPickerChange: function(e) {
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    index: e.detail.value
  })
  if(e.detail.value==0)
  {
    console.log("reached")
    wx.navigateTo({
      url:"../sankey/index"
    })
  }
  else if(e.detail.value==1)
  {
    wx.navigateTo({
      url:"../gantt/index"
    })
  }
  
},
getOption:function(){
  var that=this
  var vx1=[]
  var vy1=[]
    for(var i=0;i<this.data.list.length;i++)
    {
        vx1.push(this.data.list[i].time)
        vy1.push(this.data.list[i].value)
    }
    this.setData({
      vx:vx1,
      vy:vy1
    })
    console.log(this.data.vx,this.data.vy)
  this.init_chart(this.data.vx,this.data.vy)
},
init_chart:function(xdata,ydata){
  var that=this
this.lazyComponent=this.selectComponent("#lazy-mychart-dom")
this.lazyComponent.init((canvas,width,height,dpr)=>{
    const chart=echarts.init(canvas,null,{
      width:width,
      height:height,
      devicePixelRatio:dpr
    })
    that.line_set(chart,xdata,ydata);
    this.chart=chart
    return chart
})
},
fetchData:function(){
  wx.showLoading({
    title: 'loading...',
    mask:true
  })
  var that=this
  this.setData({
    list:[]
  })
  this.getListCount(db,_).then(res=>{
    let count = res
    let extract={}
    console.log(res)
    that.setData({
      counter:count,
      real_frq:(count/(this.data.end-this.data.start)).toFixed(3)
    })
      that.getListIndexSkip(db,_,0,count,that.getListIndexSkip);
  })
},
getListCount:function(db,_){
  var that=this
  return new Promise((resolve, reject) => {
    db.collection('app1pub').where({
      time: _.and(_.gt(that.data.start*1000000000), _.lt(that.data.end*1000000000))
    }).orderBy('time', 'asc').count().then(res => {
      resolve(res.total);
      console.log(res)
    }).catch(e=>{
      console.log(e)
      reject("查询失败")
    })
  })
},
getListIndexSkip:function(db,_,skip,count,callback){
  var that=this
  if(skip>count)
  {
      that.getOption()
      return
  }
  else
  {
    return new Promise((resolve, reject) => {
    let statusList = []
    let selectPromise;	
    if (skip > 0)
    {
      selectPromise = db.collection('app1pub').where({
        time: _.and(_.gt(that.data.start*1000000000), _.lt(that.data.end*1000000000))
      }).orderBy('time', 'asc').skip(skip).get()
    } 
    else 
    {
      selectPromise = db.collection('app1pub').where({
        time: _.and(_.gt(that.data.start*1000000000), _.lt(that.data.end*1000000000))
      }).orderBy('time', 'asc').get()
    }
    selectPromise.then(res => {
      console.log(res.data)
      that.setData({
        list:this.data.list.concat(res.data)
      })
      callback(db,_,skip+20,count,callback);
    }).catch(e =>{
      console.error(e)
      reject("查询失败!")
    })
  })
}
},
line_set:function(chart, xdata, ydata) {
  var option = {
    title: {
      text:'Acceleration-Time Chart'
    },
    animation:false,
    tooltip: {
        trigger: 'axis'
    },
    grid:{
      left: '2%',
      right: '5%',
      bottom: '1%',
      containLabel: true  
    },
    toolbox: {
    },
    xAxis: {
      name:'s',
      nameTextStyle:{
        padding:[0,0,0,-5]
      },
      axisLabel: {
        show: false
      },
        type: 'category',
        boundaryGap: false,
        data: xdata
    },
    yAxis: {
      name:'m/s²',
        type: 'value',
        min:-10,
        max:10,
        interval:2
    },
    series: [
        {
            name: 'Data',
            type: 'line',
            stack: '总量',
            smooth:false,
            data: ydata
        }
    ]
};
  chart.setOption(option);
  wx.hideLoading({
    success: (res) => {
  
    },
  })
}
})

