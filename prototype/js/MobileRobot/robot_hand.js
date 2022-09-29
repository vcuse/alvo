'use strict';

goog.provide('Blockly.MobileRobot.robotHand');
goog.require('Blockly.MobileRobot');
goog.require('ur5_defines');


Blockly.MobileRobot['custom_open'] = function (block) {
  return openGripper;
};

Blockly.MobileRobot['custom_close'] = function (block) {
  return closeGripper;
};
