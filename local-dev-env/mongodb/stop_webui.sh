#!/bin/sh

pid=`ps aux|grep "node ./node_modules/mongo-express/app.js" | grep -v grep |awk '{print $2}'`
kill $pid
