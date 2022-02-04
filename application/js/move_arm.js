/**
 * Functions for moving the UR arm between the table and the buffer.
 */

var moveArmButton = document.getElementById('move-arm-button');

moveArmButton.onclick = function(){
  var code = `${programStart}`;
  code += checkPoseReachability();
  
  var moveArmLocation = $('#move-arm-select').val(); //read select value

  if(moveArmLocation === "Table"){    
    code += moveArmToTable();
  }
  else if(moveArmLocation === "Buffer"){
    code += moveArmToBuffer();
  }
  else if(moveArmLocation === "Safety"){
    code += moveArmToSafety();
  }

  code += `${programEnd}`;
  console.log(code);
  window.chrome.webview.postMessage(code);
}
