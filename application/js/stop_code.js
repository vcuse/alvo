var stopButton = document.getElementById('robot-moving-modal-stop-button');

stopButton.onclick = function(e) {
    console.log("Stop button pressed");
    window.chrome.webview.postMessage("STOP");  
};
