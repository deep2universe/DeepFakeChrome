
let deepfakeChecks = {};

// Load deepfakeChecks from chrome storage
function init() {
  chrome.storage.sync.get(['deepfakeChecks'], function(result) {
    if (result.deepfakeChecks) {
      deepfakeChecks = result.deepfakeChecks;
    }
    generateTable();
  });

}

// Generat thml table from deepfakeChecks
function generateTable() {
  var mytable = "<table><tr>\n" +
      "            <th>Status</th>\n" +
      "            <th>Certain</th>\n" +
      "            <th>Link</th>\n" +
      "            <th>Cecked</th>\n" +
      "            <th>Delete</th>\n" +
      "        </tr>";
  for (var key=deepfakeChecks.length-1; key>=0; key--) {
    let icon = deepfakeChecks[key].isFake ? "❌ Fake": "✅ Ok";
    mytable += "<tr>\n" +
        "            <td>" + icon + "</td>\n" +
        "            <td>" + deepfakeChecks[key].score + "%</td>\n" +
        "            <td><a href=\"" + deepfakeChecks[key].page_url + "\" target=\"_blank\">" + deepfakeChecks[key].page_title + "</a></td>\n" +
        "            <td>" + deepfakeChecks[key].timeChecked + "</td>\n" +
        "            <td><button id=\"" + key +"\">🗑</button></td>\n" +
        "        </tr>";
  }

  mytable += "</table>";
  // Update div history with table
  document.getElementById("history").innerHTML = mytable;
  // Add event listener to delete button
  initButtonClickEvents();
}

/**
 * Create onClickFunction for delete button
 */
function initButtonClickEvents() {
  for (var i = 0; i < deepfakeChecks.length; i++) {
    document.getElementById(i).onclick = function() {
      deepfakeChecks.splice(this.id, 1);
      chrome.storage.sync.set({'deepfakeChecks': deepfakeChecks}, function() {
      });
      generateTable();
    };
  }
}

// init deepfakeChecks
init();
