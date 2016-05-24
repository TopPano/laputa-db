var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var config = require('./config');
var async = require('async');

var checkExist = function(params, coll, callback){
     coll.count(params.query, 
          function(err, count){
              callback(null, {params, "count":count});
          });
};

var delGarbageRecord = function(targetDB, policys, finish_delete_cb) {
    var target_cursor;
    var target_coll, relate_coll;
    var maps;
    var query;
    var delete_task_queue = 
        async.queue(
            function(task, callback)
            {
                   fs.appendFile('report', JSON.stringify(task)+'\n');
                    console.log(task);
                   var coll_name = task.coll;
                   delete task.coll; 
                   targetDB.collection(coll_name).deleteOne(task, function(err){callback();});
            },2);
            
    
    async.eachSeries(policys, 
        function(policy, callback){
            console.log("start delete, policy: "+JSON.stringify(policy, null, 2));
            target_coll = targetDB.collection(policy.target_coll);
            target_cursor = target_coll.find();
            
            maps = policy.maps;
            target_cursor.each(
                function(err, doc){
                    assert.equal(err, null);
                    if (doc != null) {
                        var check_task_array = []
                        for(var i=0; i<maps.length; i++)
                        {
                            query = {};
                            query[maps[i].map_to.key] = doc[ maps[i].target_key ];
                            relate_coll = targetDB.collection(maps[i].map_to.relate_coll);
                            check_task_array.push(async.apply(checkExist, 
                                                              {
                                                                "target_coll": policy.target_coll,
                                                                "target_key": maps[i].target_key,
                                                                "map_to_key": maps[i].map_to.key, 
                                                                query}, 
                                                              relate_coll));
                        }
                        async.parallel(check_task_array, 
                                      function(err, result){
                                          // console.log(JSON.stringify(result, null, 2));
                                          var sum = 0;
                                          var delete_query = {};
                                          var target_key;
                                          for(var j=0; j<result.length; j++){
                                              //assert.equal(JSON.stringify(result[0].params.query), 
                                              //             JSON.stringify(result[j].params.query)); 
                                              sum += result[j].count;
                                          }
                                          if(sum<1)
                                          {
                                              target_key = result[0].params.target_key;
                                              delete_query[target_key] = result[0].params.query[result[0].params.map_to_key];
                                              delete_query["coll"] = result[0].params.target_coll;
                                              delete_task_queue.push(delete_query); 
                                          }
                                        
                                      })
                        
                    } else {
                        callback();
                    }
            });
        },
        function(err){
            delete_task_queue.drain = function(){
                finish_delete_cb();
            };
             
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




module.exports = {
    connectAndDelete: function(target_DB_conf, policys){
        async.parallel([
            async.apply(connectToMongo, 
                        MongoClient, 
                        target_DB_conf.url, 
                        target_DB_conf.username, 
                        target_DB_conf.passwd)
        ], 
         function(err, dbs){
             var targetDB = dbs[0];
             delGarbageRecord(targetDB, policys,
                             function(){
                                console.log("finish deletion");
                                targetDB.close();
                             });

         });
   
    }
}


module.exports.connectAndDelete(config.deletion_config.target_DB, config.deletion_config.policy);
