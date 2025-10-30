import React, { useRef, useEffect, useState, useCallback } from 'react';
import './OpenWorldGame.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { useGameState } from '../hooks/useGameState';
import { useGameLoop } from '../hooks/useGameLoop.jsx';
import { generateTerrainChunk, isWalkable } from '../utils/terrainGenerator';
import SimpleCanvasRenderer from './SimpleCanvasRenderer';
import TreasureQuestionModal from './TreasureQuestionModal';
import numerationProblems from '../data/NumerationProblem.json';
import { useInteractionSystem } from '../utils/interactionSystem';

const SimpleOpenWorldGame = ({ customWorld = null }) => {
  const canvasRef = useRef(null);
  const [keys, setKeys] = useState({});
  const [forcedSafePositions, setForcedSafePositions] = useState(new Map());
  const [stairConnections, setStairConnections] = useState(new Map());
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTreasureBox, setCurrentTreasureBox] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(customWorld?.currentLevel || 0);

  // Get current level world data
  const getCurrentLevelWorld = () => {
    if (!customWorld) return null;
    
    // Handle new multi-level format
    if (customWorld.levels) {
      return {
        ...customWorld,
        objects: customWorld.levels[currentLevel] || []
      };
    }
    
    // Handle legacy single-level format
    return customWorld;
  };

  const currentLevelWorld = getCurrentLevelWorld();

  // Initialize player position based on custom world or default
  const initialPlayerX = currentLevelWorld?.playerSpawn?.x || (GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE) / 2;
  const initialPlayerY = currentLevelWorld?.playerSpawn?.y || (GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE) / 2;
  
  const { gameState, updateGameState } = useGameState(initialPlayerX, initialPlayerY, currentLevelWorld);
  const { canInteract } = useInteractionSystem();

  // Terrain generation function
  const generateTerrain = useCallback((chunkX, chunkY, depthLevel) => {
    return generateTerrainChunk(
      chunkX, 
      chunkY, 
      depthLevel, 
      gameState.worldSeed, 
      forcedSafePositions, 
      stairConnections
    );
  }, [gameState.worldSeed, forcedSafePositions, stairConnections]);

  // Walkable check function
  const checkWalkable = useCallback((x, y, terrain) => {
    return isWalkable(x, y, terrain);
  }, []);

  // Cave entrance interaction check
  const checkCaveEntranceInteraction = useCallback(() => {
    if (!currentLevelWorld?.objects) return;
    
    const playerCenterX = gameState.player.x + GAME_CONFIG.TILE_SIZE / 2;
    const playerCenterY = gameState.player.y + GAME_CONFIG.TILE_SIZE / 2;
    
    currentLevelWorld.objects.forEach(obj => {
      if (obj.assetId === 'cave-entrance' && obj.properties?.hasLevelConnection) {
        const objCenterX = obj.x + obj.width / 2;
        const objCenterY = obj.y + obj.height / 2;
        const distance = Math.sqrt(
          Math.pow(playerCenterX - objCenterX, 2) + 
          Math.pow(playerCenterY - objCenterY, 2)
        );
        
        if (distance < GAME_CONFIG.TILE_SIZE * 1.2) {
          // Player is close to cave entrance, check for level transition
          const targetLevel = obj.properties.targetLevel;
          const targetX = obj.properties.targetX || initialPlayerX;
          const targetY = obj.properties.targetY || initialPlayerY;
          
          if (targetLevel !== undefined && targetLevel !== currentLevel) {
            // Transition to new level
            setCurrentLevel(targetLevel);
            updateGameState(prevState => ({
              ...prevState,
              player: {
                ...prevState.player,
                x: targetX,
                y: targetY
              }
            }));
          }
        }
      }
    });
  }, [gameState.player.x, gameState.player.y, currentLevelWorld, currentLevel, initialPlayerX, initialPlayerY, updateGameState]);

  // Optimized treasure box interaction check using the interaction system
  const checkTreasureBoxInteraction = useCallback(() => {
    gameState.treasureBoxes.forEach(box => {
      if (!box.collected && !box.opened) {
        // Use the interaction system for consistent collision detection
        if (canInteract(
          gameState.player.x, 
          gameState.player.y, 
          box.x, 
          box.y, 
          GAME_CONFIG.TILE_SIZE, 
          GAME_CONFIG.TILE_SIZE
        )) {
          // Player is close to treasure box, show question
          const randomQuestion = numerationProblems[Math.floor(Math.random() * numerationProblems.length)];
          setCurrentQuestion(randomQuestion);
          setCurrentTreasureBox(box);
          setShowQuestionModal(true);
        }
      }
    });
  }, [gameState.player.x, gameState.player.y, gameState.treasureBoxes, canInteract]);

  // Handle question solve
  const handleQuestionSolve = useCallback(() => {
    if (currentTreasureBox) {
      // Mark treasure box as opened (not collected, so it stays visible but opened)
      updateGameState(prevState => ({
        ...prevState,
        treasureBoxes: prevState.treasureBoxes.map(box => 
          box === currentTreasureBox ? { ...box, opened: true } : box
        ),
        score: prevState.score + 100
      }));
    }
  }, [currentTreasureBox, updateGameState]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowQuestionModal(false);
    setCurrentQuestion(null);
    setCurrentTreasureBox(null);
  }, []);

  // Game loop
  useGameLoop(keys, gameState, updateGameState, checkWalkable, generateTerrain, currentLevelWorld);
  
  // Check for interactions
  useEffect(() => {
    if (!showQuestionModal) {
      checkTreasureBoxInteraction();
      checkCaveEntranceInteraction();
    }
  }, [gameState.player.x, gameState.player.y, showQuestionModal, checkTreasureBoxInteraction, checkCaveEntranceInteraction]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GAME_CONFIG.CANVAS_WIDTH;
      canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    }
  }, []);

  return (
    <div className="open-world-game">
      <div className="game-container">
        <canvas 
          ref={canvasRef}
          className="game-canvas"
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
        />
        
        {/* Use the simplified renderer instead of the complex one */}
        <SimpleCanvasRenderer 
          gameState={gameState}
          canvasRef={canvasRef}
          customWorld={currentLevelWorld}
        />
        
        <div className="game-ui">
          <div className="player-stats">
            <div className="health-bar">
              <div className="health-label">Health</div>
              <div className="health-bar-container">
                <div 
                  className="health-bar-fill"
                  style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                />
              </div>
              <div className="health-text">{gameState.player.health}/{gameState.player.maxHealth}</div>
            </div>
            
            <div className="score-display">
              Score: {gameState.score}
            </div>
            
            <div className="position-display">
              Position: ({Math.floor(gameState.player.x)}, {Math.floor(gameState.player.y)})
            </div>
            
            <div className="depth-display">
              Depth Level: {gameState.depthLevel}
            </div>
            
            {customWorld?.levels && (
              <div className="current-level-display">
                Current Level: {currentLevel === 0 ? 'Surface' : `Cave Level ${currentLevel}`}
              </div>
            )}
            
            <div className="performance-info">
              <div style={{ color: '#00FF00', fontSize: '12px', marginTop: '10px' }}>
                ⚡ Optimized Mode: Simple Assets
              </div>
              <div style={{ color: '#00BFFF', fontSize: '11px' }}>
                🎮 Better Performance
              </div>
              <div style={{ color: '#FFD700', fontSize: '11px' }}>
                📦 No External Assets
              </div>
            </div>
          </div>
          
          <div className="controls-info">
            <h3>Controls</h3>
            <p>WASD or Arrow Keys: Move</p>
            <p>Explore the world and find treasures!</p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#90EE90' }}>
              <strong>Optimized Features:</strong>
              <ul style={{ fontSize: '11px', marginTop: '5px' }}>
                <li>✓ Simple geometric shapes</li>
                <li>✓ No image loading delays</li>
                <li>✓ Reduced memory usage</li>
                <li>✓ Faster rendering</li>
                <li>✓ Animated effects</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Treasure Question Modal */}
      <TreasureQuestionModal
        isOpen={showQuestionModal}
        question={currentQuestion}
        onClose={handleModalClose}
        onSolve={handleQuestionSolve}
      />
    </div>
  );
};

export default SimpleOpenWorldGame;