var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var ejs = require('ejs');


var totalMessages = 0;

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', function (req, res) {
    res.render('index');
});


io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('chat message', function (msg) {
        var clients = io.sockets.clients();
        totalMessages += 1
        if (totalMessages >= 2) {
            youWon();
        }
        console.log(`totalMessage ${totalMessages}`);
        console.log('message: ' + msg);
        socket.emit('getTimer','5');
    });
});


function youWon() {
    console.log("YOU WON")
}


io.on('disconnect', (socket) => {
    console.log(socket);
    console.log("GOODBYE")
});

server.listen(process.env.PORT || 3000, function () {
    console.log('app running');
});
