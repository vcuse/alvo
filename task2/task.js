var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -100, -80, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 100, -80, 'Station B');
  Simulator[Simulator.instance].station['STATIONC'] = new Station(document.getElementById("simulatordiv"), 0, 100, 'Station C');
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("blue", "right");
  Simulator[Simulator.instance].station['STATIONB'].addItem("blue", "right");
  Simulator[Simulator.instance].station['STATIONB'].addItem("blue", "right");
  Simulator[Simulator.instance].station['STATIONC'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIONC'].addItem("yellow", "left");
  Simulator[Simulator.instance].station['STATIONC'].addItem("yellow", "left");
}

var pathPrefix = "../";