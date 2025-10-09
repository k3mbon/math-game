import React, { useEffect, useRef, useState } from 'react';

// Enhanced polyfills for scratch-blocks
if (typeof window !== 'undefined') {
  // Define module and exports for CommonJS compatibility
  if (typeof window.module === 'undefined') {
    window.module = { exports: {} };
  }
  if (typeof window.exports === 'undefined') {
    window.exports = window.module.exports;
  }

  // Polyfill for goog.require if not present
  if (!window.goog) {
    window.goog = {
      require: function(name) {
        // Return a mock object for required modules
        return {};
      },
      provide: function(name) {
        // Mock provide function
      },
      exportSymbol: function(name, obj) {
        // Mock export symbol
      }
    };
  }

  // Polyfill for Closure Library dependencies
  if (!window.Blockly) {
    window.Blockly = {};
  }

  // Mock other dependencies that scratch-blocks might need
  window.ScratchBlocks = window.ScratchBlocks || {};
}

// Comprehensive cleanup function to reset global Blockly state
const cleanupGlobalBlocklyState = () => {
  try {
    if (typeof window !== 'undefined' && window.Blockly) {
      const Blockly = window.Blockly;
      
      // Clear all extensions with comprehensive checking
      if (Blockly.Extensions && typeof Blockly.Extensions.unregister === 'function') {
        const extensionsToRemove = [
          'colours_control', 'colours_data', 'colours_event', 'colours_looks', 
          'colours_motion', 'colours_operators', 'colours_pen', 'colours_sensing', 
          'colours_sound', 'colours_more', 'colours_custom'
        ];
        
        extensionsToRemove.forEach(ext => {
          try {
            if (Blockly.Extensions.isRegistered && Blockly.Extensions.isRegistered(ext)) {
              Blockly.Extensions.unregister(ext);
            }
          } catch (e) {
            console.warn(`Could not unregister extension ${ext}:`, e.message);
          }
        });
      }

      // Alternative method: Clear extensions registry if available
      if (Blockly.Extensions && Blockly.Extensions.ALL_) {
        try {
          const extensionKeys = Object.keys(Blockly.Extensions.ALL_);
          extensionKeys.forEach(key => {
            if (key.includes('colours_') || key.includes('control')) {
              try {
                delete Blockly.Extensions.ALL_[key];
              } catch (e) {
                console.warn(`Could not delete extension ${key}:`, e.message);
              }
            }
          });
        } catch (e) {
          console.warn('Could not access extensions registry:', e.message);
        }
      }

      // Clear custom blocks with enhanced safety
      if (Blockly.Blocks) {
        const customBlockTypes = ['move_up', 'move_down', 'move_left', 'move_right'];
        customBlockTypes.forEach(blockType => {
          try {
            if (Blockly.Blocks[blockType]) {
              delete Blockly.Blocks[blockType];
            }
          } catch (e) {
            console.warn(`Could not delete block ${blockType}:`, e.message);
          }
        });
      }

      // Clear JavaScript generators with enhanced safety
      if (Blockly.JavaScript) {
        const customBlockTypes = ['move_up', 'move_down', 'move_left', 'move_right'];
        customBlockTypes.forEach(blockType => {
          try {
            if (Blockly.JavaScript[blockType]) {
              delete Blockly.JavaScript[blockType];
            }
          } catch (e) {
            console.warn(`Could not delete generator ${blockType}:`, e.message);
          }
        });
      }

      // Clear any cached toolbox or workspace references
      if (Blockly.getMainWorkspace && typeof Blockly.getMainWorkspace === 'function') {
        try {
          const mainWorkspace = Blockly.getMainWorkspace();
          if (mainWorkspace && typeof mainWorkspace.dispose === 'function') {
            mainWorkspace.dispose();
          }
        } catch (e) {
          console.warn('Could not dispose main workspace:', e.message);
        }
      }

      console.log('Global Blockly state cleanup completed');
    }
  } catch (error) {
    console.warn('Error during global Blockly cleanup:', error.message);
  }
};

const ScratchBlocksWorkspace = ({ onCodeChange, onAddToSequence }) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [ScratchBlocks, setScratchBlocks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load ScratchBlocks dynamically
  useEffect(() => {
    const loadScratchBlocks = async () => {
      try {
        // Check if Blockly is already available globally
        if (window.Blockly && typeof window.Blockly.inject === 'function') {
          setScratchBlocks(window.Blockly);
          console.log('Using existing global Blockly');
          setIsLoading(false);
          return;
        }

        console.log('Loading scratch-blocks directly from compressed files...');
        
        // Load the compressed blockly files directly
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        // Try to load the compressed vertical blockly files
        try {
          // Load the main blockly compressed file
          await loadScript('/node_modules/scratch-blocks/blockly_compressed_vertical.js');
          
          // Load the blocks compressed file
          await loadScript('/node_modules/scratch-blocks/blocks_compressed_vertical.js');
          
          // Load the messages
          await loadScript('/node_modules/scratch-blocks/msg/scratch_msgs.js');
          
          console.log('Scratch-blocks files loaded successfully');
          
          // Check if Blockly is now available
          if (window.Blockly && typeof window.Blockly.inject === 'function') {
            setScratchBlocks(window.Blockly);
            console.log('ScratchBlocks loaded successfully - using global Blockly');
            setIsLoading(false);
            return;
          }
        } catch (scriptError) {
          console.log('Direct script loading failed, trying module import:', scriptError);
        }

        // Fallback: Try to import scratch-blocks module
        try {
          const scratchBlocksModule = await import('scratch-blocks');
          console.log('Scratch-blocks module loaded:', scratchBlocksModule);
          
          // After importing, check if global Blockly was set up
          if (window.Blockly && typeof window.Blockly.inject === 'function') {
            setScratchBlocks(window.Blockly);
            console.log('ScratchBlocks loaded successfully - using global Blockly after import');
            setIsLoading(false);
            return;
          }
          
          // The module might be a CommonJS export wrapped by Vite
          let ScratchBlocksLib = null;
          
          // Check for different export patterns
          if (scratchBlocksModule.default && typeof scratchBlocksModule.default === 'object') {
            ScratchBlocksLib = scratchBlocksModule.default;
          } else if (scratchBlocksModule.default && typeof scratchBlocksModule.default === 'function') {
            // If it's a function, it might be a module.exports function
            try {
              ScratchBlocksLib = scratchBlocksModule.default();
            } catch (e) {
              ScratchBlocksLib = scratchBlocksModule.default;
            }
          } else {
            ScratchBlocksLib = scratchBlocksModule;
          }

          if (ScratchBlocksLib && typeof ScratchBlocksLib.inject === 'function') {
            setScratchBlocks(ScratchBlocksLib);
            console.log('ScratchBlocks loaded successfully - using module export');
            setIsLoading(false);
            return;
          }
          
          // Try to find inject function in nested objects
          const findInject = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return null;
            
            if (typeof obj.inject === 'function') {
              console.log(`Found inject function at ${path || 'root'}`);
              return obj;
            }
            
            for (const [key, value] of Object.entries(obj)) {
              if (typeof value === 'object' && value !== null) {
                const result = findInject(value, path ? `${path}.${key}` : key);
                if (result) return result;
              }
            }
            return null;
          };

          const blocklyObj = findInject(ScratchBlocksLib);
          if (blocklyObj) {
            setScratchBlocks(blocklyObj);
            console.log('ScratchBlocks loaded successfully - found inject in nested object');
            setIsLoading(false);
            return;
          }
        } catch (importError) {
          console.log('Module import also failed:', importError);
        }

        throw new Error('ScratchBlocks.inject is not available after all loading attempts');
        
      } catch (error) {
        console.error('Failed to load scratch-blocks:', error);
        
        // Final fallback: check if global Blockly exists
        if (window.Blockly && typeof window.Blockly.inject === 'function') {
          setScratchBlocks(window.Blockly);
          console.log('Using global Blockly as final fallback');
        } else {
          console.error('No working Blockly implementation found');
        }
        
        setIsLoading(false);
      }
    };

    loadScratchBlocks();
  }, []);

  // Initialize workspace when ScratchBlocks is loaded
  useEffect(() => {
    if (!ScratchBlocks || !blocklyDiv.current || isLoading) return;
    
    // Cleanup any existing workspace first
    if (workspace.current) {
      try {
        workspace.current.dispose();
        workspace.current = null;
      } catch (e) {
        console.log('Workspace disposal not needed:', e.message);
      }
    }

    if (blocklyDiv.current && !workspace.current) {
      // Clean up global state before creating new workspace
      cleanupGlobalBlocklyState();

      // Define custom blocks for character movement
      const defineCustomBlocks = () => {
        try {
          // Ensure ScratchBlocks.Blocks exists
          if (!ScratchBlocks.Blocks) {
            ScratchBlocks.Blocks = {};
          }

          // Ensure ScratchBlocks.JavaScript exists
          if (!ScratchBlocks.JavaScript) {
            ScratchBlocks.JavaScript = {};
          }

          // Define custom blocks for character movement
          const blockDefinitions = {
            'move_up': {
              init: function() {
                this.jsonInit({
                  "message0": "move up",
                  "previousStatement": null,
                  "nextStatement": null,
                  "colour": 160,
                  "tooltip": "Move character up",
                  "helpUrl": ""
                });
              }
            },
            'move_down': {
              init: function() {
                this.jsonInit({
                  "message0": "move down",
                  "previousStatement": null,
                  "nextStatement": null,
                  "colour": 160,
                  "tooltip": "Move character down",
                  "helpUrl": ""
                });
              }
            },
            'move_left': {
              init: function() {
                this.jsonInit({
                  "message0": "move left",
                  "previousStatement": null,
                  "nextStatement": null,
                  "colour": 160,
                  "tooltip": "Move character left",
                  "helpUrl": ""
                });
              }
            },
            'move_right': {
              init: function() {
                this.jsonInit({
                  "message0": "move right",
                  "previousStatement": null,
                  "nextStatement": null,
                  "colour": 160,
                  "tooltip": "Move character right",
                  "helpUrl": ""
                });
              }
            }
          };

          // Define blocks safely
          for (const [blockType, definition] of Object.entries(blockDefinitions)) {
            try {
              ScratchBlocks.Blocks[blockType] = definition;
            } catch (e) {
              console.warn(`Failed to define block ${blockType}:`, e);
            }
          }

          // Define JavaScript generators for the blocks
          const generatorDefinitions = {
            'move_up': function(block) { return 'moveUp();\n'; },
            'move_down': function(block) { return 'moveDown();\n'; },
            'move_left': function(block) { return 'moveLeft();\n'; },
            'move_right': function(block) { return 'moveRight();\n'; }
          };

          // Define generators safely
          for (const [blockType, generator] of Object.entries(generatorDefinitions)) {
            try {
              ScratchBlocks.JavaScript[blockType] = generator;
            } catch (e) {
              console.warn(`Failed to define generator ${blockType}:`, e);
            }
          }

          return true;
        } catch (error) {
          console.error('Failed to define custom blocks:', error);
          return false;
        }
      };

      const blocksDefinedSuccessfully = defineCustomBlocks();

      // Create workspace with horizontal layout (ScratchJr style)
      workspace.current = ScratchBlocks.inject(blocklyDiv.current, {
        toolbox: `
          <xml>
            <category name="Movement" colour="160">
              <block type="move_up"></block>
              <block type="move_down"></block>
              <block type="move_left"></block>
              <block type="move_right"></block>
            </category>
          </xml>
        `,
        horizontalLayout: true,
        rtl: false,
        scrollbars: true,
        sounds: false,
        oneBasedIndex: false,
        media: '/node_modules/scratch-blocks/media/', // Use local media path
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
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        }
      });

      // Listen for changes in the workspace
      workspace.current.addChangeListener((event) => {
        try {
          // Validate event object
          if (!event || typeof event !== 'object') {
            console.warn('Invalid event object received');
            return;
          }

          if (event.type === ScratchBlocks.Events.BLOCK_CREATE || 
              event.type === ScratchBlocks.Events.BLOCK_DELETE ||
              event.type === ScratchBlocks.Events.BLOCK_MOVE) {
            
            // Validate workspace before generating code
            if (!workspace.current || typeof workspace.current.getTopBlocks !== 'function') {
              console.warn('Workspace is not properly initialized');
              return;
            }

            const code = ScratchBlocks.JavaScript.workspaceToCode(workspace.current);
            if (onCodeChange) {
              onCodeChange(code);
            }

            // Extract blocks for sequence display with enhanced safety
            const topBlocks = workspace.current.getTopBlocks();
            if (!Array.isArray(topBlocks)) {
              console.warn('getTopBlocks did not return an array');
              return;
            }

            const sequence = [];
            
            topBlocks.forEach((block, blockIndex) => {
              if (!block || typeof block !== 'object') {
                console.warn(`Invalid block at index ${blockIndex}`);
                return;
              }

              let currentBlock = block;
              let iterationCount = 0;
              const maxIterations = 100; // Prevent infinite loops
              
              while (currentBlock && iterationCount < maxIterations) {
                iterationCount++;
                
                try {
                  const blockType = currentBlock.type;
                  if (!blockType || typeof blockType !== 'string') {
                    console.warn('Block has invalid type');
                    break;
                  }

                  let blockData = null;
                  
                  switch (blockType) {
                    case 'move_up':
                      blockData = { id: 'up', name: 'Up', icon: '⬆️', color: '#4A90E2' };
                      break;
                    case 'move_down':
                      blockData = { id: 'down', name: 'Down', icon: '⬇️', color: '#4A90E2' };
                      break;
                    case 'move_left':
                      blockData = { id: 'left', name: 'Left', icon: '⬅️', color: '#4A90E2' };
                      break;
                    case 'move_right':
                      blockData = { id: 'right', name: 'Right', icon: '➡️', color: '#4A90E2' };
                      break;
                  }
                  
                  if (blockData && onAddToSequence && currentBlock.id) {
                    sequence.push({ ...blockData, uniqueId: currentBlock.id });
                  }
                  
                  // Safely get next block with comprehensive null checks
                  try {
                    if (typeof currentBlock.getNextBlock === 'function') {
                      const nextBlock = currentBlock.getNextBlock();
                      currentBlock = (nextBlock && typeof nextBlock === 'object') ? nextBlock : null;
                    } else {
                      console.warn('getNextBlock method not available on block');
                      currentBlock = null;
                    }
                  } catch (nextBlockError) {
                    console.warn('Error getting next block:', nextBlockError.message);
                    currentBlock = null;
                  }
                } catch (blockProcessingError) {
                  console.warn('Error processing block:', blockProcessingError.message);
                  currentBlock = null;
                }
              }

              if (iterationCount >= maxIterations) {
                console.warn('Maximum iteration limit reached, possible infinite loop detected');
              }
            });

            // Update sequence if callback provided
            if (onAddToSequence && sequence.length > 0) {
              sequence.forEach(block => {
                try {
                  onAddToSequence(block);
                } catch (sequenceError) {
                  console.warn('Error adding block to sequence:', sequenceError.message);
                }
              });
            }
          }
        } catch (error) {
          console.error('Error in workspace change listener:', error);
        }
      });
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, [ScratchBlocks, isLoading, onCodeChange, onAddToSequence]);

  if (isLoading) {
    return (
      <div className="scratch-blocks-loading">
        <p>Loading Scratch Blocks...</p>
      </div>
    );
  }

  if (!ScratchBlocks) {
    return (
      <div className="scratch-blocks-error">
        <p>Failed to load Scratch Blocks. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <div 
        ref={blocklyDiv} 
        style={{ 
          width: '100%', 
          height: '100%',
          border: '2px solid #4CAF50',
          borderRadius: '8px'
        }} 
      />
    </div>
  );
};

export default ScratchBlocksWorkspace;