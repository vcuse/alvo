'use strict';

goog.provide('Blockly.JavaScript.sim');

goog.require('Blockly.JavaScript');

var generated = [];
var currentTask = 'DEFAULT';
var currentTrigger = 'DEFAULT';
var currentHead = null;
var currentOp = '&&';
var currentExpression = '';


Blockly.JavaScript['custom_start'] = function(block) {
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  currentHead = block;
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var code = "var resolve = resolve;\nvar station = null;\nvar callback = function() { resolve(); Simulator[" + Simulator.instance + "].runIdle(); };\n\n";
      code += 'Simulator[' + Simulator.instance + '].queue.push("__START__");\n';
    code += 'Simulator[' + Simulator.instance + '].signalCheck["__START__"] = function() { return true; };\n';
  if (nextBlock) {
    code += 'Simulator[' + Simulator.instance + '].trigger["__START__"] = function(callback) { reportError(' + Simulator.instance + ', "Now executing \'When program is started\' block.", true); ' + Blockly.JavaScript.blockToCode(nextBlock) + ' };\n';
  }
  else {
    code += 'Simulator[' + Simulator.instance + '].trigger["__START__"] = function(callback) { callback(); };\n';
  }
  currentHead = null;
  return code;
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
    var moveCode = 'station = null; reportError('+ Simulator.instance +', "No target station selected for move command! Ignoring this command.", true);';
    if (nextBlock) {
      moveCode += Blockly.JavaScript.blockToCode(nextBlock);
    }
    else {
      moveCode += 'Simulator[' + Simulator.instance + '].runIdle();';
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
    var moveCode = 'reportError(' + Simulator.instance + ', "No target station selected for task! Ignoring this task.", true); ';
    if (nextBlock) {
      moveCode += Blockly.JavaScript.blockToCode(nextBlock);
    }
    else {
      moveCode += 'Simulator[' + Simulator.instance + '].runIdle();';
    }
  }
  return moveCode + taskCode;
};

Blockly.JavaScript['custom_trigger'] = function(block) {
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  currentHead = block;
  var code = 'Simulator[' + Simulator.instance + '].trigger["' + block.getFieldValue('TRIGGER') + '"] = function(callback) { reportError(' + Simulator.instance + ', "Now executing \'' + block.getFieldValue('TRIGGER') + '\' block.", true);\n';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    code += ' ' + Blockly.JavaScript.blockToCode(nextBlock);
  }
  currentHead = null;
  return code + '\n}';
};


Blockly.JavaScript['custom_and'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var firstChild = block.getInputTargetBlock("INPUT");
  var innerCode = '';
  if (firstChild) {
    var tempOp = currentOp;
    currentOp = '&&';
    innerCode = Blockly.JavaScript.blockToCode(firstChild);
    currentOp = tempOp;
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return currentOp + '(true' + innerCode + ')' + Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    return currentOp + '(true' + innerCode + ')';
  }
};

Blockly.JavaScript['custom_or'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var firstChild = block.getInputTargetBlock("INPUT");
  var innerCode = '';
  if (firstChild) {
    var tempOp = currentOp;
    currentOp = '||';
    innerCode = Blockly.JavaScript.blockToCode(firstChild);
    currentOp = tempOp;
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return currentOp + '(false' + innerCode + ')' + Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    return currentOp + '(false' + innerCode + ')';
  }
};

Blockly.JavaScript['custom_button1'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var thisCode = 'Simulator[' + Simulator.instance + '].signal["button1"]';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return currentOp + thisCode + Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    return currentOp + thisCode;
  }
};

Blockly.JavaScript['custom_button2'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var thisCode = 'Simulator[' + Simulator.instance + '].signal["button2"]';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return currentOp + thisCode + Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    return currentOp + thisCode;
  }
};


Blockly.JavaScript['custom_emptygripper'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var thisCode = '';
  if (block.getFieldValue('EMPTYSTATUS') == "EMPTY") {
    thisCode = '!Simulator[' + Simulator.instance + '].robot.carry';
  }
  else {
    thisCode = 'Simulator[' + Simulator.instance + '].robot.carry';
  }
  
  currentExpression += currentOp + thisCode;

  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    return '';
  }
};

Blockly.JavaScript['custom_machineempty'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var thisCode = '';
  if (block.getFieldValue('SITE') != "NONE") {
    if (block.getFieldValue('EMPTYSTATUS') == "EMPTY") {
      thisCode = '!Simulator[' + Simulator.instance + '].station["' + block.getFieldValue('SITE') + '"].hasBlock()';
    }
    else {
      thisCode = 'Simulator[' + Simulator.instance + '].station["' + block.getFieldValue('SITE') + '"].hasBlock()';
    }
  }
  else {
    thisCode = 'false'; 
  }
  
  currentExpression += currentOp + thisCode;

  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    return '';
  }
};

Blockly.JavaScript['custom_machineidle'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var thisCode = '';
  if (block.getFieldValue('SITE') != "NONE") {
    if (block.getFieldValue('IDLESTATUS') == "IDLE") {
      thisCode = '!Simulator[' + Simulator.instance + '].station["' + block.getFieldValue('SITE') + '"].machineActive';
    }
    else {
      thisCode = 'Simulator[' + Simulator.instance + '].station["' + block.getFieldValue('SITE') + '"].machineActive';
    }
  }
  else {
    thisCode = 'false'; 
  }
  
  currentExpression += currentOp + thisCode;

  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    return '';
  }
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
  else {
    code += 'callback();';
  }
  currentHead = null;
  return code + "\n}";
};

Blockly.JavaScript['custom_triggerheader'] = function(block) {
  if (generated[block.id]) 
    return '';
  currentHead = block;
  currentTrigger = block.getFieldValue('TRIGGER');
  generated[block.id] = true;
  currentExpression = 'true';
  var triggerCheck = 'true';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    triggerCheck += Blockly.JavaScript.blockToCode(nextBlock);
  }
  else {
    triggerCheck = 'false';
    reportError(Simulator.instance, "Ignoring trigger '" + currentTrigger + "' because it is empty.", true);
  }
  currentHead = null;
  return 'Simulator[' + Simulator.instance + '].signalCheck["' + block.getFieldValue('TRIGGER') + '"] = function() {\n  return ' + currentExpression + ";\n}\n" +
        'Simulator[' + Simulator.instance + '].triggerCheck["' + block.getFieldValue('TRIGGER') + '"] = function() {\n  return ' + triggerCheck + ";\n}\n";
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

Blockly.JavaScript['custom_machine'] = function(block) {
  if (generated[block.id] || !currentHead) 
    return '';
  generated[block.id] = true;
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  var machineCode = 'Simulator[' + Simulator.instance + '].robot.activateMachine(Simulator[' + Simulator.instance + '].station[station], ';
  if (nextBlock) {
    machineCode += "function() {" + Blockly.JavaScript.blockToCode(nextBlock) + '})'
  }
  else {
    machineCode += 'function() { callback(); })';
  }
  return machineCode;
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