# This dockerfile uses the ubuntu image

FROM ubuntu:14.04

MAINTAINER uniray7 uniray7@gmail.com

# install mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list
RUN apt-get update && apt-get install -y mongodb-org

RUN mkdir -p /data/db

ADD . /app 

RUN sh /app/push_mongo_data.sh

EXPOSE 27017

ENTRYPOINT ["/usr/bin/mongod"]
