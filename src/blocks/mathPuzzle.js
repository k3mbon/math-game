import * as Blockly from 'blockly';
import 'blockly/javascript';  // IMPORTANT: load the JS generator BEFORE registering blocks

export function registerMathPuzzleBlock() {
  if (!Blockly.Blocks['math_puzzle']) {
    Blockly.Blocks['math_puzzle'] = {
      init: function () {
        this.appendDummyInput()
          .appendField('Target:')
          .appendField(new Blockly.FieldNumber(10), 'TARGET');
        this.appendStatementInput('STEPS')
          .setCheck(null)
          .appendField('Steps');
        this.setColour(230);
        this.setTooltip('Build an expression that equals the target number');
        this.setHelpUrl('');
      },
    };
  }

  if (Blockly.JavaScript) {
    Blockly.JavaScript['math_puzzle'] = function (block) {
      const stepsCode = Blockly.JavaScript.statementToCode(block, 'STEPS');
      const code = `
        (function() {
          let result;
          ${stepsCode}
          return result;
        })()
      `;
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    };
  } else {
    console.warn('Blockly.JavaScript is not defined yet.');
  }
}
