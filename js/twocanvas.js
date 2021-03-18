function onTaskSelected(event) {
  if (event.type == Blockly.Events.CHANGE && event.blockId == currentSelectedBlock.id) {
    currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").setValue(currentSelectedBlock.getField("SITE").getValue());
  }
  if (event.type == 'selected') {
    var selectedBlock = leftWorkspace.getBlockById(event.newElementId);
    if (selectedBlock && selectedBlock.type == 'custom_task' && selectedBlock != currentSelectedBlock) {
      currentSelectedBlock = selectedBlock;
      leftWorkspace.highlightBlock(selectedBlock.id);
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
  if (event.type == Blockly.Events.CHANGE && event.blockId == currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').id) {
    currentSelectedBlock.getField("SITE").setValue(currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").getValue());
  }
  else {
    onTaskChanged(event);
  }
}

var confirmed = false;

function onTaskChanged(event) {
  if (event.type != 'ui') {
    var count = 0;
    var currentTask = currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getFieldValue('TASK');
    leftWorkspace.getAllBlocks().filter(block => block.type == 'custom_task').forEach(block => { if (block.getFieldValue('TASK') == currentTask) count++; });
    if (count > 1)
      copyEditDialogue();
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
    prompt2.style.width = '250px';
    prompt2.style.height = '130px';
    prompt2.style.marginTop = '50px';
    prompt2.style.fontSize = '.875rem';
    prompt2.style.border = '1px black solid';
    prompt2.style.padding = '3px';
    promptElem.appendChild(prompt2);
    prompt2.innerHTML = 'You are about to edit all places where this task is used. Do you want to create a copy of the task first?<br><br>';
    var copyButton = document.createElement('button');
    copyButton.id = 'copyButton';
    copyButton.classList.add('btn');
    copyButton.classList.add('btn-primary');
    copyButton.classList.add('btn-sm');
    copyButton.innerHTML = 'Create Copy';
    prompt2.appendChild(copyButton);
    prompt2.innerHTML += ' '; 
    var editButton = document.createElement('button');
    editButton.id = 'editButton';
    editButton.classList.add('btn');
    editButton.classList.add('btn-secondary');
    editButton.classList.add('btn-sm');
    editButton.innerHTML = 'Edit Existing Task';
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
  var promptAndCheckWithAlert = function(defaultName, opt_callback) {
    Blockly.Variables.promptName("Please enter a name for the copy of the current task:", defaultName,
        function(text) {
          if (text) {
            var existing =
                nameUsedWithAnyType(text, workspace);
            if (existing) {
              var msg = "A task with name '%1' already exists!".replace(
                '%1', existing.name);              
              Blockly.alert(msg,
                  function() {
                    promptAndCheckWithAlert(text);  // Recurse
                  });
            } else {
              // No conflict
              workspace.createVariable(text, '');
              if (opt_callback) {
                opt_callback(text);
              }
            }
          } else {
            // User canceled prompt.
            if (opt_callback) {
              opt_callback(null);
            }
          }
        });
  };
  promptAndCheckWithAlert('Copy of ' + currentTask, function (newName) {
    currentSelectedBlock.getField('TASK').setValue(newName);
    //currentRightWorkspace.undo(false);
    var savedDom = workspaceToDom(currentRightWorkspace, true);
    //currentRightWorkspace.undo(true);
    var oldDivId = currentRightDiv.id;
    currentRightDiv.id = '__' + newName + "div";

    savedRightDiv = document.createElement('div');
    savedRightDiv.id = oldDivId;
    savedRightDiv.classList.add('workspace');
    savedRightDiv.style.position = 'relative';
    document.getElementById('animatediv').appendChild(savedRightDiv);
    savedRightWorkspace = Blockly.inject(oldDivId,
      { media: 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
    });
    Blockly.Xml.domToWorkspace(savedDom, savedRightWorkspace);
    savedRightDiv.style.display = 'none';
    currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField('TASK').setValue(newName);
    rightWorkspaces[currentTask] = savedRightWorkspace;
    rightWorkspaces[newName] = currentRightWorkspace;
    definedPositions[newName] = definedPositions[currentTask];
    savedRightWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
    savedRightWorkspace.addChangeListener(onTaskHeaderChanged);
    clearOverlay();
  });
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
    Blockly.svgResize(currentRightWorkspace);
  }
  else {
    currentRightDiv = document.createElement('div');
    currentRightDiv.id = "__" + taskName + "div";
    currentRightDiv.classList.add('workspace');
    currentRightDiv.style.position = 'relative';
    document.getElementById('animatediv').appendChild(currentRightDiv);
    currentRightWorkspace = Blockly.inject("__" + taskName + "div",
      { media: 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
    });
    rightWorkspaces[taskName] = currentRightWorkspace;
    currentRightWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_taskheader');
    block.setAttribute('x', '38');
    block.setAttribute('y', '38');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TASK');
    field.setAttribute('id', currentSelectedBlock.getFieldValue("TASK"));
    var name = Blockly.utils.xml.createTextNode(currentSelectedBlock.getFieldValue("TASK"));
    field.appendChild(name);
    block.appendChild(field);
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom('<xml xmlns="https://developers.google.com/blockly/xml">' + Blockly.Xml.domToText(block) + '</xml>'), currentRightWorkspace);
    currentRightWorkspace.getAllBlocks().forEach(block => { block.setDeletable(false); });
    currentRightWorkspace.addChangeListener(onTaskHeaderChanged);
  }
  currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").setValue(currentSelectedBlock.getField("SITE").getValue());

  $('#animatediv').animate({opacity: '1'}, "normal");
}


leftWorkspace.addChangeListener(onTaskSelected);