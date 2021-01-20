
const aws = require('amazon-chime-sdk-js');


const logger = new aws.ConsoleLogger('MyLogger', aws.LogLevel.INFO);
const deviceController = new aws.DefaultDeviceController(logger);
// let configuration
// let meetingSession
document.getElementById('submit').addEventListener('click', onClick);

async function onClick(event) {
    event.preventDefault();
    
    const meeting_name = document.getElementById("meeting-name").value;

    const response = await fetch('/meeting',{
        method:'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({meeting_name: meeting_name})
    });

    const data = await response.json();
    const meetingResponse = data.meetingResponse;
    const attendeeResponse = data.attendee;
    // configuration = new aws.MeetingSessionConfiguration(meetingResponse, attendeeResponse);

    const configuration = new aws.MeetingSessionConfiguration(meetingResponse, attendeeResponse);
    // In the usage examples below, you will use this meetingSession object.
    // meetingSession = new aws.DefaultMeetingSession(
    //     configuration,
    //     logger,
    //     deviceController
    // );

    const meetingSession = new aws.DefaultMeetingSession(
        configuration,
        logger,
        deviceController
    );

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
                videoElement.setAttribute("is-local", tileState.localTile);
                videoElement.id = "video-" + tileState.tileId;
                document.getElementById("video-list").append(videoElement);
                meetingSession.audioVideo.bindVideoElement(
                    tileState.tileId,
                    videoElement
                );
            }

        
            
        }
    };

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



document.getElementById('screenshot').addEventListener('click', onClickScreenShot);
async function onClickScreenShot(event) {
    let snapshots = [];
    event.preventDefault();
   
    let video =  document.querySelectorAll('[is-local="true"]')[0];
    let canvas = capture(video, 0.25);

    let screenshot = canvas.toDataURL('image/png');
    // console.log(screenshot);

    const response = await fetch('/facial',{
        method:'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({emotions: screenshot})
    });
    const data = await response.json();
    // console.log(data)
    snapshots.push(data)
    console.log(snapshots[0][0]['Type'])
    // console.log(configuration)

    // SEND TO AWS REKO

    // canvas.onClickScreenShot = function() {
    //     window.open(this.toDataURL(image/jpg));
        
    //     console.log("image out",this.toDataURL(image/jpg));
    // };
    
    // snapshots.push(canvas);
    // output.innerHTML = '';
    // // for (var i = 0; i < 4; i++) {
    // //     output.append(snapshots[i]);
    // // }
    // snapshots.forEach(element => output.appendChild(element));

}

// // setInterval(onClickScreenShot,5000)//Runs the "func" function every second
// document.getElementById('stop').addEventListener('click', stopCall);
// async function stopCall(event) {
//     event.preventDefault();

//     const observer = {
//         audioVideoDidStop: sessionStatus => {
//           const sessionStatusCode = sessionStatus.statusCode();
//           if (sessionStatusCode === configuration.Left) {
//             /*
//               - You called meetingSession.audioVideo.stop().
//               - When closing a browser window or page, Chime SDK attempts to leave the session.
//             */
//             console.log('You left the session');
//           } else {
//             console.log('Stopped with a session status code: ', sessionStatusCode);
//           }
//         }
//       };
      
//     meetingSession.audioVideo.addObserver(observer);
    
//     meetingSession.audioVideo.stop();
// }
var ctx = document.getElementById('myChart').getContext('2d');
var dataFirst = {
    label: "Car A - Speed (mph)",
    data: [0, 59, 75, 20, 20, 55, 40],
    lineTension: 0.3,
    // Set More Options
    borderColor: 'red'
};
     
var dataSecond = {
label: "Car B - Speed (mph)",
data: [20, 15, 60, 60, 65, 30, 70],
// Set More Options
borderColor: 'black'
};

var thirdSecond = {
    label: "Car C - Speed (mph)",
    data: [0,10,25,74,64,65,80],
    // Set More Options
    borderColor: 'green'
};
    
var speedData = {
labels: ["0s", "10s", "20s", "30s", "40s", "50s", "60s"],
datasets: [dataFirst, dataSecond,thirdSecond]
};
   
   
var lineChart = new Chart(ctx, {
    type: 'line',
    data: speedData
});