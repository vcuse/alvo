'use strict';

goog.provide('Blockly.MobileRobot.robotArm');
goog.require('Blockly.MobileRobot');
goog.require('define_position');
goog.require('ur5_defines');


Blockly.MobileRobot.robotArm.sharedTargetNames = {};  //robtarget instructions that must be shared across tasks
Blockly.MobileRobot.robotArm.armRobTargetsScrubbed = {}; //these are the scrubbed robot targets that match those scrubbed in the generator

Blockly.MobileRobot['custom_move'] = function (block) {
  //check to ensure that the user has actually taught a position into the block. If not then set warning and return
  if (block.getField('LOCATION').variable_.name == block.getField('LOCATION').defaultVariableName) {
    block.setWarningText("Block should have a teach position selected!"); //warn user they need to set the variable name of this block
    return "!ERROR!\n"; //block does not generate code, return !ERROR!
  }

  var target = Blockly.MobileRobot.variableDB_.getName(block.getFieldValue('LOCATION'), Blockly.Variables.NAME_TYPE); //returns the scrubbed variable name
  var unscrubbedTargetName = block.getField('LOCATION').variable_.name; //get the unscrubbed variable name for replacing of the key in the unscrubbed robot target object

  var code = "";

  var move_speed = block.getFieldValue('SPEED');
  var speed;
  switch (move_speed) {
    case "QUICK":
      speed = 0.50;
      break;
    case "MODERATE":
      speed = 0.25;
      break;
    case "SLOW":
      speed = 0.1;
      break;
    default:
      break;
  }

  var pose;
  if(unscrubbedTargetName == 'Above Table'){
    pose = ur5_poses['Above Table'];
  }
  else if(unscrubbedTargetName == 'Above Buffer'){
    pose = ur5_poses['Above Buffer'];
  }
  else{
    pose = ur5_poses[block.workspace.id][unscrubbedTargetName];
  }
  
  code = `  movej(checkPoseReachability(${pose}), ${calculateJointValues(0.5,speed)})\n`; 
  return code;
};


Blockly.MobileRobot['custom_linear_move'] = function (block) {
  //check to ensure that the user has actually taught a position into the block. If not then set warning and return
  if (block.getField('LOCATION').variable_.name == block.getField('LOCATION').defaultVariableName) {
    block.setWarningText("Block should have a teach position selected!"); //warn user they need to set the variable name of this block
    return "!ERROR!\n"; //block does not generate code, return !ERROR!
  }

  var target = Blockly.MobileRobot.variableDB_.getName(block.getFieldValue('LOCATION'), Blockly.Variables.NAME_TYPE); //returns the scrubbed variable name
  var unscrubbedTargetName = block.getField('LOCATION').variable_.name; //get the unscrubbed variable name for replacing of the key in the unscrubbed robot target object

  var code = "";

  var move_speed = block.getFieldValue('SPEED');
  var speed;
  switch (move_speed) {
    case "QUICK":
      speed = 0.50;
      break;
    case "MODERATE":
      speed = 0.25;
      break;
    case "SLOW":
      speed = 0.1;
      break;
    default:
      break;
  }

  var pose;
  if(unscrubbedTargetName == 'Above Table'){
    pose = ur5_poses['Above Table'];
  }
  else if(unscrubbedTargetName == 'Above Buffer'){
    pose = ur5_poses['Above Buffer'];
  }
  else{
    pose = ur5_poses[block.workspace.id][unscrubbedTargetName];
  }
  
  code = `  movel(checkPoseReachability(${pose}), ${calculateJointValues(0.5,speed)})\n`; 
  return code;
};
