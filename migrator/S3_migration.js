var targetMongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');

var config = require('./config');

var AwsCli = require('aws-cli-js');


var migrateUserBucket = function(target_db, s3_conf){
    var user_cursor, user_coll;
    var url, insert_key, cmd, newUrl, set, mongoUpdate, migratetask;
    var srcs3uri, dests3uri;

    user_coll = target_db.collection('user');
    user_cursor = user_coll.find();

    user_cursor.each(
            function(err, doc){
                assert.equal(err, null);
                if (doc != null && doc.profilePhotoUrl != undefined) {
                    url = doc.profilePhotoUrl;
                    insert_key = url.replace("https://verpix-img-production.s3.amazonaws.com/", ""); 

                    cmd = "s3 cp --acl public-read ";
                    srcs3uri = "s3://"+s3_conf.src_bucket+"/"+insert_key;
                    dests3uri = "s3://"+s3_conf.dest_bucket+"/"+insert_key;
                    cmd += srcs3uri;
                    cmd += " ";
                    cmd += dests3uri;
                    newUrl = url.replace(s3_conf.src_bucket, s3_conf.dest_bucket);
                    
                    migratetask = {};
                    mongoUpdate = {};
                    set = {};

                    set.profilePhotoUrl = newUrl;
                    mongoUpdate.coll = user_coll;
                    mongoUpdate.filter = {_id: doc._id};
                    mongoUpdate.set = set;

                    migratetask.cmd = cmd;
                    migratetask.mongoUpdate = mongoUpdate;
                     
                    // ==============================================     
                    migrate_queue.push(migratetask, 
                        function(){console.log("finish "+cmd+"\n")});
                    // ==============================================     
                }
            });

};


var migratePostBucket = function(target_db, s3_conf){
    var post_cursor, post_coll;
    var url, insert_key, cmd, newUrl, set, tileObj, mongoUpdate, migratetask;
    var srcs3uri, dests3uri;

    post_coll = target_db.collection('post');
    post_cursor = post_coll.find();

    post_cursor.each(
            function(err, doc){
                assert.equal(err, null);
                if (doc != null) {
                    url = doc.thumbnail.srcUrl;
                    insert_key = url.replace("https://verpix-img-production.s3.amazonaws.com/", ""); 
                    
                    cmd = "s3 cp --acl public-read ";
                    srcs3uri = "s3://"+s3_conf.src_bucket+"/"+insert_key;
                    dests3uri = "s3://"+s3_conf.dest_bucket+"/"+insert_key;
                    cmd += srcs3uri;
                    cmd += " ";
                    cmd += dests3uri;
                    newUrl = url.replace(s3_conf.src_bucket, s3_conf.dest_bucket);
                    
                    migratetask = {};
                    mongoUpdate = {};
                    set = {};

                    set.thumbnail = {};
                    set.thumbnail.srcUrl = newUrl;
                    set.thumbnail.downloadUrl = newUrl;
                    mongoUpdate.coll = post_coll;
                    mongoUpdate.filter = {_id: doc._id};
                    mongoUpdate.set = set;

                    migratetask.cmd = cmd;
                    migratetask.mongoUpdate = mongoUpdate;
                    
                    // ==============================================     
                    migrate_queue.push(migratetask, 
                        function(){console.log("finish "+cmd+"\n")});
                    // ==============================================    



                    mongoUpdate = {};
                    mongoUpdate.coll = post_coll;
                    mongoUpdate.filter = {_id: doc._id};
                    set = {};
                    mongoUpdate.set = set;
                    set.media = {}
                    
                    // media.srcUrl and srcDownloadUrl
                    url = doc.media.srcUrl;
                    insert_key = url.replace("https://verpix-img-production.s3.amazonaws.com/", ""); 
                    
                    cmd = "s3 cp --acl public-read ";
                    srcs3uri = "s3://"+s3_conf.src_bucket+"/"+insert_key;
                    dests3uri = "s3://"+s3_conf.dest_bucket+"/"+insert_key;
                    cmd += srcs3uri;
                    cmd += " ";
                    cmd += dests3uri;
                    newUrl = url.replace(s3_conf.src_bucket, s3_conf.dest_bucket);
                    
                    set.media.srcUrl = newUrl;
                    set.media.srcDownloadUrl = newUrl;

                    migratetask = {};
                    migratetask.cmd = cmd;
                    
                    // ==============================================     
                    migrate_queue.push(migratetask, 
                        function(){console.log("finish "+cmd+"\n")});
                    // ==============================================    



                    // media.srcMobileUrl and srcMobileDownloadUrl
                    url = doc.media.srcMobileUrl;
                    insert_key = url.replace("https://verpix-img-production.s3.amazonaws.com/", ""); 
                    
                    cmd = "s3 cp --acl public-read ";
                    srcs3uri = "s3://"+s3_conf.src_bucket+"/"+insert_key;
                    dests3uri = "s3://"+s3_conf.dest_bucket+"/"+insert_key;
                    cmd += srcs3uri;
                    cmd += " ";
                    cmd += dests3uri;
                    newUrl = url.replace(s3_conf.src_bucket, s3_conf.dest_bucket);
                    
                    set.media.srcMobileUrl = newUrl;
                    set.media.srcMobileDownloadUrl = newUrl;

                    migratetask = {};
                    migratetask.cmd = cmd;
                    
                    // ==============================================     
                    migrate_queue.push(migratetask, 
                        function(){console.log("finish "+cmd+"\n")});
                    // ==============================================    



                    // media.srcTiledImages
                    set.media.srcTiledImages = [];
                    for(var i=0; i<doc.media.srcTiledImages.length; i++)
                    {
                          url = doc.media.srcTiledImages[i].srcUrl;
                          insert_key = url.replace("https://verpix-img-production.s3.amazonaws.com/", ""); 

                          cmd = "s3 cp --acl public-read ";
                          srcs3uri = "s3://"+s3_conf.src_bucket+"/"+insert_key;
                          dests3uri = "s3://"+s3_conf.dest_bucket+"/"+insert_key;
                          cmd += srcs3uri;
                          cmd += " ";
                          cmd += dests3uri;
                          newUrl = url.replace(s3_conf.src_bucket, s3_conf.dest_bucket);

                          migratetask = {};
                          tileObj = {};
                          tileObj.srcUrl = newUrl;
                          tileObj.downLoadUrl = newUrl;

                          set.media.srcTiledImages.push(tileObj);
                          
                          migratetask.cmd = cmd;

                          // ==============================================     
                          migrate_queue.push(migratetask, 
                                  function(){console.log("finish "+cmd+"\n")});
                          // ==============================================    
                    }

                    set.media.srcMobileTiledImages = [];
                    for(var i=0; i<doc.media.srcMobileTiledImages.length; i++)
                    {
                          url = doc.media.srcMobileTiledImages[i].srcUrl;
                          insert_key = url.replace("https://verpix-img-production.s3.amazonaws.com/", ""); 

                          cmd = "s3 cp --acl public-read ";
                          srcs3uri = "s3://"+s3_conf.src_bucket+"/"+insert_key;
                          dests3uri = "s3://"+s3_conf.dest_bucket+"/"+insert_key;
                          cmd += srcs3uri;
                          cmd += " ";
                          cmd += dests3uri;
                          newUrl = url.replace(s3_conf.src_bucket, s3_conf.dest_bucket);

                          migratetask = {};
                          tileObj = {};
                          tileObj.srcUrl = newUrl;
                          tileObj.downLoadUrl = newUrl;

                          set.media.srcMobileTiledImages.push(tileObj);
                          
                          migratetask.cmd = cmd;

                          // ==============================================     
                          migrate_queue.push(migratetask, 
                                  function(){console.log("finish "+cmd+"\n")});
                          // ==============================================    

                    }

                    migratetask = {};
                    migratetask.mongoUpdate = mongoUpdate;

                    mongoUpdate.coll = post_coll;
                    mongoUpdate.filter = {_id: doc._id};
                    mongoUpdate.set = set;
                    // ==============================================     
                    migrate_queue.push(migratetask, 
                            function(){console.log("finish "+cmd+"\n")});
                    // ==============================================    

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

var connectAndMigrateS3 = function(DB_conf, S3_conf){
    async.parallel([
        async.apply(connectToMongo,
                targetMongoClient, 
                DB_conf.url, 
                DB_conf.username,
                DB_conf.passwd)
        ],
        function(err, dbs){
             var DB = dbs[0];
             migrateUserBucket(DB, S3_conf);
             migratePostBucket(DB, S3_conf);
             
             migrate_queue.drain = function(){
                 console.log("finish migrate");
                 DB.close();
             }
       });
};                


var DB_conf = config.S3_migration_config.target_DB;
var S3_conf = config.S3_migration_config.target_S3;

var awsCli = new AwsCli();
var migrate_queue = async.queue(
    function(task ,callback){
        console.log(task.cmd);
        console.log(task.mongoUpdate);
            if(task.cmd != undefined && task.mongoUpdate != undefined)
            {
                awsCli.command(task.cmd).
                then(function (data) {
                        var mongoUpdate = task.mongoUpdate;
                        mongoUpdate.coll.findOneAndUpdate(mongoUpdate.filter, {$set: mongoUpdate.set},
                            function(err, r){
                                assert.equal(null, err);
                                console.log(r);
                                callback();
                        });
                });
            }
            else if(task.cmd != undefined)
            {
                awsCli.command(task.cmd).
                then(function (data) {
                        var mongoUpdate = task.mongoUpdate;
                        callback();
                });
            }
            else if(task.mongoUpdate != undefined)
            {
                 var mongoUpdate = task.mongoUpdate;
                 mongoUpdate.coll.findOneAndUpdate(mongoUpdate.filter, {$set: mongoUpdate.set},
                     function(err, r){
                         assert.equal(null, err);
                         console.log(r);
                         callback();
                 });
            }
    }, 10);

connectAndMigrateS3(DB_conf, S3_conf);

