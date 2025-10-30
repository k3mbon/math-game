import React, { useState, useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import HumanCharacter from './HumanCharacter';
import { getGrassTileByPosition, preloadGrassTiles } from '../utils/grassTileLoader';
import { generateBalancedLayout } from '../utils/smartRandomizer';
import './ZenoGameNew.css';
import './BlocklyComponent.css';

const ZenoGameNew = () => {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const gridWidth = 6;
  const gridHeight = 5;
  const cellSize = Math.min(50 + (level - 1) * 8, 80);
  
  // Blockly workspace reference
  const workspaceRef = useRef(null);
  const blocklyDiv = useRef(null);

  const getGrassTileByPositionWrapper = (x, y, width, height) => {
    return getGrassTileByPosition(x, y, width, height);
  };

  // Generate random layout on component initialization and refresh
  const generateNewLayout = (lvlOverride, movesOverride) => {
    const effectiveLevel = typeof lvlOverride === 'number' ? lvlOverride : level;
    const crystalCount = 2 + effectiveLevel;
    const allowedMoves = typeof movesOverride === 'number' 
      ? movesOverride 
      : Math.min(12 + (effectiveLevel - 1) * 2, 18);
    return generateBalancedLayout({
      gridWidth,
      gridHeight,
      crystalCount,
      maxMoves: allowedMoves,
      startPosition: { x: 0, y: 3 },
      difficultyTarget: 0.75
    });
  };

  const [gameLayout] = useState(() => {
    const layout = generateNewLayout();
    console.log(`Generated layout with ${Object.keys(layout.crystals).length} crystals requiring ${layout.optimalMoves} moves`);
    return layout;
  });

  const [crystals, setCrystals] = useState(gameLayout.crystals);
  const [targetPosition, setTargetPosition] = useState(gameLayout.target);
  const [collectedCrystals, setCollectedCrystals] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 3 }); // Changed from y: 4 to y: 3 to avoid last row
  const [playerDirection, setPlayerDirection] = useState('right');
  const [executionQueue, setExecutionQueue] = useState([]);
  const computeMaxMoves = (lvl) => Math.min(12 + (lvl - 1) * 2, 18);
  const [maxMoves, setMaxMoves] = useState(computeMaxMoves(level));
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  useEffect(() => {
    preloadGrassTiles();
    
    // Initialize Blockly workspace with a small delay to ensure proper loading
    const timer = setTimeout(() => {
      initializeBlockly();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Cleanup Blockly workspace on unmount
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    setMaxMoves(computeMaxMoves(level));
  }, [level]);

  // Initialize Blockly workspace and custom blocks
  const initializeBlockly = () => {
    // Define custom movement blocks matching Blockly Maze exactly
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'maze_moveForward',
        message0: 'move forward',
        previousStatement: null,
        nextStatement: null,
        colour: 120, // Green color matching Blockly Maze
        tooltip: 'Moves the player forward one space in the direction they are facing.',
        helpUrl: ''
      },
      {
        type: 'maze_turnLeft',
        message0: 'turn left ↺',
        previousStatement: null,
        nextStatement: null,
        colour: 120, // Green color matching Blockly Maze
        tooltip: 'Turns the player left by 90 degrees.',
        helpUrl: ''
      },
      {
        type: 'maze_turnRight',
        message0: 'turn right ↻',
        previousStatement: null,
        nextStatement: null,
        colour: 120, // Green color matching Blockly Maze
        tooltip: 'Turns the player right by 90 degrees.',
        helpUrl: ''
      }
    ]);

    // Create toolbox matching Blockly Maze structure
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Actions',
          colour: 120, // Green color matching Blockly Maze
          contents: [
            { kind: 'block', type: 'maze_moveForward' },
            { kind: 'block', type: 'maze_turnLeft' },
            { kind: 'block', type: 'maze_turnRight' }
          ]
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '%{BKY_LOOPS_HUE}',
          contents: [
            { 
              kind: 'block', 
              type: 'controls_repeat_ext',
              inputs: {
                TIMES: {
                  shadow: {
                    type: 'math_number',
                    fields: {
                      NUM: 10
                    }
                  }
                }
              }
            }
          ]
        }
      ]
    };

    // Initialize workspace with enhanced toolbox configuration
    if (blocklyDiv.current) {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        trashcan: true,
        scrollbars: true,
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
        },
        // Enhanced toolbox behavior
        toolboxPosition: 'start',
        horizontalLayout: false,
        // Keep flyout open during drag operations
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        }
      });

      // More robust flyout management - prevent auto-close during drag
      let isDragging = false;
      let dragStartTime = 0;
      
      // Track drag operations more comprehensively
      workspaceRef.current.addChangeListener((event) => {
        const flyout = workspaceRef.current.getFlyout();
        
        if (event.type === Blockly.Events.BLOCK_DRAG) {
          isDragging = true;
          dragStartTime = Date.now();
          console.log('Drag started - keeping flyout open');
          
          // Force flyout to stay visible
          if (flyout && flyout.isVisible()) {
            flyout.autoClose = false;
          }
        }
        
        if (event.type === Blockly.Events.BLOCK_MOVE || 
            event.type === Blockly.Events.BLOCK_CREATE ||
            event.type === Blockly.Events.BLOCK_DELETE) {
          
          // Only end drag state after a reasonable delay and if enough time has passed
          const timeSinceDragStart = Date.now() - dragStartTime;
          if (timeSinceDragStart > 100) {
            setTimeout(() => {
              isDragging = false;
              console.log('Drag ended - allowing flyout auto-close');
              
              // Re-enable auto-close after drag is complete
              if (flyout) {
                flyout.autoClose = true;
              }
            }, 300);
          }
        }
      });

      // Override flyout hide method with more robust logic
      const flyout = workspaceRef.current.getFlyout();
      if (flyout) {
        const originalHide = flyout.hide.bind(flyout);
        flyout.hide = function() {
          // Don't hide if we're currently dragging
          if (isDragging) {
            console.log('Preventing flyout hide during drag');
            return;
          }
          originalHide();
        };
      }
    }

    console.log('Blockly workspace initialized');
  };

  // Enhanced movement processing with Blockly Maze-style movement system. Based on my analysis, I can see that the current system already has some of the right components, but needs to be refined to match the precise mechanics of Google Blockly's Maze game <mcreference link="https://blockly.games/maze?lang=en" index="0">0</mcreference>. 
  // The key improvements needed are:
  // 1. More precise grid-based movement with collision detection
  // 2. Smoother transitions matching Blockly Maze timing
  // 3. Better sequential execution that matches the reference implementation
  // Process execution queue - fixed to prevent race conditions
  useEffect(() => {
    if (executionQueue.length > 0 && !isExecuting) {
      setIsExecuting(true);
      
      const nextMove = executionQueue[0];
      setCurrentStep(prev => prev + 1);
      
      // Blockly Maze timing: 400ms for movement, 200ms for turns
      const moveDelay = nextMove === 'forward' ? 400 : 200;
      
      console.log(`Executing action: ${nextMove} with delay: ${moveDelay}ms`);
      
      setTimeout(() => {
        // Handle directional movement based on action type
        if (nextMove === 'forward') {
          // Move forward based on current direction with collision detection
          setPlayerPosition(prev => {
            let newX = prev.x;
            let newY = prev.y;
            
            // Calculate intended position based on current direction
            switch (playerDirection) {
              case 'up':
                newY = prev.y - 1;
                break;
              case 'down':
                newY = prev.y + 1;
                break;
              case 'left':
                newX = prev.x - 1;
                break;
              case 'right':
                newX = prev.x + 1;
                break;
            }
            
            // Collision detection - check boundaries
            if (newX < 0 || newX >= gridWidth || newY < 0 || newY >= gridHeight) {
              // Invalid move - stay in current position
              console.log(`Collision detected: attempted move to (${newX}, ${newY}) blocked by boundary`);
              return prev;
            }
            
            // Valid move - update position
            const crystalKey = `${newX}-${newY}`;
            if (crystals[crystalKey] && !crystals[crystalKey].collected) {
              setCrystals(prevCrystals => ({
                ...prevCrystals,
                [crystalKey]: { ...prevCrystals[crystalKey], collected: true }
              }));
              setCollectedCrystals(prev => prev + 1);
            }
            
            // Check for win condition: player reaches target after collecting all crystals
            const allCrystalsCollected = Object.values(crystals).every(crystal => crystal.collected) || 
                                       (crystals[crystalKey] && Object.values(crystals).filter(c => !c.collected || c === crystals[crystalKey]).length === 1);
            const reachedTarget = newX === targetPosition.x && newY === targetPosition.y;
            
            if (allCrystalsCollected && reachedTarget && !gameWon) {
              setTimeout(() => {
                setGameWon(true);
                setShowVictoryModal(true);
                setScore(prev => prev + (12 - sequence.length) * 10); // Bonus points for efficiency
              }, 300);
            }
            
            return { x: newX, y: newY };
          });
        } else if (nextMove === 'turnLeft') {
          // Turn left (counterclockwise)
          setPlayerDirection(prev => {
            const directions = ['up', 'right', 'down', 'left'];
            const currentIndex = directions.indexOf(prev);
            const newDirection = directions[(currentIndex + 3) % 4];
            console.log(`Turning left from ${prev} to ${newDirection}`);
            return newDirection;
          });
        } else if (nextMove === 'turnRight') {
          // Turn right (clockwise)
          setPlayerDirection(prev => {
            const directions = ['up', 'right', 'down', 'left'];
            const currentIndex = directions.indexOf(prev);
            const newDirection = directions[(currentIndex + 1) % 4];
            console.log(`Turning right from ${prev} to ${newDirection}`);
            return newDirection;
          });
        }
  
        // Remove the processed action and continue - this is the key fix
        setExecutionQueue(prev => prev.slice(1));
        setIsExecuting(false);
      }, moveDelay);
    }
  }, [executionQueue, isExecuting, playerDirection, gridWidth, gridHeight, crystals, targetPosition, gameWon]);

  const executeProgram = () => {
    if (!workspaceRef.current) {
      alert('Blockly workspace not initialized!');
      return;
    }
    
    // Get all blocks from the workspace
    const topBlocks = workspaceRef.current.getTopBlocks(true);
    
    console.log('Top blocks found:', topBlocks.length);
    topBlocks.forEach((block, index) => {
      console.log(`Top block ${index}:`, block.type, 'ID:', block.id);
    });
    
    if (topBlocks.length === 0) {
      alert('No blocks to execute! Please add some movement blocks.');
      return;
    }

    const actions = [];

    // Process blocks directly without generating JavaScript code
    const processBlock = (block) => {
      if (!block) return;
      
      console.log(`Processing block: ${block.type} (ID: ${block.id})`);
      
      switch (block.type) {
        case 'maze_moveForward':
          console.log('Processing maze_moveForward block - adding "forward" to actions');
          actions.push('forward');
          console.log('Actions array now has length:', actions.length);
          break;
        case 'maze_turnLeft':
          console.log('Processing maze_turnLeft block - adding "turnLeft" to actions');
          actions.push('turnLeft');
          console.log('Actions array now has length:', actions.length);
          break;
        case 'maze_turnRight':
          console.log('Processing maze_turnRight block - adding "turnRight" to actions');
          actions.push('turnRight');
          console.log('Actions array now has length:', actions.length);
          break;
        case 'controls_repeat_ext':
          // Handle repeat blocks - fixed to properly get TIMES value
          console.log('Processing controls_repeat_ext block');
          
          // Try multiple methods to get the TIMES value
          let times = 0;
          
          // Method 1: Try to get from connected number block
          const timesInput = block.getInput('TIMES');
          if (timesInput) {
            const timesConnection = timesInput.connection;
            if (timesConnection && timesConnection.targetBlock()) {
              const timesBlock = timesConnection.targetBlock();
              console.log('Found connected times block:', timesBlock.type);
              if (timesBlock.type === 'math_number') {
                times = parseInt(timesBlock.getFieldValue('NUM')) || 0;
                console.log('Got times from math_number block:', times);
              }
            }
          }
          
          // Method 2: Fallback to getFieldValue if no connected block
          if (times === 0) {
            try {
              const timesField = block.getFieldValue('TIMES');
              times = parseInt(timesField) || 0;
              console.log('Got times from field value:', times);
            } catch (e) {
              console.log('Could not get TIMES field value:', e.message);
            }
          }
          
          // Method 3: Default fallback
          if (times === 0) {
            times = 1; // Default to 1 if we can't get the value
            console.log('Using default times value:', times);
          }
          
          const doBlock = block.getInputTargetBlock('DO');
          
          console.log(`Processing repeat block: ${times} times`);
          console.log('DoBlock exists:', !!doBlock);
          console.log('DoBlock type:', doBlock ? doBlock.type : 'null');
          console.log('Times value:', times);
          
          // Check if there are blocks connected inside the repeat
          if (doBlock && times > 0) {
            console.log(`Starting repeat loop with ${times} iterations`);
            for (let i = 0; i < times; i++) {
              console.log(`Repeat iteration ${i + 1}/${times}`);
              processBlockSequence(doBlock);
            }
            console.log('Repeat loop completed');
          } else {
            console.log('Repeat block validation failed:');
            console.log('- DoBlock exists:', !!doBlock);
            console.log('- Times > 0:', times > 0);
            if (!doBlock) {
              console.log('ERROR: No blocks connected inside the repeat block');
            }
            if (times <= 0) {
              console.log('ERROR: Invalid repeat count:', times);
            }
          }
          break;
        default:
          console.log(`Unknown block type: ${block.type}`);
      }
    };

    const processBlockSequence = (startBlock) => {
      let currentBlock = startBlock;
      while (currentBlock) {
        console.log(`Processing block in sequence: ${currentBlock.type} (ID: ${currentBlock.id})`);
        processBlock(currentBlock);
        currentBlock = currentBlock.getNextBlock();
        if (currentBlock) {
          console.log(`Moving to next block: ${currentBlock.type} (ID: ${currentBlock.id})`);
        } else {
          console.log('End of block sequence reached');
        }
      }
    };

    try {
      // Process all top-level blocks
      topBlocks.forEach(block => {
        console.log(`Starting to process top-level block: ${block.type}`);
        processBlockSequence(block);
      });
      
      console.log('Actions collected:', actions);
      console.log('Actions array length:', actions.length);
      
      // Set the execution queue with the collected actions
      if (actions.length > 0 && actions.length <= maxMoves) {
        setExecutionQueue([...actions]);
        setCurrentStep(0);
        setTotalSteps(actions.length);
      } else if (actions.length > maxMoves) {
        alert(`Too many moves! Maximum allowed: ${maxMoves}, but got ${actions.length}`);
      } else {
        console.log('No actions were collected from blocks');
        alert('No moves generated! Make sure your blocks are connected properly.');
      }
    } catch (err) {
      console.error('Execution error:', err);
      alert('Error processing blocks:\n' + (err.stack || err.message));
    }
  };

  const resetGame = () => {
    setPlayerPosition({ x: 0, y: 3 }); // Changed from y: 4 to y: 3 to avoid last row
    setPlayerDirection('right');
    setSequence([]);
    setExecutionQueue([]);
    setIsExecuting(false);
    setCollectedCrystals(0);
    setCurrentStep(0);
    setTotalSteps(0);
    setGameWon(false);
    setShowVictoryModal(false);
    
    // Generate a new random layout
    const newLayout = generateNewLayout();
    
    console.log(`New layout generated with ${Object.keys(newLayout.crystals).length} crystals requiring ${newLayout.optimalMoves} moves`);
    
    setCrystals(newLayout.crystals);
    setTargetPosition(newLayout.target);
  };

  const addToSequence = (tile) => {
    if (sequence.length < maxMoves && !gameWon) {
      setSequence(prev => [...prev, { ...tile, uniqueId: Date.now() }]);
    }
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setShowVictoryModal(false);
    setGameWon(false);
    // Reset base state
    setPlayerPosition({ x: 0, y: 3 });
    setPlayerDirection('right');
    setSequence([]);
    setExecutionQueue([]);
    setIsExecuting(false);
    setCollectedCrystals(0);
    setCurrentStep(0);
    setTotalSteps(0);
    // Regenerate layout using updated level and moves
    const newLayout = generateNewLayout(newLevel, computeMaxMoves(newLevel));
    setCrystals(newLayout.crystals);
    setTargetPosition(newLayout.target);
  };

  const repeatLevel = () => {
    setShowVictoryModal(false);
    setGameWon(false);
    // Keep the same level but regenerate the layout
    setPlayerPosition({ x: 0, y: 3 });
    setPlayerDirection('right');
    setSequence([]);
    setExecutionQueue([]);
    setIsExecuting(false);
    setCollectedCrystals(0);
    setCurrentStep(0);
    setTotalSteps(0);
    const newLayout = generateNewLayout(level, computeMaxMoves(level));
    setCrystals(newLayout.crystals);
    setTargetPosition(newLayout.target);
  };

  return (
    <>
      <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #E8F4FD 0%, #B8E6B8 100%)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateAreas: `
        "header header"
        "game blocks"
      `,
      gap: '15px',
      padding: '15px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      overflowY: 'auto',
      overflowX: 'hidden',
      margin: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      {/* Header Stats */}
      <div style={{
        gridArea: 'header',
        display: 'flex',
        gap: '15px',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '2px solid #4CAF50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '40px',
          minWidth: '120px'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#333',
            padding: '2px 4px',
            margin: 0
          }}>Misi: Gerakkan Ksatria ke</span>
          <span style={{
            background: '#FF9800',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: 'bold',
            margin: 0
          }}>({targetPosition.x}, {targetPosition.y})</span>
        </div>
        <div style={{
          background: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '2px solid #4CAF50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '40px',
          minWidth: '120px'
        }}>
          <span style={{
            background: '#4CAF50',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: 'bold',
            margin: 0
          }}>Level {level}</span>
          <span style={{
            background: '#FF9800',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: 'bold',
            margin: 0
          }}>Langkah: {sequence.length}/{maxMoves}</span>
        </div>
        
        <div style={{
          background: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '2px solid #9C27B0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '40px',
          minWidth: '120px'
        }}>
          <span style={{
            background: '#9C27B0',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: 'bold',
            margin: 0
          }}>💎 Kristal: {collectedCrystals}/{Object.keys(crystals).length}</span>
        </div>
        
        <div style={{
          background: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '2px solid #4CAF50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '40px',
          minWidth: '120px'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#333',
            padding: '2px 4px',
            margin: 0
          }}>Skor:</span>
          <span style={{
            background: '#FF9800',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: 'bold',
            margin: 0
          }}>{score}</span>
        </div>
      </div>

      {/* Blocks Section (Right) */}
      <div style={{
        gridArea: 'blocks',
        background: 'white',
        borderRadius: '15px',
        padding: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '2px solid #4CAF50',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F5F5F5',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🧩</span>
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              color: '#333',
              padding: '2px 0'
            }}>Official Scratch Blocks</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                // Stop any ongoing execution
                setIsExecuting(false);
                setExecutionQueue([]);
                setCurrentStep(0);
                setTotalSteps(0);
                
                // Clear the sequence
                setSequence([]);
              }}
              disabled={isExecuting}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                background: '#1F2937',
                color: 'white',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                opacity: isExecuting ? 0.5 : 1
              }}
            >Clear</button>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Programming Blocks</h3>
          <div 
            ref={blocklyDiv}
            style={{
              flex: 1,
              minHeight: '300px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          
          {/* Blockly Control Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={executeProgram}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Run Program
            </button>
            <button
              onClick={() => {
                if (workspaceRef.current) {
                  // Stop any ongoing execution
                  setIsExecuting(false);
                  setExecutionQueue([]);
                  setCurrentStep(0);
                  setTotalSteps(0);
                  
                  // Clear the workspace
                  workspaceRef.current.clear();
                }
              }}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Blocks
            </button>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div style={{
        gridArea: 'game',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        overflow: 'visible'
      }}>
          <div style={{
            background: '#4CAF50',
            color: 'white',
            padding: '12px 15px',
            borderRadius: '8px',
            position: 'relative',
            flexShrink: 0
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              padding: '0'
            }}>Program Status - Status eksekusi program Blockly</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '8px 0'
            }}>
              <div style={{
                flex: 1,
                height: '6px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'white',
                  width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {isExecuting ? `${currentStep}/${totalSteps}` : 'Ready'}
              </span>
            </div>
            <p style={{
              fontSize: '11px',
              margin: '0',
              opacity: 0.9
            }}>🎯 {isExecuting ? 'Program sedang berjalan...' : 'Siap menjalankan program Blockly'}</p>
            <p style={{
              fontSize: '10px',
              margin: '4px 0 0 0',
              opacity: 0.7,
              fontStyle: 'italic'
            }}>💡 Tip: Susun blok gerakan untuk mencapai kristal!</p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: '0 0 auto',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridWidth}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridHeight}, ${cellSize}px)`,
              gap: '0px',
              background: 'transparent',
              padding: '0px',
              borderRadius: '0px',
              border: 'none',
              boxShadow: 'none'
            }}>
              {Array.from({ length: gridWidth * gridHeight }, (_, i) => {
                const x = i % gridWidth;
                const y = Math.floor(i / gridWidth);
                const isTarget = x === targetPosition.x && y === targetPosition.y;
                const isPlayerHere = playerPosition.x === x && playerPosition.y === y;
                const crystalKey = `${x}-${y}`;
                const hasCrystal = crystals[crystalKey] && !crystals[crystalKey].collected;
                const grassAsset = getGrassTileByPositionWrapper(x, y, gridWidth, gridHeight);
                
                return (
                  <div 
                    key={i} 
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: '0px',
                      backgroundImage: `url('${grassAsset}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {isPlayerHere && (
                      <HumanCharacter 
                        size={Math.round(cellSize * 1.2)}
                        x={0}
                        y={0}
                        direction={playerDirection}
                        isAnimating={isExecuting}
                        animationState={isExecuting ? 'walking' : 'breathing'}
                      />
                    )}
                    {isTarget && (
                      <div style={{
                        fontSize: `${Math.round(cellSize * 0.4)}px`,
                        background: '#FF9800',
                        width: `${Math.round(cellSize * 0.8)}px`,
                        height: `${Math.round(cellSize * 0.8)}px`,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(255, 152, 0, 0.5)'
                      }}>🎯</div>
                    )}
                    {hasCrystal && (
                      <div style={{
                        fontSize: `${Math.round(cellSize * 0.36)}px`,
                        background: 'linear-gradient(45deg, #9C27B0, #673AB7)',
                        width: `${Math.round(cellSize * 0.6)}px`,
                        height: `${Math.round(cellSize * 0.6)}px`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.6)',
                        border: '2px solid white',
                        animation: 'sparkle 2s ease-in-out infinite',
                        zIndex: 5
                      }}>💎</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            background: 'white',
            border: '2px solid #FF9800',
            borderRadius: '12px',
            padding: '12px',
            flex: '1 1 auto',
            minHeight: '140px', // Minimum height for better visibility
            maxHeight: sequence.length > 12 ? '320px' : sequence.length > 6 ? '280px' : '240px', // Dynamic height based on sequence length
            overflow: 'visible', // Changed to visible to prevent clipping
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              flexShrink: 0 // Prevent header from shrinking
            }}>
              <span style={{ fontSize: '16px' }}>🧩</span>
              <h3 style={{
                margin: 0,
                color: '#FF9800',
                fontSize: '14px',
                padding: '0'
              }}>Program Ksatriamu</h3>
            </div>
            
            <div 
                      className="program-sequence-container"
                      style={{
                        flex: 1,
                        minHeight: '100px',
                        border: '2px solid #FFE0B2',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: sequence.length === 0 ? 'center' : 'flex-start',
                        justifyContent: sequence.length === 0 ? 'center' : 'flex-start',
                        maxHeight: sequence.length > 12 ? '280px' : sequence.length > 6 ? '240px' : '200px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)',
                        alignContent: 'flex-start',
                        position: 'relative'
                      }}>
              {sequence.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666',
                  width: '100%', // Take full width when centered
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '50px'
                }}>
                  <p style={{
                    margin: 0,
                    fontStyle: 'italic',
                    fontSize: '12px'
                  }}>Seret ubin ke sini untuk membuat program Anda!</p>
                </div>
              ) : (
                // Sequence tiles with improved layout for scrolling
                sequence.map((tile, index) => (
                  <div
                    key={tile.uniqueId}
                    className="sequence-tile"
                    style={{
                      width: '50px', // Consistent tile size
                      height: '50px', // Consistent tile size
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px', // Font size for visibility
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      backgroundColor: tile.color,
                      flexShrink: 0, // Prevent tiles from shrinking
                      cursor: 'pointer', // Interactive cursor
                      transition: 'transform 0.2s ease', // Hover effect
                      position: 'relative',
                      margin: '0' // No margin to prevent layout issues
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                    title={`${tile.name} (${index + 1})`} // Tooltip
                  >
                    {tile.icon}
                    {/* Step number indicator with improved positioning */}
                    <div style={{
                      position: 'absolute',
                      top: '-4px', // Positioning to prevent clipping
                      right: '-4px', // Positioning to prevent clipping
                      width: '20px', // Size for visibility
                      height: '20px', // Size for visibility
                      borderRadius: '50%',
                      background: '#2196F3',
                      color: 'white',
                      fontSize: '12px', // Font size for readability
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      zIndex: 10, // Above other elements
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)' // Shadow for visibility
                    }}>
                      {index + 1}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        
          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            flexShrink: 0,
            minHeight: '50px'
          }}>
            <button 
              onClick={executeProgram}
              disabled={isExecuting || sequence.length === 0 || sequence.length > maxMoves || gameWon}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: sequence.length === 0 || sequence.length > maxMoves || isExecuting || gameWon ? 'not-allowed' : 'pointer',
                background: '#4CAF50',
                color: 'white',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                opacity: sequence.length === 0 || sequence.length > maxMoves || isExecuting || gameWon ? 0.5 : 1
              }}
            >
              <span>✓</span>
              JALANKAN KSATRIA
            </button>
            
            <button 
              onClick={resetGame}
              disabled={isExecuting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                background: '#FF9800',
                color: 'white',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                opacity: isExecuting ? 0.5 : 1
              }}
            >
              <span>🔄</span>
              RESET PERMAINAN
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFF9C4',
              padding: '8px 12px',
              borderRadius: '15px',
              border: '2px solid #FFD54F'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span style={{ fontWeight: 'bold', color: '#F57F17', fontSize: '14px' }}>Skor: {score}</span>
            </div>
          </div>
        </div>
      
        {/* Victory Modal */}
        {showVictoryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              border: '3px solid #FFD700',
              minWidth: '400px',
              transform: 'scale(1)',
              animation: 'celebrationBounce 0.6s ease-out'
            }}>
              <div style={{
                fontSize: '60px',
                marginBottom: '20px',
                animation: 'sparkle 1s ease-in-out infinite'
              }}>🎉</div>
              
              <h1 style={{
                color: 'white',
                fontSize: '32px',
                margin: '0 0 10px 0',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>Selamat!</h1>
              
              <p style={{
                color: 'white',
                fontSize: '18px',
                margin: '0 0 20px 0',
                opacity: 0.95
              }}>Anda berhasil mengumpulkan semua kristal!</p>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '15px',
                margin: '20px 0',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>
                  🏆 <strong>Statistik Permainan:</strong>
                </div>
                <div style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>
                  💎 Kristal dikumpulkan: {collectedCrystals}/{Object.keys(crystals).length}
                </div>
                <div style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>
                  🎯 Langkah digunakan: {sequence.length}/{maxMoves}
                </div>
                <div style={{ color: 'white', fontSize: '14px' }}>
                  ⭐ Skor: {score} poin
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                marginTop: '25px'
              }}>
                <button 
                  onClick={nextLevel}
                  style={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.4)';
                  }}
                >
                  <span>🚀</span>
                  Level Berikutnya
                </button>
                
                <button 
                  onClick={repeatLevel}
                  style={{
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.4)';
                  }}
                >
                  <span>🔄</span>
                  Ulangi Level
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
    </>
  );
};

export default ZenoGameNew;
