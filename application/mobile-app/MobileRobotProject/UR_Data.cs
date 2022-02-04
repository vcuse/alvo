/*

See :
https://www.universal-robots.com/how-tos-and-faqs/how-to/ur-how-tos/real-time-data-exchange-rtde-guide-22229/ 
 
BOOL : bool
UINT8 : byte
UINT32 : uint
UINT64 : ulong
INT32 : int
DOUBLE : double
VECTOR3D : double[]
VECTOR6D : double []
VECTOR6INT32 : int[]
VECTOR6UINT32 : uint[]

*/
using System;

namespace MobileRobotProject
{

    [Serializable]
    public class UniversalRobot_Outputs
    {
        // check the fields name in the RTDE guide : MUST be the same with the same type
        public double[] actual_TCP_pose = new double[6]; // array creation must be done here to give the size
        public uint output_bit_registers0_to_31;
    }

    [Serializable]
    public class UniversalRobot_Inputs
    {
        public double input_double_register_24;
    }

}