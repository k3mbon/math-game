import React, { useState, useEffect } from 'react';
import './ZenoTerrainGame.css';
import { getGrassTileByPosition, preloadGrassTiles } from '../utils/grassTileLoader';
import HumanCharacter from './HumanCharacter';

// Grass border pattern mapping using new grass tileset
const GRASS_BORDER_MAPPING = {
  // Corners
  'top-left': 'grass1.png',     // Top left corner
  'top-right': 'grass3.png',    // Top right corner 
  'bottom-left': 'grass7.png',  // Bottom left corner
  'bottom-right': 'grass9.png', // Bottom right corner
  
  // Edges  
  'top': 'grass2.png',          // Gap between top corners
  'left': 'grass4.png',         // Gap between left corners
  'right': 'grass6.png',        // Gap between right corners
  'bottom': 'grass8.png',       // Gap between bottom corners
  
  // Center
  'center': 'grass5.png'        // Center fill
};

// Function to get the correct grass tile based on position
const getGrassTileByPositionWrapper = (x, y, gridWidth, gridHeight) => {
  return getGrassTileByPosition(x, y, gridWidth, gridHeight);
};

const ZenoTerrainGame = () => {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [gridWidth] = useState(8);
  const [gridHeight] = useState(8);
  const [crystalsCollected, setCrystalsCollected] = useState(0);
  const [totalCrystals] = useState(3);
    const [crystalPositions] = useState(() => {
    const positions = [];
    let count = 0;
    
    while (count < 3) {
      const x = Math.floor(Math.random() * 8);
      const y = Math.floor(Math.random() * 8);
      
      if (!(x === 0 && y === 0) && !(x === 7 && y === 7)) {
        if (!positions.some(pos => pos.x === x && pos.y === y)) {
          positions.push({ x, y, collected: false });
        }
      }
      count++;
    }
    
    return positions;
  });
  const [crystals, setCrystals] = useState(() => {
    const crystalMap = {};
    crystalPositions.forEach(pos => {
      crystalMap[`${pos.x}-${pos.y}`] = { ...pos };
    });
    return crystalMap;
  });
  const [collectedCrystals, setCollectedCrystals] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [playerDirection, setPlayerDirection] = useState('right');
  const [executionQueue, setExecutionQueue] = useState([]);
  const [maxMoves] = useState(15);
  const [isExecuting, setIsExecuting] = useState(false);

  // Preload grass tiles on component mount
  useEffect(() => {
    preloadGrassTiles();
  }, []);

  // Handle movement execution
  useEffect(() => {
    const processNextMove = () => {
      if (executionQueue.length === 0) {
        setIsExecuting(false);
        return;
      }

      const nextMove = executionQueue.shift();
      setIsExecuting(true);

      // Process the move
      setTimeout(() => {
        setPlayerPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          
          switch (nextMove) {
            case '↑':
              newY = Math.max(0, prev.y - 1);
              setPlayerDirection('up');
              break;
            case '↓':
              newY = Math.min(7, prev.y + 1);
              setPlayerDirection('down');
              break;
            case '←':
              newX = Math.max(0, prev.x - 1);
              setPlayerDirection('left');
              break;
            case '→':
              newX = Math.min(7, prev.x + 1);
              setPlayerDirection('right');
              break;
          }
          
          // Check for crystal collection
          const crystalKey = `${newX}-${newY}`;
          if (crystals[crystalKey] && !crystals[crystalKey].collected) {
            setCrystals(prevCrystals => ({
              ...prevCrystals,
              [crystalKey]: { ...prevCrystals[crystalKey], collected: true }
            }));
            setCollectedCrystals(prev => prev + 1);
          }
          
          return { x: newX, y: newY };
        });

        setExecutionQueue(prev => prev.slice(1));
        setTimeout(processNextMove, 200);
      }, 500);
    };

    if (executionQueue.length > 0 && !isExecuting) {
      processNextMove();
    }
  }, [executionQueue.length, isExecuting, crystals]);

  const executeProgram = () => {
    if (sequence.length === 0 || sequence.length > maxMoves) return;
    
    const moves = [];
    let currentDirection = 'right';
    
    sequence.forEach(tile => {
      switch (tile.id) {
        case 'forward':
          moves.push(currentDirection === 'right' ? '→' : 
                     currentDirection === 'left' ? '←' : 
                     currentDirection === 'up' ? '↑' : '↓');
          break;
        case 'left':
          currentDirection = currentDirection === 'right' ? 'up' :
                            currentDirection === 'up' ? 'left' :
                            currentDirection === 'left' ? 'down' : 'right';
          break;
        case 'right':
          currentDirection = currentDirection === 'right' ? 'down' :
                            currentDirection === 'down' ? 'left' :
                            currentDirection === 'left' ? 'up' : 'right';
          break;
      }
    });
    
    setExecutionQueue([...moves]);
  };

  const resetGame = () => {
    setPlayerPosition({ x: 0, y: 0 });
    setPlayerDirection('right');
    setSequence([]);
    setExecutionQueue([]);
    setIsExecuting(false);
    setCrystals(crystalMap => {
      const resetMap = {};
      Object.keys(crystalMap).forEach(key => {
        resetMap[key] = { ...crystalMap[key], collected: false };
      });
      return resetMap;
    });
    setCollectedCrystals(0);
  };

  const movementTiles = [
    { id: 'forward', name: 'Move Forward', icon: '⬆️', color: '#4CAF50' },
    { id: 'left', name: 'Turn Left', icon: '↶', color: '#2196F3' },
    { id: 'right', name: 'Turn Right', icon: '↷', color: '#2196F3' }
  ];

  const addToSequence = (tile) => {
    setSequence(prev => [...prev, { ...tile, uniqueId: Date.now() }]);
  };

  return (
    <div className="zeno-theme">
        <div className="zeno-game-container">
          <div className="zeno-controls-panel">
          <div className="level-info">
            <h3>Level {level} - Beginner</h3>
            <p className="level-description">Learn basic movement commands</p>
            <p>Moves: {sequence.length}/{maxMoves}</p>
            <p>Crystals: {collectedCrystals}/3</p>
          </div>

          <div className="movement-controls">
            <h4>Movement</h4>
            <div className="jigsaw-tiles-horizontal">
              {movementTiles.map(tile => (
                <div
                  key={tile.id}
                  className="jigsaw-tile"
                  style={{ backgroundColor: tile.color }}
                  onClick={() => sequence.length < maxMoves && addToSequence(tile)}
                >
                  <div className="tile-content">
                    <span className="tile-icon">{tile.icon}</span>
                    <span className="tile-name">{tile.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="execution-controls" style={{ marginTop: '20px' }}>
            <button 
              onClick={executeProgram}
              disabled={isExecuting || sequence.length === 0 || sequence.length > maxMoves}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: sequence.length === 0 || sequence.length > maxMoves || isExecuting ? 'not-allowed' : 'pointer',
                marginRight: '10px',
                opacity: sequence.length === 0 || sequence.length > maxMoves || isExecuting ? 0.5 : 1
              }}
            >
              {isExecuting ? 'Executing...' : 'Execute Program'}
            </button>
            
            <button 
              onClick={resetGame}
              disabled={isExecuting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                opacity: isExecuting ? 0.5 : 1
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="zeno-game-canvas">
          <div className="game-canvas-container">
            <div style={{ marginBottom: '10px', textAlign: 'center' }}>
              <h4>8x8 Grass Border Pattern Demo</h4>
              <p style={{ fontSize: '12px', color: '#666' }}>
                Corners: grass1, grass3, grass7, grass9 | Edges: grass2, grass4, grass6, grass8 | Center: grass5
              </p>
            </div>
            <div className="game-grid" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
              gridTemplateRows: `repeat(${gridHeight}, 1fr)`,
              gap: 0
            }}>
              {Array.from({ length: gridWidth * gridHeight }, (_, i) => {
                const x = i % gridWidth;
                const y = Math.floor(i / gridWidth);
                const isStart = x === 0 && y === 0;
                const isTarget = x === gridWidth - 1 && y === gridHeight - 1;
                const crystalKey = `${x}-${y}`;
                const crystal = crystals[crystalKey];
                const isPlayerHere = playerPosition.x === x && playerPosition.y === y;
                const grassAsset = getGrassTileByPositionWrapper(x, y, gridWidth, gridHeight);
                
                return (
                  <div 
                    key={i} 
                    className="terrain-tile"
                    style={{
                      backgroundImage: `url('${grassAsset}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    title={`Position: (${x}, ${y}) - ${grassAsset.split('/').pop()}`}
                  >
                    {crystal && !crystal.collected && (
                      <div style={{
                        position: 'absolute',
                        width: '30px',
                        height: '30px',
                        backgroundImage: "url('/assets/characters/terrain-object/Crystals/2.png')",
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.6))',
                        animation: 'crystal-glow 2s ease-in-out infinite alternate',
                        zIndex: 5
                      }}></div>
                    )}
                    {(isStart || isPlayerHere) && (
                      <HumanCharacter
                        size={48}
                        x={0}
                        y={0}
                        direction={playerDirection}
                        isAnimating={isExecuting}
                        animationState={isExecuting ? "walking" : "idle"}
                      />
                    )}
                    {isTarget && (
                      <div style={{
                        width: '80%',
                        height: '80%',
                        backgroundImage: "url('/assets/zeno-target-tile.svg')",
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                      }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="zeno-program-area">
          <div className="program-header">
            <h3>Program Sequence</h3>
          </div>
          
          <div className="programming-workspace">
            <div className="program-sequence">
              {sequence.length === 0 ? (
                <div className="empty-program">
                  <p>Click tiles above to build your program!</p>
                  <p>Goal: Move the swordsman to the target and collect crystals!</p>
                </div>
              ) : (
                <div className="sequence-tiles">
                  {sequence.map((tile, index) => (
                    <div
                      key={tile.uniqueId}
                      className="jigsaw-tile"
                      style={{ backgroundColor: tile.color }}
                    >
                      <div className="tile-content">
                        <span className="tile-icon">{tile.icon}</span>
                        <span className="tile-name">{tile.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZenoTerrainGame;
