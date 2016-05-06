var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var config = require('./config');
var async = require('async');


var delUsers = function(targetDB, users_array, finish_delete_cb) {
    var del_filter;
    var target_coll = targetDB.collection("user");
    var delete_q = async.queue(
        function(task, callback){
            console.log(task.filter);
            task.target_coll.deleteOne(task.filter, callback);
        });

    users_array.forEach(function(currValue, index, array){
        del_filter = {};
        del_filter["email"] = currValue.email;
        delete_q.push({target_coll: target_coll, filter: del_filter});
    });

    delete_q.drain = 
        function(){
            finish_delete_cb();
        }       

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

    connectAndDelete: function(target_DB_conf, users_array){
        async.parallel([
            async.apply(connectToMongo, 
                        MongoClient, 
                        target_DB_conf.url, 
                        target_DB_conf.username, 
                        target_DB_conf.passwd)
        ], 
         function(err, dbs){
             var targetDB = dbs[0];
             delUsers(targetDB, users_array,
                             function(){
                                console.log("bye");
                                targetDB.close();
                             });

         });
   
    }
}

var users_array = require('./useless_users.json');
module.exports.connectAndDelete(config.deletion_config.target_DB, users_array);
