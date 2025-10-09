import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import * as BlocklyJS from 'blockly/javascript';
import './HorizontalMovementBlocks.css';

export default function HorizontalMovementBlocks({ onMovementExecuted, playerPosition, mazeSize = 5 }) {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    // Define horizontal movement blocks with Scratch-like horizontal grammar
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'horizontal_move_right',
        message0: '→ %1',
        args0: [
          {
            type: 'field_number',
            name: 'STEPS',
            value: 1,
            min: 1,
            max: 10
          }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#4CAF50',
        style: 'horizontal_movement_blocks',
        tooltip: 'Move right by specified number of steps',
        helpUrl: ''
      },
      {
        type: 'horizontal_move_left',
        message0: '← %1',
        args0: [
          {
            type: 'field_number',
            name: 'STEPS',
            value: 1,
            min: 1,
            max: 10
          }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#4CAF50',
        style: 'horizontal_movement_blocks',
        tooltip: 'Move left by specified number of steps',
        helpUrl: ''
      },
      {
        type: 'horizontal_move_up',
        message0: '↑ %1',
        args0: [
          {
            type: 'field_number',
            name: 'STEPS',
            value: 1,
            min: 1,
            max: 10
          }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#4CAF50',
        style: 'horizontal_movement_blocks',
        tooltip: 'Move up by specified number of steps',
        helpUrl: ''
      },
      {
        type: 'horizontal_move_down',
        message0: '↓ %1',
        args0: [
          {
            type: 'field_number',
            name: 'STEPS',
            value: 1,
            min: 1,
            max: 10
          }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: '#4CAF50',
        style: 'horizontal_movement_blocks',
        tooltip: 'Move down by specified number of steps',
        helpUrl: ''
      },
      {
        type: 'horizontal_turn_clockwise',
        message0: '↻',
        previousStatement: null,
        nextStatement: null,
        colour: '#FF9800',
        style: 'horizontal_rotation_blocks',
        tooltip: 'Turn clockwise (90 degrees right)',
        helpUrl: ''
      },
      {
        type: 'horizontal_turn_counterclockwise',
        message0: '↺',
        previousStatement: null,
        nextStatement: null,
        colour: '#FF9800',
        style: 'horizontal_rotation_blocks',
        tooltip: 'Turn counterclockwise (90 degrees left)',
        helpUrl: ''
      },
      {
        type: 'horizontal_sequence',
        message0: 'Do: %1',
        args0: [
          {
            type: 'input_statement',
            name: 'ACTIONS'
          }
        ],
        colour: '#9C27B0',
        style: 'horizontal_control_blocks',
        tooltip: 'Execute a sequence of actions',
        helpUrl: ''
      }
    ]);

    // Define custom theme for horizontal blocks
    Blockly.Theme.defineTheme('horizontal_scratch_theme', {
      'blockStyles': {
        'horizontal_movement_blocks': {
          'colourPrimary': '#4CAF50',
          'colourSecondary': '#388E3C',
          'colourTertiary': '#2E7D32'
        },
        'horizontal_rotation_blocks': {
          'colourPrimary': '#FF9800',
          'colourSecondary': '#F57C00',
          'colourTertiary': '#EF6C00'
        },
        'horizontal_control_blocks': {
          'colourPrimary': '#9C27B0',
          'colourSecondary': '#7B1FA2',
          'colourTertiary': '#6A1B9A'
        }
      },
      'categoryStyles': {
        'horizontal_movement_category': {
          'colour': '#4CAF50'
        },
        'horizontal_rotation_category': {
          'colour': '#FF9800'
        },
        'horizontal_control_category': {
          'colour': '#9C27B0'
        }
      },
      'componentStyles': {
        'workspaceBackgroundColour': '#f8f9fa',
        'toolboxBackgroundColour': '#ffffff',
        'toolboxForegroundColour': '#333333',
        'flyoutBackgroundColour': '#f0f0f0',
        'flyoutForegroundColour': '#333333',
        'flyoutOpacity': 0.8,
        'scrollbarColour': '#cccccc',
        'insertionMarkerColour': '#4CAF50',
        'insertionMarkerOpacity': 0.3
      }
    });

    // Define JavaScript generators for horizontal blocks
    BlocklyJS.javascriptGenerator.forBlock['horizontal_move_right'] = function(block) {
      const steps = block.getFieldValue('STEPS');
      return `moveRight(${steps});\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['horizontal_move_left'] = function(block) {
      const steps = block.getFieldValue('STEPS');
      return `moveLeft(${steps});\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['horizontal_move_up'] = function(block) {
      const steps = block.getFieldValue('STEPS');
      return `moveUp(${steps});\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['horizontal_move_down'] = function(block) {
      const steps = block.getFieldValue('STEPS');
      return `moveDown(${steps});\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['horizontal_turn_clockwise'] = function(block) {
      return `turnClockwise();\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['horizontal_turn_counterclockwise'] = function(block) {
      return `turnCounterclockwise();\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['horizontal_sequence'] = function(block) {
      const actions = BlocklyJS.javascriptGenerator.statementToCode(block, 'ACTIONS');
      return actions;
    };

  }, []);

  useEffect(() => {
    if (workspaceRef.current) {
      workspaceRef.current.dispose();
    }

    const toolboxConfig = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Movement',
          colour: '#4CAF50',
          categorystyle: 'horizontal_movement_category',
          contents: [
            { kind: 'block', type: 'horizontal_move_right' },
            { kind: 'block', type: 'horizontal_move_left' },
            { kind: 'block', type: 'horizontal_move_up' },
            { kind: 'block', type: 'horizontal_move_down' }
          ]
        },
        {
          kind: 'category',
          name: 'Rotation',
          colour: '#FF9800',
          categorystyle: 'horizontal_rotation_category',
          contents: [
            { kind: 'block', type: 'horizontal_turn_clockwise' },
            { kind: 'block', type: 'horizontal_turn_counterclockwise' }
          ]
        },
        {
          kind: 'category',
          name: 'Control',
          colour: '#9C27B0',
          categorystyle: 'horizontal_control_category',
          contents: [
            { kind: 'block', type: 'horizontal_sequence' },
            { kind: 'block', type: 'controls_repeat_ext' }
          ]
        }
      ]
    };

    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      theme: 'horizontal_scratch_theme',
      toolbox: toolboxConfig,
      trashcan: true,
      scrollbars: true,
      horizontalLayout: false, // Keep vertical for now, but blocks will have horizontal feel
      rtl: false,
      grid: {
        spacing: 25,
        length: 3,
        colour: '#e0e0e0',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 2.0,
        minScale: 0.5,
        scaleSpeed: 1.2
      },
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true
        },
        drag: true,
        wheel: true
      }
    });

    // Add some default blocks to demonstrate horizontal layout
    const xml = `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="horizontal_sequence" x="50" y="50">
          <statement name="ACTIONS">
            <block type="horizontal_move_right">
              <field name="STEPS">2</field>
              <next>
                <block type="horizontal_move_up">
                  <field name="STEPS">1</field>
                  <next>
                    <block type="horizontal_turn_clockwise">
                      <next>
                        <block type="horizontal_move_right">
                          <field name="STEPS">1</field>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </statement>
        </block>
      </xml>
    `;
    
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspaceRef.current);

  }, []);

  const executeMovements = () => {
    if (!workspaceRef.current || isExecuting) return;

    setIsExecuting(true);
    const code = BlocklyJS.javascriptGenerator.workspaceToCode(workspaceRef.current);
    
    // Create movement execution context
    const movements = [];
    let currentDirection = 0; // 0: right, 1: down, 2: left, 3: up

    const moveRight = (steps = 1) => {
      for (let i = 0; i < steps; i++) {
        movements.push({ type: 'move', direction: 'right' });
      }
    };

    const moveLeft = (steps = 1) => {
      for (let i = 0; i < steps; i++) {
        movements.push({ type: 'move', direction: 'left' });
      }
    };

    const moveUp = (steps = 1) => {
      for (let i = 0; i < steps; i++) {
        movements.push({ type: 'move', direction: 'up' });
      }
    };

    const moveDown = (steps = 1) => {
      for (let i = 0; i < steps; i++) {
        movements.push({ type: 'move', direction: 'down' });
      }
    };

    const turnClockwise = () => {
      currentDirection = (currentDirection + 1) % 4;
      movements.push({ type: 'turn', direction: 'clockwise', newDirection: currentDirection });
    };

    const turnCounterclockwise = () => {
      currentDirection = (currentDirection + 3) % 4; // +3 is same as -1 in mod 4
      movements.push({ type: 'turn', direction: 'counterclockwise', newDirection: currentDirection });
    };

    try {
      // Execute the generated code
      new Function('moveRight', 'moveLeft', 'moveUp', 'moveDown', 'turnClockwise', 'turnCounterclockwise', code)(
        moveRight, moveLeft, moveUp, moveDown, turnClockwise, turnCounterclockwise
      );

      // Pass movements to parent component for execution
      if (onMovementExecuted) {
        onMovementExecuted(movements);
      }

      console.log('Generated movements:', movements);
      
    } catch (error) {
      console.error('Error executing movement code:', error);
      alert('Error in movement sequence: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const clearWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }
  };

  return (
    <div className="horizontal-movement-blocks">
      <div className="horizontal-blocks-header">
        <h3>🎮 Horizontal Movement Controls</h3>
        <p>Drag blocks to create movement sequences. Inspired by Scratch Blocks horizontal grammar.</p>
      </div>
      
      <div className="horizontal-blockly-container">
        <div ref={blocklyDiv} className="horizontal-blockly-workspace"></div>
      </div>
      
      <div className="horizontal-controls">
        <button 
          onClick={executeMovements} 
          disabled={isExecuting}
          className="execute-button"
        >
          {isExecuting ? '🔄 Executing...' : '▶️ Execute Movements'}
        </button>
        <button 
          onClick={clearWorkspace}
          className="clear-button"
        >
          🗑️ Clear Workspace
        </button>
      </div>

      <div className="movement-info">
        <div className="info-item">
          <span className="info-label">Current Position:</span>
          <span className="info-value">
            ({playerPosition?.x || 0}, {playerPosition?.y || 0})
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Maze Size:</span>
          <span className="info-value">{mazeSize}×{mazeSize}</span>
        </div>
      </div>
    </div>
  );
}