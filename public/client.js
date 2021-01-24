
const aws = require('amazon-chime-sdk-js');


const logger = new aws.ConsoleLogger('MyLogger', aws.LogLevel.INFO);
const deviceController = new aws.DefaultDeviceController(logger);
let configuration;
let meetingSession;
let userType = '';
const params = new URLSearchParams(window.location.search);
let id_token = params.get('id');

document.getElementById('submit').addEventListener('click', onClick);

// var timerVar = setInterval(countTimer, 1000);
var totalSeconds = 0;
function countTimer() {
    ++totalSeconds;
    var hour = Math.floor(totalSeconds /3600);
    var minute = Math.floor((totalSeconds - hour*3600)/60);
    var seconds = totalSeconds - (hour*3600 + minute*60);
    if(hour < 10)
        hour = "0"+hour;
    if(minute < 10)
        minute = "0"+minute;
    if(seconds < 10)
        seconds = "0"+seconds;
    document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;
    
}
async function onClick(event) {
    event.preventDefault();
    
    const meeting_name = document.getElementById("meeting-name").value;

    const response = await fetch('https://j9sgxptxu8.execute-api.us-west-2.amazonaws.com/dev/meeting',{
        method:'POST', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': id_token
        },
        body: JSON.stringify({meeting_name: meeting_name})
    });

    const data = await response.json();
    const meetingResponse = data.meetingResponse;
    const attendeeResponse = data.attendee;
    userType = data.usertype;
    configuration = new aws.MeetingSessionConfiguration(meetingResponse, attendeeResponse);

    // const configuration = new aws.MeetingSessionConfiguration(meetingResponse, attendeeResponse);
    // In the usage examples below, you will use this meetingSession object.
    meetingSession = new aws.DefaultMeetingSession(
        configuration,
        logger,
        deviceController
    );

    if(userType == ''){

        document.write ("Incorrect credentials." );
        return 0;
    }

    const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
    const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
    const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();

    const audioInputDeviceInfo = audioInputDevices[0];
    await meetingSession.audioVideo.chooseAudioInputDevice(audioInputDeviceInfo.deviceId);

    const audioOutputDeviceInfo = audioOutputDevices[0];
    await meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputDeviceInfo.deviceId);

    const videoInputDeviceInfo = videoInputDevices[0];
    await meetingSession.audioVideo.chooseVideoInputDevice(videoInputDeviceInfo.deviceId);

    const audioElement = document.getElementById('audio-element');
    meetingSession.audioVideo.bindAudioElement(audioElement);

    // const localVideoElement = document.getElementById('local-video-element');
    // const remoteVideoElement = document.getElementById('remote-video-element');
    const observer = {
        audioVideoDidStart: () => {
            console.log('Started');
        },
        videoTileDidUpdate: tileState => {
            let videoElement = document.getElementById("video-" + tileState.tileId);
            if (!videoElement) {
                videoElement = document.createElement("video");
               
                // videoElement.setAttribute("is-local", tileState.localTile);
                // videoElement.setAttribute("user-type", userType);
                videoElement.setAttribute("should-screenshot", tileState.localTile == false && userType == "Admin");

                videoElement.id = "video-" + tileState.tileId;
                document.getElementById("video-list").append(videoElement);
                meetingSession.audioVideo.bindVideoElement(
                    tileState.tileId,
                    videoElement
                );
            }

        
            
        }
    };
   
    var timerVar = setInterval(countTimer, 1000);
    meetingSession.audioVideo.addObserver(observer);
    meetingSession.audioVideo.startLocalVideoTile();
    meetingSession.audioVideo.start();
    
    
    

}

/*
wait 10 seconds js
get local vide element using document.querySelectorAll('[data-foo="value"]');
screenshot of element html js

*/


// var scaleFactor = 0.25;


function capture(video, scaleFactor) {
    if (scaleFactor == null) {
        scaleFactor = 1;
    }
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
}

let seconds = []
let snapshots = []
let emotion_object = {
    'HAPPY':[],
    'SAD':[],
    'CALM':[],
    'ANGRY':[],
    'SURPRISED':[],
    'FEAR':[],
    'CONFUSED':[],
    'DISGUSTED':[]
}
// document.getElementById('screenshot').addEventListener('click', onClickScreenShot);
var ctx = document.getElementById('myChart').getContext('2d');
async function onClickScreenShot(event) {
  
    // event.preventDefault();
   
    let video =  document.querySelectorAll('[should-screenshot="true"]')[0];
    let canvas = capture(video, 0.25);


    let screenshot = canvas.toDataURL('image/png');
    // console.log(screenshot);

    const response = await fetch('https://j9sgxptxu8.execute-api.us-west-2.amazonaws.com/dev/face-recognition',{
        method:'POST', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': id_token
        },
        body: JSON.stringify({emotions: screenshot})
    });
    const data = await response.json();
    console.log(data);
    snapshots.push(data);
    console.log(snapshots);
    seconds.push(totalSeconds);
    console.log(seconds);
    // console.log(snapshots.length)
    // var i;
    // for(i = 0; i < 10; i++){
    //     console.log(snapshots[i][0]);
    // }
    // element = {'Type': 'Happy', 'Confidence': 90}
    data.forEach(element => {
        // console.log(element)
        emotion_object[element['Type']].push(element['Confidence'])

    });
    console.log(emotion_object)

    var calm = {
        label: "CALM",
        data: emotion_object['CALM'],
        lineTension: 0.3,
        borderColor: 'red'
    };
         
    var confused = {
    label: "CONFUSED",
    data: emotion_object['CONFUSED'],
    borderColor: 'black'
    };

    var fear = {
        label: "FEAR",
        data: emotion_object['FEAR'],
        borderColor: 'green'
        };
    
    var sad = {
        label: "SAD",
        data: emotion_object['SAD'],
        borderColor: 'yellow'
    };
    var happy = {
        label: "HAPPY",
        data: emotion_object['HAPPY'],
        lineTension: 0.3,
        borderColor: 'blue'
    };
         
    var angry = {
    label: "ANGRY",
    data: emotion_object['ANGRY'],
    borderColor: 'orange'
    };
    
    var surprised = {
        label: "SURPRISED",
        data: emotion_object['SURPRISED'],
        borderColor: 'apricot'
    };

    var disgusted = {
        label: "DISGUSTED",
        data: emotion_object['DISGUSTED'],
        borderColor: 'brown'
    };
    //TODO: change to time
    var speedData = {
        labels: seconds,
        datasets: [calm,happy,sad,angry,surprised,fear,disgusted,confused]
    };
    if(userType == 'Admin'){
        new Chart(ctx, {
            type: 'line',
            data: speedData,
            options: {
                animation: false
            }
        });
    }

}

setInterval(onClickScreenShot,20000)//Runs the "func" function every 30 seconds
document.getElementById('stop').addEventListener('click', stopCall);
async function stopCall(event) {
    event.preventDefault();

    const observer = {
        audioVideoDidStop: sessionStatus => {
          const sessionStatusCode = sessionStatus.statusCode();
          if (sessionStatusCode === configuration.Left) {
            /*
              - You called meetingSession.audioVideo.stop().
              - When closing a browser window or page, Chime SDK attempts to leave the session.
            */
            console.log('You left the session');
          } else {
            console.log('Stopped with a session status code: ', sessionStatusCode);
          }
        }
      };
    
    meetingSession.audioVideo.addObserver(observer);
    
    meetingSession.audioVideo.stop();
    clearInterval(timerVar);
}
