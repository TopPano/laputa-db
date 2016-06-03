#!/bin/bash

mongod &
mongoimport -h localhost:27017 --db verpix-dev-db --collection post --type json --file ~/laputa-schema/data.d/mongodb/post.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection follow --type json --file ~/laputa-schema/data.d/mongodb/follow.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection user --type json --file ~/laputa-schema/data.d/mongodb/user.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection userIdentity --type json --file ~/laputa-schema/data.d/mongodb/userIdentity.json
mongoimport -h localhost:27017 --db verpix-dev-db --collection like --type json --file ~/laputa-schema/data.d/mongodb/like.json
kill `pidof mongod`
