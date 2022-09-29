/**
 * Logic for the open workspace button
 */

var openFileButton = document.getElementById('open-file-button');

openFileButton.onclick = function() {
    if($('#open-file-button').val() == "two-canvas") window.chrome.webview.postMessage('TWO_CANVAS_OPEN_FILE');
    else if($('#open-file-button').val() == "one-canvas") window.chrome.webview.postMessage('ONE_CANVAS_OPEN_FILE');

    const options = {once : true};
    window.chrome.webview.addEventListener('message', openFileReceivedEvent, options);
}

function openFileReceivedEvent(event){
  if(event.data !== "OPEN_FILE_ERROR"){    
    //file contents are being sent, check if they are for the appropriate canvas
    if($('#open-file-button').val() == "one-canvas" && event.data.includes("<SAVE_FILE_ONE_CANVAS>")){
      var file = event.data.replace('<SAVE_FILE_ONE_CANVAS>','');
      file = JSON.parse(file);
      ur5_poses = file.urRobTargets;

      //Place proper id of workspace into the object
      ur5_poses[leftWorkspace.id] = ur5_poses["SingleCanvas"];
      delete ur5_poses["SingleCanvas"];

      /*This loads the xml back into the workspace*/
      var leftWorkspace_xml = Blockly.Xml.textToDom(file.leftWorkspace_xml_text);
      Blockly.Events.disable(); // stop station selections from being reset
      Blockly.Xml.clearWorkspaceAndLoadFromXml(leftWorkspace_xml, leftWorkspace);
      Blockly.Events.enable();
      //get all variables within the workspaces to see if "Above Table and Above Buffer" are there
      var leftWorkspaceVariables = leftWorkspace.getAllVariables();
      if(leftWorkspaceVariables.find(o => o.name.toLowerCase() === "Above Table") === undefined) leftWorkspace.createVariable("Above Table");
      if(leftWorkspaceVariables.find(o => o.name.toLowerCase() === "Above Buffer") === undefined) leftWorkspace.createVariable("Above Buffer");
    }
    // ensure you are actually opening a two-canvas file into this two-canvas application
    else if($('#open-file-button').val() == "two-canvas" && event.data.includes("<SAVE_FILE_TWO_CANVAS>")){
      var file = event.data.replace('<SAVE_FILE_TWO_CANVAS>','');
      file = JSON.parse(file);
      ur5_poses = file.urRobTargets;
      /*This loads the left workspace xml back into the workspace*/
      var leftWorkspace_xml = Blockly.Xml.textToDom(file.leftWorkspace_xml_text);
      Blockly.Events.disable(); // stop station selections from being reset
      Blockly.Xml.clearWorkspaceAndLoadFromXml(leftWorkspace_xml, leftWorkspace);
      Blockly.Events.enable();

      // have to create the div for the workspace to be loaded into
      for (var name in file.rightWorkspaces_xml_text) {
        var rightWorkspace = Blockly.Xml.textToDom(file.rightWorkspaces_xml_text[name]);
        var newWorkspaceId = createRightWorkspace(name, rightWorkspace);
        //Place proper id of workspace into the object
        ur5_poses[newWorkspaceId] = ur5_poses[name] || {};
        delete ur5_poses[name];
      }
    }
  }
}

// creates each div by name and loads the xml
// returns the newly created workspace id
function createRightWorkspace (workspaceName, workspace) {
  var newRightDiv = document.createElement('div');
  newRightDiv.id = '__' + workspaceName.replace(/ /g, "_") + 'div';
  newRightDiv.classList.add('col-12');
  document.getElementById('animatediv').appendChild(newRightDiv);

  var copiedRightWorkspace = Blockly.inject(newRightDiv.id,
    { media: 'blockly/media/',
      toolbox: toolboxRight,
      trashcan: true,
      move:{
        scrollbars: true,
        drag: false,
        wheel: false}
  });
  Blockly.Xml.domToWorkspace(workspace, copiedRightWorkspace);
  newRightDiv.style.display = 'none';
  copiedRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField('TASK').setValue(workspaceName);
  //get all variables within the workspaces to see if "Above Table and Above Buffer" are there
  var rightWorkspaceVariables = copiedRightWorkspace.getAllVariables();
  if(rightWorkspaceVariables.find(o => o.name.toLowerCase() === "Above Table") === undefined) copiedRightWorkspace.createVariable("Above Table");
  if(rightWorkspaceVariables.find(o => o.name.toLowerCase() === "Above Buffer") === undefined) copiedRightWorkspace.createVariable("Above Buffer");
  rightWorkspaces[workspaceName] = copiedRightWorkspace;
  copiedRightWorkspace.addChangeListener(onTaskHeaderChanged);
  copiedRightWorkspace.addChangeListener(listenForVariable); //listener for variable changes

  /* var xmlCopy = Blockly.utils.xml.createElement('block');
  xmlCopy.setAttribute('type', 'custom_task');
  var task = Blockly.utils.xml.createElement('field');
  task.setAttribute('name', 'TASK');
  task.innerHTML = workspaceName;
  xmlCopy.appendChild(task);
  var station = Blockly.utils.xml.createElement('field');
  station.setAttribute('name', 'SITE');
  station.innerHTML = this.getFieldValue('SITE');
  xmlCopy.appendChild(station);

  Blockly.ContextMenu.callbackFactory(block, xmlCopy)() */;
  definedTasks.push(workspaceName);
  return copiedRightWorkspace.id;
}