//POP UP A TEACH POSITION MODAL HERE
'use strict';

goog.provide('define_position');

var ur5_poses = {"Above Table" : overTable, "Above Buffer" : overBuffer}; //TODO: ensure workspace variables are copied over on COPY event
var armVariableRenamed = false;
var newVariableName = "";

/**
 * Redirects variable delete and rename events.
 */
function listenForVariable(event) {    
    //redirect
    if (event.type == Blockly.Events.VAR_DELETE) variableDeleteEvent_(event);
    else if (event.type == Blockly.Events.VAR_RENAME) variableRenameEvent_(event); 
  }
 
/**
 * Called on DELETE event
 */
function variableDeleteEvent_(event) {
    console.log("variable delete event");
    delete ur5_poses[currentRightWorkspace.id][event.varName];
  }

/**
 * Called on RENAME event
 */
function variableRenameEvent_(event) {
    /**
     * NOTE! <somewhere> is hard coded. It is the defaultVariableName. This is the fastest way to do this.
     * The teach position modal should popup if a new block is deployed, meaning default variable name is
     * triggering the rename event. Otherwise this event is just a rename on an already named variable and
     * the teach modal should not pop up. The reteach modal is used for already named variable position alterations.
     */
    if(event.oldName == "<somewhere>"){   
      newVariableName = event.newName;  //so get position function knows which variable to put target to
      $('#position-modal').modal('show'); //show teach position modal
      window.chrome.webview.postMessage(enable_freedrive); // so that user can move ur around by hand
      $('#position-modal').attr('data-value', 'new-position');
      $("#position-modal-warning").html(`Please move arm to the desired position.`)
    }else{  //adjust key to new variable name
      ur5_poses[currentRightWorkspace.id][event.newName] = ur5_poses[currentRightWorkspace.id][event.oldName];
      delete ur5_poses[currentRightWorkspace.id][event.oldName];
    }    
  }

  /**
   * Event listener for teach position modal cancel button
   */
document.getElementById("position-modal-cancel-button").addEventListener("click", canceledModal);
function canceledModal() {
  // Only allow closing if a reteach position is occuring to allow user not to overwrite their
  // previously taught position. Else enforce a teach of the new variable they declared in the workspace
  // which they can then delete from the variable menu if they so desire.
  if($('#position-modal').attr('data-value') !== "new-position"){
    console.log("position modal closed");
    $('#position-modal').modal('hide');
  }
};

/**
 * Event listener for teach position modal confirm teach position button
 */
document.getElementById("position-modal-confirm-button").addEventListener("click", confirmedModal);
function confirmedModal() {
  if($('#position-modal').attr('data-value') == "new-position"){
    const options = {once : true};
    $('#position-modal').modal('hide');
    //register listener for message from host app and pass event to handler
    //receives a new robtarget for both arms from the host app when the Ok button is pressed
    window.chrome.webview.addEventListener('message', urPoseReceivedEvent, options);
    window.chrome.webview.postMessage(`UPDATE_ARM_POSITION`); //request position of arm
  }else if($('#position-modal').attr('data-value') == "reteach-position"){
    const options = {once : true};   
    $('#position-modal').modal('hide');
    //register listener for message from host app and pass event to handler
    //receives a new robtarget for both arms from the host app when the Ok button is pressed
    window.chrome.webview.addEventListener('message', urReteachPoseReceivedEvent, options);
    window.chrome.webview.postMessage(`UPDATE_ARM_POSITION`); //request position of arm
  }    
};

//this function triggers an autosave by changing save button value to autosave and clicking button
function autosave(){
  $('#save-button').val("autosave"); //change button value to autosave
  $("#save-button").trigger("click");
}

//called when user requests a new position teach and position modal data-attribute is set to "new-position"
//get the current arm position
//saved by rightworkspace id so that if taskname is changed, it will still track
function urPoseReceivedEvent(event){
  if(event.data === ""){  //if message received is empty string then an error occurred so delete varName
    alert('Pose data received from UR5 is empty/invalid!');
  }else{  //else set robtarget to specified variable name
    if(!ur5_poses.hasOwnProperty(currentRightWorkspace.id)) ur5_poses[currentRightWorkspace.id] = {};
    ur5_poses[currentRightWorkspace.id][newVariableName] = event.data;
    //console.log(ur5_poses);
  }
  newVariableName = "";
  autosave(); //autosave workspace after a new position has been taught
}

//get the current arm position
function urReteachPoseReceivedEvent(event){ 
  if(event.data !== ""){  //if message received is empty string then an error occurred so leave position alone. Otherwise adjust
    ur5_poses[currentRightWorkspace.id][selectedVariable] = event.data;     //selectedVariable comes from variablePrompt.js  
    autosave(); //autosave workspace after a position has been retaught
  }
}
