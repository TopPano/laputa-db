#!/bin/bash

mongod &
mongoimport -h localhost:27017 --db verpix-dev-db --collection post --type json --file ~/laputa-schema/data.d/post.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection follow --type json --file ~/laputa-schema/data.d/follow.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection user --type json --file ~/laputa-schema/data.d/user.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection userIdentity --type json --file ~/laputa-schema/data.d/userIdentity.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection like --type json --file ~/laputa-schema/data.d/like.json
kill `pidof mongod`
