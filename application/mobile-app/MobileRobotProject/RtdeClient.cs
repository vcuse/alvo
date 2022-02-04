/**************************************************************************
*                           MIT License
* 
* Copyright (C) 2019 Frederic Chaxel <fchaxel@free.fr>
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*********************************************************************/
using System;
using System.Net.Sockets;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace MobileRobotProject
{
    interface IEncoderDecoder
    {
        object Decode(ref object o, byte[] buf, ref int offset);
        void Encode(object o, byte[] buf, ref int offset);
    }

    class EncodeValue : IEncoderDecoder // For bool, uint, int, ulong, double
    {
        Type type;
        int Typesize;

        public EncodeValue(Type type)
        {
            this.type = type;
            Typesize = Marshal.SizeOf(type);
        }

        public void Encode(object o, byte[] buf, ref int offset)
        {

            byte[] b = null;
            switch (type.FullName)
            {
                case "System.Boolean":
                    b = BitConverter.GetBytes((bool)o);
                    break;
                case "System.Byte":
                    b = new byte[1];
                    b[0] = (byte)o;
                    break;
                case "System.UInt32":
                    b = BitConverter.GetBytes((UInt32)o);
                    break;
                case "System.Int32":
                    b = BitConverter.GetBytes((Int32)o);
                    break;
                case "System.UInt64":
                    b = BitConverter.GetBytes((UInt64)o);
                    break;
                case "System.Double":
                    b = BitConverter.GetBytes((Double)o);
                    break;
            }

            if (BitConverter.IsLittleEndian)
                Array.Reverse(b);
            Array.Copy(b, 0, buf, offset, Typesize);
            offset += Typesize;
        }

        public object Decode(ref object o, byte[] buf, ref int offset)
        {

            // object o not used, value type

            byte[] b = new byte[Typesize];
            Array.Copy(buf, offset, b, 0, Typesize);
            if (BitConverter.IsLittleEndian)
                Array.Reverse(b);
            offset += Typesize;

            switch (type.FullName)
            {
                case "System.Boolean":
                    return BitConverter.ToBoolean(b, 0);
                case "System.Byte":
                    return b[0];
                case "System.UInt32":
                    return BitConverter.ToUInt32(b, 0);
                case "System.Int32":
                    return BitConverter.ToInt32(b, 0);
                case "System.UInt64":
                    return BitConverter.ToUInt64(b, 0);
                case "System.Double":
                    return BitConverter.ToDouble(b, 0);
            }

            return null;
        }
    }
    class EncodeArray : IEncoderDecoder // For uint[], int[], ulong[], double[]
    {
        int ArraySize, Typesize;
        Type type;
        public EncodeArray(int size, Type type)
        {
            ArraySize = size;
            Typesize = Marshal.SizeOf(type);
            this.type = type;
        }

        public void Encode(object o, byte[] buf, ref int offset)
        {
            Array array = o as Array;

            for (int i = 0; i < ArraySize; i++)
            {
                byte[] b = null;

                switch (type.FullName)
                {
                    case "System.UInt32":
                        b = BitConverter.GetBytes((UInt32)array.GetValue(i));
                        break;
                    case "System.Int32":
                        b = BitConverter.GetBytes((Int32)array.GetValue(i));
                        break;
                    case "System.UInt64":
                        b = BitConverter.GetBytes((UInt64)array.GetValue(i));
                        break;
                    case "System.Double":
                        b = BitConverter.GetBytes((Double)array.GetValue(i));
                        break;
                }
                if (BitConverter.IsLittleEndian)
                    Array.Reverse(b);
                Array.Copy(b, 0, buf, offset, Typesize);
                offset += Typesize;
            }
        }
        public object Decode(ref object o, byte[] buf, ref int offset)
        {

            Array obj = o as Array;

            for (int i = 0; i < ArraySize; i++)
            {
                byte[] b = new byte[Typesize];
                Array.Copy(buf, offset, b, 0, Typesize);
                if (BitConverter.IsLittleEndian)
                    Array.Reverse(b);
                offset += Typesize;

                object value = null; ;

                switch (type.FullName)
                {
                    case "System.UInt32":
                        value = BitConverter.ToUInt32(b, 0);
                        break;
                    case "System.Int32":
                        value = BitConverter.ToInt32(b, 0);
                        break;
                    case "System.UInt64":
                        value = BitConverter.ToUInt64(b, 0);
                        break;
                    case "System.Double":
                        value = BitConverter.ToDouble(b, 0);
                        break;
                }

                obj.SetValue(value, i);
            }

            return obj; // Not used, type reference
        }
    }

    public class RtdeClient
    {
        enum RTDE_Command
        {
            REQUEST_PROTOCOL_VERSION = 86,
            GET_URCONTROL_VERSION = 118,
            TEXT_MESSAGE = 77,
            DATA_PACKAGE = 85,
            CONTROL_PACKAGE_SETUP_OUTPUTS = 79,
            CONTROL_PACKAGE_SETUP_INPUTS = 73,
            CONTROL_PACKAGE_START = 83,
            CONTROL_PACKAGE_PAUSE = 80
        };

        int TimeOut = 500;
        TcpClient sock = new TcpClient();
        ManualResetEvent receiveDone = new ManualResetEvent(false);

        public uint ProtocolVersion { get; private set; }

        byte[] bufRecv = new byte[1500]; // Enough to hold a full OK CONTROL_PACKAGE_SETUP_OUTPUTS response

        public event EventHandler OnDataReceive;
        public event EventHandler OnSockClosed;

        byte Outputs_Recipe_Id, Inputs_Recipe_Id; // from the Robot point of view

        object UrStructOuput, UrStructInput;

        IEncoderDecoder[] UrStructOuputDecoder, UrStructInputDecoder;

        public String ErrorMessage { get; private set; }

        public bool Connect(String host, uint ProtocolVersion = 2, int timeOut = 500)
        {
            byte[] InternalbufRecv = new byte[bufRecv.Length];
            TimeOut = timeOut;
            this.ProtocolVersion = 1;

            try
            {
                sock.Connect(host, 30004);
                sock.Client.BeginReceive(InternalbufRecv, 0, InternalbufRecv.Length, SocketFlags.None, AsynchReceive, InternalbufRecv);

                if (ProtocolVersion != 1)
                    Set_UR_Protocol_Version(ProtocolVersion);

                return true;
            }
            catch { return false; }
        }

        private void AsynchReceive(IAsyncResult ar)
        {
            int bytesRead = 0;

            if(sock.Client != null)
            {
                bytesRead = sock.Client.EndReceive(ar);
            }
            
            byte[] InternalbufRecv = (byte[])ar.AsyncState;

            if (bytesRead > 0)
            {

                lock (bufRecv)
                    Array.Copy(InternalbufRecv, bufRecv, InternalbufRecv.Length);

                if (InternalbufRecv[2] == (byte)RTDE_Command.TEXT_MESSAGE)
                {
                    if (ProtocolVersion == 1)
                        ErrorMessage = Encoding.ASCII.GetString(InternalbufRecv, 4, InternalbufRecv[1] - 4 - 2); // try catch not required
                    else
                        ErrorMessage = Encoding.ASCII.GetString(InternalbufRecv, 4, InternalbufRecv[3]); // try catch not required
                }

                receiveDone.Set();

                sock.Client.BeginReceive(InternalbufRecv, 0, InternalbufRecv.Length, SocketFlags.None, AsynchReceive, InternalbufRecv);

                try
                {
                    if (bufRecv[2] == (byte)RTDE_Command.DATA_PACKAGE)
                    {
                        int offset = 3;
                        if (ProtocolVersion == 2)
                        {
                            offset++;
                            if (bufRecv[3] != Outputs_Recipe_Id) return;
                        }

                        FieldInfo[] f = UrStructOuput.GetType().GetFields();

                        for (int i = 0; i < f.Length; i++)
                        {
                            object currentvalue = f[i].GetValue(UrStructOuput);

                            if (f[i].FieldType.IsArray)
                                UrStructOuputDecoder[i].Decode(ref currentvalue, bufRecv, ref offset); // value type
                            else
                                f[i].SetValue(UrStructOuput, UrStructOuputDecoder[i].Decode(ref currentvalue, bufRecv, ref offset));
                        }

                        if (OnDataReceive != null)
                            OnDataReceive(this, null);
                    }
                }
                catch { }
            }
            else
                if (OnSockClosed != null)
                OnSockClosed(this, null);
        }

        public void Disconnect()
        {
            sock.Close();
        }

        private void SendRtdePacket(RTDE_Command RTDEType, byte[] payload = null)
        {
            ErrorMessage = null;

            if (payload == null) payload = new byte[0];

            byte[] s = new byte[payload.Length + 3];

            byte[] size = BitConverter.GetBytes(payload.Length + 3);

            s[0] = size[1];
            s[1] = size[0];
            s[2] = (byte)RTDEType;

            if (payload != null)
                Array.Copy(payload, 0, s, 3, payload.Length);

            receiveDone.Reset();
            sock.Client.BeginSend(s, 0, s.Length, SocketFlags.None, null, null); // not Send() to be thread safe with the BeginReceive

        }

        private bool Send_UR_Command(RTDE_Command Cmd, byte[] payload = null)
        {
            SendRtdePacket(Cmd, payload);
            if (receiveDone.WaitOne(TimeOut))
            {
                lock (bufRecv)
                {
                    return (bufRecv[2] == (byte)Cmd);
                }
            }
            return false;
        }

        private bool Set_UR_Protocol_Version(uint Version)
        {
            byte[] V = { 0, (byte)Version };

            bool ret = Send_UR_Command(RTDE_Command.REQUEST_PROTOCOL_VERSION, V);

            if ((ret == true) && (bufRecv[3] == 1)) ProtocolVersion = Version;

            return ret;
        }

        public bool Ur_ControlStart()
        {
            return Send_UR_Command(RTDE_Command.CONTROL_PACKAGE_START);
        }

        public bool Ur_ControlPause()
        {
            return Send_UR_Command(RTDE_Command.CONTROL_PACKAGE_PAUSE);
        }

        public bool Send_Ur_Inputs()
        {
            FieldInfo[] f = UrStructInput.GetType().GetFields();

            byte[] buf = new byte[1500];
            int offset = 0;

            for (int i = 0; i < f.Length; i++)
                UrStructInputDecoder[i].Encode(f[i].GetValue(UrStructInput), buf, ref offset);

            byte[] payload;

            if (ProtocolVersion == 1)
            {
                payload = new byte[offset];
                Array.Copy(buf, payload, offset);
            }
            else
            {
                payload = new byte[offset + 1];
                payload[0] = Inputs_Recipe_Id;
                Array.Copy(buf, 0, payload, 1, offset);
            }

            Send_UR_Command(RTDE_Command.DATA_PACKAGE, payload);

            return true;
        }
        private bool Setup_Ur_InputsOutputs(RTDE_Command Cmd, object UrStruct, out IEncoderDecoder[] encoder, double Frequency = 1)
        {
            // Get the public fields in the structure 
            FieldInfo[] f = UrStruct.GetType().GetFields();
            encoder = new IEncoderDecoder[f.Length];

            StringBuilder b = new StringBuilder();
            for (int i = 0; i < f.Length; i++)
            {
                b.Append((i == 0 ? "" : ",") + f[i].Name); // build the RTDE request : names and comma

                if (f[i].FieldType.IsArray) // link to the encoder/decoder
                {
                    Array array = f[i].GetValue(UrStruct) as Array;
                    object element = array.GetValue(0);
                    encoder[i] = new EncodeArray(array.Length, element.GetType());
                }
                else
                    encoder[i] = new EncodeValue(f[i].FieldType);
            }

            byte[] payload;
            if ((Cmd == RTDE_Command.CONTROL_PACKAGE_SETUP_OUTPUTS) && (ProtocolVersion == 2))
            {
                payload = new byte[b.Length + 8];

                byte[] Freq = BitConverter.GetBytes(Frequency);
                if (BitConverter.IsLittleEndian)
                    Array.Reverse(Freq);
                Array.Copy(Freq, 0, payload, 0, 8);
                Array.Copy(Encoding.ASCII.GetBytes(b.ToString()), 0, payload, 8, b.Length);
            }
            else
                payload = Encoding.ASCII.GetBytes(b.ToString());

            if (Send_UR_Command(Cmd, payload) == true)
            {
                if (Cmd == RTDE_Command.CONTROL_PACKAGE_SETUP_OUTPUTS)
                    Outputs_Recipe_Id = bufRecv[3]; // only for Protocol Version 2
                else
                    Inputs_Recipe_Id = bufRecv[3]; // only for Protocol Version 2

                String s = Encoding.ASCII.GetString(bufRecv, 3, bufRecv.Length - 3);

                if (s.Contains("NOT_FOUND")) return false;
                if (s.Contains("IN_USE")) return false;

                return true;
            }
            return false;
        }

        public bool Setup_Ur_Outputs(object UrStruct, double Frequency = 1)
        {
            this.UrStructOuput = UrStruct;
            return Setup_Ur_InputsOutputs(RTDE_Command.CONTROL_PACKAGE_SETUP_OUTPUTS, UrStruct, out UrStructOuputDecoder, Frequency);
        }

        public bool Setup_Ur_Inputs(object UrStruct)
        {
            this.UrStructInput = UrStruct;
            return Setup_Ur_InputsOutputs(RTDE_Command.CONTROL_PACKAGE_SETUP_INPUTS, UrStruct, out UrStructInputDecoder);
        }
    }
}
