import * as superagent from 'superagent/dist/superagent';

let apiKey;

function submitJob(base64data, pApiKey){
    apiKey = pApiKey;
    superagent
        .post("https://app.modzy.com/api/jobs")
        .send({
            model: {
                identifier: "93ltr2oepu",
                version: "0.0.6",
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

