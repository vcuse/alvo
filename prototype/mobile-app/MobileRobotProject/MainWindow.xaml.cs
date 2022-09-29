using System.ComponentModel; // CancelEventArgs
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;


namespace MobileRobotProject
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private static UniversalRobot_Outputs UrOutputs = new UniversalRobot_Outputs();  //defined in UR_DATA.cs
        private static UniversalRobot_Inputs UrInputs = new UniversalRobot_Inputs();     //defined in UR_DATA.cs
        private readonly RtdeClient Ur5 = new RtdeClient();  //Sets up UR5 Rtde services. Defined in RtdeClient.cs.

        public MainWindow()
        {
            InitializeComponent();
            Closing += MainWindow_Closing; //handle for window closing event
            ConnectionPage connectionPage = new ConnectionPage(Ur5, UrOutputs, UrInputs);
            connectionPage.NewControllerWasConnected += DisplayPage;
            DisplayPage(this, connectionPage);
        }

        private void DisplayPage(object sender, Page requestedPage)
        {
            this.Title = requestedPage.Title;
            MainWindowFrame.Content = requestedPage;
        }

        //handler so that window can be dragged, minimized, and closed
        protected override void OnMouseLeftButtonDown(MouseButtonEventArgs e)
        {
            base.OnMouseLeftButtonDown(e);

            // Begin dragging the window
            this.DragMove();
        }

        //handler on window close event
        void MainWindow_Closing(object sender, CancelEventArgs e)
        {
            Ur5.Disconnect(); //ensure close of ur rtde socket
        }

        private void MinimizeMainWindow(object sender, RoutedEventArgs e)
        {
            /* Listener - Minimizes the main window then the minize button is used */
            this.WindowState = WindowState.Minimized;
        }
        private void CloseMainWindow(object sender, RoutedEventArgs e)
        {
            /* Listener - Closes the main window then the close button is used */
            this.Close();
        }
    }    
}
