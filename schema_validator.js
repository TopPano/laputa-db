var sourceMongoClient = require('mongodb').MongoClient;

var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var deferred = require('deferred');

var jsv = require('json-validator');

var sourceUrl = 'mongodb://172.31.30.255:27019/verpix-production-db';

var validateSchema = function(sourceDb, collection_name, schema, callback) {
    var cursor = sourceDb.collection(collection_name).find( );
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            jsv.validate(doc, schema, function(err, messages){
                if(Object.keys(messages).length){ // check messages is not  empty
                    console.log(doc); 
                    console.log(err); 
                    console.log(messages);
                    console.log('\n');
                }
            });
        } else {
            callback("sourceDB finished");
        }
    });

};


function connectToMongo(mongoClient, url, username, password){
    var def = deferred();
    mongoClient.connect(url, 
         function(err, db){
               assert.equal(null, err);
               db.authenticate(username, password, 
                    function(err, res){
                        assert.equal(null, err);
                        return def.resolve(db);
                    });
    });
    return def.promise;
}


var schema = {
    _id: {
        required: true
    },
    status:{
        required: true
    },
    message:{
        required: true
    },
    created:{
        required: true
    },
    modified:{
        required: true
    },
    ownerId:{
        required: true
    },
    snapshotList:{
        required: true
    },
    thumbnailUrl:{
        required: true,
    }

};

deferred(connectToMongo(sourceMongoClient, sourceUrl, "verpix-api", "verpix-27003662"))
         (function(dbs){
             var sourceDb = dbs;
             validateSchema(sourceDb, "post", schema,
                             function(){
                                //sourceDb.close();
                             })
         });
