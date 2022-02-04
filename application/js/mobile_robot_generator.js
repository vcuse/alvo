'use strict';

goog.provide('Blockly.MobileRobot');
goog.require('Blockly.Generator');

/**
 * MobileRobot code generator
 * @type {!Blockly.Generator}
 */
Blockly.MobileRobot = new Blockly.Generator('MobileRobot');

Blockly.MobileRobot.addReservedWords(
  'ALIAS,AND,BACKWARD,CASE,CONNECT,CONST,DEFAULT,DIV,DO,ELSE,ELSEIF,ENDFOR,ENDFUNC,ENDIF,ENDMODULE,ENDPROC,ENDRECORD,ENDTEST,ENDTRAP,ENDWHILE,ERROR,EXIT,FALSE,FOR,FROM,FUNC,GOTO,IF,INOUT,LOCAL,MOD,MODULE,NOSTEPIN,NOT,NOVIEW,OR,PERS,PROC,RAISE,READONLY,RECORD,RETRY,RETURN,STEP,SYSMODULE,TEST,THEN,TO,TRAP,TRUE,TRYNEXT,VAR,VIEWONLY,WHILE,WITH,XOR,' +
  'alias,and,backward,case,connect,const,default,div,do,else,elseif,endfor,endfunc,endif,endmodule,endproc,endrecord,endtest,endtrap,endwhile,error,exit,false,for,from,func,goto,if,inout,local,mod,module,nostepin,not,noview,or,pers,proc,raise,readonly,record,retry,return,step,sysmodule,test,then,to,trap,true,trynext,var,viewonly,while,with,xor'
);

Blockly.MobileRobot.RETEACH_VARIABLE_ID = "RETEACH_VARIABLE_ID";

// Order of operation ENUMs
Blockly.MobileRobot.ORDER_ATOMIC = 0;           // 0 "" ...
Blockly.MobileRobot.ORDER_FUNCTION_CALL = 0.1;
Blockly.MobileRobot.ORDER_MULTIPLICATIVE = 1;   // * / DIV MOD
Blockly.MobileRobot.ORDER_ADDITIVE = 2;         // + -
Blockly.MobileRobot.ORDER_RELATIONAL = 3;       // < > <> <= >= =
Blockly.MobileRobot.ORDER_LOGICAL_AND = 4;      // AND
Blockly.MobileRobot.ORDER_LOGICAL_OR_NOT = 5;   // OR XOR NOT
Blockly.MobileRobot.ORDER_NONE = 99;            // (...)

// TODO: add order overrides, if any

Blockly.MobileRobot.init = function(workspace) {
  this.isInitialized = true;
  this.INDENT = "    ";
  Blockly.MobileRobot.toolName = "default_tool";
  Blockly.MobileRobot.wobjName = "default_wobj";
  Blockly.MobileRobot.namePrefix = "";
  Blockly.MobileRobot.robotModel = "";

  //A dictionary of definitions to be printed before the code
  Blockly.MobileRobot.definitions_ = Object.create(null);
  //initialize variable database
  if (!Blockly.MobileRobot.variableDB_) {
    Blockly.MobileRobot.variableDB_ = 
      new Blockly.Names(Blockly.MobileRobot.RESERVED_WORDS_);
  } else {
    Blockly.MobileRobot.variableDB_.reset();
  }
  
  Blockly.MobileRobot.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    var devVarName = Blockly.MobileRobot.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE);
    defvars.push("LOCAL VAR bool " + devVarName + ";");
  }
  
  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  // Now custom variables for now

}

Blockly.MobileRobot.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.MobileRobot.definitions_) {
    definitions.push(Blockly.MobileRobot.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.MobileRobot.definitions_;
  delete Blockly.MobileRobot.functionNames_;
  Blockly.MobileRobot.variableDB_.reset();
  var allDefs = definitions.join('\n');
  return allDefs.replace(/\n\n+/g, '\n').replace(/\n*$/, '\n\n') + code;
}

Blockly.MobileRobot.scrub_ = function(block, code) {
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.MobileRobot.blockToCode(nextBlock);
  code += nextCode;
  return code;
}

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * 
 * For RobotBlockly only a limited set of top-level blocks are allowed, so this function doesn't have to do anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.MobileRobot.scrubNakedValue = function(line) {
  return line;
}
