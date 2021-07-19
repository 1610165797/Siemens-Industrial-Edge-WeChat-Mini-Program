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
def get_access_token():
	global tk
	params={
	'APPID':appid,
	'APPSECRET':appsecret
	}
	response = requests.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={}&secret={}'.format(appid,appsecret),params)
	if response.status_code == 200:
		data = response.json()
		display=json.dumps(data["access_token"])
		display=display[1:len(display)-1]
		tk=display
		print("access_token retrieved")
		databaseCollectionDelete("app1pub")
		databaseCollectionDelete("app2pub")
		databaseCollectionDelete("app3pub")
		return display
	else:	
		print('error: got response code %d' % response.status_code)
		print(response.text)
		return None

def databaseCollectionDelete(name):
    global tk
    params={
    "env":env,
    "collection_name":name
    }
    url="https://api.weixin.qq.com/tcb/databasecollectiondelete?access_token={}".format(tk)
    response = requests.post(url,{},params)
    if response.status_code == 200:
        data = response.json()
        display=json.dumps(data)
        print(display)
        return display
    else:
        print('error: got response code %d' % response.status_code)
        print(response.text)



#main
if __name__ == '__main__':
    get_access_token()

