var blockMode = document.getElementById("toolboxTrigger");

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

var triggerValidator = function (newName) {
  var oldName = this.getValue('TRIGGER');
  var triggerCalls = leftWorkspace.getBlocksByType('custom_trigger').filter(block => block.getFieldValue('TRIGGER') == oldName);
  newName = getCollisionFreeTriggerName(newName);
  for (i = 0; i < triggerCalls.length; i++) {
    triggerCalls[i].getField('TRIGGER').setValidator(null);
    triggerCalls[i].getField('TRIGGER').setValue(newName);
    triggerCalls[i].getField('TRIGGER').setValidator(triggerValidator);
  }
  if (blockMode) {
    rightWorkspaces["!" + newName] = rightWorkspaces["!" + oldName];
    rightWorkspaces["!" + oldName] = undefined;
    definedPositions["!" + newName] = definedPositions["!" + oldName];
    definedPositions["!" + oldName] = undefined;
  }
  currentRightDiv.id = '__!' + newName + "div";
  if (blockMode) {
    var triggerHeader = rightWorkspaces["!" + newName].getBlocksByType('custom_triggerheader')[0];
    triggerHeader.getField('TRIGGER').setValidator(null);
    triggerHeader.getField('TRIGGER').setValue(newName);
    triggerHeader.getField('TRIGGER').setValidator(triggerValidator);
    definedTriggers = definedTriggers.filter(trig => trig != oldName);
    definedTriggers.push(newName);
  }
  else {
    graph = graphs[oldName];
    delete graphs[oldName];
    graphs[newName] = graph;
    node = triggerNodes[oldName];
    delete triggerNodes[oldName];
    triggerNodes[newName] = node;
    graph.model.beginUpdate();
    graph.model.setValue(node, newName);
    node.getGeometry().width = graph.getPreferredSizeForCell(node).width + 10;
    graph.model.endUpdate();
    graph.refresh();
    definedTriggers = definedTriggers.filter(trigger => trigger != oldName);
    definedTriggers.push(newName);
  }
  
  return newName;
}

function highlightTaskBlocks(taskName) {
  leftWorkspace.getAllBlocks().forEach(block => leftWorkspace.highlightBlock(block.id, false));
  leftWorkspace.getAllBlocks().filter(block => (block.type == 'custom_task' && block.getFieldValue('TASK') == taskName)).forEach(block => leftWorkspace.highlightBlock(block.id, true));
}

function redrawStack() {
  var copyCount = 0;
  if (currentSelectedBlock != null && currentSelectedBlock.type == 'custom_task') {
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
}

function onChangeLeft(event) {
  if (event.type == Blockly.Events.BLOCK_CREATE) {
    for (i = 0; i < event.ids.length; i++) {
      var block = leftWorkspace.getBlockById(event.ids[i])
      if (block.type == 'custom_task') {
        definedTasks.push(block.getFieldValue("TASK"));
        block.getField("TASK").setValidator(taskValidator);
      }
      if (block.type == 'custom_trigger') {
        definedTriggers.push(block.getFieldValue("TRIGGER"));
        block.getField("TRIGGER").setValidator(triggerValidator);
      }
    }
  }


  if (event.type == Blockly.Events.CHANGE && event.blockId == currentSelectedBlock.id && currentSelectedBlock.type == 'custom_task') {
    currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").setValue(currentSelectedBlock.getField("SITE").getValue());
  }
  if (event.type == Blockly.Events.BLOCK_DELETE) {
    redrawStack();
  }
  if (event.type == 'selected') {
    var selectedBlock = leftWorkspace.getBlockById(event.newElementId);

    if (selectedBlock && selectedBlock != currentSelectedBlock) {
      if (selectedBlock.type == 'custom_task') {
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
      else if (selectedBlock.type == 'custom_trigger') {
        currentSelectedBlock = selectedBlock;
        highlightTaskBlocks('');
        if (currentRightDiv) {
          $('#animatediv').animate({opacity: '0'}, "normal", doTriggerSelected);
        }
        else {
          document.getElementById('animatediv').style.opacity = "0";
          doTriggerSelected();
        }
      }
      else {
        currentSelectedBlock = selectedBlock;
        highlightTaskBlocks('');
        if (currentRightDiv) {
          $('#animatediv').animate({opacity: '0'}, "normal");
        }
        else {
          document.getElementById('animatediv').style.opacity = "0";
        }
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
        if (block && block.type == 'custom_triggerheader') {
          block.getField("TRIGGER").setValidator(triggerValidator);
        }
      }
    }
    if (event.type == Blockly.Events.CHANGE && currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader') && event.blockId == currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').id) {
      currentSelectedBlock.getField("SITE").setValue(currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").getValue());
    }
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

function doTriggerSelected() {
  if (currentRightDiv) {
    currentRightDiv.style.display = 'none';
  }
  var triggerName = "!" + currentSelectedBlock.getFieldValue("TRIGGER");
  if (blockMode) {
    if (document.getElementById("__" + triggerName + "div")) {
      currentRightDiv = document.getElementById("__" + triggerName + "div");
      currentRightDiv.style.display = 'block';
      currentRightWorkspace = rightWorkspaces[triggerName]; 
      redrawStack();
      Blockly.svgResize(currentRightWorkspace);
    }
    else {
      currentRightDiv = document.createElement('div');
      currentRightDiv.id = "__" + triggerName + "div";
      currentRightDiv.classList.add('workspace');
      currentRightDiv.style.position = 'relative';
      redrawStack();

      document.getElementById('animatediv').appendChild(currentRightDiv);
      currentRightWorkspace = Blockly.inject("__" + triggerName + "div",
        { media: pathPrefix + 'blockly/media/',
          toolbox: toolboxTrigger,
          trashcan: true,
          move:{
            scrollbars: true,
            drag: false,
            wheel: false}
      });
      rightWorkspaces[triggerName] = currentRightWorkspace;
      var block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'custom_triggerheader');
      block.setAttribute('x', '28');
      block.setAttribute('y', '28');
      var field = Blockly.utils.xml.createElement('field');
      field.setAttribute('name', 'TRIGGER');
      field.setAttribute('id', currentSelectedBlock.getFieldValue("TRIGGER"));
      var name = Blockly.utils.xml.createTextNode(currentSelectedBlock.getFieldValue("TRIGGER"));
      field.appendChild(name);
      block.appendChild(field);
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom('<xml xmlns="https://developers.google.com/blockly/xml">' + Blockly.Xml.domToText(block) + '</xml>'), currentRightWorkspace);
      currentRightWorkspace.getAllBlocks().forEach(block => { block.setDeletable(false); });
      currentRightWorkspace.addChangeListener(onTaskHeaderChanged);
      currentRightWorkspace.addChangeListener(logEvent);
    }
  }
  else {
    if (document.getElementById("__" + triggerName + "div")) {
      currentRightDiv = document.getElementById("__" + triggerName + "div");
      currentRightDiv.style.display = 'block';
      redrawStack();
      //Blockly.svgResize(currentRightWorkspace);
    }
    else {
      currentRightDiv = document.createElement('div');
      currentRightDiv.id = "__" + triggerName + "div";
      currentRightDiv.classList.add('graphspace');
      currentRightDiv.style.position = 'relative';
      redrawStack();

      document.getElementById('animatediv').appendChild(currentRightDiv);
      setupGraph(currentRightDiv, currentSelectedBlock.getFieldValue("TRIGGER"));
    }
  }

  $('#animatediv').animate({opacity: '1'}, "normal");
}


leftWorkspace.addChangeListener(onChangeLeft);