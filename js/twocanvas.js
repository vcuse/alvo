var taskValidator = function (newName) {
  var oldName = this.getValue('TASK');
  var taskCalls = leftWorkspace.getBlocksByType('custom_task').filter(block => block.getFieldValue('TASK') == oldName);
  newName = getCollisionFreeTaskName(newName);
  for (i = 0; i < taskCalls.length; i++) {
    taskCalls[i].getField('TASK').setValidator(null);
    taskCalls[i].getField('TASK').setValue(newName);
    taskCalls[i].getField('TASK').setValidator(taskValidator);
  }
  rightWorkspaces[newName] = rightWorkspaces[oldName];
  rightWorkspaces[oldName] = undefined;
  definedPositions[newName] = definedPositions[oldName];
  definedPositions[oldName] = undefined;
  currentRightDiv.id = '__' + newName + "div";
  var taskHeader = rightWorkspaces[newName].getBlocksByType('custom_taskheader')[0];
  taskHeader.getField('TASK').setValidator(null);
  taskHeader.getField('TASK').setValue(newName);
  taskHeader.getField('TASK').setValidator(taskValidator);
  definedTasks = definedTasks.filter(task => task != oldName);
  definedTasks.push(newName);
  return newName;
}

function highlightTaskBlocks(taskName) {
  leftWorkspace.getAllBlocks().forEach(block => leftWorkspace.highlightBlock(block.id, false));
  leftWorkspace.getAllBlocks().filter(block => (block.type == 'custom_task' && block.getFieldValue('TASK') == taskName)).forEach(block => leftWorkspace.highlightBlock(block.id, true));
}

function redrawStack() {
  var copyCount = 0;
  var taskName = currentSelectedBlock.getFieldValue("TASK");
  leftWorkspace.getAllBlocks().filter(block => (block.type == 'custom_task' && block.getFieldValue('TASK') == taskName)).forEach(block => copyCount++);  
  if (copyCount > 1) {
    document.getElementById("stackedRest").style.display = 'block';
    currentRightDiv.classList.add("stackedTop");
  }
  else {
    if (copyCount == 0) {
      currentSelectedBlock = null;
      if (currentRightDiv) {
        $('#animatediv').animate({opacity: '0'}, "normal");
      }
    }
    else {
      document.getElementById("stackedRest").style.display = 'none';
      currentRightDiv.classList.remove("stackedTop");
    }
  }
}

function onTaskSelected(event) {
  if (event.type == Blockly.Events.BLOCK_CREATE) {
    for (i = 0; i < event.ids.length; i++) {
      var block = leftWorkspace.getBlockById(event.ids[i])
      if (block.type == 'custom_task') {
        definedTasks.push(block.getFieldValue("TASK"));
        block.getField("TASK").setValidator(taskValidator);
      }
    }
  }


  if (event.type == Blockly.Events.CHANGE && event.blockId == currentSelectedBlock.id) {
    currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").setValue(currentSelectedBlock.getField("SITE").getValue());
  }
  if (event.type == Blockly.Events.BLOCK_DELETE) {
    redrawStack();
  }
  if (event.type == 'selected') {
    var selectedBlock = leftWorkspace.getBlockById(event.newElementId);
    if (selectedBlock && selectedBlock.type == 'custom_task' && selectedBlock != currentSelectedBlock) {
      currentSelectedBlock = selectedBlock;
      highlightTaskBlocks(currentSelectedBlock.getFieldValue("TASK"));
      if (currentRightDiv) {
        $('#animatediv').animate({opacity: '0'}, "normal", doTaskSelected);
      }
      else {
        document.getElementById('animatediv').style.opacity = "0";
        doTaskSelected();
      }
    }
  }
}

function onTaskHeaderChanged(event) {
  if (currentRightWorkspace) {
    if (event.type == Blockly.Events.BLOCK_CREATE) {
      for (i = 0; i < event.ids.length; i++) {
        var block = currentRightWorkspace.getBlockById(event.ids[i])
        if (block && block.type == 'custom_taskheader') {
          block.getField("TASK").setValidator(taskValidator);
        }
      }
    }
    if (event.type == Blockly.Events.CHANGE && event.blockId == currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').id) {
      currentSelectedBlock.getField("SITE").setValue(currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").getValue());
    }
    else {
      onTaskChanged(event);
    }
  }
}

var confirmed = false;

function onTaskChanged(event) {
  if (!event.isUiEvent && event.workspaceId == currentRightWorkspace.id && event.type != Blockly.Events.BLOCK_CREATE && event.oldCoordinate) {
    var count = 0;
    var currentTask = currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getFieldValue('TASK');
    leftWorkspace.getAllBlocks().filter(block => block.type == 'custom_task').forEach(block => { if (block.getFieldValue('TASK') == currentTask) count++; });
    //if (count > 1)
    //  copyEditDialogue();
  }
}

var overlayElem;
var promptElem;
function copyEditDialogue() {
  if (!overlayElem && !confirmed) {
    overlayElem = document.createElement('div');
    overlayElem.style.position = 'absolute';
    overlayElem.style.zIndex = '99';
    overlayElem.style.backgroundColor = '#999999';
    overlayElem.style.opacity = '50%';
    overlayElem.style.width = '100%';
    overlayElem.style.height = '100%';
    promptElem = document.createElement('div');
    promptElem.style.zIndex = '100';
    promptElem.style.position = 'absolute';
    promptElem.style.left = '50%';
    var prompt2 = document.createElement('div');
    prompt2.style.position = 'relative';
    prompt2.style.left = '-50%';
    prompt2.style.backgroundColor = '#FFFFFF';
    prompt2.style.opacity = '100%';
    prompt2.style.width = '310px';
    prompt2.style.height = '145px';
    prompt2.style.marginTop = '50px';
    prompt2.style.fontSize = '.875rem';
    prompt2.style.border = '1px black solid';
    prompt2.style.padding = '6px';
    prompt2.style.paddingTop = '15px';

    promptElem.appendChild(prompt2);
    prompt2.innerHTML = 'The task you are editing is used multiple times. Do you want to change all of them or only the currently selected usage?<br><br>';
    var copyButton = document.createElement('button');
    copyButton.id = 'editButton';
    copyButton.classList.add('btn');
    copyButton.classList.add('btn-primary');
    copyButton.classList.add('btn-sm');
    copyButton.innerHTML = 'Edit task everywhere';
    prompt2.appendChild(copyButton);
    prompt2.innerHTML += ' '; 
    var editButton = document.createElement('button');
    editButton.id = 'copyButton';
    editButton.classList.add('btn');
    editButton.classList.add('btn-secondary');
    editButton.classList.add('btn-sm');
    editButton.innerHTML = 'Edit only this usage';
    prompt2.appendChild(editButton);
    currentRightDiv.insertBefore(overlayElem, currentRightDiv.firstChild);
    currentRightDiv.insertBefore(promptElem, currentRightDiv.firstChild);
    document.getElementById('editButton').onclick = clearOverlay;
    document.getElementById('copyButton').onclick = copyTask;
  }
}

function clearOverlay() {
  overlayElem.remove();
  promptElem.remove();
  overlayElem = null;
  promptElem = null;
  confirmed = true;
}

function copyTask() {
  var workspace = leftWorkspace;
  var currentTask = currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getFieldValue('TASK');

  var newName = getCollisionFreeTaskName(currentTask);
  currentSelectedBlock.getField('TASK').setValidator(null);
  currentSelectedBlock.getField('TASK').setValue(newName);
  currentSelectedBlock.getField('TASK').setValidator(taskValidator);
  currentRightWorkspace.undo(false);
  var savedDom = workspaceToDom(currentRightWorkspace, true);
  currentRightWorkspace.undo(true);
  var oldDivId = currentRightDiv.id;
  currentRightDiv.id = '__' + newName + "div";

  savedRightDiv = document.createElement('div');
  savedRightDiv.id = oldDivId;
  savedRightDiv.classList.add('workspace');
  savedRightDiv.style.position = 'relative';
  document.getElementById('animatediv').appendChild(savedRightDiv);
  savedRightWorkspace = Blockly.inject(oldDivId,
    { media: pathPrefix + 'blockly/media/',
      toolbox: toolboxRight,
      trashcan: true,
      move:{
        scrollbars: true,
        drag: false,
        wheel: false}
  });
  Blockly.Xml.domToWorkspace(savedDom, savedRightWorkspace);
  savedRightDiv.style.display = 'none';
  rightWorkspaces[currentTask] = savedRightWorkspace;
  rightWorkspaces[newName] = currentRightWorkspace;
  definedPositions[newName] = definedPositions[currentTask];
  savedRightWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
  savedRightWorkspace.addChangeListener(onTaskHeaderChanged);
  currentRightWorkspace.getBlocksByType('custom_taskheader')[0].getField('TASK').setValidator(null);
  currentRightWorkspace.getBlocksByType('custom_taskheader')[0].getField('TASK').setValue(newName);
  currentRightWorkspace.getBlocksByType('custom_taskheader')[0].getField('TASK').setValidator(taskValidator);
  highlightTaskBlocks(newName);
  redrawStack();
  clearOverlay();
}

function doTaskSelected() {
  confirmed = false;
  if (currentRightDiv) {
    currentRightDiv.style.display = 'none';
  }
  var taskName = currentSelectedBlock.getFieldValue("TASK");

  if (document.getElementById("__" + taskName + "div")) {
    currentRightDiv = document.getElementById("__" + taskName + "div");
    currentRightDiv.style.display = 'block';
    currentRightWorkspace = rightWorkspaces[taskName]; 
    redrawStack();
    Blockly.svgResize(currentRightWorkspace);
  }
  else {
    currentRightDiv = document.createElement('div');
    currentRightDiv.id = "__" + taskName + "div";
    currentRightDiv.classList.add('workspace');
    currentRightDiv.style.position = 'relative';
    redrawStack();

    document.getElementById('animatediv').appendChild(currentRightDiv);
    currentRightWorkspace = Blockly.inject("__" + taskName + "div",
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        move:{
          scrollbars: true,
          drag: false,
          wheel: false}
    });
    rightWorkspaces[taskName] = currentRightWorkspace;
    currentRightWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_taskheader');
    block.setAttribute('x', '28');
    block.setAttribute('y', '28');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TASK');
    field.setAttribute('id', currentSelectedBlock.getFieldValue("TASK"));
    var name = Blockly.utils.xml.createTextNode(currentSelectedBlock.getFieldValue("TASK"));
    field.appendChild(name);
    block.appendChild(field);
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom('<xml xmlns="https://developers.google.com/blockly/xml">' + Blockly.Xml.domToText(block) + '</xml>'), currentRightWorkspace);
    currentRightWorkspace.getAllBlocks().forEach(block => { block.setDeletable(false); });
    currentRightWorkspace.addChangeListener(onTaskHeaderChanged);
    currentRightWorkspace.addChangeListener(logEvent);
  }
  currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").setValue(currentSelectedBlock.getField("SITE").getValue());

  $('#animatediv').animate({opacity: '1'}, "normal");
}


leftWorkspace.addChangeListener(onTaskSelected);