var initialized = false;

var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -100, -130, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 100, -130, 'Station B');
  Simulator[Simulator.instance].station['STATIONC'] = new Station(document.getElementById("simulatordiv"), -100, 20, 'Station C');
  Simulator[Simulator.instance].station['STATIOND'] = new Station(document.getElementById("simulatordiv"), 100, 20, 'Station D');
  Simulator[Simulator.instance].station['STATIONE'] = new Station(document.getElementById("simulatordiv"), -100, 150, 'Station E');
  Simulator[Simulator.instance].station['STATIONF'] = new Station(document.getElementById("simulatordiv"), 100, 150, 'Station F');
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "center");
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "center");
  Simulator[Simulator.instance].station['STATIOND'].addItem("orange", "center");
  Simulator[Simulator.instance].station['STATIOND'].addItem("orange", "center");
  Simulator[Simulator.instance].station['STATIONE'].addItem("blue", "left");
  Simulator[Simulator.instance].station['STATIONE'].addItem("blue", "left");
  Simulator[Simulator.instance].station['STATIONF'].addItem("yellow", "right");
  Simulator[Simulator.instance].station['STATIONF'].addItem("yellow", "right");

  if (!initialized) {
    initialized = true;
    definedPositions["Pick Top"] = [];
    definedPositions["Pick Top"]["top center"] = '"center",1';
    definedPositions["Pick Bottom"] = [];
    definedPositions["Pick Bottom"]["bottom center"] = '"center",0';
    definedPositions["Place Top"] = [];
    definedPositions["Place Top"]["top center"] = '"center",1';
    definedPositions["Place Bottom"] = [];
    definedPositions["Place Bottom"]["bottom center"] = '"center",0';
    if (typeof toolboxRight != "undefined") {
      var pickTopWorkspace = Blockly.inject('__Pick Topdiv',
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        toolboxPosition: "start",
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
      });
      var pickBottomWorkspace = Blockly.inject('__Pick Bottomdiv',
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        toolboxPosition: "start",
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
      });
      var placeTopWorkspace = Blockly.inject('__Place Topdiv',
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        toolboxPosition: "start",
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
      });
      var placeBottomWorkspace = Blockly.inject('__Place Bottomdiv',
      { media: pathPrefix + 'blockly/media/',
        toolbox: toolboxRight,
        trashcan: true,
        toolboxPosition: "start",
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
      });
      var pickTopBlocks = document.getElementById("pickTopBlocks");
      var pickBottomBlocks = document.getElementById("pickBottomBlocks");
      var placeTopBlocks = document.getElementById("placeTopBlocks");
      var placeBottomBlocks = document.getElementById("placeBottomBlocks");

      rightWorkspaces['Pick Top'] = pickTopWorkspace;
      rightWorkspaces['Place Top'] = placeTopWorkspace;
      rightWorkspaces['Pick Bottom'] = pickBottomWorkspace;
      rightWorkspaces['Place Bottom'] = placeBottomWorkspace;
      pickTopWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
      placeTopWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
      pickBottomWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
      placeBottomWorkspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);

      Blockly.Xml.domToWorkspace(pickTopBlocks, pickTopWorkspace);
      Blockly.Xml.domToWorkspace(placeTopBlocks, placeTopWorkspace);
      Blockly.Xml.domToWorkspace(pickBottomBlocks, pickBottomWorkspace);
      Blockly.Xml.domToWorkspace(placeBottomBlocks, placeBottomWorkspace);

      pickTopWorkspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);
      placeTopWorkspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);
      pickBottomWorkspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);
      placeBottomWorkspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);

      document.getElementById('__Pick Topdiv').style.display = 'none';
      document.getElementById('__Pick Bottomdiv').style.display = 'none';
      document.getElementById('__Place Topdiv').style.display = 'none';
      document.getElementById('__Place Bottomdiv').style.display = 'none';

      pickTopWorkspace.addChangeListener(onTaskHeaderChanged);
      pickTopWorkspace.addChangeListener(logEvent);
      placeTopWorkspace.addChangeListener(onTaskHeaderChanged);
      placeTopWorkspace.addChangeListener(logEvent);
      pickBottomWorkspace.addChangeListener(onTaskHeaderChanged);
      pickBottomWorkspace.addChangeListener(logEvent);
      placeBottomWorkspace.addChangeListener(onTaskHeaderChanged);
      placeBottomWorkspace.addChangeListener(logEvent);
    }
  }
}

var checkTask = function() {
  document.getElementById("surveylink").href = "https://ubc.ca1.qualtrics.com/jfe/form/SV_8cUt6daSu1kDsWO?UID=" + uid;
  var expectGreen1 = Simulator[Simulator.instance].station['STATIONB'].centerItems[0];
  var expectGreen2 = Simulator[Simulator.instance].station['STATIONB'].centerItems[1];
  var expectOrange1 = Simulator[Simulator.instance].station['STATIONC'].centerItems[0];
  var expectOrange2 = Simulator[Simulator.instance].station['STATIONC'].centerItems[1];
  var expectBlue1 = Simulator[Simulator.instance].station['STATIONE'].rightItems[0];
  var expectBlue2 = Simulator[Simulator.instance].station['STATIONE'].rightItems[1];
  var expectYellow1 = Simulator[Simulator.instance].station['STATIONF'].leftItems[0];
  var expectYellow2 = Simulator[Simulator.instance].station['STATIONF'].leftItems[1];
  var greens = expectGreen1 && expectGreen2 
               && expectGreen1.color == 'green' && (expectGreen1.turned % 360) == 0
               && expectGreen2.color == 'green' && (expectGreen2.turned % 360) == 0;
  var oranges = expectOrange1 && expectOrange2 
               && expectOrange1.color == 'orange' && (expectOrange1.turned % 360) == 0
               && expectOrange2.color == 'orange' && (expectOrange2.turned % 360) == 0;
  var blues = expectBlue1 && expectBlue2 
               && expectBlue1.color == 'blue' && (expectBlue1.turned % 360) == 0
               && expectBlue2.color == 'blue' && (expectBlue2.turned % 360) == 0;
  var yellows = expectYellow1 && expectYellow2 
               && expectYellow1.color == 'yellow' && (expectYellow1.turned % 360) == 0
               && expectYellow2.color == 'yellow' && (expectYellow2.turned % 360) == 0;
  return greens && oranges && blues && yellows;
}

setTimeout(function(){ submitLog("start", "0") }, 1000);
var pathPrefix = "../";
var taskId = "newtask";
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
  ],
  [
      "Station E",
      "STATIONE"
  ],
  [
      "Station F",
      "STATIONF"
  ]];