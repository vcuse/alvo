var initialized = false;

var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -80, -80, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 80, -80, 'Station B');
  Simulator[Simulator.instance].station['STATIONA'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("green", "right");

  if (!initialized) {
    initialized = true;
    definedPositions["DEFAULT"] = [];
    definedPositions["DEFAULT"]["bottom left"] = '"left",0';
    definedPositions["DEFAULT"]["bottom right"] = '"right",0';
    definedPositions["Move box to the right"] = [];
    definedPositions["Move box to the right"]["bottom left"] = '"left",0';
    definedPositions["Move box to the right"]["bottom right"] = '"right",0';
    if (typeof toolboxRight != "undefined") {
      var rightWorkspace = Blockly.inject('__Move box to the rightdiv',
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        toolboxPosition: "start",
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
      });
      var workspaceBlocks = document.getElementById("rightWorkspaceBlocks");
      rightWorkspaces['Move box to the right'] = rightWorkspace;
      rightWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
      Blockly.Xml.domToWorkspace(workspaceBlocks, rightWorkspace);
      rightWorkspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);
      document.getElementById('__Move box to the rightdiv').style.display = 'none';
      rightWorkspace.addChangeListener(onTaskHeaderChanged);
      rightWorkspace.addChangeListener(logEvent);
    }
  }
}

var checkTask = function(instance) {
  var expectYellow = Simulator[Simulator.instance].station['STATIONA'].rightItems[0];
  var expectGreen1 = Simulator[Simulator.instance].station['STATIONB'].leftItems[0];
  var expectGreen2 = Simulator[Simulator.instance].station['STATIONB'].rightItems[0];
  var expectOrange = Simulator[Simulator.instance].station['STATIONB'].rightItems[1];

  return expectYellow && expectOrange && expectGreen1 && expectGreen2 
         && expectYellow.color == 'yellow' && expectGreen1.color == 'green' && expectGreen2.color == 'green' && expectOrange.color == 'orange' 
         && (expectYellow.turned % 360) == 0 && (expectGreen1.turned % 360) == 0 && (expectGreen2.turned % 360) == 0 && (expectOrange.turned % 360) == 0;
}

var pathPrefix = "../";
var taskId = "tut2";

setTimeout(function(){ submitLog("start", "0") }, 1000);

var taskStations = [[
      "Station A",
      "STATIONA"
  ],
  [
      "Station B",
      "STATIONB"
  ]];