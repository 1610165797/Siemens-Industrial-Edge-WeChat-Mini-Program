import paho.mqtt.client as mqtt
import requests
import json
import time

#variable initialization
appid='wx695e6e3500358a03'
appsecret='eee49a96acc0968fd3dcc4c9ea433eaf'
env='siemens-3g29njpzec51b925'
tk=""
c=0

#getting the access_token
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
		client.publish("access_token",tk)
		print("access_token retrieved")
		return display
	else:	
		print('error: got response code %d' % response.status_code)
		print(response.text)
		return None

#pushing the data into the cloud database
def import_collection(file_path):
	global tk
	params={
	"env":env,
	"collection_name":file_path, 
	"file_path":file_path+".json",
	"file_type":1,
	"stop_on_error":False,
	"conflict_mode":2
	}
	url="https://api.weixin.qq.com/tcb/databasemigrateimport?access_token={}".format(tk)
	response = requests.post(url,{},params)
	if response.status_code == 200:
		data = response.json()
		display=json.dumps(data)
		print("data pushed to collection "+params["collection_name"])
		return display
	else:
		print('error: got response code %d' % response.status_code)
		print(response.text)
		return None

#initial request of upload files
def upload_request(path):
	global tk
	params={
	'env':env,
	'path':path+".json"
	}
	url="https://api.weixin.qq.com/tcb/uploadfile?access_token={}".format(tk)
	response = requests.post(url,{},params)
	if response.status_code == 200:
		data = response.json()
		display=json.dumps(data)
		print("upload request return data retrieved")
		return json.loads(display)
	else:
		print('error: got response code %d' % response.status_code)
		print(response.text)

#uploading the files to cloud storage
def upload_file(dic,key,dt):
	global tk
	params={
	'key':key+".json",
	'Signature':dic["authorization"],
	'x-cos-security-token':dic["token"],
	'x-cos-meta-fileid':dic["cos_file_id"],
	'file':bytes(dt,"utf-8")
	}
	response = requests.post(dic["url"],files=params)
	if response.status_code == 204:
		print("data uploaded")
	else:
		print('error: got response code %d' % response.status_code)
		print(response)
		print(response.text)

#obtain info about cloud database
def get_database():
	global tk
	params={
	'env':env
	}
	url="https://api.weixin.qq.com/tcb/databasecollectionget?access_token={}".format(tk)
	response = requests.post(url,{},params)
	if response.status_code == 200:
		data = response.json()
		display=json.dumps(data)
		print(display)
		return display
	else:
		print('error: got response code %d' % response.status_code)
		print(response.text)

#encapsulated method of pushing database to cloud
def push_data(dt):
	for i in os.listdir():
		if(i[-5:]==".json"):
			print("sending \'"+i+"\'")
			upload_file(upload_request(i),i,dt)
			import_collection(i)

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
	databaseCollectionAdd("app1pub")
	global tk
	global c
	temp=json.loads(dt)
	params={
	"env":env,
	"query": "db.collection(\"app1pub\").add({data:"+str(temp)+"})"
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

def databaseUpdate(dt):
	databaseCollectionAdd("app1pub")
	global tk
	global c
	params={
	"env":env,
	"query": "db.collection(\"app1pub\").where({"+"_id:0}).update({data:_.push("+str(dt)+")})",
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

#on connect callback
def on_connect(client, userdata, flags, rc):
    print("Connected to server (i.e., broker) with result code "+str(rc))
    client.subscribe("app1pub")
    client.message_callback_add("app1pub",custom_callback_app1pub)

def on_message(client, userdata, msg):
    print("on_message: " + msg.topic + " " + str(msg.payload, "utf-8"))

def custom_callback_app1pub(client, userdata, msg):
	data=str(msg.payload,"utf-8")
	print("custom_callback_app1pub: " + msg.topic)
	time.sleep(10)
	databaseAdd(str({}))
	databaseAdd(data)
	client.publish("app1sub","True")


#main
if __name__ == '__main__':
	client = mqtt.Client()
	client.on_message = on_message
	client.on_connect = on_connect
	client.connect(host="localhost", port=1883, keepalive=60)
	client.loop_start()
	count=99999

	client.publish("app1sub","True")
	while(True):
		if(count)>1440:
			count=0
			get_access_token()
		count+=5
		time.sleep(5)