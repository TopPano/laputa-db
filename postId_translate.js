var targetMongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');

var config = require('./config');

var translate = function(target_DB){
    var cursor, relate_cursor;
    var postId, newId;
    var delete_filter, replace_filter, replace, replace_set;
    var post_coll = target_DB.collection('post');
    var nodemeta_coll = target_DB.collection('nodemeta');
    var location_coll = target_DB.collection('location');
    var file_coll = target_DB.collection('file');
    var like_coll = target_DB.collection('like');

    cursor = post_coll.find();
    
    cursor.forEach(
            function(doc) {
                postId = doc._id;
                console.log(postId);
                newId = new Buffer(postId, 'base64').toString('hex');
                console.log(newId);

                doc._id = newId;
                post_coll.insertOne(doc,function(err){console.log(err);});
                
                delete_filter = {};
                delete_filter['_id'] = postId;
                post_coll.deleteOne(delete_filter, function(err, res){console.log(err);});
    
                replace_filter = {};
                replace_filter['postId'] = postId;
                replace = {};
                replace['postId'] = newId;
                replace_set = {};
                replace_set['$set'] = replace;
                nodemeta_coll.updateMany(replace_filter, replace_set, function(err,res){console.log(err);});
                
                file_coll.updateMany(replace_filter, replace_set, function(err,res){console.log(err);});
                location_coll.updateMany(replace_filter, replace_set, function(err,res){console.log(err);});
                like_coll.updateMany(replace_filter, replace_set, function(err,res){console.log(err);});

            },
            function(err){
                    assert.equal(null, err);
                    console.log("bye");
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

var connectAndTranslate = function(target_DB_conf){
    async.parallel([
        async.apply(connectToMongo,
                targetMongoClient, 
                target_DB_conf.url, 
                target_DB_conf.username,
                target_DB_conf.passwd)
        ],
        function(err, dbs){
             var target_DB = dbs[0];
             translate(target_DB);
        });                
};


var target_DB_conf = config.S3_migration_config.target_DB;


connectAndTranslate(target_DB_conf);

