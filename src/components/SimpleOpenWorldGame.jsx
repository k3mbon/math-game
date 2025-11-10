import React, { useRef, useEffect, useState, useCallback } from 'react';
import './OpenWorldGame.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { useGameState } from '../hooks/useGameState';
import { useGameLoop } from '../hooks/useGameLoop.jsx';
import { generateTerrainChunk, isWalkable } from '../utils/terrainGenerator';
import { enhancedBushCollisionSystem } from '../utils/terrainBoundarySystem';
import SimpleCanvasRenderer from './SimpleCanvasRenderer';
import TreasureQuestionModal from './TreasureQuestionModal';
import { ensureProblemsLoaded, selectRandomProblem } from '../utils/problemLoader';
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
  const [playerDirection, setPlayerDirection] = useState('right');
  const [questionsNumeration, setQuestionsNumeration] = useState([]);
  const [questionsLiteration, setQuestionsLiteration] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);

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
  const [bushObstacles, setBushObstacles] = useState([]);
  const { canInteractFacing, canInteractWithCooldown, markInteraction, getClosestInteractable } = useInteractionSystem();

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

  // Walkable check function: always use current game terrain + custom world + obstacles
  const checkWalkable = useCallback((x, y) => {
    return isWalkable(x, y, gameState.terrain, currentLevelWorld, bushObstacles);
  }, [gameState.terrain, currentLevelWorld, bushObstacles]);

  // Bush collision resolver: compute push-back when colliding with a bush
  const bushCollisionResolver = useCallback((px, py) => {
    if (!Array.isArray(bushObstacles) || bushObstacles.length === 0) return null;
    const playerTileX = Math.floor(px / GAME_CONFIG.TILE_SIZE);
    const playerTileY = Math.floor(py / GAME_CONFIG.TILE_SIZE);
    for (const bush of bushObstacles) {
      const assetPath = String(bush.asset || '').toLowerCase();
      const isBushDir = assetPath.includes('/assets/characters/terrain-object/bushes/');
      if (!isBushDir) continue;
      if (Math.abs(bush.x - playerTileX) > 2 || Math.abs(bush.y - playerTileY) > 2) continue;
      const bx = bush.x * GAME_CONFIG.TILE_SIZE;
      const by = bush.y * GAME_CONFIG.TILE_SIZE;
      if (enhancedBushCollisionSystem.checkBushCollision(px, py, bx, by)) {
        return enhancedBushCollisionSystem.getCollisionResponse(px, py, bx, by);
      }
    }
    return null;
  }, [bushObstacles]);

  // Cave entrance interaction check
  const checkCaveEntranceInteraction = useCallback(() => {
    if (!currentLevelWorld?.objects) return;
    
    const playerCenterX = gameState.player.x + GAME_CONFIG.PLAYER_SIZE / 2;
    const playerCenterY = gameState.player.y + GAME_CONFIG.PLAYER_SIZE / 2;
    
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

  // Interaction: attempt to open nearest chest when KeyE/Enter pressed
  const attemptInteractWithNearestChest = useCallback(() => {
    const available = gameState.treasureBoxes.filter(b => !b.collected && !b.opened);
    if (available.length === 0) return;

    // Use center-based coordinates consistently for interaction checks
    const playerCenterX = gameState.player.x;
    const playerCenterY = gameState.player.y;
    const nearest = getClosestInteractable(playerCenterX, playerCenterY, available);
    if (!nearest) return;

    const chestSize = GAME_CONFIG.TREASURE_SIZE || GAME_CONFIG.TILE_SIZE;
    // Pass chest center coordinates; width/height retained for compatibility
    if (canInteractWithCooldown(playerCenterX, playerCenterY, nearest.x, nearest.y, chestSize, chestSize) &&
        canInteractFacing(playerCenterX, playerCenterY, playerDirection, nearest.x, nearest.y, chestSize, chestSize, 0.5)) {
      markInteraction();
      const randomQuestion = selectRandomProblem(
        questionsNumeration,
        questionsLiteration,
        Math.max(1, gameState.depthLevel + 1)
      );
      setCurrentQuestion(randomQuestion || null);
      setCurrentTreasureBox(nearest);
      setShowQuestionModal(true);
    }
  }, [gameState.player.x, gameState.player.y, gameState.treasureBoxes, playerDirection, getClosestInteractable, canInteractWithCooldown, canInteractFacing, markInteraction, questionsNumeration, questionsLiteration, gameState.depthLevel]);

  // Handle question solve
  const handleQuestionSolve = useCallback(() => {
    if (currentTreasureBox) {
      // Mark treasure box as opened and collected so it stops blocking
      updateGameState(prevState => ({
        ...prevState,
        treasureBoxes: prevState.treasureBoxes.map(box => 
          box === currentTreasureBox ? { ...box, opened: true, collected: true } : box
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
  useGameLoop(keys, gameState, updateGameState, checkWalkable, generateTerrain, { bushCollisionResolver });

  // Load and cache Numeration + Literation problem banks
  useEffect(() => {
    let isMounted = true;
    setQuestionsLoading(true);
    setQuestionsError(null);
    ensureProblemsLoaded()
      .then(({ numeration, literation, error }) => {
        if (!isMounted) return;
        setQuestionsNumeration(Array.isArray(numeration) ? numeration : []);
        setQuestionsLiteration(Array.isArray(literation) ? literation : []);
        setQuestionsError(error || null);
        setQuestionsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setQuestionsNumeration([]);
        setQuestionsLiteration([]);
        setQuestionsError(err?.message || String(err));
        setQuestionsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);
  
  // Check for non-chest interactions (e.g., cave entrances) while moving
  useEffect(() => {
    if (!showQuestionModal) {
      checkCaveEntranceInteraction();
    }
  }, [gameState.player.x, gameState.player.y, showQuestionModal, checkCaveEntranceInteraction]);

  // Keyboard event handlers
  useEffect(() => {
  const lastMovementKeyTimeRef = useRef({});
  const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.code]: true }));
      // Record timestamp to enforce last-key-wins for direction
      try { lastMovementKeyTimeRef.current[e.code] = performance.now(); } catch {}
      // Update player direction based on movement keys (last key pressed wins)
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setPlayerDirection('up');
          break;
        case 'KeyS':
        case 'ArrowDown':
          setPlayerDirection('down');
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setPlayerDirection('left');
          break;
        case 'KeyD':
        case 'ArrowRight':
          setPlayerDirection('right');
          break;
        case 'KeyE':
        case 'Enter':
          // Attempt interaction with nearest chest when user presses KeyE/Enter
          if (!showQuestionModal) {
            attemptInteractWithNearestChest();
          }
          break;
      }
    };

    const handleKeyUp = (e) => {
      setKeys(prev => {
        const newKeys = { ...prev, [e.code]: false };
        // Clear timestamp for released key
        try { delete lastMovementKeyTimeRef.current[e.code]; } catch {}
        // If other movement keys remain, select the most recent pressed for direction
        const movementKeys = ['KeyW','ArrowUp','KeyS','ArrowDown','KeyA','ArrowLeft','KeyD','ArrowRight'];
        const stillMoving = movementKeys.some(k => newKeys[k]);
        if (stillMoving) {
          let latestKey = null;
          let latestTs = -Infinity;
          for (const k of movementKeys) {
            if (newKeys[k]) {
              const ts = lastMovementKeyTimeRef.current[k] ?? -Infinity;
              if (ts > latestTs) { latestTs = ts; latestKey = k; }
            }
          }
          if (latestKey) {
            switch(latestKey) {
              case 'KeyW':
              case 'ArrowUp':
                setPlayerDirection('up');
                break;
              case 'KeyS':
              case 'ArrowDown':
                setPlayerDirection('down');
                break;
              case 'KeyA':
              case 'ArrowLeft':
                setPlayerDirection('left');
                break;
              case 'KeyD':
              case 'ArrowRight':
                setPlayerDirection('right');
                break;
            }
          }
        }
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [attemptInteractWithNearestChest, showQuestionModal]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GAME_CONFIG.CANVAS_WIDTH;
      canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    }
  }, []);

  // Generate a small cluster of bush obstacles near spawn (tile units)
  useEffect(() => {
    const spawnTileX = Math.floor(initialPlayerX / GAME_CONFIG.TILE_SIZE);
    const spawnTileY = Math.floor(initialPlayerY / GAME_CONFIG.TILE_SIZE);
    const offsets = [
      { dx: -3, dy: 0 }, { dx: 3, dy: 0 }, { dx: 0, dy: -3 }, { dx: 0, dy: 3 },
      { dx: -2, dy: -2 }, { dx: 2, dy: -2 }, { dx: -2, dy: 2 }, { dx: 2, dy: 2 }
    ];
    const bushes = offsets.map((o, i) => ({
      x: spawnTileX + o.dx,
      y: spawnTileY + o.dy,
      width: GAME_CONFIG.TILE_SIZE,
      height: GAME_CONFIG.TILE_SIZE,
      type: 'bush',
      asset: '/assets/characters/terrain-object/Bushes/2.png',
      id: `spawn_bush_${i}`
    }));
    setBushObstacles(bushes);
  }, [initialPlayerX, initialPlayerY]);

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
          bushObstacles={bushObstacles}
        />
      </div>
      
      {/* Treasure Question Modal */}
      <TreasureQuestionModal
        isOpen={showQuestionModal}
        question={currentQuestion}
        onClose={handleModalClose}
        onSolve={handleQuestionSolve}
        isLoading={questionsLoading}
        error={questionsError}
      />
    </div>
  );
};

export default SimpleOpenWorldGame;