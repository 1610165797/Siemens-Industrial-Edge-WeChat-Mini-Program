import * as echarts from '../../ec-canvas/echarts'
const db = wx.cloud.database("siemens-3g29njpzec51b925")
const _=db.command
Page({
  data:{
  },
  onLoad:function(options){
      this.fetchData()
  },
  onPullDownRefresh:function(){
      this.onLoad()
      setTimeout(function(){
        wx.stopPullDownRefresh({
          success: (res)=>{
          },
        })
      },2000)
  },
  getOption:function(){
    this.init_chart();
  },
  init_chart:function(){
      var that=this
      this.lazyComponent=this.selectComponent("#lazy-mychart-dom")
      this.lazyComponent.init((canvas,width,height,dpr)=>{
          const chart=echarts.init(canvas,null,{
              width:width,
              height:height,
              devicePixelRatio:dpr
            })
    that.line_set(chart);
      this.chart=chart
      return chart
  })
  },
  line_set:function(chart){
    Date.prototype.Format = function (fmt) {
      let o = {
          "M+": this.getMonth() + 1,
          "d+": this.getDate(),
          "H+": this.getHours(), 
          "m+": this.getMinutes(),
          "s+": this.getSeconds(),
          "q+": Math.floor((this.getMonth() + 3) / 3),
          "S": this.getMilliseconds()
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (let k in o)
          if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
  };
    var option={
      title: {
          text: "",
          x: "center"
      },
      tooltip: {
          trigger: "axis",
          axisPointer: {
              type: "shadow"
          },
          extraCssText:"",
          formatter: function (params) {
              let relVal = params[0].axisValueLabel;
              const getDateStr=(hideBar,dataBar)=>{
                  let str='';
                  str+=new Date(new Date().getTime() + (86400000) * hideBar.value).Format("yyyy-M-d")+" to "+new Date(new Date().getTime() + (86400000) * (hideBar.value+dataBar.value)).Format("yyyy-M-d");
                  return str;
              }
              relVal+="Scheme:"+getDateStr(params[0],params[1])+" Actual:"+getDateStr(params[2],params[3]);
              return relVal;
          }
      },
      legend: {
          data: ["plan", "actual"],
          x: 30
      },
      toolbox: {
          show: true,
          feature: {
              mark: true,
              dataView: {readOnly: false},
              restore: true,
              saveAsImage: true
          }
      },
      grid: {
          left: "1%",
          right: "5%",
          bottom: "0%",
          containLabel: true
      },
      yAxis: {
          type: "category",
          splitLine: {show: false},
          data: ["Spring", "Bolt", "Rubber", "Lub", "Screw"]
      },
      xAxis: {
          type: "value",
          boundaryGap: [0, 0.01],
          axisLabel: {
              show: true,
              interval: 0,
              formatter: function (value) {
                  return new Date(new Date().getTime() + (86400000) * value).Format("MM-dd")
              }
          }
      },
      series: [
          {
              name: "planDate",
              type: "bar",
              stack: "plan",
              barCategoryGap: "30%",
              itemStyle: {
                  normal: {
                      borderColor: "rgba(0,0,0,0)",
                      color: "rgba(0,0,0,0)"
                  },
                  emphasis: {
                      borderColor: "rgba(0,0,0,0)",
                      color: "rgba(0,0,0,0)"
                  }
              },
              data: this.data.start
          },
          {
              name: "plan",
              type: "bar",
              stack: "plan",
              itemStyle: {
                  normal: {
                      label: {
                          show: true,
                          position: "right",
                          textStyle: {
                              fontSize:14
                          },
                           formatter: function (obj) {
                              return obj.value;
                          }
                      },
                      color: "#c23531"
                  }
              },
              data: this.data.plan
          },
          {
              name: "factDate",
              type: "bar",
              stack: "fact",
              itemStyle: {
                  normal: {
                      borderColor: "rgba(0,0,0,0)",
                      color: "rgba(0,0,0,0)"
                  },
                  emphasis: {
                      borderColor: "rgba(0,0,0,0)",
                      color: "rgba(0,0,0,0)"
                  }
              },
              data: this.data.start
          },
          {
              name: "actual",
              type: "bar",
              stack: "fact",
              itemStyle: {
                  normal: {
                      label: {
                          show: true,
                          position: "right",
                          textStyle: {
                              fontSize: 14
                          },
                          formatter: function (obj) {
                              return obj.value;
                          }
                      },
                      color: "#91c7ae"
                  }
              },
              data: this.data.actual
          }, {
              type: "bar",
              stack: "none",
              barWidth: "2",
              itemStyle: {
                  normal: {
                      borderColor: "rgba(0,0,0,0)",
                      color: "rgba(0,0,0,0)"
                  },
                  emphasis: {
                      borderColor: "rgba(0,0,0,0)",
                      color: "rgba(0,0,0,0)"
                  }
              },
              data: [0, 0, 0, 0, 0]
          }
      ]
  }
  chart.setOption(option);
  },
  fetchData:function(){
    var that=this
    return new Promise((resolve, reject) => {
      db.collection('app3pub').orderBy('version',"desc").limit(1).get().then(res => {
        resolve(res.total);
        console.log(res)
        that.setData({
            start:res.data[0].start,
            actual:res.data[0].actual,
            plan:res.data[0].plan
        })
        this.getOption()
        resolve(res)
      }).catch(e=>{
        console.log(e)
        reject("查询失败")
      })
    })
  }
})