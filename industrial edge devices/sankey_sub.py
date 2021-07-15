import paho.mqtt.client as mqtt
import requests
import json
import time

#variable initializations
appid='wx695e6e3500358a03'
appsecret='eee49a96acc0968fd3dcc4c9ea433eaf'
env='siemens-3g29njpzec51b925'
tk=""
c=0


#add a new collection 
def databaseCollectionAdd(name):
	global tk
	params={
	"env":env,
	"collection_name":name
	}
	url="https://api.weixin.qq.com/tcb/databasecollectionadd?access_token={}".format(tk)
	response = requests.post(url,{},params)
	if response.status_code == 200:
		data = response.json()
		display=json.dumps(data)
		print(display)
		return display
	else:
		print('error: got response code %d' % response.status_code)
		print(response.text)

def databaseAdd(dt):
	print(dt)
	databaseCollectionAdd("app2pub")
	global tk
	global c
	temp=dt
	params={
	"env":env,
	"query": "db.collection(\"app2pub\").add({data:"+str(temp)+"})"
	}
	url="https://api.weixin.qq.com/tcb/databaseadd?access_token={}".format(tk)
	response = requests.post(url,{},params)
	if response.status_code == 200:
		data = response.json()
		display=json.dumps(data)
		print(display)
		return display
	else:
		print('error: got response code %d' % response.status_code)
		print(response.text)


#on connect callback
def on_connect(client, userdata, flags, rc):
    print("Connected to server (i.e., broker) with result code "+str(rc))
    client.subscribe("app2pub")
    client.message_callback_add("app2pub",custom_callback_app2pub)
    client.subscribe("access_token")
    client.message_callback_add("access_token",custom_callback_access_token)

def on_message(client, userdata, msg):
    print("on_message: " + msg.topic + " " + str(msg.payload, "utf-8"))

def custom_callback_app2pub(client, userdata, msg):
	data=str(msg.payload,"utf-8")
	print("custom_callback_app2pub: " + msg.topic)
	databaseAdd(data)

def custom_callback_access_token(client, userdata, msg):
	data=str(msg.payload,"utf-8")
	print("custom_callback_access_token: " + msg.topic)
	global tk
	tk=data

#main
if __name__ == '__main__':
	client = mqtt.Client()
	client.on_message = on_message
	client.on_connect = on_connect
	client.connect(host="localhost", port=1883, keepalive=60)
	client.loop_start()

	while(True):
		time.sleep(0.1)