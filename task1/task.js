var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -75, -80, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 75, -80, 'Station B');
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "left");
}

var checkTask = function(instance) {
  var expectGreen = Simulator[Simulator.instance].station['STATIONA'].rightItems[0];
  var expectOrange = Simulator[Simulator.instance].station['STATIONA'].rightItems[1];
  return expectGreen && expectOrange && expectGreen.color == 'green' && expectOrange.color == 'orange' 
         && (expectGreen.turned % 360) == 0 && (expectOrange.turned % 360) == 0;
}

var pathPrefix = "../";