// Injects Blockly into the html page and adds event handlers.

var toolbox = document.getElementById("toolbox");
var leftWorkspace = Blockly.inject('leftdiv',
  { media: 'blockly/media/',
    toolbox: toolboxLeft,
    trashcan: true,
    toolboxPosition: "start",
    move:{
      scrollbars: false,
      drag: false,
      wheel: false}
});

var workspaceBlocks = document.getElementById("workspaceBlocks");
Blockly.Xml.domToWorkspace(workspaceBlocks, leftWorkspace);

leftWorkspace.registerToolboxCategoryCallback(
  'TASKS', flyoutTaskCategory);
leftWorkspace.registerToolboxCategoryCallback(
  'TRIGGERS', triggersFlyoutCategory);

Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate')
Blockly.ContextMenuRegistry.registry.unregister('blockCollapseExpand')
Blockly.ContextMenuRegistry.registry.unregister('collapseWorkspace')
Blockly.ContextMenuRegistry.registry.unregister('expandWorkspace')


var currentSelectedBlock = null;
var currentRightDiv = null;
var currentRightWorkspace = null
var rightWorkspaces = [];

function onTaskSelected(event) {
  if (event.type == Blockly.Events.CHANGE && event.blockId == currentSelectedBlock.id) {
    currentRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField("SITE").setValue(currentSelectedBlock.getField("SITE").getValue());
  }
  if (event.type == Blockly.Events.UI && event.element == 'selected') {
    var selectedBlock = leftWorkspace.getBlockById(event.newValue);
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
    Blockly.svgResize(currentRightWorkspace);
  }
  else {
    currentRightDiv = document.createElement('div');
    currentRightDiv.id = "__" + taskName + "div";
    currentRightDiv.classList.add('workspace');
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