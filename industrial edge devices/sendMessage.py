import paho.mqtt.client as mqtt
import requests
import json
import time

appid='wx695e6e3500358a03'
appsecret='eee49a96acc0968fd3dcc4c9ea433eaf'
env='siemens-3g29njpzec51b925'
tk=""
count=0


message_lib={
"Fire Alarm":{
        "thing1":{
            "value":"Fire Alarm"
        },
        "thing2":{
            "value":"Check Smoke Detector"
        },
         "thing3":{
            "value":count
            }
        },
"Production Suspension":{
        "thing1":{
            "value":"Production Suspended"
        },
        "thing2":{
            "value":"Human Error"
        },
         "thing3":{
            "value":count
            }
        },
"Security Breach":{
        "thing1":{
            "value":"Security Breach"
        },
        "thing2":{
            "value":"Check CCTV Record"
        },
         "thing3":{
            "value":count
            }
        },
"High Friction":{
        "thing1":{
            "value":"High Friction"
        },
        "thing2":{
            "value":"Refill Engine Oil"
        },
         "thing3":{
            "value":count
            }
        },
"Low Engine Oil":{
        "thing1":{
            "value":"Low Engine Oil"
        },
        "thing2":{
            "value":"Refill Engine Oil"
        },
         "thing3":{
            "value":count
            }
        },
"High Humidity":{
        "thing1":{
            "value":"High Humidity"
        },
        "thing2":{
            "value":"Increase Ventilation"
        },
         "thing3":{
            "value":count
            }
        },
"Anamolous Vibration":{
        "thing1":{
            "value":"Anamolous Vibration"
        },
        "thing2":{
            "value":"Reset Offset"
        },
         "thing3":{
            "value":count
            }
        },
"Low Thrust":{
        "thing1":{
            "value":"Low Thrust"
        },
        "thing2":{
            "value":"Increase Power"
        },
         "thing3":{
            "value":count
            }
        },
"Low Battery":{
        "thing1":{
            "value":"Low Battery"
        },
        "thing2":{
            "value":"Charge Battery"
        },
         "thing3":{
            "value":count
            }
        },
"Temperature High":{
        "thing1":{
            "value":"Temperature High"
        },
        "thing2":{
            "value":"Increase Passive Radiation Area"
        },
         "thing3":{
            "value":count
            }
        }
}


def getOpenid():
    global tk
    if tk=="":
            return None
    params={
    "env":env,
    "query": "db.collection(\"users\").get()",
    }
    url="https://api.weixin.qq.com/tcb/databasequery?access_token={}".format(tk)
    response = requests.post(url,{},params)
    if response.status_code == 200:
        data = response.json()
        display=json.dumps(data)
        for i in data["data"]:
            re=json.loads(i)
            id=re["_openid"]
            for j in re["sub"]:
                if(j["state"]==True):
                    topic=j["name"]
                    sendSubscribeMessage(id,topic)
        return display
    else:
        print('error: got response code %d' % response.status_code)
        print(response.text)


def sendSubscribeMessage(dt,topic):
    print(dt,topic)
    global tk
    global count
    params={
    "env":env,
    "template_id":"I_2lT2DRyjtJ1EjeM5SN81bd3DBMV2EHdpHutsrPrps",
    "touser":dt,
    "page":"pages/subscribe/subscribe",
    "miniprogram_state":"trial",
    "lang":"en_US",
    "data":message_lib[topic]
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
		if((count%5)==0):
			getOpenid()