import paho.mqtt.client as mqtt
import requests
import json
import time
import random

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
    databaseCollectionAdd("app3pub")
    global tk
    global c
    temp=dt
    params={
    "env":env,
    "query": "db.collection(\"app3pub\").add({data:"+str(temp)+"})"
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

    client.subscribe("access_token")
    client.message_callback_add("access_token",custom_callback_access_token)

def on_message(client, userdata, msg):
    print("on_message: " + msg.topic + " " + str(msg.payload, "utf-8"))

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
    count=1

    while(True):
        start=[0, 160, 67, 112, 148]
        plan=[]
        actual=[]
        for i in range(5):
            actual.append(random.randint(0,100))
            plan.append(50)
        data={"start":start,"plan":plan,"actual":actual,"version":count}
        print(data)
        databaseAdd(data)
        count+=1
        time.sleep(10)