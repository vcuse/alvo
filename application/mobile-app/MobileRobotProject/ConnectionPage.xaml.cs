using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;

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
            /* Validate IP address. If it is valid, try to connect. If connection is established,
             * open the programming environment. */

            bool controllerWasFound;

            if (IPAddress.TryParse(AddressBox.Text, out IPAddress requestedAddress))
            {
                controllerWasFound = _Ur5.Connect(requestedAddress.ToString(), 2);

                if (controllerWasFound)
                {
                    // Ensure UR recipe is accepted before invoking the programming page
                    bool result = _Ur5.Setup_Ur_Inputs(_UrInputs);
                    if (result)
                    {
                        result = _Ur5.Setup_Ur_Outputs(_UrOutputs, 10); // Set up TCP callbacks at 10 Hz (every 0.1s)
                        NewControllerWasConnected?.Invoke(this, new ProgrammingPage(_Ur5, _UrOutputs, _UrInputs, requestedAddress.ToString()));
                    }
                    else
                    {
                        MessageBox.Show("A robot controller was found, but the application could not establish a communication with it. Please, try to restart the program.");
                    }
                }
                else
                {
                    MessageBox.Show("No controller was found by the application. Please verify if you are connected to the same network as the robot, and if the IP address provided is correct.");
                }
            }
            else
            {
                MessageBox.Show("The IP address provided is invalid.");
            }
        }
    }
}
