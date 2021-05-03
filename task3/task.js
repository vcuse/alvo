var initialized = false;

var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -100, -80, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 100, -80, 'Station B');
  Simulator[Simulator.instance].station['STATIONC'] = new Station(document.getElementById("simulatordiv"), -100, 100, 'Station C');
  Simulator[Simulator.instance].station['STATIOND'] = new Station(document.getElementById("simulatordiv"), 100, 100, 'Station D');
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONC'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIONC'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
  Simulator[Simulator.instance].station['STATIOND'].addItem("blue", "left");
  Simulator[Simulator.instance].station['STATIOND'].addItem("blue", "left");
}

var checkTask = function() {
  var expectOrange1 = Simulator[Simulator.instance].station['STATIONA'].leftItems[0];
  var expectGreen1 = Simulator[Simulator.instance].station['STATIONB'].leftItems[0];
  var expectBlue1 = Simulator[Simulator.instance].station['STATIONC'].leftItems[0];
  var expectBlue2 = Simulator[Simulator.instance].station['STATIONC'].leftItems[1];
  var expectYellow1 = Simulator[Simulator.instance].station['STATIOND'].leftItems[0];
  var expectYellow2 = Simulator[Simulator.instance].station['STATIOND'].leftItems[1];
  var greens = expectGreen1 && expectGreen1.color == 'green' && (expectGreen1.turned % 360) == 0;
  var oranges = expectOrange1 && expectOrange1.color == 'orange' && (expectOrange1.turned % 360) == 0;
  var blues = expectBlue1 && expectBlue2 
               && expectBlue1.color == 'blue' && (expectBlue1.turned % 360) == 0
               && expectBlue2.color == 'blue' && (expectBlue2.turned % 360) == 0;
  var yellows = expectYellow1 && expectYellow2 
               && expectYellow1.color == 'yellow' && (expectYellow1.turned % 360) == 0
               && expectYellow2.color == 'yellow' && (expectYellow2.turned % 360) == 0;
  return greens && oranges && blues && yellows;
}

var pathPrefix = "../";
var taskId = "task3";

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