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
    if (nextBlock) {
      moveCode += ", function() {" + Blockly.JavaScript.blockToCode(nextBlock) + '})'
    }
    else {
      moveCode += ', function() { Simulator[' + Simulator.instance + '].idle = true; })';
    }
  }
  else {
    var moveCode = '';
    if (nextBlock) {
      moveCode += Blockly.JavaScript.blockToCode(nextBlock);
    }
    else {
      moveCode += 'Simulator[' + Simulator.instance + '].idle = true;';
    }
  }
  return moveCode;
};