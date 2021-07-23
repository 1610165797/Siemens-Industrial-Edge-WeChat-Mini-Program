// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var storage=[]
  var left=event.start
  var right=event.start
  var sum=0
  var count=0
  for(var i in event.list)
  {
    right=event.list[i].time
    if((right-left)>1000000000)
    {
      var t= {
        time:(left+500000000),
        value:sum/count
      }
      console.log(t)
      left=event.list[i].time
        storage.push(t)
      sum=event.list[i].value
      count=1
    }
    else
    {
      count+=1
      sum+=event.list[i].value
    }
  }

  console.log(storage)
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    storage:storage
  }
}