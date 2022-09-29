'use strict';

goog.provide('Blockly.MobileRobot.tasks');
goog.require('Blockly.MobileRobot');

// task block in left workspace (these are the function calls)
Blockly.MobileRobot['custom_task'] = function(block) {
  var task = Blockly.MobileRobot.variableDB_.getName(block.getFieldValue('TASK'), Blockly.Variables.NAME_TYPE); //returns the scrubbed task name
  var register = registers_station_mapping[block.getFieldValue('SITE')];
  var code = ` ${task}(${register})\n`;
  return code;
};
  
// task block in right workspace (these are the defined functions)
Blockly.MobileRobot['custom_taskheader'] = function(block) {
  var currentTask = Blockly.MobileRobot.variableDB_.getName(block.getFieldValue('TASK'), Blockly.Variables.NAME_TYPE); //returns the scrubbed task name
  var code = ` def ${currentTask}(register):\n`;
  code += moveToStation(); //function contained in ur5_defines.js (called with no argument default == "register")
  code = code.replace(/[\n]/g,"\n\t"); //tabs in the moveToStation function so it lines up properly
  code = code.substring(0, code.length-1); //remove the final \t
  return code;
};
  