// Defines the custom blocks used in our toolbox.

Blockly.defineBlocksWithJsonArray([
    // Start
    {
        "type": "custom_start",
        "message0": "Repeat until stopped",
        "nextStatement": null,
        "colour": 15,
        "tooltip": "",
        "helpUrl": ""
    },
    {
        "type": "custom_triggerstart",
        "message0": "If idle and %1 Button is activated",
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
                    "Green",
                    "GREEN"
                ],
                [
                    "Blue",
                    "BLUE"
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
        "message0": "At %1: %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SITE",
                "options": [
                [
                    "Site...",
                    "NONE"
                ],
                [
                    "Pick-up Site",
                    "PICKUPSITE"
                ],
                [
                    "Drop-off Site",
                    "DROPOFFSITE"
                ]
                ]                
            },
            {
                "type": "field_label_serializable",
                "name": "TASK",
                
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
        "message0": "At %1: %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SITE",
                "options": [
                [
                    "Site...",
                    "NONE"
                ],
                [
                    "Pick-up Site",
                    "PICKUPSITE"
                ],
                [
                    "Drop-off Site",
                    "DROPOFFSITE"
                ]
                ]
            },
            {
                "type": "field_label_serializable",
                "name": "TASK",

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
                    "Site...",
                    "NONE"
                ],
                [
                    "Pick-up Site",
                    "PICKUPSITE"
                ],
                [
                    "Drop-off Site",
                    "DROPOFFSITE"
                ]
                ]
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
        "message0": "<somewhere>",
        "inputsInline": false,
        "output": null,
        "colour": 30,
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
  var button = document.createElement('button');
  button.setAttribute('text', 'Create new task...');
  button.setAttribute('web-class', 'taskButton');
  button.setAttribute('callbackKey', 'CREATE_TASK');

  workspace.registerButtonCallback('CREATE_TASK', function(button) {
    createTaskButtonHandler(button.getTargetWorkspace());
  });

  xmlList.push(button);

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
  var taskList = workspace.getVariablesOfType('');

  var xmlList = [];
  for (var i = 0, task; (task = taskList[i]); i++) {
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
  if (!workspace.getAllBlocks().find(block => block.type == 'custom_triggerstart' && block.getFieldValue('TRIGGER') == 'GREEN')) {
    var block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'custom_triggerstart');
    var field = Blockly.utils.xml.createElement('field');
    field.setAttribute('name', 'TRIGGER');
    field.innerHTML = 'GREEN';
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
  return xmlList;
};

var generateTaskFieldDom = function(task) {
  var field = Blockly.utils.xml.createElement('field');
  field.setAttribute('name', 'TASK');
  field.setAttribute('id', task.getId());
  var name = Blockly.utils.xml.createTextNode(task.name);
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
  button.setAttribute('text', 'Create new location...');
  button.setAttribute('web-class', 'locationButton');
  button.setAttribute('callbackKey', 'CREATE_LOCATION');

  workspace.registerButtonCallback('CREATE_LOCATION', function(button) {
    createLocationButtonHandler(button.getTargetWorkspace());
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

