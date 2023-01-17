var initialized = false;

var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -100, -80, 'Station A', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONB'] = new MachineStation(document.getElementById("simulatordiv"), 100, -80, 'Station B', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONC'] = new BinStation(document.getElementById("simulatordiv"), 0, 100, 'Station C', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "center");

  if (!initialized) {
    initialized = true;
    definedPositions["Pick up box"] = [];
    definedPositions["Pick up box"]["bottom center"] = '"center",0';
    definedPositions["Place box in machine"] = [];
    definedPositions["Place box in machine"]["middle center"] = '"center",1';

    var provisionWorkspace = function(name, blocks, trigger) {
      var workspace = Blockly.inject('__' + name + 'div',
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        toolboxPosition: "start",
        readOnly: false,
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
      });
      rightWorkspaces[name] = workspace;
      workspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
      Blockly.Xml.domToWorkspace(blocks, workspace);
      if (trigger) {
        workspace.getBlocksByType("custom_triggerheader")[0].getField("TRIGGER").setValidator(triggerValidator);
      }
      else {
        workspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);
      }
      document.getElementById('__' + name + 'div').style.display = 'none';
      workspace.addChangeListener(onTaskHeaderChanged);
      workspace.addChangeListener(logEvent);
    }

    provisionWorkspace('Pick up box', document.getElementById("pickWorkspaceBlocks"));
    provisionWorkspace('Place box in machine', document.getElementById("placeWorkspaceBlocks"));
  }
}

var testing = false;

var testTask = function(instance) {
  document.getElementById('trigger-button1').disabled = true;
  document.getElementById('trigger-button2').disabled = true;
  document.getElementById('test-button').disabled = true;
  document.getElementById('test-stop-button').style.display = 'inline';
  testing = true;
  document.getElementById('test-stop-button').onclick = function() {
    document.getElementById('trigger-button1').disabled = false;
    document.getElementById('trigger-button2').disabled = false;
    document.getElementById('test-button').disabled = false;
    document.getElementById('test-stop-button').style.display = 'none';
    testing = false;
  }
}

var checkTask = function() {
  var expectGreen = Simulator[Simulator.instance].station['STATIONC'].centerItems[0];

  return expectGreen && expectGreen.processed;
}

setTimeout(function(){ submitLog("start", "0") }, 1000);

var pathPrefix = "../";
var imagePathPrefix = "../../media";
var taskId = "tut3";
var startTime = Date.now();
var maxTime = 1000 * 60 * 15;

var taskStations = [[
      "Station A",
      "STATIONA"
  ],
  [
      "Station B",
      "STATIONB"
  ],
  [
      "Station C",
      "STATIONC"
  ]];