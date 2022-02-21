﻿using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Diagnostics;

namespace MobileRobotProject
{
    /// <summary>
    /// Interaction logic for ConnectionPage.xaml
    /// </summary>

    public partial class ConnectionPage : Page
    {
        public event EventHandler<Page> NewControllerWasConnected;
        private readonly UniversalRobot_Inputs _UrInputs;
        private readonly UniversalRobot_Outputs _UrOutputs;
        private readonly RtdeClient _Ur5;

        public ConnectionPage(RtdeClient Ur5, UniversalRobot_Outputs UrOutputs, UniversalRobot_Inputs UrInputs)
        {
            InitializeComponent();
            _UrInputs = UrInputs;
            _UrOutputs = UrOutputs;
            _Ur5 = Ur5;         
        }

        private void ConnectToController(object sender, RoutedEventArgs e)
        {
            bool controllerWasFound;

            /**
             * check ip addresss. If valid try to connect. If connection successful
             * then open blockly programming page.
             */
            if (IPAddress.TryParse(AddressBox.Text, out IPAddress requestedAddress))
            {
                controllerWasFound = _Ur5.Connect(requestedAddress.ToString(), 2);
                if (controllerWasFound)
                {
                    // ensure Ur recipe is accepted before invoking programming page
                    bool result = _Ur5.Setup_Ur_Inputs(_UrInputs);
                    if(result) result = _Ur5.Setup_Ur_Outputs(_UrOutputs, 10); //set up tcp callbacks at 10 Hz (every 0.1s)

                    /* 
                     * Invoke Blockly programming page when controller is connected.
                    */
                    if(result) NewControllerWasConnected?.Invoke(this, new ProgrammingPage(_Ur5, _UrOutputs, _UrInputs, requestedAddress.ToString()));
                    else MessageBox.Show("Input Recipe was not accepted by UR. Try closing and restarting the application.");
                }
                else
                {
                    MessageBox.Show("No controller was found. Please verify if the information provided is correct.");
                }
            }
            else
            {
                MessageBox.Show("Invalid IP Address. Please try again!");
            }
        }
    }
}
