'use strict';

goog.provide('Blockly.MobileRobot.run');
goog.require('Blockly.MobileRobot');
goog.require('ur5_defines');


Blockly.MobileRobot['custom_start'] = function (block) {    
    var code = checkPoseReachability();
    return code;
};
