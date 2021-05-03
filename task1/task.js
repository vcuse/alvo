var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -140, -80, 'Station A');
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 0, -80, 'Station B');
  Simulator[Simulator.instance].station['STATIONC'] = new Station(document.getElementById("simulatordiv"), 140, -80, 'Station C');
  Simulator[Simulator.instance].station['STATIONB'].addItem("green", "left");
  Simulator[Simulator.instance].station['STATIONC'].addItem("orange", "left");
}

var checkTask = function(instance) {
  if (Date.now() - startTime > maxTime) {
    setTimeout(function(){ 
      submitLog("finish", "0");
      submitLog('events', JSON.stringify(eventLog));
      alert("You have exceeded the maximum time for this task. We have saved your last attempt and will now redirect you to the next task.");
      if (getCookie("ugroup") == 1)
        window.location.href = "../task2/twocanvas.html";
      else
        window.location.href = "../task2/onecanvas.html";
    }, 1000);
  }
  var expectGreen = Simulator[Simulator.instance].station['STATIONA'].rightItems[0];
  var expectOrange = Simulator[Simulator.instance].station['STATIONA'].rightItems[1];
  return expectGreen && expectOrange && expectGreen.color == 'green' && expectOrange.color == 'orange' 
         && (expectGreen.turned % 360) == 0 && (expectOrange.turned % 360) == 0;
}

setTimeout(function(){ submitLog("start", "0") }, 1000);

var pathPrefix = "../";
var taskId = "task1";
var startTime = Date.now();
var maxTime = 1000 * 60 * 10;

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