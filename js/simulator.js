
var pathPrefix = pathPrefix || "";
var uid = undefined;
var eventLog = [];

class SimElem {
  width;
  height;
  posX;
  posY;
  domElem;
  simDiv;
  canvasWidth = 400;
  canvasHeight = 450;

  constructor(width, height, posX, posY, domElem, simDiv) {
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this.domElem = domElem;
    this.simDiv = simDiv;
    this.render();
  }

  render() {
    this.domElem.style.top = (this.canvasHeight / 2 + this.posY - this.height / 2) + 'px';
    this.domElem.style.left = (this.canvasWidth / 2 + this.posX - this.width / 2) + 'px';
  }
}

class Robot extends SimElem {
  carry = null;

  constructor(simDiv, posX, posY) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-robot");
    domElem.src = pathPrefix + "media/robot.png";
    simDiv.appendChild(domElem);
    super(50, 50, posX, posY, domElem, simDiv);
  }

  move(targetX, targetY, callback) {
    var toMove = [this];
    if (this.carry) 
      toMove.push(this.carry);
    anime({
      targets: toMove,
      posX : targetX,
      posY : function(e, i) {
        return (i == 0) ? targetY : (targetY - 3);
      },
      easing : 'linear',
      round: 1,
      update: function() {
        toMove.map(i => i.render());
      },
      complete: function() {
        if (callback) callback();
      }
    })
  }

  pickupFromStation(station, side, index, callback) {
    if (!station || !this.isAtStation(station)) {
      reportError("Robot is not correctly positioned to pick up item from this station!");
      return;
    }
    if (this.carry) {
      reportError("Robot is already carrying an item!");
      return;
    }
    if (!station.isSidePickable(side, index)) {
      reportError("Robot cannot pick up an item at the given position!");
      return;
    }

    switch (side) {
      case "left":
        var index = station.topItemIndex("left");
        var item = station.leftItems[index];
        station.leftItems[index] = null;
        break;
      case "right":
        var index = station.topItemIndex("right");
        var item = station.rightItems[index];
        station.rightItems[index] = null;
        break;
      default:
        var index = station.topItemIndex("center");
        var item = station.centerItems[index];
        station.centerItems[index] = null;
        break;
    }
    var robotX = this.posX;
    var robotY = this.posY;
    this.carry = item;
    this.domElem.src = pathPrefix + "media/robot-carry.png";
    item.domElem.style.zIndex = "2";
    anime({
      targets: item,
      posX : robotX,
      posY : robotY - 3,
      easing : 'linear',
      round: 1,
      update: function() {
        item.render();
      },
      complete: function() {
        if (callback) callback();
      }
    })
  }

  turnCarriedItem(direction, callback) {
    if (!this.carry) {
      reportError("Robot is not currently holding an item!");
      return;
    }
    var item = this.carry;
    if (direction == "right") {
      item.turned += 90;
    }
    else {
      item.turned -= 90;
    }
    anime({
            targets: item.domElem,
            rotate: item.turned + 'deg',
            easing : 'linear',
            round: 1,
            complete: function() {
              if (callback) callback();
            }
      })
  }

  placeAtStation(station, side, index, callback) {
    if (!station || !this.isAtStation(station)) {
      reportError("Robot is not correctly positioned to place item at this station!");
      return;
    }
    if (!station.isSidePlaceable(side, index)) {  
      reportError("Robot cannot place an item at the given position!");
      return;
    }
    if (!this.carry) {
      reportError("Robot is not currently carrying an item!");
      return;
    }
    var item = this.carry;
    switch(side) {
      case "left":
        station.leftItems[station.computeNextIndex("left")] = this.carry;
        anime({
          targets: item,
          posX : station.posX - 15,
          posY : station.posY - 24 - 19*index,
          easing : 'linear',
          round: 1,
          update: function() {
            item.render();
          },
          complete: function() {
            item.domElem.style.zIndex = "0";
            if (callback) callback();
          }
        })
        break;
      case "right":
        station.rightItems[station.computeNextIndex("right")] = this.carry;
        anime({
          targets: item,
          posX : station.posX + 15,
          posY : station.posY - 24 - 19*index,
          easing : 'linear',
          round: 1,
          update: function() {
            item.render();
          },
          complete: function() {
            item.domElem.style.zIndex = "0";
            if (callback) callback();
          }
        })
        break;
      default:
        station.centerItems[station.computeNextIndex("center")] = this.carry;
        anime({
          targets: item,
          posX : station.posX,
          posY : station.posY - 24 - 19*index,
          easing : 'linear',
          round: 1,
          update: function() {
            item.render();
          },
          complete: function() {
            item.domElem.style.zIndex = "0";
            if (callback) callback();
          }
        })
        break;
    }
    this.domElem.src = pathPrefix + "media/robot.png";
    this.carry = null;
  }

  moveToStation(station, callback) {
    this.move(station.posX, station.posY, callback);
  }

  isAtStation(station) {
    return this.posX == station.posX && this.posY == station.posY;
  }
}

class Station extends SimElem {
  leftItems = [];
  rightItems = [];
  centerItems = [];
  name = '';

  constructor(simDiv, posX, posY, name) {
    var domElem = document.createElement('span');
    var imgElem = document.createElement("img");
    domElem.classList.add("sim-station");
    imgElem.src = pathPrefix + "media/workstation.png";
    imgElem.classList.add("sim-station-img");
    domElem.appendChild(imgElem);
    domElem.innerHTML += "<br>" + (name ? name : '');
    simDiv.appendChild(domElem);
    super(60, 30, posX, posY, domElem, simDiv);
    this.name = name;
  }

  topItemIndex(side) {
    var topLeft = this.leftItems.length - 1 - this.leftItems.slice().reverse().findIndex(i => i != null);
    var topCenter = this.centerItems.length - 1 - this.centerItems.slice().reverse().findIndex(i => i != null);
    var topRight = this.rightItems.length - 1 - this.rightItems.slice().reverse().findIndex(i => i != null);
    topLeft = topLeft < this.leftItems.length ? topLeft : -1;
    topCenter = topCenter < this.centerItems.length ? topCenter : -1;
    topRight = topRight < this.rightItems.length ? topRight : -1;

    switch (side) {
      case "left":
        return topLeft;
      case "right":
        return topRight;
      default:
        return topCenter;
    }
  }

  isSidePickable(side, opt_index) {
    var topLeft = this.topItemIndex("left");
    var topCenter = this.topItemIndex("center");
    var topRight = this.topItemIndex("right");
    switch (side) {
      case "left":
        return topLeft != -1 && topLeft > topCenter && (opt_index ? topLeft == opt_index : true);
      case "right":
        return topRight != -1 && topRight > topCenter && (opt_index ? topRight == opt_index : true);
      default:
        return topCenter != -1 && topCenter > topLeft && topCenter > topLeft && (opt_index ? topCenter == opt_index : true);
    }
  }

  isSidePlaceable(side, opt_index) {
    return typeof(opt_index) == "undefined" || this.computeNextIndex(side) == opt_index;
  }

  computeNextIndex(side) {
    switch (side) {
      case "left":
        return Math.max(this.topItemIndex("left"), this.topItemIndex("center")) + 1;
      case "right":
        return Math.max(this.topItemIndex("center"), this.topItemIndex("right")) + 1;
      default:
        return Math.max(this.topItemIndex("left"), Math.max(this.topItemIndex("center"), this.topItemIndex("right"))) + 1;
    }
  }

  addItem(color, side) {
    var index = this.computeNextIndex(side);
    switch (side) {
      case "left":
        while (this.leftItems.length < index)
          this.leftItems.push(null);
        this.leftItems.push(new Item(this.simDiv, this.posX - 15, this.posY - 24 - 19*index, color));
        break;
      case "right":
        while (this.rightItems.length < index)
          this.rightItems.push(null);
        this.rightItems.push(new Item(this.simDiv, this.posX + 15, this.posY - 24 - 19*index, color));
        break;
      default:
        while (this.centerItems.length < index)
          this.centerItems.push(null);
        this.centerItems.push(new Item(this.simDiv, this.posX, this.posY - 24 - 19*index, color));
    }
  }
}

class Item extends SimElem {
  color = "white";
  turned = 0;

  constructor(simDiv, posX, posY, color) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-item");
    switch (color) {
      case "white":
        domElem.src = pathPrefix + "media/item.png";
        break;
      case "yellow":
        domElem.src = pathPrefix + "media/item-yellow.png";
        break;
      case "orange":
        domElem.src = pathPrefix + "media/item-orange.png";
        break;
      case "green":
        domElem.src = pathPrefix + "media/item-green.png";
        break;
      case "blue":
        domElem.src = pathPrefix + "media/item-blue.png";
        break;
      default:
        domElem.src = pathPrefix + "media/item.png";
    }
    simDiv.appendChild(domElem);
    super(20, 20, posX, posY, domElem);
    this.color = color;
  }
}

var Simulator = {
  instance: 0
};

var previousError;
function reportError(error, noIdle) {
  var output = document.getElementById('output');
  output.style.display = 'block';
  if (previousError) {
    previousError.style.fontWeight = 'normal';
    previousError.style.color = '#AAAAAA';
  }
  var errorMessage = document.createElement('span');
  errorMessage.classList.add('error')
  errorMessage.innerHTML = error + '<br>';
  output.insertBefore(errorMessage, output.firstChild);
  previousError = errorMessage;
  if (!noIdle) {
    Simulator[Simulator.instance].idle = true;
  }
}

function initSimulator() {
  Simulator.instance += 1;
  Simulator[Simulator.instance] = {
    idle:true,
    robot:null,
    station:[],
    trigger:[],
    task:[]
  };
  Simulator[Simulator.instance].robot = new Robot(document.getElementById("simulatordiv"), 0, 0);
  if (typeof initTask != "undefined") {
    initTask();
  }
  else {
    Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -75, -80, 'Station A');
    Simulator[Simulator.instance].station['STATIONB'] = new Station(document.getElementById("simulatordiv"), 75, -80, 'Station B');
    Simulator[Simulator.instance].station['STATIONC'] = new Station(document.getElementById("simulatordiv"), 0, 100, 'Station C');
    Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
    Simulator[Simulator.instance].station['STATIONA'].addItem("orange", "right");
    Simulator[Simulator.instance].station['STATIONC'].addItem("orange", "left");
    //Simulator[Simulator.instance].station['STATIONC'].addItem("blue", "right");
    Simulator[Simulator.instance].station['STATIONC'].addItem("green", "left");
    Simulator[Simulator.instance].station['STATIONC'].addItem("yellow", "left");
  }
}

initSimulator();

if (document.getElementById('test-button')) {
  document.getElementById('test-button').onclick = async function() {
    if (Simulator[Simulator.instance].idle) {
      console.log('called!');
      document.getElementById('simulatordiv').innerHTML = '';
      initSimulator();
      document.getElementById('task-fail').style.display = 'none';
      document.getElementById('task-success').style.display = 'none';
      Simulator[Simulator.instance].idle = false;
      generated = [];
      var code = '';
      if (rightWorkspaces) {
        for (var v in rightWorkspaces) {
          if (v && rightWorkspaces[v])
            code += Blockly.JavaScript.workspaceToCode(rightWorkspaces[v]) + '\n\n';
        }
      }
      code += Blockly.JavaScript.workspaceToCode(leftWorkspace);
      if (!leftWorkspace.getAllBlocks().find(block => block.type == 'custom_start')) {
        code += '\n\n' + 'Simulator[' + Simulator.instance + '].idle = true;';
      }
      console.log(code);
      eval(code);
      var instance = Simulator.instance;
      while (!Simulator[instance].idle) {
        await new Promise(r => setTimeout(r, 100));
      }

      var codeLog = code + "\n\n\n\n" + Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(leftWorkspace));
      if (rightWorkspaces) {
        for (var v in rightWorkspaces) {
          if (v && rightWorkspaces[v])
            codeLog += '\n\n' + Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(rightWorkspaces[v]));
        }
      }

      if (checkTask(instance)) {
        submitLog('success', codeLog);
        submitLog('events', JSON.stringify(eventLog));
        document.getElementById('task-success').style.display = 'inline';
      }
      else {
        submitLog('fail', codeLog);
        document.getElementById('task-fail').style.display = 'inline';
      }
    }
    else {
      reportError("Please reset simulator or wait for previous simulation to finish!", true);
    }
  }
  document.getElementById('execution-button').onclick = document.getElementById('test-button').onclick;
}
else if (document.getElementById('execution-button')) {
  document.getElementById('execution-button').onclick = function() {
    if (Simulator[Simulator.instance].idle) {
      Simulator[Simulator.instance].idle = false;
      generated = [];
      var code = '';
      if (rightWorkspaces) {
        for (var v in rightWorkspaces) {
          code += Blockly.JavaScript.workspaceToCode(rightWorkspaces[v]) + '\n\n';
        }
      }
      code += Blockly.JavaScript.workspaceToCode(leftWorkspace);
      if (!leftWorkspace.getAllBlocks().find(block => block.type == 'custom_start')) {
        code += '\n\n' + 'Simulator[' + Simulator.instance + '].idle = true;';
      }
      console.log(code);
      eval(code);
    }
    else {
      reportError("Please reset simulator or wait for previous simulation to finish!", true);
    }
  }
}
if (document.getElementById('red-button')) {
  document.getElementById('red-button').onclick = function() {
    if (Simulator[Simulator.instance].idle) {
      Simulator[Simulator.instance].idle = false;
      if (Simulator[Simulator.instance].trigger["RED"])
        Simulator[Simulator.instance].trigger["RED"]();
    }
  }
}
if (document.getElementById('blue-button')) {
  document.getElementById('blue-button').onclick = function() {
    if (Simulator[Simulator.instance].idle) {
      Simulator[Simulator.instance].idle = false;
      if (Simulator[Simulator.instance].trigger["BLUE"])
        Simulator[Simulator.instance].trigger["BLUE"]();
    }
  }
}
if (document.getElementById('yellow-button')) {
  document.getElementById('yellow-button').onclick = function() {
    if (Simulator[Simulator.instance].idle) {
      Simulator[Simulator.instance].idle = false;
      if (Simulator[Simulator.instance].trigger["YELLOW"])
        Simulator[Simulator.instance].trigger["YELLOW"]();
    }
  }
}
if (document.getElementById('reset-button')) {
  document.getElementById('reset-button').onclick = function() {
    document.getElementById('simulatordiv').innerHTML = '';
    initSimulator();
  }
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}

function findGetParameter(parameterName) {
    var result = undefined,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function initLog() {
  if (typeof(leftWorkspace) != "undefined")
    leftWorkspace.addChangeListener(logEvent);

  if (findGetParameter('uid')) {
    uid = findGetParameter('uid');
    setCookie("uid", uid, 365);
  }
  if (getCookie("uid")) {
    uid = getCookie("uid");
  }
  else {
    uid = Date.now();
    setCookie("uid", uid, 365);
  }

  var ugroup = getCookie("ugroup");
  if (!ugroup) {
    ugroup = 2;
    setCookie("ugroup", ugroup, 365);
    submitLog('start', ugroup);
  }

  if (document.getElementById("uid")) {
    document.getElementById("uid").innerHTML = uid;
  }
  if (ugroup == 1) {
    if (document.getElementById("head-a")) {
      document.getElementById("head-a").style.display = 'block';
    }
    if (document.getElementById("form-a")) {
      document.getElementById("form-a").style.display = 'block';
    }
  }
  if (ugroup == 2) {
    if (document.getElementById("head-b")) {
      document.getElementById("head-b").style.display = 'block';
    }
    if (document.getElementById("form-b")) {
      document.getElementById("form-b").style.display = 'block';
    }
  }
}

function logEvent(event) {
  var wid = undefined;
  if (event.workspaceId == leftWorkspace.id)
    wid = "MAIN";
  else {
    for (var v in rightWorkspaces) {
      if (rightWorkspaces[v] && event.workspaceId == rightWorkspaces[v].id)
        wid = v;
    }
  }
  if (!wid) 
    wid = "UNKNOWN";
  eventLog.push([wid, event.type, event.isUiEvent, event.blockId]);
}

initLog();

function submitLog(type, log) {
  var xhr = new XMLHttpRequest();
  var url = "https://www.cs.ubc.ca/~ritschel/log.php";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
      console.log(xhr.responseText);
  };
  if (typeof(taskId) != "undefined") {
    xhr.send("id=" + uid + "&task=" + taskId + "&type=" + type + "&log=" + encodeURIComponent(log));
  }
  else {
    xhr.send("id=" + uid + "&type=" + type + "&log=" + encodeURIComponent(log));
  }
}
