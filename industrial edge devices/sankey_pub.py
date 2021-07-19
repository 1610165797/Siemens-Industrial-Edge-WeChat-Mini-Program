import paho.mqtt.client as mqtt
import requests
import random
import time
import json
from datetime import datetime
from datetime import date
from datetime import timezone 
import pytz

count=0
dt=[]
frequency=10

def on_connect(client, userdata, flags, rc):
    print("Connected to server (i.e., broker) with result code "+str(rc))
    client.subscribe("received")
    client.message_callback_add("app2pub",custom_callback_app2pub)

#Default message callback.
def on_message(client, userdata, msg):
    print("on_message: " + msg.topic + " " + str(msg.payload, "utf-8"))


def custom_callback_app2pub(client, userdata, msg):
    data=str(msg.payload, "utf-8")
    print("custom_callback_app2pub: " + msg.topic)
    if(data=="True"):
        global dt
        while(dt=={}):
            pass
        display=json.dumps(dt)
        client.publish("app2pub",display)
        print(dt)
        dt=[]

if __name__ == '__main__':
    client = mqtt.Client()
    client.on_message = on_message
    client.on_connect = on_connect
    client.connect(host="localhost", port=1883, keepalive=60)
    client.loop_start()

    list=[{
            "source": "Nuclear",
            "target": "Thermal",
            "value": 5
        }, {
            "source": "Nuclear",
            "target": "Industry",
            "value": 3
        }, {
            "source": "Wind",
            "target": "Electric Grid",
            "value": 8
        }, {
            "source": "Nuclear",
            "target": "Electric Grid",
            "value": 3
        }, {
            "source": "Wind",
            "target": "Thermal",
            "value": 1
        }, {
            "source": "Electric Grid",
            "target": "Losses",
            "value": 2
        },
        {
            "source": "Electric Grid",
            "target": "Mining",
            "value": 4
        },
        {
            "source": "Nuclear",
            "target": "Civil",
            "value": 5
        },
        {
            "source": "Civil",
            "target": "Loss",
            "value": 1
        },{
            "source": "Nuclear",
            "target": "Lighting",
            "value": 4
        },{
            "source": "Lighting",
            "target": "Heat",
            "value": 2
        },{
            "source": "Wind",
            "target": "Heat",
            "value": 3
        }]


    start=date.today()
    t=int (datetime(2021,7,15,0,0).timestamp())
    while True:
        t=t+3600*24
        print(list)
        pos=int(random.uniform(0,len(list)))
        list[pos]["value"]=int (random.uniform(0,10))
        temp={}
        temp["time"]=t
        temp["value"]=list
        print(temp)
        client.publish("app2pub",str(temp))
        time.sleep(10)