#!/bin/bash

mongod --fork --smallfiles --logpath /var/log/mongodb/mongo_init.log
mongoimport -h localhost:27017 --db verpix-dev-db --collection media --type json --file /app/data.d/media.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection follow --type json --file /app/data.d/follow.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection user --type json --file /app/data.d/user.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection userIdentity --type json --file /app/data.d/userIdentity.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection like --type json --file /app/data.d/like.json
sleep 5
kill `pidof mongod`
