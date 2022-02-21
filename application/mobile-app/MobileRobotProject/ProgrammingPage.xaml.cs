using Microsoft.Web.WebView2.Core;
using System;
using System.Text;
using System.Text.Json;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Win32;
using System.Diagnostics;
using System.Net.Sockets;
using System.Net.Http;


namespace MobileRobotProject
{
    /// <summary>
    /// Interaction logic for ProgrammingPage.xaml
    /// </summary>
    public partial class ProgrammingPage : Page
    {
        private HttpClient client;
        private readonly RtdeClient _Ur5;
        private readonly UniversalRobot_Inputs _UrInputs;
        private readonly UniversalRobot_Outputs _UrOutputs;       
        private readonly string _Ur5_ip;
        private readonly int _Ur5_script_port = 30002;     //ur scripting port
        private string _tcpPose;
        private bool _StationA_request = true; //UR will set this false, wait 0.5s and then set true to signal move request
        private bool _StationB_request = true; //UR will set this false, wait 0.5s and then set true to signal move request
        private bool _StationC_request = true; //UR will set this false, wait 0.5s and then set true to signal move request
        private bool _UrProgramStarted = true;
        private readonly string _mission_group_name = "VCU"; //the mission group name where the docking stations will be placed (Note: Need to set from UI)
        private string _DockStationA_guid = "{ \"mission_id\" : \"***\" }";
        private string _DockStationB_guid = "{ \"mission_id\" : \"***\" }";
        private string _DockStationC_guid = "{ \"mission_id\" : \"***\" }";

        public bool StationA_request
        {
            get { return _StationA_request; }

            private set
            {
                //this means the request value has changed from false to true and MiR needs to move to StationA
                if((_StationA_request != value) && (value == true))
                {
                    _StationA_request = value;
                    SignalMiR(_DockStationA_guid);
                    //trigger MiR with Rest here
                    Debug.WriteLine("Trigger A");
                }
                else if ((_StationA_request != value) && (value == false))
                {
                    _StationA_request = value; // set request back to false
                }
            }
        }

        public bool StationB_request
        {
            get { return _StationB_request; }

            private set 
            {
                //this means the request value has changed from false to true and MiR needs to move to StationB
                if ((_StationB_request != value) && (value == true))
                {
                    _StationB_request = value;
                    SignalMiR(_DockStationB_guid);
                    //trigger MiR with Rest here
                    Debug.WriteLine("Trigger B");
                }
                else if ((_StationB_request != value) && (value == false))
                {
                    _StationB_request = value; // set request back to false
                }
            }
        }

        public bool StationC_request
        {
            get { return _StationC_request; }

            private set 
            {
                //this means the request value has changed from false to true and MiR needs to move to StationC
                if ((_StationC_request != value) && (value == true))
                {
                    _StationC_request = value;
                    SignalMiR(_DockStationC_guid);
                    //trigger MiR with Rest here
                    Debug.WriteLine("Trigger C");
                }
                else if ((_StationC_request != value) && (value == false))
                {
                    _StationC_request = value; // set request back to false
                }
            }
        }

        public bool UrProgramStarted
        {
            get { return _UrProgramStarted; }

            private set
            {
                //this means the request value has changed from false to true and program has started
                if ((_UrProgramStarted != value) && (value == true))
                {
                    _UrProgramStarted = value;
                    ShowRobotMovingModal();
                }
                // change from true to false and program has stopped
                else if ((_UrProgramStarted != value) && (value == false))
                {
                    _UrProgramStarted = value; // set request back to false
                    HideRobotMovingModal();
                }
            }
        }

        public ProgrammingPage(RtdeClient Ur5, UniversalRobot_Outputs UrOutputs, UniversalRobot_Inputs UrInputs, string Ur5_ip)
        {
            InitializeComponent();
            client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", "Basic YWRtaW46OGM2OTc2ZTViNTQxMDQxNWJkZTkwOGJkNGRlZTE1ZGZiMTY3YTljODczZmM0YmI4YTgxZjZmMmFiNDQ4YTkxOA==");
            _Ur5_ip = Ur5_ip;
            _Ur5 = Ur5;
            _UrInputs = UrInputs;
            _UrOutputs = UrOutputs;
            InitializeAsync();
            _Ur5.OnDataReceive += Ur5_OnDataReceive; // set up callback for rtde tcp pose data
            _Ur5.OnSockClosed += Ur5_OnSockClosed;  // callback for when rtde socket is closed
        }

        private async void InitializeAsync()
        {
            /* Method - Initializes the async communication with the WebView. When a POST mesage is received,
             * the listener ParseMessageFromWeb is invoked. */         
            await webView.EnsureCoreWebView2Async(null);
            webView.Source = new Uri(Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, @"..\..\..\..\..\index.html")));
            webView.CoreWebView2.WebMessageReceived += ParseMessageFromWeb;
            _Ur5.Ur_ControlStart(); //start Rtde service
            GetStationGuids();
        }

        /*
         *  Dynamically gets the MiR docking station Guids by:
         *  1. Getting the mission groups endpoint and searching for mission group
         *  2. If mission group found it uses the provided url to get the missions from that group
         *  3. Searches those missions for DockStationA, DockStationB, DockStationC and appends the
         *  guid for each mission into the class variables _DockStationA_guid, _DockStationB_guid, _DockStationC_guid
         *  4. If any of these calls fail then the user is alerted and the default guids are used (which may or may not work)
         *  
         *  For this to work the MiR docking stations should be placed under a mission_group name equal to the _mission_group_name
         *  variable in this class (E064 as of now). The docking station missions MUST be named DockStationA, DockStationB, DockStationC
         *  within the assigned mission group. This is all done within the mir.com UI.
         */
        private async void GetStationGuids()
        {
            string mission_URL = "";
            bool mission_URL_found = false;
            bool dockstationA_found = false;
            bool dockstationB_found = false;
            bool dockstationC_found = false;

            // Get a list of all MiR mission groups
            HttpResponseMessage response = await client.GetAsync("http://mir.com:8080/v2.0.0/mission_groups");
            string json = await response.Content.ReadAsStringAsync();

            using (JsonDocument document = JsonDocument.Parse(json))
            {
                JsonElement root = document.RootElement;
                foreach (JsonElement mission_group in root.EnumerateArray())
                {
                    // Parse returned array and look for a mission group with name equal to _mission_group_name
                    if (mission_group.TryGetProperty("name", out JsonElement group_name))
                    {
                        string name = group_name.GetString();
                        // If group name found then get and save the url of that group
                        if(name == _mission_group_name)
                        {
                            if (mission_group.TryGetProperty("url", out JsonElement group_url))
                            {
                                // save group_url outside of using statement
                                mission_URL = group_url.GetString();
                                mission_URL_found = true;
                                Debug.WriteLine("Mission group found: " + mission_URL);
                                break; // exit foreach loop as url was found
                            }
                        }
                    }
                }
            }

            if (mission_URL_found)
            {
                // Get all missions inside mission group
                response = await client.GetAsync("http://mir.com:8080" + mission_URL + "/missions");
                json = await response.Content.ReadAsStringAsync();

                using (JsonDocument document = JsonDocument.Parse(json))
                {
                    JsonElement root = document.RootElement;
                    foreach (JsonElement mission in root.EnumerateArray())
                    {
                        // Parse returned array and look for station A,B,C mission names
                        if (mission.TryGetProperty("name", out JsonElement mission_name))
                        {
                            string name = mission_name.GetString();
                            // If mission name is DockStationA, DockStationB, DockStationC, then get corresponding guid
                            if (name == "DockStationA")
                            {
                                if (mission.TryGetProperty("guid", out JsonElement mission_guid))
                                {
                                    // save guid                                    
                                    _DockStationA_guid = _DockStationA_guid.Replace("***", mission_guid.GetString());
                                    dockstationA_found = true;
                                    Debug.WriteLine("Station A found: " + _DockStationA_guid);
                                }
                            }
                            else if (name == "DockStationB")
                            {
                                if (mission.TryGetProperty("guid", out JsonElement mission_guid))
                                {
                                    // save guid                                    
                                    _DockStationB_guid = _DockStationB_guid.Replace("***", mission_guid.GetString());
                                    dockstationB_found = true;
                                    Debug.WriteLine("Station B found: " + _DockStationB_guid);
                                }
                            }
                            else if (name == "DockStationC")
                            {
                                if (mission.TryGetProperty("guid", out JsonElement mission_guid))
                                {
                                    // save guid                                    
                                    _DockStationC_guid = _DockStationC_guid.Replace("***", mission_guid.GetString());
                                    dockstationC_found = true;
                                    Debug.WriteLine("Station C found: " + _DockStationC_guid);
                                }
                            }
                        }
                    }
                }
            }
            else MessageBox.Show("Mission Group URL not found! Using default station Guids which may not be correct!");

            if (!dockstationA_found || !dockstationB_found || !dockstationC_found)
            {
                MessageBox.Show("Not all docking stations found! They should be named DockStationA, DockStationB, DockStationC within defined mission group! RESTART!");
            }
        }


        // Shows the robot moving modal in the webview
        private async void ShowRobotMovingModal()
        {
            if (!Dispatcher.CheckAccess())
            {
                // We're not in the UI thread, ask the dispatcher to call this same method in the UI thread, then exit
                _ = Dispatcher.BeginInvoke(new Action(ShowRobotMovingModal));
                return;
            }

            Debug.WriteLine("Show modal method is invoked");
            string script = "$('#robot-moving-modal').modal('show');";
            _ = await webView.ExecuteScriptAsync(script);
        }

        // Hides the robot moving modal in the webview
        private async void HideRobotMovingModal()
        {
            if (!Dispatcher.CheckAccess())
            {
                // We're not in the UI thread, ask the dispatcher to call this same method in the UI thread, then exit
                _ = Dispatcher.BeginInvoke(new Action(HideRobotMovingModal));
                return;
            }

            Debug.WriteLine("Hide modal method is invoked");
            string script = "$('#robot-moving-modal').modal('hide');";
            _ = await webView.ExecuteScriptAsync(script);
        }

        // Writes text to the specified element (uses a jquery command that writes by id) 
        private async void WriteTextToWebview(string inner_text, string id)
        {
            string script = string.Format("$('{1}').html('{0}');", inner_text, id);
            _ = await webView.ExecuteScriptAsync(script);
        }

        // Command MiR to move to designated station
        private async void SignalMiR(string Station_guid)
        {
            HttpContent httpContent = new StringContent(Station_guid, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await client.PostAsync("http://mir.com:8080/v2.0.0/mission_queue", httpContent); //post station move to mission queue
            Debug.WriteLine(response);

            System.Threading.Thread.Sleep(1000); // give MiR time to get started (The await on the PostAsync may make this irrelevant)

            string json;
            var mirStopped = false;
            // This loop hits the Mir Get Status endpoint until the Mir status is no longer executing,
            // Then it sets double_register_24 on the UR to 1.0 to signal the UR that the MiR movement is complete
            while (!mirStopped)
            {
                response = await client.GetAsync("http://mir.com:8080/v2.0.0/status");
                json = await response.Content.ReadAsStringAsync();

                if (json.Contains("Executing"))
                {
                    continue;
                }
                else 
                { 
                    mirStopped = true;
                    _UrInputs.input_double_register_24 = 1.0; //move complete signal
                    Debug.WriteLine("Setting reg to 1.0" + _Ur5.Send_Ur_Inputs().ToString());
                    System.Threading.Thread.Sleep(1000);
                    _UrInputs.input_double_register_24 = 0.0; //reset to zero
                    Debug.WriteLine("Setting reg to 0.0" + _Ur5.Send_Ur_Inputs().ToString());
                }
            }          
        }

        // Clears the MiR mission queue which stops it if it is moving
        private async void StopMiR()
        {
            //Delete mission queue first to ensure no other missions are running
            _ = await client.DeleteAsync("http://mir.com:8080/v2.0.0/mission_queue");
        }

        private void ParseMessageFromWeb(object sender, CoreWebView2WebMessageReceivedEventArgs args)
        {
            string messageFromWeb = args.TryGetWebMessageAsString();
            string haltUR = "def haltUR():\n\twrite_output_boolean_register(0,False)\n\twrite_output_boolean_register(1,False)\n\twrite_output_boolean_register(2,False)\n\twrite_output_boolean_register(3,False)\nend\n";
            
            /* If the message received is UPDATE_ARM_POSITION, send current arm pose */
            if (messageFromWeb == "UPDATE_ARM_POSITION")
            {
                webView.CoreWebView2.PostWebMessageAsString(_tcpPose);
            }
            // Stop Ur and MiR
            else if (messageFromWeb == "STOP")
            {
                StopMiR(); // stop MiR if it is running by clearing the mission queue
                Ur5_Write(_Ur5_script_port, haltUR); //stop Ur if it is running and write the output registers low               
            }
            /* If the message received starts with <SAVE_FILE_ONE_CANVAS>, save into one-canvas folder */
            else if (messageFromWeb.StartsWith("<SAVE_FILE_ONE_CANVAS>"))
            {
                SaveBlocklyWorkspaceLocally(messageFromWeb, "OneCanvas");
            }
            /* If the message received starts with <SAVE_FILE_TWO_CANVAS>, save into two-canvas folder */
            else if (messageFromWeb.StartsWith("<SAVE_FILE_TWO_CANVAS>"))
            {
                SaveBlocklyWorkspaceLocally(messageFromWeb, "TwoCanvas");
            }
            else if (messageFromWeb == "ONE_CANVAS_OPEN_FILE")
            {
                OpenFile("OneCanvas");
            }
            else if (messageFromWeb == "TWO_CANVAS_OPEN_FILE")
            {
                OpenFile("TwoCanvas");
            }
            else
            {
                StopMiR(); // stop MiR if it is running by clearing the mission queue             
                _UrInputs.input_double_register_24 = 0.0; // reset signal just in case
                _Ur5.Send_Ur_Inputs();
                Ur5_Write(_Ur5_script_port, messageFromWeb); //write new code from web to ur5
            }
        }

        private void Ur5_OnSockClosed(object sender, EventArgs e)
        {
            MessageBox.Show("UR5 RTDE Socket Was Closed! Close and restart application!");
        }

        // Data change Event 
        private void Ur5_OnDataReceive(object sender, EventArgs e)
        {
            _tcpPose = "p[" + _UrOutputs.actual_TCP_pose[0] + "," + _UrOutputs.actual_TCP_pose[1] + "," + _UrOutputs.actual_TCP_pose[2] + "," + _UrOutputs.actual_TCP_pose[3] + "," + _UrOutputs.actual_TCP_pose[4] + "," + _UrOutputs.actual_TCP_pose[5] + "]";

            /* 
             * STATIONA == register0 == 1
             * STATIONB == register1 == 2
             * STATIONC == register2 == 4
             */
            StationA_request = Convert.ToBoolean(_UrOutputs.output_bit_registers0_to_31 & 1); //UR5 triggers a request to move the MiR to a particular station by setting these bits
            StationB_request = Convert.ToBoolean((_UrOutputs.output_bit_registers0_to_31 & 2) >> 1); //UR5 triggers a request to move the MiR to a particular station by setting these bits
            StationC_request = Convert.ToBoolean((_UrOutputs.output_bit_registers0_to_31 & 4) >> 2); //UR5 triggers a request to move the MiR to a particular station by setting these bits
            UrProgramStarted = Convert.ToBoolean((_UrOutputs.output_bit_registers0_to_31 & 8) >> 3);

            //Debug.WriteLine(_tcpPose);
            //Debug.WriteLine(StationA_request);
            //Debug.WriteLine(StationB_request);
            //Debug.WriteLine(StationC_request);
            //Debug.WriteLine(UrProgramStarted);
        }

        //Write message passed from web to the Ur5 over the specified port (Urscript port or Dashboard server port)
        private void Ur5_Write(int port, string message)
        {
            try
            {
                // Create a TcpClient.
                TcpClient client = new TcpClient(_Ur5_ip, port);

                // Translate the passed message into ASCII and store it as a Byte array.
                byte[] data = Encoding.ASCII.GetBytes(message);

                NetworkStream stream = client.GetStream();

                // Send the message to the connected TcpServer.
                stream.Write(data, 0, data.Length);

                Debug.WriteLine("Sent: " + message);

                // Close everything.
                stream.Close();
                client.Close();
            }
            catch (ArgumentNullException e)
            {
                Debug.WriteLine("ArgumentNullException: {0}", e);
            }
            catch (SocketException e)
            {
                Debug.WriteLine("SocketException: {0}", e);
            }
        }

        //Saves the blockly workspace either as an autosave or a save by name. Autosaved workspace is overwritten each time.
        //The goal of the autosave is to be able to recover your workspace in case of a crash. Otherwise use save as.
        private void SaveBlocklyWorkspaceLocally(string file, string canvas)
        {
            if (file.Contains("\"autosave\": true")) //this is an autosave
            {
                try
                {
                    string documentFolder = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
                    string alvoFolder = Path.Combine(documentFolder, "Alvo/AutosavedWorkspace" + canvas);

                    if (!Directory.Exists(alvoFolder))
                    {
                        Directory.CreateDirectory(alvoFolder);
                    }

                    string filename = canvas + "WorkspaceBackup" + ".json";
                    string localFilepath = Path.Combine(alvoFolder, filename);
                    File.WriteAllText(localFilepath, file);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Exception while autosaving workspace: " + ex);
                }
            }
            else //this is a save by name
            {
                try
                {
                    string documentFolder = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
                    string alvoFolder = Path.Combine(documentFolder, "Alvo/SavedWorkspaces" + canvas);

                    if (!Directory.Exists(alvoFolder))
                    {
                        Directory.CreateDirectory(alvoFolder);
                    }

                    SaveFileDialog saveFileDialog = new SaveFileDialog
                    {
                        InitialDirectory = documentFolder + "\\Alvo\\SavedWorkspaces" + canvas + "\\",
                        Title = "Save Blockly Workspace",
                        OverwritePrompt = true,
                        DefaultExt = "json",
                        Filter = "json files (*.json)|*.json",
                        FilterIndex = 2,
                        RestoreDirectory = true,

                    };

                    if (saveFileDialog.ShowDialog() == true)
                    {
                        File.WriteAllText(saveFileDialog.FileName, file);
                        WriteTextToWebview(saveFileDialog.SafeFileName, "#workspace-filename");
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Exception while saving workspace: " + ex);
                }
            }
        }

        private void OpenFile(string canvas)
        {
            try
            {
                string documentFolder = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
                string alvoFolder = Path.Combine(documentFolder, "Alvo/SavedWorkspaces" + canvas);

                if (!Directory.Exists(alvoFolder))
                {
                    Directory.CreateDirectory(alvoFolder);
                }
               
                OpenFileDialog openFileDialog = new OpenFileDialog
                {
                    InitialDirectory = documentFolder + "\\Alvo\\SavedWorkspaces" + canvas + "\\",
                    Title = "Load Saved Blockly Workspace",

                    CheckFileExists = true,
                    CheckPathExists = true,

                    DefaultExt = "json",
                    Filter = "json files (*.json)|*.json",
                    FilterIndex = 2,
                    RestoreDirectory = true,

                    ReadOnlyChecked = true,
                    ShowReadOnly = true
                };

                if (openFileDialog.ShowDialog() == true)
                {
                    string file_contents = File.ReadAllText(openFileDialog.FileName);
                    WriteTextToWebview(openFileDialog.SafeFileName, "#workspace-filename");   //send filename to webview
                    webView.CoreWebView2.PostWebMessageAsString(file_contents); //send file contents to webview                        
                }                
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error opening file: " + ex);
                webView.CoreWebView2.PostWebMessageAsString("OPEN_FILE_ERROR");
            }
        }
    }
}
