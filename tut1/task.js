var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -80, -80, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 80, -80, 'Station B');
  Simulator[Simulator.instance].station['STATIONA'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("green", "right");

}

var checkTask = function(instance) {
  var expectYellow = Simulator[Simulator.instance].station['STATIONA'].rightItems[0];
  return expectYellow && expectYellow.color == 'yellow' && (expectYellow.turned % 360) == 0;
}

setTimeout(function(){ submitLog("start", "0") }, 1000);

var pathPrefix = "../";
var taskId = "tut1";

var taskStations = [[
      "Station A",
      "STATIONA"
  ],
  [
      "Station B",
      "STATIONB"
  ]];