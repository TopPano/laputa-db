#!/bin/sh

#check install node
if which node
    then echo "==== nodejs is installed! ===="
else
#if not, install node
    echo "==== start install nodejs ===="    
    curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -;
    sudo apt-get install -y nodejs;
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
#set mongod as public
sudo sed -i '/port/c\  port: 27019' /etc/mongod.conf
sudo sed -i '/bindIp/c\  bindIp: 0.0.0.0' /etc/mongod.conf
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
create_user_cmd = "db.createUser({user: '$root_username', pwd:'$root_pwd',roles:[{role:'root', db: 'admin'}]})"

create_user_cmd="$create_user_cmd db = db.getSiblingDB('$db_name'); "
create_user_cmd="$create_user_cmd db.createUser({user: '$api_username', pwd:'$api_pwd',roles:[{role:'readWrite', db: '$db_name'}]}); "

echo $create_user_cmd

mongo mongodb-a1:27019 --eval "$create_user_cmd"

#set mongod to security
sudo sed -i '/security/c\security:\n  authorization: enabled' /etc/mongod.conf

#restart mongod
sudo service mongod restart;

#git clone laputa-migrater
cd ~
git clone https://github.com/TopPano/laputa-migrator.git
