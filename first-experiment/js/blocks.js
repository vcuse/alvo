// Defines the custom blocks used in our toolbox.

Blockly.Blocks['procedures_defreturn'] = null;
Blockly.Blocks['procedures_ifreturn'] = null;
Blockly.Blocks['procedures_defnoreturn'].init = function() {
    var initName = Blockly.Procedures.findLegalName('', this);
    var nameField = new Blockly.FieldTextInput(initName,
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE'])
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.setStyle('procedure_blocks');
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  };
Blockly.Blocks['procedures_defnoreturn'].customContextMenu = function(options) {
    if (this.isInFlyout) {
      return;
    }
    // Add option to create caller.
    var option = {enabled: true};
    var name = this.getFieldValue('NAME');
    option.text = "Create block for using '%1'".replace('%1', name);
    var xmlMutation = Blockly.utils.xml.createElement('mutation');
    xmlMutation.setAttribute('name', name);
    for (var i = 0; i < this.arguments_.length; i++) {
      var xmlArg = Blockly.utils.xml.createElement('arg');
      xmlArg.setAttribute('name', this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = Blockly.utils.xml.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    var copyOption = {enabled: true};
    var name = this.getFieldValue('NAME');
    copyOption.text = "Copy definition of '%1'".replace('%1', name);
    var xmlCopy = Blockly.Xml.blockToDom(this, true);
    copyOption.callback = Blockly.ContextMenu.callbackFactory(this, xmlCopy);
    options.push(copyOption);
  }

if (typeof taskStations == "undefined") {
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
}

Blockly.defineBlocksWithJsonArray([
    // Start
    {
        "type": "custom_start",
        "message0": "When program is started",
        "nextStatement": null,
        "colour": 15,
        "tooltip": "",
        "helpUrl": ""
    },
    {
        "type": "custom_triggerstart",
        "message0": "When idle and %1 button is activated",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "TRIGGER",
                "options": [
                [
                    "Red",
                    "RED"
                ],
                [
                    "Blue",
                    "BLUE"
                ],
                [
                    "Yellow",
                    "YELLOW"
                ]
                ]
            }
        ],
        "nextStatement": null,
        "colour": 15,
        "tooltip": "",
        "helpUrl": ""
    },
    {
        "type": "custom_taskheader",
        "message0": "To %2 at %1:",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SITE",
                                "options": [
                [
                    "Station...",
                    "NONE"
                ]].concat(taskStations)                
            },
            {
              "type": "field_input",
              "name": "TASK",
              "text": "do a task",
              "spellcheck": false
            }
        ],
        "inputsInline": false,
        "nextStatement": null,
        "colour": 185,
        "tooltip": "",
        "helpUrl": "",
    },
    // Move somewhere
    {
        "type": "custom_task",
        "message0": "%2 at %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SITE",
                "options": [
                [
                    "Station...",
                    "NONE"
                ]].concat(taskStations)
            },
            {
              "type": "field_input",
              "name": "TASK",
              "text": "do a task",
              "spellcheck": false
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 185,
        "tooltip": "",
        "helpUrl": "",
    },
    {
        "type": "custom_robotmove",
        "message0": "Move to %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SITE",
                "options": [
                [
                    "Station...",
                    "NONE"
                ]].concat(taskStations)
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 185,
        "tooltip": "",
        "helpUrl": "",
    },
    // Move somewhere
    {
        "type": "custom_newtask",
        "message0": "At %1: Perform new task...",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SITE",
                "options": [
                [
                    "Station...",
                    "NONE"
                ]].concat(taskStations)
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 185,
        "tooltip": "",
        "helpUrl": "",
    },
    // Move somewhere
    {
        "type": "custom_move",
        "message0": "Move arm %1 to %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SPEED",
                "options": [
                [
                    "quickly",
                    "QUICK"
                ],
                [
                    "moderately",
                    "MODERATE"
                ],
                [
                    "slowly",
                    "SLOW"
                ]
                ]
            },
            {
                "type": "input_value",
                "name": "LOCATION",
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 50,
        "tooltip": "",
        "helpUrl": "",
    },
    // Simulator pick
    {
        "type": "custom_pickup",
        "message0": "Pick up item from %1",
        "args0": [
            {
                "type": "input_value",
                "name": "LOCATION",
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 50,
        "tooltip": "",
        "helpUrl": "",
    },
    // Simulator place
    {
        "type": "custom_place",
        "message0": "Place item at %1",
        "args0": [
            {
                "type": "input_value",
                "name": "LOCATION",
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 50,
        "tooltip": "",
        "helpUrl": "",
    },
    // Location
    {
        "type": "custom_location",
        "message0": "%1",
        "args0": [
            {
                "type": "field_label_serializable",
                "name": "LOCATION",
            }
        ],
        "inputsInline": false,
        "output": null,
        "colour": 30,
        "tooltip": "",
        "helpUrl": "",
    },
    // Dummy location
    {
        "type": "custom_dummylocation",
        "message0": "<location>",
        "inputsInline": false,
        "output": null,
        "colour": 30,
        "tooltip": "",
        "helpUrl": "",
    },
    // Turn
    {
        "type": "custom_turn",
        "message0": "Turn item %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "DIRECTION",
                "options": [
                [
                    "clockwise",
                    "right"
                ],
                [
                    "counter-clockwise",
                    "left"
                ]
                ]
            },
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 50,
        "tooltip": "",
        "helpUrl": "",
    },
    // Open hand
    {
        "type": "custom_open",
        "message0": "Open hand",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "",
        "helpUrl": ""
    },
    // Close hand
    {
        "type": "custom_close",
        "message0": "Close hand",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "",
        "helpUrl": ""
    },
]);


var definedTasks = [];

function getCollisionFreeTaskName(name) {
  var counter = 2;
  var collisions = definedTasks.filter(task => task == name);
  var newName = name;

  while (collisions.length > 0) {
    collisions = definedTasks.filter(task => task == name + counter);  
    newName = name + counter;
    counter += 1;
  }
  return newName;
}

var nameUsedWithAnyType = function(name, workspace) {
  var allTasks = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (var i = 0, task; (task = allTasks[i]); i++) {
    if (task.name.toLowerCase() == name) {
      return task;
    }
  }
  return null;
};

var createTaskButtonHandler = function(
    workspace, opt_callback) {
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName("Please enter a name for the new task:", defaultName,
        function(text) {
          if (text) {
            var existing =
                nameUsedWithAnyType(text, workspace);
            if (existing) {
              var msg = "A task with name '%1' already exists!".replace(
                '%1', existing.name);              
              Blockly.alert(msg,
                  function() {
                    promptAndCheckWithAlert(text);  // Recurse
                  });
            } else {
              // No conflict
              workspace.createVariable(text, '');
              if (opt_callback) {
                opt_callback(text);
              }
            }
          } else {
            // User canceled prompt.
            if (opt_callback) {
              opt_callback(null);
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};


var flyoutTaskCategory = function(workspace) {
  var xmlList = [];
  var newBlock = Blockly.utils.xml.createElement('block');
  newBlock.setAttribute('type', 'custom_task');
  newBlock.setAttribute('gap', 30);
  var nameField = Blockly.utils.xml.createElement('field');
  nameField.setAttribute('name', 'TASK');
  var name = getCollisionFreeTaskName("Do a new task");
  nameField.appendChild(Blockly.utils.xml.createTextNode(name));
  newBlock.appendChild(nameField);
  xmlList.push(newBlock);

  var blockList = flyoutTaskCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

var triggersFlyoutCategory = function(workspace) {
  var blockList = triggersFlyoutCategoryBlocks(workspace);
  var xmlList = blockList;
  return xmlList;
};

var flyoutTaskCategoryBlocks = function(workspace) {
  var xmlList = [];
  if (definedTasks.length > 0) {
  var heading = Blockly.utils.xml.createElement('label');
    heading.setAttribute('text', 'Existing tasks:');
    heading.setAttribute('web-class','toolboxHeading')
    xmlList.push(heading);
  }
  var done = [];
  for (var i = 0, task; (task = definedTasks[i]); i++) {
    if (done.includes(task)) 
      continue;
    done.push(task);
    // New variables are added to the end of the variableModelList.
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_task');
    block.appendChild(
    generateTaskFieldDom(task));
    xmlList.push(block);
  }
  return xmlList;
};


var triggersFlyoutCategoryBlocks = function(workspace) {
  var xmlList = [];
  if (!workspace.getAllBlocks().find(block => block.type == 'custom_start')) {
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_start');
    xmlList.push(block);
  }
  if (!workspace.getAllBlocks().find(block => block.type == 'custom_triggerstart' && block.getFieldValue('TRIGGER') == 'RED')) {
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_triggerstart');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TRIGGER');
    field.innerHTML = 'RED';
    block.appendChild(field);
    xmlList.push(block);
  }
  if (!workspace.getAllBlocks().find(block => block.type == 'custom_triggerstart' && block.getFieldValue('TRIGGER') == 'BLUE')) {
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_triggerstart');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TRIGGER');
    field.innerHTML = 'BLUE';
    block.appendChild(field);
    xmlList.push(block);
  }
  if (!workspace.getAllBlocks().find(block => block.type == 'custom_triggerstart' && block.getFieldValue('TRIGGER') == 'YELLOW')) {
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_triggerstart');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TRIGGER');
    field.innerHTML = 'YELLOW';
    block.appendChild(field);
    xmlList.push(block);
  }
  return xmlList;
};

var generateTaskFieldDom = function(task) {
  var field = Blockly.utils.xml.createElement('field');
  field.setAttribute('name', 'TASK');
  var name = Blockly.utils.xml.createTextNode(task);
  field.appendChild(name);
  return field;
};


var createLocationButtonHandler = function(
    workspace, opt_callback) {
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName("Please enter a name for the new location:", defaultName,
        function(text) {
          if (text) {
            var existing =
                nameUsedWithAnyType(text, workspace);
            if (existing) {
              var msg = "A location with name '%1' already exists!".replace(
                '%1', existing.name);              
              Blockly.alert(msg,
                  function() {
                    promptAndCheckWithAlert(text);  // Recurse
                  });
            } else {
              // No conflict
              workspace.createVariable(text, '');
              if (opt_callback) {
                opt_callback(text);
              }
            }
          } else {
            // User canceled prompt.
            if (opt_callback) {
              opt_callback(null);
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};


var flyoutLocationCategory = function(workspace) {
  var xmlList = [];
  var button = document.createElement('button');
  button.setAttribute('text', 'Define new location...');
  button.setAttribute('web-class', 'locationButton');
  button.setAttribute('callbackKey', 'CREATE_LOCATION');

  workspace.registerButtonCallback('CREATE_LOCATION', function(button) {
    defPositionDialog();
  });

  xmlList.push(button);

  var blockList = flyoutLocationCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

var triggersLocationFlyoutCategory = function(workspace) {
  var blockList = triggersLocationFlyoutCategoryBlocks(workspace);
  var xmlList = blockList;
  return xmlList;
};

var flyoutLocationCategoryBlocks = function(workspace) {
  var taskList = workspace.getVariablesOfType('');

  var xmlList = [];
  for (var i = 0, task; (task = taskList[i]); i++) {
    // New variables are added to the end of the variableModelList.
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_location');
    block.appendChild(
        generateLocationFieldDom(task));
    xmlList.push(block);
  }
  return xmlList;
};

var generateLocationFieldDom = function(task) {
  var field = Blockly.utils.xml.createElement('field');
  field.setAttribute('name', 'LOCATION');
  field.setAttribute('id', task.getId());
  var name = Blockly.utils.xml.createTextNode(task.name);
  field.appendChild(name);
  return field;
};

var workspaceToDom = function(workspace, opt_noId) {
  var xml = Blockly.utils.xml.createElement('xml');
  var variablesElement = variablesToDom(
      workspace.getAllVariableNames());
  if (variablesElement.hasChildNodes()) {
    xml.appendChild(variablesElement);
  }
  var comments = workspace.getTopComments(true);
  for (var i = 0, comment; (comment = comments[i]); i++) {
    xml.appendChild(comment.toXmlWithXY(opt_noId));
  }
  var blocks = workspace.getTopBlocks(true);
  for (var i = 0, block; (block = blocks[i]); i++) {
    xml.appendChild(Blockly.Xml.blockToDomWithXY(block, opt_noId));
  }
  return xml;
};

var variablesToDom = function(variableList) {
  var variables = Blockly.utils.xml.createElement('variables');
  for (var i = 0, variable; (variable = variableList[i]); i++) {
    var element = Blockly.utils.xml.createElement('variable');
    element.appendChild(Blockly.utils.xml.createTextNode(variable));
    element.id = variable;
    variables.appendChild(element);
  }
  return variables;
};
