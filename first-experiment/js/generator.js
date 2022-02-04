'use strict';

goog.provide('Blockly.JavaScript.sim');

goog.require('Blockly.JavaScript');

var generated = [];
var currentTask = 'DEFAULT';
var currentHead = null;

Blockly.JavaScript['custom_triggerstart'] = function(block) {
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  currentHead = block;
  var code = 'Simulator[' + Simulator.instance + '].trigger["' + block.getFieldValue('TRIGGER') + '"] = function() {\n';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    code += Blockly.JavaScript.blockToCode(nextBlock);
    currentHead = null;
    return code + "\n}";
  }
  currentHead = null;
  return '';
};


Blockly.JavaScript['custom_start'] = function(block) {
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  currentHead = block;
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    var code = 'var station = null;\nvar callback = function() { Simulator[' + Simulator.instance + '].idle = true; };\n\n ' + Blockly.JavaScript.blockToCode(nextBlock);
    currentHead = null;
    return code;
  }
  currentHead = null;
  return 'Simulator[' + Simulator.instance + '].idle = true';
};

Blockly.JavaScript['custom_robotmove'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var site = block.getFieldValue('SITE');
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  if (site != "NONE") {
    var moveCode = 'Simulator[' + Simulator.instance + '].robot.moveToStation(Simulator[' + Simulator.instance + '].station["' + site + '"]';
    if (nextBlock) {
      moveCode += ', function() { station = "' + site + '"; ' + Blockly.JavaScript.blockToCode(nextBlock) + '})';
    }
    else {
      moveCode += ', function() { callback(); })';
    }
  }
  else {
    var moveCode = 'station = null; reportError("No target station selected for move command! Ignoring this command.", true);';
    if (nextBlock) {
      moveCode += Blockly.JavaScript.blockToCode(nextBlock);
    }
    else {
      moveCode += 'Simulator[' + Simulator.instance + '].idle = true;';
    }
  }
  return moveCode;
};

Blockly.JavaScript['custom_task'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var site = block.getFieldValue('SITE');
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  if (site != "NONE") {
    var moveCode = 'Simulator[' + Simulator.instance + '].robot.moveToStation(Simulator[' + Simulator.instance + '].station["' + site + '"]';
    var taskCode = ', function() { Simulator[' + Simulator.instance + '].task["' + block.getFieldValue('TASK') + '"]("' + site + '",';
    if (nextBlock) {
      taskCode += "function() { " + Blockly.JavaScript.blockToCode(nextBlock) + '})})';
    }
    else {
      taskCode += 'function() { callback(); })})';
    }
  }
  else {
    var moveCode = 'reportError("No target station selected for task! Ignoring this task.", true); ';
    if (nextBlock) {
      moveCode += Blockly.JavaScript.blockToCode(nextBlock);
    }
    else {
      moveCode += 'Simulator[' + Simulator.instance + '].idle = true;';
    }
  }
  return moveCode + taskCode;
};

Blockly.JavaScript['custom_taskheader'] = function(block) {
  if (generated[block.id]) 
    return '';
  currentHead = block;
  currentTask = block.getFieldValue('TASK');
  generated[block.id] = true;
  var code = 'Simulator[' + Simulator.instance + '].task["' + block.getFieldValue('TASK') + '"] = function(station, callback) {\n';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    code += Blockly.JavaScript.blockToCode(nextBlock);
  }
  currentHead = null;
  return code + "\n}";
};

Blockly.JavaScript['custom_pickup'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var location = Blockly.JavaScript.valueToCode(block, 'LOCATION', 0)
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  var armCode = 'Simulator[' + Simulator.instance + '].robot.pickupFromStation(Simulator[' + Simulator.instance + '].station[station], ' + location;
  if (nextBlock) {
    armCode += ", function() {" + Blockly.JavaScript.blockToCode(nextBlock) + '})'
  }
  else {
    armCode += ', function() { callback(); })';
  }
  return armCode;
};

Blockly.JavaScript['custom_place'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var location = Blockly.JavaScript.valueToCode(block, 'LOCATION', 0)
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  var armCode = 'Simulator[' + Simulator.instance + '].robot.placeAtStation(Simulator[' + Simulator.instance + '].station[station], ' + location;
  if (nextBlock) {
    armCode += ", function() {" + Blockly.JavaScript.blockToCode(nextBlock) + '})'
  }
  else {
    armCode += ', function() { callback(); })';
  }
  return armCode;
};

Blockly.JavaScript['custom_turn'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  var armCode = 'Simulator[' + Simulator.instance + '].robot.turnCarriedItem("' + block.getFieldValue('DIRECTION') + '"';
  if (nextBlock) {
    armCode += ", function() {" + Blockly.JavaScript.blockToCode(nextBlock) + '})'
  }
  else {
    armCode += ', function() { callback(); })';
  }
  return armCode;
};

Blockly.JavaScript['custom_dummylocation'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  return ['"center", 0', 0];
};

Blockly.JavaScript['custom_location'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  return [definedPositions[currentTask][block.getFieldValue('LOCATION')], 0];
};

Blockly.JavaScript['procedures_callnoreturn'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  // Call a procedure with a return value.
  var funcName = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var code = funcName + "(";
  if (nextBlock) {
    code += "function() {" + Blockly.JavaScript.blockToCode(nextBlock) + '})';
  }
  else {
    code += 'function() { callback(); })';
  }
  return code;
};

Blockly.JavaScript['procedures_defnoreturn'] = function(block) {
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  currentHead = block;
  // Define a procedure with a return value.
  var funcName = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var branch = Blockly.JavaScript.statementToCode(block, 'STACK');
  var code = 'function ' + funcName + '(callback) {\n' +
      branch + '\n}';
  return code;
};

Blockly.JavaScript.scrub_ = function(_block, code, _opt_thisOnly) {
  // Optionally override
  return code;
};