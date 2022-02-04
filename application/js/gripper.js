/**
 * Functions for the open/close gripper buttons.
 */

 var open_gripper_button = document.getElementById('open-gripper-button');
 var close_gripper_button = document.getElementById('close-gripper-button');
 
 
 open_gripper_button.onclick = function(){   
    var code = "def myProg():\n" +
                openGripper +
                "end\n";

    console.log(code);
    window.chrome.webview.postMessage(code);
 }
 
 close_gripper_button.onclick = function(){   
    var code = "def myProg():\n" +
                closeGripper +
                "end\n";
                
    console.log(code);
    window.chrome.webview.postMessage(code);
 }
 