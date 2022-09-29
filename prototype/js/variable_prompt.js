/**
 * This file contains the functions for creating the variable prompt modal that occurs on a new position or rename selection.
 */

 var rename_variable_callback;   //stores the callback reference for the variable prompt
 var renameVariableWorkspace;    //stores workspace id that variable is being renamed in. Comes from dropdowncreate function
 var selectedVariable;           //stores the currently selected variable in dropdown. Comes from dropdowncreate function. Used for reteach position option.
 
 /**
  * Wrapper to window.prompt() that app developers may override to provide
  * alternatives to the modal browser window. Built-in browser prompts are
  * often used for better text input experience on mobile device. We strongly
  * recommend testing mobile when overriding this.
  * @param {string} message The message to display to the user.
  * @param {string} defaultValue The value to initialize the prompt with.
  * @param {!function(?string)} callback The callback for handling user response.
  */
 Blockly.prompt = function(message, defaultValue, callback) {
 
   //if it is a Rename variable prompt use this modal else use default prompt
   if(message.includes("Rename")){
     $('#variable-prompt-modal').modal('show'); //show teach position modal
     $("#variable-prompt-modal-warning").html("Name your location:").css("color", "black");
     $("#variable-name-input").val(defaultValue);
     $("#variable-name-input").focus();
     rename_variable_callback = callback;  //store reference to callback for later use
   }else{
     callback(prompt(message, defaultValue));
   }
   
 };
 
 /**
    * Event listener for variable prompt modal cancel button
    */
  document.getElementById("variable-prompt-modal-cancel-button").addEventListener("click", canceledModal);
  function canceledModal() {
    $('#variable-prompt-modal').modal('hide');
    rename_variable_callback(null);
  };
 
  /**
   * Event listener for variable prompt modal confirm rename button
   */
  document.getElementById("variable-prompt-modal-confirm-button").addEventListener("click", confirmedModal);
  function confirmedModal() {

     var inputVal = $("#variable-name-input").val(); //get form input 
     //get all variables within the workspace that the dropdown was created in
     var workspaceVariables = currentRightWorkspace.getAllVariables();
 
     //if user is trying to overwrite an already named variable do not close modal and allow them to do it
     if(workspaceVariables.find(o => o.name.toLowerCase() === inputVal.toLowerCase())){
         $("#variable-prompt-modal-warning").html("Location name already exists!").css("color", "red");
         $("#variable-name-input").trigger("focus");
     } 
     else{
         $('#variable-prompt-modal').modal('hide');
         rename_variable_callback(inputVal);
     }    
  };
 