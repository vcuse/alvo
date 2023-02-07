var pathPrefix = pathPrefix || "";
var imagePathPrefix = imagePathPrefix || "";
var uid = undefined;
var ugroup = undefined;
var eventLog = [];
var testTask = testTask || undefined;

class SimElem {
  width;
  height;
  posX;
  posY;
  domElem;
  simDiv;
  canvasWidth = 350;
  canvasHeight = 450;
  simInstance;

  constructor(width, height, posX, posY, domElem, simDiv, simInstance) {
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this.domElem = domElem;
    this.simDiv = simDiv;
    this.simInstance = simInstance;
    this.render();
  }

  render() {
    this.domElem.style.top = (this.canvasHeight / 2 + this.posY - this.height / 2) + 'px';
    this.domElem.style.left = (this.canvasWidth / 2 + this.posX - this.width / 2) + 'px';
  }
}

class Robot extends SimElem {
  carry = null;

  constructor(simDiv, posX, posY, simInstance) {
    var domElem = document.createElement("img");
    domElem.classList.add("sim-robot");
    domElem.src = pathPrefix + "media/robot.png";
    simDiv.appendChild(domElem);
    super(50, 50, posX, posY, domElem, simDiv, simInstance);
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
      reportError(this.simInstance, "Robot is not correctly positioned to pick up item from this station!");
      return;
    }
    if (this.carry) {
      reportError(this.simInstance, "Robot is already carrying an item!");
      return;
    }
    if (!station.isSidePickable(side, index)) {
      reportError(this.simInstance, "Robot cannot pick up an item at the given position!");
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

  activateMachine(station, callback) {
    if (!station || !this.isAtStation(station) || !station.activateMachine) {
      reportError(this.simInstance, "Robot is not correctly positioned to activate a machine at this station!");
      return;
    }
    station.activateMachine(callback);
  }

  placeAtStation(station, side, index, callback) {
    if (!station || !this.isAtStation(station)) {
      reportError(this.simInstance, "Robot is not correctly positioned to place item at this station!");
      return;
    }
    if (!station.isSidePlaceable(side, index)) {  
      reportError(this.simInstance, "Robot cannot place an item at the given position!");
      return;
    }
    if (!this.carry) {
      reportError(this.simInstance, "Robot is not currently carrying an item!");
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

  constructor(simDiv, posX, posY, name, simInstance) {
    var domElem = document.createElement('span');
    var imgElem = document.createElement("img");
    domElem.classList.add("sim-station");
    imgElem.src = pathPrefix + "media/workstation.png";
    imgElem.classList.add("sim-station-img");
    domElem.appendChild(imgElem);
    domElem.innerHTML += "<br>" + (name ? name : '');
    simDiv.appendChild(domElem);
    super(60, 30, posX, posY, domElem, simDiv, simInstance);
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
        this.leftItems.push(new Item(this.simDiv, this.posX - 15, this.posY - 24 - 19*index, color, this.simInstance));
        break;
      case "right":
        while (this.rightItems.length < index)
          this.rightItems.push(null);
        this.rightItems.push(new Item(this.simDiv, this.posX + 15, this.posY - 24 - 19*index, color, this.simInstance));
        break;
      default:
        while (this.centerItems.length < index)
          this.centerItems.push(null);
        this.centerItems.push(new Item(this.simDiv, this.posX, this.posY - 24 - 19*index, color, this.simInstance));
    }
  }
}

class MachineStation extends Station {
  machineActive = false;
  activeImg;
  normalImg;

  constructor(simDiv, posX, posY, name, simInstance, active) {
    super(simDiv, posX, posY, name, simInstance);
    var machineElem = document.createElement("img");
    machineElem.src = pathPrefix + "media/machine.png";
    machineElem.classList.add("sim-machine-img");
    this.normalImg = machineElem;
    this.domElem.appendChild(machineElem);
    var activeMachineElem = document.createElement("img");
    activeMachineElem.src = pathPrefix + "media/machine-active.png";
    activeMachineElem.style.opacity = '0%';
    activeMachineElem.classList.add("sim-machine-img");
    this.activeImg = activeMachineElem;
    this.domElem.appendChild(activeMachineElem);
    if (active) {
      this.machineActive = true;
      machineElem.style.opacity = '0%';
      activeMachineElem.style.opacity = '100%';
    }
  }

  isSidePickable(side, opt_index) {
    var topCenter = this.topItemIndex("center");
    if (side == "center") {
      return topCenter != -1 && opt_index == 1 && !this.machineActive;
    }
    else {
      return false;
    }
  }

  hasBlock() {
    return this.centerItems[1];
  }

  activateMachine(callback) {
    if (this.machineActive) {
      reportError(this.simInstance, "The processor machine is already running and cannot be activated again!");
      return;
    }
    if (!this.centerItems[1]) {  
      reportError(this.simInstance, "The processor machine needs an item to be activated!");
      return;
    }
    if (this.centerItems[1].processed) {  
      reportError(this.simInstance, "The item in the processor machine has already been processed!");
      return;
    }
    this.machineActive = true;
    var active = this.activeImg;
    var normal = this.normalImg;
    var machine = this;
    var item = this.centerItems[1];
    var simInst = Simulator[this.simInstance];
    anime({
      targets: item.domElem,
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      marginTop: '2px',
      marginLeft: '1px',
      easing : 'easeInOutQuad',
      duration: 10000
    });
    anime({
      targets: normal,
      keyframes: [
        {opacity: '100%', duration:0},
        {opacity: '0%', duration:1000},
        {opacity: '100%', duration:7000}
      ],
      easing : 'linear',
      round : 1,
      update: function() {
      },
      complete: function() {
      }
    });
    anime({
      targets: active,
      keyframes: [
        {opacity: '0%', duration:0},
        {opacity: '100%', duration:1000},
        {opacity: '0%', duration:7000}
      ],
      easing : 'linear',
      round : 1,
      update: function() {
      },
      complete: function() {
        item.processed = true;
        machine.machineActive = false;
        simInst.checkTriggers();
      }
    });
    callback()
  }

  cooldown() {
    var active = this.activeImg;
    var normal = this.normalImg;
    var machine = this;
    var simInst = Simulator[this.simInstance];
    anime({
      targets: normal,
      keyframes: [
        {opacity: '0%', duration:0},
        {opacity: '100%', duration:7000}
      ],
      easing : 'linear',
      round : 1,
      update: function() {
      },
      complete: function() {
      }
    });
    anime({
      targets: active,
      keyframes: [
        {opacity: '100%', duration:0},
        {opacity: '0%', duration:7000}
      ],
      easing : 'linear',
      round : 1,
      update: function() {
      },
      complete: function() {
        machine.machineActive = false;
        simInst.checkTriggers();
      }
    });
  }

  isSidePlaceable(side, opt_index) {
    return side == "center" && opt_index == 1 && !this.centerItems[0] && !this.centerItems[1] && !this.machineActive;
  }

  computeNextIndex(side) {
    if (side == "center") {
      return 1;
    }
    else {
      return undefined;
    }
  }
}

class BinStation extends Station {
  constructor(simDiv, posX, posY, name, simInstance) {
    super(simDiv, posX, posY, name, simInstance);
    var binElem = document.createElement("img");
    binElem.src = pathPrefix + "media/bin.png";
    binElem.classList.add("sim-bin-img");
    this.normalImg = binElem;
    this.domElem.appendChild(binElem);
  }

  isSidePickable(side, opt_index) {
    return false;
  }

  hasBlock() {
    return false;
  }

  isSidePlaceable(side, opt_index) {
    return side == "center" && opt_index == 0;
  }

}

class Item extends SimElem {
  color = "white";
  turned = 0;
  processed = false;

  constructor(simDiv, posX, posY, color, simInstance) {
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
    super(20, 20, posX, posY, domElem, simInstance);
    this.color = color;
  }
}

var Simulator = {
  instance: 0
};

var previousError;
function reportError(simInstance, error, noIdle) {
  if (Simulator.instance != simInstance)
    return;

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
    triggerCheck:[],
    signalCheck:[],
    task:[],
    signal:[],
    queue:[],
    checkTriggers:function(resolve) {
      for (var key in this.triggerCheck) {
        if (!this.queue.includes(key) && this.triggerCheck[key]()) {
            this.queue.unshift(key);
        }
      }
      this.checkQueue(resolve);
    },
    checkQueue:function(resolve) {
      if (this.idle && this.queue.length > 0) {
        var key = this.queue.pop();
        if (this.signalCheck[key]()) {
          this.idle = false;
          this.trigger[key](function() { 
            if (resolve) resolve();
            Simulator[Simulator.instance].runIdle();
          });
        }
        else {
          this.checkQueue(resolve);
          this.queue.unshift(key);
        }
      }
    },
    runIdle:async function(resolve) {
      await new Promise(r => setTimeout(r, 150));
      this.idle = true;
      if (this.queue.length > 0) {
        this.checkTriggers(resolve);
      }
      else {
        if (resolve) resolve();
      }
    }
  };
  Simulator[Simulator.instance].robot = new Robot(document.getElementById("simulatordiv"), 0, 0, Simulator.instance);
  if (typeof initTask != "undefined") {
    initTask();
  }
  else {
    Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -75, -80, 'Station A', Simulator.instance);
    Simulator[Simulator.instance].station['STATIONB'] = new MachineStation(document.getElementById("simulatordiv"), 75, -80, 'Station B', Simulator.instance);
    Simulator[Simulator.instance].station['STATIONC'] = new Station(document.getElementById("simulatordiv"), 0, 100, 'Station C', Simulator.instance);
    Simulator[Simulator.instance].station['STATIONA'].addItem("green", "left");
    Simulator[Simulator.instance].station['STATIONA'].addItem("orange", "right");
    Simulator[Simulator.instance].station['STATIONC'].addItem("orange", "left");
    //Simulator[Simulator.instance].station['STATIONB'].addItem("orange", "center");
    //Simulator[Simulator.instance].station['STATIONC'].addItem("blue", "right");
    Simulator[Simulator.instance].station['STATIONC'].addItem("green", "left");
    Simulator[Simulator.instance].station['STATIONC'].addItem("yellow", "left");
  }
}

if (document.getElementById('test-button')) {
  document.getElementById('test-button').onclick = async function() {
    if (Simulator[Simulator.instance].idle) {
      document.getElementById('simulatordiv').innerHTML = '';
      initSimulator();
      var instance = Simulator.instance;
      if (testTask) {
        testTask(instance);
      }
      if (document.getElementById('task-fail'))
        document.getElementById('task-fail').style.display = 'none';
      if (document.getElementById('task-wait'))
        document.getElementById('task-wait').style.display = 'none';
      if (document.getElementById('task-success'))
        document.getElementById('task-success').style.display = 'none';
      generated = [];
      var code = '';
      if (rightWorkspaces) {
        for (var v in rightWorkspaces) {
          if (v && rightWorkspaces[v]) {
            var n = rightWorkspaces[v].getAllBlocks().find(block => block.type == 'custom_triggerheader');
            if (!n || leftWorkspace.getAllBlocks().find(block => block.type == 'custom_trigger' && block.getFieldValue('TRIGGER') == n.getFieldValue('TRIGGER'))) {
              code += Blockly.JavaScript.workspaceToCode(rightWorkspaces[v]) + '\n\n';
            }
          }
        }
      }
      if (!blockMode) {
        for (var g in graphs) {
          code += generateCodeForGraph(g);
        }
      }
      code += Blockly.JavaScript.workspaceToCode(leftWorkspace);
      if (!leftWorkspace.getAllBlocks().find(block => block.type == 'custom_start')) {
        code += '\n\n' + 'Simulator[' + Simulator.instance + '].runIdle();;';
      }
      console.log(code);

      code += Blockly.JavaScript.workspaceToCode(leftWorkspace);
      if (!leftWorkspace.getAllBlocks().find(block => block.type == 'custom_start')) {
        code += '\n\n' + 'Simulator[' + Simulator.instance + '].runIdle();';
      }

      await new Promise(resolve => { 
        eval(code); 
        for (var s in Simulator[Simulator.instance].station) {
          if (Simulator[Simulator.instance].station[s].machineActive) {
            Simulator[Simulator.instance].station[s].cooldown();
          }
        }
        Simulator[Simulator.instance].runIdle(resolve); } 
      );


      var codeLog = code + "\n\n\n\n" + Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(leftWorkspace));
      if (rightWorkspaces) {
        for (var v in rightWorkspaces) {
          if (v && rightWorkspaces[v]) {
            codeLog += '\n\n' + Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(rightWorkspaces[v]));
          }
        }
      }
      if (!blockMode) {
        for (var g in graphs) {
          var encoder = new mxCodec();
          var result = encoder.encode(graphs[g].getModel());
          codeLog += '\n\n' + mxUtils.getXml(result);
        }
      }

      if (checkTask(instance)) {
        submitLog('success', codeLog);
        submitLog('events', JSON.stringify(eventLog));
        document.getElementById('task-success').style.display = 'inline';
      }
      else {
        if (document.getElementById('task-fail')) {
          submitLog('fail', codeLog);
          document.getElementById('task-fail').style.display = 'inline';
        }
        else if (document.getElementById('task-wait')) {
          submitLog('test', codeLog);
          document.getElementById('task-wait').style.display = 'inline';
          while (testing && Simulator.instance == instance) {
            await new Promise(r => setTimeout(r, 100));
            if (checkTask(instance)) {
              submitLog('success', codeLog);
              submitLog('events', JSON.stringify(eventLog));
              document.getElementById('task-wait').style.display = 'none';
              document.getElementById('task-success').style.display = 'inline';
              break;
            }
          }
          document.getElementById('task-wait').style.display = 'none';
          if (testing) {
            testing = false;
          }
        }
      }
    }
    else {
      reportError(Simulator.instance, "Please reset simulator or wait for previous simulation to finish!", true);
    }
  }
}
if (document.getElementById('execution-button')) {
  document.getElementById('execution-button').onclick = function() {
    if (Simulator[Simulator.instance].idle) {
      generated = [];
      var code = '';
      if (rightWorkspaces) {
          for (var v in rightWorkspaces) {
            if (v && rightWorkspaces[v]) {
              var n = rightWorkspaces[v].getAllBlocks().find(block => block.type == 'custom_triggerheader');
              if (leftWorkspace.getAllBlocks().find(block => block.type == 'custom_trigger' && block.getFieldValue('TRIGGER') == n.getFieldValue('TRIGGER'))) {
                code += Blockly.JavaScript.workspaceToCode(rightWorkspaces[v]) + '\n\n';
              }
            }
          }
        }
      if (!blockMode) {
        for (var g in graphs) {
          code += generateCodeForGraph(g);
        }
      }
      code += Blockly.JavaScript.workspaceToCode(leftWorkspace);
      if (!leftWorkspace.getAllBlocks().find(block => block.type == 'custom_start')) {
        code += '\n\n' + 'Simulator[' + Simulator.instance + '].runIdle();';
      }
      console.log(code);
      eval(code);
      for (var s in Simulator[Simulator.instance].station) {
        if (Simulator[Simulator.instance].station[s].machineActive) {
          Simulator[Simulator.instance].station[s].cooldown();
        }
      }
      Simulator[Simulator.instance].runIdle();
    }
    else {
      reportError(Simulator.instance, "Please reset simulator or wait for previous simulation to finish!", true);
    }
  }
}
if (document.getElementById('reset-button')) {
  document.getElementById('reset-button').onclick = function() {
    document.getElementById('simulatordiv').innerHTML = '';
    initSimulator();
  }
}
if (document.getElementById('trigger-button1')) {
  document.getElementById('trigger-button1').onclick = function() {
    console.log("Button 1 clicked");
    Simulator[Simulator.instance].signal['button1'] = true;
    Simulator[Simulator.instance].checkTriggers();
    Simulator[Simulator.instance].signal['button1'] = false;
  }
}
if (document.getElementById('trigger-button2')) {
  document.getElementById('trigger-button2').onclick = function() {
    console.log("Button 2 clicked");
    Simulator[Simulator.instance].signal['button2'] = true;
    Simulator[Simulator.instance].checkTriggers();
    Simulator[Simulator.instance].signal['button2'] = false;
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

  if (findGetParameter('u')) {
    uid = findGetParameter('u');
    setCookie("uid", uid, 365);
  }
  else if (getCookie("uid")) {
    uid = getCookie("uid");
  }
  else {
    uid = Date.now();
    setCookie("uid", uid, 365);
  }

  if (findGetParameter('g')) {
    ugroup = findGetParameter('g');
    setCookie("ugroup", ugroup, 365);
  }
  else if (getCookie("ugroup")) {
    ugroup = getCookie("ugroup");
  }
  else {
    ugroup = Math.floor(Math.random() * 2) + 1;
    setCookie("ugroup", ugroup, 365);
  }
  if (document.getElementById('form-tut')) {
    if (ugroup == 1)
      document.getElementById('form-tut').action = 'tut2/blocks.html';
    else
      document.getElementById('form-tut').action = 'tut2/graph.html';
    document.getElementById('tutorial-button').value = 'Start Tutorial';
    document.getElementById('tutorial-button').disabled = false;
  }
}

function logGraphEvent(sender, event) {
  if (event.name == "fireMouseEvent" || event.name == "size" || event.name == "click") 
    return;
  var wid = undefined;
  for (var g in graphs) {
    if (graphs[g] == sender) {
      wid = g;
    }
  }
  eventLog.push([wid, event.name, false, null]);
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
