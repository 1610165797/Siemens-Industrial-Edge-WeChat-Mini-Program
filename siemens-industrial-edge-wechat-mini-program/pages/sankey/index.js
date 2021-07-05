// pages/sankey/index.js
import * as echarts from '../../ec-canvas/echarts'


const db = wx.cloud.database("siemens-3g29njpzec51b925")
const _=db.command
Page({
  data: {
    lazyEc:{
      lazyLoad:true
    },
    byDay:"By Day",
    byMonth:"By Month",
    start:"Start",
    end:"End",
    default:true,
    raw:[],
    list:[],
    shifted:0,
    index:-1,
    nodes:[],
    emphasis:-1,
    links:[{
      source: 'Nuclear',
      target: 'Thermal',
      value: 5
  }, {
      source: 'Nuclear',
      target: 'Industry',
      value: 3
  }, {
      source: 'Wind',
      target: 'Electric Grid',
      value: 8
  }, {
      source: 'Nuclear',
      target: 'Electric Grid',
      value: 3
  }, {
      source: 'Wind',
      target: 'Thermal',
      value: 1
  }, {
      source: 'Electric Grid',
      target: 'Losses',
      value: 2
  },
  {
      source: 'Electric Grid',
      target: 'Mining',
      value: 4
  }]
  },
  onLoad: function (options){
    this.initVariables();
    this.getOption();
  },
  onPullDownRefresh: function(){
    var that=this
    this.onLoad();
    setTimeout(function(){
      wx.stopPullDownRefresh({
        success: (res)=>{
          that.setData({
            index:-1,
            default:true
          })
        },
      })
    },2000)
  },
  initVariables:function(){
    var temp_nodes=[]
    var temp_list=[]
    for(var i in this.data.links)
    {
      if(!temp_nodes.includes(this.data.links[i].source))
      {
        var obj={}
        temp_nodes.push(this.data.links[i].source)
        obj["name"]=this.data.links[i].source
        temp_list.push(obj)
      }
      if(!temp_nodes.includes(this.data.links[i].target))
      {
        var obj={}
        temp_nodes.push(this.data.links[i].target)
        obj["name"]=this.data.links[i].target
        temp_list.push(obj)
      }
    }
    this.setData({
      nodes:temp_nodes,
      list:temp_list
    })
  },
  bindNodeChange:function(e){
    this.setData({
      index:e.detail.value,
      default:false
    })
    this.getOption();
  },
  resetHighlight:function(){
    this.setData({
      default:false
    })
    this.getOption();
  },
  getOption:function(){
    this.init_chart(this.data.vx,this.data.vy)
  },
  scrollCanvas:function(e){
    console.log(e);
    var canvasLen = e.detail.scrollLeft;
    this.setData({
      canvasLen: canvasLen
    })
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
      that.line_set(chart,that.data.list,that.data.links);
      this.chart=chart
  wx.hideLoading({
    success: (res) => {
    },
  })
      return chart
  })
  },
  changeChartPosition:function(e){
    this.setData({
      shifted:e.detail.value,
      default:true
    })
    this.getOption()
  },
  line_set:function(chart, xdata, ydata) {
    var option = {
      title: {
          text: 'Sankey Chart'
      },
      tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
      },
      series: [
          { animation:false,
            draggable:false,
            top:"5%",
            left:"2%",
            right:"25%",
            bottom: '10%',
              type: 'sankey',
              data:xdata,
              links:ydata,
              emphasis: {
                focus: 'adjacency'
              },
              lineStyle: {
                  color: 'gradient',
                  curveness: 0.5
              }
          }
      ]
  };
  chart.setOption(option);
  if((this.data.index!=-1)&&!this.data.default)
  {
    chart.dispatchAction({
        type:"highlight",
        seriesIndex:0,
        dataIndex:this.data.index,
      });
  }
  },
  byDay:function(e){
    var that=this
    this.setData({
      raw:[],
      byDay:e.detail.value,
      byMonth:"By Month",
      start:"Start",
      end:"End"
    })
    var gmt = new Date(e.detail.value.split(' ').join('T'))
    var local=gmt.getTime()/1000+gmt.getTimezoneOffset()*60
    this.getList(db,_,0,1,local,local+24*3600,this.getList)
    setTimeout(function(){
      that.updateLinks()
      that.initVariables()
      that.getOption()
    }, 2000);
  },
  byMonth:function(e){
    var that=this
    this.setData({
      raw:[],
      byDay:"By Day",
      byMonth:e.detail.value,
      start:"Start",
      end:"End"
    })
    var gmt = new Date(e.detail.value.split(' ').join('T'))
    var local=gmt.getTime()/1000+gmt.getTimezoneOffset()*60
    var my=e.detail.value.split("-")
    var days=new Date(my[0],my[1],0).getDate()
    this.getList(db,_,0,days,local,local+days*24*3600,this.getList)
    setTimeout(function(){
      that.updateLinks()
      that.initVariables()
      that.getOption()
    }, 2000);
  },
  start:function(e){
    this.setData({
      raw:[],
      byDay:"By Day",
      byMonth:"By Month",
      start:e.detail.value,
      end:"End"
    })
  },
  end:function(e){
    this.setData({
      raw:[],
      byDay:"By Day",
      byMonth:"By Month",
      end:e.detail.value
    })
    var that=this
    var gmt = new Date(this.data.start.split(' ').join('T'))
    var local=gmt.getTime()/1000+gmt.getTimezoneOffset()*60
    var temp=local
    var gmt = new Date(e.detail.value.split(' ').join('T'))
    var local=gmt.getTime()/1000+gmt.getTimezoneOffset()*60
    var days=(local-temp)/(3600*24)
    this.getList(db,_,0,days+1,temp,local+24*3600,this.getList)
      setTimeout(function(){
        that.updateLinks()
        that.initVariables()
        that.getOption()
      }, 2000);
  },
  getList:function(db,_,skip,count,start,end,callback){
    var that=this
    if(skip>count)
    {
      return
    }
    return new Promise((resolve, reject) =>{
      let statusList = []
      let selectPromise
      if(skip>0)
      {
        selectPromise = db.collection('app2pub').where({
          time: _.and(_.gte(start), _.lt(end))
        }).orderBy('time', 'asc').skip(skip).get()
      }
      else
      {
        selectPromise = db.collection('app2pub').where({
          time: _.and(_.gte(start), _.lt(end))
        }).orderBy('time', 'asc').get()
      }
      selectPromise.then(res => {
        console.log(res.data)
        that.setData({
          raw:this.data.raw.concat(res.data)
        })
        callback(db,_,skip+20,count,start,end,callback);
      }).catch(e => {
        console.error(e)
        reject("查询失败!")
      })
    })
  },
  updateLinks:function(){
    var temp = []
    for(var i in this.data.raw)
    {
      for(var j in this.data.raw[i].value)
      {
        if(i==1)
        {
          temp[j]=this.data.raw[i].value[j].value
          console.log(this.data.raw[i].value[j].value)
        }
        else
        {
          temp[j]+=this.data.raw[i].value[j].value
        }
      }
    }
    var bridge=this.data.raw[0].value
    for(var i in bridge)
    {
      bridge[i].value=temp[i]
    }
    this.setData({
      links:bridge
    })
    console.log(temp)
  }
})

