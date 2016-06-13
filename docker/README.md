# laputa-db docker setup

### Build mongodb image:
* If you want only build mongodb image:
```sh
cd laputa-db/docker/mongodb
docker build -t verpix-dev/mongodb .
```

### Setup the whole db system(mongodb & mongo-express):
* If you want to run mongodb and mongodb webui:
```sh
cd laputa-db/docker
docker-compose up
```

* If you want run the system in daemon
```sh
cd laputa-db/docker
docker-compose up -d
```

* Look out the logs of each service(verpix-dev-webui-mongodb or verpix-dev-mongodb)
```sh
cd laputa-db/docker
docker-compose logs verpix-dev-webui-mongodb
docker-compose logs verpix-dev-mongodb
```

* Stop the system
```sh
cd laputa-db/docker
docker-compose stop
```
