#!/bin/sh

#check install node
if which node
    then echo "==== nodejs is installed! ===="
else
#if not, install node
    echo "==== start install nodejs ===="    
    curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -;
    sudo apt-get install -y nodejs;
    sudo apt-get install -y build-essential

    echo "==== finish install nodejs ===="    
fi


#check if install mongodb
if which mongod
    then echo "==== nodejs is installed! ===="
else
#if not, install mongodb
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10;
    echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list;
    sudo apt-get update;
    sudo apt-get install -y mongodb-org
fi

#config mongodb
mongodb_ip=`ifconfig | awk -F':' '/inet addr/&&!/127.0.0.1/{split($2,_," ");print _[1]}'`
echo -n "set mongodb port(default=27019): "
read mongodb_port

if [ -z "$mongodb_port"]; then
    mongodb_port=27019
fi


#set mongod as public
sudo sed -i '/port/c\  port: '"$mongodb_port"'' /etc/mongod.conf
sudo sed -i '/bindIp/c\  bindIp: '"$mongodb_ip"'' /etc/mongod.conf
#restart mongod
sudo service mongod restart

#add mongod root user:
echo -n "add mongo root user: "
read root_username
echo -n "set password: "
read root_pwd

#set db name
echo -n "set db name: "
read db_name

#add mongod api: 
echo -n "add mongo api user: "
read api_username
echo -n "set password: "
read api_pwd

create_user_cmd="db = db.getSiblingDB('admin'); "
create_user_cmd="$create_user_cmd db.createUser({user: '$root_username', pwd:'$root_pwd',roles:[{role:'root', db: 'admin'}]}); "

create_user_cmd="$create_user_cmd db = db.getSiblingDB('$db_name'); "
create_user_cmd="$create_user_cmd db.createUser({user: '$api_username', pwd:'$api_pwd',roles:[{role:'readWrite', db: '$db_name'}]}); "

echo $create_user_cmd

ip="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"

mongo $ip:27019 --eval "$create_user_cmd"

#set mongod to security
sudo sed -i '/security/c\security:\n  authorization: enabled' /etc/mongod.conf

#restart mongod
sudo service mongod restart;


echo -n "Ready insert sample data?(Y/n) "
read is_ready_insert

if [ $is_ready_insert = "Y" ]
then
    #insert sample data in mongodb
    mongoimport -h $mongodb_ip:$mongodb_port -u $api_username -p $api_pwd -d $db_name -c post --type json --file data.json.d/mongo.data/post.json
    mongoimport -h $mongodb_ip:$mongodb_port -u $api_username -p $api_pwd -d $db_name -c follow --type json --file data.json.d/mongo.data/follow.json
    mongoimport -h $mongodb_ip:$mongodb_port -u $api_username -p $api_pwd -d $db_name -c like --type json --file data.json.d/mongo.data/like.json
    mongoimport -h $mongodb_ip:$mongodb_port -u $api_username -p $api_pwd -d $db_name -c user --type json --file data.json.d/mongo.data/user.json
    mongoimport -h $mongodb_ip:$mongodb_port -u $api_username -p $api_pwd -d $db_name -c userIdentity --type json --file data.json.d/mongo.data/userIdentity.json
fi

public_ip=`curl http://169.254.169.254/latest/meta-data/public-ipv4`

echo -n "setup mogodb WebUI? (Y/n) "
read is_setup_webui
if [ $is_setup_webui = "Y" ]
then
    npm install mongo-express
    cp node_modules/mongo-express/config.default.js node_modules/mongo-express/config.js 
    sed -i 's/'\''db'\''/'\'''"$db_name"''\''/g' node_modules/mongo-express/config.js
    sed -i 's/'\''localhost'\''/'\'''"$mongodb_ip"''\''/g' node_modules/mongo-express/config.js
    sed -i 's/'\''pass'\''/'\'''"$api_pwd"''\''/g' node_modules/mongo-express/config.js
    sed -i 's/27017/'"$mongodb_port"'/g' node_modules/mongo-express/config.js
    sed -i 's/'\''admin'\''/'\'''"$api_username"''\''/g' node_modules/mongo-express/config.js
    node node_modules/mongo-express/app.js &
    echo "connect WebUI: http://$public_ip:8081, username and password are as your set"
fi
echo "connect mongodb://$public_ip:$mongodb_port"


