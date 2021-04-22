// Injects Blockly into the html page and adds event handlers.

var definedPositions = [];

Blockly.Blocks['custom_task'].customContextMenu = function(options) {
  if (this.isInFlyout) {
    return;
  }
  var copyOption = {enabled: true};
  var name = this.getFieldValue('TASK');
  copyOption.text = "Duplicate task '%1'".replace('%1', name);
  var block = this;
  var counter = 2;
  var collisions = leftWorkspace.getBlocksByType('custom_task').filter(block => block.getFieldValue('TASK') == name + counter);

  while (collisions.length > 0) {
    counter += 1;
    collisions = leftWorkspace.getBlocksByType('custom_task').filter(block => block.getFieldValue('TASK') == (name + counter));
  }
  var newName = name + counter;
  var xmlCopy = Blockly.utils.xml.createElement('block');
  xmlCopy.setAttribute('type', 'custom_task');
  var task = Blockly.utils.xml.createElement('field');
  task.setAttribute('name', 'TASK');
  task.innerHTML = newName;
  xmlCopy.appendChild(task);
  var station = Blockly.utils.xml.createElement('field');
  station.setAttribute('name', 'SITE');
  station.innerHTML = this.getFieldValue('SITE');
  xmlCopy.appendChild(station);

  copyOption.callback = function () {
    var savedDom = workspaceToDom(currentRightWorkspace, true);
    var newRightDiv = document.createElement('div');
    newRightDiv.id = '__' + newName + 'div';
    newRightDiv.classList.add('workspace');
    newRightDiv.style.position = 'relative';
    document.getElementById('animatediv').appendChild(newRightDiv);
    var copiedRightWorkspace = Blockly.inject(newRightDiv.id,
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        move:{
          scrollbars: true,
          drag: false,
          wheel: false}
    });
    Blockly.Xml.domToWorkspace(savedDom, copiedRightWorkspace);
    newRightDiv.style.display = 'none';
    copiedRightWorkspace.getAllBlocks().find(block => block.type == 'custom_taskheader').getField('TASK').setValue(newName);
    rightWorkspaces[newName] = copiedRightWorkspace;
    definedPositions[newName] = definedPositions[name];
    copiedRightWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
    copiedRightWorkspace.addChangeListener(onTaskHeaderChanged);
    redrawStack();
    Blockly.ContextMenu.callbackFactory(block, xmlCopy)();
  }
  options.push(copyOption);
}

var toolbox = document.getElementById("toolbox");
var leftWorkspace = Blockly.inject('leftdiv',
  { media: pathPrefix + 'blockly/media/',
    toolbox: toolboxLeft,
    trashcan: true,
    toolboxPosition: "start",
    move:{
      scrollbars: true,
      drag: false,
      wheel: false}
});
var rightWorkspaces = [];
var currentSelectedBlock = null;
var currentRightDiv = null;
var currentRightWorkspace = null;

var workspaceBlocks = document.getElementById("workspaceBlocks");
Blockly.Xml.domToWorkspace(workspaceBlocks, leftWorkspace);

leftWorkspace.registerToolboxCategoryCallback(
  'TASKS', flyoutTaskCategory);
leftWorkspace.registerToolboxCategoryCallback(
  'TRIGGERS', triggersFlyoutCategory);
leftWorkspace.registerToolboxCategoryCallback(
  'LOCATIONS', flyoutLocationCategory);


Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate')
Blockly.ContextMenuRegistry.registry.unregister('blockCollapseExpand')
Blockly.ContextMenuRegistry.registry.unregister('collapseWorkspace')
Blockly.ContextMenuRegistry.registry.unregister('expandWorkspace')

Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.COPY)
Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.CUT)
Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.PASTE)
