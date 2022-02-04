var joint_acceleration_factor = 1; // range of 0.1 to 2.0 (this factor is used to determine joint acceleration of ur moves)
var joint_velocity_factor = 1; // range of 0.1 to 2.0 (this factor is used to determine joint velocity of ur moves)

/**
 * Callback function for setting of the joint factor for acceleration
 * of ur movements
 */
function updateJointAcceleration(value) {
    joint_acceleration_factor = value;
}

/**
 * Callback function for setting of the joint factor for acceleration
 * of ur movements
 */
function updateJointVelocity(value) {
    joint_velocity_factor = value;
}

/**
 * Calculates acceleration and velocity of pose movements
 * based on range factors multiplied by the desired a and v
 */
 function calculateJointValues(acceleration, velocity){
    acceleration = acceleration * joint_acceleration_factor;
    velocity = velocity * joint_velocity_factor;
    return `a=${acceleration}, v=${velocity}`;
}
