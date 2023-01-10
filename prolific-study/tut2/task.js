var initialized = false;

var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -80, -80, 'Station A', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 80, -80, 'Station B', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONA'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("green", "right");

  if (!initialized) {
    initialized = true;
    definedPositions["Move box to the right"] = [];
    definedPositions["Move box to the right"]["bottom left"] = '"left",0';
    definedPositions["Move box to the right"]["bottom right"] = '"right",0';

    var provisionWorkspace = function(name, blocks, trigger) {
      var workspace = Blockly.inject('__' + name + 'div',
      { media: pathPrefix + 'blockly/media/',
        toolbox: (trigger ? document.getElementById("toolboxTrigger") : toolboxRight),
        trashcan: true,
        toolboxPosition: "start",
        readOnly: true,
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

    provisionWorkspace('Move box to the right', document.getElementById("rightWorkspaceBlocks"));
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
var imagePathPrefix = "../../media";
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