const express = require('express');
const app = express();
const port = 3000;
const request = require('request');
const multer = require('multer');
const bodyParser = require('body-parser')
var upload = multer({dest: './images/'});
var fs = require("fs");


app.use(bodyParser());

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, cache-control,");
    next();
});

app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.get('/info', function (req, res) {
    res.send(fs.readFileSync("data.json"));
});

app.post('/profile', upload.single('img.jpg'), function (req, res, next) {
    res.send(req.body);
    console.log('recieved');
});

app.post('/delete', function (req, res) {

    let rawData = fs.readFileSync("./data.json");
    let data = JSON.parse(rawData);

    var i = 0;
    var newArr = [];

    while (i < data.length) {
        if (!req.body.includes(i)) {
            newArr.push(data[i]);
            var pathName = data[i].url.split('/');
            fs.unlink('images/' + pathName[pathName.length - 1], (err) => {
                if (err) {
                }
            });
        }
        i++;
    }


    //
    //
    // var i = 0;
    // var counter = 0;
    //
    // while (i < data.length) {
    //     console.log('a');
    //     if (req.body.includes(counter)) {
    //         console.log('b');
    //         var pathName = data[i].url.split('/');
    //         fs.unlink('images/' + pathName[pathName.length - 1], (err) => {
    //             if (err) {
    //             }
    //         });
    //         data.splice(i, 1);
    //     } else {
    //         i++;
    //     }
    //     counter++;
    // }

    rawData = JSON.stringify(newArr);
    fs.writeFileSync("./data.json", rawData);

    res.send("OK");
});

app.post('/upload', upload.single('img.jpg'), function (req, res, next) {
    var latitude = req.body["lat"];
    var longitude = req.body["long"];
    console.log(latitude + "," + longitude);
    res.send(req.body);
    var options = {
        method: 'POST',
        url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v2.0/Prediction/a0744455-ef6b-42b7-a958-ecc59184fcf8/url?iterationId=c6b9533d-57a3-4788-9b7f-f99421f0b445',
        qs: {iterationId: 'c6b9533d-57a3-4788-9b7f-f99421f0b445'},
        headers:
            {
                'cache-control': 'no-cache',
                'prediction-key': '3a11f7dabf1d429a9408833a8851fac8',
                'content-type': 'application/json'
            },
        body: {Url: 'http://a4c94c54.ngrok.io/' + req.file['path']},
        json: true
    };


    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        // console.log(body);
        if (detect(body)) {
            console.log("white van detected!");
            let rawData = fs.readFileSync("./data.json");
            let data = JSON.parse(rawData);
            var nowTime = new Date().getTime();
            var nowDate = new Date(nowTime);
            data.push({
                url: 'http://a4c94c54.ngrok.io/' + req.file['path'],
                lat: latitude,
                long: longitude,
                time: nowDate.toString()
            });
            rawData = JSON.stringify(data);
            fs.writeFileSync("./data.json", rawData);
        }
    });
});

function detect(data) {
    if (data['predictions'] === undefined) {
        console.log('rate limit');
        return false;
    }
    for (i = 0; i < data['predictions'].length; i++) {
        if (data['predictions'][i]["tagName"].toLowerCase().includes('white van') && data['predictions'][i]["probability"] >= 0.06) {
            return true;
        }
    }
    return false;
}

app.use('/images', express.static('images'));