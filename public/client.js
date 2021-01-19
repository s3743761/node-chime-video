
const aws = require('amazon-chime-sdk-js');

const logger = new aws.ConsoleLogger('MyLogger', aws.LogLevel.INFO);
const deviceController = new aws.DefaultDeviceController(logger);


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
    const configuration = new aws.MeetingSessionConfiguration(meetingResponse, attendeeResponse);

    // In the usage examples below, you will use this meetingSession object.
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