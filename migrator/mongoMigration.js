var sourceMongoClient = require('mongodb').MongoClient;
var destMongoClient = require('mongodb').MongoClient;

var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');

var config = require('./config');


// colls means collections
var migrateColls = function(srcDB, destDB, target_colls, finish_migrate_cb) {
    /*destinationDb.createCollection("yes", null, function(err , collection){
        assert.equal(err, null);
        collection.insertOne({"test":"value"});
    });
   */
    var cursor;
    var src_coll, dest_coll;
    var insert_task_queue = 
                async.queue(
                    function(task, callback){
                        task.coll.insertOne(task.doc, function(){callback();});
                    }, 2);

    async.eachSeries(target_colls, 
        function(coll_name, callback){
            console.log("start migrate "+coll_name);
            src_coll = srcDB.collection(coll_name);
            dest_coll = destDB.collection(coll_name);
            cursor = src_coll.find();

            cursor.each(function(err, doc){
                assert.equal(err, null);
                if (doc != null) {
                    insert_task_queue.push(
                            {coll: dest_coll, doc: doc},
                            function(err){});
                } 
                else {
                    callback();        
                }
            });
        },

        function (err){
            insert_task_queue.drain = function(){
                finish_migrate_cb();
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



var connectAndMigrate = function(src_DB_conf, dest_DB_conf, target_colls){
    async.parallel([
        async.apply(connectToMongo,
                sourceMongoClient, 
                src_DB_conf.url, 
                src_DB_conf.username,
                src_DB_conf.passwd),
        async.apply(connectToMongo,
                destMongoClient, 
                dest_DB_conf.url, 
                dest_DB_conf.username,
                dest_DB_conf.passwd)
        ],
        function(err, dbs){
             var src_DB = dbs[0];
             var dest_DB = dbs[1];
             migrateColls(src_DB, dest_DB, target_colls,
                         function(){
                             console.log("finish migration");
                             src_DB.close();
                             dest_DB.close();
                         });
        });                
};

var src_DB_conf = config.migration_config.src_DB;
var dest_DB_conf = config.migration_config.dest_DB;
var target_colls = config.migration_config.target_colls;

connectAndMigrate(src_DB_conf, dest_DB_conf, target_colls);

