var express = require('express');
var app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser')
const fs = require('fs');


app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


let sensorData = {
    "sen1": {
        "senName": "Sensor 1",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 4
    },
    "sen2": {
        "senName": "Sensor 2",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 1
    },
    "sen3": {
        "senName": "Sensor 3",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 1
    },
    "sen4": {
        "senName": "Sensor 4",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 2
    },
    "sen5": {
        "senName": "Sensor 5",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 2
    },
    "sen6": {
        "senName": "Sensor 6",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 3
    },
    "sen7": {
        "senName": "Sensor 7",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 3
    },
    "sen8": {
        "senName": "Sensor 8",
        "senOn": true,
        "senLastReadValue": 5,
        "cat": 4
    }
}




app.get('/', function (req, res) {
    res.render('index', { sensorData: sensorData });
});

app.get("/getAllSensorInfo", (req, res) => {
    res.send(sensorData)
});

app.post("/changeSenState", (req, res) => {
    sen = req.body.senName
    sensorData[sen]["senOn"] = !sensorData[sen]["senOn"]
    var re = sensorData[sen]["senOn"] ? "on" : "off";
    console.log(`User is setting ${sen} to ${re}`)
    res.send(sensorData[sen]["senOn"])
})


app.post('/api', function (req, res) {
    var result = { "msg": "" }
    const apiKey = req.body.apiKey;

    if (apiKey == "dfrobot_secret_key_12215647878964121487") {
        const action = req.body.action;
        console.log(`Actions recv: ${action}`);
        switch (action) {
            case 'updateVal':
                const senID = req.body.senID;
                const senVal = req.body.senVal;
                sensorData[senID]["senLastReadValue"] = senVal;
                result.msg = "Success!"
                res.send(result)
                res.end
                return true
                break
            case 'getAllVal':
                result.msg = (sensorData)
                res.send(result)
                res.end
                return
                break
            case 'turnOffAll':
                for (i in sensorData) {
                    sensorData[i].senOn = false;
                }
                result.msg = (sensorData)
                res.send(result)
                res.end
                return true
                break
            case 'turnOnAll':
                for (i in sensorData) {
                    sensorData[i].senOn = true;
                }
                result.msg = (sensorData)
                res.send(result)
                res.end
                return true
                break
            default:
                break;
        }
    }
    res.redirect("localhost:8081/testApi");

});

app.get('/testApi', (req, res) => {
    res.render('testApi');
});


app.listen(process.env.PORT || 8081, '0.0.0.0', function () {
    console.log('app running');
});
