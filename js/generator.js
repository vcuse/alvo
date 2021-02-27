'use strict';

goog.provide('Blockly.JavaScript.sim');

goog.require('Blockly.JavaScript');

var generated = [];

Blockly.JavaScript['custom_start'] = function(block) {
  if (generated[block]) 
    return '';
  generated[block] = true;
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    return Blockly.JavaScript.blockToCode(nextBlock);
  }
  return '';
};

Blockly.JavaScript['custom_task'] = function(block) {
  if (generated[block]) 
    return '';
  generated[block] = true;
  var site = block.getFieldValue('SITE');
  var moveCode = 'Simulator[' + Simulator.instance + '].robot.moveToStation(Simulator[' + Simulator.instance + '].station["' + site + '"]';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    moveCode += ", function() {" + Blockly.JavaScript.blockToCode(nextBlock) + '})'
  }
  else {
    moveCode += ', function() { Simulator[' + Simulator.instance + '].idle = true; })';
  }
  return moveCode;
};