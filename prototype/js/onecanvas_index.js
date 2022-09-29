// Injects Blockly into the html page and adds event handlers.
// For the one-canvas programming page

var toolbox = document.getElementById("toolbox");
var leftWorkspace = Blockly.inject('leftdiv',
  { media: 'blockly/media/',
    toolbox: toolboxLeft,
    trashcan: true,
    toolboxPosition: "start",
    move:{
      scrollbars: true,
      drag: false,
      wheel: false}
});
var rightWorkspaces = []; //just an empty array placeholder as there is no right workspace in onecanvas, (start_code.js checks if this variable is empty)

//NOTE: This is just to avoid code duplication (between one and two-canvas) when saving the workspace id's for the teach positions in define_position.js
var currentRightWorkspace = leftWorkspace;

var workspaceBlocks = document.getElementById("workspaceBlocks");
Blockly.Xml.domToWorkspace(workspaceBlocks, leftWorkspace);

leftWorkspace.getAllBlocks().forEach(block => { block.setMovable(false); block.setDeletable(false); block.setEditable(false) });

Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate')
Blockly.ContextMenuRegistry.registry.unregister('blockCollapseExpand')
Blockly.ContextMenuRegistry.registry.unregister('collapseWorkspace')
Blockly.ContextMenuRegistry.registry.unregister('expandWorkspace')

Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.COPY)
Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.CUT)
Blockly.ShortcutRegistry.registry.unregister(Blockly.ShortcutItems.names.PASTE)

function onDriveRobotSelected(event) {
  if (event.type == Blockly.Events.BLOCK_CREATE) {
    for (i = 0; i < event.ids.length; i++) {
      var block = leftWorkspace.getBlockById(event.ids[i])
      if (block.type == 'custom_robot_drive') {
        block.getField("SITE").setValue($('#station-select').val()); //sets station of newly created robot drive block to that of the station dropdown selection
      }
    }
  }
}

leftWorkspace.addChangeListener(onDriveRobotSelected);
leftWorkspace.addChangeListener(listenForVariable); //listener for variable changes
leftWorkspace.createVariable("Above Table");
leftWorkspace.createVariable("Above Buffer");