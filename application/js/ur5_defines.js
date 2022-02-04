'use strict';

goog.provide('ur5_defines');


//registers UR will set to request move from WPF
const registers_station_mapping = {"STATIONA" : 0, "STATIONB": 1, "STATIONC": 2};

const programStartStopRegister = "3"; //register being set to signal program start stop

/**
* Positions we select for the UR robot
*/
const overBuffer = "p[0.0,-0.380,0.301,2.375,2.088,0.002]";
const overTable = "p[0.06295,0.61817,0.24125,2.066,-2.366,-0.022]";
const intermediatePose_quad1 = "p[0.39377,0.25298,0.301,0.817,-3.039,-0.020]"; //(+x,+y) intermediate point
const intermediatePose_quad4 = "p[0.28644,-0.37015,0.301,1.442,2.777,0.009]"; //(+x,-y) intermediate point

//position to move to right before pressing the safety required for MiR movement
const preSafetyPressPosition = "p[0.0,-0.553,0.301,2.375,2.088,0.002]";

//position for pressing of the safety required for MiR movement
const safetyPressPosition = "p[0.0,-0.55062,0.26855,2.375,2.088,0.002]";

//run at start of ur program
const programStart =    'def myProg():\n' +
                        ` if read_output_boolean_register(${programStartStopRegister}):\n` +
                        `  write_output_boolean_register(${programStartStopRegister},False)\n` + //if running signal true then write false
                        `  sleep(0.5)\n` +
                        ` end\n` +
                        ` write_output_boolean_register(${registers_station_mapping["STATIONA"]},False)\n` +
                        ` write_output_boolean_register(${registers_station_mapping["STATIONB"]},False)\n` +
                        ` write_output_boolean_register(${registers_station_mapping["STATIONC"]},False)\n` +
                        ` write_output_boolean_register(${programStartStopRegister},True)\n` + //signal program is starting (causes stop modal to pop up)
                        ` sleep(0.5)\n`;

//run at end of ur program
const programEnd =  ` write_output_boolean_register(${programStartStopRegister},False)\n` + //signal that ur program is ending
                    'end\n';

//enables free movement of ur by hand for teaching positions
const enable_freedrive =    "def myProg():\n" +
                            " freedrive_mode()\n" +
                            " while True:\n" +
                            "  sleep(1)\n" +
                            " end\n" +
                            "end\n";

/**
 * Urscript function definition for checking the reachability of a pose.
 * Determines whether the robot will turn the wrong direction, thus twisting the cables
 * by checking quadrant it is coming from and moving towards. Enforces a turn in the opposite
 * direction if required and then returns the original target pose.
 */
function checkPoseReachability(){
    return  " def checkPoseReachability(target_pose):\n" +  //need to investigate this further
            "  current_pose=get_actual_tcp_pose()\n" + //get ur current position
            `  home_position=${preSafetyPressPosition}\n` +                             
            "  if current_pose[1]>=0 and target_pose[1]<0:\n" +
            `   distance_in_z=home_position[2]-current_pose[2]\n` + //get distance between two poses
            `   current_pose[2] = distance_in_z+current_pose[2]\n` + //set new pose to z value of home position
            `   movel(current_pose, ${calculateJointValues(0.5,0.25)})\n`+ //move to safe height
            `   movej(${intermediatePose_quad1}, ${calculateJointValues(0.5,0.5)})\n` +
            "  elif current_pose[1]<=0 and target_pose[1]>0:\n" +
            `   distance_in_z=home_position[2]-current_pose[2]\n` + //get distance between two poses
            `   current_pose[2] = distance_in_z+current_pose[2]\n` + //set new pose to z value of home position
            `   movel(current_pose, ${calculateJointValues(0.5,0.25)})\n`+ //move to safe height
            `   movej(${intermediatePose_quad4}, ${calculateJointValues(0.5,0.5)})\n` +                             
            "  end\n" +
            "  return target_pose\n" +
            " end\n";
} 

//move to safe height
function moveToSafeHeight(){
    return  ' pose=get_actual_tcp_pose()\n' + //get ur current position
            ` home_position=${preSafetyPressPosition}\n` +
            ` distance_in_z=home_position[2]-pose[2]\n` + //get distance between two poses
            ` pose[2] = distance_in_z+pose[2]\n` + //set new pose to z value of home position
            ` movel(checkPoseReachability(pose), ${calculateJointValues(0.5,0.25)})\n`;
}

//move arm over table
function moveArmToTable(){
    return  moveToSafeHeight() +
            ` movej(checkPoseReachability(${overTable}), ${calculateJointValues(0.5,0.5)})\n`;
}  

//moves arm above the part buffer                        
function moveArmToBuffer(){
    return  moveToSafeHeight() +
            ` movej(checkPoseReachability(${overBuffer}), ${calculateJointValues(0.5,0.5)})\n`;
} 
//moves arm to the safety press position                        
function moveArmToSafety(){
    return  moveToSafeHeight() +
            ` movej(checkPoseReachability(${preSafetyPressPosition}), ${calculateJointValues(0.5,0.5)})\n` +
            ` movel(checkPoseReachability(${safetyPressPosition}), ${calculateJointValues(0.2,0.1)})\n`;
} 

//opens the UR gripper
const openGripper =     "  set_standard_digital_out(0, False)\n" +
                        "  set_standard_digital_out(1, False)\n" +
                        "  set_standard_digital_out(1, True)\n" +
                        "  sleep(1.0)\n" + //make sure gripper has enough time to open
                        "  set_standard_digital_out(1, False)\n";

//closes the UR gripper
const closeGripper =    "  set_standard_digital_out(0, False)\n" +
                        "  set_standard_digital_out(1, False)\n" +
                        "  set_standard_digital_out(0, True)\n" +
                        "  sleep(1.0)\n" + //make sure gripper has enough time to close
                        "  set_standard_digital_out(0, False)\n";

// moves MiR to requested station by setting the register bit mapped to the station
// default argument is register, which is used when program compilation occurs inside
// a task block. Otherwise the move to a particular station can be requested.
function moveToStation(register="register"){
    if (register !== "register") register = registers_station_mapping[register];

    return  ` write_output_boolean_register(${register},False)\n` + //set register low just in case
            ` sleep(0.5)\n` + //make sure WPF picks up set to low
            //open gripper
            openGripper +
            //move to safe height
            moveToSafeHeight() +
            //move to pre safety press position
            ` movej(checkPoseReachability(${preSafetyPressPosition}), ${calculateJointValues(0.5,0.5)})\n` +
            //press safety
            ` movel(checkPoseReachability(${safetyPressPosition}), ${calculateJointValues(0.2,0.1)})\n` +
            ` write_output_boolean_register(${register},True)\n` + //request move by setting appropriate register
            ' while read_input_float_register(24) != 1.0:\n' + //wait for confirmation that move was completed when register set to 1.0
            '  sleep(1)\n' +
            '  textmsg(read_input_float_register(24))\n' +
            ' end\n' +
            ` write_output_boolean_register(${register},False)\n` + //reset register
            //move arm off of safety
            ` movel(checkPoseReachability(${preSafetyPressPosition}), ${calculateJointValues(0.2,0.25)})\n` +
            ` movej(checkPoseReachability(${overBuffer}), ${calculateJointValues(0.5,0.25)})\n`;
}                      
