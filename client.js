"use strict";
var fs = require('fs')
let jot = require('json-over-tcp')
var chokidar = require('chokidar');
var wrap = require('co');
let path = require('path')

let PORT = 8080
var server = jot.createServer(PORT);
server.on('listening', createConnection);
server.on('connection', newConnectionHandler);

// Triggered whenever something connects to the server
function newConnectionHandler(socket){
  // Whenever a connection sends us an object...
  socket.on('data', function(data){
    wrap(fileOp(data))
  });
};

function* fileOp(data) {
  console.log(data)
  let srcPath = path.join(__dirname, data.path)
  let destPath = srcPath.replace('source', 'dest')
  if('add' == data.action || 'update' == data.action) {
    let rs = fs.createReadStream(srcPath)
    let ws = fs.createWriteStream(destPath)
    rs.pipe(ws)
  } else if('remove' == data.action) {
    yield fs.unlink(destPath)
  }
}

// Creates one connection to the server when the server starts listening
function createConnection(){
  // Start a connection to the server
  var socket = jot.connect(PORT, function(){


  });

  let watcher = chokidar.watch('./source/', {ignored: /[\/\\]\./, persistent: true})

  watcher.on('add', ( path) => {

    let data = {
      "action": "add",
      "path": path
    }
    socket.write(data);
  })

  watcher.on('change', (path) => {
    let data = {
      "action": "update",
      "path": path
    }
    socket.write(data);
  })

  watcher.on('unlink', (path) => {
    let data = {
      "action": "remove",
      "path": path
    }
    socket.write(data);
  })

}

// Start listening
server.listen(PORT);
