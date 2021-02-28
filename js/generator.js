'use strict';

goog.provide('Blockly.JavaScript.sim');

goog.require('Blockly.JavaScript');

var generated = [];

Blockly.JavaScript['custom_triggerstart'] = function(block) {
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  var code = 'Simulator[' + Simulator.instance + '].trigger["' + block.getFieldValue('TRIGGER') + '"] = function() {\n';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    code += Blockly.JavaScript.blockToCode(nextBlock);
    return code + "\n}";
  }
  return '';
};


Blockly.JavaScript['custom_start'] = function(block) {
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return Blockly.JavaScript.blockToCode(nextBlock);
  }
  return 'Simulator[' + Simulator.instance + '].idle = true';
};

Blockly.JavaScript['custom_task'] = function(block) {
  if (generated[block.id]) 
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
      taskCode += 'function() { Simulator[' + Simulator.instance + '].idle = true; })})';
    }
  }
  else {
    var moveCode = '';
    var taskCode = '';
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
  generated[block.id] = true;
  var code = 'Simulator[' + Simulator.instance + '].task["' + block.getFieldValue('TASK') + '"] = function(station, callback) {\n';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    code += Blockly.JavaScript.blockToCode(nextBlock);
    return code + "\n}";
  }
  return '';
};

Blockly.JavaScript['custom_pickup'] = function(block) {
  if (generated[block.id]) 
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
  if (generated[block.id]) 
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
  if (generated[block.id]) 
    return '';
  generated[block.id] = true;
  var location = Blockly.JavaScript.valueToCode(block, 'LOCATION', 0)
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
  if (generated[block.id]) 
    return '';
  return ['"center"', 0];
};

Blockly.JavaScript['custom_location'] = function(block) {
  if (generated[block.id]) 
    return '';
  return ['"' + block.getFieldValue('LOCATION') + '"', 0];
};