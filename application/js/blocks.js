// Defines the custom blocks used in our toolbox.

Blockly.HSV_SATURATION = 0.75 // 0 (inclusive) to 1 (exclusive), defaulting to 0.45
Blockly.HSV_VALUE = 0.7 // 0 (inclusive) to 1 (exclusive), defaulting to 0.65


Blockly.defineBlocksWithJsonArray([
    // Start
    {
        "type": "custom_start",
        "message0": "When sᴛᴀʀᴛ is pressed, arm does this:",
        "nextStatement": null,
        "colour": 110,
        "tooltip": "",
        "helpUrl": ""
    },
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
                "type": "field_variable",
                "name": "LOCATION",
                "variable": "<somewhere>"
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 8,
        "tooltip": "",
        "helpUrl": "",
        "extensions":["move_listener"]
    },
    {
        "type": "custom_linear_move",
        "message0": "Move arm %1 in a straight line to %2",
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
                "type": "field_variable",
                "name": "LOCATION",
                "variable": "<somewhere>"
            }
        ],
        "inputsInline": false,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 8,
        "tooltip": "",
        "helpUrl": "",
        "extensions":["move_listener"]
    },
    {
        "type": "custom_taskheader",
        "message0": "To %2 at %1:",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SITE",
                "options": [[
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
              ]]           
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
                "options": [[
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
              ]]      
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
    // Open hand
    {
        "type": "custom_open",
        "message0": "Open gripper",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "",
        "helpUrl": ""
    },
    // Close hand
    {
        "type": "custom_close",
        "message0": "Close gripper",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "",
        "helpUrl": ""
    },
    {
      "type": "custom_robot_drive",
      "message0": "Drive robot to %1",
      "args0": [
          {
              "type": "field_dropdown",
              "name": "SITE",
              "options": [
              [
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
              ]
              ]
          }
      ],
      "inputsInline": false,
      "previousStatement": null,
      "nextStatement": null,
      "colour": 185,
      "tooltip": "",
      "helpUrl": ""
  }
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

//listener on move blocks
Blockly.Extensions.register('move_listener', function() {
  this.setOnChange(function(changeEvent) {
      if(changeEvent instanceof Blockly.Events.Change || changeEvent instanceof Blockly.Events.VarRename) {
          if (this.getField('LOCATION').variable_.name !== this.getField('LOCATION').defaultVariableName) {
              this.setWarningText(null);
          }
      }
  });
});