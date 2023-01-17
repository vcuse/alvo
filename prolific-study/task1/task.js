var initialized = false;
var taskTime = undefined;
var maxTime = 1000 * 60 * 20;

var initTask = function() {
  if (!findGetParameter('reset') && getCookie("task1")) {
    taskTime = getCookie("task1");
  }
  else {
    taskTime = Date.now();
    setCookie("task1", taskTime, 365);
  }
  if (!initialized) {
    initialized = true;
    if (Date.now() - taskTime > maxTime) {
      setTimeout(function(){ 
        submitLog("finish", "0");
        submitLog('events', JSON.stringify(eventLog));
        alert("You have exceeded the maximum time for this task. We will now redirect you to the next task.");
        if (getCookie("ugroup") == 1)
          window.location.href = "../task2/blocks.html";
        else
          window.location.href = "../task2/graph.html";
      }, 1000);
    }
    else {
      var elapsed = Date.now() - taskTime;
      var offset = 20;
      while (offset * 60 * 1000 - elapsed > 0) {
        const tempOffset = offset;
        setTimeout(function(){ 
          if (20 - tempOffset < 1) {
            reportError(Simulator.instance, "You ran out of time for this task. You can submit your solution by clicking the \"Test Current\" Program button. We will then redirect you to the next task.", true);
          }
          else {
            reportError(Simulator.instance, "You have " + (20 - tempOffset) + " minutes left for this task.", true);
          }
      }, offset * 60 * 1000 - elapsed);
        offset -= 5;
      }
      reportError(Simulator.instance, "You have " + (20 - Math.floor(elapsed / 60 / 1000)) + " minutes left for this task.", true);
    }
  }
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -100, -120, 'Station A', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 100, -120, 'Station B', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONC'] = new MachineStation(document.getElementById("simulatordiv"), -100, 120, 'Station C', Simulator.instance);
  Simulator[Simulator.instance].station['STATIOND'] = new BinStation(document.getElementById("simulatordiv"), 100, 120, 'Station D', Simulator.instance);

  Simulator[Simulator.instance].station['STATIONA'].addItem("blue", "center");
  Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "center");
}

var testing = false;

var testTask = function(instance) {
  document.getElementById('trigger-button1').disabled = true;
  document.getElementById('trigger-button2').disabled = true;
  document.getElementById('execution-button').disabled = true;
  document.getElementById('reset-button').disabled = true;
  document.getElementById('test-button').disabled = true;
  document.getElementById('test-stop-button').style.display = 'inline';
  testing = true;
  new Promise(r => setTimeout(r, 2000)).then(function() {
    if (testing) {
      reportError(instance, "Test user has clicked Button 1.", true);
      document.getElementById('trigger-button1').onclick();
    }
    }).then(new Promise(r => setTimeout(r, 5000)).then(function() {
      if (testing)
        reportError(instance, "Test user has clicked Button 2.", true);
        document.getElementById('trigger-button2').onclick();
    }));
  document.getElementById('test-stop-button').onclick = function() {
    document.getElementById('trigger-button1').disabled = false;
    document.getElementById('trigger-button2').disabled = false;
    document.getElementById('test-button').disabled = false;
    document.getElementById('execution-button').disabled = false;
    document.getElementById('reset-button').disabled = false;
    document.getElementById('test-stop-button').style.display = 'none';
    testing = false;
  }
}

var checkTask = function(instance) {
  if (Date.now() - taskTime > maxTime) {
    setTimeout(function(){ 
      submitLog("finish", "0");
      submitLog('events', JSON.stringify(eventLog));
      alert("You have exceeded the maximum time for this task. We have saved your last attempt and will now redirect you to the next task.");
      if (getCookie("ugroup") == 1)
        window.location.href = "../task2/blocks.html";
      else
        window.location.href = "../task2/graph.html";
    }, 1000);
  }
  var bin1 = Simulator[Simulator.instance].station['STATIOND'].centerItems[0];
  var bin2 = Simulator[Simulator.instance].station['STATIOND'].centerItems[1];
  return bin1 && bin2 && bin1.processed && bin2.processed;
}

setTimeout(function(){ submitLog("start", "0") }, 1000);

var pathPrefix = "../";
var imagePathPrefix = "../../media";
var taskId = "task1";

var taskMachineStations = [[
      "Station C",
      "STATIONC"
  ]];


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