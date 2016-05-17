var targetMongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');

var config = require('./config');

var AwsCli = require('aws-cli-js');


var migrateBySchema = function(target_DB, schema, target_S3_conf, callback){
    var cursor, coll;
    var url, insert_key, cmd, newUrl, key, set, mongoUpdate, migrateTask;
    var srcS3Uri, destS3Uri;
    coll = target_DB.collection(schema.coll);
    cursor = coll.find();
    cursor.each(function(err, doc){
        assert.equal(err, null);
                if (doc != null) {
                    
                    if(doc[schema.key] !== undefined){
                        key = schema.key;
                        url = doc[key];
                        insert_key = doc[schema.key].replace("https://verpix-img-production.s3.amazonaws.com/", "");
                        insert_key = insert_key.replace(/%2B/g, "+");
                        insert_key = insert_key.replace(/%2F/g, "/");
                        insert_key = insert_key.replace(/%3D/g, "=");
                        cmd = "s3 cp --acl public-read ";
                        srcS3Uri = "s3://"+target_S3_conf.src_bucket+"/"+insert_key;
                        destS3Uri = "s3://"+target_S3_conf.dest_bucket+"/"+insert_key;
                        cmd += srcS3Uri;
                        cmd += " ";
                        cmd += destS3Uri;
                        newUrl = url.replace(target_S3_conf.src_bucket, target_S3_conf.dest_bucket);
                        
                        migrateTask = {};
                        mongoUpdate = {};
                        set = {};
                        
                        set[key] = newUrl;
                        mongoUpdate.coll = coll;
                        mongoUpdate.filter = {_id: doc._id};
                        mongoUpdate.set = set;
                        
                        migrateTask.cmd = cmd;
                        migrateTask.mongoUpdate = mongoUpdate;

                        migrate_queue.push(migrateTask, 
                                           function(){console.log("finish "+cmd+"\n")});
                    }
                } 
                else {
                    callback();        
                }
    });

};


function connectToMongo(mongoClient, url, username, password, callback){
    mongoClient.connect(url, 
         function(err, db){
               assert.equal(null, err);
               db.authenticate(username, password, 
                    function(err, res){
                        assert.equal(null, err);
                        console.log(url+" connect!");
                        callback(null, db);
                    });
    });
}

var connectAndMigrateS3 = function(target_DB_conf, target_schemas, target_S3_conf){
    async.parallel([
        async.apply(connectToMongo,
                targetMongoClient, 
                target_DB_conf.url, 
                target_DB_conf.username,
                target_DB_conf.passwd)
        ],
        function(err, dbs){
             var target_DB = dbs[0];
            
             async.eachSeries(target_schemas,
                       function(schema, callback){
                            console.log(schema); 
                            migrateBySchema(target_DB, schema, target_S3_conf, callback);
                       },

                       function(err){
                             migrate_queue.drain = function(){
                                 console.log("finish migrate");
                                 target_DB.close();
                             }
                       });
        });                
};


var target_DB_conf = config.S3_migration_config.target_DB;
var target_S3 = config.S3_migration_config.target_S3;
var target_schemas = config.S3_migration_config.target_schemas;

var awsCli = new AwsCli();
var migrate_queue = async.queue(
    function(task ,callback){
        //console.log(task.cmd);
        awsCli.command(task.cmd).
             then(function (data) {
                    var mongoUpdate = task.mongoUpdate;
                    console.log('data = ', data);
                   console.log(mongoUpdate); 
                    mongoUpdate.coll.findOneAndUpdate(mongoUpdate.filter, 
                                                       {$set: mongoUpdate.set},
                                                      function(err, r){
                                                        assert.equal(null, err);
                                                        console.log(r);
                                                        callback();
                                                      });
             });
},15);

connectAndMigrateS3(target_DB_conf, target_schemas, target_S3);

