import os
import re
import socket
import subprocess

webui_mongo_config = os.environ['WEBUI_MONGO']+'/config.js'

db_name = 'verpix-dev-db'
#db_ip = os.environ['mongodb']
db_port = 27017
user = 'user'
passwd = 'pass'
webui_ip = socket.gethostbyname(socket.gethostname())

config_file = open(webui_mongo_config, 'r+')
text = config_file.read()
text = re.sub("\'db\'", "\'"+db_name+"\'", text)
text = re.sub("\'localhost\'", "process.env.mongodb", text)
text = re.sub('27017', str(db_port), text)
text = re.sub("\'admin\'", "\'"+user+"\'", text)
text = re.sub("\'pass\'", "process.env.pwd", text)

config_file.seek(0)
config_file.write(text)
config_file.close()

os.environ['VCAP_APP_HOST'] = webui_ip
setup_cmd = ['node', os.environ['WEBUI_MONGO']+'/app.js']

while True:
    p = subprocess.Popen(setup_cmd, stderr=subprocess.PIPE)
    err = p.communicate()
    print(err)
