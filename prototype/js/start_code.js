/**
 * When Start button is pressed the code is generated and sent to the wpf for writing to the controller
 */

var executionButton = document.getElementById('execution-button');

executionButton.onclick = function(e) {  
  var code = `${programStart}`;
            
  if (rightWorkspaces) { 
    for (var v in rightWorkspaces) {
      if(typeof rightWorkspaces[v] !== 'undefined'){ 
        Blockly.MobileRobot.init(rightWorkspaces[v]);  //have to initialize workspaces
        code += Blockly.MobileRobot.blockToCode(rightWorkspaces[v].getBlockById("CustomTask")) + ' end\n';
      }        
    }
  }
  
  Blockly.MobileRobot.init(leftWorkspace);  //have to initialize workspaces
  code += Blockly.MobileRobot.blockToCode(leftWorkspace.getBlockById("START")) + `${programEnd}`;

  console.log(code);

  //check if all move locations are taught in the blocks and send the code if that is the case
  if(!code.includes("!ERROR!")) window.chrome.webview.postMessage(code);
  else console.log("<somewhere> variable found in a move block!");
  
};
