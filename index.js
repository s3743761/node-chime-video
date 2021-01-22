const express = require('express')
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const app = express()
const port = 3000
const AWS = require('aws-sdk');
const atob = require('atob');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const { v4: uuid } = require('uuid');
const jwt_decode = require('jwt-decode');
 
const chime = new AWS.Chime({ region: 'us-east-1' });
var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });
const path = require('path');
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

const rekoClient = new AWS.Rekognition({
    region: 'us-east-1'
});


app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}))


// app.get('/', async (req, res) => {
//     res.sendFile(path.join(__dirname+'/index.html'));
// });

app.get('/', function (req, res) {
    res.send('Hello World!')
    
    let rawUrl = 'http://localhost:8080/?id=eyJraWQiOiJnXC9IWXdtd3lIYnZUanJobUg2RjQ0dnE0ZVJxUDJMQlpvcDRkXC9uOWo3bnc9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3ZmVhYWFhOS1iM2EwLTQzOGEtYTcxZC02MmMzNTE4NTI3YjciLCJhdWQiOiIyODFoZjgyNW43YmgwdDBzNTVnaWFyZzEwMyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZXZlbnRfaWQiOiI2NzZiNTZhYy05NmU1LTQxMzQtODM1Ni03ODFjMWIxNmYzNDUiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTYxMTMwNjIwNCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfUHNDOWg1VzBOIiwibmFtZSI6Imt1Y2gxMiIsImNvZ25pdG86dXNlcm5hbWUiOiI3ZmVhYWFhOS1iM2EwLTQzOGEtYTcxZC02MmMzNTE4NTI3YjciLCJleHAiOjE2MTEzMDk4MDQsImlhdCI6MTYxMTMwNjIwNCwiZW1haWwiOiJrdWNoQGJoaS5jb20ifQ.dca-Qg98vx4lOiuzdFJqhaFaZy5XpwWL_Xk02HDLWxOiiAsToT4xAl3I0zeVbIhNEIoA65fjFrRvcAQXsBHTlU4BJflXPlhOW03c1ZpQcYyQ_T9_46csUnK7tuF5Xg4M-XgtX57hnEUoKndDiU-WyhEyVNQ3pGlAlfiSxyvyn7kqNxokvbSLZFOyO1L9YpB3kOi5Mk_ug6zVKDxgSk7vzYddlKqaiP21QqmB8EuCs2APl6Ls4T5yOrOaAU20wPaHwzXIAHqLi8U5OmYpRhPTY3iymSuYj30yRgNipv_g_faweNvmA_fjg2oHZFMOe_yfEmcnRlgP_7ayOEWoABFiig';
    let parsedUrl = url.parse(rawUrl);
    let parsedQs = querystring.parse(parsedUrl.query);

    var token = parsedQs['id'];
    var decoded = jwt_decode(token);
    let email = decoded['email'];
    console.log(email);
    console.log(decoded);

    var params = {
        TableName: "Users",
        Key:{
            "email": email
           
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data['Item']['usertype'], null, 2));
        }
    });
})

app.post('/meeting', async (req, res) => {
    //   res.send('Hello World!')
        const response = {}
    
        console.log(req.body)
        try {
            response.meetingResponse = await chime
                .createMeeting({
                    ClientRequestToken: req.body.meeting_name,
                    MediaRegion: 'us-east-1',
                    ExternalMeetingId: req.body.meeting_name,
                })
                .promise()
                
            response.attendee = await chime
                .createAttendee({
                    MeetingId: response.meetingResponse.Meeting.MeetingId,
                    ExternalUserId: uuid(),
                })
                .promise()
    
        } catch (err) {
            res.send(err)
        }
        // res.render("index", { meeting: response });
        res.send(response)
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


app.post('/face-recognition', async (req, res) => {
    // let base64Data = "data:image/jpeg;base64,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";
    let base64Data = req.body.emotions;
    // console.log(base64Data)
    const response = {}
    var base64Image = base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const buffer = new Buffer.from(base64Image, 'base64');

    rekoClient.detectFaces({
        Image: {
          Bytes: buffer
        },
        Attributes: ['ALL']
      }).promise()
      .then(awsResponse => {
        //console.log(p.FaceDetails[0].Emotions));
        console.log(awsResponse)
        if(awsResponse.FaceDetails.length > 0){
            res.send(awsResponse.FaceDetails[0].Emotions)
        }
      });
      // res send - Face Details len > 0 and has Emotions 
});

module.exports.handler = serverless(app);

