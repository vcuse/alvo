var graphSignals = [];
var graphTwoCombinators = [];
var graphTriggers = [];
var graphs = [];
var triggerNodes = [];
var signalCodeGen = {};
var triggerCodeGen = {};

function makeStationsDropdown(stations) {
  var code = '<select name="SITE"><option value="NONE">Station ...</option>';
  for (var station in stations) {
    code += '<option value="' + stations[station][1] + '">' + stations[station][0] + '</option>';
  }
  code += '</select>';
  return code;
}

function getDropdownValue(graph, node, dropdownName) {
  return graph.view.getState(node, true).text.node.querySelector('select[name="' + dropdownName + '"]').value;
}

function showPopupMenu(menu) {
  if (!menu.classList.contains('show')) {
    var dropdowns = document.getElementsByClassName("graphbuttonspopup");
    for (var i = 0; i < dropdowns.length; i++) {
      if (dropdowns[i].classList.contains('show')) {
        dropdowns[i].classList.remove('show');
      }
    }
  }
  menu.classList.toggle("show");
}

function hidePopupMenus() {
  var dropdowns = document.getElementsByClassName("graphbuttonspopup");
  for (var i = 0; i < dropdowns.length; i++) {
    if (dropdowns[i].classList.contains('show')) {
      dropdowns[i].classList.remove('show');
    }
  }
}

window.onclick = function(event) {
  if (!event.target.matches('.graphbuttoncategory')) {
    var dropdowns = document.getElementsByClassName("graphbuttonspopup");
    for (var i = 0; i < dropdowns.length; i++) {
      if (dropdowns[i].classList.contains('show')) {
        dropdowns[i].classList.remove('show');
      }
    }
  }
}

// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
function setupGraph(container, triggerName, readOnly)
{
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported() || mxClient.IS_IE)
  {
    // Displays an error message if the browser is not supported.
    mxUtils.error('Browser is not supported!', 200, false);
  }
  else
  {
    // Snaps to fixed points
    mxConstraintHandler.prototype.intersects = function(icon, point, source, existingEdge)
    {
      return (!source || existingEdge) || mxUtils.intersects(icon.bounds, point);
    };
    if (!readOnly) {
      var buttonDiv = document.createElement('div');
      buttonDiv.id = container.id + "_buttons";
      buttonDiv.classList.add('graphbuttons');
      container.appendChild(buttonDiv);

      var inputPopupDiv = document.createElement('div');
      inputPopupDiv.id = container.id + "_popupsignals";
      inputPopupDiv.classList.add('graphbuttonspopup');
      container.appendChild(inputPopupDiv);

      var combinatorPopupDiv = document.createElement('div');
      combinatorPopupDiv.id = container.id + "_popupcombinators";
      combinatorPopupDiv.classList.add('graphbuttonspopup');
      container.appendChild(combinatorPopupDiv);

      var inputCategoryDiv = document.createElement('div');
      inputCategoryDiv.id = container.id + "_signals";
      inputCategoryDiv.classList.add('graphbuttoncategory');
      inputCategoryDiv.classList.add('graphbuttoncategorysignals');
      inputCategoryDiv.addEventListener("click", function() { showPopupMenu(inputPopupDiv); });
      inputCategoryDiv.innerHTML = "Signals";
      buttonDiv.appendChild(inputCategoryDiv);

      var combinatorCategoryDiv = document.createElement('div');
      combinatorCategoryDiv.id = container.id + "_combinators";
      combinatorCategoryDiv.classList.add('graphbuttoncategory');
      combinatorCategoryDiv.classList.add('graphbuttoncategorycombinators');
      combinatorCategoryDiv.addEventListener("click", function() { showPopupMenu(combinatorPopupDiv); });
      combinatorCategoryDiv.innerHTML = "Combinators";
      buttonDiv.appendChild(combinatorCategoryDiv);
    }

    var graphDiv = document.createElement('div');
    graphDiv.id = container.id + "_graph";
    graphDiv.classList.add('graphcontent');
    if (readOnly) {
      graphDiv.style.width = '100%';
    }
    container.appendChild(graphDiv);

    // Creates the graph inside the given container
    var graph = new mxGraph(graphDiv);
    graphs[triggerName] = graph;
    graph.setConnectable(true);
    graph.htmlLabels = true;
    graph.setAllowDanglingEdges(false);
    graph.setCellsEditable(false);
    graph.setCellsResizable(false);
    if (readOnly) {
      graph.enabled = false;
    }
    var keyHandler = new mxKeyHandler(graph);
    keyHandler.bindKey(46, function(evt)
    {
      if (graph.isEnabled())
      {
        graph.removeCells();
      }
    });
    //graph.getEdgeValidationError = function(edge, source, target) {
    //  if (source != null && target != null && this.model.getValue(source) != null && this.model.getValue(target) != null) {
    //    if (graphTriggers.includes(target) && target.edges && target.edges.length > 0) {
    //      return "";
    //    }
    //  } 
    //  return mxGraph.prototype.getEdgeValidationError.apply(this, arguments);
    //};

    var style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    style[mxConstants.STYLE_FONTSIZE] = 14;
    style[mxConstants.STYLE_FONTCOLOR] = 'white';
    style[mxConstants.STYLE_STROKECOLOR] = 'white';
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_HORIZONTAL] = true;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
    graph.getStylesheet().putCellStyle('node', style);

    //graph.connectionHandler.connectImage = new mxImage('images/connector.gif', 16, 16);

    // Disables floating connections (only use with no connect image)
    if (graph.connectionHandler.connectImage == null)
    {
      graph.connectionHandler.isConnectableCell = function(cell)
      {
         return false;
      };
      mxEdgeHandler.prototype.isConnectableCell = function(cell)
      {
        return graph.connectionHandler.isConnectableCell(cell);
      };
    }
    
    graph.getAllConnectionConstraints = function(terminal, source)
    {
      if (terminal != null && this.model.isVertex(terminal.cell))
      {
        if ((graphSignals.includes(terminal.cell) || graphTwoCombinators.includes(terminal.cell)) && source) 
          return [new mxConnectionConstraint(new mxPoint(0.5, 1), true)];
        if (graphTriggers.includes(terminal.cell) && !source) 
          return [new mxConnectionConstraint(new mxPoint(0.5, 0), true)];
        if (graphTwoCombinators.includes(terminal.cell) && !source) 
          return [new mxConnectionConstraint(new mxPoint(0.5, 0), true)];
        return [];
      }

      return null;
    };
    
    // Connect preview
    graph.connectionHandler.createEdgeState = function(me)
    {
      var edge = graph.createEdge(null, null, null, null, null, null);
      
      return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
    };

    graph.getModel().beginUpdate();
    try {
      var trigger = graph.insertVertex(graph.getDefaultParent(), null, triggerName, 220, 300, 100, 40, 'node');
      graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#A56D5B', [trigger]);
      trigger.getGeometry().width = graph.getPreferredSizeForCell(trigger).width + 10;
      graphTriggers.push(trigger);
      triggerNodes[triggerName] = trigger;
      signalCodeGen[triggerName] = function(graph, node, deflt) { 
        var code = 'true';
        for (var e in node.edges) {
          if (node.edges[e].target == node) {
            code += ' && ' + generateSignals(graph, node.edges[e].source, deflt);
          }
        }
        return code;
      };
      triggerCodeGen[triggerName] = function(graph, node, deflt) { 
        var code = 'true';
        for (var e in node.edges) {
          if (node.edges[e].target == node) {
            code += ' && ' + generateTriggers(graph, node.edges[e].source, deflt);
          }
        }
        return code;
      };
    }
    finally {
      graph.getModel().endUpdate();
    }
  }

  var insert = function(type, content, color, width) { 
    return function(graph, evt, target, x, y)
      {
        graph.getModel().beginUpdate();
        var cell = graph.insertVertex(graph.getDefaultParent(), null, content, x, y, width, 40, 'node');
        graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, color, [cell]);
        type.push(cell);
        if (cell != null) {
          graph.scrollCellToVisible(cell);
          graph.setSelectionCells([cell]);
        }
        graph.getModel().endUpdate();
      };
  }
  
  var registerNode = function(id, type, content, color, width, signalCode, triggerCode) {
    if (!readOnly) {
      var button = document.createElement('div');
      button.id = id;
      button.classList.add('graphbutton');
      button.classList.add('graphbutton-fixed');
      button.style.backgroundColor = color;
      button.style.width = width + "px";
      button.innerHTML = content;
      if (type == graphSignals) {
        inputPopupDiv.appendChild(button);
        if (inputPopupDiv.children.length < 2) {
          button.classList.add('graphbutton-top');
        }
      }
      else if (type == graphTwoCombinators) {
        combinatorPopupDiv.appendChild(button);
        if (combinatorPopupDiv.children.length < 2) {
          button.classList.add('graphbutton-top');
        }
      }
      var dragElt = document.createElement('div');
      dragElt.classList.add('graphbutton');
      dragElt.style.backgroundColor = color;
      dragElt.style.width = width + "px";
      dragElt.innerHTML = content;
      var ds = mxUtils.makeDraggable(button, graph, insert(type, content, color, width), dragElt, -5, -5, graph.autoscroll, true);
    }
    signalCodeGen[content] = signalCode;
    triggerCodeGen[content] = triggerCode;
  }

  registerNode('button1sig', graphSignals, 'Button 1 is pressed', '#3EA567', 140, 
    function(graph, node) { return false; }, 
    function(graph, node) { return 'Simulator[' + Simulator.instance + '].signal["button1"]'; });
  registerNode('button2sig', graphSignals, 'Button 2 is pressed', '#3EA567', 140, 
    function(graph, node) { return false; }, 
    function(graph, node) { return 'Simulator[' + Simulator.instance + '].signal["button2"]'; });
  registerNode('emptygrippersig', graphSignals, 'Robot gripper is <select name="EMPTYSTATUS"><option value="EMPTY">empty</option><option value="NONEMPTY">not empty</option></select>', '#3EA567', 215, 
    function(graph, node) { 
      if (getDropdownValue(graph, node, "EMPTYSTATUS") == "EMPTY") {
         return '!Simulator[' + Simulator.instance + '].robot.carry';
      }
      else {
         return 'Simulator[' + Simulator.instance + '].robot.carry';
      }
    },
    function(graph, node) { return false; });
  registerNode('emptymachinesig', graphSignals, 'Machine at ' + makeStationsDropdown(taskMachineStations) + ' is <select name="EMPTYSTATUS"><option value="EMPTY">empty</option><option value="NONEMPTY">not empty</option></select>', '#8C5BA5', 290, 
    function(graph, node) { 
      if (getDropdownValue(graph, node, "SITE") != "NONE") {
        if (getDropdownValue(graph, node, "EMPTYSTATUS") == "EMPTY") {
           return '!Simulator[' + Simulator.instance + '].station["' + getDropdownValue(graph, node, "SITE") + '"].hasBlock()';
        }
        else {
           return 'Simulator[' + Simulator.instance + '].station["' + getDropdownValue(graph, node, "SITE") + '"].hasBlock()';
        }
      }
      else {
        return "false";
      }
    },
    function(graph, node) { return false; });
  registerNode('idlemachinesig', graphSignals, 'Machine at ' + makeStationsDropdown(taskMachineStations) + ' is <select name="IDLESTATUS"><option value="BUSY">running</option><option value="IDLE">not running</option></select>', '#8C5BA5', 298, 
    function(graph, node) { 
      if (getDropdownValue(graph, node, "SITE") != "NONE") {
        if (getDropdownValue(graph, node, "IDLESTATUS") == "IDLE") {
           return '!Simulator[' + Simulator.instance + '].station["' + getDropdownValue(graph, node, "SITE") + '"].machineActive';
        }
        else {
           return 'Simulator[' + Simulator.instance + '].station["' + getDropdownValue(graph, node, "SITE") + '"].machineActive';
        }
      }
      else {
        return "false";
      }
    },
    function(graph, node) { return false; });
  registerNode('andcomb', graphTwoCombinators, 'and', '#3A54A5', 50, 
    function(graph, node) { 
      var code = '(true';
      for (var e in node.edges) {
        if (node.edges[e].target == node) {
          code += ' && ' + generateSignals(graph, node.edges[e].source, 'true');
        }
      }
      return code + ')';
    }, 
    function(graph, node) { 
      var code = '(true';
      for (var e in node.edges) {
        if (node.edges[e].target == node) {
          code += ' && ' + generateTriggers(graph, node.edges[e].source, 'true');
        }
      }
      return code + ')';
    });
  registerNode('orcomb', graphTwoCombinators, 'or', '#3A54A5', 50, 
    function(graph, node) { 
      var code = '(false';
      for (var e in node.edges) {
        if (node.edges[e].target == node) {
          code += ' || ' + generateSignals(graph, node.edges[e].source, 'true');
        }
      }
      if (code == '(false')
        code = '(true';
      return code + ')';
    }, 
    function(graph, node) { 
      var code = '(false';
      for (var e in node.edges) {
        if (node.edges[e].target == node) {
          code += ' || ' + generateTriggers(graph, node.edges[e].source, 'true');
        }
      }
      return code + ')';
    });
  graph.addListener(null, logGraphEvent);
};

function generateCodeForGraph(name) {
  var graph = graphs[name];
  var trigger = graphTriggers[name];
  var signalCode = '';
  var triggerCode = '';
  for (var v in graph.model.cells) {
    if (graphTriggers.includes(graph.model.cells[v])) {
      signalCode += generateSignals(graph, graph.model.cells[v], 'true');
      triggerCode += generateTriggers(graph, graph.model.cells[v], 'true');
    }
  }
  if (signalCode === 'true' && triggerCode === 'true') {
    triggerCode = 'false';
    reportError(Simulator.instance, "Ignoring trigger '" + name + "' because it is empty.", true);
  }
  return 'Simulator[' + Simulator.instance + '].signalCheck["' + name + '"] = function() {\n  return ' + signalCode + ";\n}\n" +
        'Simulator[' + Simulator.instance + '].triggerCheck["' + name + '"] = function() {\n  return ' + triggerCode + ";\n}\n";;
}

function generateSignals(graph, node, deflt) {
  var code = signalCodeGen[node.value](graph, node, deflt);
  return code || deflt;
}

function generateTriggers(graph, node, deflt) {
  var code = triggerCodeGen[node.value](graph, node, deflt);
  return code || deflt;
}
