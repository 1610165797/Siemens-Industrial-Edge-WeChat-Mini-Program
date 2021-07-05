import paho.mqtt.client as mqtt
import requests
import json
import time

appid=''
appsecret=''
env=''
tk=""
count=0


def getOpenid():
    global tk
    params={
        
    "env":env,
    "query": "db.collection(\"subscribers\").where({"+"pending:true}).get()",
    }
    url="https://api.weixin.qq.com/tcb/databasequery?access_token={}".format(tk)
    response = requests.post(url,{},params)
    if response.status_code == 200:
        data = response.json()
        display=json.dumps(data)
        print(data["data"])
        print(type(data["data"]))
        for i in data["data"]:
            re=json.loads(i)
            print(re["openid"])
            sendSubscribeMessage(re["openid"])
        return display
    else:
        print('error: got response code %d' % response.status_code)
        print(response.text)

def updateStatus(dt):
    global tk
    params={
    "env":env,
    "query": "db.collection(\"subscribers\").where({"+"openid:\""+dt+"\"}).update({ data:{pending:false}})",
    }
    url="https://api.weixin.qq.com/tcb/databaseupdate?access_token={}".format(tk)
    response = requests.post(url,{},params)
    if response.status_code == 200:
        data = response.json()
        display=json.dumps(data)
        print(display)
        return display
    else:
        print('error: got response code %d' % response.status_code)
        print(response.text)

def sendSubscribeMessage(dt):
    global tk
    global count
    params={
    "env":env,
    "template_id":"",
    "touser":dt,
    "page":"pages/subscribe/subscribe",
    "miniprogram_state":"trial",
    "lang":"en_US",
    "data":{
        "thing1":{
            "value":"Production Suspended"
        },
        "thing2":{
            "value":"High Vibration"
        },
         "thing3":{
            "value":count
    }
    }
    }
    url="https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token={}".format(tk)
    response = requests.post(url,{},params)
    if response.status_code == 200:
        data = response.json()
        display=json.dumps(data)
        print(display)
        return display
    else:
        print('error: got response code %d' % response.status_code)
        print(response.text)

def on_connect(client, userdata, flags, rc):
	print("Connected to server (i.e., broker) with result code "+str(rc))
	client.subscribe("access_token")
	client.message_callback_add("access_token",custom_callback_access_token)

def on_message(client, userdata, msg):
    print("on_message: " + msg.topic + " " + str(msg.payload, "utf-8"))


def custom_callback_access_token(client, userdata, msg):
	data=str(msg.payload,"utf-8")
	print("custom_callback_access_token: " + msg.topic)
	global tk
	tk=data




if __name__ == '__main__':
	client = mqtt.Client()
	client.on_message = on_message
	client.on_connect = on_connect
	client.connect(host="localhost", port=1883, keepalive=60)
	client.loop_start()
	count=0

	while(True):
		count+=5
		time.sleep(10)
		if((count%10)==0):
			getOpenid()