import paho.mqtt.client as mqtt
import requests
import random
import time
import json
import math
from scipy import signal

count=0
dt=[]
frequency=10

def on_connect(client, userdata, flags, rc):
    print("Connected to server (i.e., broker) with result code "+str(rc))
    client.subscribe("app1sub")
    client.message_callback_add("app1sub",custom_callback_app1sub)

def on_message(client, userdata, msg):
    print("on_message: " + msg.topic + " " + str(msg.payload, "utf-8"))

def custom_callback_app1sub(client, userdata, msg):
    data=str(msg.payload, "utf-8")
    print("custom_callback_app1pub: " + msg.topic)
    if(data=="True"):
        global dt
        while(dt=={}):
            pass
        display=json.dumps(dt)
        client.publish("app1pub",display)
        print(dt)
        dt=[]

if __name__ == '__main__':
    client = mqtt.Client()
    client.on_message = on_message
    client.on_connect = on_connect
    client.connect(host="localhost", port=1883, keepalive=60)
    client.loop_start()

    while True:
        imp = signal.unit_impulse(10, int(random.uniform(0,9)))
        b, a = signal.butter(2, random.uniform(0,1))
        response = 10*signal.lfilter(b, a, imp)
        for i in response:
            t=time.time_ns()
            temp={}
            temp["time"]=t
            temp["value"]=i
            count+=1
            dt.append(temp)
            time.sleep(1/frequency)