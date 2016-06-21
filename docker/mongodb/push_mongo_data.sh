#!/bin/bash

mongod --fork --logpath /var/log/mongodb/mongo_init.log
mongoimport -h localhost:27017 --db verpix-dev-db --collection post --type json --file /app/data.d/mongodb/post.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection follow --type json --file /app/data.d/mongodb/follow.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection user --type json --file /app/data.d/mongodb/user.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection userIdentity --type json --file /app/data.d/mongodb/userIdentity.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection like --type json --file /app/data.d/mongodb/like.json
sleep 5
kill `pidof mongod`
