var AwsCli = require('aws-cli-js');

var Aws = AwsCli.Aws;
var async = require('async');

var src_bucket = "verpix-img-development-base";


var list_cmd = "s3api list-objects --bucket "+src_bucket;
var aws = new Aws();

var download_queue = async.queue(
    function(task ,callback){
        aws.command(task).then(function(data){callback();}) 
}, 10);


aws.command(list_cmd).
then(function (data) {
    var cp_cmd;
    for(var i=0; i<data.object.Contents.length; i++){
        cp_cmd = "s3 cp s3://"+src_bucket+"/"+data.object.Contents[i].Key+" ../S3/"+data.object.Contents[i].Key;
        download_queue.push(cp_cmd, function(){console.log("finish "+cp_cmd);});
    }

    download_queue.drain = function(){
        console.log("finish");
    }
});
