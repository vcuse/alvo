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

  if (copyCount == 0) {
    currentSelectedBlock = null;
    if (currentRightDiv) {
      $('#animatediv').animate({opacity: '0'}, "normal");
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
        block.getField("SITE").setValue($('#station-select').val()); //sets station of newly created task block to that of the station dropdown selection
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
  }
}

var overlayElem;
var promptElem;

function clearOverlay() {
  overlayElem.remove();
  promptElem.remove();
  overlayElem = null;
  promptElem = null;
  confirmed = true;
}

function doTaskSelected() {
  confirmed = false;  

  if (currentRightDiv) {
    currentRightDiv.style.display = 'none';
  }

  // fix error where currentSelectedBlock sometimes set to null ( in redrawstack() ) before this function runs if a quick delete occurs
  if(currentSelectedBlock === null) return;

  var taskName = currentSelectedBlock.getFieldValue("TASK");
  var div_name = "__" + taskName.replace(/ /g, "_") + "div";

  if (document.getElementById(div_name)) {
    currentRightDiv = document.getElementById(div_name);
    currentRightDiv.style.display = 'block';
    currentRightWorkspace = rightWorkspaces[taskName]; 
    redrawStack();
    Blockly.svgResize(currentRightWorkspace);
  }
  else {
    currentRightDiv = document.createElement('div');
    currentRightDiv.id = div_name;
    currentRightDiv.classList.add('col-12');
    redrawStack();

    document.getElementById('animatediv').appendChild(currentRightDiv);
    
    currentRightWorkspace = Blockly.inject(div_name,
      { media: 'blockly/media/',
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
    block.setAttribute('x', '38');
    block.setAttribute('y', '28');
    block.setAttribute('id', 'CustomTask');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TASK');
    field.setAttribute('id', currentSelectedBlock.getFieldValue("TASK"));
    var name = Blockly.utils.xml.createTextNode(currentSelectedBlock.getFieldValue("TASK"));
    field.appendChild(name);
    block.appendChild(field);
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom('<xml xmlns="https://developers.google.com/blockly/xml">' + Blockly.Xml.domToText(block) + '</xml>'), currentRightWorkspace);
    currentRightWorkspace.getAllBlocks().forEach(block => { block.setMovable(false); block.setDeletable(false) });
    currentRightWorkspace.addChangeListener(onTaskHeaderChanged);
    currentRightWorkspace.addChangeListener(listenForVariable); //listener for variable changes
    currentRightWorkspace.createVariable("Above Table");
    currentRightWorkspace.createVariable("Above Buffer");
  }
  currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").setValue(currentSelectedBlock.getField("SITE").getValue());

  $('#animatediv').animate({opacity: '1'}, "normal");
}


leftWorkspace.addChangeListener(onTaskSelected);