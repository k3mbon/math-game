import React, { useEffect, useRef, useState } from 'react';
import './OfficialScratchBlocks.css';

// Setup global environment for scratch-blocks
if (typeof window !== 'undefined') {
  // Setup module system for scratch-blocks
  if (typeof window.module === 'undefined') {
    window.module = { exports: {} };
  }
  if (typeof window.exports === 'undefined') {
    window.exports = window.module.exports;
  }

  // Setup Google Closure Library stubs
  if (!window.goog) {
    window.goog = {
      require: function(name) {
        return window[name] || {};
      },
      provide: function(name) {
        // No-op for provide
      },
      exportSymbol: function(name, obj) {
        window[name] = obj;
      }
    };
  }

  // Initialize Blockly global
  if (!window.Blockly) {
    window.Blockly = {};
  }

  // Initialize ScratchBlocks global
  window.ScratchBlocks = window.ScratchBlocks || {};
}

const OfficialScratchBlocks = ({ onAddToSequence, sequence, maxMoves, isExecuting }) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [ScratchBlocks, setScratchBlocks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load ScratchBlocks dynamically
  useEffect(() => {
    const loadScratchBlocks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Starting scratch-blocks loading process...');

        // First, try to load scratch-blocks module
        try {
          console.log('Attempting to import scratch-blocks...');
          await import('scratch-blocks');
          console.log('scratch-blocks module imported successfully');
        } catch (importError) {
          console.warn('Failed to import scratch-blocks module:', importError);
        }

        // Wait a moment for the module to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check multiple possible locations for Blockly
        let blocklyInstance = null;

        // Check window.Blockly first
        if (window.Blockly && typeof window.Blockly.inject === 'function') {
          blocklyInstance = window.Blockly;
          console.log('Found Blockly at window.Blockly');
        }
        // Check window.ScratchBlocks
        else if (window.ScratchBlocks && typeof window.ScratchBlocks.inject === 'function') {
          blocklyInstance = window.ScratchBlocks;
          console.log('Found Blockly at window.ScratchBlocks');
        }
        // Try to use regular Blockly as fallback
        else {
          console.log('Attempting to use regular Blockly as fallback...');
          try {
            const BlocklyLib = await import('blockly');
            if (BlocklyLib && typeof BlocklyLib.inject === 'function') {
              blocklyInstance = BlocklyLib;
              console.log('Using regular Blockly as fallback');
            } else if (BlocklyLib.default && typeof BlocklyLib.default.inject === 'function') {
              blocklyInstance = BlocklyLib.default;
              console.log('Using regular Blockly default export as fallback');
            }
          } catch (blocklyError) {
            console.error('Failed to load regular Blockly:', blocklyError);
          }
        }

        if (blocklyInstance) {
          setScratchBlocks(blocklyInstance);
          console.log('Blockly instance loaded successfully');
          setIsLoading(false);
          return;
        }

        throw new Error('No suitable Blockly implementation found');
        
      } catch (error) {
        console.error('Failed to load scratch-blocks:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    loadScratchBlocks();
  }, []);

  // Initialize workspace when ScratchBlocks is loaded
  useEffect(() => {
    if (!ScratchBlocks || !blocklyDiv.current || isLoading || error) return;
    
    // Cleanup any existing workspace
    if (workspace.current) {
      try {
        workspace.current.dispose();
        workspace.current = null;
      } catch (e) {
        console.log('Workspace disposal not needed:', e.message);
      }
    }

    try {
      // Define custom movement blocks for ScratchJr style
      const defineMovementBlocks = () => {
        if (!ScratchBlocks.Blocks) {
          ScratchBlocks.Blocks = {};
        }

        // Movement blocks with ScratchJr styling
        const movementBlocks = {
          'scratchjr_move_up': {
            init: function() {
              this.jsonInit({
                "message0": "⬆️",
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#2196F3",
                "tooltip": "Move up",
                "helpUrl": ""
              });
            }
          },
          'scratchjr_move_down': {
            init: function() {
              this.jsonInit({
                "message0": "⬇️",
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#2196F3",
                "tooltip": "Move down",
                "helpUrl": ""
              });
            }
          },
          'scratchjr_move_left': {
            init: function() {
              this.jsonInit({
                "message0": "⬅️",
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#2196F3",
                "tooltip": "Move left",
                "helpUrl": ""
              });
            }
          },
          'scratchjr_move_right': {
            init: function() {
              this.jsonInit({
                "message0": "➡️",
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#2196F3",
                "tooltip": "Move right",
                "helpUrl": ""
              });
            }
          },
          'scratchjr_start': {
            init: function() {
              this.jsonInit({
                "message0": "🚀 Start",
                "nextStatement": null,
                "colour": "#4CAF50",
                "tooltip": "Start the program",
                "helpUrl": ""
              });
            }
          },
          'scratchjr_repeat': {
            init: function() {
              this.jsonInit({
                "message0": "🔄 Repeat %1",
                "args0": [
                  {
                    "type": "field_number",
                    "name": "TIMES",
                    "value": 2,
                    "min": 1,
                    "max": 10
                  }
                ],
                "message1": "%1",
                "args1": [
                  {
                    "type": "input_statement",
                    "name": "DO"
                  }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#FF9800",
                "tooltip": "Repeat actions",
                "helpUrl": ""
              });
            }
          }
        };

        // Register blocks
        Object.assign(ScratchBlocks.Blocks, movementBlocks);
      };

      defineMovementBlocks();

      // Create workspace with ScratchJr-style horizontal layout
      workspace.current = ScratchBlocks.inject(blocklyDiv.current, {
        toolbox: `
          <xml>
            <category name="Movement" colour="#2196F3">
              <block type="scratchjr_move_up"></block>
              <block type="scratchjr_move_down"></block>
              <block type="scratchjr_move_left"></block>
              <block type="scratchjr_move_right"></block>
            </category>
            <category name="Control" colour="#4CAF50">
              <block type="scratchjr_start"></block>
              <block type="scratchjr_repeat">
                <value name="TIMES">
                  <shadow type="math_number">
                    <field name="NUM">3</field>
                  </shadow>
                </value>
              </block>
            </category>
          </xml>
        `,
        horizontalLayout: true,
        rtl: false,
        scrollbars: true,
        sounds: false,
        oneBasedIndex: false,
        media: '/node_modules/scratch-blocks/media/',
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 2,
          minScale: 0.5,
          scaleSpeed: 1.2
        },
        trashcan: true
      });

      // Listen for workspace changes
      workspace.current.addChangeListener((event) => {
        if (!event || !onAddToSequence) return;

        // Handle block creation events
        if (event.type === ScratchBlocks.Events.BLOCK_CREATE) {
          try {
            const block = workspace.current.getBlockById(event.blockId);
            if (!block) return;

            const blockType = block.type;
            let blockData = null;

            // Map Scratch block types to game actions
            switch (blockType) {
              case 'scratchjr_move_up':
                blockData = { 
                  id: 'up', 
                  name: 'Up', 
                  icon: '⬆️', 
                  color: '#2196F3', 
                  action: 'up',
                  type: 'movement'
                };
                break;
              case 'scratchjr_move_down':
                blockData = { 
                  id: 'down', 
                  name: 'Down', 
                  icon: '⬇️', 
                  color: '#2196F3', 
                  action: 'down',
                  type: 'movement'
                };
                break;
              case 'scratchjr_move_left':
                blockData = { 
                  id: 'left', 
                  name: 'Left', 
                  icon: '⬅️', 
                  color: '#2196F3', 
                  action: 'left',
                  type: 'movement'
                };
                break;
              case 'scratchjr_move_right':
                blockData = { 
                  id: 'right', 
                  name: 'Right', 
                  icon: '➡️', 
                  color: '#2196F3', 
                  action: 'right',
                  type: 'movement'
                };
                break;
              case 'scratchjr_start':
                blockData = { 
                  id: 'start', 
                  name: 'Start', 
                  icon: '🚀', 
                  color: '#4CAF50', 
                  action: 'start',
                  type: 'control'
                };
                break;
              case 'scratchjr_repeat':
                blockData = { 
                  id: 'repeat', 
                  name: 'Repeat', 
                  icon: '🔄', 
                  color: '#FF9800', 
                  action: 'repeat',
                  type: 'control'
                };
                break;
            }

            if (blockData && sequence.length < maxMoves && !isExecuting) {
              const blockWithId = {
                ...blockData,
                uniqueId: event.blockId
              };
              onAddToSequence(blockWithId);
            }
          } catch (error) {
            console.error('Error handling block creation:', error);
          }
        }
      });

      console.log('Official Scratch Blocks workspace initialized successfully');
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
      setError(error.message);
    }
  }, [ScratchBlocks, isLoading, error, onAddToSequence, sequence.length, maxMoves, isExecuting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workspace.current) {
        try {
          workspace.current.dispose();
        } catch (e) {
          console.log('Workspace cleanup not needed:', e.message);
        }
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="official-scratch-blocks-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Official Scratch Blocks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="official-scratch-blocks-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Failed to load Scratch Blocks: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="official-scratch-blocks-container">
      <div 
        ref={blocklyDiv} 
        className="blockly-workspace"
        style={{ 
          height: '300px', 
          width: '100%',
          opacity: isExecuting ? 0.6 : 1,
          pointerEvents: isExecuting ? 'none' : 'auto'
        }}
      />

      <div className="blocks-info">
        <div className="info-item">
          <span className="info-icon">📊</span>
          <span className="info-text">Blocks: {sequence.length}/{maxMoves}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">💡</span>
          <span className="info-text">Drag blocks to create your program</span>
        </div>
      </div>
    </div>
  );
};

export default OfficialScratchBlocks;