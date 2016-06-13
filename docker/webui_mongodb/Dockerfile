# This dockerfile uses the ubuntu image

FROM ubuntu:14.04

MAINTAINER uniray7 uniray7@gmail.com

# install nodejs
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential

# install mongo-express
RUN npm install mongo-express
RUN cp /node_modules/mongo-express/config.default.js /node_modules/mongo-express/config.js

EXPOSE 8081
ENV WEBUI_MONGO /node_modules/mongo-express

ADD . /app
CMD python3 /app/setup.py
