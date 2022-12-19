var initialized = false;
var definedPositions = [];

var initTask = function() {
  Simulator[Simulator.instance].station['STATIONA'] = new Station(document.getElementById("simulatordiv"), -100, -120, 'Station A', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONB'] = new MachineStation(document.getElementById("simulatordiv"), -100, 10, 'Station B', Simulator.instance, true);
  Simulator[Simulator.instance].station['STATIONC'] = new BinStation(document.getElementById("simulatordiv"), -100, 120, 'Station C', Simulator.instance);
  Simulator[Simulator.instance].station['STATIOND'] = new Station(document.getElementById("simulatordiv"), 100, -120, 'Station D', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONE'] = new MachineStation(document.getElementById("simulatordiv"), 100, 10, 'Station E', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONF'] = new BinStation(document.getElementById("simulatordiv"), 100, 120, 'Station F', Simulator.instance);
  Simulator[Simulator.instance].station['STATIONA'].addItem("green", "center");
  Simulator[Simulator.instance].station['STATIOND'].addItem("blue", "center");

  if (!initialized) {
    initialized = true;
    definedPositions["Pick up block"] = [];
    definedPositions["Pick up block"]["bottom center"] = '"center",0';
    definedPositions["Place block in bin"] = [];
    definedPositions["Place block in bin"]["bottom center"] = '"center",0';
    definedPositions["Load and activate machine"] = [];
    definedPositions["Load and activate machine"]["middle center"] = '"center",1';
    definedPositions["Get block from machine"] = [];
    definedPositions["Get block from machine"]["middle center"] = '"center",1';

    var provisionWorkspace = function(name, blocks, trigger) {
      var workspace = Blockly.inject('__' + name + 'div',
      { media: pathPrefix + 'blockly/media/',
        toolbox: (trigger ? document.getElementById("toolboxTrigger") : toolboxRight),
        trashcan: true,
        toolboxPosition: "start",
        readOnly: true,
        move:{
          scrollbars: false,
          drag: false,
          wheel: false}
      });
      rightWorkspaces[name] = workspace;
      workspace.registerToolboxCategoryCallback('LOCATIONS', flyoutLocationCategory);
      Blockly.Xml.domToWorkspace(blocks, workspace);
      if (trigger) {
        workspace.getBlocksByType("custom_triggerheader")[0].getField("TRIGGER").setValidator(triggerValidator);
      }
      else {
        workspace.getBlocksByType("custom_taskheader")[0].getField("TASK").setValidator(taskValidator);
      }
      document.getElementById('__' + name + 'div').style.display = 'none';
      workspace.addChangeListener(onTaskHeaderChanged);
      workspace.addChangeListener(logEvent);
    }

    var addNodeToGraph = function(graph, content, type, color, posX, posY, width, signalCode, triggerCode) {
      var node = graph.insertVertex(graph.getDefaultParent(), null, content, posX, posY, width, 40, 'node');
      graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, color, [node]);
      node.getGeometry().width = width;
      type.push(node);
      signalCodeGen[content] = signalCode;
      triggerCodeGen[content] = triggerCode;
      return node;
    }

    var addEdgeToGraph = function(graph, source, target) {
      return graph.insertEdge(graph.getDefaultParent(), null, null, source, target);
    }

    
    provisionWorkspace('Pick up block', document.getElementById("pickBlocks"));
    provisionWorkspace('Load and activate machine', document.getElementById("placeMachineBlocks"));
    provisionWorkspace('Get block from machine', document.getElementById("pickMachineBlocks"));
    provisionWorkspace('Place block in bin', document.getElementById("placeBlocks"));
    if (blockMode) {
      provisionWorkspace('!Ready to load machine', document.getElementById("triggerPlaceBlocks"), true);
      provisionWorkspace('!Machine finished', document.getElementById("triggerPickBlocks"), true);
    }
    else {
      setupGraph(document.getElementById("__!Ready to load machinediv"), "Ready to load machine", true);
      var gripNode = addNodeToGraph(graphs["Ready to load machine"], 'Robot gripper is <select name="EMPTYSTATUS"><option selected="selected" value="NONEMPTY">not empty</option></select>', graphSignals, '#3EA567', 200, 100, 210, () => 'Simulator[' + Simulator.instance + '].robot.carry', () => 'true');
      var emptyNode = addNodeToGraph(graphs["Ready to load machine"], 'Machine at <select name="SITE"><option selected="selected" value="STATIONB">Station B</option></select> is <select name="EMPTYSTATUS"><option selected="selected" value="EMPTY">empty</option></select>', graphSignals, '#8C5BA5', 20, 50, 285, () => '!Simulator[' + Simulator.instance + '].station["STATIONB"].hasBlock()', () => 'true');
      var idleNode = addNodeToGraph(graphs["Ready to load machine"], 'Machine at <select name="SITE"><option selected="selected" value="STATIONB">Station B</option></select> is <select name="IDLESTATUS"><option selected="selected" value="IDLE">not running</option></select>', graphSignals, '#8C5BA5', 320, 50, 290, () => '!Simulator[' + Simulator.instance + '].station["STATIONB"].machineActive', () => 'true');
      var trigger = triggerNodes["Ready to load machine"];
      addEdgeToGraph(graphs["Ready to load machine"], gripNode, trigger);
      addEdgeToGraph(graphs["Ready to load machine"], emptyNode, trigger);
      addEdgeToGraph(graphs["Ready to load machine"], idleNode, trigger);

      setupGraph(document.getElementById("__!Machine finisheddiv"), "Machine finished", true);
      var notEmptyNode = addNodeToGraph(graphs["Machine finished"], 'Machine at <select name="SITE"><option selected="selected" value="STATIONB">Station B</option></select> is <select name="EMPTYSTATUS"><option selected="selected" value="NOTEMPTY">not empty</option></select>', graphSignals, '#8C5BA5', 20, 50, 285, () => 'Simulator[' + Simulator.instance + '].station["STATIONB"].hasBlock()', () => 'true');
      var idleNode2 = addNodeToGraph(graphs["Machine finished"], 'Machine at <select name="SITE"><option selected="selected" value="STATIONB">Station B</option></select> is <select name="IDLESTATUS"><option selected="selected" value="IDLE">not running</option></select>', graphSignals, '#8C5BA5', 320, 50, 290, () => '!Simulator[' + Simulator.instance + '].station["STATIONB"].machineActive', () => 'true');
      var trigger2 = triggerNodes["Machine finished"];
      addEdgeToGraph(graphs["Machine finished"], notEmptyNode, trigger2);
      addEdgeToGraph(graphs["Machine finished"], idleNode2, trigger2);
    }
  }
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
  var rand = Math.floor(Math.random() * 2);
  new Promise(r => setTimeout(r, 2000)).then(function() {
    if (testing) {
      if (rand) {
        reportError(instance, "Test user has randomly clicked Button 1.", true);
        document.getElementById('trigger-button1').onclick();
      }
      else {
        reportError(instance, "Test user has randomly clicked Button 2.", true);
        document.getElementById('trigger-button2').onclick();
      } 
    }});
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

var checkTask = function() {
  if (Date.now() - startTime > maxTime) {
    setTimeout(function(){ 
      submitLog("finish", "0");
      submitLog('events', JSON.stringify(eventLog));
      alert("You have exceeded the maximum time for this task. We have saved your last attempt and will now redirect you to the next task.");
      if (getCookie("ugroup") == 1)
        window.location.href = "../task3/twocanvas.html";
      else
        window.location.href = "../task3/onecanvas.html";
    }, 1000);
  }
  
  var bin1 = Simulator[Simulator.instance].station['STATIONC'].centerItems[0];
  var bin2 = Simulator[Simulator.instance].station['STATIONF'].centerItems[0];
  return bin1 && bin2 && bin1.color == "green" && bin2.color == "blue" && bin1.processed && bin2.processed;
}

setTimeout(function(){ submitLog("start", "0") }, 1000);

var imagePathPrefix = "../../media";
var pathPrefix = "../";
var taskId = "task2";
var startTime = Date.now();
var maxTime = 1000 * 60 * 15;

var taskMachineStations = [[
      "Station B",
      "STATIONB"
  ],
  [
      "Station E",
      "STATIONE"
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
  ],
  [
      "Station E",
      "STATIONE"
  ],
  [
      "Station F",
      "STATIONF"
  ]];