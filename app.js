var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// https://www.npmjs.com/package/memory-cache
const NodeCache = require( "node-cache" );
const cache = new NodeCache({ useClones: false });

const port = 8080;
var board = [];
var cnt = 0;

app.get('/boards/*', function(req, res){
    // req.url
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

io.on('connection', function(socket){
    console.log('user connected--------------------------------', socket.handshake.headers.referer, socket.id);
    //http://paperjs.org/reference/pathitem/#datas
    let re = new RegExp(/\/boards\/([a-zA-Z0-9]+)/);

    // result[1] should be the part after http://url/boards/<this_part>
    let result = socket.handshake.query.room.match(re);
    if (result == null) {
        console.log("no match on register");
        return;
    }

    let thisBoard = result[1];
    
    console.log("thisBoard", thisBoard);


    // we have a specifc board, subscribe the user to the room
    socket.join(thisBoard, function(){
        console.log("in thisBoard", thisBoard, cache.get(thisBoard));

        console.log("socket is in rooms", socket.rooms);    

        // check if the board is pre-existing in the array:
        // if (cache.get("thisBoard") == null) {
        //     console.log("no cached board");
        //     // if not, create the arry to store the drawing 
        //     // cache.set("thisBoard", board);
        // }

        // tell myself the current state of the room from the server
        // socket.emit('boardState', cache.get(thisBoard));
    });
    

    socket.on('disconnect', function() {
        // users are automatically removed from the room when they disconnect
        console.log('user disconnected');
    });
// serialize?
    socket.on('startDraw', function(childrenIndex, path) {
        // let p = JSON.parse(path);
        // console.log("start DRAW ->>>>", p, path[0].segments);
        // board[childrenIndex] = { path: path, points: [p[1].segments[0]] };
        // cache.set(thisBoard, board);
        // socket.to(thisBoard).emit('log', cache.get("thisBoard"));

        socket.to(thisBoard).emit('startDraw', childrenIndex, path);
    });

    socket.on('updateDraw', function(childrenIndex, xy) {
        // console.log("update DRAW", xy, board);
        // board[childrenIndex].points.push(xy);
        // cache.set(thisBoard, board);
        // socket.to(thisBoard).emit('log', cache.get("thisBoard"));

        socket.to(thisBoard).emit('updateDraw', childrenIndex, xy);
    });

    socket.on('endDraw', function(index) {
        socket.to(thisBoard).emit('endDraw', index);
    });


    socket.on('startErase', function(childrenIndex, path){
        console.log("startErase");
        socket.to(thisBoard).emit('startErase', childrenIndex, path);
    });

    socket.on('updateErase', function(childrenIndex, xy) {
        console.log("updateErase");
    });

    socket.on('endErase', function(index) {
        socket.to(thisBoard).emit('endErase', index);
    });


    socket.on('error', function(error){
        console.log("ERROR", error);
    })



});

http.listen(port, function(){
  console.log('listening on *:' + port);
});