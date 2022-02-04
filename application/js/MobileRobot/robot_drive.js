'use strict';

goog.provide('Blockly.MobileRobot.robot_drive');
goog.require('Blockly.MobileRobot');

//drive robot to station block used in one-canvas programming
Blockly.MobileRobot['custom_robot_drive'] = function(block) {
    var site = block.getFieldValue('SITE'); //station name
    var code = moveToStation(site); //function contained in ur5_defines.js
    //code = code.replace(/[\n]/g,"\n\t"); //tabs in the moveToStation function so it lines up properly
    //code = code.substring(0, code.length-1); //remove the final \t
    return code;
  };
  