import {dragElement} from './dragRecordingDiv';
import {submitJob} from "./modzyDeepFakeModel";


let isRecording=false;
let mainVideo = document.getElementsByClassName("html5-main-video")[0];
let recordingTimeMS = 5000;
let apiKey;

function init(pApiKey){
    apiKey=pApiKey;
    if ('MediaRecorder' in window) {
        // everything is good, let's go ahead
        console.log("browser supports MediaRecorder");
    } else {
        console.log("Sorry, your browser doesn't support the MediaRecorder API, so this demo will not work.");
    }

    var animControlsButton = document.getElementsByClassName("ytp-right-controls");
    if(document.getElementById("deepfake") === null || document.getElementById("deepfake") === undefined){
        var button = document.createElement('button');
        button.id="deepfake";
        button.className = 'ytp-button it-player-button';
        button.dataset.title = "Deepfake detection";
        button.onclick = function(){startStopRecording();}
        animControlsButton[0].insertBefore(button, animControlsButton[0].childNodes[0]);

        let playerImage = new Image();
        playerImage.src = chrome.runtime.getURL("/images/logo48.png");
        playerImage.onload = () => {
            var imgTag = document.createElement('img');
            imgTag.src=playerImage.src;
            button.appendChild(imgTag);
        }
    }

}

function showVideoToCheck(){
    if(document.getElementById("captureVideo") === null){
        const div = document.createElement('div');
        // div.style="position:absolute;top:100px"
        div.id="recordingDiv"
        div.innerHTML = `
              <div id="recordingDivHeader">Click here to move</div>
              <span style="text-align: left" onclick="document.getElementById('recordingDiv').style.display='none'"><u>[X]Close this window</u></span><br>
              <video id="recording" width="260" height="220" controls></video>
              <br>
                <div id="preload-deepfake">  
                <span style="font-size: medium">Processing...</span><br>                  
                </div>
              <br>
              <div id="deep-check-results" style="display: none">
                <h3>Result:</h3><br>
                <span id="result-deepfake-message" style="font-size: large">       
                </span>
                
              </div>
              <br>
              <a id="downloadButton" class="button">
                Video download
              </a>
        `;
        document.getElementById("content").append(div);

        var image = document.createElement("img");
        image.src = chrome.runtime.getURL("images/preloader.gif");
        document.getElementById("preload-deepfake").appendChild(image);

        dragElement(div);
    }
}

function wait(delayInMS) {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function startStopRecording(){
    let recordedBlob;
    // if(!isRecording){

        // stop(document.getElementsByClassName("html5-main-video")[0]);
        startRecording(mainVideo.captureStream(), recordingTimeMS)
        .then (recordedChunks => {
            showVideoToCheck();
            // console.log("then from start recording");
            recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
            recording.src = URL.createObjectURL(recordedBlob);
            downloadButton.href = recording.src;
            downloadButton.download = "RecordedVideo.webm";
        }).then(()=>{
            let reader = new window.FileReader();
            reader.readAsDataURL(recordedBlob);
            reader.onloadend = function () {
               let base64data = reader.result;
                submitJob(base64data, apiKey);
            }

        });


    // }else {
    //     // startRecording(document.getElementsByClassName("html5-main-video")[0],5000);
    // }
    // isRecording = !isRecording;
}

async function startRecording(stream, lengthInMS) {
    // console.log("strartRecording");

    var options = { mimeType: "video/webm" };
    let recorder = new MediaRecorder(stream,options);
    let data = [];
    recorder.ondataavailable = event => data.push(event.data);
    recorder.start();

    let stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = event => reject(event.name);
    });

    let recorded = wait(lengthInMS).then(
        () => recorder.state == "recording" && recorder.stop()
    );

    return Promise.all([
        stopped,
        recorded
    ])
        .then(() => data);
}

function stop(stream) {
    // console.log("call stop func");
    stream.getTracks().forEach(track => track.stop());

}


window.addEventListener("onhashchange", function() {
    if(!location.href.includes("watch")){
        if(document.getElementById("recordingDiv") !== null){
            console.log("I will remove this")
            document.getElementById("recordingDiv").remove();
        }
    }
});

/**
 * Check if URL Change and remove ai processing div if visible
 * https://www.youtube.com -> no video watching
 * https://www.youtube.com/watch* -> video watching
 *
 * @type {string}
 */
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
    }
}).observe(document, {subtree: true, childList: true});

/**
 * Clear detector interval when we are not watching a video.
 */
function onUrlChange() {
    if(!location.href.includes("watch")){
        if(document.getElementById("recordingDiv") !== null){
            console.log("I will remove this")
            document.getElementById("recordingDiv").remove();
        }
    }
}

export {init};
