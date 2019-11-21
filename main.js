var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var ejs = require('ejs');
var bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4');

var totalMessages = 0;

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


var lastWinner = "";
var lastWinnerScore = 0;

var gameScores = {

}

var highscores = {

}


function checkAndAddHighScore(msg) {
    if (msg["uuid"] == lastWinner) {
        highscores[msg["data"]] = lastWinnerScore
    }
    console.log(highscores)
}

//HELPER FUNCTIONS

function checkHighScore() {
    console.log("GET GLOBAL LEADER")
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
    console.log(gameScores)
    if (Object.keys(gameScores).length > 0) {
        maxValue = 0;
        winner = ''
        playerList = Object.keys(io.sockets.clients()['connected'])
        for (var i = 0; i < playerList.length; i++) {
            var score = gameScores[playerList[i]].length
            if (score > maxValue) {
                maxValue = score;
                winner = playerList[i];
            }
        }
        console.log(`Winner is ${winner} with a score of ${maxValue}, playerlist ${playerList}`)
        console.log(playerList.indexOf(winner))
        if (playerList.indexOf(winner) != -1) {
            lastWinner = winner;
            lastWinnerScore = maxValue;
            io.sockets.clients()['connected'][winner].emit("recvWinFromServer", "")
        }
    }
    gameScores = {

    }
}


app.get('/', function (req, res) {
    res.render('index');
});


app.get('/scores', function (req, res) {
    res.render('highscores', { highscores: highscores });
});


app.get('/test/sendAll', function (req, res) {
    io.emit(emit('recvFromServer', { 'data': 'Server generated event BROADCAST' }));
    res.send("SENT DATA");
});


app.get('/testApi.html', (req, res) => {
    res.send(`<html>

    <body style="font-size:44">
        <form action="http://localhost:3000/api" target="_self" method="POST">
            <input type="radio" style="height:25px;width:25px" name="action" value="startGame">start game</input><br>
            <input type="radio" style="height:25px;width:25px" name="action" value="get all clients answers">get all clients answers</input><br>
            <input type="radio" style="height:25px;width:25px" name="action" value="checkHighScore">Check highscores</input><br>
            <input type="hidden"  name="token" value="dfrobot_secret_key_12215647878964121487">
            <input type="submit"  style="height:75px;width:100px" value="Submit" onclick="submitHighScore()">
    
        </form>
    </body>
    
    </html>`);
});

app.post('/api', function (req, res) {
    console.log(req.body.action)
    const apiKey = req.body.token;
    if (apiKey == "dfrobot_secret_key_12215647878964121487") {
        const action = req.body.action;
        switch (action) {
            case 'startGame':
                io.emit('start game', { 'lengthOfGame': 5 });
                break;
            case 'get all clients answers':
                console.log("HERE!")
                io.emit("send colors to server");
                break;
            case 'checkHighScore':
                checkHighScore();
            default:
                break;
        }
    }
    res.redirect("localhost:3000/testApi.html");

});




io.on('connection', function (socket) {
    const localID = socket['id'];
    console.log(`${localID} user connected`);
    socket.emit('connect_response', {
        'data': 'Connected', 'id': localID
    }
    );

    socket.on('colorArray', (msg) => {
        console.log(msg)
        gameScores[msg['uuid']] = msg['data'];
    });

    socket.on('userHighScoreSubmit', (msg) => {
        console.log("!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        console.log(msg);
        checkAndAddHighScore(msg)
    })

    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});




server.listen(process.env.PORT || 8081, '0.0.0.0', function () {
    console.log('app running');
});
