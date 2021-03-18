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

