import * as echarts from '../../ec-canvas/echarts'
const db = wx.cloud.database("siemens-3g29njpzec51b925")
const _=db.command
Page({
  data: {
    lazyEc:{
      lazyLoad:true
    },
    byDay:"Pick Date",
    byMonth:"Pick Month",
    start:"Pick Start Date",
    end:"Pick End Date",
    default:true,
    raw:[],
    list:[],
    shifted:0,
    index:-1,
    nodes:[],
    emphasis:-1,
    links:[]
  },
  onLoad: function (options){
    var that=this
    wx.showLoading({
      title: 'loading...',
    })
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var gmt = new Date(today.split(' ').join('T'))
    var local=gmt.getTime()/1000+gmt.getTimezoneOffset()*60
    this.getList(db,_,0,1,local,local+24*3600,this.getList)
  },
  onPullDownRefresh: function(){
    var that=this
    this.onLoad();
    setTimeout(function(){
      wx.stopPullDownRefresh({
        success: (res)=>{
          that.setData({
            index:-1
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
  line_set:function(chart, xdata, ydata){
    var option = {
      title: {
          text: 'Energy Flow Chart'
      },
      tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
      },
      series: [
          { animation:false,
            nodeAlign: 'right',
            draggable:false,
            top:"6%",
            left:"2%",
            right:"15%",
            bottom: '2%',
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
    wx.showLoading({
      title: 'loading...',
    })
    var that=this
    this.setData({
      raw:[],
      byDay:e.detail.value,
      byMonth:"Pick Month",
      start:"Pick Start Date",
      end:"Pick End Date",
      index:-1
    })
    var gmt = new Date(e.detail.value.split(' ').join('T'))
    var local=gmt.getTime()/1000+gmt.getTimezoneOffset()*60
    this.getList(db,_,0,1,local,local+24*3600,this.getList)
  },
  byMonth:function(e){
    wx.showLoading({
      title: 'loading...',
    })
    var that=this
    this.setData({
      raw:[],
      byDay:"Pick Day",
      byMonth:e.detail.value,
      start:"Pick Start Date",
      end:"Pick End Date",
      index:-1
    })
    var gmt = new Date(e.detail.value.split(' ').join('T'))
    var local=gmt.getTime()/1000+gmt.getTimezoneOffset()*60
    var my=e.detail.value.split("-")
    var days=new Date(my[0],my[1],0).getDate()
    this.getList(db,_,0,days,local,local+days*24*3600,this.getList,[])
  },
  start:function(e){
    var that=this
    this.setData({
      raw:[],
      byDay:"Pick Date",
      byMonth:"Pick Month",
      start:e.detail.value,
      index:-1
    })
    if(this.data.end=="Pick End Date")
    {
    }
    else
    {
      wx.showLoading({
        title: 'loading...',
      })
      var start= new Date(this.data.start.split(' ').join('T'))
      var end= new Date(this.data.end.split(' ').join('T'))
      var local_start=start.getTime()/1000+start.getTimezoneOffset()*60
      var local_end=end.getTime()/1000+end.getTimezoneOffset()*60
      var days=(local_end-local_start)/(3600*24)
      this.getList(db,_,0,days+1,local_start,local_end,this.getList)
    }
  },
  end:function(e){
    var that=this
    this.setData({
      raw:[],
      byDay:"Pick Day",
      byMonth:"Pick Month",
      end:e.detail.value,
      index:-1
    })
    if(this.data.start=="Pick Start Date")
    {
    }
    else
    {
      wx.showLoading({
        title: 'loading...',
      })
      var start= new Date(this.data.start.split(' ').join('T'))
      var end= new Date(this.data.end.split(' ').join('T'))
      var local_start=start.getTime()/1000+start.getTimezoneOffset()*60
      var local_end=end.getTime()/1000+end.getTimezoneOffset()*60
      var days=(local_end-local_start)/(3600*24)
      this.getList(db,_,0,days+1,local_start,local_end,this.getList)
    }
  },
  getList:function(db,_,skip,count,start,end,callback,temp=[]){
    var that=this
    if(skip>count)
    {
      that.setData({
        raw:temp
      })
      that.updateLinks()
      that.initVariables()
      that.getOption()
      return
    }
    db.collection('app2pub').where({
      time: _.and(_.gte(start), _.lt(end))
    }).orderBy('time', 'asc').skip(skip).get().then(res =>{
      console.log(res.data)
      callback(db,_,skip+20,count,start,end,callback,temp.concat(res.data));
      }).catch(e => {
        console.error(e)
      })
  },
  updateLinks:function(){
    var temp = []
    for(var i in this.data.raw)
    {
      for(var j in this.data.raw[i].value)
      {
        if(i==0)
        {
          temp[j]=this.data.raw[i].value[j].value
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

