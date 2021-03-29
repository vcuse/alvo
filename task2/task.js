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

var checkTask = function() {
  var expectGreen1 = Simulator[Simulator.instance].station['STATIONA'].rightItems[0];
  var expectGreen2 = Simulator[Simulator.instance].station['STATIONA'].rightItems[1];
  var expectGreen3 = Simulator[Simulator.instance].station['STATIONA'].rightItems[2];
  var expectBlue1 = Simulator[Simulator.instance].station['STATIONB'].leftItems[0];
  var expectBlue2 = Simulator[Simulator.instance].station['STATIONB'].leftItems[1];
  var expectBlue3 = Simulator[Simulator.instance].station['STATIONB'].leftItems[2];
  var expectYellow1 = Simulator[Simulator.instance].station['STATIONC'].rightItems[0];
  var expectYellow2 = Simulator[Simulator.instance].station['STATIONC'].rightItems[1];
  var expectYellow3 = Simulator[Simulator.instance].station['STATIONC'].rightItems[2];
  var greens = expectGreen1 && expectGreen2 && expectGreen3 
               && expectGreen1.color == 'green' && (expectGreen1.turned % 360) == 0
               && expectGreen2.color == 'green' && (expectGreen2.turned % 360) == 0
               && expectGreen3.color == 'green' && (expectGreen3.turned % 360) == 0;
  var blues = expectBlue1 && expectBlue2 && expectBlue3 
               && expectBlue1.color == 'blue' && (expectBlue1.turned % 360) == 0
               && expectBlue2.color == 'blue' && (expectBlue2.turned % 360) == 0
               && expectBlue3.color == 'blue' && (expectBlue3.turned % 360) == 0;
  var yellows = expectYellow1 && expectYellow2 && expectYellow3 
               && expectYellow1.color == 'yellow' && (expectYellow1.turned % 360) == 180
               && expectYellow2.color == 'yellow' && (expectYellow2.turned % 360) == 180
               && expectYellow3.color == 'yellow' && (expectYellow3.turned % 360) == 180;
  return greens && blues && yellows;
}

var pathPrefix = "../";