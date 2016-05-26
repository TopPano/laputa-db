#!/bin/sh

#check if install mongodb
if which mongod
then echo "==== mongodb is installed! ===="
else
    echo "==== mongodb is not installed! ===="
    exit 0
fi


echo -n "Ready clear and insert sample data?(Y/n) "
read is_ready_insert

if [ $is_ready_insert = "Y" ]
then
    # reset mongodb
    echo -n "mongodb host: "
    read mongodb_host
    echo -n "mongodb port: "
    read mongodb_port
    echo -n "mongodb db name: "
    read mongodb_name
    echo -n "account: "
    read account
    echo -n "password: "
    read password

    # clear mongodb
    mongo --host $mongodb_host --port $mongodb_port --username $account --password $password --eval "db.post.drop();db.like.drop();db.follow.drop();db.user.drop();db.userIdentity.drop();"  $mongodb_name

    #insert sample data in mongodb
    mongoimport -h $mongodb_host:$mongodb_port -u $account -p $password -d $mongodb_name -c post --type json --file data.json.d/post.json
    mongoimport -h $mongodb_host:$mongodb_port -u $account -p $password -d $mongodb_name -c follow --type json --file data.json.d/follow.json
    mongoimport -h $mongodb_host:$mongodb_port -u $account -p $password -d $mongodb_name -c like --type json --file data.json.d/like.json
    mongoimport -h $mongodb_host:$mongodb_port -u $account -p $password -d $mongodb_name -c user --type json --file data.json.d/user.json
    mongoimport -h $mongodb_host:$mongodb_port -u $account -p $password -d $mongodb_name -c userIdentity --type json --file data.json.d/userIdentity.json
fi

