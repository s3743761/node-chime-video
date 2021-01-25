const express = require('express')
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const app = express()
// var cors = require('cors')
const port = 3000
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const jwt_decode = require('jwt-decode');
 
const chime = new AWS.Chime({ region: 'us-east-1' });
var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });
const path = require('path');
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

const rekoClient = new AWS.Rekognition({
    region: 'us-east-1'
});


// app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}))



app.get('/', function (req, res) {
    res.send('Hello World!')
    console.log("here")
    
})

app.post('/meeting', async (req, res) => {
        const response = {}
        console.log(JSON.stringify(req.headers));
        try {
            
            let token = req.headers['authorization'];
           
            let decoded = jwt_decode(token);
            let email = decoded['email'];
            console.log(email)
            let params = {
                TableName: "Users",
                Key:{
                    "email": email
                   
                }
            };
            docClient.get(params, function(err, data) {
                if (err) {
                    response.usertype = '';
                   
                } else {
                    response.usertype = data['Item']['usertype'];
            
                }
            });
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
        res.send(response)
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


app.post('/face-recognition', async (req, res) => {
   
    let base64Data = req.body.emotions;
   
   
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

