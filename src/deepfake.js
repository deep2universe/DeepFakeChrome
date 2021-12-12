import {dragElement} from './dragRecordingDiv';
import {submitJob} from "./modzyDeepFakeModel";


let isRecording=false;
let mainVideo = document.getElementsByClassName("html5-main-video")[0];
let recordingTimeMS = 5000;
let apiKey;

/**
 * Init extension for content page
 *
 * @param pApiKey
 */
function init(pApiKey){
    apiKey=pApiKey;

    initDeepFakeButtonInPlayer();

}

/**
 * Since it sometimes takes a while to construct the gui, new player buttons are added in an interval if the right-controls are available
 */
function initDeepFakeButtonInPlayer(){
    const buttonAvailableInterval = setInterval(function (){
        var animControlsButton = document.getElementsByClassName("ytp-right-controls");
        if (animControlsButton !== undefined){
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
            clearInterval(buttonAvailableInterval);
        }
    }, 100);
}

/**
 * Show the recorded video always in a new review-div.
 */
function showVideoToCheck(){

    removePreviewPlayerDiv(); // if we already showing a preview div, remote it

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

/**
 * Removes the preview player div if exists
 */
function removePreviewPlayerDiv(){
    var previewPlayer = document.getElementById("recordingDiv");
    if(previewPlayer !== null){
        previewPlayer.parentNode.removeChild(previewPlayer);
    }
}

function wait(delayInMS) {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function startStopRecording(){
    let recordedBlob;
    mainVideo = document.getElementsByClassName("html5-main-video")[0];
    // if(!isRecording){

        // stop(document.getElementsByClassName("html5-main-video")[0]);
        document.getElementById("content").style.backgroundColor="#8b0000";
        startRecording(mainVideo.captureStream(), recordingTimeMS)
        .then (recordedChunks => {
            document.getElementById("content").style.backgroundColor="#ffffff";
            showVideoToCheck();
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
    stream.getTracks().forEach(track => track.stop());
}


window.addEventListener("onhashchange", function() {
    if(!location.href.includes("watch")){
        if(document.getElementById("recordingDiv") !== null){
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
 * Remove recordingDiv if we do not watch a video
 */
function onUrlChange() {
    if(!location.href.includes("watch")){
        if(document.getElementById("recordingDiv") !== null){
            document.getElementById("recordingDiv").remove();
        }
    }
}

export {init};
