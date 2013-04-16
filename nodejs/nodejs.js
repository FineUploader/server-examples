/**
 * Node.JS server sample file.
 *
 * You have to install additional modules with:
 * npm install express
 * npm install node-uuid
 * npm install jade
 *
 * Express handles most of the heavy lifting of handling the multipart form parsing - all we have to do is establish an endpoint
 * to handle the incoming file
 *
 * If you are using NginX as reverse proxy, please set this in your server block:
 * client_max_body_size    200M;
 * 
 * You have to run the server endpoint on port 80,
 * either by an reverse proxy upstream to this script
 * or by run this script directly on port 80,
 * because the ajax upload script can not handle port instruction in the action url correctly. :(
 *
 * @Author: Felix Gertz <dev@felixgertz.de> 2012
 */

var express = require('express'),
    fs = require('fs'),
    util = require('util'),
    uuid = require('node-uuid'),
    url = require('url'),
    app = express();

// Settings
var settings = {
    node_port: process.argv[2] || 8000,
    uploadPath: __dirname + '/uploads/'
};

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.bodyParser({uploadDir: settings.uploadPath}));

app.get('/', function(request, response) {
    response.render('index');
})

app.post('/upload', function(request, response, next) {
    // as the uploadDir is simply a temporary save location, let's define a permanant place for 
    // uploads to be saved

    var savePath = __dirname + '/files/';
    var fileName = request.files.qqfile.name;

    //after upload, rename the file and respond to Fine Uploader to notify it of success
    fs.rename(request.files.qqfile.path, savePath + fileName, function(err) {
	if (err != null) {
	    console.log('Err: ' + err);
	    response.send(JSON.stringify({success: false, error: err}), {'Content-Type': 'text/plain'}, 404);
	} 
	else {
	    response.send(JSON.stringify({success: true}), {'Content-Type': 'text/plain'}, 200);
	    console.log('File Uploaded: ' + savePath + fileName);
	}
    })
    
});



// Starting the express server
app.listen(settings.node_port, '127.0.0.1');
console.log("Express server listening on %s:%d for uploads", '127.0.0.1', settings.node_port);
