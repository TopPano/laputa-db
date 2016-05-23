var targetMongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');
var AwsCli = require('aws-cli-js');
var config = require('./config');

var awsCli = new AwsCli();

var bucket_name = "verpix-img-development-base";
var bucket_domain_name = "https://"+bucket_name+".s3.amazonaws.com/";


var migrate_queue = async.queue(    
     function(task ,callback){
         console.log(task.cmd);
         awsCli.command(task.cmd).then(function(data){callback()});
     }, 15);

var mv_S3_file = function(origin_postId, new_postId, url, nodemetaId){
    console.log(origin_postId);
    url = url.replace(/%2F/g, "\/");
    url = url.replace(/%3D/g, '=');
    var original_key = url.replace(bucket_domain_name, "");
    var new_key = original_key.replace(origin_postId, new_postId);
    new_key = new_key.replace(nodemetaId, new_postId);
    new_key = new_key.replace(origin_postId, new_postId);

    // S3 migrate 
    var cmd = "s3 mv --acl public-read s3://"+bucket_name+"\/"+original_key+" "+"s3://"+bucket_name+"\/"+new_key;
    console.log(cmd);
    var task = {};
    task.cmd = cmd;
    migrate_queue.push(task, function(){console.log("finish "+cmd+"\n")});


    console.log(new_key);
    console.log('\n');
    return bucket_domain_name+new_key;
}


var translateAll = function(target_DB){
    var cursor, relate_cursor;
    var postId, newId;
    var delete_filter, replace_filter, replace, replace_set;
    var post_coll = target_DB.collection('post');
    var nodemeta_coll = target_DB.collection('nodemeta');
    var location_coll = target_DB.collection('location');
    var file_coll = target_DB.collection('file');
    var like_coll = target_DB.collection('like');

    
    function get_all_posts(nothing ,callback){
        cursor = post_coll.find();
        var post_doc_array = [];
        cursor.forEach(
            function(doc){
                post_doc_array.push(doc);
            },
            function(err){
                assert.equal(null, err);
                callback(null, post_doc_array);
            });
    }

    var translate_flow = async.compose(translate, get_all_posts);
    translate_flow(0, function(err, result){assert.equal(null, err)});
    

    function translate(post_doc_array, callback){
      async.eachSeries(post_doc_array,
        function(doc, callback) {
          
          postId = doc._id;
          newId = new Buffer(postId, 'base64').toString('hex');
        
          doc._id = newId;
          doc.mediaType = "panoPhoto";
          doc.caption = doc.message;
          delete doc.message;
          delete doc.snapshotList;
          delete doc.thumbnailUrl;

          doc.dimension = {};
          doc.thumbnail = {};
          doc.media = {};
          doc.thumbnail = {};

          var find_relate_nodemeta = function(sub_callback){
            var find_query = {};
            find_query.postId = postId;
            nodemeta_coll.find(find_query).toArray( 
                function(err, result){
                    assert.equal(null, err);
                    assert.equal(1, result.length)
                    sub_callback(null, result[0]);
                });
          }

          function find_relate_location(sub_callback){
            var find_query = {};
            find_query.postId = postId;
            location_coll.find(find_query).toArray( 
                function(err, result){
                    assert.equal(null, err);
                    //assert.equal(1, result.length);
                    sub_callback(null, result[0]);
                });
          }

          function find_relate_file(sub_callback){
            var find_query = {};
            find_query.postId = postId;
            file_coll.find(find_query).toArray( 
                function(err, result){
                    assert.equal(null, err);
                    assert.equal(16, result.length);
                    sub_callback(null, result);
                });
          }

          var nodemeta_flow = async.parallel([find_relate_nodemeta, 
                                            find_relate_location, 
                                            find_relate_file], 
                function(err, result){
                    assert.equal(null, err);
                    
                    var nodemeta_result = result[0];
                    var location_result = result[1];
                    var file_result = result[2];
                    var file_tile_obj;
                    var nodemetaId = nodemeta_result._id;
                    var curr_postId = nodemeta_result.postId;

                    // combine nodemeta into post doc 
                    doc.dimension.width = nodemeta_result.width;
                    doc.dimension.height = nodemeta_result.height;
                    doc.dimension.lat = nodemeta_result.lat;
                    doc.dimension.lng = nodemeta_result.lng;
                    
                    doc.thumbnail.srcUrl = mv_S3_file(postId, newId, nodemeta_result.thumbnailUrl, nodemetaId);
                    doc.thumbnail.downloadUrl = doc.thumbnail.srcUrl;
                    

                    doc.media.srcUrl = mv_S3_file(postId, newId, nodemeta_result.srcUrl, nodemetaId);
                    doc.media.srcDownloadUrl = doc.media.srcUrl;
                    doc.media.srcMobileUrl = mv_S3_file(postId, newId, nodemeta_result.srcMobileUrl, nodemetaId);
                    doc.media.srcMobileDownloadUrl = doc.media.srcMobileUrl;


                    // combine location into post doc 
                    doc.locationId = null;
                    
                    // combine file into post doc 
                    doc.media.srcTiledImages = [];
                    doc.media.srcMobileTiledImages = [];
                    for(var i = 0; i < file_result.length; i++)
                    {
                        file_tile_obj = {};                        
                        if(file_result[i].url.match(/high/))
                        {
                            file_tile_obj.srcUrl = mv_S3_file(postId, newId, file_result[i].url, nodemetaId);
                            file_tile_obj.downloadUrl = file_tile_obj.srcUrl;
                            doc.media.srcTiledImages.push(file_tile_obj);
                        }
                        else if(file_result[i].url.match(/low/))
                        {
                            file_tile_obj.srcUrl = mv_S3_file(postId, newId, file_result[i].url, nodemetaId);
                            file_tile_obj.downloadUrl = file_tile_obj.srcUrl;
                            doc.media.srcMobileTiledImages.push(file_tile_obj);
                        }
                    }

                    console.log('\n');
                    console.log(JSON.stringify(doc, null, 2));
       
		            // insert new-schema post
                    post_coll.insertOne(doc,function(err){assert.equal(null, err);});
                    // delete origin post
                    delete_filter = {};
                    delete_filter['_id'] = postId;
                    post_coll.deleteOne(delete_filter, function(err, res){assert.equal(null, err);});
                    
                    // change postId in like
                    replace_filter = {};
                    replace_filter['postId'] = postId;
                    replace = {};
                    replace['postId'] = newId;
                    replace_set = {};
                    replace_set['$set'] = replace;
                    like_coll.updateMany(replace_filter, replace_set, function(err,res){assert.equal(null, err);});
                    callback();
                });
       
           
        },
        function(err){
              assert.equal(null, err);
               migrate_queue.drain = function(){
                   console.log("finish migrate");};
        });
    };
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
             translateAll(target_DB);
        });                
};


var target_DB_conf = config.S3_migration_config.target_DB;


connectAndTranslate(target_DB_conf);

