import * as superagent from 'superagent/dist/superagent';

let apiKey;
let version="0.0.7"; // default version override by getLatestModelVersionAndSubmit
let base64data;      // video payload

/**
 * Submit job.
 * First get the latest version of the deepfake model, then submit
 * @param pBase64data
 * @param pApiKey
 */
function submitJob(pBase64data, pApiKey){
    apiKey = pApiKey;
    base64data = pBase64data

    getLatestModelVersionAndSubmit();

}

/**
 * Get the latest version from deepfake model
 * After that submit the job with this version or use default if call fails
 */
function getLatestModelVersionAndSubmit(){
    superagent
        .get("https://app.modzy.com/api/models/93ltr2oepu/versions?isAvailable=true&isActive=true&sort-by=version&direction=DESC")
        .set("Accept", "application/json")
        .set("Authorization", "ApiKey "+ apiKey)
        .redirects(0)
        .end(function (err, res) {
            if (err || !res.ok) {
                // ignore error, use default version
            } else {
                // because &sort-by=version&direction=DESC latest version is at pos 0
                version = res.body[0]["version"];
            }
            submitToLatestVersion();
        });
}

/**
 * Submit job to latest model version
 */
function submitToLatestVersion(){
    console.log("submitToLatestVersion enter");
    superagent
        .post("https://app.modzy.com/api/jobs")
        .send({
            model: {
                identifier: "93ltr2oepu",
                version: version,
            },
            input: {
                type: "embedded",
                sources: {
                    "my-input": {
                        "input.mp4": base64data
                    },
                },
            },
        })
        .set("Content-Type", "application/json")
        .set("Authorization", "ApiKey "+ apiKey)
        .redirects(0)
        .end(function (err, res) {
            if (err || !res.ok) {
                console.error("Oh no! error");
            } else {
                pollStatus(res.body["jobIdentifier"]);
            }
        });
}

/**
 * Poll job status with interval until finished
 *
 * @param jobIdentifier
 */
function pollStatus(jobIdentifier){

    const pollJobInterval = setInterval(function (){
        superagent
            .get("https://app.modzy.com/api/jobs/" + jobIdentifier)
            .set("Content-Type", "application/json")
            .set("Authorization", "ApiKey "+ apiKey)
            .redirects(0)
            .end(function (err, res) {
                if (err || !res.ok) {
                    console.error("Oh no! error");
                } else {
                    let jobStatus = res.body["status"]
                    if("COMPLETED" === jobStatus || "TIMEDOUT" === jobStatus || "CANCELED" === jobStatus || "ERROR" === jobStatus){
                        clearInterval(pollJobInterval);
                        getJobResult(jobIdentifier);
                    }
                }
            });
    }, 500);
}

/**
 * Get result from finished job and process status from result
 *
 * @param jobIdentifier
 */
function getJobResult(jobIdentifier){
    superagent
        .get("https://app.modzy.com/api/results/" + jobIdentifier)
        .set("Content-Type", "application/json")
        .set("Authorization", "ApiKey "+ apiKey)
        .redirects(0)
        .end(function (err, res) {
            if (err || !res.ok) {
                console.error("Oh no! error");
            } else {
                // check for general error response
                if(res.body["failures"] !== undefined){
                    updateModelResult("FAILED", res.body["failures"]["my-input"]["error"]);
                }else{
                    // no error, process job status
                    let status = res.body["results"]["my-input"]["status"];
                    if("SUCCESSFUL" === status){
                        let score = res.body["results"]["my-input"]["results.json"]["input.mp4"];
                        updateModelResult(status, parseFloat((score).toFixed( 2 )));
                    }else {
                        let error = res.body["results"]["my-input"]["error"];
                        updateModelResult(status, error);
                    }
                }

            }
        });
}

/**
 * Update gui div with info about model result
 *
 * @param status
 * @param result
 */
function updateModelResult(status, result){
    let resultDIV = document.getElementById("deep-check-results");;
    let message = document.getElementById("result-deepfake-message");
    if("SUCCESSFUL" === status){
        if(result >= 0.5){
            message.innerHTML = ":-(<br>This is a DeepFake video.<br>AI is <b>" + (result*100) +"%</b> sure.";
            resultDIV.style.color="red";
        }else{
            message.innerHTML = "^_^<br>No DeepFake video.<br> AI is <b>" + (100-(result*100)) +"%</b> sure.";
            resultDIV.style.color="green";
        }
    }else {
        message.innerHTML = "Oops, sorry, this should not happen. <br>Try again later.<br><br>Is the face in the video easy to see and not too small?<br><br>Error: " + result;
    }
    document.getElementById("preload-deepfake").style.display="none";
    resultDIV.style.display="inline";
}

export {submitJob};

