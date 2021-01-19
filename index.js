// const AWS = require('aws-sdk');
// const { v4: uuid } = require('uuid');
// const http = require('http');
// const host = '127.0.0.1:8080';

// // You must use "us-east-1" as the region for Chime API and set the endpoint.
// const chime = new AWS.Chime({ region: 'us-west-2' });
// chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

// // const meetingResponse = await chime.createMeeting({
// //   ClientRequestToken: uuid(),
// //   MediaRegion: 'us-west-2' // Specify the region in which to create the meeting.
// // }).promise();

// // const attendeeResponse = await chime.createAttendee({
// //   MeetingId: meetingResponse.Meeting.MeetingId,
// //   ExternalUserId: uuid() // Link the attendee to an identity managed by your application.
// // }).promise();
// http.createServer({}, async (request, response) => {
//     console.log(`${request.method} ${request.url} BEGIN`);
// });
// // console.log(meetingResponse)
// // console.log(attendeeResponse)
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 3000
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const chime = new AWS.Chime({ region: 'us-east-1' });
const path = require('path');
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');


app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});

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