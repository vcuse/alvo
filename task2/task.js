var initialized = false;

var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -100, -80, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 100, -80, 'Station B');
  Simulator[Simulator.instance].station['STATIONC'] = new Station(document.getElementById("simulatordiv"), -100, 100, 'Station C');
  Simulator[Simulator.instance].station['STATIOND'] = new Station(document.getElementById("simulatordiv"), 100, 100, 'Station D');
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
  Simulator[Simulator.instance].station['STATIONC'].addItem("blue", "right");
  Simulator[Simulator.instance].station['STATIONC'].addItem("blue", "right");
  Simulator[Simulator.instance].station['STATIONC'].addItem("blue", "right");
  Simulator[Simulator.instance].station['STATIOND'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIOND'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIOND'].addItem("yellow", "left");

  if (!initialized) {
    initialized = true;
    definedPositions["DEFAULT"] = [];
    definedPositions["DEFAULT"]["top left"] = '"left",2';
    definedPositions["DEFAULT"]["middle left"] = '"left",1';
    definedPositions["DEFAULT"]["bottom left"] = '"left",0';
    definedPositions["DEFAULT"]["top right"] = '"right",2';
    definedPositions["DEFAULT"]["middle right"] = '"right",1';
    definedPositions["DEFAULT"]["bottom right"] = '"right",0';
    definedPositions["Move Stack"] = [];
    definedPositions["Move Stack"]["top left"] = '"left",2';
    definedPositions["Move Stack"]["middle left"] = '"left",1';
    definedPositions["Move Stack"]["bottom left"] = '"left",0';
    definedPositions["Move Stack"]["top right"] = '"right",2';
    definedPositions["Move Stack"]["middle right"] = '"right",1';
    definedPositions["Move Stack"]["bottom right"] = '"right",0';
    if (typeof toolboxRight != "undefined") {
      var rightWorkspace = Blockly.inject('__Move Stackdiv',
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
      rightWorkspaces['Move Stack'] = rightWorkspace;
      rightWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
      Blockly.Xml.domToWorkspace(workspaceBlocks, rightWorkspace);
      rightWorkspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);
      document.getElementById('__Move Stackdiv').style.display = 'none';
      rightWorkspace.addChangeListener(onTaskHeaderChanged);
      rightWorkspace.addChangeListener(logEvent);
    }
  }
}

var checkTask = function() {
  if (Date.now() - startTime > maxTime) {
    setTimeout(function(){ 
      submitLog("finish", "0");
      submitLog('events', JSON.stringify(eventLog));
      alert("You have exceeded the maximum time for this task. We have saved your last attempt and will now redirect you to the next task.");
      if (getCookie("ugroup") == 1)
        window.location.href = "../task3/twocanvas.html";
      else
        window.location.href = "../task3/onecanvas.html";
    }, 1000);
  }
  var expectGreen1 = Simulator[Simulator.instance].station['STATIONA'].rightItems[0];
  var expectGreen2 = Simulator[Simulator.instance].station['STATIONA'].rightItems[1];
  var expectGreen3 = Simulator[Simulator.instance].station['STATIONA'].rightItems[2];
  var expectOrange1 = Simulator[Simulator.instance].station['STATIONB'].rightItems[0];
  var expectOrange2 = Simulator[Simulator.instance].station['STATIONB'].rightItems[1];
  var expectOrange3 = Simulator[Simulator.instance].station['STATIONB'].rightItems[2];
  var expectBlue1 = Simulator[Simulator.instance].station['STATIONC'].leftItems[0];
  var expectBlue2 = Simulator[Simulator.instance].station['STATIONC'].leftItems[1];
  var expectBlue3 = Simulator[Simulator.instance].station['STATIONC'].leftItems[2];
  var expectYellow1 = Simulator[Simulator.instance].station['STATIOND'].rightItems[0];
  var expectYellow2 = Simulator[Simulator.instance].station['STATIOND'].rightItems[1];
  var expectYellow3 = Simulator[Simulator.instance].station['STATIOND'].rightItems[2];
  var greens = expectGreen1 && expectGreen2 && expectGreen3 
               && expectGreen1.color == 'green' && (expectGreen1.turned % 360) == 0
               && expectGreen2.color == 'green' && (expectGreen2.turned % 360) == 0
               && expectGreen3.color == 'green' && (expectGreen3.turned % 360) == 0;
  var oranges = expectOrange1 && expectOrange2 && expectOrange3 
               && expectOrange1.color == 'orange' && (expectOrange1.turned % 360) == 0
               && expectOrange2.color == 'orange' && (expectOrange2.turned % 360) == 0
               && expectOrange3.color == 'orange' && (expectOrange3.turned % 360) == 0;
  var blues = expectBlue1 && expectBlue2 && expectBlue3 
               && expectBlue1.color == 'blue' && (expectBlue1.turned % 360) == 0
               && expectBlue2.color == 'blue' && (expectBlue2.turned % 360) == 0
               && expectBlue3.color == 'blue' && (expectBlue3.turned % 360) == 0;
  var yellows = expectYellow1 && expectYellow2 && expectYellow3 
               && expectYellow1.color == 'yellow' && (expectYellow1.turned % 360) == 180
               && expectYellow2.color == 'yellow' && (expectYellow2.turned % 360) == 180
               && expectYellow3.color == 'yellow' && (expectYellow3.turned % 360) == 180;
  return greens && oranges && blues && yellows;
}

setTimeout(function(){ submitLog("start", "0") }, 1000);

var pathPrefix = "../";
var taskId = "task2";
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
  ],
  [
      "Station D",
      "STATIOND"
  ]];