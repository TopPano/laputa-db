#!/bin/sh

mongoimport -h 52.196.178.108:27019 -u verpix-api -p 1234 -d verpix-db -c post --type json --file post.json
