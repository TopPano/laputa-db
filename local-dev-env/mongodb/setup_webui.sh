#!/bin/sh

echo -n "setup mogodb WebUI? (Y/n) "
read is_setup_webui
if [ $is_setup_webui = "Y" ]
then
    npm install mongo-express

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

    cp node_modules/mongo-express/config.default.js node_modules/mongo-express/config.js
    sed -i 's/'\''db'\''/'\'''"$mongodb_name"''\''/g' node_modules/mongo-express/config.js
    sed -i 's/'\''localhost'\''/'\'''"$mongodb_host"''\''/g' node_modules/mongo-express/config.js
    sed -i 's/'\''pass'\''/'\'''"$password"''\''/g' node_modules/mongo-express/config.js
    sed -i 's/27017/'"$mongodb_port"'/g' node_modules/mongo-express/config.js
    sed -i 's/'\''admin'\''/'\'''"$account"''\''/g' node_modules/mongo-express/config.js
    node ./node_modules/mongo-express/app.js >> webui.log &
    echo "connect WebUI: http://$mongodb_host:8081, username and password are as your set"
fi
