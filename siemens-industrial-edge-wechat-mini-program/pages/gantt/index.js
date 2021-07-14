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
  var option={
    title:
      {
          text: "Project Management Chart"
      },
      legend: {
          data: ['Actual',"Scheduled",""],
          x:200,
          y:30
      },
      grid:{
        top:'15%',
        left:'2%',
        right:'2%',
        bottom:'15%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        position: "top",
        axisLabel: {
          show: true,
           textStyle:{
             color: '#000000',
             fontSize : 15
           }
        },
        min:function(value)
        {
            var date = new Date(value.min);
            var min = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + "1"
            return min
        },
        max:function(value)
        {
            var date = new Date(value.min);
            var days = new Date(date.getFullYear(),date.getMonth()+1, 0).getDate();
            var max=date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + days
            return max
        }
      },
      yAxis: {
        type: "category",
        data: ['Beta Test', 'Alpha Test', 'Dev.', 'Design'],
        axisLabel: {
          show: true,
           textStyle:{
             color: '#000000',
             fontSize : 15
           }
        },
      },
      tooltip: {
          trigger: 'axis',
          position:["10%","80%"],
          formatter: function(params) {
              var res=""
              var date0 = params[0].data;
              var date1 = params[1].data;
              var date2 = params[2].data;
              date0 = date0.getFullYear() + "-" + (date0.getMonth() + 1) + "-" + date0.getDate();
              date1 = date1.getFullYear() + "-" + (date1.getMonth() + 1) + "-" + date1.getDate();
              date2 = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate();
              res += " "+params[0].seriesName + ": " + date0
              res += " "+params[1].seriesName + ": " + date1
              res += " "+params[2].seriesName + ": " + date2
              console.log(params[0]);
              return res;
        }
    },
    series: [
        {
            name: 'Scheduled',
            type: 'bar',
            stack: 'overlapp',
            barGap:'-50%',
            data:[
                new Date("2021/07/31"),
                new Date("2021/07/25"),
                new Date("2021/07/15"),
                new Date("2021/07/07")
              ],
            itemStyle: {
                normal: {
                    color: '#0f0',
                    barBorderColor: '#FFFFFF',
                    barBorderWidth: 0,
                    barBorderRadius:0,
                    label:{
                      show: true,
                      position: 'top'
                    }
            }
        }
    },
        {
            name: 'Actual',
            type: 'bar',
            barCategoryGap:"0%",
            stack: 'overlap',
            data:[
                new Date("2021/07/28"),
                new Date("2021/07/20"),
                new Date("2021/07/14"),
                new Date("2021/07/05"),
            ],
          itemStyle: {
            normal: {
              color: 'rgba(153,50,204,.4)',
                      barBorderColor:'#FFFFFF',
                      barBorderWidth:0,
                      barBorderRadius:0,
                      label:
                      {
                        show: true,
                        position: 'top'
                      }
                    }
                  }
            },
        {
            name:'',
            type:'bar',
            stack:'overlap',
           
            data: [
                new Date("2021/07/25"),
                new Date("2021/07/15"),
                new Date("2021/07/07"),
                new Date("2021/07/01"),
            ],
            itemStyle: {
                normal: {
                            color: '#fff',
                            barBorderColor: '#FFFFFF',
                            barBorderWidth: 2,
                            barBorderRadius:0,
                            label : {
                            show: true,
                            position: 'top'
                    }
                }
            }
        },
        {
          name:'',
          type:'bar',
          stack:'overlapp',
         
          data: [
              new Date("2021/07/25"),
              new Date("2021/07/15"),
              new Date("2021/07/07"),
              new Date("2021/07/01"),
          ],
          itemStyle: {
              normal: {
                          color: '#fff',
                          barBorderColor: '#FFFFFF',
                          barBorderWidth: 2,
                          barBorderRadius:0,
                          label : {
                          show: true,
                          position: 'top'
                  }
              }
          }
      }
    ]
};
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