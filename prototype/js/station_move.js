/**
 * Functionality for commanding the MiR to drive to Station A, B, or C is contained here
 */

var drive_to_station_button = document.getElementById('move-station-button');

drive_to_station_button.onclick = function() {
    var station_to_move_to = $('#station-select').val(); //read select value
    
    //create UR code
    var code = `${programStart}`;
    code += checkPoseReachability();
    code += moveToStation(station_to_move_to); //function contained in ur5_defines.js
    code += `${programEnd}`;

    console.log(code);
    /* Submit the code for the arm */
    window.chrome.webview.postMessage(code);
}
